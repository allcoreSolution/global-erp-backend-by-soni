const Payslip = require('../models/Payslip');
const { Employee } = require('../models/Employee');
const { SalaryStructure } = require('../models/SalaryStructure');
const Attendance = require('../models/Attendance');

// Generate Payslip Preview (Live calculation without saving)
const generatePayslipPreview = async (req, res, next) => {
  try {
    const { employeeId, month, year, salaryStructureId } = req.query;
    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Employee ID, Month, and Year are required' });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // 1. Find employee's assigned salary structure
    let salaryStructure = null;
    if (salaryStructureId) {
      salaryStructure = await SalaryStructure.findById(salaryStructureId);
    }
    if (!salaryStructure) {
      // Find salary structure assigned specifically to this employee
      salaryStructure = await SalaryStructure.findOne({ 
        $or: [
          { employee: employee._id },
          { employeeId: employee.employeeId }
        ]
      });
    }
    if (!salaryStructure) {
      // Fallback: match by company & department
      const companyId = req.user?.company || req.user?.companyId;
      salaryStructure = await SalaryStructure.findOne({ 
        ...(companyId ? { company: companyId } : {}),
        department: employee.department
      }) || await SalaryStructure.findOne({
        ...(companyId ? { company: companyId } : {})
      });
    }

    if (!salaryStructure) {
      salaryStructure = {
        workingDays: 30,
        earnings: [
          { component: 'Basic Salary', calculatedValue: 25000 },
          { component: 'HRA', calculatedValue: 10000 },
          { component: 'Special Allowance', calculatedValue: 5000 }
        ],
        deductions: [
          { component: 'PF Employee (12%)', calculatedValue: 3000 },
          { component: 'ESIC Employee (0.75%)', calculatedValue: 300 }
        ]
      };
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    
    // Dynamic total calendar days in that month (handles 28, 29, 30, 31)
    const yNum = Number(year);
    const mNum = monthIndex !== -1 ? monthIndex + 1 : new Date().getMonth() + 1;
    const totalDaysInMonth = new Date(yNum, mNum, 0).getDate();

    let workingDays = totalDaysInMonth;
    let paidDays = totalDaysInMonth;

    if (monthIndex !== -1) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const datePrefix = `${year}-${monthStr}`;
      
      const companyId = req.user?.company || req.user?.companyId;
      const attendances = await Attendance.find({ 
        $or: [
          { employee: employeeId },
          { employeeId: employee.employeeId },
          { employeeName: employee.employeeName }
        ],
        ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
        date: { $regex: `^${datePrefix}` } 
      });

      if (attendances.length > 0) {
        // Calculate Payable Days formula: Present + Late + WeeklyOff + Holiday + Leave + (0.5 * HalfDay)
        let pCount = 0;
        let hdCount = 0;
        let woCount = 0;
        let hCount = 0;
        let lvCount = 0;

        attendances.forEach(a => {
          if (a.status === 'Present') pCount++;
          else if (a.status === 'Late') pCount++;
          else if (a.status === 'Half Day') hdCount++;
          else if (a.status === 'Weekly Off') woCount++;
          else if (a.status === 'Holiday') hCount++;
          else if (a.status === 'On Leave') lvCount++;
        });

        paidDays = pCount + (hdCount * 0.5) + woCount + hCount + lvCount;
        workingDays = totalDaysInMonth;
      }
    }

    const ratio = workingDays > 0 ? (paidDays / workingDays) : 1;
    
    // Process Earnings from structure
    let basicSalary = 0, hra = 0, da = 0, otherAllowances = 0;
    
    (salaryStructure.earnings || []).forEach(earn => {
        const val = Math.round(earn.calculatedValue * ratio);
        const comp = earn.component.toLowerCase();
        if (comp.includes('basic')) basicSalary += val;
        else if (comp.includes('hra')) hra += val;
        else if (comp.includes('da')) da += val;
        else otherAllowances += val;
    });

    const grossEarnings = basicSalary + hra + da + otherAllowances;
    
    // Process Deductions
    let pfDeduction = 0, esiDeduction = 0, loanDeduction = 0;
    
    (salaryStructure.deductions || []).forEach(ded => {
        const val = Math.round(ded.calculatedValue * ratio); // Or no ratio for deductions? Standard is no ratio or full ratio depending on company. Let's use ratio for simplicity
        const comp = ded.component.toLowerCase();
        if (comp.includes('pf') || comp.includes('provident')) pfDeduction += val;
        else if (comp.includes('esi')) esiDeduction += val;
        else loanDeduction += val;
    });
    
    const totalDeductions = pfDeduction + esiDeduction + loanDeduction;
    const netPay = grossEarnings - totalDeductions;

    const previewData = {
      employee: {
        id: employee._id,
        name: employee.employeeName || employee.username || '-',
        email: employee.email || '-',
        department: employee.department || '-',
        designation: employee.designation || '-'
      },
      month,
      year,
      workingDays,
      paidDays,
      earnings: {
        basicSalary,
        hra,
        da,
        otherAllowances
      },
      deductions: {
        pfDeduction,
        esiDeduction,
        loanDeduction
      },
      totals: {
        grossEarnings,
        totalDeductions,
        netPay
      }
    };

    res.json({ success: true, data: previewData });
  } catch (error) {
    next(error);
  }
};

const generateMonthlyBulkPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    const companyId = req.user?.company || req.user?.companyId;
    const companyFilter = companyId ? { $or: [{ company: companyId }, { company: null }] } : {};

    // 1. Fetch all active employees for this company
    const activeEmployees = await Employee.find({ ...companyFilter, status: { $ne: 'Inactive' } });
    if (activeEmployees.length === 0) {
      return res.status(400).json({ success: false, message: 'No active employees found in this company' });
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    const yNum = Number(year);
    const mNum = monthIndex !== -1 ? monthIndex + 1 : new Date().getMonth() + 1;
    const totalDaysInMonth = new Date(yNum, mNum, 0).getDate();
    const monthStr = String(mNum).padStart(2, '0');
    const datePrefix = `${year}-${monthStr}`;

    // 2. Fetch all salary structures in company
    const allStructures = await SalaryStructure.find(companyFilter);

    // 3. Fetch all attendance records for this month
    const allAttendances = await Attendance.find({
      ...companyFilter,
      date: { $regex: `^${datePrefix}` }
    });

    const generatedSlips = [];

    for (const emp of activeEmployees) {
      // Find salary structure assigned specifically to this employee or fallback to department
      let struct = allStructures.find(s => 
        (s.employee && String(s.employee) === String(emp._id)) ||
        (s.employeeId && s.employeeId.trim() === (emp.employeeId || '').trim())
      );

      if (!struct) {
        struct = allStructures.find(s => 
          s.department && s.department.trim().toLowerCase() === (emp.department || '').trim().toLowerCase()
        ) || allStructures[0];
      }

      // Default earnings & deductions fallback if no structure found
      let basicSalaryFixed = 25000;
      let hraFixed = 10000;
      let daFixed = 0;
      let otherAllowancesFixed = 5000;
      let pfFixed = 3000;
      let esiFixed = 300;
      let loanFixed = 0;

      if (struct) {
        basicSalaryFixed = 0;
        hraFixed = 0;
        daFixed = 0;
        otherAllowancesFixed = 0;
        pfFixed = 0;
        esiFixed = 0;

        (struct.earnings || []).forEach(earn => {
          const val = Number(earn.calculatedValue || earn.amount) || 0;
          const comp = (earn.component || '').toLowerCase();
          if (comp.includes('basic')) basicSalaryFixed += val;
          else if (comp.includes('hra')) hraFixed += val;
          else if (comp.includes('da')) daFixed += val;
          else otherAllowancesFixed += val;
        });

        (struct.deductions || []).forEach(ded => {
          const val = Number(ded.calculatedValue || ded.amount) || 0;
          const comp = (ded.component || '').toLowerCase();
          if (comp.includes('pf')) pfFixed += val;
          else if (comp.includes('esi')) esiFixed += val;
          else loanFixed += val;
        });
      }

      // Calculate attendance payable days for this employee
      const empAttendances = allAttendances.filter(a => 
        (a.employee && String(a.employee) === String(emp._id)) ||
        (a.employeeId && a.employeeId.trim() === (emp.employeeId || '').trim()) ||
        (a.employeeName && a.employeeName.trim().toLowerCase() === (emp.employeeName || '').trim().toLowerCase())
      );

      let pCount = 0, hdCount = 0, woCount = 0, hCount = 0, lvCount = 0;
      empAttendances.forEach(a => {
        if (a.status === 'Present' || a.status === 'Late') pCount++;
        else if (a.status === 'Half Day') hdCount++;
        else if (a.status === 'Weekly Off') woCount++;
        else if (a.status === 'Holiday') hCount++;
        else if (a.status === 'On Leave') lvCount++;
      });

      // If records exist, calculate paid days. If not yet marked, default to total month days
      const paidDays = empAttendances.length > 0
        ? (pCount + (hdCount * 0.5) + woCount + hCount + lvCount)
        : totalDaysInMonth;

      const workingDays = totalDaysInMonth;
      const ratio = workingDays > 0 ? (paidDays / workingDays) : 1;

      // Pro-rated amounts based on Attendance Payable Days
      const basicSalary = Math.round(basicSalaryFixed * ratio);
      const hra = Math.round(hraFixed * ratio);
      const da = Math.round(daFixed * ratio);
      const otherAllowances = Math.round(otherAllowancesFixed * ratio);
      const grossEarnings = basicSalary + hra + da + otherAllowances;

      const pfDeduction = Math.round(pfFixed * ratio);
      const esiDeduction = Math.round(esiFixed * ratio);
      const loanDeduction = Math.round(loanFixed * ratio);
      const totalDeductions = pfDeduction + esiDeduction + loanDeduction;
      const netPay = Math.round(grossEarnings - totalDeductions);

      // Create or update payslip in database (Upsert)
      const payslipDoc = await Payslip.findOneAndUpdate(
        {
          employee: emp._id,
          month,
          year,
          ...(companyId ? { company: companyId } : {})
        },
        {
          employee: emp._id,
          month,
          year,
          workingDays,
          paidDays: Number(paidDays.toFixed(1)),
          basicSalary,
          hra,
          da,
          otherAllowances,
          pfDeduction,
          esiDeduction,
          loanDeduction,
          grossEarnings,
          totalDeductions,
          netPay,
          status: 'Draft',
          ...(companyId ? { company: companyId } : {})
        },
        { upsert: true, new: true }
      ).populate('employee', 'employeeName employeeId department designation');

      generatedSlips.push(payslipDoc);
    }

    res.json({
      success: true,
      message: `Generated monthly payroll for ${generatedSlips.length} employees successfully!`,
      data: generatedSlips
    });
  } catch (error) {
    next(error);
  }
};

const updatePayslipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Draft' | 'Completed' | 'Paid'
    const payslip = await Payslip.findByIdAndUpdate(id, { status }, { new: true })
      .populate('employee', 'employeeName employeeId department designation');
    if (!payslip) return res.status(404).json({ success: false, message: 'Payslip not found' });
    res.json({ success: true, message: `Status updated to ${status}`, data: payslip });
  } catch (error) {
    next(error);
  }
};

const completeAllPayslips = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const companyId = req.user?.company || req.user?.companyId;
    const filter = {
      ...(month ? { month } : {}),
      ...(year ? { year } : {}),
      ...(companyId ? { company: companyId } : {})
    };

    await Payslip.updateMany(filter, { status: 'Completed' });
    res.json({ success: true, message: 'All payslips for this period marked as Completed!' });
  } catch (error) {
    next(error);
  }
};

const updatePayslip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (updateData.basicSalary !== undefined || updateData.hra !== undefined || updateData.da !== undefined || updateData.otherAllowances !== undefined) {
      updateData.grossEarnings = (Number(updateData.basicSalary) || 0) + (Number(updateData.hra) || 0) + (Number(updateData.da) || 0) + (Number(updateData.otherAllowances) || 0);
    }
    if (updateData.pfDeduction !== undefined || updateData.esiDeduction !== undefined || updateData.loanDeduction !== undefined || updateData.advanceDeduction !== undefined || updateData.otherDeduction !== undefined) {
      updateData.totalDeductions = (Number(updateData.pfDeduction) || 0) + (Number(updateData.esiDeduction) || 0) + (Number(updateData.loanDeduction) || 0) + (Number(updateData.advanceDeduction) || 0) + (Number(updateData.otherDeduction) || 0);
    }
    if (updateData.grossEarnings !== undefined && updateData.totalDeductions !== undefined) {
      updateData.netPay = updateData.grossEarnings - updateData.totalDeductions;
    }

    const payslip = await Payslip.findByIdAndUpdate(id, updateData, { new: true })
      .populate('employee', 'username employeeName employeeId email department designation');
    if (!payslip) return res.status(404).json({ success: false, message: 'Payslip not found' });
    res.json({ success: true, message: 'Payslip updated successfully', data: payslip });
  } catch (error) {
    next(error);
  }
};

const createPayslip = async (req, res, next) => {
  try {
    const companyId = req.user?.company || req.user?.companyId;
    const payload = { ...req.body, ...(companyId ? { company: companyId } : {}) };
    
    const gross = (Number(payload.basicSalary) || 0) + (Number(payload.hra) || 0) + (Number(payload.da) || 0) + (Number(payload.otherAllowances) || 0);
    const deductions = (Number(payload.pfDeduction) || 0) + (Number(payload.esiDeduction) || 0) + (Number(payload.loanDeduction) || 0) + (Number(payload.advanceDeduction) || 0) + (Number(payload.otherDeduction) || 0);
    payload.grossEarnings = payload.grossEarnings !== undefined ? payload.grossEarnings : gross;
    payload.totalDeductions = payload.totalDeductions !== undefined ? payload.totalDeductions : deductions;
    payload.netPay = payload.netPay !== undefined ? payload.netPay : (payload.grossEarnings - payload.totalDeductions);

    const payslip = await Payslip.create(payload);
    res.status(201).json({ success: true, data: payslip });
  } catch (error) {
    next(error);
  }
};

const getPayslips = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user?.company || req.user?.companyId;
    const filter = {
      ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
      ...(month && month !== 'All' ? { month } : {}),
      ...(year && year !== 'All' ? { year } : {})
    };

    const payslips = await Payslip.find(filter)
      .populate('employee', 'username employeeName employeeId email department designation')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payslips });
  } catch (error) {
    next(error);
  }
};

const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee', 'username employeeName employeeId email department designation');
    if (!payslip) {
      res.status(404);
      return next(new Error('Payslip not found'));
    }
    res.json({ success: true, data: payslip });
  } catch (error) {
    next(error);
  }
};

const deletePayslip = async (req, res, next) => {
  try {
    const payslip = await Payslip.findByIdAndDelete(req.params.id);
    if (!payslip) {
      res.status(404);
      return next(new Error('Payslip not found'));
    }
    res.json({ success: true, message: 'Payslip deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generatePayslipPreview,
  generateMonthlyBulkPayroll,
  updatePayslipStatus,
  updatePayslip,
  completeAllPayslips,
  createPayslip,
  getPayslips,
  getPayslipById,
  deletePayslip
};

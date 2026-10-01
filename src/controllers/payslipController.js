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

    let structureId = salaryStructureId || employee.salaryStructure?._id;
    let salaryStructure;
    if (structureId) {
      salaryStructure = await SalaryStructure.findById(structureId);
    } else {
      salaryStructure = await SalaryStructure.findOne({ company: req.user?.companyId });
    }

    if (!salaryStructure) {
      // Fallback to employee's own salary data if no structure is defined
      salaryStructure = {
        workingDays: 30,
        earnings: [
          { component: 'Basic', calculatedValue: employee.basicSalary || 0 },
          { component: 'HRA', calculatedValue: employee.hra || 0 },
          { component: 'Other Allowances', calculatedValue: employee.allowance || 0 }
        ],
        deductions: []
      };
    }

    let workingDays = Number(salaryStructure.workingDays) || 30;
    let paidDays = workingDays;

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex !== -1) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const datePrefix = `${year}-${monthStr}`;
      
      const attendances = await Attendance.find({ 
        employee: employeeId, 
        company: req.user?.companyId,
        date: { $regex: `^${datePrefix}` } 
      });

      if (attendances.length > 0) {
        workingDays = attendances.length;
        paidDays = attendances.filter(a => a.status === 'Present' || a.status === 'Late').length;
      }
    }

    const ratio = workingDays > 0 ? paidDays / workingDays : 1;
    
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

const createPayslip = async (req, res, next) => {
  try {
    const payslip = await Payslip.create({ ...req.body, company: req.user?.companyId });
    res.status(201).json({ success: true, data: payslip });
  } catch (error) {
    next(error);
  }
};

const getPayslips = async (req, res, next) => {
  try {
    const payslips = await Payslip.find({ company: req.user?.companyId })
      .populate('employee', 'username employeeName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payslips });
  } catch (error) {
    next(error);
  }
};

const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employee', 'username employeeName email');
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
  createPayslip,
  getPayslips,
  getPayslipById,
  deletePayslip
};

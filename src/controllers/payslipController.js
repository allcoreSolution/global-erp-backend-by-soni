const Payslip = require('../models/Payslip');
const User = require('../models/User');
const SalaryStructure = require('../models/SalaryStructure');
const Attendance = require('../models/Attendance');

// Generate Payslip Preview (Live calculation without saving)
const generatePayslipPreview = async (req, res, next) => {
  try {
    const { employeeId, month, year, salaryStructureId } = req.query;
    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Employee ID, Month, and Year are required' });
    }

    const employee = await User.findById(employeeId).populate('department designation salaryStructure');
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

    // Use passed salary structure or the one assigned to employee, else get the first one (fallback)
    let structureId = salaryStructureId || employee.salaryStructure?._id;
    let salaryStructure;
    if (structureId) {
      salaryStructure = await SalaryStructure.findById(structureId);
    } else {
      salaryStructure = await SalaryStructure.findOne({ company: req.user?.companyId });
    }

    if (!salaryStructure) {
      return res.status(404).json({ success: false, message: 'No Salary Structure found for this employee' });
    }

    // Calculate Working Days & Paid Days from Attendance
    // For simplicity in this preview, we assume standard 30 working days if attendance records are missing
    let workingDays = 30;
    let paidDays = 30;

    // Convert month name to number (e.g. January -> 01)
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthIndex = monthNames.indexOf(month);
    
    if (monthIndex !== -1) {
      const monthStr = String(monthIndex + 1).padStart(2, '0');
      const datePrefix = `${year}-${monthStr}`; // matches "YYYY-MM-DD" partially
      
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

    // Prorate salary based on Paid Days / Working Days
    const ratio = paidDays / workingDays;
    
    const basicSalary = Math.round(salaryStructure.basicSalary * ratio);
    const hra = Math.round(salaryStructure.hra * ratio);
    const da = Math.round(salaryStructure.da * ratio);
    const otherAllowances = Math.round(salaryStructure.otherAllowances * ratio);
    
    const grossEarnings = basicSalary + hra + da + otherAllowances;
    
    // Deductions usually don't prorate, or you can prorate them. Let's keep fixed for now.
    const pfDeduction = salaryStructure.pfDeduction;
    const esiDeduction = salaryStructure.esiDeduction;
    const loanDeduction = 0; // Can fetch from Loan model later
    
    const totalDeductions = pfDeduction + esiDeduction + loanDeduction;
    const netPay = grossEarnings - totalDeductions;

    const previewData = {
      employee: {
        id: employee._id,
        name: employee.username,
        email: employee.email,
        department: employee.department?.name || '-',
        designation: employee.designation?.title || '-'
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
      .populate('employee', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payslips });
  } catch (error) {
    next(error);
  }
};

const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employee', 'username email');
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

const Payslip = require('../models/Payslip');
const User = require('../models/User');

const getPfEsiReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    const companyId = req.user?.company || req.user?.companyId;
    const filter = {
      ...(companyId ? { $or: [{ company: companyId }, { company: null }] } : {}),
      ...(month && month !== 'All' ? { month } : {}),
      ...(year && year !== 'All' ? { year } : {})
    };

    // Find all payslips for the given month/year
    const payslips = await Payslip.find(filter)
      .populate('employee', 'employeeName employeeId username email uan pfNo esicNo department branch role');

    let totalPf = 0;
    let totalEsi = 0;
    let totalGross = 0;
    let enrolledEmployees = payslips.length;

    const records = payslips.map(payslip => {
      const emp = payslip.employee || {};
      const basic = payslip.basicSalary || 0;
      const gross = payslip.grossEarnings || basic;
      
      // PF: Employee Share (12% of basic or payslip.pfDeduction)
      const eePf = payslip.pfDeduction || Math.round(basic * 0.12);
      // Employer PF Share (typically matches 12% or EPS 8.33% + EPF 3.67%)
      const erPf = eePf;

      // ESI: Employee Share (0.75% of gross or payslip.esiDeduction)
      const eeEsi = payslip.esiDeduction || (gross <= 21000 ? Math.round(gross * 0.0075) : 0);
      // Employer ESI Share (3.25% of gross)
      const erEsi = eeEsi > 0 ? Math.round(gross * 0.0325) : 0;

      totalPf += (eePf + erPf);
      totalEsi += (eeEsi + erEsi);
      totalGross += gross;

      return {
        id: emp.employeeId || emp._id?.toString()?.substring(0, 8) || 'EMP',
        name: emp.employeeName || emp.username || 'Employee',
        department: emp.department || 'General',
        role: emp.role || 'Staff',
        basic,
        gross,
        netPay: payslip.netPay || 0,
        paidDays: payslip.paidDays || 0,
        uan: emp.uan || 'N/A',
        pfNo: emp.pfNo || 'N/A',
        ipNo: emp.esicNo || 'N/A',
        eePf,
        erPf,
        eeEsi,
        erEsi,
        status: payslip.status || 'Draft'
      };
    });

    const stats = {
      enrolledEmployees,
      totalPf,
      totalEsi,
      totalGross,
      pfEnrolled: records.filter(r => r.eePf > 0).length,
      esiEnrolled: records.filter(r => r.eeEsi > 0).length
    };

    res.json({ success: true, stats, records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPfEsiReport
};

const Payslip = require('../models/Payslip');
const User = require('../models/User');

const getPfEsiReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and Year are required' });
    }

    // Find all payslips for the given month/year
    const payslips = await Payslip.find({ 
      month, 
      year, 
      company: req.user?.companyId 
    }).populate('employee', 'username email uanNumber esiIpNumber');

    let totalPf = 0;
    let totalEsi = 0;
    let enrolledEmployees = payslips.length;

    const records = payslips.map(payslip => {
      const emp = payslip.employee;
      const basic = payslip.basicSalary || 0;
      
      // PF Calculation (Typically 12% of basic)
      const eePf = Math.round(basic * 0.12);
      const erPf = Math.round(basic * 0.12);
      
      // ESI Calculation (EE: 0.75%, ER: 3.25% of gross earnings)
      // The frontend seems to use gross or basic. We'll use grossEarnings.
      const gross = payslip.grossEarnings || basic;
      const eeEsi = Math.round(gross * 0.0075);
      const erEsi = Math.round(gross * 0.0325);

      totalPf += (eePf + erPf);
      totalEsi += (eeEsi + erEsi);

      return {
        id: emp._id,
        name: emp.username,
        basic: basic,
        gross: gross,
        uan: emp.uanNumber || 'N/A',
        ipNo: emp.esiIpNumber || 'N/A',
        eePf,
        erPf,
        eeEsi,
        erEsi
      };
    });

    const stats = {
      enrolledEmployees,
      totalPf,
      totalEsi
    };

    res.json({ success: true, stats, records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPfEsiReport
};

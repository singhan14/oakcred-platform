/**
 * PMT – calculates the payment for a loan based on constant payments
 * and a constant interest rate.
 * @param {number} rate - monthly interest rate (annual / 12)
 * @param {number} nper - total number of payments (tenure in months)
 * @param {number} pv   - principal / present value (loan amount)
 * @returns {number} monthly EMI (positive value)
 */
function pmt(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  const x = Math.pow(1 + rate, nper);
  return Math.abs((pv * rate * x) / (x - 1));
}

module.exports = { pmt };

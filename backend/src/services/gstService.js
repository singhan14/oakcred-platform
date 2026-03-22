const config = require('../config');

/**
 * GST data service — fetches from GSTN API or generates synthetic data in mock mode.
 */

function generateSyntheticGSTData(gstin, months = 24) {
  const records = [];
  const now = new Date();
  const baseTurnover = 500000 + Math.random() * 2000000; // 5L to 25L per month

  for (let i = 0; i < months; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Add some realism: seasonal variation, occasional late filings
    const seasonalMultiplier = 1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
    const turnover = Math.round(baseTurnover * seasonalMultiplier * (0.85 + Math.random() * 0.3));
    const itcEligible = Math.round(turnover * 0.18 * (0.6 + Math.random() * 0.3));
    const itcVariance = Math.random() < 0.85 ? 0.02 + Math.random() * 0.08 : 0.15 + Math.random() * 0.1;
    const itcClaimed = Math.round(itcEligible * (1 + (Math.random() > 0.5 ? 1 : -1) * itcVariance));
    const taxLiability = Math.round(turnover * 0.18 - itcClaimed);

    // 80% filed on time, 10% late, 10% not filed (mostly older months)
    const filingRand = Math.random();
    let filingStatus = 'FILED';
    let filedOn = new Date(date.getFullYear(), date.getMonth() + 1, 10 + Math.floor(Math.random() * 10));

    if (filingRand > 0.9 && i > 6) {
      filingStatus = 'NOT_FILED';
      filedOn = null;
    } else if (filingRand > 0.8) {
      filingStatus = 'LATE_FILED';
      filedOn = new Date(date.getFullYear(), date.getMonth() + 2, Math.floor(Math.random() * 28) + 1);
    }

    records.push({
      gstin,
      period,
      returnType: 'GSTR3B',
      filingStatus,
      filedOn,
      dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 20),
      turnover,
      itcClaimed,
      itcEligible,
      taxLiability: Math.max(0, taxLiability),
      source: 'API',
    });
  }

  return records;
}

async function fetchGSTData(gstin) {
  if (config.gstn.apiKey === 'mock') {
    console.log(`[MOCK GSTN] Generating synthetic data for GSTIN: ${gstin}`);
    return generateSyntheticGSTData(gstin);
  }

  // Real GSTN API call would go here
  throw new Error('Real GSTN API integration not yet implemented. Set GSTN_API_KEY=mock for development.');
}

module.exports = { fetchGSTData, generateSyntheticGSTData };

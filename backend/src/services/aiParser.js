const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

// ─── VALIDATION HELPERS ─────────────────────────────────────────

/** Clamp a numeric value to a sane range; return fallback if invalid */
function safeNumber(val, min = 0, max = 1e12, fallback = 0) {
  const n = Number(val);
  if (!isFinite(n) || n < min || n > max) return fallback;
  return n;
}

/** Validate assessment year format like "2023-24" */
function isValidAssessmentYear(ay) {
  return typeof ay === 'string' && /^\d{4}-\d{2}$/.test(ay);
}

/** Validate period format like "2023-04" */
function isValidPeriod(p) {
  return typeof p === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(p);
}

/** Validate GSTIN format (15 chars, alphanumeric) */
function isValidGSTIN(g) {
  return typeof g === 'string' && /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d]$/.test(g);
}

// ─── ITR EXTRACTION ─────────────────────────────────────────────

/**
 * Extracts ITR metrics using Gemini 2.5 Flash.
 * Now extracts taxableIncome and refundAmount in addition to core fields.
 */
async function extractITR(text, defaultPan = 'UNKNOWN') {
  if (!config.gemini.apiKey || config.gemini.apiKey === 'mock') {
    throw new Error('Gemini API key is required to parse documents natively.');
  }

  const prompt = `
    You are an elite Indian Financial Data Extractor. 
    Below is the raw text from an Indian Income Tax Return (ITR-V or ITR computation).
    Extract the following standard metrics and output strict JSON only (no markdown, no blocks).
    
    Required JSON Schema:
    {
      "assessmentYear": "2023-24", // string, e.g., 2023-24
      "grossIncome": 1500000, // number, total gross income (not taxable income) before deductions
      "taxableIncome": 1200000, // number, total taxable income after deductions (Chapter VI-A etc.)
      "taxPaid": 300000, // number, total tax paid or payable (including cess)
      "refundAmount": 0, // number, refund claimed (0 if none)
      "pan": "ABCDE1234F" // string, exactly 10 characters matching Indian PAN regex. Be precise.
    }

    Rules:
    - grossIncome: Look for "Gross Total Income" or "Total Income before deductions"
    - taxableIncome: Look for "Total Taxable Income" or "Net Taxable Income" after deductions
    - taxPaid: Look for "Total Tax and Cess", "Tax Payable", or "Total Taxes Paid"
    - refundAmount: Look for "Refund" — return 0 if not found
    - If a value is genuinely not found, return 0 for numbers

    [Raw Text Begins]
    ${text}
    [Raw Text Ends]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text);

    // Validate extracted values
    const assessmentYear = isValidAssessmentYear(parsed.assessmentYear)
      ? parsed.assessmentYear
      : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(2)}`;

    const grossIncome = safeNumber(parsed.grossIncome, 0, 1e11); // max ₹1000 crore
    const taxableIncome = safeNumber(parsed.taxableIncome, 0, grossIncome || 1e11);
    const taxPaid = safeNumber(parsed.taxPaid, 0, grossIncome || 1e11);
    const refundAmount = safeNumber(parsed.refundAmount, 0, taxPaid || 1e11);

    // Sanity check: tax paid shouldn't exceed gross income
    if (taxPaid > grossIncome && grossIncome > 0) {
      console.warn(`[AI PARSER] Suspicious ITR: taxPaid (${taxPaid}) > grossIncome (${grossIncome})`);
    }

    return {
      assessmentYear,
      grossIncome,
      taxableIncome: taxableIncome || null,
      taxPaid,
      refundAmount,
      pan: parsed.pan && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(parsed.pan) ? parsed.pan : defaultPan,
    };
  } catch (error) {
    console.error('[AI PARSER] Gemini ITR extraction failed:', error.message);
    throw new Error('Failed to extract data via True AI.');
  }
}

// ─── BANK STATEMENT EXTRACTION ──────────────────────────────────

/**
 * Extracts comprehensive Bank Statement metrics using Gemini 2.5 Flash.
 * Now includes monthly breakdowns and transaction count for real feature engineering.
 */
async function extractBankMetrics(text) {
  if (!config.gemini.apiKey || config.gemini.apiKey === 'mock') {
    throw new Error('Gemini API key is required to parse documents natively.');
  }

  const prompt = `
    You are an elite Indian Financial Data Extractor mimicking a core banking Account Aggregator system.
    Below is the raw OCR text from a Bank Statement (typically 1 to 6 months).
    Extract standard underwriting metrics and output strict JSON only (no markdown).

    Rules:
    - Bounces: Count exact occurrences of "bounce", "dishonour", "return", "insufficient funds". Use precise judgement.
    - EMI: Debits matching "loan", "emi", or recurring exact round amounts.
    - Salary: Look for "salary", "sal" strings in deposits.
    - Monthly Breakdowns: Group transactions by calendar month (YYYY-MM) and compute per-month totals.
    - Transaction Count: Count the total number of individual transaction lines you can identify.

    Required JSON Schema:
    {
      "avgMonthlyBalance": 45000,
      "avgMonthlyInflow": 550000,
      "avgMonthlyOutflow": 490000,
      "bounceCount": 0,
      "salaryDetected": true,
      "estimatedSalary": 105000,
      "totalEMIBurden": 25000,
      "inflowConsistencyScore": 85,
      "rawTransactionCount": 156,
      "detectedEMIs": [{"amount": 15000, "frequency": "MONTHLY", "count": 3}],
      "monthlyBalances": [42000, 48000, 45000, 39000, 51000, 47000],
      "monthlyInflows": [520000, 580000, 540000, 560000, 600000, 530000],
      "inflowConcentrationHHI": 0.35
    }

    Notes on new fields:
    - monthlyBalances: Array of end-of-month or average balance per month, ordered chronologically.
    - monthlyInflows: Array of total inflows per month, ordered chronologically.
    - inflowConcentrationHHI: Herfindahl-Hirschman Index (0-1). Calculate by identifying the top sources of inflows, computing each source's share of total, squaring them, and summing. 0.25 = diversified, 0.6+ = concentrated on few sources.
    - rawTransactionCount: Total number of individual transaction lines detected in the statement.
    - If you cannot determine monthly breakdowns, use your best estimate based on the averages.

    [Raw Text Begins]
    ${text.slice(0, 30000)}
    [Raw Text Ends]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text);

    // Validate all numeric fields
    const avgMonthlyBalance = safeNumber(parsed.avgMonthlyBalance, 0, 1e10);
    const avgMonthlyInflow = safeNumber(parsed.avgMonthlyInflow, 0, 1e10);
    const avgMonthlyOutflow = safeNumber(parsed.avgMonthlyOutflow, 0, 1e10);
    const bounceCount = safeNumber(parsed.bounceCount, 0, 500, 0);
    const totalEMIBurden = safeNumber(parsed.totalEMIBurden, 0, avgMonthlyInflow || 1e10);
    const inflowConsistencyScore = safeNumber(parsed.inflowConsistencyScore, 0, 100, 50);
    const rawTransactionCount = safeNumber(parsed.rawTransactionCount, 0, 50000, 0);

    // Validate monthly arrays
    const monthlyBalances = Array.isArray(parsed.monthlyBalances) && parsed.monthlyBalances.length > 0
      ? parsed.monthlyBalances.map(v => safeNumber(v, 0, 1e10))
      : null;

    const monthlyInflows = Array.isArray(parsed.monthlyInflows) && parsed.monthlyInflows.length > 0
      ? parsed.monthlyInflows.map(v => safeNumber(v, 0, 1e10))
      : null;

    const inflowConcentrationHHI = safeNumber(parsed.inflowConcentrationHHI, 0, 1, 0.25);

    // Sanity checks
    if (avgMonthlyOutflow > avgMonthlyInflow * 2) {
      console.warn(`[AI PARSER] Suspicious bank data: outflow (${avgMonthlyOutflow}) >> inflow (${avgMonthlyInflow})`);
    }

    return {
      avgMonthlyBalance,
      avgMonthlyInflow,
      avgMonthlyOutflow,
      bounceCount,
      salaryDetected: Boolean(parsed.salaryDetected),
      estimatedSalary: parsed.estimatedSalary ? safeNumber(parsed.estimatedSalary, 0, 1e8) : null,
      totalEMIBurden,
      inflowConsistencyScore,
      detectedEMIs: Array.isArray(parsed.detectedEMIs) ? parsed.detectedEMIs : [],
      rawTransactionCount,
      // New fields for real feature engineering
      monthlyBalances,
      monthlyInflows,
      inflowConcentrationHHI,
    };
  } catch (error) {
    console.error('[AI PARSER] Gemini Bank Statement extraction failed:', error.message);
    throw new Error('Failed to extract bank data via True AI.');
  }
}

// ─── GST EXTRACTION ─────────────────────────────────────────────

/**
 * Extracts GST metrics from a GSTR-3B PDF return using Gemini 2.5 Flash.
 */
async function extractGST(text, defaultGstin = 'UNKNOWN') {
  if (!config.gemini.apiKey || config.gemini.apiKey === 'mock') {
    throw new Error('Gemini API key is required to parse documents natively.');
  }

  const prompt = `
    You are an elite Indian Financial Data Extractor mimicking a core Account Aggregator / GST Suvidha Provider.
    Below is the raw text from an Indian GSTR-3B return PDF.
    Extract the following standard filing metrics and output strict JSON only (no markdown).

    Rules:
    - Turnover: Usually labelled as "Outward Taxable Supplies" (Total Taxable Value). Look for row 3.1.
    - ITC Eligible: "All other ITC" or Total ITC Available. Row 4.A.
    - ITC Claimed: ITC utilized or claimed.
    - Tax Liability: Tax paid in cash / credit, total tax payable.
    - Period: E.g., "April 2023", convert to "2023-04" format. Return current month "yyyy-mm" if totally missing.
    - Status: Default to "FILED".

    Required JSON Schema:
    {
      "gstin": "22AAAAA0000A1Z5", // string
      "period": "2023-04", // string (YYYY-MM format)
      "turnover": 450000,  // number (Outward Taxable Value)
      "itcEligible": 81000, // number
      "itcClaimed": 80000, // number 
      "taxLiability": 81000 // number
    }

    [Raw Text Begins]
    ${text.slice(0, 30000)}
    [Raw Text Ends]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text);

    // Validate period format
    const period = isValidPeriod(parsed.period)
      ? parsed.period
      : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // Validate numeric fields
    const turnover = safeNumber(parsed.turnover, 0, 1e11);
    const itcEligible = safeNumber(parsed.itcEligible, 0, turnover * 0.5 || 1e11);
    const itcClaimed = safeNumber(parsed.itcClaimed, 0, turnover * 0.5 || 1e11);
    const taxLiability = safeNumber(parsed.taxLiability, 0, turnover || 1e11);

    // Sanity: ITC claimed shouldn't be 10x eligible
    if (itcClaimed > itcEligible * 2 && itcEligible > 0) {
      console.warn(`[AI PARSER] Suspicious GST: itcClaimed (${itcClaimed}) >> itcEligible (${itcEligible})`);
    }

    return {
      gstin: isValidGSTIN(parsed.gstin) ? parsed.gstin : defaultGstin,
      period,
      turnover,
      itcEligible,
      itcClaimed,
      taxLiability,
      filingStatus: 'FILED'
    };
  } catch (error) {
    console.error('[AI PARSER] Gemini GST extraction failed:', error.message);
    throw new Error('Failed to extract GST data via True AI.');
  }
}

module.exports = {
  extractITR,
  extractBankMetrics,
  extractGST,
};

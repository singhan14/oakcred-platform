const { GoogleGenAI } = require('@google/genai');
const config = require('../config');

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

/**
 * Extracts exact ITR metrics using Gemini 1.5 Flash.
 *
 * @param {string} text Raw text extracted from the PDF
 * @returns {object} Struct containing grossIncome, taxPaid, assessmentYear, pan
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
      "taxPaid": 300000, // number, total tax paid or payable
      "pan": "ABCDE1234F" // string, exactly 10 characters matching Indian PAN regex. Be precise.
    }

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

    return {
      assessmentYear: parsed.assessmentYear || `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(2)}`,
      grossIncome: Number(parsed.grossIncome) || 0,
      taxPaid: Number(parsed.taxPaid) || 0,
      pan: parsed.pan || defaultPan,
    };
  } catch (error) {
    console.error('[AI PARSER] Gemini ITR extraction failed:', error.message);
    throw new Error('Failed to extract data via True AI.');
  }
}

/**
 * Extracts comprehensive Bank Statement metrics using Gemini 1.5 Flash.
 *
 * @param {string} text Raw text extracted from the PDF statement
 * @returns {object} Struct matching bank metrics schema
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

    Required JSON Schema:
    {
      "avgMonthlyBalance": 45000, // number
      "avgMonthlyInflow": 550000, // number
      "avgMonthlyOutflow": 490000, // number
      "bounceCount": 0, // number (count of inward return/bounces)
      "salaryDetected": true, // boolean
      "estimatedSalary": 105000, // number or null
      "totalEMIBurden": 25000, // number
      "inflowConsistencyScore": 85, // number (0-100 indicating regularity of inflows)
      "detectedEMIs": [{"amount": 15000, "frequency": "MONTHLY", "count": 3}] // Array of EMI objects
    }

    [Raw Text Begins]
    ${text.slice(0, 30000)} // truncate to avoid excessive token length if file is 100+ pages
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

    return {
      avgMonthlyBalance: Number(parsed.avgMonthlyBalance) || 0,
      avgMonthlyInflow: Number(parsed.avgMonthlyInflow) || 0,
      avgMonthlyOutflow: Number(parsed.avgMonthlyOutflow) || 0,
      bounceCount: Number(parsed.bounceCount) || 0,
      salaryDetected: Boolean(parsed.salaryDetected),
      estimatedSalary: parsed.estimatedSalary ? Number(parsed.estimatedSalary) : null,
      totalEMIBurden: Number(parsed.totalEMIBurden) || 0,
      inflowConsistencyScore: Number(parsed.inflowConsistencyScore) || 50,
      detectedEMIs: Array.isArray(parsed.detectedEMIs) ? parsed.detectedEMIs : [],
      rawTransactionCount: 0, // Mock fallback as AI isn't explicitly counting rows
    };
  } catch (error) {
    console.error('[AI PARSER] Gemini Bank Statement extraction failed:', error.message);
    throw new Error('Failed to extract bank data via True AI.');
  }
}

/**
 * Extracts exact GST metrics (Turnover, ITC) from a GSTR-3B PDF return using Gemini 1.5.
 *
 * @param {string} text Raw text extracted from the PDF
 * @param {string} defaultGstin Default GSTIN if not found
 * @returns {object} Struct matching GST schema
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

    return {
      gstin: parsed.gstin && parsed.gstin.length === 15 ? parsed.gstin : defaultGstin,
      period: parsed.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
      turnover: Number(parsed.turnover) || 0,
      itcEligible: Number(parsed.itcEligible) || 0,
      itcClaimed: Number(parsed.itcClaimed) || 0,
      taxLiability: Number(parsed.taxLiability) || 0,
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

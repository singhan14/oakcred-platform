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
      model: 'gemini-1.5-flash',
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
      model: 'gemini-1.5-flash',
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

module.exports = {
  extractITR,
  extractBankMetrics,
};

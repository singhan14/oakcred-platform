const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates an analytical Credit Memorandum and structured insights
 * using Google Gemini 2.5 Flash based on the deterministically calculated metrics.
 * 
 * @param {Object} rawInputData - The raw extracted data from bank statements / GST
 * @param {Object} calculatedMetrics - The outputs from scoringEngine.js (DSCR, overallScore, verdict, features)
 * @param {Object} borrower - The borrower entity object (name, type, industry, etc.)
 * @returns {Promise<{ aiSummary: string, aiInsights: Array }>}
 */
exports.generateCreditMemo = async (rawInputData, calculatedMetrics, borrower = {}) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[LLM SERVICE] GEMINI_API_KEY is missing. Falling back to synthetic mock data.');
    return {
      aiSummary: '### Credit Memorandum\\n\\n*AI Service is completely offline. Add GEMINI_API_KEY to environment variables to enable generative underwriting.*',
      aiInsights: []
    };
  }

  // Build rich, evidence-based context for the LLM
  const flagSummary = (calculatedMetrics.flags || [])
    .map(f => `- [${f.severity}] ${f.message}${f.suggestion ? ' → ' + f.suggestion : ''}`)
    .join('\n');

  const crossValidationSummary = (calculatedMetrics.flags || [])
    .filter(f => f.type === 'ITR_GST_MISMATCH' || f.type === 'GST_BANK_DIVERGENCE')
    .map(f => `- ${f.message}: ${f.suggestion}`)
    .join('\n');

  const featureDetails = calculatedMetrics.featureDetails || {};
  const gstF = featureDetails.gst || {};
  const cfF = featureDetails.cashFlow || {};
  const taxF = featureDetails.tax || {};
  const structF = featureDetails.structural || {};

  const prompt = `
You are the elite "Virtual Underwriter" AI for OakCred, an advanced SaaS credit intelligence platform for Indian CA firms.
Your job is to read the deterministic mathematical metrics calculated by our engine and write a professional, specific, and evidence-based Credit Memorandum for the borrower described below.

=== BORROWER PROFILE ===
Name: ${borrower.name || 'Unknown Entity'}
Business Type: ${borrower.type || 'MSME'}
Industry: ${borrower.industry || 'General'}
Location: ${[borrower.city, borrower.state].filter(Boolean).join(', ') || 'India'}
PAN: ${borrower.pan || 'N/A'}
GSTIN: ${borrower.gstin || 'Not Registered'}

=== LOAN REQUEST ===
Amount Requested: ₹${Number(rawInputData.requestedLoanAmount || 0).toLocaleString('en-IN')}
Tenure: ${rawInputData.requestedTenureMonths || 36} months
Purpose: ${rawInputData.loanPurpose || 'Working Capital'}

=== DETERMINISTIC RISK SCORES (computed by our engine, NOT by you) ===
Overall CreditIQ Score: ${calculatedMetrics.overallScore}/100
Verdict: ${calculatedMetrics.verdict}
Confidence Level: ${calculatedMetrics.confidenceLevel}
Model Layer: ${calculatedMetrics.modelLayer}

Sub-Scores:
- GST Compliance Score: ${calculatedMetrics.gstScore ?? 'N/A'}/100
- Cash Flow Score: ${calculatedMetrics.cashFlowScore ?? 'N/A'}/100
- Tax Compliance Score: ${calculatedMetrics.taxScore ?? 'N/A'}/100
- Debt Serviceability Score: ${calculatedMetrics.debtScore ?? 'N/A'}/100
- Business Stability Score: ${calculatedMetrics.stabilityScore ?? 'N/A'}/100

=== KEY FINANCIAL METRICS ===
DSCR (Debt Service Coverage Ratio): ${calculatedMetrics.dscr ? Number(calculatedMetrics.dscr).toFixed(2) : 'N/A'}
Estimated Monthly Income: ₹${calculatedMetrics.estimatedMonthlyIncome ? Number(calculatedMetrics.estimatedMonthlyIncome).toLocaleString('en-IN') : 'N/A'}
Projected EMI: ₹${structF.projectedEMI ? Number(structF.projectedEMI).toLocaleString('en-IN') : 'N/A'}
Loan-to-Income Ratio: ${structF.loan_to_income ? Number(structF.loan_to_income).toFixed(1) + 'x' : 'N/A'}
Working Capital Ratio: ${structF.working_capital_ratio ? Number(structF.working_capital_ratio).toFixed(2) : 'N/A'}

GST Details:
- Filing Rate: ${gstF.gst_filing_rate ? (gstF.gst_filing_rate * 100).toFixed(0) + '%' : 'N/A'}
- Turnover Trend: ${gstF.gst_turnover_slope > 0.05 ? 'Growing (' + (gstF.gst_turnover_slope * 100).toFixed(1) + '% per period)' : gstF.gst_turnover_slope > 0 ? 'Stable' : gstF.gst_turnover_slope !== undefined ? 'Declining' : 'N/A'}
- ITC Mismatch: ${gstF.gst_itc_mismatch ? (gstF.gst_itc_mismatch * 100).toFixed(1) + '%' : 'N/A'}
- Late Filing Rate: ${gstF.gst_late_filing_rate ? (gstF.gst_late_filing_rate * 100).toFixed(0) + '%' : 'N/A'}

Cash Flow Details:
- Bounce Rate: ${cfF.cf_bounce_rate !== undefined ? (cfF.cf_bounce_rate * 100).toFixed(1) + '%' : 'N/A'}
- EMI Burden Ratio: ${cfF.cf_emi_burden ? (cfF.cf_emi_burden * 100).toFixed(0) + '% of income' : 'N/A'}
- Inflow Trend: ${cfF.cf_inflow_trend > 0 ? 'Growing' : cfF.cf_inflow_trend !== undefined ? 'Declining' : 'N/A'}

Tax Details:
- ITR Years Filed: ${taxF.tax_filing_years ? Math.round(taxF.tax_filing_years * 3) + ' years' : 'N/A'}
- Income Growth: ${taxF.tax_income_trend ? (taxF.tax_income_trend * 100).toFixed(0) + '%' : 'N/A'}
- ITR-GST Turnover Gap: ${taxF.tax_turnover_gap ? (taxF.tax_turnover_gap * 100).toFixed(0) + '%' : 'N/A'}

=== RISK FLAGS (generated by our deterministic engine) ===
${flagSummary || 'No significant risk flags detected.'}

${crossValidationSummary ? '=== CROSS-VALIDATION WARNINGS ===\n' + crossValidationSummary : ''}

=== DATA SOURCES USED ===
- GST Records: ${rawInputData.gstRecordCount || 0} filing periods
- ITR Records: ${rawInputData.itrRecordCount || 0} assessment years
- Bank Statement: ${rawInputData.hasBankData ? 'Analyzed' : 'Not Provided'}

=== TASK ===
Write a professional, evidence-based Credit Memorandum. Rules:
1. You MUST reference specific numbers from the metrics above — do not invent new numbers.
2. Be specific to THIS borrower — mention their name, industry, and actual data.
3. For aiInsights, provide 3-5 genuinely useful insights — each must cite a specific metric.
4. Your response must be ONLY pure, valid JSON. No markdown code blocks.

Required JSON Schema:
{
  "aiSummary": "<A Markdown-formatted Credit Memorandum with: ## Executive Summary (1 paragraph with score and verdict), ## Core Strengths (bullet points citing specific metrics), ## Identified Risks (bullet points citing specific flags/metrics), ## Recommendation (specific recommendation based on verdict, with next steps)>",
  "aiInsights": [
    { "title": "<3-4 word title>", "description": "<Specific insight citing actual numbers from the metrics above>", "type": "<STRENGTH|RISK|NEUTRAL>" }
  ]
}

Write the JSON now.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const output = JSON.parse(response.text);
    return {
      aiSummary: output.aiSummary,
      aiInsights: Array.isArray(output.aiInsights) ? output.aiInsights : [],
    };
  } catch (err) {
    console.error('[LLM Generation Error]', err);
    return {
      aiSummary: '### AI Generation Error\n\nThe AI engine encountered an issue while generating the credit memorandum. Please rely on the mathematical risk vectors and deterministic flags below for your assessment.',
      aiInsights: []
    };
  }
};

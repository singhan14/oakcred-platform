const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Generates an analytical Credit Memorandum and structured insights
 * using Google Gemini 1.5 Flash based on the deterministically calculated metrics.
 * 
 * @param {Object} rawInputData - The raw extracted data from bank statements / GST
 * @param {Object} calculatedMetrics - The outputs from scoringEngine.js (DSCR, overallScore, verdict, features)
 * @returns {Promise<{ aiSummary: string, aiInsights: Array }>}
 */
exports.generateCreditMemo = async (rawInputData, calculatedMetrics) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[LLM SERVICE] GEMINI_API_KEY is missing. Falling back to synthetic mock data.');
    return {
      aiSummary: '### Credit Memorandum\\n\\n*AI Service is completely offline. Add GEMINI_API_KEY to environment variables to enable generative underwriting.*',
      aiInsights: []
    };
  }

  const prompt = `
You are the elite "Virtual Underwriter" AI for OakCred, an advanced SaaS credit intelligence platform for Indian CA firms.
Your job is to read the deterministic mathematical metrics calculated by our engine and write a beautiful, professional, and uncompromising Credit Memorandum.

=== RAW CONTEXT === 
Firm Overview:
${JSON.stringify(rawInputData, null, 2)}

Calculated Risk Vectors:
Overall Score: ${calculatedMetrics.overallScore}/100
Verdict: ${calculatedMetrics.verdict}
DSCR (Debt Service): ${calculatedMetrics.dscr}
GST Trend: ${calculatedMetrics.featureDetails?.gst?.gst_turnover_slope > 0 ? 'Growing' : 'Stagnant/Declining'}
Bounce Rate: ${calculatedMetrics.featureDetails?.cashFlow?.cf_bounce_rate * 100 || 0}%

=== TASK ===
1. You must respond in ONLY pure, valid JSON format. Do not use markdown code blocks (\`\`\`json).
2. The JSON object must have exactly two keys: "aiSummary" and "aiInsights"

Format Specification:
{
  "aiSummary": "<A beautifully formatted Markdown string containing a 3-paragraph Credit Memorandum. Start with a bold ## Executive Summary. Include sections on Core Strengths, Identified Risks, and Final Recommendation based on the verdict. Use bullet points and modern professional tone.>",
  "aiInsights": [
    { "title": "<Short 3-word title>", "description": "<Specific qualitative insight based on the metrics>", "type": "<STRENGTH|RISK|NEUTRAL>" },
    { "title": "<Short 3-word title>", "description": "<Another specific qualitative insight>", "type": "<STRENGTH|RISK|NEUTRAL>" }
  ]
}

Write the JSON now.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const output = JSON.parse(response.text);
    return {
      aiSummary: output.aiSummary,
      aiInsights: output.aiInsights,
    };
  } catch (err) {
    console.error('[LLM Generation Error]', err);
    return {
      aiSummary: '### AI Generation Error\\n\\nThe AI engine timed out or encountered an issue while generating the credit memorandum. Please rely on the mathematical risk vectors below.',
      aiInsights: []
    };
  }
};

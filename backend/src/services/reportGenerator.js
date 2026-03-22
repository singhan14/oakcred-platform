/**
 * PDF Report Generator for CreditIQ credit assessments.
 * Generates HTML report and converts to PDF using Puppeteer.
 * Falls back to HTML-only in environments without Puppeteer.
 */

const path = require('path');
const { uploadBlob } = require('./storageService');

function generateReportHTML(assessment, borrower, firm) {
  const score = assessment.overallScore;
  const verdictColors = {
    LOAN_READY: '#2D6A4F',
    CONDITIONALLY_READY: '#E9C46A',
    UNDER_REVIEW: '#F4A261',
    NOT_READY: '#E76F51',
  };
  const verdictColor = verdictColors[assessment.verdict] || '#666';
  const flags = assessment.flags || [];
  const lenders = assessment.lenderMatches || [];
  const dataSources = assessment.dataSourcesUsed || {};

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #222; background: #fff; padding: 40px; }
  .header { text-align: center; border-bottom: 3px solid #C8410A; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #C8410A; font-size: 28px; }
  .header .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
  .section { margin-bottom: 25px; page-break-inside: avoid; }
  .section h2 { color: #C8410A; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 12px; }
  .score-circle { width: 120px; height: 120px; border-radius: 50%; border: 8px solid ${verdictColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; }
  .score-circle .score-value { font-size: 36px; font-weight: bold; color: ${verdictColor}; }
  .verdict-badge { display: inline-block; padding: 8px 20px; background: ${verdictColor}; color: white; border-radius: 20px; font-weight: bold; font-size: 14px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .metric { background: #f8f8f8; padding: 12px; border-radius: 8px; }
  .metric .label { font-size: 12px; color: #888; text-transform: uppercase; }
  .metric .value { font-size: 20px; font-weight: bold; color: #333; }
  .flag { padding: 10px; border-radius: 6px; margin-bottom: 8px; border-left: 4px solid; }
  .flag.HIGH { background: #fde8e8; border-color: #e74c3c; }
  .flag.MEDIUM { background: #fef3e2; border-color: #f39c12; }
  .flag.LOW { background: #eef8ee; border-color: #27ae60; }
  .flag .severity { font-weight: bold; font-size: 12px; text-transform: uppercase; }
  .flag .message { margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f5f5f5; font-size: 12px; text-transform: uppercase; color: #666; }
  .bar-container { height: 8px; background: #eee; border-radius: 4px; margin-top: 4px; }
  .bar-fill { height: 100%; border-radius: 4px; background: ${verdictColor}; }
  .footer { text-align: center; color: #999; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
  .cert-box { border: 2px solid #C8410A; padding: 20px; border-radius: 8px; text-align: center; }
</style>
</head>
<body>
  <!-- 1. Header -->
  <div class="header">
    <h1>CreditIQ</h1>
    <div class="subtitle">Credit Intelligence Report</div>
    <div class="subtitle">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
  </div>

  <!-- 2. Executive Summary -->
  <div class="section">
    <h2>1. Executive Summary</h2>
    <div style="text-align: center; margin: 20px 0;">
      <div class="score-circle"><span class="score-value">${score}</span></div>
      <div class="verdict-badge">${assessment.verdict.replace(/_/g, ' ')}</div>
      <p style="margin-top: 10px; color: #666;">Confidence: ${assessment.confidenceLevel} | Model: ${assessment.modelLayer}</p>
    </div>
    <div class="grid">
      <div class="metric"><div class="label">Borrower</div><div class="value">${borrower.name}</div></div>
      <div class="metric"><div class="label">Type</div><div class="value">${borrower.type}</div></div>
      <div class="metric"><div class="label">Loan Amount</div><div class="value">₹${Number(assessment.requestedLoanAmount).toLocaleString('en-IN')}</div></div>
      <div class="metric"><div class="label">DSCR</div><div class="value">${assessment.dscr || 'N/A'}</div></div>
    </div>
  </div>

  <!-- 3. Identity Verification -->
  <div class="section">
    <h2>2. Identity Verification</h2>
    <div class="grid">
      <div class="metric"><div class="label">PAN</div><div class="value">${borrower.pan}</div></div>
      <div class="metric"><div class="label">GSTIN</div><div class="value">${borrower.gstin || 'N/A'}</div></div>
      <div class="metric"><div class="label">Udyam</div><div class="value">${borrower.udyamNumber || 'Not Registered'}</div></div>
      <div class="metric"><div class="label">Industry</div><div class="value">${borrower.industry || 'N/A'}</div></div>
    </div>
  </div>

  <!-- 4. Score Breakdown -->
  <div class="section">
    <h2>3. CreditIQ Score Breakdown</h2>
    ${[
      { label: 'GST Compliance', score: assessment.gstScore, weight: '30%' },
      { label: 'Cash Flow', score: assessment.cashFlowScore, weight: '25%' },
      { label: 'Tax Compliance', score: assessment.taxScore, weight: '20%' },
      { label: 'Debt Serviceability', score: assessment.debtScore, weight: '15%' },
      { label: 'Business Stability', score: assessment.stabilityScore, weight: '10%' },
    ].map(s => `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; justify-content: space-between;">
        <span>${s.label} (${s.weight})</span>
        <span style="font-weight: bold;">${s.score !== null ? s.score : 'N/A'}</span>
      </div>
      <div class="bar-container"><div class="bar-fill" style="width: ${s.score || 0}%"></div></div>
    </div>`).join('')}
  </div>

  <!-- 5. Risk Flags -->
  <div class="section">
    <h2>4. Risk Flags</h2>
    ${flags.length === 0 ? '<p style="color: #27ae60;">No risk flags detected.</p>' :
      flags.map(f => `<div class="flag ${f.severity}"><div class="severity">${f.severity}</div><div class="message">${f.message}</div></div>`).join('')}
  </div>

  <!-- 6. Lender Matches -->
  <div class="section">
    <h2>5. Recommended Lenders</h2>
    ${lenders.length === 0 ? '<p>No lender matches at current credit score.</p>' : `
    <table>
      <tr><th>Lender</th><th>Product</th><th>Max Amount</th><th>Rate</th></tr>
      ${lenders.map(l => `<tr><td>${l.lenderName}</td><td>${l.productType}</td><td>₹${l.maxAmount.toLocaleString('en-IN')}</td><td>${l.rate}</td></tr>`).join('')}
    </table>`}
  </div>

  <!-- 7. Data Sources -->
  <div class="section">
    <h2>6. Data Sources</h2>
    <div class="grid">
      ${dataSources.gst ? `<div class="metric"><div class="label">GST Records</div><div class="value">${dataSources.gst.count} months</div></div>` : ''}
      ${dataSources.itr ? `<div class="metric"><div class="label">ITR Records</div><div class="value">${dataSources.itr.count} years</div></div>` : ''}
      ${dataSources.bank ? `<div class="metric"><div class="label">Bank Statement</div><div class="value">Analyzed</div></div>` : ''}
    </div>
  </div>

  <!-- 8. CA Certification -->
  <div class="section">
    <h2>7. CA Certification</h2>
    <div class="cert-box">
      <p style="font-weight: bold; font-size: 16px;">${firm.name}</p>
      <p>ICAI No: ${firm.icaiNumber || 'N/A'}</p>
      <p style="margin-top: 10px;">This credit assessment has been prepared using verified financial data and CreditIQ's proprietary scoring methodology.</p>
      <p style="margin-top: 10px; font-size: 12px; color: #666;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>

  <div class="footer">
    <p>CreditIQ Credit Intelligence Report · Confidential · Generated ${new Date().toISOString()}</p>
    <p>Powered by CreditIQ · RBI Account Aggregator Framework</p>
  </div>
</body>
</html>`;
}

async function generateReport(assessment, borrower, firm) {
  const html = generateReportHTML(assessment, borrower, firm);
  let pdfBuffer;

  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
    await browser.close();
  } catch (err) {
    console.warn('[REPORT] Puppeteer not available, saving HTML report:', err.message);
    pdfBuffer = Buffer.from(html, 'utf8');
  }

  const fileName = `creditiq-report-${borrower.name.replace(/\s+/g, '_')}-${Date.now()}.pdf`;
  const { url, blobName } = await uploadBlob('reports', fileName, pdfBuffer);

  return { reportUrl: url, reportGeneratedAt: new Date() };
}

module.exports = { generateReport, generateReportHTML };

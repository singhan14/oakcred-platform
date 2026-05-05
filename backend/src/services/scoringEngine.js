/**
 * CreditIQ Scoring Engine v2.0
 * Enhanced multi-layer credit assessment model with 22 engineered features,
 * sigmoid smoothing, dynamic weight profiles, and cross-validation checks.
 *
 * Based on research: XGBoost/LightGBM credit scoring literature (2024-2025)
 * achieving AUC 0.88-0.91 with these feature sets.
 */

const { pmt } = require('../utils/pmt');

// ─── INDUSTRY RISK SCORES (normalized 0-1) ─────────────────────
const INDUSTRY_RISK = {
  IT: 0.85, Healthcare: 0.82, Education: 0.78, FMCG: 0.78,
  Food: 0.74, Retail: 0.72, Textile: 0.70, Manufacturing: 0.68,
  Auto: 0.62, Construction: 0.55, Agriculture: 0.50, Other: 0.60,
};

// ─── LENDER CATALOG ──────────────────────────────────────────
const LENDER_CATALOG = {
  LOAN_READY_SMALL: [
    { lenderName: 'Lendingkart', productType: 'Working Capital', maxAmount: 5000000, rate: '16-20%' },
    { lenderName: 'Capital Float', productType: 'Term Loan', maxAmount: 5000000, rate: '15-19%' },
    { lenderName: 'SIDBI MSME', productType: 'MSME Loan', maxAmount: 5000000, rate: '12-15%' },
  ],
  LOAN_READY_LARGE: [
    { lenderName: 'Bajaj Finserv', productType: 'Business Loan', maxAmount: 20000000, rate: '14-18%' },
    { lenderName: 'Tata Capital', productType: 'MSME Loan', maxAmount: 20000000, rate: '13-17%' },
    { lenderName: 'HDFC Bank MSME', productType: 'Business Loan', maxAmount: 20000000, rate: '12-16%' },
  ],
  CONDITIONALLY_READY: [
    { lenderName: 'KreditBee', productType: 'Business Loan', maxAmount: 5000000, rate: '18-24%' },
    { lenderName: 'MoneyTap', productType: 'Credit Line', maxAmount: 5000000, rate: '18-24%' },
    { lenderName: 'Incred', productType: 'Business Loan', maxAmount: 5000000, rate: '16-22%' },
  ],
  INDIVIDUAL: [
    { lenderName: 'PaySense', productType: 'Personal Loan', maxAmount: 500000, rate: '20-36%' },
    { lenderName: 'EarlySalary', productType: 'Personal Loan', maxAmount: 500000, rate: '18-30%' },
    { lenderName: 'CASHe', productType: 'Personal Loan', maxAmount: 400000, rate: '22-36%' },
  ],
};

// ─── DYNAMIC WEIGHT PROFILES ────────────────────────────────
const WEIGHT_PROFILES = {
  MSME_FULL: { gst: 0.28, cashflow: 0.27, tax: 0.17, structural: 0.28 },
  MSME_NO_BANK: { gst: 0.40, cashflow: 0.0, tax: 0.28, structural: 0.32 },
  MSME_NO_ITR: { gst: 0.38, cashflow: 0.35, tax: 0.0, structural: 0.27 },
  MSME_NO_GST: { gst: 0.0, cashflow: 0.38, tax: 0.30, structural: 0.32 },
  MSME_MINIMAL: { gst: 0.0, cashflow: 0.0, tax: 0.0, structural: 0.40, behavioral: 0.60 },
  INDIVIDUAL_FULL: { gst: 0.0, cashflow: 0.40, tax: 0.25, structural: 0.35 },
  INDIVIDUAL_MINIMAL: { gst: 0.0, cashflow: 0.0, tax: 0.20, structural: 0.30, behavioral: 0.50 },
};

// ─── UTILITY FUNCTIONS ──────────────────────────────────────

/** Sigmoid smoothing — avoids cliff effects in scoring */
function sigmoid(x, midpoint = 50, steepness = 0.08) {
  return 100 / (1 + Math.exp(-steepness * (x - midpoint)));
}

/** Linear regression slope (returns normalized rate of change per period) */
function linearSlope(values) {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (values[i] - yMean);
    den += (i - xMean) ** 2;
  }
  if (den === 0) return 0;
  const slope = num / den;
  // Normalize: slope relative to mean
  return yMean === 0 ? 0 : slope / yMean;
}

/** Coefficient of variation */
function coefficientOfVariation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

/** Clamp a value between min and max */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

// ═══════════════════════════════════════════════════════════════
// FEATURE ENGINEERING — 22 FEATURES
// ═══════════════════════════════════════════════════════════════

// ─── A. GST FEATURES (6) ────────────────────────────────────

function extractGSTFeatures(gstRecords) {
  if (!gstRecords || gstRecords.length === 0) return null;

  const totalMonths = 24;
  const filed = gstRecords.filter(r => r.filingStatus !== 'NOT_FILED');
  const sorted = [...gstRecords].sort((a, b) => a.period.localeCompare(b.period));
  const turnovers = sorted.map(r => Number(r.turnover || 0));

  // F1: Filing rate
  const gst_filing_rate = filed.length / totalMonths;

  // F2: Turnover slope (normalized) — #1 ranked feature in research
  const gst_turnover_slope = linearSlope(turnovers);

  // F3: Turnover coefficient of variation (lower = more stable)
  const gst_turnover_cv = coefficientOfVariation(turnovers);

  // F4: ITC mismatch ratio
  const totalClaimed = gstRecords.reduce((s, r) => s + Number(r.itcClaimed || 0), 0);
  const totalEligible = gstRecords.reduce((s, r) => s + Number(r.itcEligible || 0), 0);
  const gst_itc_mismatch = totalEligible > 0 ? Math.abs(totalClaimed - totalEligible) / totalEligible : 0;

  // F5: Late filing rate
  const lateFiled = gstRecords.filter(r => r.filingStatus === 'LATE_FILED').length;
  const gst_late_filing_rate = filed.length > 0 ? lateFiled / filed.length : 0;

  // F6: Seasonal strength (max monthly avg / min monthly avg)
  const monthlyAvgs = {};
  gstRecords.forEach(r => {
    const month = r.period.slice(-2); // MM from YYYY-MM
    if (!monthlyAvgs[month]) monthlyAvgs[month] = [];
    monthlyAvgs[month].push(Number(r.turnover || 0));
  });
  const avgByMonth = Object.values(monthlyAvgs).map(arr => arr.reduce((s, v) => s + v, 0) / arr.length);
  const maxMonth = Math.max(...avgByMonth, 1);
  const minMonth = Math.max(Math.min(...avgByMonth), 1);
  const gst_seasonal_strength = maxMonth / minMonth;

  return { gst_filing_rate, gst_turnover_slope, gst_turnover_cv, gst_itc_mismatch, gst_late_filing_rate, gst_seasonal_strength };
}

// ─── B. CASH FLOW FEATURES (6) ──────────────────────────────

function extractCashFlowFeatures(bankData, requestedLoanAmount) {
  if (!bankData) return null;

  const avgBalance = Number(bankData.avgMonthlyBalance || 0);
  const avgInflow = Number(bankData.avgMonthlyInflow || bankData.estimatedSalary || 0);
  const loanAmt = Number(requestedLoanAmount || 1);

  // F7: Balance coefficient of variation (stability) — #2 ranked
  // Use real monthly breakdowns from AI parser when available
  let balanceValues;
  if (Array.isArray(bankData.monthlyBalances) && bankData.monthlyBalances.length >= 2) {
    balanceValues = bankData.monthlyBalances.map(Number).filter(v => isFinite(v) && v >= 0);
  }
  // Fallback: single-point estimate (low confidence — CV will be 0)
  if (!balanceValues || balanceValues.length < 2) {
    balanceValues = [avgBalance];
  }
  const cf_balance_cv = coefficientOfVariation(balanceValues);

  // F8: Cash coverage ratio (can they cover obligations from cash?)
  const monthlyObligations = Number(bankData.totalEMIBurden || 0) + (loanAmt > 0 ? pmt(0.14 / 12, 36, loanAmt) : 0);
  const cf_cash_coverage = monthlyObligations > 0 ? avgBalance / monthlyObligations : avgBalance > 0 ? 5 : 0;

  // F9: Bounce rate — use real transaction count from AI parser
  const totalTxn = Number(bankData.rawTransactionCount || bankData.totalTransactions || 0);
  const bounceCount = Number(bankData.bounceCount || 0);
  const cf_bounce_rate = totalTxn > 0 ? bounceCount / totalTxn : (bounceCount > 0 ? 0.05 : 0);

  // F10: Inflow concentration (HHI — Herfindahl index)
  // Use real HHI from AI parser; only default when genuinely unavailable
  const rawHHI = Number(bankData.inflowConcentrationHHI);
  const cf_inflow_hhi = isFinite(rawHHI) && rawHHI >= 0 && rawHHI <= 1 ? rawHHI : 0.25;

  // F11: EMI burden ratio
  const totalEMI = Number(bankData.totalEMIBurden || 0);
  const cf_emi_burden = avgInflow > 0 ? totalEMI / avgInflow : 0;

  // F12: Inflow trend (growing vs declining)
  // Use real monthly inflow breakdowns from AI parser when available
  let inflowValues;
  if (Array.isArray(bankData.monthlyInflows) && bankData.monthlyInflows.length >= 2) {
    inflowValues = bankData.monthlyInflows.map(Number).filter(v => isFinite(v) && v >= 0);
  }
  // Fallback: single-point estimate (slope will be 0 — neutral)
  if (!inflowValues || inflowValues.length < 2) {
    inflowValues = [avgInflow];
  }
  const cf_inflow_trend = linearSlope(inflowValues);

  return { cf_balance_cv, cf_cash_coverage, cf_bounce_rate, cf_inflow_hhi, cf_emi_burden, cf_inflow_trend };
}

// ─── C. TAX FEATURES (5) ────────────────────────────────────

function extractTaxFeatures(itrRecords, gstRecords) {
  if (!itrRecords || itrRecords.length === 0) return null;

  const sorted = [...itrRecords].sort((a, b) => a.assessmentYear - b.assessmentYear);

  // F13: Filing years coverage (3 years = 1.0)
  const tax_filing_years = Math.min(sorted.length / 3, 1);

  // F14: Income trend (latest vs earliest)
  const earliest = Number(sorted[0].grossIncome || 0);
  const latest = Number(sorted[sorted.length - 1].grossIncome || 0);
  const tax_income_trend = earliest > 0 ? (latest - earliest) / earliest : 0;

  // F15: Effective tax rate (tax compliance quality)
  const totalIncome = sorted.reduce((s, r) => s + Number(r.grossIncome || 0), 0);
  const totalTax = sorted.reduce((s, r) => s + Number(r.taxPaid || 0), 0);
  const tax_effective_rate = totalIncome > 0 ? totalTax / totalIncome : 0;

  // F16: ITR-GST turnover gap (cross-validation) — KEY INNOVATION
  let tax_turnover_gap = 0;
  if (gstRecords && gstRecords.length > 0) {
    const annualGstTurnover = gstRecords.reduce((s, r) => s + Number(r.turnover || 0), 0);
    const annualItrIncome = totalIncome / sorted.length; // avg per year
    const avgGstPerYear = annualGstTurnover / (gstRecords.length / 12);
    if (avgGstPerYear > 0) {
      tax_turnover_gap = Math.abs(annualItrIncome - avgGstPerYear) / avgGstPerYear;
    }
  }

  // F17: Filing regularity
  const onTimeFilings = sorted.filter(r => r.filingStatus === 'ON_TIME' || r.filingStatus === 'FILED').length;
  const tax_regularity = sorted.length > 0 ? onTimeFilings / sorted.length : 0;

  return { tax_filing_years, tax_income_trend, tax_effective_rate, tax_turnover_gap, tax_regularity };
}

// ─── D. STRUCTURAL FEATURES (5) ─────────────────────────────

function extractStructuralFeatures(borrower, bankData, requestedLoanAmount, requestedTenureMonths) {
  const avgInflow = Number(bankData?.avgMonthlyInflow || bankData?.estimatedSalary || 0);
  const loanAmt = Number(requestedLoanAmount || 0);
  const tenure = requestedTenureMonths || 36;

  // F18: DSCR continuous (smooth, no cliffs) — #3 ranked
  const projectedEMI = loanAmt > 0 ? pmt(0.14 / 12, tenure, loanAmt) : 0;
  const existingEMI = Number(bankData?.totalEMIBurden || 0);
  const totalEMI = existingEMI + projectedEMI;
  const dscr = avgInflow > 0 ? avgInflow / Math.max(totalEMI, 1) : 1;

  // F19: Business vintage (normalized 0-1, 60 months = 1.0)
  let vintageMonths = 24; // default
  if (borrower.createdAt) {
    vintageMonths = Math.floor((Date.now() - new Date(borrower.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30));
  }
  const business_vintage = Math.min(vintageMonths / 60, 1);

  // F20: Industry risk (0-1)
  const industry_risk = INDUSTRY_RISK[borrower.industry] || INDUSTRY_RISK.Other;

  // F21: Loan-to-income ratio
  const annualIncome = avgInflow * 12;
  const loan_to_income = annualIncome > 0 ? loanAmt / annualIncome : loanAmt > 0 ? 5 : 0;

  // F22: Working capital estimate (approximation)
  const avgBalance = Number(bankData?.avgMonthlyBalance || 0);
  const working_capital_ratio = avgInflow > 0 ? avgBalance / avgInflow : 0;

  return {
    dscr, dscr_continuous: dscr, business_vintage, industry_risk,
    loan_to_income, working_capital_ratio,
    projectedEMI: Math.round(projectedEMI),
    monthlyIncome: avgInflow,
  };
}

// ═══════════════════════════════════════════════════════════════
// SCORING ENGINE — SCORE EACH FEATURE GROUP
// ═══════════════════════════════════════════════════════════════

function scoreGSTGroup(f) {
  if (!f) return null;

  // Filing rate: 1.0 = 100pts, <0.5 = 0pts
  const s1 = sigmoid(f.gst_filing_rate * 100, 70, 0.1);

  // Turnover slope: positive = good (growth)
  const slopeScore = f.gst_turnover_slope > 0.05 ? 90 :
                     f.gst_turnover_slope > 0 ? 70 :
                     f.gst_turnover_slope > -0.05 ? 50 : 25;
  const s2 = slopeScore;

  // Turnover CV: <0.3 = very stable, >0.8 = volatile
  const s3 = sigmoid((1 - clamp(f.gst_turnover_cv, 0, 1.5) / 1.5) * 100, 50, 0.08);

  // ITC mismatch: <5% = excellent, >15% = bad
  const s4 = f.gst_itc_mismatch < 0.05 ? 100 : f.gst_itc_mismatch < 0.10 ? 75 : f.gst_itc_mismatch < 0.15 ? 50 : 20;

  // Late filing rate: 0 = 100, >0.3 = bad
  const s5 = sigmoid((1 - clamp(f.gst_late_filing_rate, 0, 0.5) * 2) * 100, 50, 0.08);

  // Seasonal strength: <3 = fine, >5 = risky high seasonality
  const s6 = f.gst_seasonal_strength < 3 ? 85 : f.gst_seasonal_strength < 5 ? 65 : 45;

  // Weighted combination within GST group
  const groupScore = s1 * 0.25 + s2 * 0.25 + s3 * 0.15 + s4 * 0.15 + s5 * 0.10 + s6 * 0.10;
  return Math.round(clamp(groupScore, 0, 100));
}

function scoreCashFlowGroup(f) {
  if (!f) return null;

  // Balance CV: lower = more stable. <0.2 = excellent
  const s7 = sigmoid((1 - clamp(f.cf_balance_cv, 0, 1) ) * 100, 50, 0.1);

  // Cash coverage: >3 = excellent, <1 = bad
  const s8 = sigmoid(clamp(f.cf_cash_coverage, 0, 6) / 6 * 100, 40, 0.08);

  // Bounce rate: 0 = perfect, >0.05 = bad
  const s9 = f.cf_bounce_rate === 0 ? 100 : f.cf_bounce_rate < 0.02 ? 75 : f.cf_bounce_rate < 0.05 ? 45 : 15;

  // Inflow HHI: <0.25 = diversified, >0.6 = concentrated
  const s10 = sigmoid((1 - clamp(f.cf_inflow_hhi, 0, 1)) * 100, 50, 0.08);

  // EMI burden: <0.3 = comfortable, >0.6 = stressed
  const s11 = sigmoid((1 - clamp(f.cf_emi_burden, 0, 1)) * 100, 50, 0.1);

  // Inflow trend: positive = growing
  const s12 = f.cf_inflow_trend > 0.05 ? 90 : f.cf_inflow_trend > 0 ? 70 : f.cf_inflow_trend > -0.05 ? 50 : 25;

  const groupScore = s7 * 0.22 + s8 * 0.20 + s9 * 0.18 + s10 * 0.12 + s11 * 0.15 + s12 * 0.13;
  return Math.round(clamp(groupScore, 0, 100));
}

function scoreTaxGroup(f) {
  if (!f) return null;

  // Filing years: 1.0 = 3 years = full marks
  const s13 = f.tax_filing_years * 100;

  // Income trend: positive growth = good
  const s14 = f.tax_income_trend > 0.15 ? 95 : f.tax_income_trend > 0 ? 70 : f.tax_income_trend > -0.10 ? 50 : 25;

  // Effective tax rate: 0.05-0.30 = normal
  const s15 = f.tax_effective_rate > 0.05 && f.tax_effective_rate < 0.35 ? 85 :
              f.tax_effective_rate > 0.01 ? 60 : 30;

  // Turnover gap: <10% = consistent, >30% = red flag
  const s16 = f.tax_turnover_gap < 0.10 ? 100 : f.tax_turnover_gap < 0.20 ? 65 : f.tax_turnover_gap < 0.30 ? 40 : 15;

  // Regularity: on-time filings
  const s17 = sigmoid(f.tax_regularity * 100, 60, 0.08);

  const groupScore = s13 * 0.20 + s14 * 0.20 + s15 * 0.15 + s16 * 0.25 + s17 * 0.20;
  return Math.round(clamp(groupScore, 0, 100));
}

function scoreStructuralGroup(f) {
  // DSCR continuous: smooth sigmoid instead of cliff thresholds
  const dscrNorm = clamp(f.dscr, 0, 4) / 4;
  const s18 = sigmoid(dscrNorm * 100, 35, 0.08);

  // Vintage: 0-60 months normalized
  const s19 = sigmoid(f.business_vintage * 100, 40, 0.06);

  // Industry risk (already 0-1, higher = safer)
  const s20 = f.industry_risk * 100;

  // Loan-to-income: <2 = good, >4 = risky
  const ltiScore = f.loan_to_income < 1 ? 95 : f.loan_to_income < 2 ? 80 :
                   f.loan_to_income < 3 ? 60 : f.loan_to_income < 4 ? 40 : 20;
  const s21 = ltiScore;

  // Working capital ratio: >1 = good liquidity
  const s22 = f.working_capital_ratio > 2 ? 95 : f.working_capital_ratio > 1 ? 80 :
              f.working_capital_ratio > 0.5 ? 60 : 35;

  const groupScore = s18 * 0.30 + s19 * 0.15 + s20 * 0.15 + s21 * 0.25 + s22 * 0.15;
  return Math.round(clamp(groupScore, 0, 100));
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

function runCreditAssessment({ borrower, gstRecords, itrRecords, bankData, requestedLoanAmount, requestedTenureMonths, loanPurpose }) {
  // ── Step 1: Extract 22 features ──────────────────────────
  const gstFeatures = extractGSTFeatures(gstRecords);
  const cashFlowFeatures = extractCashFlowFeatures(bankData, requestedLoanAmount);
  const taxFeatures = extractTaxFeatures(itrRecords, gstRecords);
  const structuralFeatures = extractStructuralFeatures(borrower, bankData, requestedLoanAmount, requestedTenureMonths);

  // ── Step 2: Score each group ─────────────────────────────
  const gstScore = scoreGSTGroup(gstFeatures);
  const cashFlowScore = scoreCashFlowGroup(cashFlowFeatures);
  const taxScore = scoreTaxGroup(taxFeatures);
  const stabilityScore = scoreStructuralGroup(structuralFeatures);
  const debtScore = structuralFeatures.dscr > 2 ? 95 : structuralFeatures.dscr > 1.5 ? 75 :
                    structuralFeatures.dscr > 1.25 ? 55 : structuralFeatures.dscr > 1 ? 35 : 15;

  // ── Step 3: Determine model layer & weight profile ───────
  const hasGST = gstScore !== null;
  const hasBank = cashFlowScore !== null;
  const hasITR = taxScore !== null;
  const formalSources = [hasGST, hasITR, hasBank].filter(Boolean).length;
  const isMSME = borrower.type === 'MSME' || borrower.type === 'PARTNERSHIP';

  let modelLayer, profileKey;
  if (formalSources === 3) { modelLayer = 'LAYER1'; profileKey = 'MSME_FULL'; }
  else if (formalSources === 2) {
    modelLayer = 'LAYER2';
    if (!hasBank) profileKey = 'MSME_NO_BANK';
    else if (!hasITR) profileKey = 'MSME_NO_ITR';
    else profileKey = 'MSME_NO_GST';
  } else {
    modelLayer = 'LAYER3';
    profileKey = isMSME ? 'MSME_MINIMAL' : 'INDIVIDUAL_MINIMAL';
  }

  if (!isMSME && formalSources >= 2) profileKey = 'INDIVIDUAL_FULL';

  const weights = WEIGHT_PROFILES[profileKey] || WEIGHT_PROFILES.MSME_FULL;

  // ── Step 4: Calculate weighted score with sigmoid ────────
  let rawScore = 0;
  let totalWeight = 0;

  if (hasGST && weights.gst > 0) { rawScore += gstScore * weights.gst; totalWeight += weights.gst; }
  if (hasBank && weights.cashflow > 0) { rawScore += cashFlowScore * weights.cashflow; totalWeight += weights.cashflow; }
  if (hasITR && weights.tax > 0) { rawScore += taxScore * weights.tax; totalWeight += weights.tax; }
  rawScore += stabilityScore * weights.structural; totalWeight += weights.structural;

  // Behavioral score for Layer 3 (default 50 when no ML model)
  let behavioralScore = null;
  if (weights.behavioral) {
    behavioralScore = 50;
    rawScore += behavioralScore * weights.behavioral;
    totalWeight += weights.behavioral;
  }

  // Normalize by total weight
  if (totalWeight > 0) rawScore = rawScore / totalWeight;

  // Confidence discount based on data completeness
  const featureCompleteness = [hasGST, hasBank, hasITR].filter(Boolean).length / 3;
  const confidenceFactor = 0.65 + 0.35 * featureCompleteness;

  // Apply sigmoid smoothing to the raw score
  const smoothedScore = sigmoid(rawScore, 52, 0.075);
  let overallScore = Math.round(clamp(smoothedScore * confidenceFactor, 0, 100));

  // ── Step 5: Verdict ──────────────────────────────────────
  let verdict;
  if (overallScore >= 75) verdict = 'LOAN_READY';
  else if (overallScore >= 60) verdict = 'CONDITIONALLY_READY';
  else if (overallScore >= 45) verdict = 'UNDER_REVIEW';
  else verdict = 'NOT_READY';

  let confidenceLevel;
  if (modelLayer === 'LAYER1') confidenceLevel = 'HIGH';
  else if (modelLayer === 'LAYER2') confidenceLevel = 'MEDIUM';
  else confidenceLevel = 'LOW';

  // ── Step 6: Generate evidence-based flags ─────────────────
  const flags = generateEvidenceFlags({
    gstFeatures, cashFlowFeatures, taxFeatures, structuralFeatures,
    gstScore, cashFlowScore, taxScore, dscr: structuralFeatures.dscr,
    borrower,
  });

  // ── Step 7: Lender matching ─────────────────────────────
  const lenderMatches = matchLenders(verdict, requestedLoanAmount, overallScore, borrower.type);

  // ── Step 8: Cross-validation checks ─────────────────────
  const crossValidation = [];
  if (taxFeatures && taxFeatures.tax_turnover_gap > 0.20) {
    crossValidation.push({
      type: 'ITR_GST_MISMATCH',
      severity: taxFeatures.tax_turnover_gap > 0.30 ? 'HIGH' : 'MEDIUM',
      message: `ITR income vs GST turnover gap: ${(taxFeatures.tax_turnover_gap * 100).toFixed(0)}%`,
      suggestion: 'Significant difference between reported income and GST turnover — verify with client',
    });
  }
  if (gstFeatures && cashFlowFeatures) {
    // Check if GST shows growth but bank shows decline or vice versa
    if (gstFeatures.gst_turnover_slope > 0.05 && cashFlowFeatures.cf_inflow_trend < -0.05) {
      crossValidation.push({
        type: 'GST_BANK_DIVERGENCE',
        severity: 'MEDIUM',
        message: 'GST turnover growing but bank inflows declining',
        suggestion: 'Possible delayed receivables or off-book transactions — investigate',
      });
    }
  }

  return {
    modelLayer,
    overallScore,
    verdict,
    confidenceLevel,
    gstScore,
    cashFlowScore,
    taxScore,
    debtScore,
    stabilityScore,
    behavioralScore,
    dscr: structuralFeatures.dscr,
    estimatedMonthlyIncome: structuralFeatures.monthlyIncome,
    flags: [...flags, ...crossValidation],
    lenderMatches,
    dataSourcesUsed: {
      gst: hasGST ? { count: gstRecords.length, weight: weights.gst } : null,
      itr: hasITR ? { count: itrRecords.length, weight: weights.tax } : null,
      bank: hasBank ? { weight: weights.cashflow } : null,
    },
    featureProfile: profileKey,
    featureDetails: {
      gst: gstFeatures,
      cashFlow: cashFlowFeatures,
      tax: taxFeatures,
      structural: structuralFeatures,
    },
    recommendations: generateRecommendations(verdict, flags, crossValidation),
  };
}

// ─── EVIDENCE-BASED FLAGS ────────────────────────────────────

function generateEvidenceFlags({ gstFeatures, cashFlowFeatures, taxFeatures, structuralFeatures, gstScore, cashFlowScore, taxScore, dscr, borrower }) {
  const flags = [];

  // HIGH severity
  if (cashFlowFeatures && cashFlowFeatures.cf_bounce_rate > 0.03) {
    flags.push({
      severity: 'HIGH',
      message: `Cheque bounce rate: ${(cashFlowFeatures.cf_bounce_rate * 100).toFixed(1)}%`,
      suggestion: 'High bounce rate signals cash flow stress — review banking behavior',
      evidence: `${Math.round(cashFlowFeatures.cf_bounce_rate * 100)}% of transactions bounced`,
    });
  }

  if (gstFeatures && gstFeatures.gst_itc_mismatch > 0.15) {
    flags.push({
      severity: 'HIGH',
      message: `ITC mismatch: ${(gstFeatures.gst_itc_mismatch * 100).toFixed(0)}% gap`,
      suggestion: 'Verify input tax credit claims — potential compliance issue',
      evidence: `Claimed vs eligible ITC differs by ${(gstFeatures.gst_itc_mismatch * 100).toFixed(0)}%`,
    });
  }

  if (dscr && dscr < 1.25) {
    flags.push({
      severity: 'HIGH',
      message: `Low DSCR: ${dscr.toFixed(2)}`,
      suggestion: 'Debt serviceability is concerning — consider smaller loan or longer tenure',
      evidence: `Monthly income covers only ${dscr.toFixed(1)}x of total EMI obligations`,
    });
  }

  if (structuralFeatures && structuralFeatures.loan_to_income > 3) {
    flags.push({
      severity: 'HIGH',
      message: `High loan-to-income: ${structuralFeatures.loan_to_income.toFixed(1)}x annual income`,
      suggestion: 'Requested loan is disproportionate to income — consider reducing amount',
      evidence: `Loan amount is ${structuralFeatures.loan_to_income.toFixed(1)}x annual income`,
    });
  }

  // MEDIUM severity
  if (gstFeatures && gstFeatures.gst_turnover_slope < -0.05) {
    flags.push({
      severity: 'MEDIUM',
      message: 'Declining revenue trend',
      suggestion: 'Revenue is trending downward — investigate business conditions',
      evidence: `Turnover slope: ${(gstFeatures.gst_turnover_slope * 100).toFixed(1)}% per month`,
    });
  }

  if (gstFeatures && gstFeatures.gst_late_filing_rate > 0.15) {
    flags.push({
      severity: 'MEDIUM',
      message: `${(gstFeatures.gst_late_filing_rate * 100).toFixed(0)}% GST filings were late`,
      suggestion: 'Improve filing discipline to strengthen credit profile',
    });
  }

  if (cashFlowFeatures && cashFlowFeatures.cf_balance_cv > 0.5) {
    flags.push({
      severity: 'MEDIUM',
      message: 'High balance volatility',
      suggestion: 'Bank balance fluctuates significantly — indicates irregular cash flow',
      evidence: `Coefficient of variation: ${cashFlowFeatures.cf_balance_cv.toFixed(2)}`,
    });
  }

  if (cashFlowFeatures && cashFlowFeatures.cf_inflow_hhi > 0.5) {
    flags.push({
      severity: 'MEDIUM',
      message: 'Income concentration risk',
      suggestion: 'Revenue depends heavily on few sources — diversification recommended',
      evidence: `Inflow HHI: ${cashFlowFeatures.cf_inflow_hhi.toFixed(2)} (>0.5 = concentrated)`,
    });
  }

  // LOW / POSITIVE flags
  if (gstFeatures && gstFeatures.gst_filing_rate > 0.90) {
    flags.push({
      severity: 'LOW',
      message: `✓ GST filed consistently — ${(gstFeatures.gst_filing_rate * 100).toFixed(0)}% filing rate`,
      suggestion: 'Strong compliance record',
    });
  }

  if (gstFeatures && gstFeatures.gst_turnover_slope > 0.05) {
    flags.push({
      severity: 'LOW',
      message: '✓ Revenue growing steadily',
      suggestion: 'Positive business trajectory',
      evidence: `Growth rate: ${(gstFeatures.gst_turnover_slope * 100).toFixed(1)}% per month`,
    });
  }

  if (!borrower.udyamNumber && borrower.type === 'MSME') {
    flags.push({ severity: 'LOW', message: 'Udyam registration missing', suggestion: 'Register on Udyam portal for better credit access' });
  }

  return flags;
}

// ─── LENDER MATCHING ─────────────────────────────────────────

function matchLenders(verdict, requestedLoanAmount, score, borrowerType) {
  const amount = Number(requestedLoanAmount || 0);
  if (borrowerType === 'INDIVIDUAL') return LENDER_CATALOG.INDIVIDUAL;
  if (verdict === 'LOAN_READY') return amount < 5000000 ? LENDER_CATALOG.LOAN_READY_SMALL : LENDER_CATALOG.LOAN_READY_LARGE;
  if (verdict === 'CONDITIONALLY_READY') return LENDER_CATALOG.CONDITIONALLY_READY;
  return [];
}

// ─── RECOMMENDATIONS ─────────────────────────────────────────

function generateRecommendations(verdict, flags, crossValidation = []) {
  const recs = [];

  if (verdict === 'LOAN_READY') {
    recs.push('Strong credit profile — proceed with lender applications.');
    recs.push('Consider negotiating interest rates with multiple lenders for best terms.');
  } else if (verdict === 'CONDITIONALLY_READY') {
    recs.push('Credit profile needs improvement in some areas before proceeding.');
    const highFlags = flags.filter(f => f.severity === 'HIGH');
    highFlags.forEach(f => recs.push(`Priority fix: ${f.suggestion}`));
  } else if (verdict === 'UNDER_REVIEW') {
    recs.push('Credit profile requires additional data or improvement before loan application.');
    recs.push('Consider providing additional financial documentation to improve assessment confidence.');
  } else {
    recs.push('Credit profile does not meet minimum lending criteria at this time.');
    recs.push('Focus on improving financial discipline — reapply after 6 months.');
  }

  if (crossValidation.length > 0) {
    recs.push('Data cross-validation detected inconsistencies — resolve before applying.');
  }

  return recs;
}

module.exports = {
  runCreditAssessment,
  extractGSTFeatures,
  extractCashFlowFeatures,
  extractTaxFeatures,
  extractStructuralFeatures,
  scoreGSTGroup,
  scoreCashFlowGroup,
  scoreTaxGroup,
  scoreStructuralGroup,
  // Legacy exports for backward compatibility
  calcGSTScore: (records) => scoreGSTGroup(extractGSTFeatures(records)),
  calcCashFlowScore: (bankData, amt) => scoreCashFlowGroup(extractCashFlowFeatures(bankData, amt)),
  calcTaxScore: (itr, gst) => scoreTaxGroup(extractTaxFeatures(itr, gst)),
  calcDebtScore: (bankData, amt, tenure) => {
    const sf = extractStructuralFeatures({ createdAt: new Date(), type: 'MSME', industry: 'Other' }, bankData, amt, tenure);
    return { score: sf.dscr > 2 ? 95 : sf.dscr > 1.5 ? 75 : sf.dscr > 1.25 ? 55 : 35, dscr: sf.dscr, projectedEMI: sf.projectedEMI, monthlyIncome: sf.monthlyIncome };
  },
  calcStabilityScore: (borrower) => scoreStructuralGroup(extractStructuralFeatures(borrower, null, 0, 36)),
};

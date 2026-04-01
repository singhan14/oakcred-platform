const prisma = require('../config/database');
const { runCreditAssessment } = require('../services/scoringEngine');
const { generateReport } = require('../services/reportGenerator');
const llmService = require('../services/llmService');
const { encrypt } = require('../utils/encryption');

// POST /api/assessments/:borrowerId/run
exports.runAssessment = async (req, res, next) => {
  try {
    const { requestedLoanAmount, requestedTenureMonths, loanPurpose } = req.body;

    if (!requestedLoanAmount) {
      return res.status(400).json({ error: 'requestedLoanAmount is required' });
    }

    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    // Fetch all available data
    const [gstRecords, itrRecords, bankStatements] = await Promise.all([
      prisma.gSTData.findMany({
        where: { borrowerId: borrower.id },
        orderBy: { period: 'desc' },
      }),
      prisma.iTRData.findMany({
        where: { borrowerId: borrower.id },
        orderBy: { assessmentYear: 'desc' },
      }),
      prisma.bankStatementData.findMany({
        where: { borrowerId: borrower.id },
        orderBy: { fetchedAt: 'desc' },
        take: 1,
      }),
    ]);

    const bankData = bankStatements.length > 0 ? bankStatements[0] : null;

    // Run scoring engine
    const result = runCreditAssessment({
      borrower,
      gstRecords,
      itrRecords,
      bankData,
      requestedLoanAmount,
      requestedTenureMonths: requestedTenureMonths || 36,
      loanPurpose,
    });

    // Encrypt raw input data
    const rawInputRaw = {
      gstRecordCount: gstRecords.length,
      itrRecordCount: itrRecords.length,
      hasBankData: !!bankData,
      requestedLoanAmount,
      requestedTenureMonths,
    };
    const rawInputData = encrypt(rawInputRaw);

    // Run Generative AI (LLM) processing
    const { aiSummary, aiInsights } = await llmService.generateCreditMemo(rawInputRaw, result);

    // Save assessment
    const assessment = await prisma.creditAssessment.create({
      data: {
        borrowerId: borrower.id,
        firmId: req.firmId,
        createdById: req.user.userId,
        modelLayer: result.modelLayer,
        overallScore: result.overallScore,
        verdict: result.verdict,
        confidenceLevel: result.confidenceLevel,
        gstScore: result.gstScore,
        cashFlowScore: result.cashFlowScore,
        taxScore: result.taxScore,
        debtScore: result.debtScore,
        stabilityScore: result.stabilityScore,
        behavioralScore: result.behavioralScore,
        dscr: result.dscr,
        estimatedMonthlyIncome: result.estimatedMonthlyIncome,
        requestedLoanAmount,
        requestedTenureMonths: requestedTenureMonths || 36,
        loanPurpose,
        flags: result.flags,
        recommendations: result.recommendations,
        lenderMatches: result.lenderMatches,
        dataSourcesUsed: result.dataSourcesUsed,
        rawInputData,
        aiSummary,
        aiInsights,
      },
    });

    res.status(201).json(assessment);
  } catch (err) {
    next(err);
  }
};

// GET /api/assessments/:borrowerId
exports.getLatest = async (req, res, next) => {
  try {
    const assessment = await prisma.creditAssessment.findFirst({
      where: { borrowerId: req.params.borrowerId, firmId: req.firmId },
      orderBy: { createdAt: 'desc' },
      include: { borrower: { select: { name: true, pan: true, gstin: true, type: true } } },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'No assessment found for this borrower' });
    }

    res.json(assessment);
  } catch (err) {
    next(err);
  }
};

// GET /api/assessments/:borrowerId/history
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [assessments, total] = await Promise.all([
      prisma.creditAssessment.findMany({
        where: { borrowerId: req.params.borrowerId, firmId: req.firmId },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.creditAssessment.count({
        where: { borrowerId: req.params.borrowerId, firmId: req.firmId },
      }),
    ]);

    res.json({ data: assessments, total, page: pageNum, limit: limitNum });
  } catch (err) {
    next(err);
  }
};

// GET /api/assessments/:id/report
exports.getReport = async (req, res, next) => {
  try {
    const assessment = await prisma.creditAssessment.findFirst({
      where: { id: req.params.id, firmId: req.firmId },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (!assessment.reportUrl) {
      return res.status(404).json({ error: 'Report not yet generated' });
    }

    res.json({ reportUrl: assessment.reportUrl, generatedAt: assessment.reportGeneratedAt });
  } catch (err) {
    next(err);
  }
};

// POST /api/assessments/:id/generate-report
exports.generateReportForAssessment = async (req, res, next) => {
  try {
    const assessment = await prisma.creditAssessment.findFirst({
      where: { id: req.params.id, firmId: req.firmId },
      include: {
        borrower: true,
        firm: true,
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const { reportUrl, reportGeneratedAt } = await generateReport(
      assessment,
      assessment.borrower,
      assessment.firm,
    );

    await prisma.creditAssessment.update({
      where: { id: assessment.id },
      data: { reportUrl, reportGeneratedAt },
    });

    res.json({ reportUrl, reportGeneratedAt });
  } catch (err) {
    next(err);
  }
};

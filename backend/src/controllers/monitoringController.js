const prisma = require('../config/database');

// POST /api/monitoring/:assessmentId/start
exports.startMonitoring = async (req, res, next) => {
  try {
    const { lenderName, loanAmount, tenureMonths, loanDisbursedOn } = req.body;

    const assessment = await prisma.creditAssessment.findFirst({
      where: { id: req.params.assessmentId, firmId: req.firmId },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Get GST turnover at disbursement time
    const gstData = await prisma.gSTData.findMany({
      where: { borrowerId: assessment.borrowerId },
      orderBy: { period: 'desc' },
      take: 3,
    });
    const gstTurnoverAtDisbursement = gstData.length > 0
      ? gstData.reduce((s, r) => s + Number(r.turnover || 0), 0) / gstData.length
      : null;

    const monitor = await prisma.postDisbursementMonitor.create({
      data: {
        assessmentId: assessment.id,
        borrowerId: assessment.borrowerId,
        loanDisbursedOn: new Date(loanDisbursedOn || Date.now()),
        loanAmount: loanAmount || assessment.requestedLoanAmount,
        lenderName,
        tenureMonths: tenureMonths || assessment.requestedTenureMonths,
        gstTurnoverAtDisbursement,
        gstTurnoverCurrent: gstTurnoverAtDisbursement,
      },
    });

    res.status(201).json(monitor);
  } catch (err) {
    next(err);
  }
};

// GET /api/monitoring/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const monitors = await prisma.postDisbursementMonitor.findMany({
      where: {
        borrower: { firmId: req.firmId },
      },
      include: {
        borrower: { select: { name: true, pan: true, gstin: true, type: true } },
        assessment: { select: { overallScore: true, verdict: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total: monitors.length,
      active: monitors.filter(m => m.disbursementStatus === 'ACTIVE').length,
      critical: monitors.filter(m => m.riskFlag === 'CRITICAL').length,
      watch: monitors.filter(m => m.riskFlag === 'WATCH').length,
    };

    res.json({ stats, monitors });
  } catch (err) {
    next(err);
  }
};

// GET /api/monitoring/:id
exports.getById = async (req, res, next) => {
  try {
    const monitor = await prisma.postDisbursementMonitor.findFirst({
      where: { id: req.params.id, borrower: { firmId: req.firmId } },
      include: {
        borrower: true,
        assessment: true,
      },
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitoring record not found' });
    }

    res.json(monitor);
  } catch (err) {
    next(err);
  }
};

// PUT /api/monitoring/:id/update
exports.updateMonitor = async (req, res, next) => {
  try {
    const { lastEMIDate, emisMissed, emisOnTime, bankBalanceTrend, disbursementStatus } = req.body;

    const monitor = await prisma.postDisbursementMonitor.findFirst({
      where: { id: req.params.id, borrower: { firmId: req.firmId } },
    });

    if (!monitor) {
      return res.status(404).json({ error: 'Monitoring record not found' });
    }

    // Recalculate monitoring score
    const turnoverMaintained = monitor.gstTurnoverAtDisbursement && monitor.gstTurnoverCurrent
      ? Math.min(Number(monitor.gstTurnoverCurrent) / Number(monitor.gstTurnoverAtDisbursement), 1) * 100
      : 50;

    const balanceTrendScore = bankBalanceTrend === 'IMPROVING' ? 100 :
      bankBalanceTrend === 'STABLE' ? 70 : 30;

    const totalEMIs = (emisOnTime || monitor.emisOnTime) + (emisMissed || monitor.emisMissed);
    const emiOnTimeRate = totalEMIs > 0
      ? ((emisOnTime || monitor.emisOnTime) / totalEMIs) * 100
      : 100;

    const monitoringScore = turnoverMaintained * 0.40 + balanceTrendScore * 0.30 + emiOnTimeRate * 0.30;

    let riskFlag = 'NONE';
    if (monitoringScore < 40) riskFlag = 'CRITICAL';
    else if (monitoringScore < 60) riskFlag = 'WATCH';

    // Auto-assign outcome label at 6 months
    let outcomeLabel = monitor.outcomeLabel;
    if (!outcomeLabel) {
      const monthsSinceDisbursement = Math.floor(
        (Date.now() - new Date(monitor.loanDisbursedOn).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsSinceDisbursement >= 6) {
        if (monitoringScore >= 70) outcomeLabel = 'GOOD';
        else if (monitoringScore >= 40) outcomeLabel = 'DELAYED';
        else outcomeLabel = 'DEFAULTED';
      }
    }

    const updated = await prisma.postDisbursementMonitor.update({
      where: { id: monitor.id },
      data: {
        ...(lastEMIDate && { lastEMIDate: new Date(lastEMIDate) }),
        ...(emisMissed !== undefined && { emisMissed }),
        ...(emisOnTime !== undefined && { emisOnTime }),
        ...(bankBalanceTrend && { bankBalanceTrend }),
        ...(disbursementStatus && { disbursementStatus }),
        monitoringScore: Math.round(monitoringScore),
        riskFlag,
        outcomeLabel,
        lastCheckedAt: new Date(),
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/monitoring/bulk-check
exports.bulkCheck = async (req, res, next) => {
  try {
    const activeMonitors = await prisma.postDisbursementMonitor.findMany({
      where: { disbursementStatus: 'ACTIVE', borrower: { firmId: req.firmId } },
      include: { borrower: true },
    });

    let updated = 0;
    for (const monitor of activeMonitors) {
      // Re-fetch GST data if available
      const latestGST = await prisma.gSTData.findMany({
        where: { borrowerId: monitor.borrowerId },
        orderBy: { period: 'desc' },
        take: 3,
      });

      const gstTurnoverCurrent = latestGST.length > 0
        ? latestGST.reduce((s, r) => s + Number(r.turnover || 0), 0) / latestGST.length
        : null;

      if (gstTurnoverCurrent !== null) {
        await prisma.postDisbursementMonitor.update({
          where: { id: monitor.id },
          data: { gstTurnoverCurrent, lastCheckedAt: new Date() },
        });
        updated++;
      }
    }

    res.json({ message: `Bulk check complete. Updated ${updated} of ${activeMonitors.length} monitors.` });
  } catch (err) {
    next(err);
  }
};

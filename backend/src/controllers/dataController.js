const prisma = require('../config/database');
const { fetchGSTData } = require('../services/gstService');
const { parseBankStatement } = require('../services/bankParser');
const { uploadBlob, deleteBlob } = require('../services/storageService');

// POST /api/data/:borrowerId/sync-gst
exports.syncGST = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    if (!borrower.gstin) {
      return res.status(400).json({ error: 'Borrower has no GSTIN registered' });
    }

    // Check consent
    if (borrower.consentStatus !== 'ACTIVE') {
      return res.status(403).json({ error: 'Active consent required for GST data sync' });
    }

    const gstRecords = await fetchGSTData(borrower.gstin);

    // Upsert records
    const upserted = [];
    for (const record of gstRecords) {
      const result = await prisma.gSTData.upsert({
        where: {
          borrowerId_period_returnType: {
            borrowerId: borrower.id,
            period: record.period,
            returnType: record.returnType,
          },
        },
        update: {
          filingStatus: record.filingStatus,
          filedOn: record.filedOn,
          turnover: record.turnover,
          itcClaimed: record.itcClaimed,
          itcEligible: record.itcEligible,
          taxLiability: record.taxLiability,
          fetchedAt: new Date(),
        },
        create: {
          borrowerId: borrower.id,
          gstin: record.gstin,
          period: record.period,
          returnType: record.returnType,
          filingStatus: record.filingStatus,
          filedOn: record.filedOn,
          dueDate: record.dueDate,
          turnover: record.turnover,
          itcClaimed: record.itcClaimed,
          itcEligible: record.itcEligible,
          taxLiability: record.taxLiability,
          source: record.source,
        },
      });
      upserted.push(result);
    }

    res.json({
      message: `Synced ${upserted.length} GST records`,
      records: upserted.length,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/data/:borrowerId/upload-itr
exports.uploadITR = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'PDF file required' });
    }

    // Archive raw document for Phase 2 ML Training
    try {
      await uploadBlob('itr', `borrower_${borrower.id}_${Date.now()}_${req.file.originalname || 'doc.pdf'}`, req.file.buffer, req.file.mimetype);
    } catch (e) {
      console.warn('[ML Archival] Failed to save raw ITR document:', e.message);
    }

    // Parse PDF
    let extractedData = {};
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer);
      const text = data.text;

      // Extract fields using regex
      const ayMatch = text.match(/Assessment Year[:\s]*(\d{4}-\d{2})/i);
      const incomeMatch = text.match(/Gross Total Income[:\s]*[\u20B9,]*\s*([\d,]+)/i);
      const taxMatch = text.match(/Tax Paid[:\s]*[\u20B9,]*\s*([\d,]+)/i);
      const panMatch = text.match(/PAN[:\s]*([A-Z]{5}\d{4}[A-Z])/i);

      extractedData = {
        assessmentYear: ayMatch ? ayMatch[1] : `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(2)}`,
        grossIncome: incomeMatch ? parseFloat(incomeMatch[1].replace(/,/g, '')) : 0,
        taxPaid: taxMatch ? parseFloat(taxMatch[1].replace(/,/g, '')) : 0,
        pan: panMatch ? panMatch[1] : borrower.pan,
      };
    } catch (parseErr) {
      console.warn('[ITR] Parse failed, using manual defaults:', parseErr.message);
      extractedData = {
        assessmentYear: req.body.assessmentYear || `${new Date().getFullYear() - 1}-${String(new Date().getFullYear()).slice(2)}`,
        grossIncome: parseFloat(req.body.grossIncome || 0),
        taxPaid: parseFloat(req.body.taxPaid || 0),
        pan: borrower.pan,
      };
    }

    const itrRecord = await prisma.iTRData.upsert({
      where: {
        borrowerId_assessmentYear: {
          borrowerId: borrower.id,
          assessmentYear: extractedData.assessmentYear,
        },
      },
      update: {
        grossIncome: extractedData.grossIncome,
        taxableIncome: extractedData.grossIncome * 0.8, // rough estimate
        taxPaid: extractedData.taxPaid,
        filingStatus: 'FILED',
        filedOn: new Date(),
        fetchedAt: new Date(),
        source: 'PDF_UPLOAD',
      },
      create: {
        borrowerId: borrower.id,
        pan: extractedData.pan,
        assessmentYear: extractedData.assessmentYear,
        filingStatus: 'FILED',
        filedOn: new Date(),
        grossIncome: extractedData.grossIncome,
        taxableIncome: extractedData.grossIncome * 0.8,
        taxPaid: extractedData.taxPaid,
        source: 'PDF_UPLOAD',
      },
    });

    res.json({ message: 'ITR data uploaded and parsed', data: itrRecord });
  } catch (err) {
    next(err);
  }
};

// POST /api/data/:borrowerId/upload-bank-statement
exports.uploadBankStatement = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File required' });
    }

    const metrics = await parseBankStatement(req.file.buffer, req.file.mimetype);

    // Archive raw document for Phase 2 ML Training
    try {
      await uploadBlob('bank', `borrower_${borrower.id}_${Date.now()}_${req.file.originalname || 'stmt.csv'}`, req.file.buffer, req.file.mimetype);
    } catch (e) {
      console.warn('[ML Archival] Failed to save raw bank statement:', e.message);
    }

    const bankName = req.body.bankName || 'Unknown Bank';
    const accountNumber = req.body.accountNumber || '****';

    const bankData = await prisma.bankStatementData.create({
      data: {
        borrowerId: borrower.id,
        bankName,
        accountNumber: accountNumber.slice(-4),
        periodFrom: new Date(req.body.periodFrom || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)),
        periodTo: new Date(req.body.periodTo || new Date()),
        avgMonthlyBalance: metrics.avgMonthlyBalance,
        avgMonthlyInflow: metrics.avgMonthlyInflow,
        avgMonthlyOutflow: metrics.avgMonthlyOutflow,
        bounceCount: metrics.bounceCount,
        salaryDetected: metrics.salaryDetected,
        estimatedSalary: metrics.estimatedSalary,
        detectedEMIs: metrics.detectedEMIs,
        totalEMIBurden: metrics.totalEMIBurden,
        inflowConsistencyScore: metrics.inflowConsistencyScore,
        rawTransactionCount: metrics.rawTransactionCount,
        source: 'PDF_UPLOAD',
      },
    });

    res.json({ message: 'Bank statement uploaded and parsed', data: bankData });
  } catch (err) {
    next(err);
  }
};

// POST /api/data/:borrowerId/manual-entry
exports.manualEntry = async (req, res, next) => {
  try {
    const borrower = await prisma.borrower.findFirst({
      where: { id: req.params.borrowerId, firmId: req.firmId, isDeleted: false },
    });

    if (!borrower) {
      return res.status(404).json({ error: 'Borrower not found' });
    }

    const { dataType, data } = req.body;
    let result;

    switch (dataType) {
      case 'GST':
        result = await prisma.gSTData.create({
          data: {
            borrowerId: borrower.id,
            gstin: data.gstin || borrower.gstin || 'MANUAL',
            period: data.period,
            returnType: data.returnType || 'GSTR3B',
            filingStatus: data.filingStatus || 'FILED',
            turnover: data.turnover || 0,
            itcClaimed: data.itcClaimed || 0,
            itcEligible: data.itcEligible || 0,
            taxLiability: data.taxLiability || 0,
            source: 'MANUAL',
          },
        });
        break;

      case 'ITR':
        result = await prisma.iTRData.create({
          data: {
            borrowerId: borrower.id,
            pan: borrower.pan,
            assessmentYear: data.assessmentYear,
            filingStatus: data.filingStatus || 'FILED',
            grossIncome: data.grossIncome || 0,
            taxableIncome: data.taxableIncome || 0,
            taxPaid: data.taxPaid || 0,
            incomeSource: data.incomeSource || 'BUSINESS',
            source: 'MANUAL',
          },
        });
        break;

      case 'BANK':
        result = await prisma.bankStatementData.create({
          data: {
            borrowerId: borrower.id,
            bankName: data.bankName || 'Manual Entry',
            accountNumber: data.accountNumber || '0000',
            periodFrom: new Date(data.periodFrom),
            periodTo: new Date(data.periodTo),
            avgMonthlyBalance: data.avgMonthlyBalance || 0,
            avgMonthlyInflow: data.avgMonthlyInflow || 0,
            avgMonthlyOutflow: data.avgMonthlyOutflow || 0,
            bounceCount: data.bounceCount || 0,
            salaryDetected: data.salaryDetected || false,
            estimatedSalary: data.estimatedSalary || null,
            totalEMIBurden: data.totalEMIBurden || 0,
            inflowConsistencyScore: data.inflowConsistencyScore || 50,
            source: 'MANUAL',
          },
        });
        break;

      default:
        return res.status(400).json({ error: 'Invalid dataType. Use GST, ITR, or BANK.' });
    }

    res.json({ message: `${dataType} data saved (manual entry)`, data: result });
  } catch (err) {
    next(err);
  }
};

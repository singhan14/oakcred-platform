const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding OakCred database...\n');

  // 1. Create Firm
  const firm = await prisma.firm.create({
    data: {
      name: 'OakCred Finance',
      type: 'CA_FIRM',
      icaiNumber: '123456',
      city: 'Bangalore',
      state: 'Karnataka',
      email: 'firm@oakcred.com',
      phone: '+919876543210',
      subscriptionPlan: 'PRACTICE',
      subscriptionStatus: 'ACTIVE',
      subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Created firm:', firm.name);

  // 2. Create Admin User
  const hashedPassword = await bcrypt.hash('OakCred@2026', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'singhan@oakcred.com',
      password: hashedPassword,
      name: 'Singhan Yadav',
      role: 'CA_ADMIN',
      firmId: firm.id,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // 2.5 Create Super Admin User
  const superAdminPassword = await bcrypt.hash('OakCredAdmin2026!', 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@oakcred.com' },
    update: {
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      firmId: firm.id,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: 'admin@oakcred.com',
      password: superAdminPassword,
      name: 'OakCred Super Admin',
      role: 'SUPER_ADMIN',
      firmId: firm.id,
      isVerified: true,
      isActive: true,
    },
  });
  console.log('✅ Created super admin:', superAdmin.email);

  // 3. Create Subscription
  await prisma.subscription.create({
    data: {
      firmId: firm.id,
      plan: 'PRACTICE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assessmentLimit: 100,
    },
  });

  // 4. Create 6 Borrowers (3 MSME + 3 Individual)
  const borrowers = [];

  const msmeData = [
    { name: 'Priya Textiles Pvt Ltd', type: 'MSME', gstin: '29AABCT1234F1Z5', pan: 'AABCT1234F', udyamNumber: 'UDYAM-KA-29-0012345', businessName: 'Priya Textiles', industry: 'Textile', city: 'Bangalore', state: 'Karnataka', phone: '+919876543211', email: 'priya@textiles.com' },
    { name: 'Green Agro Solutions', type: 'MSME', gstin: '29BBGAA5678H1Z3', pan: 'BBGAA5678H', udyamNumber: 'UDYAM-KA-29-0067890', businessName: 'Green Agro', industry: 'Agriculture', city: 'Mysore', state: 'Karnataka', phone: '+919876543212', email: 'info@greenagro.com' },
    { name: 'TechServe IT Solutions', type: 'MSME', gstin: '29CCTTS9012J1Z1', pan: 'CCTTS9012J', udyamNumber: 'UDYAM-KA-29-0098765', businessName: 'TechServe IT', industry: 'IT', city: 'Bangalore', state: 'Karnataka', phone: '+919876543213', email: 'contact@techserve.in' },
  ];

  const individualData = [
    { name: 'Rajesh Kumar', type: 'INDIVIDUAL', pan: 'ABCPK1234L', industry: 'Retail', city: 'Chennai', state: 'Tamil Nadu', phone: '+919876543214', email: 'rajesh@gmail.com' },
    { name: 'Meera Sharma', type: 'INDIVIDUAL', pan: 'DEFPS5678M', industry: 'Healthcare', city: 'Mumbai', state: 'Maharashtra', phone: '+919876543215', email: 'meera@gmail.com' },
    { name: 'Arjun Patel', type: 'INDIVIDUAL', pan: 'GHIAP9012N', industry: 'FMCG', city: 'Ahmedabad', state: 'Gujarat', phone: '+919876543216', email: 'arjun@gmail.com' },
  ];

  for (const data of [...msmeData, ...individualData]) {
    const borrower = await prisma.borrower.create({
      data: {
        firmId: firm.id,
        createdById: admin.id,
        consentStatus: 'ACTIVE',
        consentExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        consentDataTypes: ['GST', 'ITR', 'BANK_STATEMENT'],
        ...data,
      },
    });
    borrowers.push(borrower);
    console.log(`✅ Created borrower: ${borrower.name} (${borrower.type})`);
  }

  // 5. Create 24 months GST data per MSME borrower
  for (const borrower of borrowers.filter(b => b.type === 'MSME')) {
    const baseTurnover = 500000 + Math.random() * 2000000;
    for (let i = 0; i < 24; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      const seasonalMultiplier = 1 + 0.15 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const turnover = Math.round(baseTurnover * seasonalMultiplier * (0.9 + Math.random() * 0.2));
      const itcEligible = Math.round(turnover * 0.18 * 0.7);
      const itcClaimed = Math.round(itcEligible * (0.95 + Math.random() * 0.08));

      const filingRand = Math.random();
      let filingStatus = 'FILED';
      let filedOn = new Date(date.getFullYear(), date.getMonth() + 1, 10 + Math.floor(Math.random() * 10));

      if (filingRand > 0.92 && i > 8) {
        filingStatus = 'NOT_FILED';
        filedOn = null;
      } else if (filingRand > 0.82) {
        filingStatus = 'LATE_FILED';
        filedOn = new Date(date.getFullYear(), date.getMonth() + 2, Math.floor(Math.random() * 20) + 1);
      }

      await prisma.gSTData.create({
        data: {
          borrowerId: borrower.id,
          gstin: borrower.gstin,
          period,
          returnType: 'GSTR3B',
          filingStatus,
          filedOn,
          dueDate: new Date(date.getFullYear(), date.getMonth() + 1, 20),
          turnover,
          itcClaimed,
          itcEligible,
          taxLiability: Math.max(0, Math.round(turnover * 0.18 - itcClaimed)),
          source: 'API',
        },
      });
    }
    console.log(`✅ Created 24 months GST data for ${borrower.name}`);
  }

  // 6. Create 3 years ITR data per borrower
  for (const borrower of borrowers) {
    const baseIncome = borrower.type === 'MSME' ? 2000000 + Math.random() * 5000000 : 500000 + Math.random() * 1500000;

    for (let year = 0; year < 3; year++) {
      const currentYear = new Date().getFullYear() - year;
      const assessmentYear = `${currentYear - 1}-${String(currentYear).slice(2)}`;
      const growthFactor = 1 + (2 - year) * 0.08;
      const income = Math.round(baseIncome * growthFactor);

      await prisma.iTRData.create({
        data: {
          borrowerId: borrower.id,
          pan: borrower.pan,
          assessmentYear,
          filingStatus: 'FILED',
          filedOn: new Date(currentYear, 6, 15 + Math.floor(Math.random() * 30)),
          grossIncome: income,
          taxableIncome: Math.round(income * 0.8),
          taxPaid: Math.round(income * 0.15),
          incomeSource: borrower.type === 'MSME' ? 'BUSINESS' : 'SALARY',
          source: 'API',
        },
      });
    }
    console.log(`✅ Created 3 years ITR data for ${borrower.name}`);
  }

  // 7. Create bank statement data for all borrowers
  for (const borrower of borrowers) {
    const avgBalance = borrower.type === 'MSME' ? 300000 + Math.random() * 700000 : 80000 + Math.random() * 200000;
    const avgInflow = borrower.type === 'MSME' ? 500000 + Math.random() * 1500000 : 60000 + Math.random() * 100000;

    await prisma.bankStatementData.create({
      data: {
        borrowerId: borrower.id,
        bankName: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'][Math.floor(Math.random() * 4)],
        accountNumber: String(Math.floor(1000 + Math.random() * 9000)),
        periodFrom: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
        periodTo: new Date(),
        avgMonthlyBalance: Math.round(avgBalance),
        avgMonthlyInflow: Math.round(avgInflow),
        avgMonthlyOutflow: Math.round(avgInflow * (0.65 + Math.random() * 0.25)),
        bounceCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0,
        salaryDetected: borrower.type === 'INDIVIDUAL',
        estimatedSalary: borrower.type === 'INDIVIDUAL' ? Math.round(50000 + Math.random() * 100000) : null,
        detectedEMIs: [{ amount: Math.round(10000 + Math.random() * 20000), frequency: 'MONTHLY', count: 6 }],
        totalEMIBurden: Math.round(10000 + Math.random() * 20000),
        inflowConsistencyScore: Math.round(55 + Math.random() * 40),
        rawTransactionCount: Math.floor(150 + Math.random() * 200),
        source: 'PDF_UPLOAD',
      },
    });
    console.log(`✅ Created bank statement data for ${borrower.name}`);
  }

  // 8. Create 6 Credit Assessments
  const verdicts = ['LOAN_READY', 'LOAN_READY', 'CONDITIONALLY_READY', 'CONDITIONALLY_READY', 'NOT_READY', 'NOT_READY'];

  for (let i = 0; i < 6; i++) {
    const borrower = borrowers[i];
    const scores = {
      LOAN_READY: { overall: 78 + Math.random() * 15, gst: 82, cashFlow: 75, tax: 80, debt: 70, stability: 72 },
      CONDITIONALLY_READY: { overall: 62 + Math.random() * 10, gst: 65, cashFlow: 60, tax: 62, debt: 55, stability: 65 },
      NOT_READY: { overall: 30 + Math.random() * 12, gst: 35, cashFlow: 30, tax: 28, debt: 25, stability: 40 },
    };

    const s = scores[verdicts[i]];

    await prisma.creditAssessment.create({
      data: {
        borrowerId: borrower.id,
        firmId: firm.id,
        createdById: admin.id,
        modelLayer: borrower.type === 'MSME' ? 'LAYER1' : 'LAYER2',
        overallScore: Math.round(s.overall),
        verdict: verdicts[i],
        confidenceLevel: borrower.type === 'MSME' ? 'HIGH' : 'MEDIUM',
        gstScore: s.gst,
        cashFlowScore: s.cashFlow,
        taxScore: s.tax,
        debtScore: s.debt,
        stabilityScore: s.stability,
        dscr: 1.0 + Math.random() * 1.5,
        estimatedMonthlyIncome: 100000 + Math.random() * 400000,
        requestedLoanAmount: 500000 + Math.random() * 4500000,
        requestedTenureMonths: [12, 24, 36, 48][Math.floor(Math.random() * 4)],
        loanPurpose: ['Working Capital', 'Equipment Purchase', 'Business Expansion', 'Personal'][Math.floor(Math.random() * 4)],
        flags: verdicts[i] === 'NOT_READY'
          ? [{ severity: 'HIGH', message: 'Low DSCR', suggestion: 'Reduce loan amount' }]
          : [],
        lenderMatches: verdicts[i] === 'LOAN_READY'
          ? [{ lenderName: 'HDFC Bank MSME', productType: 'Business Loan', maxAmount: 5000000, rate: '12-16%' }]
          : [],
        dataSourcesUsed: { gst: { count: 24 }, itr: { count: 3 }, bank: { count: 1 } },
      },
    });
    console.log(`✅ Created assessment for ${borrower.name}: ${verdicts[i]}`);
  }

  // 9. Create 2 Post-Disbursement Monitor records
  const loanReadyAssessments = await prisma.creditAssessment.findMany({
    where: { verdict: 'LOAN_READY' },
    take: 2,
  });

  if (loanReadyAssessments.length >= 2) {
    await prisma.postDisbursementMonitor.create({
      data: {
        assessmentId: loanReadyAssessments[0].id,
        borrowerId: loanReadyAssessments[0].borrowerId,
        loanDisbursedOn: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        loanAmount: loanReadyAssessments[0].requestedLoanAmount,
        lenderName: 'HDFC Bank',
        tenureMonths: 36,
        disbursementStatus: 'ACTIVE',
        emisOnTime: 3,
        emisMissed: 0,
        monitoringScore: 85,
        riskFlag: 'NONE',
        bankBalanceTrend: 'STABLE',
        lastCheckedAt: new Date(),
      },
    });
    console.log('✅ Created monitor record: GOOD status');

    await prisma.postDisbursementMonitor.create({
      data: {
        assessmentId: loanReadyAssessments[1].id,
        borrowerId: loanReadyAssessments[1].borrowerId,
        loanDisbursedOn: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        loanAmount: loanReadyAssessments[1].requestedLoanAmount,
        lenderName: 'Bajaj Finserv',
        tenureMonths: 24,
        disbursementStatus: 'ACTIVE',
        emisOnTime: 2,
        emisMissed: 2,
        monitoringScore: 52,
        riskFlag: 'WATCH',
        bankBalanceTrend: 'DECLINING',
        lastCheckedAt: new Date(),
      },
    });
    console.log('✅ Created monitor record: WATCH status');
  }

  console.log('\n🎉 Seed complete!\n');
  console.log('Admin credentials:');
  console.log('  Email:    singhan@oakcred.com');
  console.log('  Password: OakCred@2026\n');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CA_ADMIN', 'CA_STAFF', 'LENDER_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "FirmType" AS ENUM ('CA_FIRM', 'LENDER');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'PRACTICE', 'ENTERPRISE', 'TRIAL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRIAL', 'HALTED');

-- CreateEnum
CREATE TYPE "BorrowerType" AS ENUM ('MSME', 'INDIVIDUAL', 'PARTNERSHIP');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ModelLayer" AS ENUM ('LAYER1', 'LAYER2', 'LAYER3');

-- CreateEnum
CREATE TYPE "Verdict" AS ENUM ('LOAN_READY', 'CONDITIONALLY_READY', 'UNDER_REVIEW', 'NOT_READY');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "FilingStatus" AS ENUM ('FILED', 'NOT_FILED', 'LATE_FILED');

-- CreateEnum
CREATE TYPE "ReturnType" AS ENUM ('GSTR1', 'GSTR3B');

-- CreateEnum
CREATE TYPE "ITRFilingStatus" AS ENUM ('FILED', 'NOT_FILED');

-- CreateEnum
CREATE TYPE "IncomeSource" AS ENUM ('SALARY', 'BUSINESS', 'BOTH');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('API', 'MANUAL', 'PDF_UPLOAD', 'AA_FRAMEWORK');

-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DEFAULTED', 'RESTRUCTURED');

-- CreateEnum
CREATE TYPE "BankBalanceTrend" AS ENUM ('IMPROVING', 'STABLE', 'DECLINING');

-- CreateEnum
CREATE TYPE "RiskFlag" AS ENUM ('NONE', 'WATCH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OutcomeLabel" AS ENUM ('GOOD', 'DELAYED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "ConsentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CA_STAFF',
    "firmId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "verificationToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "FirmType" NOT NULL DEFAULT 'CA_FIRM',
    "gstin" TEXT,
    "pan" TEXT,
    "icaiNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "subscriptionExpiry" TIMESTAMP(3),
    "razorpayCustomerId" TEXT,
    "razorpaySubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Borrower" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BorrowerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "gstin" TEXT,
    "pan" TEXT NOT NULL,
    "udyamNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "businessName" TEXT,
    "industry" TEXT,
    "city" TEXT,
    "state" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'PENDING',
    "consentToken" TEXT,
    "consentExpiry" TIMESTAMP(3),
    "consentDataTypes" JSONB,
    "createdById" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Borrower_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditAssessment" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "modelLayer" "ModelLayer" NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "verdict" "Verdict" NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "gstScore" DOUBLE PRECISION,
    "cashFlowScore" DOUBLE PRECISION,
    "taxScore" DOUBLE PRECISION,
    "debtScore" DOUBLE PRECISION,
    "stabilityScore" DOUBLE PRECISION,
    "behavioralScore" DOUBLE PRECISION,
    "dscr" DECIMAL(65,30),
    "estimatedMonthlyIncome" DECIMAL(65,30),
    "requestedLoanAmount" DECIMAL(65,30) NOT NULL,
    "requestedTenureMonths" INTEGER NOT NULL,
    "loanPurpose" TEXT,
    "flags" JSONB,
    "recommendations" JSONB,
    "lenderMatches" JSONB,
    "reportUrl" TEXT,
    "reportGeneratedAt" TIMESTAMP(3),
    "dataSourcesUsed" JSONB,
    "rawInputData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GSTData" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "returnType" "ReturnType" NOT NULL,
    "filingStatus" "FilingStatus" NOT NULL,
    "filedOn" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "turnover" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "itcClaimed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "itcEligible" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxLiability" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DataSource" NOT NULL DEFAULT 'API',

    CONSTRAINT "GSTData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ITRData" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "assessmentYear" TEXT NOT NULL,
    "filingStatus" "ITRFilingStatus" NOT NULL,
    "filedOn" TIMESTAMP(3),
    "grossIncome" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxableIncome" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "taxPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "refundAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "incomeSource" "IncomeSource" NOT NULL DEFAULT 'BUSINESS',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DataSource" NOT NULL DEFAULT 'PDF_UPLOAD',

    CONSTRAINT "ITRData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankStatementData" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "periodFrom" TIMESTAMP(3) NOT NULL,
    "periodTo" TIMESTAMP(3) NOT NULL,
    "avgMonthlyBalance" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "avgMonthlyInflow" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "avgMonthlyOutflow" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "salaryDetected" BOOLEAN NOT NULL DEFAULT false,
    "estimatedSalary" DECIMAL(65,30),
    "detectedEMIs" JSONB,
    "totalEMIBurden" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "inflowConsistencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rawTransactionCount" INTEGER NOT NULL DEFAULT 0,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" "DataSource" NOT NULL DEFAULT 'PDF_UPLOAD',

    CONSTRAINT "BankStatementData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostDisbursementMonitor" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "loanDisbursedOn" TIMESTAMP(3) NOT NULL,
    "loanAmount" DECIMAL(65,30) NOT NULL,
    "lenderName" TEXT NOT NULL,
    "tenureMonths" INTEGER NOT NULL,
    "disbursementStatus" "DisbursementStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastEMIDate" TIMESTAMP(3),
    "emisMissed" INTEGER NOT NULL DEFAULT 0,
    "emisOnTime" INTEGER NOT NULL DEFAULT 0,
    "gstTurnoverAtDisbursement" DECIMAL(65,30),
    "gstTurnoverCurrent" DECIMAL(65,30),
    "bankBalanceTrend" "BankBalanceTrend" NOT NULL DEFAULT 'STABLE',
    "monitoringScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "riskFlag" "RiskFlag" NOT NULL DEFAULT 'NONE',
    "outcomeLabel" "OutcomeLabel",
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostDisbursementMonitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "razorpaySubId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "assessmentsUsedThisPeriod" INTEGER NOT NULL DEFAULT 0,
    "assessmentLimit" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "firmId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRequest" (
    "id" TEXT NOT NULL,
    "borrowerId" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "dataTypes" JSONB NOT NULL,
    "validityDays" INTEGER NOT NULL DEFAULT 365,
    "status" "ConsentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_firmId_idx" ON "User"("firmId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Borrower_consentToken_key" ON "Borrower"("consentToken");

-- CreateIndex
CREATE INDEX "Borrower_firmId_idx" ON "Borrower"("firmId");

-- CreateIndex
CREATE INDEX "Borrower_pan_idx" ON "Borrower"("pan");

-- CreateIndex
CREATE INDEX "Borrower_gstin_idx" ON "Borrower"("gstin");

-- CreateIndex
CREATE INDEX "CreditAssessment_borrowerId_idx" ON "CreditAssessment"("borrowerId");

-- CreateIndex
CREATE INDEX "CreditAssessment_firmId_idx" ON "CreditAssessment"("firmId");

-- CreateIndex
CREATE INDEX "GSTData_borrowerId_idx" ON "GSTData"("borrowerId");

-- CreateIndex
CREATE UNIQUE INDEX "GSTData_borrowerId_period_returnType_key" ON "GSTData"("borrowerId", "period", "returnType");

-- CreateIndex
CREATE INDEX "ITRData_borrowerId_idx" ON "ITRData"("borrowerId");

-- CreateIndex
CREATE UNIQUE INDEX "ITRData_borrowerId_assessmentYear_key" ON "ITRData"("borrowerId", "assessmentYear");

-- CreateIndex
CREATE INDEX "BankStatementData_borrowerId_idx" ON "BankStatementData"("borrowerId");

-- CreateIndex
CREATE INDEX "PostDisbursementMonitor_borrowerId_idx" ON "PostDisbursementMonitor"("borrowerId");

-- CreateIndex
CREATE INDEX "PostDisbursementMonitor_assessmentId_idx" ON "PostDisbursementMonitor"("assessmentId");

-- CreateIndex
CREATE INDEX "Subscription_firmId_idx" ON "Subscription"("firmId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_firmId_idx" ON "AuditLog"("firmId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentRequest_token_key" ON "ConsentRequest"("token");

-- CreateIndex
CREATE INDEX "ConsentRequest_borrowerId_idx" ON "ConsentRequest"("borrowerId");

-- CreateIndex
CREATE INDEX "ConsentRequest_token_idx" ON "ConsentRequest"("token");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrower" ADD CONSTRAINT "Borrower_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrower" ADD CONSTRAINT "Borrower_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAssessment" ADD CONSTRAINT "CreditAssessment_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAssessment" ADD CONSTRAINT "CreditAssessment_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditAssessment" ADD CONSTRAINT "CreditAssessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GSTData" ADD CONSTRAINT "GSTData_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ITRData" ADD CONSTRAINT "ITRData_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatementData" ADD CONSTRAINT "BankStatementData_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDisbursementMonitor" ADD CONSTRAINT "PostDisbursementMonitor_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "CreditAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDisbursementMonitor" ADD CONSTRAINT "PostDisbursementMonitor_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_borrowerId_fkey" FOREIGN KEY ("borrowerId") REFERENCES "Borrower"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRequest" ADD CONSTRAINT "ConsentRequest_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

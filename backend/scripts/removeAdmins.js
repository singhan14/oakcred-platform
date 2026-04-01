const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeAdmins() {
  console.log('🔄 Cleaning up database to allow fresh signup...');

  try {
    const dummyFirm = await prisma.firm.create({
      data: { name: 'Dummy Firm', email: 'dummy@oakcred.com' }
    });

    const dummyUser = await prisma.user.create({
      data: { email: 'dummy_holder@oakcred.com', name: 'Placeholder', password: 'xyz', role: 'CA_STAFF', firmId: dummyFirm.id }
    });

    await prisma.borrower.updateMany({
      where: { createdBy: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } } },
      data: { createdById: dummyUser.id }
    });

    await prisma.creditAssessment.updateMany({
      where: { createdBy: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } } },
      data: { createdById: dummyUser.id }
    });

    await prisma.user.deleteMany({
      where: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } }
    });

    console.log('✅ Successfully removed singhan@oakcred.com and admin@oakcred.com!');
    console.log('🚀 You are now ready to freely create your account from the portal! Use the OTP printed in your terminal.');
  } catch(e) {
    if (e.code === 'P2002') { // already ran and dummy exists
      const dummyUser = await prisma.user.findUnique({where: {email: 'dummy_holder@oakcred.com'}});
      
      await prisma.borrower.updateMany({
        where: { createdBy: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } } },
        data: { createdById: dummyUser.id }
      });
  
      await prisma.creditAssessment.updateMany({
        where: { createdBy: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } } },
        data: { createdById: dummyUser.id }
      });
  
      await prisma.user.deleteMany({
        where: { email: { in: ['singhan@oakcred.com', 'admin@oakcred.com'] } }
      });
      console.log('✅ Admins removed! You can now sign up.');
    } else {
      console.error(e);
    }
  }

  await prisma.$disconnect();
}

removeAdmins();

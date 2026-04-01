const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function updateAccounts() {
  console.log("Overwriting demo account to preserve seeded portfolio data...");
  const hashedPassword = await bcrypt.hash('OakCred@2026', 12);
  
  try {
    const admin = await prisma.user.update({
      where: { email: 'demo@oakcred.com' },
      data: {
        email: 'singhan@oakcred.com',
        password: hashedPassword,
        name: 'Singhan Yadav'
      }
    });

    console.log('✅ Updated admin user:', admin.email);
    console.log('✅ Temporary Password: OakCred@2026');
  } catch (e) {
    if (e.code === 'P2025') {
       console.log('✅ User already migrated to singhan@oakcred.com');
    } else {
       throw e;
    }
  }
}

updateAccounts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

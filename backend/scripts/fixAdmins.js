const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixAdmins() {
  console.log('Fixing master admin passwords...');
  
  // 1. Fix singhan@oakcred.com
  try {
    const hashedPassword1 = await bcrypt.hash('OakCred@2026', 12);
    await prisma.user.update({
      where: { email: 'singhan@oakcred.com' },
      data: { password: hashedPassword1, isVerified: true, isActive: true }
    });
    console.log('✅ Updated singhan@oakcred.com');
  } catch (err) {
    console.log('⚠️ Could not update singhan@oakcred.com:', err.message);
  }

  // 2. Fix admin@oakcred.com
  try {
    const hashedPassword2 = await bcrypt.hash('OakCredAdmin2026!', 12);
    await prisma.user.update({
      where: { email: 'admin@oakcred.com' },
      data: { password: hashedPassword2, isVerified: true, isActive: true }
    });
    console.log('✅ Updated admin@oakcred.com');
  } catch (err) {
    console.log('⚠️ Could not update admin@oakcred.com:', err.message);
  }

  console.log('Done!');
  await prisma.$disconnect();
}

fixAdmins();

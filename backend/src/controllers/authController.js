const prisma = require('../config/database');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const ssoLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' });
    }

    // 1. Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      console.error('[SSO] Supabase validation failed:', error?.message);
      return res.status(401).json({ error: 'Invalid Supabase token' });
    }

    // 2. Check if user exists in local DB
    let localUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { firm: true }
    });

    // 3. Automated Onboarding for New Users
    if (!localUser) {
      console.log(`[ONBOARDING] New user detected: ${user.email}. Creating workspace...`);
      
      const firstName = user.user_metadata?.full_name?.split(' ')[0] || 'New';
      const firmName = `${firstName}'s Workspace`;

      // Create Firm and User in a transaction
      localUser = await prisma.$transaction(async (tx) => {
        const newFirm = await tx.firm.create({
          data: {
            name: firmName,
            status: 'ACTIVE'
          }
        });

        return await tx.user.create({
          data: {
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            role: 'ADMIN',
            firmId: newFirm.id,
            authId: user.id // Supabase Auth ID
          },
          include: { firm: true }
        });
      });
    }

    // 4. Generate local application JWT
    const token = jwt.sign(
      { userId: localUser.id, firmId: localUser.firmId, role: localUser.role },
      process.env.JWT_SECRET || 'oakcred_secret_2026',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: localUser.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
        firm: localUser.firm
      }
    });

  } catch (err) {
    console.error('[SSO] Login Error:', err);
    res.status(500).json({ error: 'SSO Authentication failed' });
  }
};

module.exports = { ssoLogin };

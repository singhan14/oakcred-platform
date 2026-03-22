const app = require('./app');
const config = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║         CreditIQ API Server                   ║
  ║─────────────────────────────────────────────── ║
  ║  Port:        ${String(PORT).padEnd(32)}║
  ║  Environment: ${config.nodeEnv.padEnd(32)}║
  ║  Health:      http://localhost:${PORT}/api/health  ║
  ╚═══════════════════════════════════════════════╝
  `);
});

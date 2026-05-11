const express = require('express');
const cors = require('cors');
const config = require('./config');

const nappesService = require('./services/service_nappes');
const qualiteService = require('./services/service_qualite');
const vigicruesService = require('./services/service_vigicrues');
const meteoService = require('./services/service_meteo');
const iccproService = require('./services/iccpro/service_iccpro');

const fs = require('fs');
const path = require('path');

// =====================================================
// 📁 LOG FILE
// =====================================================
const logFile = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// 🔥 override console.log (safe version)
console.log = (...args) => {
  const message = args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : a
  ).join(' ');

  const log = `[${new Date().toISOString()}] ${message}\n`;

  logStream.write(log);
  process.stdout.write(log);
};

// garder console.error propre aussi
console.error = (...args) => {
  const message = args.map(a =>
    typeof a === 'object' ? JSON.stringify(a) : a
  ).join(' ');

  const log = `[${new Date().toISOString()}] ❌ ${message}\n`;

  logStream.write(log);
  process.stderr.write(log);
};

// =====================================================
// 🚀 EXPRESS
// =====================================================
const app = express();
app.use(cors());
app.use(express.json());

// =====================================================
// 🔍 MIDDLEWARE DEBUG HTTP
// =====================================================
app.use((req, res, next) => {
  console.log(`📡 REQ ${req.method} ${req.url} FROM ${req.ip}`);
  next();
});

// =====================================================
// ⚙️ SERVICES
// =====================================================
const services = [
  { name: 'nappes', service: nappesService },
  { name: 'qualite', service: qualiteService },
  { name: 'vigicrues', service: vigicruesService },
  { name: 'meteo', service: meteoService },
  { name: 'iccpro', service: iccproService }
];

services.forEach(({ name, service }) => {
  try {
    console.log(`🔄 Initialisation service: ${name}`);

    if (typeof service.init === 'function') {
      service.init();
    }

    console.log(`✅ Service ${name} OK`);
  } catch (err) {
    console.error(`💥 Erreur init service ${name}:`, err);
  }
});

// =====================================================
// 📦 ROUTES
// =====================================================
app.use('/api/data', require('./routes/data'));
app.use('/api/iccpro', require('./routes/data_iccpro'));

// =====================================================
// ❤️ HEALTH CHECK
// =====================================================
app.get('/health', (req, res) => {
  console.log(`❤️ HEALTH CHECK`);

  const healthStatus = {};

  services.forEach(({ name, service }) => {
    try {
      healthStatus[name] =
        typeof service.getStatus === 'function'
          ? service.getStatus()
          : { error: 'no status' };
    } catch (err) {
      healthStatus[name] = { error: err.message };
    }
  });

  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    config: {
      port: config.port,
      host: config.host
    },
    services: healthStatus
  });
});

// =====================================================
// 🚀 START SERVER
// =====================================================
const server = app.listen(config.port, config.host, () => {
  console.log(`🚀 Serveur démarré sur http://${config.host}:${config.port}`);
  console.log(`📊 Logs activés + tracking HTTP`);
});

// =====================================================
// 🧠 GLOBAL ERROR HANDLING
// =====================================================
process.on('uncaughtException', (err) => {
  console.error('💥 uncaughtException:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 unhandledRejection:', err);
});

// =====================================================
// 🛑 SHUTDOWN PROPRE
// =====================================================
process.on('SIGINT', () => {
  console.log('🛑 Arrêt serveur...');
  server.close(() => {
    console.log('👋 Serveur arrêté proprement');
    process.exit(0);
  });
});
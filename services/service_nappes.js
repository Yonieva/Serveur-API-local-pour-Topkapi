const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

let lastResults = {};
let lastUpdate = null;
let isInitialized = false;
let isUpdating = false;

// ======================================================
// 🔄 FETCH + NORMALISATION
// ======================================================
async function fetchData() {
  if (isUpdating) {
    console.log('⚠️ [NAPPES] MAJ déjà en cours → skip');
    return;
  }

  isUpdating = true;

  console.log(`⏳ [${new Date().toISOString()}] MAJ NAPPES...`);

  try {
    for (const code of config.nappesCodes) {
      try {
        const response = await axios.get(
          `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques`,
          {
            params: {
              code_bss: code,
              sort: 'desc',
              size: 1
            },
            timeout: config.apiTimeout
          }
        );

        const raw = response.data?.data?.[0];

        if (!raw) {
          console.log(`⚠️ NAPPES ${code} vide → cache conservé`);
          continue;
        }

        const ts = new Date(raw.date_mesure || raw.date);

        if (isNaN(ts.getTime())) {
          console.log(`⚠️ NAPPES ${code} date invalide`);
          continue;
        }

        const niveau = Number(
          raw.niveau_nappe_eau ??
          raw.niveau ??
          raw.niveau_eau ??
          null
        );

        const profondeur = Number(
          raw.profondeur_nappe ??
          raw.profondeur ??
          raw.profondeur_nappe_eau ??
          null
        );

        if (isNaN(niveau)) {
          console.log(`⚠️ NAPPES ${code} niveau invalide`);
          continue;
        }

        lastResults[code] = {
          ...raw,

          code,
          type: "nappes",

          value: niveau,
          niveau,
          niveau_nappe_eau: niveau,

          profondeur: isNaN(profondeur) ? null : profondeur,
          profondeur_nappe: isNaN(profondeur) ? null : profondeur,

          date: ts.toISOString(),
          date_mesure: raw.date_mesure || raw.date
        };

        console.log(
          `✅ NAPPES ${code} OK | niveau=${niveau} | profondeur=${isNaN(profondeur) ? 'null' : profondeur}`
        );

      } catch (error) {
        console.log(`❌ NAPPES ${code}: ${error.code || error.message}`);
      }
    }

    lastUpdate = new Date();
    console.log(`✅ MAJ NAPPES terminée`);

  } finally {
    isUpdating = false;
  }
}

// ======================================================
// 🚀 INIT
// ======================================================
function init() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('🔄 Service NAPPES initialisé');

  fetchData();

  if (config.schedules?.nappes) {
    cron.schedule(config.schedules.nappes, () => {
      console.log(`🕒 CRON NAPPES`);
      fetchData();
    });
  } else {
    console.log('⚠️ Aucun cron défini pour NAPPES');
  }
}

// ======================================================
// 📊 STATUS
// ======================================================
function getStatus() {
  return {
    lastUpdate,
    dataCount: Object.keys(lastResults).length,
    isRunning: isInitialized,
    isUpdating
  };
}

// ======================================================
// 📡 DATA
// ======================================================
function getData(code) {
  return lastResults[code] || null;
}

// ======================================================
module.exports = {
  init,
  getStatus,
  getData
};


/*const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

let lastResults = {};
let lastUpdate = null;
let isInitialized = false;
let isUpdating = false;

// ======================================================
// 🔄 FETCH DATA (SAFE + CRON PRIORITAIRE)
// ======================================================
async function fetchData() {
  if (isUpdating) {
    console.log('⚠️ [NAPPES] MAJ déjà en cours → skip');
    return;
  }

  isUpdating = true;

  console.log(`⏳ [${new Date().toISOString()}] MAJ NAPPES...`);

  try {
    const promises = config.nappesCodes.map(async (code) => {
      try {
        const response = await axios.get(
          `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${encodeURIComponent(code)}&sort=desc&size=1`,
          { timeout: config.apiTimeout }
        );

        if (response.data?.data?.length > 0) {
          lastResults[code] = response.data.data[0];
          console.log(`✅ NAPPES ${code} OK`);
          return { code, success: true };
        }

        console.log(`⚠️ NAPPES ${code} vide → cache conservé`);
        return { code, success: false, reason: "No data" };

      } catch (error) {
        console.log(`❌ NAPPES ${code} erreur: ${error.code || error.message}`);
        return { code, success: false, reason: error.message };
      }
    });

    const results = await Promise.allSettled(promises);

    const successCount = results.filter(r => r.value?.success).length;

    lastUpdate = new Date();

    console.log(`✅ MAJ NAPPES terminée (${successCount}/${config.nappesCodes.length})`);

    results.forEach(r => {
      if (r.status === 'fulfilled' && !r.value.success) {
        console.log(`   ⚠️ ${r.value.code}: ${r.value.reason}`);
      }
      if (r.status === 'rejected') {
        console.log(`   ❌ PROMISE ERROR: ${r.reason}`);
      }
    });

    return successCount;

  } finally {
    isUpdating = false;
  }
}

// ======================================================
// 🚀 INIT
// ======================================================
function init() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('🔄 Service NAPPES initialisé');

  // 🔥 première exécution immédiate
  fetchData();

  // 🔥 CRON PRIORITAIRE
  if (config.schedules?.nappes) {
    cron.schedule(config.schedules.nappes, () => {
      console.log(`🕒 CRON NAPPES`);
      fetchData();
    });
  } else {
    console.log('⚠️ Aucun cron défini pour NAPPES');
  }
}

// ======================================================
// 📊 STATUS
// ======================================================
function getStatus() {
  return {
    lastUpdate,
    dataCount: Object.keys(lastResults).length,
    isRunning: isInitialized,
    isUpdating,
    nextUpdate: null // volontairement désactivé (évite erreurs)
  };
}

// ======================================================
// 📡 DATA ACCESS
// ======================================================
function getData(code) {
  return lastResults[code] || null;
}

// ======================================================
module.exports = {
  init,
  getStatus,
  getData
};


/*const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

let lastResults = {};
let lastUpdate = null;
let isInitialized = false;

async function fetchData() {
  console.log(`⏳ [${new Date().toISOString()}] Début de la mise à jour des nappes...`);

  const promises = config.nappesCodes.map(async (code) => {
    try {
      const response = await axios.get(
        `https://hubeau.eaufrance.fr/api/v1/niveaux_nappes/chroniques?code_bss=${encodeURIComponent(code)}&sort=desc&size=1`,
        { timeout: config.apiTimeout }
      );

      if (response.data.data?.length > 0) {
        lastResults[code] = response.data.data[0];
        return { code, success: true };
      }
      return { code, success: false, reason: "No valid data" };
    } catch (error) {
      console.error(`❌ Erreur pour ${code}:`, error.code || error.message);
      return { code, success: false, reason: error.message };
    }
  });

  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  lastUpdate = new Date();

  console.log(`✅ Mise à jour terminée (${successCount}/${config.nappesCodes.length} réussies)`);
  results.forEach(r => {
    if (!r.success) console.log(`   ⚠️ Échec pour ${r.code}: ${r.reason}`);
  });

  return successCount;
}

function init() {
  if (isInitialized) return;
  isInitialized = true;

  // Première exécution immédiate
  fetchData();

  // Planification des mises à jour
  cron.schedule(config.schedules.nappes, () => {
    console.log(`🕒 [${new Date().toISOString()}] Lancement de la mise à jour programmée des nappes`);
    fetchData();
  });
}

function getStatus() {
  return {
    lastUpdate,
    dataCount: Object.keys(lastResults).length,
    isRunning: isInitialized,
    nextUpdate: new Date(new Date().setHours(5, 0, 0, 0))  // Prochaine mise à jour à 7h
  };
}

function getData(code) {
  return lastResults[code];
}

module.exports = {
  init,
  getStatus,
  getData
};*/
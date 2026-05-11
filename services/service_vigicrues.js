/*const axios = require('axios');
const Topkapi = global.Topkapi;
const cron = require('node-cron');
const config = require('../config');

let status = { initialized: false, lastUpdate: null };
let cache = {}; // { stationCode: { H: {...}, Q: {...} } }

// ======================================================
// 🔄 FETCH + NORMALISATION
// ======================================================
async function fetchStation(stationCode, type) {
  try {
    const url = `https://www.vigicrues.gouv.fr/services/observations.json/index.php?CdStationHydro=${stationCode}&GrdSerie=${type}&FormatSortie=simple`;

    const response = await axios.get(url, { timeout: config.apiTimeout });

    const serie = response.data?.Serie;

    if (!serie?.ObssHydro?.length) {
      console.log(`⚠️ Vigicrues vide ${stationCode} (${type})`);
      return;
    }

    const last = serie.ObssHydro.at(-1);

    const [timestamp, value] = last || [];

    if (!timestamp || value === undefined) return;

    const ts = new Date(timestamp);

    if (isNaN(ts.getTime())) return;

    // 🔥 NORMALISATION ICI
    const normalized = {
      station: stationCode,
      type,
      date: ts.toISOString(),
      value: Number(value)
    };

    cache[stationCode] = cache[stationCode] || {};
    cache[stationCode][type] = normalized;

    console.log(`✅ Vigicrues MAJ ${stationCode} (${type})`);

  } catch (err) {
    console.log(`❌ Vigicrues erreur ${stationCode} (${type}): ${err.message}`);
  }
}

// ======================================================
// 🔄 UPDATE ALL
// ======================================================
async function updateAll() {
  console.log(`⏳ [${new Date().toISOString()}] MAJ Vigicrues...`);

  for (const code of config.vigicruesCodes) {
    await fetchStation(code, 'H');
    await fetchStation(code, 'Q');
  }

  status.lastUpdate = new Date();
  console.log(`✅ MAJ Vigicrues terminée`);
}

// ======================================================
// 🚀 INIT
// ======================================================
module.exports = {
  init: () => {
    if (status.initialized) return;
    status.initialized = true;

    console.log('🔄 Service Vigicrues initialisé');

    updateAll();

    cron.schedule(config.schedules.vigicrues, () => {
      console.log(`🕒 CRON Vigicrues`);
      updateAll();
    });
  },

  getStatus: () => status,

  // ======================================================
  // 📡 SIMPLE + PROPRE
  // ======================================================
  getData: async (stationCode, type = 'H') => {
    const data = cache[stationCode]?.[type];

    if (!data) {
      return { success: false, error: 'Pas encore de données' };
    }

    return {
      success: true,
      data
    };
  },

  // ======================================================
  // 📡 TOPKAPI (SIMPLIFIÉ)
  // ======================================================
  processData: (serie, api, tag) => {
    if (!serie?.ObssHydro?.length) return;

    const last = serie.ObssHydro.at(-1);
    if (!last) return;

    const [timestamp, value] = last;

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) return;

    Topkapi.Data.TimeStamped([{
      rtu: api,
      tag,
      value: Number(value),
      timestamp: ts
    }], true);

    Topkapi.Data.RealTime([{
      rtu: api,
      tag,
      value: Number(value)
    }]);

    Topkapi.IO.Log(`✅ Vigicrues ${tag} = ${value}`);
  }
};*/

const axios = require('axios');
const Topkapi = global.Topkapi;
const cron = require('node-cron');
const config = require('../config');

let status = { initialized: false, lastUpdate: null };
let cache = {}; // { stationCode: { H: {...}, Q: {...} } }

async function fetchStation(stationCode, type) {
  try {
    const url = `https://www.vigicrues.gouv.fr/services/observations.json/index.php?CdStationHydro=${stationCode}&GrdSerie=${type}&FormatSortie=simple`;

    const response = await axios.get(url, { timeout: config.apiTimeout });

    if (!response.data || !response.data.Serie) {
      console.log(`⚠️ Vigicrues vide pour ${stationCode} (${type})`);
      return;
    }

    cache[stationCode] = cache[stationCode] || {};
    cache[stationCode][type] = response.data.Serie;

    console.log(`✅ Vigicrues MAJ ${stationCode} (${type})`);
  } catch (err) {
    console.log(`❌ Vigicrues erreur ${stationCode} (${type}): ${err.message}`);
  }
}

async function updateAll() {
  console.log(`⏳ [${new Date().toISOString()}] MAJ Vigicrues...`);

  for (const code of config.vigicruesCodes) {
    await fetchStation(code, 'H');
    await fetchStation(code, 'Q');
  }

  status.lastUpdate = new Date();
  console.log(`✅ MAJ Vigicrues terminée`);
}

module.exports = {
  init: () => {
    if (status.initialized) return;
    status.initialized = true;

    console.log('🔄 Service Vigicrues initialisé');

    // 🔥 première exécution
    updateAll();

    // 🔥 CRON (TA CONFIG)
    cron.schedule(config.schedules.vigicrues, () => {
      console.log(`🕒 CRON Vigicrues`);
      updateAll();
    });
  },

  getStatus: () => status,

  // 🔥 MAINTENANT → retourne le cache (ULTRA RAPIDE)
  getData: async (stationCode, type = 'H') => {
    if (!stationCode) return { success: false, error: 'StationCode manquant' };

    const data = cache[stationCode]?.[type];

    if (!data) {
      return { success: false, error: 'Pas encore de données (cache vide)' };
    }

    return { success: true, data };
  },

  // 🔥 inchangé mais sécurisé
  processData: (serie, api, tag) => {
    if (!serie || !serie.ObssHydro || serie.ObssHydro.length === 0) {
      Topkapi.IO.Log(`⚠️ Données Vigicrues invalides pour ${serie?.CdStationHydro ?? 'inconnue'}`);
      return null;
    }

    const last = serie.ObssHydro[serie.ObssHydro.length - 1];
    const [timestamp, value] = last;

    if (value === undefined || timestamp === undefined) {
      Topkapi.IO.Log(`⚠️ Dernière observation invalide pour ${serie.CdStationHydro}`);
      return null;
    }

    const ts = new Date(timestamp);
    if (isNaN(ts.getTime())) {
      Topkapi.IO.Log(`⚠️ Date invalide pour ${serie.CdStationHydro}`);
      return null;
    }

    Topkapi.Data.TimeStamped([{
      rtu: api,
      tag: tag,
      value: value,
      timestamp: ts
    }], true);

    Topkapi.Data.RealTime([{
      rtu: api,
      tag: tag,
      value: value
    }]);

    Topkapi.IO.Log(`✅ Vigicrues ${serie.CdStationHydro} (${serie.GrdSerie}) : ${value}`);

    return { timestamp: ts, value };
  }
};
const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

const Topkapi = global.Topkapi || {
  IO: { Log: (...args) => console.log('[Topkapi]', ...args) },
  Data: {
    TimeStamped: () => {},
    RealTime: () => {}
  }
};

let status = {
  initialized: false,
  lastUpdate: null
};

let cache = {};

// ======================================================
// 🧠 SAFE INDEX (version améliorée)
// ======================================================
function getNowIndex(hourlyTimes) {
  if (!Array.isArray(hourlyTimes)) return 0;

  const now = new Date().getTime();

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < hourlyTimes.length; i++) {
    const t = new Date(hourlyTimes[i]).getTime();
    const diff = Math.abs(t - now);

    if (!isNaN(t) && diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// ======================================================
// 🧠 RETRY
// ======================================================
async function fetchWithRetry(url, params, retries = 2) {
  try {
    return await axios.get(url, {
      params,
      timeout: config.apiTimeout || 15000
    });
  } catch (err) {
    if (retries > 0 && err.response?.status === 429) {
      console.log(`⚠️ 429 retry... (${retries})`);
      await new Promise(r => setTimeout(r, 800 * (3 - retries)));
      return fetchWithRetry(url, params, retries - 1);
    }
    throw err;
  }
}

// ======================================================
// 🔄 UPDATE ALL
// ======================================================
async function updateAll() {
  console.log(`⏳ [${new Date().toISOString()}] MAJ METEO...`);

  const entries = Object.entries(config.meteoSecteurs || {});

  for (const [code, secteur] of entries) {
    await fetchMeteo(code, secteur);
  }

  status.lastUpdate = new Date();
  console.log(`✅ MAJ METEO terminée`);
}

// ======================================================
// 🌤️ FETCH METEO (CORRIGÉ)
// ======================================================
async function fetchMeteo(secteurCode, secteurConfig) {
  try {
    if (!secteurConfig?.latitude || !secteurConfig?.longitude) {
      console.log(`⚠️ coords manquantes ${secteurCode}`);
      return;
    }

    const { latitude, longitude } = secteurConfig;

    const response = await fetchWithRetry(
      'https://api.open-meteo.com/v1/forecast',
      {
        latitude,
        longitude,
        hourly: "precipitation",
        daily: "precipitation_sum",
        timezone: "auto"
      }
    );

    const hourly = response.data?.hourly;
    const daily = response.data?.daily;

    if (!hourly?.time?.length || !hourly?.precipitation) {
      console.log(`❌ METEO données invalides ${secteurCode}`);
      return;
    }

    const nowIndex = getNowIndex(hourly.time);

    // TODAY (safe + simple)
    let todaySum = 0;
    const today = new Date();

    for (let i = 0; i < hourly.time.length; i++) {
      const t = new Date(hourly.time[i]);

      if (
        t.getDate() === today.getDate() &&
        t.getMonth() === today.getMonth() &&
        t.getFullYear() === today.getFullYear()
      ) {
        todaySum += Number(hourly.precipitation[i] || 0);
      }
    }

    const data = {
      now: Number(hourly.precipitation?.[nowIndex] ?? 0),
      h1: Number(hourly.precipitation?.[nowIndex + 1] ?? hourly.precipitation?.[nowIndex] ?? 0),
      today: todaySum
    };

    // DAILY FIX (index 0 → jour actuel)
    if (Array.isArray(daily?.precipitation_sum)) {
      for (let i = 1; i <= 7; i++) {
        data[`j${i}`] = Number(daily.precipitation_sum[i] ?? 0);
      }
    }

    cache[secteurCode] = data;

    console.log(`✅ METEO ${secteurCode} OK`);

  } catch (err) {
    console.log(`❌ METEO erreur ${secteurCode}: ${err.message}`);
  }
}

// ======================================================
// 📡 TOPKAPI PUSH (amélioré sécurité)
// ======================================================
function processData(data, api, tag) {
  if (!data) return;

  const parts = tag.split('_');
  const period = parts[3];

  let value;

  if (period === 'NOW') value = data.now;
  else if (period === 'H1') value = data.h1;
  else if (period === 'TODAY') value = data.today;
  else if (period?.startsWith('J')) {
    const index = parseInt(period.replace('J', ''));
    value = data[`j${index}`];
  }

  if (value === undefined || isNaN(value)) {
    Topkapi.IO.Log(`⚠️ METEO valeur invalide ${tag}`);
    return;
  }

  const ts = new Date();

  Topkapi.Data.TimeStamped([{
    rtu: api,
    tag,
    value,
    timestamp: ts
  }], true);

  Topkapi.Data.RealTime([{
    rtu: api,
    tag,
    value
  }]);

  console.log(`✅ ${tag} = ${value}`);
}

// ======================================================
module.exports = {
  init: () => {
    if (status.initialized) return;
    status.initialized = true;

    console.log('🔄 Service METEO initialisé');

    updateAll();

    if (config.schedules?.meteo) {
      cron.schedule(config.schedules.meteo, () => {
        console.log('🕒 CRON METEO');
        updateAll();
      });
    }
  },

  getStatus: () => status,

  getData: (code) =>
    cache[code]
      ? { success: true, data: cache[code] }
      : { success: false, error: 'Pas encore de données' },

  processData
};


/*const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

const Topkapi = global.Topkapi || {
  IO: { Log: (...args) => console.log('[Topkapi]', ...args) },
  Data: {
    TimeStamped: () => {},
    RealTime: () => {}
  }
};

let status = {
  initialized: false,
  lastUpdate: null
};

let cache = {};

// ======================================================
// 🧠 SAFE DATE
// ======================================================
function safeDate(d) {
  const ts = new Date(d);
  return isNaN(ts.getTime()) ? null : ts;
}

// ======================================================
// ⏱️ INDEX NOW (FIX: align heure entière uniquement)
// ======================================================
function getNowIndex(hourlyTimes) {
  const now = new Date();
  now.setMinutes(0, 0, 0); // 🔥 FIX: snap sur heure réelle

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < hourlyTimes.length; i++) {
    const t = new Date(hourlyTimes[i]);
    const diff = Math.abs(t.getTime() - now.getTime());

    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// ======================================================
// 🔄 UPDATE ALL
// ======================================================
async function updateAll() {
  console.log(`\n🔄 UPDATE ALL`, new Date().toISOString());

  for (const [code, secteur] of Object.entries(config.meteoSecteurs || {})) {
    await fetchMeteo(code, secteur);
  }

  status.lastUpdate = new Date();
}

// ======================================================
// 🌤️ FETCH METEO
// ======================================================
async function fetchMeteo(secteurCode, secteurConfig) {
  try {
    console.log(`\n🌤️ [METEO] START ${secteurCode}`);

    if (!secteurConfig?.latitude || !secteurConfig?.longitude) return;

    const { latitude, longitude } = secteurConfig;

    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast',
      {
        params: {
          latitude,
          longitude,
          hourly: "precipitation",
          daily: "precipitation_sum",
          timezone: "auto"
        },
        timeout: config.apiTimeout || 15000
      }
    );

    const hourly = response.data?.hourly;
    const daily = response.data?.daily;

    if (!hourly?.time?.length) return;

    const nowIndex = getNowIndex(hourly.time);

    // ======================================================
    // 🌧️ TODAY (FIX: date stable 1 fois)
    // ======================================================
    const today = new Date();
    const todayY = today.getFullYear();
    const todayM = today.getMonth();
    const todayD = today.getDate();

    const todayForecast = hourly.time.reduce((sum, t, i) => {
      const date = new Date(t);

      if (
        date.getFullYear() === todayY &&
        date.getMonth() === todayM &&
        date.getDate() === todayD
      ) {
        return sum + (hourly.precipitation?.[i] ?? 0);
      }

      return sum;
    }, 0);

    // ======================================================
    // DATA
    // ======================================================
    const data = {
      now: hourly.precipitation?.[nowIndex] ?? 0,
      h1: hourly.precipitation?.[nowIndex + 1] ?? 0,
      today: todayForecast
    };

    // ======================================================
    // DAILY FIX SAFE INDEX
    // ======================================================
    if (daily?.time?.length) {
      for (let i = 1; i <= 7; i++) {
        data[`j${i}`] = daily.precipitation_sum?.[i] ?? 0;
      }
    }

    cache[secteurCode] = data;

    console.log(`🧠 CACHE UPDATED`, JSON.stringify(data, null, 2));

  } catch (err) {
    console.log(`❌ METEO ERROR`, err?.message || err);
  }
}

// ======================================================
// 📡 TOPKAPI PUSH
// ======================================================
function processData(data, api, tag) {
  if (!data) return;

  const parts = tag.split('_');
  const period = parts[3];

  let value = 0;

  if (period === 'NOW') value = data.now ?? 0;
  else if (period === 'H1') value = data.h1 ?? 0;
  else if (period === 'TODAY') value = data.today ?? 0;
  else if (period?.startsWith('J')) {
    const index = parseInt(period.replace('J', ''));
    value = data[`j${index}`] ?? 0;
  }

  value = Number(value);

  // 🔥 FIX IMPORTANT: timestamp unique CRON-driven
  const ts = new Date();

  Topkapi.Data.TimeStamped([{
    rtu: api,
    tag,
    value,
    timestamp: ts
  }], true);

  Topkapi.Data.RealTime([{
    rtu: api,
    tag,
    value
  }]);

  console.log(`✅ ${tag} = ${value}`);
}

// ======================================================
module.exports = {
  init: () => {
    if (status.initialized) return;
    status.initialized = true;

    updateAll();

    // 🔥 TON CRON CONTINUE DE PILOTER LA FRÉQUENCE
    if (config.schedules?.meteo) {
      cron.schedule(config.schedules.meteo, updateAll);
    }
  },

  getData: (code) =>
    cache[code]
      ? { success: true, data: cache[code] }
      : { success: false },

  processData
};*/
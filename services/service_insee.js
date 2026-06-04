const axios = require('axios');
const cron = require('node-cron');
const AdmZip = require('adm-zip');
const { parse } = require('csv-parse/sync');
const config = require('../config');

const INSEE_ZIP_URL = 'https://www.insee.fr/fr/statistiques/fichier/2521169/base_cc_comparateur_csv.zip';

let isInitialized = false;
let isUpdating = false;
let lastUpdate = null;
let lastError = null;

let cache = {
  communes: {},
  total: {
    population: 0,
    residencesSecondaires: 0
  }
};

const COMMUNES = {
  ARGELES: '66008',
  BAGES: '66011',
  BANYULS: '66016',
  CERBERE: '66048',
  COLLIOURE: '66053',
  ELNE: '66065',
  LAROQUE: '66093',
  MONTESQUIEU: '66115',
  ORTAFFA: '66129',
  PALAU: '66133',
  PORT_VENDRES: '66148',
  SAINT_ANDRE: '66168',
  SAINT_GENIS: '66175',
  SOREDE: '66196',
  VILLELONGUE: '66225'
};

function cleanNumber(value) {
  if (value === undefined || value === null || value === '') return 0;

  return Number(
    String(value)
      .replace(/\s/g, '')
      .replace(',', '.')
  ) || 0;
}

async function fetchData() {
  if (isUpdating) return;

  isUpdating = true;
  console.log('⏳ [INSEE] MAJ population + résidences secondaires...');

  try {
    const response = await axios.get(INSEE_ZIP_URL, {
      responseType: 'arraybuffer',
      timeout: config.apiTimeout || 30000
    });

    const zip = new AdmZip(response.data);
    const csvEntry = zip.getEntries().find(e =>
      e.entryName.toLowerCase().endsWith('.csv')
    );

    if (!csvEntry) {
      throw new Error('CSV INSEE introuvable dans le ZIP');
    }

    const csvContent = csvEntry.getData().toString('utf8');

    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';',
      bom: true,
      trim: true
    });

    const newCache = {
      communes: {},
      total: {
        population: 0,
        residencesSecondaires: 0
      }
    };

    const codeToName = {};
    for (const [name, code] of Object.entries(COMMUNES)) {
      codeToName[code] = name;
    }

    for (const row of rows) {
      const code = row.CODGEO;
      const name = codeToName[code];

      if (!name) continue;

      const population = cleanNumber(row.P22_POP);
      const residencesSecondaires = cleanNumber(row.P22_RSECOCC);

      newCache.communes[name] = {
        code,
        libelle: row.LIBGEO,
        population,
        residencesSecondaires,
        date: new Date().toISOString()
      };

      newCache.total.population += population;
      newCache.total.residencesSecondaires += residencesSecondaires;
    }

    cache = newCache;
    lastUpdate = new Date();
    lastError = null;

    console.log(`✅ [INSEE] MAJ terminée (${Object.keys(cache.communes).length} communes)`);

  } catch (error) {
    lastError = error.message;
    console.log(`❌ [INSEE] Erreur MAJ: ${error.message}`);

  } finally {
    isUpdating = false;
  }
}

function getValueFromTag(tag) {
  if (tag === 'INSEE_TOTAL_POPULATION') {
    return cache.total.population;
  }

  if (tag === 'INSEE_TOTAL_RESIDENCES_SECONDAIRES') {
    return cache.total.residencesSecondaires;
  }

  const parts = tag.split('_');

  let commune;
  let field;

  if (tag.endsWith('_POPULATION')) {
    commune = parts.slice(1, -1).join('_');
    field = 'population';
  } else if (tag.endsWith('_RESIDENCES_SECONDAIRES')) {
    commune = parts.slice(1, -2).join('_');
    field = 'residencesSecondaires';
  } else {
    return null;
  }

  const data = cache.communes[commune];
  if (!data) return null;

  return data[field];
}

function getStatus() {
  return {
    isRunning: isInitialized,
    isUpdating,
    lastUpdate,
    lastError,
    communesCount: Object.keys(cache.communes).length
  };
}

function getCache() {
  return cache;
}

function init() {
  if (isInitialized) return;
  isInitialized = true;

  console.log('🔄 Service INSEE initialisé');

  fetchData();

  if (config.schedules?.insee) {
    cron.schedule(config.schedules.insee, () => {
      console.log('🕒 CRON INSEE');
      fetchData();
    });
  } else {
    console.log('⚠️ Aucun cron défini pour INSEE');
  }
}

module.exports = {
  init,
  fetchData,
  getStatus,
  getCache,
  getValueFromTag
};
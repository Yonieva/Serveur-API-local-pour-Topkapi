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
    residencesSecondaires: 0,
    residencesPrincipales: 0,
    residencesOccupeesProprietaire: 0
  },
  year: null,
  date: null
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

function detectInseeYear(row) {
  const popField = Object.keys(row).find(k => /^P\d{2}_POP$/.test(k));

  if (!popField) return null;

  const yy = popField.substring(1, 3);
  const year = 2000 + Number(yy);

  return {
    year,
    date: `${year}-01-01T00:00:00.000Z`,
    fields: {
      population: `P${yy}_POP`,
      residencesSecondaires: `P${yy}_RSECOCC`,
      residencesPrincipales: `P${yy}_RP`,
      residencesOccupeesProprietaire: `P${yy}_RP_PROP`
    }
  };
}

async function fetchData() {
  if (isUpdating) return;

  isUpdating = true;
  console.log('⏳ [INSEE] MAJ population + logements...');

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
        residencesSecondaires: 0,
        residencesPrincipales: 0,
        residencesOccupeesProprietaire: 0
      },
      year: null,
      date: null
    };

    const codeToName = {};

    for (const [name, code] of Object.entries(COMMUNES)) {
      codeToName[code] = name;
    }

    for (const row of rows) {
      const code = row.CODGEO;
      const name = codeToName[code];

      if (!name) continue;

      const detected = detectInseeYear(row);

      if (!detected) {
        console.log(`⚠️ [INSEE] Année introuvable pour ${code}`);
        continue;
      }

      const { year, date, fields } = detected;

      const population = cleanNumber(row[fields.population]);
      const residencesSecondaires = cleanNumber(row[fields.residencesSecondaires]);
      const residencesPrincipales = cleanNumber(row[fields.residencesPrincipales]);
      const residencesOccupeesProprietaire = cleanNumber(row[fields.residencesOccupeesProprietaire]);

      newCache.communes[name] = {
        code,
        libelle: row.LIBGEO,
        population,
        residencesSecondaires,
        residencesPrincipales,
        residencesOccupeesProprietaire,
        year,
        date
      };

      newCache.total.population += population;
      newCache.total.residencesSecondaires += residencesSecondaires;
      newCache.total.residencesPrincipales += residencesPrincipales;
      newCache.total.residencesOccupeesProprietaire += residencesOccupeesProprietaire;

      if (!newCache.year) newCache.year = year;
      if (!newCache.date) newCache.date = date;
    }

    cache = newCache;
    lastUpdate = new Date();
    lastError = null;

    console.log(`✅ [INSEE] MAJ terminée (${Object.keys(cache.communes).length} communes, année ${cache.year})`);

  } catch (error) {
    lastError = error.message;
    console.log(`❌ [INSEE] Erreur MAJ: ${error.message}`);

  } finally {
    isUpdating = false;
  }
}

function getValueFromTag(tag) {
  if (tag === 'INSEE_TOTAL_POPULATION') {
    return {
      value: cache.total.population,
      date: cache.date
    };
  }

  if (tag === 'INSEE_TOTAL_RESIDENCES_SECONDAIRES') {
    return {
      value: cache.total.residencesSecondaires,
      date: cache.date
    };
  }

  if (tag === 'INSEE_TOTAL_RESIDENCES_PRINCIPALES') {
    return {
      value: cache.total.residencesPrincipales,
      date: cache.date
    };
  }

  if (tag === 'INSEE_TOTAL_RESIDENCES_OCCUPEES') {
    return {
      value: cache.total.residencesOccupeesProprietaire,
      date: cache.date
    };
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

  } else if (tag.endsWith('_RESIDENCES_PRINCIPALES')) {
    commune = parts.slice(1, -2).join('_');
    field = 'residencesPrincipales';

  } else if (tag.endsWith('_RESIDENCES_OCCUPEES')) {
    commune = parts.slice(1, -2).join('_');
    field = 'residencesOccupeesProprietaire';

  } else {
    return null;
  }

  const data = cache.communes[commune];

  if (!data) return null;

  return {
    value: data[field],
    date: data.date
  };
}

function getStatus() {
  return {
    isRunning: isInitialized,
    isUpdating,
    lastUpdate,
    lastError,
    communesCount: Object.keys(cache.communes).length,
    year: cache.year,
    date: cache.date
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
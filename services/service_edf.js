const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cron = require('node-cron');
const { parse } = require('csv-parse/sync');
const config = require('../config');

const EDF_ROOT = 'C:\\Topkapi_api_interne\\data\\edf';
const INCOMING_DIR = path.join(EDF_ROOT, 'incoming');
const ARCHIVE_DIR = path.join(EDF_ROOT, 'archive');
const ERROR_DIR = path.join(EDF_ROOT, 'error');
const PROCESSED_FILE = path.join(EDF_ROOT, 'processed_files.json');

let isInitialized = false;
let isScanning = false;
let lastScan = null;
let lastError = null;

let processedFiles = {};

let cache = {
  total: {
    mensuel: {},
    annuel: {}
  },
  villages: {},
  refs:{},
  files: []
};

// ======================================================
// 📁 DOSSIERS
// ======================================================
function ensureDirs() {
  [EDF_ROOT, INCOMING_DIR, ARCHIVE_DIR, ERROR_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  if (!fs.existsSync(PROCESSED_FILE)) {
    fs.writeFileSync(PROCESSED_FILE, JSON.stringify({}, null, 2));
  }
}

// ======================================================
// 🔐 ANTI-DOUBLON
// ======================================================
function loadProcessedFiles() {
  try {
    processedFiles = JSON.parse(fs.readFileSync(PROCESSED_FILE, 'utf8'));
  } catch {
    processedFiles = {};
  }
}

function saveProcessedFiles() {
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(processedFiles, null, 2));
}

function getFileHash(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// ======================================================
// 🧹 NORMALISATION
// ======================================================
function normalizeText(value) {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .trim();
}

function normalizeVillage(value) {
  return normalizeText(value)
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

function normalizeKey(key) {
  return String(key || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}

function cleanNumber(value) {
  if (value === undefined || value === null || value === '') return 0;

  return Number(
    String(value)
      .replace(/\s/g, '')
      .replace('€', '')
      .replace('kWh', '')
      .replace(',', '.')
  ) || 0;
}

function get(row, possibleKeys) {
  const normalized = {};

  for (const key of Object.keys(row)) {
    normalized[normalizeKey(key)] = row[key];
  }

  for (const key of possibleKeys) {
    const value = normalized[normalizeKey(key)];
    if (value !== undefined && value !== null && value !== '') return value;
  }

  return null;
}

// ======================================================
// 🏘️ VILLAGES
// ======================================================
function extractVillage(adresse) {

  if (!adresse) return null;

  const cpMap = {

    '66700': 'ARGELES',
    '66650': 'BANYULS',
    '66290': 'CERBERE',
    '66190': 'COLLIOURE',
    '66200': 'ELNE',
	'66620': 'BROUILLA',
    '66740': 'LAROQUE',
    '66560': 'ORTAFFA',
    '66690': 'PALAU',
    '66660': 'PORT_VENDRES',
    '66690': 'SAINT_ANDRE',
    '66740': 'SAINT_GENIS',
    '66690': 'SOREDE',
    '66740': 'VILLELONGUE',
	'66200': 'MONTESCOT',
	'66200': 'LATOUR_BAS_ELNE',
    '66670': 'BAGES'
  };

  const match = String(adresse).match(/\b\d{5}\b/);

  if (!match) {
    return null;
  }

  const cp = match[0];

  // cas spéciaux CP partagés
  if (cp === '66740') {

    const upper = normalizeText(adresse);

    if (upper.includes('LAROQUE')) return 'LAROQUE';
    if (upper.includes('GENIS')) return 'SAINT_GENIS';
    if (upper.includes('MONTESQUIEU')) return 'MONTESQUIEU';
	if (upper.includes('VILLELONGUE')) return 'VILLELONGUE';
  }

  if (cp === '66690') {

    const upper = normalizeText(adresse);

    if (upper.includes('PALAU')) return 'PALAU';
    if (upper.includes('ANDRE')) return 'SAINT_ANDRE';
    if (upper.includes('SOREDE')) return 'SOREDE';
  }
  
    if (cp === '66200') {

    const upper = normalizeText(adresse);

    if (upper.includes('MONTESCOT')) return 'MONTESCOT';
    if (upper.includes('LATOUR')) return 'LATOUR_BAS_ELNE';
  }

  return cpMap[cp] || null;
}

// ======================================================
// 📅 DATE
// ======================================================
function parseDate(value) {
  if (!value) return null;

  const str = String(value).trim();

  const fr = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (fr) return new Date(`${fr[3]}-${fr[2]}-${fr[1]}T00:00:00`);

  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// ======================================================
// 📦 FICHIERS
// ======================================================
function moveFile(filePath, targetDir) {
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetPath = path.join(targetDir, `${timestamp}_${fileName}`);

  fs.renameSync(filePath, targetPath);
  return targetPath;
}

// ======================================================
// 🧮 CACHE
// ======================================================
function addValue(target, key, consoKwh, ttc) {
  if (!target[key]) {
    target[key] = {
      consoKwh: 0,
      ttc: 0
    };
  }

  target[key].consoKwh += consoKwh;
  target[key].ttc += ttc;
}

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    delimiter: ';',
    relax_column_count: true,
    trim: true
  });
}

function processRows(rows, fileName) {
  let lignesTraitees = 0;
  let lignesIgnorees = 0;

  for (const row of rows) {
    const adresseSite = get(row, ['adresse_site']);
    const village = extractVillage(adresseSite);
	const refAcheminement = get(row, ['ref_acheminement']);
	
	
	if (!refAcheminement) {
	  lignesIgnorees++;
	  console.log(`⚠️ [EDF] ref_acheminement absent`);
	  continue;
	}

	const pdl = String(refAcheminement)
	  .trim()
	  .replace(/\s+/g, '');

    if (!village) {
      lignesIgnorees++;
      console.log(`⚠️ [EDF] Village non détecté : ${adresseSite}`);
      continue;
    }

    const date = parseDate(get(row, [
      'date_facture',
      'date',
      'periode',
      'mois',
      'date_debut'
    ]));

    if (!date) {
      lignesIgnorees++;
      console.log(`⚠️ [EDF] Date invalide`);
      continue;
    }

    const annee = date.getFullYear();
    const mois = String(date.getMonth() + 1).padStart(2, '0');

    const consoKwh = cleanNumber(get(row, [
      'conso_elec_facturee_kwh',
      'consommation_kwh',
      'conso_kwh',
      'kwh'
    ]));

    const ttc = cleanNumber(get(row, [
      'montant_total_ttc_euros',
      'montant_ttc',
      'total_ttc',
      'ttc'
    ]));

    const keyMensuel = `${annee}-${mois}`;
    const keyAnnuel = `${annee}`;

    addValue(cache.total.mensuel, keyMensuel, consoKwh, ttc);
    addValue(cache.total.annuel, keyAnnuel, consoKwh, ttc);

    if (!cache.villages[village]) {
      cache.villages[village] = {
        mensuel: {},
        annuel: {}
      };
    }

    addValue(cache.villages[village].mensuel, keyMensuel, consoKwh, ttc);
    addValue(cache.villages[village].annuel, keyAnnuel, consoKwh, ttc);
	if (!cache.refs[pdl]) {
	  cache.refs[pdl] = {
		mensuel: {},
		annuel: {}
	  };
	}

	addValue(cache.refs[pdl].mensuel, keyMensuel, consoKwh, ttc);
	addValue(cache.refs[pdl].annuel, keyAnnuel, consoKwh, ttc);

    lignesTraitees++;
  }

  cache.files.push({
    fileName,
    lignesTraitees,
    lignesIgnorees,
    processedAt: new Date().toISOString()
  });

  console.log(`📊 [EDF] ${fileName} : ${lignesTraitees} lignes traitées, ${lignesIgnorees} ignorées`);
}

// ======================================================
// 🔍 SCAN AUTO
// ======================================================
function scanIncoming() {
  if (isScanning) {
    console.log('⚠️ [EDF] Scan déjà en cours → skip');
    return;
  }

  isScanning = true;
  lastScan = new Date();

  try {
    ensureDirs();
    loadProcessedFiles();

    const files = fs.readdirSync(INCOMING_DIR)
      .filter(file => file.toLowerCase().endsWith('.csv'));

    if (files.length === 0) return;

    console.log(`📁 [EDF] ${files.length} fichier(s) détecté(s)`);

    for (const file of files) {
      const filePath = path.join(INCOMING_DIR, file);

      try {
        const hash = getFileHash(filePath);

        if (processedFiles[hash]) {
          console.log(`⚠️ [EDF] Doublon ignoré : ${file}`);
          moveFile(filePath, ARCHIVE_DIR);
          continue;
        }

        console.log(`⏳ [EDF] Traitement ${file}`);

        const rows = parseCsv(filePath);

        if (!rows.length) {
          throw new Error('CSV vide ou aucune ligne exploitable');
        }

        processRows(rows, file);

        processedFiles[hash] = {
          fileName: file,
          processedAt: new Date().toISOString()
        };

        saveProcessedFiles();

        const archivedPath = moveFile(filePath, ARCHIVE_DIR);

        console.log(`✅ [EDF] ${file} traité → ${archivedPath}`);

      } catch (error) {
        lastError = error.message;

        console.log(`❌ [EDF] Erreur fichier ${file}: ${error.message}`);

        try {
          const errorPath = moveFile(filePath, ERROR_DIR);
          console.log(`📦 [EDF] Fichier déplacé en erreur → ${errorPath}`);
        } catch (moveError) {
          console.log(`❌ [EDF] Impossible de déplacer le fichier en erreur: ${moveError.message}`);
        }
      }
    }

  } finally {
    isScanning = false;
  }
}

// ======================================================
// 🔥 HISTORIQUE POUR TOPKAPI
// ======================================================
function getHistoryFromTag(tag) {
  if (tag.startsWith('EDF_TOTAL_')) {
    return getTotalHistory(tag);
  }

  if (tag.startsWith('EDF_VILLAGE_')) {
    return getVillageHistory(tag);
  }

  if (tag.startsWith('EDF_REF_')) {
    return getRefHistory(tag);
  }

  return null;
}
function getTotalHistory(tag) {
  const parts = tag.split('_');

  const period = parts[2];
  const field = parts.slice(3).join('_');

  const source = period === 'MENSUEL'
    ? cache.total.mensuel
    : cache.total.annuel;

  return buildHistory(source, period, field);
}
function getRefHistory(tag) {
  const parts = tag.split('_');

  let pdl;
  let period;
  let field;

  // Format :
  // EDF_REF_30002420746389_MENSUEL_KWH
  // EDF_REF_30002420746389_MENSUEL_TTC
  // EDF_REF_30002420746389_ANNUEL_KWH
  // EDF_REF_30002420746389_ANNUEL_TTC

  field = parts[parts.length - 1];
  period = parts[parts.length - 2];
  pdl = parts.slice(2, parts.length - 2).join('_');

  const refData = cache.refs[pdl];
  if (!refData) return null;

  const source = period === 'MENSUEL'
    ? refData.mensuel
    : refData.annuel;

  return buildHistory(source, period, field);
}
function getVillageHistory(tag) {
  const parts = tag.split('_');

  let village;
  let period;
  let field;

  if (parts.slice(-2).join('_') === 'CONSO_KWH') {
    field = 'CONSO_KWH';
    period = parts[parts.length - 3];
    village = parts.slice(2, parts.length - 3).join('_');
  } else {
    field = parts[parts.length - 1];
    period = parts[parts.length - 2];
    village = parts.slice(2, parts.length - 2).join('_');
  }

  const villageData = cache.villages[village];
  if (!villageData) return null;

  const source = period === 'MENSUEL'
    ? villageData.mensuel
    : villageData.annuel;

  return buildHistory(source, period, field);
}

function buildHistory(source, period, field) {
  if (!source) return null;

  const data = [];

  const keys = Object.keys(source).sort();

  for (const key of keys) {
    const item = source[key];

    let value = null;

    if (field === 'KWH' || field === 'CONSO_KWH') value = item.consoKwh;
    if (field === 'TTC') value = item.ttc;

    if (value === null || value === undefined) continue;

    const date = period === 'MENSUEL'
      ? new Date(`${key}-01T00:00:00`)
      : new Date(`${key}-01-01T00:00:00`);

    data.push({
      value: Number(value.toFixed(2)),
      date: date.toISOString()
    });
  }

  return data;
}

// ======================================================
// 📊 DEBUG / STATUS
// ======================================================
function getStatus() {
  return {
    isRunning: isInitialized,
    isScanning,
    lastScan,
    lastError,
	villagesCount: Object.keys(cache.villages).length,
	refsCount: Object.keys(cache.refs).length,
	filesCount: cache.files.length,
    processedFilesCount: Object.keys(processedFiles).length
  };
}

function getCache() {
  return cache;
}

// ======================================================
// 🚀 INIT
// ======================================================
function init() {
  if (isInitialized) return;
  isInitialized = true;

  ensureDirs();
  loadProcessedFiles();

  console.log('🔄 Service EDF initialisé');

  scanIncoming();

	if (config.schedules?.edf) {
	  cron.schedule(config.schedules.edf, () => {
		console.log(`🕒 CRON EDF`);
		scanIncoming();
	  });
	} else {
	  console.log('⚠️ Aucun cron défini pour EDF');
	}
}

module.exports = {
  init,
  scanIncoming,
  getStatus,
  getCache,
  getHistoryFromTag
};
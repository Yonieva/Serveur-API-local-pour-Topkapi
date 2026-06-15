const cron = require('node-cron');
const config = require('../../config');

const { getMeters } = require('./meters');
const { getDigitalInputs } = require('./digitalinputs');
const { getAnalogInputs } = require('./analoginputs');
const { getValvesStatus } = require('./valves');
const { getSensors } = require('./sensors');
const { getPrograms } = require('./programs');

let cache = {
    analogs: [],
    valves: [],
    meters: [],
    digitalInputs: [],
    sensors: [],
    programs: null,
    hydraulicMap: []
};

let lastUpdate = null;
let isInitialized = false;
let isUpdating = false;

// ======================================================
// 🔄 FETCH ICC PRO
// ======================================================
async function fetchICCPro() {
    if (isUpdating) {
        console.log('⚠️ [ICC PRO] MAJ déjà en cours → skip');
        return;
    }

    isUpdating = true;

    console.log(`⏳ [${new Date().toISOString()}] MAJ ICC PRO...`);

    try {
        const [
            analogs,
            valves,
            meters,
            digitalInputs,
            sensors,
            programs
        ] = await Promise.all([
            getAnalogInputs(),
            getValvesStatus(),
            getMeters(),
            getDigitalInputs(),
            getSensors(),
            getPrograms()
        ]);

        cache = {
            analogs,
            valves,
            meters,
            digitalInputs,
            sensors,
            programs,
            hydraulicMap: []
        };

        lastUpdate = new Date();

        console.log(
            `✅ ICC PRO OK | ` +
            `analogs=${analogs.length} ` +
            `valves=${valves.length} ` +
            `meters=${meters.length} ` +
            `digitalInputs=${digitalInputs.length} ` +
            `sensors=${sensors.length} ` +
            `programs=${programs?.raw?.length || 0}`
        );

    } catch (err) {
        console.error('[ICC PRO ERROR]', err.message);
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

    console.log('🔄 Service ICC PRO initialisé');

    fetchICCPro();

    if (config.schedules?.iccpro) {
        cron.schedule(config.schedules.iccpro, () => {
            console.log('🕒 CRON ICC PRO');
            fetchICCPro();
        });
    }
}

// ======================================================
// 📊 STATUS
// ======================================================
function getStatus() {
    return {
        lastUpdate,
        isRunning: isInitialized,
        isUpdating,

        analogCount: cache.analogs.length,
        valveCount: cache.valves.length,
        meterCount: cache.meters.length,
        digitalInputCount: cache.digitalInputs.length,
        sensorCount: cache.sensors.length,
        programCount: cache.programs?.raw?.length || 0,
        farmerCount: cache.programs?.farmers?.length || 0,
        hydraulicMapCount: cache.hydraulicMap.length
    };
}

// ======================================================
// 📡 DATA
// ======================================================
function getData(type) {
    if (!type) return cache;

    switch (type) {
        case 'analogs':
        case 'analoginputs':
            return cache.analogs;

        case 'valves':
            return cache.valves;

        case 'meters':
            return cache.meters;

        case 'sensors':
            return cache.sensors;

        case 'programs':
            return cache.programs;

        case 'digitalinputs':
        case 'digital':
            return cache.digitalInputs;

        case 'mapping':
        case 'hydraulic':
            return cache.hydraulicMap;

        default:
            return null;
    }
}

module.exports = {
    init,
    getStatus,
    getData,
    fetchICCPro
};
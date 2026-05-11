const cron = require('node-cron');
const config = require('../../config');

const { getMeters } = require('./meters');
const { getDigitalInputs } = require('./digitalinputs');
const { getAnalogInputs } = require('./analoginputs');
const { getValvesStatus } = require('./valves');
const { getSensors } = require('./sensors');

let cache = {
    analogs: [],
    valves: [],
    meters: [],
    digitalInputs: [],
    sensors: [],
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
            sensors
        ] = await Promise.all([
            getAnalogInputs(),
            getValvesStatus(),
            getMeters(),
            getDigitalInputs(),
            getSensors()
        ]);

        cache = {
            analogs,
            valves,
            meters,
            digitalInputs,
            sensors,
            hydraulicMap: []
        };

        lastUpdate = new Date();

        console.log(
            `✅ ICC PRO OK | ` +
            `analogs=${analogs.length} ` +
            `valves=${valves.length} ` +
            `meters=${meters.length} ` +
            `digitalInputs=${digitalInputs.length} ` +
            `sensors=${sensors.length}`
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
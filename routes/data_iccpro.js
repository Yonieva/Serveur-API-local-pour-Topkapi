const express = require('express');
const router = express.Router();

const iccproService = require('../services/iccpro/service_iccpro');
const { MAPPING } = require('../services/iccpro/mapping');

// ======================================================
// ❤️ STATUS ICC PRO
// GET /api/iccpro/status
// ======================================================
router.get('/status', (req, res) => {
    res.json({
        success: true,
        service: iccproService.getStatus()
    });
});

// ======================================================
// 🔎 SINGLE TAG VALUE
// GET /api/iccpro/tag/:tag
// ======================================================
router.get('/tag/:tag', (req, res) => {

    const tag = req.params.tag;

    const analogs = iccproService.getData('analogs') || [];
    const valves = iccproService.getData('valves') || [];
    const meters = iccproService.getData('meters') || [];
    const digitalInputs = iccproService.getData('digitalinputs') || [];
    const sensors = iccproService.getData('sensors') || [];

    console.log(`[ICC TAG] ${tag}`);

    // ==================================================
    // 🔵 VALVES
    // ==================================================
    for (const v of MAPPING.valves || []) {

        const valve = valves.find(x => x.id === v.id);
        if (!valve) continue;

        if (tag === v.tags?.open) {
            return res.json({
                success: true,
                data: {
                    value: valve.isOpen ? 1 : 0,
                    lastSample: new Date().toISOString()
                }
            });
        }

        if (tag === v.tags?.alarm) {
            return res.json({
                success: true,
                data: {
                    value: valve.irrigationAlarm || 0,
                    lastSample: new Date().toISOString()
                }
            });
        }

        if (tag === v.tags?.commFail) {
            return res.json({
                success: true,
                data: {
                    value: valve.commFail ? 1 : 0,
                    lastSample: new Date().toISOString()
                }
            });
        }

        if (tag === v.tags?.hwFail) {
            return res.json({
                success: true,
                data: {
                    value: valve.hwFail ? 1 : 0,
                    lastSample: new Date().toISOString()
                }
            });
        }
    }

    // ==================================================
    // 🟢 ANALOG INPUTS
    // ==================================================
    for (const a of MAPPING.analogs || []) {

        const analog = analogs.find(x => x.id === a.id);
        if (!analog) continue;

        if (tag === a.tags?.value) {
            return res.json({
                success: true,
                data: {
                    value: analog.value,
                    lastSample: analog.lastSample
                }
            });
        }

        if (tag === a.tags?.error) {
            return res.json({
                success: true,
                data: {
                    value: analog.hasError ? 1 : 0,
                    lastSample: analog.lastSample
                }
            });
        }
    }

    // ==================================================
    // 🟠 METERS
    // ==================================================
    for (const m of MAPPING.meters || []) {

        const meter = meters.find(x => x.id === m.id);
        if (!meter) continue;

        if (tag === m.tags?.flow) {
            return res.json({
                success: true,
                data: {
                    value: meter.flow,
                    lastSample: meter.lastSample
                }
            });
        }

        if (tag === m.tags?.volume) {
            return res.json({
                success: true,
                data: {
                    value: meter.accumulator,
                    lastSample: meter.lastSample
                }
            });
        }

        if (tag === m.tags?.error) {
            return res.json({
                success: true,
                data: {
                    value: meter.hasError ? 1 : 0,
                    lastSample: meter.lastSample
                }
            });
        }

        if (tag === m.tags?.alarm) {
            return res.json({
                success: true,
                data: {
                    value: meter.uncontrolAlarm ? 1 : 0,
                    lastSample: meter.lastSample
                }
            });
        }
    }

    // ==================================================
    // 🟣 DIGITAL INPUTS
    // ==================================================
    for (const d of MAPPING.digitalInputs || []) {

        const digital = digitalInputs.find(x => x.id === d.id);
        if (!digital) continue;

        if (tag === d.tags?.status) {
            return res.json({
                success: true,
                data: {
                    value: digital.status ? 1 : 0,
                    lastSample: digital.lastSample || new Date().toISOString()
                }
            });
        }

        if (tag === d.tags?.error) {
            return res.json({
                success: true,
                data: {
                    value: digital.hasError ? 1 : 0,
                    lastSample: digital.lastSample || new Date().toISOString()
                }
            });
        }
    }

    // ==================================================
    // 🟡 SENSORS
    // ==================================================
    for (const s of MAPPING.sensors || []) {

        const sensor = sensors.find(x => x.id === s.id);
        if (!sensor) continue;

        if (tag === s.tags?.value) {
            return res.json({
                success: true,
                data: {
                    value: sensor.value,
                    lastSample: sensor.lastSample
                }
            });
        }

        if (tag === s.tags?.error) {
            return res.json({
                success: true,
                data: {
                    value: sensor.hasError ? 1 : 0,
                    lastSample: sensor.lastSample
                }
            });
        }
    }

    return res.status(404).json({
        success: false,
        error: 'ICC PRO tag introuvable',
        tag
    });
});

// ======================================================
// 📦 ALL ICC PRO DATA
// GET /api/iccpro
// ======================================================
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: iccproService.getData(),
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// 🔎 DATA BY TYPE
// GET /api/iccpro/:type
// ======================================================
router.get('/:type', (req, res) => {

    const { type } = req.params;
    const data = iccproService.getData(type);

    if (!data) {
        return res.status(400).json({
            success: false,
            error: 'Type ICC PRO non supporté',
            supported: [
                'analogs',
                'analoginputs',
                'valves',
                'meters',
                'digitalinputs',
                'digital',
                'sensors',
                'mapping',
                'hydraulic'
            ]
        });
    }

    res.json({
        success: true,
        type,
        count: Array.isArray(data) ? data.length : undefined,
        data,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;

const express = require('express');
const router = express.Router();

const nappesService = require('../services/service_nappes');
const qualiteService = require('../services/service_qualite');
const vigicruesService = require('../services/service_vigicrues');
const meteoService = require('../services/service_meteo');
const config = require('../config');


// ======================================================
// 🔵 VIGICRUES SINGLE
// ======================================================
router.get('/vigicrues/:codeStation', async (req, res) => {
    const { codeStation } = req.params;
    const { type } = req.query;

    if (!type || !['H', 'Q'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: "Type invalide. Utilisez ?type=H ou ?type=Q"
        });
    }

    try {
        const data = await vigicruesService.getData(codeStation, type);

        if (!data?.data?.ObssHydro?.length) {
            return res.status(404).json({
                success: false,
                error: "Données non disponibles",
                codeStation,
                type
            });
        }

        const last = data.data.ObssHydro.at(-1);
        const [timestamp, valeur] = last;

        return res.json({
            success: true,
            codeStation,
            type,
            data: {
                date: new Date(timestamp).toISOString(),
                valeur
            }
        });

    } catch (err) {
        console.error(`❌ Vigicrues ${codeStation}:`, err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ======================================================
// 🟢 UNIFIÉ (nappes / qualite / meteo)
// ======================================================
router.get('/:type/:code', (req, res) => {
    const { type, code } = req.params;

    try {
        let data;

        switch (type) {

            case 'nappes':
                data = nappesService.getData(code);
                break;

            case 'qualite':
                data = qualiteService.getData(code);
                break;

            case 'meteo':
                data = meteoService.getData(code);
                break;

            case 'vigicrues':
                return res.status(400).json({
                    success: false,
                    error: "Utilisez /vigicrues/:codeStation?type=H ou Q"
                });

            default:
                return res.status(400).json({
                    success: false,
                    error: "Type non supporté"
                });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "Données non trouvées"
            });
        }

        return res.json({
            success: true,
            type,
            code,
            data,
            timestamp: new Date().toISOString(),

            ...(type === 'qualite' && {
                parametresDisponibles: Object.keys(data.parametres || {}),
                isConforme: data.conclusion?.toLowerCase().includes("conforme") || false,
                datePrelevement: data.date ?? null
            })
        });

    } catch (error) {
        console.error(`[API] ❌ ${type}/${code}:`, error.message);
        return res.status(500).json({
            success: false,
            error: "Erreur interne serveur"
        });
    }
});


// ======================================================
// 🟡 QUALITE ALL
// ======================================================
router.get('/qualite', (req, res) => {
    try {
        const allData = {};

        config.qualite.communes.forEach(code => {
            const data = qualiteService.getData(code);
            if (data) {
                allData[code] = {
                    date: data.date ?? null,
                    parametres: Object.keys(data.parametres || {}).length,
                    conformite: data.conclusion?.toLowerCase().includes("conforme") || false
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


// ======================================================
// 🔵 NAPPES ALL
// ======================================================
router.get('/nappes', (req, res) => {
    try {
        const allData = {};

        config.nappesCodes.forEach(code => {
            const data = nappesService.getData(code);
            if (data) {
                allData[code] = {
                    niveau: data.niveau_eau ?? null,
                    profondeur: data.profondeur ?? null,
                    date: data.date_mesure ?? null
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


// ======================================================
// 🔵 VIGICRUES ALL
// ======================================================
router.get('/vigicrues', async (req, res) => {
    try {
        const allData = {};

        await Promise.all(config.vigicruesCodes.map(async (codeStation) => {

            const [niveau, debit] = await Promise.all([
                vigicruesService.getData(codeStation, 'H'),
                vigicruesService.getData(codeStation, 'Q')
            ]);

            allData[codeStation] = {
                niveau: niveau?.data?.ObssHydro?.length
                    ? (() => {
                        const last = niveau.data.ObssHydro.at(-1);
                        return {
                            date: new Date(last[0]).toISOString(),
                            valeur: last[1]
                        };
                    })()
                    : null,

                debit: debit?.data?.ObssHydro?.length
                    ? (() => {
                        const last = debit.data.ObssHydro.at(-1);
                        return {
                            date: new Date(last[0]).toISOString(),
                            valeur: last[1]
                        };
                    })()
                    : null
            };
        }));

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error('❌ vigicrues ALL:', err.message);
        res.status(500).json({ success: false });
    }
});


// ======================================================
// 🌤️ METEO ALL (FIX CRITIQUE)
// ======================================================
router.get('/meteo', (req, res) => {
    try {
        const allData = {};

        config.meteoSecteurs.forEach(code => {
            const data = meteoService.getData(code);

            if (data) {
                allData[code] = {
                    now: data.now ?? null,
                    h1: data.h1 ?? null,
                    today: data.today ?? null,
                    j1: data.j1 ?? null,
                    j2: data.j2 ?? null,
                    j3: data.j3 ?? null,
                    j4: data.j4 ?? null,
                    j5: data.j5 ?? null,
                    j6: data.j6 ?? null,
                    j7: data.j7 ?? null
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;





/*const express = require('express');
const router = express.Router();

const nappesService = require('../services/service_nappes');
const qualiteService = require('../services/service_qualite');
const vigicruesService = require('../services/service_vigicrues');
const meteoService = require('../services/service_meteo');
const config = require('../config');


// ======================================================
// 🔵 VIGICRUES SINGLE (TOUJOURS EN PREMIER ! IMPORTANT)
// ======================================================
router.get('/vigicrues/:codeStation', async (req, res) => {
    const { codeStation } = req.params;
    const { type } = req.query;

    if (!type || !['H', 'Q'].includes(type)) {
        return res.status(400).json({
            success: false,
            error: "Type invalide. Utilisez ?type=H ou ?type=Q"
        });
    }

    try {
        // sécurité anti crash si service mal chargé
        if (typeof vigicruesService.getData !== 'function') {
            throw new Error('vigicruesService non initialisé correctement');
        }

        const data = await vigicruesService.getData(codeStation, type);

        if (!data?.success || !data?.data?.ObssHydro?.length) {
            return res.status(404).json({
                success: false,
                error: "Données non disponibles",
                codeStation,
                type
            });
        }

        const last = data.data.ObssHydro.at(-1);
        const [timestamp, valeur] = last;

        return res.json({
            success: true,
            codeStation,
            type,
            data: {
                date: new Date(timestamp).toISOString(),
                valeur
            },
            timestamp: new Date().toISOString()
        });

    } catch (err) {
        console.error(`❌ Erreur Vigicrues ${codeStation}:`, err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});


// ======================================================
// 🟢 ENDPOINT UNIFIÉ (NAPPES / QUALITE)
// ======================================================
router.get('/:type/:code', (req, res) => {
    const { type, code } = req.params;

    try {
        let data;
        let availableCodes;

        switch (type) {
            case 'nappes':
                data = nappesService.getData(code);
                availableCodes = config.nappesCodes;
                break;

            case 'qualite':
                data = qualiteService.getData(code);
                availableCodes = config.qualite.communes;
                break;
				
			case 'meteo':
				data = meteoService.getData(code);
				availableCodes = config.meteoSecteurs
				break;

            case 'vigicrues':
                return res.status(400).json({
                    success: false,
                    error: "Utilisez /vigicrues/:codeStation?type=H ou Q"
				});

            default:
                return res.status(400).json({
                    success: false,
                    error: "Type non supporté",
                    supported: ['nappes', 'qualite', 'vigicrues', 'meteo']
				});
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: "Données non trouvées",
                availableCodes
            });
        }

        return res.json({
            success: true,
            type,
            code,
            data,
            timestamp: new Date().toISOString(),
            ...(type === 'qualite' && {
                parametresDisponibles: Object.keys(data.parametres || {}),
                isConforme: data.conclusion?.toLowerCase().includes("conforme") || false,
                datePrelevement: data.date ?? null
            })
        });

    } catch (error) {
        console.error(`[API] ❌ Erreur ${type}/${code}:`, error.message);
        return res.status(500).json({
            success: false,
            error: "Erreur interne serveur"
        });
    }
});


// ======================================================
// 🟡 QUALITE ALL
// ======================================================
router.get('/qualite', (req, res) => {
    try {
        const allData = {};

        config.qualite.communes.forEach(code => {
            const data = qualiteService.getData(code);
            if (data) {
                allData[code] = {
                    date: data.date ?? null,
                    parametres: Object.keys(data.parametres || {}).length,
                    conformite: data.conclusion?.toLowerCase().includes("conforme") || false
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


// ======================================================
// 🔵 NAPPES ALL
// ======================================================
router.get('/nappes', (req, res) => {
    try {
        const allData = {};

        config.nappesCodes.forEach(code => {
            const data = nappesService.getData(code);
            if (data) {
                allData[code] = {
                    niveau: data.niveau_eau ?? null,
                    profondeur: data.profondeur ?? null,
                    date: data.date_mesure ?? null
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});


// ======================================================
// 🔵 VIGICRUES ALL
// ======================================================
router.get('/vigicrues', async (req, res) => {
    try {
        const allData = {};

        await Promise.all(config.vigicruesCodes.map(async (codeStation) => {

            const [niveau, debit] = await Promise.all([
                vigicruesService.getData(codeStation, 'H'),
                vigicruesService.getData(codeStation, 'Q')
            ]);

            allData[codeStation] = {
                niveau: niveau?.success && niveau.data?.ObssHydro?.length
                    ? (() => {
                        const last = niveau.data.ObssHydro.at(-1);
                        return {
                            date: new Date(last[0]).toISOString(),
                            valeur: last[1]
                        };
                    })()
                    : null,

                debit: debit?.success && debit.data?.ObssHydro?.length
                    ? (() => {
                        const last = debit.data.ObssHydro.at(-1);
                        return {
                            date: new Date(last[0]).toISOString(),
                            valeur: last[1]
                        };
                    })()
                    : null
            };
        }));

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error('❌ API vigicrues ALL:', err.message);
        res.status(500).json({ success: false });
    }
});

// ======================================================
// 🌤️ METEO ALL
// ======================================================
router.get('/meteo', (req, res) => {
    try {
        const allData = {};

        config.meteoSecteurs.forEach(code => {
            const data = meteoService.getData(code);
            if (data?.success) {
                allData[code] = {
                    pluie: data.precipitation ?? null,
                    proba: data.probability ?? null,
                    date: data.date ?? null
                };
            }
        });

        res.json({
            success: true,
            count: Object.keys(allData).length,
            data: allData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;*/
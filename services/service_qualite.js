
const axios = require('axios');
const cron = require('node-cron');
const config = require('../config');

let lastResults = {};
let lastUpdate = null;
let isInitialized = false;
let isUpdating = false;

const PARAMETRES_CIBLES = new Set(config.qualite.parametresCibles);

// ======================================================
// 🔄 FETCH QUALITE (SAFE + PARALLELE)
// ======================================================
async function fetchQualiteData() {
    if (isUpdating) {
        console.log('⚠️ [QUALITE] MAJ déjà en cours → skip');
        return;
    }

    isUpdating = true;

    console.log(`⏳ [${new Date().toISOString()}] MAJ QUALITE...`);

    try {
        const communes = config.qualite.communes;

        await Promise.allSettled(
            communes.map(async (codeCommune) => {
                try {
                    // ======================================================
                    // 1. DERNIER PRELEVEMENT
                    // ======================================================
                    const prelevementResponse = await axios.get(
                        `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_commune=${codeCommune}&size=1&sort=desc`,
                        { timeout: config.apiTimeout }
                    );

                    if (!prelevementResponse.data?.data?.length) {
                        console.log(`⚠️ QUALITE ${codeCommune} vide`);
                        return;
                    }

                    const dernier = prelevementResponse.data.data[0];
                    const codePrelevement = dernier.code_prelevement;
                    const currentDate = new Date(dernier.date_prelevement);

                    console.log(`🔍 ${dernier.nom_commune} → ${codePrelevement}`);

                    // ======================================================
                    // 2. DETAILS
                    // ======================================================
                    const detailsResponse = await axios.get(
                        `https://hubeau.eaufrance.fr/api/v1/qualite_eau_potable/resultats_dis?code_prelevement=${codePrelevement}`,
                        { timeout: config.apiTimeout }
                    );

                    if (!detailsResponse.data?.data?.length) {
                        console.log(`⚠️ QUALITE détails vides ${codeCommune}`);
                        return;
                    }

                    // ======================================================
                    // 3. PARAMETRES
                    // ======================================================
                    const nouveauxParametres = {};

                    for (const item of detailsResponse.data.data) {
                        if (PARAMETRES_CIBLES.has(item.libelle_parametre_maj)) {
                            nouveauxParametres[item.libelle_parametre_maj] = {
                                valeur: item.resultat_numerique ?? null,
                                unite: item.libelle_unite,
                                limite: item.limite_qualite_parametre,
                                reference: item.reference_qualite_parametre,
                                date: item.date_prelevement
                            };
                        }
                    }

                    // ======================================================
                    // 4. CONFORMITES
                    // ======================================================
                    const nouvellesConformites = {
                        limites_bact: dernier.conformite_limites_bact_prelevement,
                        limites_pc: dernier.conformite_limites_pc_prelevement,
                        references_bact: dernier.conformite_references_bact_prelevement,
                        references_pc: dernier.conformite_references_pc_prelevement
                    };

                    // ======================================================
                    // 5. COMPARAISON SIMPLE (SAFE)
                    // ======================================================
                    const ancien = lastResults[codeCommune];

                    /*const doitMettreAJour =
                        !ancien ||
                        new Date(ancien.date) < currentDate ||
                        Object.keys(nouveauxParametres).length !== Object.keys(ancien.parametres || {}).length;*/
					const doitMettreAJour =
						!ancien ||
						new Date(ancien.date) < currentDate ||
						ancien.codePrelevement !== codePrelevement ||
						ancien.conclusion !== dernier.conclusion_conformite_prelevement ||
						JSON.stringify(ancien.parametres || {}) !== JSON.stringify(nouveauxParametres) ||
						JSON.stringify(ancien.conformites || {}) !== JSON.stringify(nouvellesConformites);

                    if (doitMettreAJour) {
                        lastResults[codeCommune] = {
                            date: currentDate.toISOString(),
                            nomCommune: dernier.nom_commune,
                            codePrelevement,
                            parametres: nouveauxParametres,
                            conclusion: dernier.conclusion_conformite_prelevement,
                            conformites: nouvellesConformites
                        };

                        console.log(`✅ QUALITE MAJ ${dernier.nom_commune}`);
                    } else {
                        console.log(`🔄 QUALITE stable ${dernier.nom_commune}`);
                    }

                } catch (error) {
                    console.log(`❌ QUALITE ${codeCommune}: ${error.message}`);
                }
            })
        );

        lastUpdate = new Date();

        console.log(`✅ MAJ QUALITE terminée (${Object.keys(lastResults).length})`);

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

    console.log('🔄 Service QUALITE initialisé');

    fetchQualiteData();

    if (config.schedules?.qualite) {
        cron.schedule(config.schedules.qualite, () => {
            console.log(`🕒 CRON QUALITE`);
            fetchQualiteData();
        });
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
function getData(codeCommune) {
    return lastResults[codeCommune] || null;
}

module.exports = {
    init,
    getStatus,
    getData
};


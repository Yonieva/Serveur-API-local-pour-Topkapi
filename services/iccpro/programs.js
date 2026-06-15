const { iccGet } = require("./client");

const FARMERS = [
    "DEMONTE",
    "JONQUERES",
    "GUERTIN",
    "BOLFA",
    "VILA",
	"GRILL",
	"CARBONELL" 
	];

function getFarmerFromName(name) {
    const upper = String(name || "").toUpperCase();
    return FARMERS.find(f => upper.includes(f)) || null;
}

async function getPrograms() {
    try {
        const res = await iccGet("/api/programs/getprograms?utc=1");

        const programs = Array.isArray(res)
            ? res
            : Array.isArray(res.Data)
                ? res.Data
                : [];

        const byFarmer = {};
        const totals = {
            farmer: "TOTAL",
            commande: 0,
            fourni: 0,
            restant: 0,
            count: 0
        };

        for (const p of programs) {
            const farmer = getFarmerFromName(p.Name);
            if (!farmer) continue;

            if (!byFarmer[farmer]) {
                byFarmer[farmer] = {
                    farmer,
                    commande: 0,
                    fourni: 0,
                    restant: 0,
                    count: 0,
                    programs: []
                };
            }

            const commande = Number(p.WaterQuantity || 0) / 1000;
            const fourni = Number(p.ActualWaterQuantity || 0) / 1000;
            const restant = Number(p.RemainingWater || 0) / 1000;

            byFarmer[farmer].commande += commande;
            byFarmer[farmer].fourni += fourni;
            byFarmer[farmer].restant += restant;
            byFarmer[farmer].count += 1;

            byFarmer[farmer].programs.push({
                id: p.Id,
                name: p.Name,
                commande,
                fourni,
                restant,
                status: p.ProgramStatus,
                groupStatus: p.GroupStatus,
                lastSample: p.LastSample
            });

            totals.commande += commande;
            totals.fourni += fourni;
            totals.restant += restant;
            totals.count += 1;
        }

        return {
            totals,
            farmers: Object.values(byFarmer),
            raw: programs
        };

    } catch (err) {
        console.error("[ICC PROGRAMS ERROR]", err.message);
        return {
            totals: {
                farmer: "TOTAL",
                commande: 0,
                fourni: 0,
                restant: 0,
                count: 0
            },
            farmers: [],
            raw: []
        };
    }
}

module.exports = {
    getPrograms
};
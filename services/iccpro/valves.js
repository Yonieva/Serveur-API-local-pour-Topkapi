const { iccGet } = require("./client");

/**
 * Récupère le status des valves ICC PRO
 * endpoint: /api/valves/getgisstatus
 */
async function getValvesStatus() {
    try {
        const res = await iccGet("/api/valves/getgisstatus");

        // sécurité structure
        if (!res || !Array.isArray(res.status)) {
            console.warn("[ICC VALVES] réponse invalide");
            return [];
        }

        const valves = res.status.map(v => ({

            // ID ICC PRO
            id: v.Id ?? null,

            // états ouverture
            manualOpen: !!v.manualopen,
            programOpen: !!v.programopen,

            // valve ouverte ?
            isOpen:
                !!v.manualopen ||
                !!v.programopen,

            // alarmes
            irrigationAlarm: v.IrrigationAlarm ?? 0,

            // défauts communication
            commFail: !!v.commfail,
            hwFail: !!v.hwfail,

            // alarmes hydrauliques
            uncontrolWaterAlarm:
                !!v.UncontrolWaterAlarm,

            uncontrolFertAlarm:
                !!v.UncontrolFertAlarm,

            burstAlarm:
                !!v.BurstAlarm
        }));

        return valves;

    } catch (err) {
        console.error("[ICC VALVES ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getValvesStatus
};
const { iccGet } = require("./client");

/**
 * Récupère les compteurs ICC PRO
 * endpoint: /api/meters/current
 */
async function getMeters() {
    try {
        const res = await iccGet("/api/meters/current");

        if (!res || !Array.isArray(res.Data)) {
            console.warn("[ICC METERS] réponse invalide");
            return [];
        }

        return res.Data.map(m => ({
            id: m.Id ?? null,
            flow: m.Flow ?? null,
            accumulator: m.Accumulator ?? null,
            lastSample: m.LastSampleTime ?? null,
            commFailField: !!m.HasCommFailureWithFieldUnit,
            commFailMeter: !!m.HasCommFailureWithMeter,
            uncontrolAlarm: !!m.UncontrolAlarm,
            hasError:
                !!m.HasCommFailureWithFieldUnit ||
                !!m.HasCommFailureWithMeter ||
                !!m.UncontrolAlarm
        }));

    } catch (err) {
        console.error("[ICC METERS ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getMeters
};
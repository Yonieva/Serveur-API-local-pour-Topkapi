const { iccGet } = require("./client");

/**
 * Récupère les sensors ICC PRO
 * endpoint: /api/sensors/current
 */
async function getSensors() {
    try {
        const res = await iccGet("/api/sensors/current");

        if (!res || !Array.isArray(res.Data)) {
            console.warn("[ICC SENSORS] réponse invalide");
            return [];
        }

        return res.Data.map(s => ({
            id: s.Id ?? null,
            value: s.Value ?? null,
            lastSample: s.LastSampleTime ?? null,
            commFailField: !!s.HasCommFailureWithFieldUnit,
            commFailSensor: !!s.HasCommFailureWithSensor,
            hasError:
                !!s.HasCommFailureWithFieldUnit ||
                !!s.HasCommFailureWithSensor
        }));

    } catch (err) {
        console.error("[ICC SENSORS ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getSensors
};
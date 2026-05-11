const { iccGet } = require("./client");

/**
 * Récupère les analog inputs ICC PRO
 * (pressions, niveaux, sondes...)
 *
 * endpoint:
 * /api/analoginputs/current
 */
async function getAnalogInputs() {
    try {
        const res = await iccGet("/api/analoginputs/current");

        // sécurité structure
        if (!res || !Array.isArray(res.Data)) {
            console.warn("[ICC ANALOG] réponse invalide");
            return [];
        }

        const analogs = res.Data.map(a => ({

            // ID ICC PRO
            id: a.Id ?? null,

            // valeur analogique brute
            value: a.Value ?? null,

            // timestamp ICC PRO
            lastSample: a.LastSampleTime ?? null,

            // défauts communication
            commFailField:
                !!a.HasCommFailureWithFieldUnit,

            commFailSensor:
                !!a.HasCommFailureWithAnalogInput,

            // défaut global pratique
            hasError:
                !!a.HasCommFailureWithFieldUnit ||
                !!a.HasCommFailureWithAnalogInput
        }));

        return analogs;

    } catch (err) {
        console.error("[ICC ANALOG ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getAnalogInputs
};
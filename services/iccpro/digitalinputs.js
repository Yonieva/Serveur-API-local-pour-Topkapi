const { iccGet } = require("./client");

/**
 * Récupère les digital inputs ICC PRO
 * endpoint: /api/digitalinputs/current
 */
async function getDigitalInputs() {
    try {
        const res = await iccGet("/api/digitalinputs/current");

        if (!res || !Array.isArray(res.Data)) {
            console.warn("[ICC DIGITAL] réponse invalide");
            return [];
        }

        return res.Data.map(d => ({
            id: d.Id ?? null,
            status: !!d.Status,
            lastSample: d.LastSampleTime ?? null,
            commFailField: !!d.HasCommFailureWithFieldUnit,
            commFailDigitalInput: !!d.HasCommFailureWithDigitalInput,
            hasError:
                !!d.HasCommFailureWithFieldUnit ||
                !!d.HasCommFailureWithDigitalInput
        }));

    } catch (err) {
        console.error("[ICC DIGITAL ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getDigitalInputs
};
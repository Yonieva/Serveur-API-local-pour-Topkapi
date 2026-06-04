/**
 * Récupère les compteurs ICC PRO
 *
 * /api/meters/current = valeurs temps réel
 * /api/meters         = infos fixes : Name, Description, unités...
 */
const { iccGet } = require("./client");
async function getMeters() {
    try {
        const [currentRes, infosRes] = await Promise.all([
            iccGet("/api/meters/current"),
            iccGet("/api/meters")
        ]);

        if (!currentRes || !Array.isArray(currentRes.Data)) {
            console.warn("[ICC METERS] réponse current invalide");
            return [];
        }

        const infos = Array.isArray(infosRes)
            ? infosRes
            : Array.isArray(infosRes.Data)
                ? infosRes.Data
                : [];

        return currentRes.Data.map(m => {
            const info = infos.find(i => i.Id === m.Id);

            return {
                id: m.Id ?? null,

                name: info?.Name ?? null,
                description: info?.Description ?? null,
                fieldUnitId: info?.FieldUnitId ?? null,
                flowUnit: info?.FlowUnit ?? null,
                volumeUnit: info?.VolumeUnit ?? null,
                ownerId: info?.OwnerId ?? null,
                ownerType: info?.OwnerType ?? null,

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
            };
        });

    } catch (err) {
        console.error("[ICC METERS ERROR]", err.message);
        return [];
    }
}

module.exports = {
    getMeters
};
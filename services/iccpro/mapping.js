const MAPPING = {
    analogs: [
        //{ id: 1, borne: "STATION_REUT", description: "Debit de production", unit: "m3/h", tags: { value: "ICCPRO_STATION_REUT_DEBIT_PRODUCTION", error: "ICCPRO_STATION_REUT_DEBIT_PRODUCTION_ERR" } },
        //{ id: 2, borne: "STATION_REUT", description: "Hauteur bache", unit: "cm", tags: { value: "ICCPRO_STATION_REUT_HAUTEUR_BACHE", error: "ICCPRO_STATION_REUT_HAUTEUR_BACHE_ERR" } },
        //{ id: 3, borne: "STATION_REUT", description: "Pression production", unit: "Bars", tags: { value: "ICCPRO_STATION_REUT_PRESS_PRODUCTION", error: "ICCPRO_STATION_REUT_PRESS_PRODUCTION_ERR" } },
        //{ id: 4, borne: "STATION_REUT", description: "Puissance production", unit: "Kw", tags: { value: "ICCPRO_STATION_REUT_PUISSANCE_PRODUCTION", error: "ICCPRO_STATION_REUT_PUISSANCE_PRODUCTION_ERR" } },

        { id: 5, borne: "B0014", description: "Pression amont filtre", unit: "bars", tags: { value: "ICCPRO_B0014_PRESS_AMONT_FILTR", error: "ICCPRO_B0014_PRESS_AMONT_FILTR_ERR" } },
        { id: 6, borne: "B0014", description: "Pression reseau", unit: "bars", tags: { value: "ICCPRO_B0014_PRESS_RESEAU", error: "ICCPRO_B0014_PRESS_RESEAU_ERR" } },
        { id: 7, borne: "B0004", description: "Pression amont filtre", unit: "bars", tags: { value: "ICCPRO_B0004_PRESS_AMONT_FILTR", error: "ICCPRO_B0004_PRESS_AMONT_FILTR_ERR" } },
        { id: 8, borne: "B0014", description: "Pression aval filtre", unit: "bars", tags: { value: "ICCPRO_B0014_PRESS_AVAL_FILTR", error: "ICCPRO_B0014_PRESS_AVAL_FILTR_ERR" } },
        { id: 9, borne: "B0011", description: "Pression reseau", unit: "bars", tags: { value: "ICCPRO_B0011_PRESS_RESEAU", error: "ICCPRO_B0011_PRESS_RESEAU_ERR" } },
        { id: 10, borne: "B0011", description: "Pression amont filtre", unit: "bars", tags: { value: "ICCPRO_B0011_PRESS_AMONT_FILTR", error: "ICCPRO_B0011_PRESS_AMONT_FILTR_ERR" } },
        { id: 11, borne: "B0011", description: "Pression aval filtre", unit: "bars", tags: { value: "ICCPRO_B0011_PRESS_AVAL_FILTR", error: "ICCPRO_B0011_PRESS_AVAL_FILTR_ERR" } },
        { id: 12, borne: "B0001", description: "Pression amont filtre", unit: "bars", tags: { value: "ICCPRO_B0001_PRESS_AMONT_FILTR", error: "ICCPRO_B0001_PRESS_AMONT_FILTR_ERR" } },
        { id: 13, borne: "B0001", description: "Pression aval filtre", unit: "bars", tags: { value: "ICCPRO_B0001_PRESS_AVAL_FILTR", error: "ICCPRO_B0001_PRESS_AVAL_FILTR_ERR" } },
        { id: 14, borne: "B0004", description: "Pression reseau", unit: "bars", tags: { value: "ICCPRO_B0004_PRESS_RESEAU", error: "ICCPRO_B0004_PRESS_RESEAU_ERR" } },
        { id: 15, borne: "B0004", description: "Pression aval filtre", unit: "bars", tags: { value: "ICCPRO_B0004_PRESS_AVAL_FILTR", error: "ICCPRO_B0004_PRESS_AVAL_FILTR_ERR" } },
        { id: 16, borne: "B0001", description: "Pression reseau", unit: "bars", tags: { value: "ICCPRO_B0001_PRESS_RESEAU", error: "ICCPRO_B0001_PRESS_RESEAU_ERR" } }
    ],

    digitalInputs: [
        {
            id: 2,
            name: "CC ACVI- MARCHE PURGE FILTR",
            description: "B01-04-11",
            fieldUnitId: 2,
            designation: "Cas purge reseau via vidange filtre 01-04-11",
            tags: {
                status: "ICCPRO_DIGI_MARCHE_PURGE_FILTR_STATUS",
                error: "ICCPRO_DIGI_MARCHE_PURGE_FILTR_ERR"
            }
        },
        {
            id: 3,
            name: "CC ACVI- MARCHE PURGE TAXO",
            description: null,
            fieldUnitId: 2,
            designation: "Lors d'un mode maintenance réseau ou purge - mise en marche sortie Taxo à proximitée cabine 09 et 10",
            tags: {
                status: "ICCPRO_DIGI_MARCHE_PURGE_TAXO_STATUS",
                error: "ICCPRO_DIGI_MARCHE_PURGE_TAXO_ERR"
            }
        },
        {
            id: 4,
            name: "CC ACVI- MARCHE PURGE PALAU",
            description: null,
            fieldUnitId: 2,
            designation: "Lors d'un mode maintenance réseau ou purge - mise en marche sortie Palau à proximitée de la cabine 14",
            tags: {
                status: "ICCPRO_DIGI_MARCHE_PURGE_PALAU_STATUS",
                error: "ICCPRO_DIGI_MARCHE_PURGE_PALAU_ERR"
            }
        },
        {
            id: 5,
            name: "CC ACVI- ARRET CABINE",
            description: null,
            fieldUnitId: 2,
            designation: "Lors d'un mode maintenance réseau ou purge - mise en arret d'irrigation de toute les cabine",
            tags: {
                status: "ICCPRO_DIGI_ARRET_CABINE_STATUS",
                error: "ICCPRO_DIGI_ARRET_CABINE_ERR"
            }
        }
    ],

    valves: [
        { id: 1, name: "B0001_V1", description: "Château de Valmy_Carbonnell Bernard_Débit max 30m³", fieldUnitId: 5, ownerId: 1, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0001_V1_OUVERTE", alarm: "ICCPRO_B0001_V1_ALARME", commFail: "ICCPRO_B0001_V1_COMM_FAIL", hwFail: "ICCPRO_B0001_V1_HW_FAIL" } },
        { id: 92, name: "B0013_VMV", description: null, fieldUnitId: 4, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0013_VMV_OUVERTE", alarm: "ICCPRO_B0013_VMV_ALARME", commFail: "ICCPRO_B0013_VMV_COMM_FAIL", hwFail: "ICCPRO_B0013_VMV_HW_FAIL" } },
        { id: 7, name: "B0002_V1", description: "Demonte Claude_Débit max 20m³", fieldUnitId: 3, ownerId: 2, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0002_V1_OUVERTE", alarm: "ICCPRO_B0002_V1_ALARME", commFail: "ICCPRO_B0002_V1_COMM_FAIL", hwFail: "ICCPRO_B0002_V1_HW_FAIL" } },
        { id: 18, name: "B0003_1_V1", description: "Grill Julien_Débit max 20m³", fieldUnitId: 3, ownerId: 3, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0003_1_V1_OUVERTE", alarm: "ICCPRO_B0003_1_V1_ALARME", commFail: "ICCPRO_B0003_1_V1_COMM_FAIL", hwFail: "ICCPRO_B0003_1_V1_HW_FAIL" } },
        { id: 26, name: "B0005_V1", description: "Jonquères Jean_Débit max 20m³", fieldUnitId: 3, ownerId: 6, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0005_V1_OUVERTE", alarm: "ICCPRO_B0005_V1_ALARME", commFail: "ICCPRO_B0005_V1_COMM_FAIL", hwFail: "ICCPRO_B0005_V1_HW_FAIL" } },
        { id: 47, name: "B0010_V1", description: "Vila Franck_Débit max 70m³", fieldUnitId: 3, ownerId: 12, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0010_V1_OUVERTE", alarm: "ICCPRO_B0010_V1_ALARME", commFail: "ICCPRO_B0010_V1_COMM_FAIL", hwFail: "ICCPRO_B0010_V1_HW_FAIL" } },
        { id: 41, name: "B0009_V1", description: "Guertin Benjamin_Débit max 105m³", fieldUnitId: 3, ownerId: 11, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0009_V1_OUVERTE", alarm: "ICCPRO_B0009_V1_ALARME", commFail: "ICCPRO_B0009_V1_COMM_FAIL", hwFail: "ICCPRO_B0009_V1_HW_FAIL" } },
        { id: 57, name: "B0011_V1", description: "Jonquères Jean et Frère_Débit max 50m³", fieldUnitId: 6, ownerId: 0, ownerType: 0, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0011_V1_OUVERTE", alarm: "ICCPRO_B0011_V1_ALARME", commFail: "ICCPRO_B0011_V1_COMM_FAIL", hwFail: "ICCPRO_B0011_V1_HW_FAIL" } },
        { id: 35, name: "B0008_1_V1", description: "Demonte Claude_Débit max 20m³", fieldUnitId: 3, ownerId: 9, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0008_1_V1_OUVERTE", alarm: "ICCPRO_B0008_1_V1_ALARME", commFail: "ICCPRO_B0008_1_V1_COMM_FAIL", hwFail: "ICCPRO_B0008_1_V1_HW_FAIL" } },
        { id: 39, name: "B0008_2_V2", description: "Jonquères Jean_Débit max 20m³", fieldUnitId: 3, ownerId: 10, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0008_2_V2_OUVERTE", alarm: "ICCPRO_B0008_2_V2_ALARME", commFail: "ICCPRO_B0008_2_V2_COMM_FAIL", hwFail: "ICCPRO_B0008_2_V2_HW_FAIL" } },
        { id: 29, name: "B0007_1_V1", description: "Demonte Claude_Débit max 10m³", fieldUnitId: 3, ownerId: 7, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0007_1_V1_OUVERTE", alarm: "ICCPRO_B0007_1_V1_ALARME", commFail: "ICCPRO_B0007_1_V1_COMM_FAIL", hwFail: "ICCPRO_B0007_1_V1_HW_FAIL" } },
        { id: 33, name: "B0007_2_V2", description: "Vila Franck_Débit max 10m³", fieldUnitId: 3, ownerId: 8, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0007_2_V2_OUVERTE", alarm: "ICCPRO_B0007_2_V2_ALARME", commFail: "ICCPRO_B0007_2_V2_COMM_FAIL", hwFail: "ICCPRO_B0007_2_V2_HW_FAIL" } },
        { id: 21, name: "B0003_2_V2", description: "Demonte Claude_Débit max 20m³", fieldUnitId: 3, ownerId: 4, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0003_2_V2_OUVERTE", alarm: "ICCPRO_B0003_2_V2_ALARME", commFail: "ICCPRO_B0003_2_V2_COMM_FAIL", hwFail: "ICCPRO_B0003_2_V2_HW_FAIL" } },
        { id: 23, name: "B0004_V1", description: "Jonquères Jean_Débit max 50m³", fieldUnitId: 3, ownerId: 5, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0004_V1_OUVERTE", alarm: "ICCPRO_B0004_V1_ALARME", commFail: "ICCPRO_B0004_V1_COMM_FAIL", hwFail: "ICCPRO_B0004_V1_HW_FAIL" } },
        { id: 62, name: "B0013_V1", description: "Jonquères Jean_Débit max 120m³", fieldUnitId: 4, ownerId: 14, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0013_V1_OUVERTE", alarm: "ICCPRO_B0013_V1_ALARME", commFail: "ICCPRO_B0013_V1_COMM_FAIL", hwFail: "ICCPRO_B0013_V1_HW_FAIL" } },
        { id: 66, name: "B0014_1_V01", description: "Bolfa Patrick_Débit max 50m³", fieldUnitId: 4, ownerId: 15, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0014_1_V01_OUVERTE", alarm: "ICCPRO_B0014_1_V01_ALARME", commFail: "ICCPRO_B0014_1_V01_COMM_FAIL", hwFail: "ICCPRO_B0014_1_V01_HW_FAIL" } },
        { id: 82, name: "B0001_VMV", description: "Vanne de régulation", fieldUnitId: 5, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0001_VMV_OUVERTE", alarm: "ICCPRO_B0001_VMV_ALARME", commFail: "ICCPRO_B0001_VMV_COMM_FAIL", hwFail: "ICCPRO_B0001_VMV_HW_FAIL" } },
        { id: 83, name: "B0002_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0002_VMV_OUVERTE", alarm: "ICCPRO_B0002_VMV_ALARME", commFail: "ICCPRO_B0002_VMV_COMM_FAIL", hwFail: "ICCPRO_B0002_VMV_HW_FAIL" } },
        { id: 84, name: "B0003_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0003_VMV_OUVERTE", alarm: "ICCPRO_B0003_VMV_ALARME", commFail: "ICCPRO_B0003_VMV_COMM_FAIL", hwFail: "ICCPRO_B0003_VMV_HW_FAIL" } },
        { id: 74, name: "B0014_2_V2", description: "Vila Franck_Débit max 50m³", fieldUnitId: 4, ownerId: 16, ownerType: 1, designation: "Vanne compteur cabine", tags: { open: "ICCPRO_B0014_2_V2_OUVERTE", alarm: "ICCPRO_ICCPRO_B0014_2_V2_ALARME", commFail: "ICCPRO_B0014_2_V2_COMM_FAIL", hwFail: "ICCPRO_B0014_2_V2_HW_FAIL" } },
        { id: 85, name: "B0004_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_ICCPRO_B0004_VMV_OUVERTE", alarm: "ICCPRO_B0004_VMV_ALARME", commFail: "ICCPRO_B0004_VMV_COMM_FAIL", hwFail: "ICCPRO_B0004_VMV_HW_FAIL" } },
        { id: 90, name: "B0010_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0010_VMV_OUVERTE", alarm: "ICCPRO_B0010_VMV_ALARME", commFail: "ICCPRO_B0010_VMV_COMM_FAIL", hwFail: "ICCPRO_B0010_VMV_HW_FAIL" } },
        { id: 89, name: "B0009_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0009_VMV_OUVERTE", alarm: "ICCPRO_B0009_VMV_ALARME", commFail: "ICCPRO_B0009_VMV_COMM_FAIL", hwFail: "ICCPRO_B0009_VMV_HW_FAIL" } },
        { id: 86, name: "B0005_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0005_VMV_OUVERTE", alarm: "ICCPRO_B0005_VMV_ALARME", commFail: "ICCPRO_B0005_VMV_COMM_FAIL", hwFail: "ICCPRO_B0005_VMV_HW_FAIL" } },
        { id: 93, name: "B0014_VMV", description: null, fieldUnitId: 4, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0014_VMV_OUVERTE", alarm: "ICCPRO_B0014_VMV_ALARME", commFail: "ICCPRO_B0014_VMV_COMM_FAIL", hwFail: "ICCPRO_B0014_VMV_HW_FAIL" } },
        { id: 87, name: "B0007_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0007_VMV_OUVERTE", alarm: "ICCPRO_B0007_VMV_ALARME", commFail: "ICCPRO_B0007_VMV_COMM_FAIL", hwFail: "ICCPRO_B0007_VMV_HW_FAIL" } },
        { id: 91, name: "B0011_VMV", description: null, fieldUnitId: 6, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0011_VMV_OUVERTE", alarm: "ICCPRO_B0011_VMV_ALARME", commFail: "ICCPRO_B0011_VMV_COMM_FAIL", hwFail: "ICCPRO_B0011_VMV_HW_FAIL" } },
        { id: 88, name: "B0008_VMV", description: null, fieldUnitId: 3, ownerId: 0, ownerType: 0, designation: "Vanne maitresse-generale- cabine", tags: { open: "ICCPRO_B0008_VMV_OUVERTE", alarm: "ICCPRO_B0008_VMV_ALARME", commFail: "ICCPRO_B0008_VMV_COMM_FAIL", hwFail: "ICCPRO_B0008_VMV_HW_FAIL" } }
    ],

    sensors: [
        { id: 4, borne: "B0002", description: "Pression reseau", tags: { value: "ICCPRO_B0002_PRESS_RESEAU", error: "ICCPRO_B0002_PRESS_RESEAU_ERR" } },
        { id: 5, borne: "B0002", description: "Pression amont filtre", tags: { value: "ICCPRO_B0002_PRESS_AMONT_FILTR", error: "ICCPRO_B0002_PRESS_AMONT_FILTR_ERR" } },
        { id: 6, borne: "B0002", description: "Pression aval filtre", tags: { value: "ICCPRO_B0002_PRESS_AVAL_FILTR", error: "ICCPRO_B0002_PRESS_AVAL_FILTR_ERR" } },
        { id: 7, borne: "B0003", description: "Pression reseau", tags: { value: "ICCPRO_B0003_PRESS_RESEAU", error: "ICCPRO_B0003_PRESS_RESEAU_ERR" } },
        { id: 8, borne: "B0003", description: "Pression amont filtre", tags: { value: "ICCPRO_B0003_PRESS_AMONT_FILTR", error: "ICCPRO_B0003_PRESS_AMONT_FILTR_ERR" } },
        { id: 9, borne: "B0003", description: "Pression aval filtre", tags: { value: "ICCPRO_B0003_PRESS_AVAL_FILTR", error: "ICCPRO_B0003_PRESS_AVAL_FILTR_ERR" } },
        { id: 13, borne: "B0005", description: "Pression reseau", tags: { value: "ICCPRO_B0005_PRESS_RESEAU", error: "ICCPRO_B0005_PRESS_RESEAU_ERR" } },
        { id: 14, borne: "B0005", description: "Pression amont filtre", tags: { value: "ICCPRO_B0005_PRESS_AMONT_FILTR", error: "ICCPRO_B0005_PRESS_AMONT_FILTR_ERR" } },
        { id: 15, borne: "B0005", description: "Pression aval filtre", tags: { value: "ICCPRO_B0005_PRESS_AVAL_FILTR", error: "ICCPRO_B0005_PRESS_AVAL_FILTR_ERR" } },
        { id: 16, borne: "B0007", description: "Pression reseau", tags: { value: "ICCPRO_B0007_PRESS_RESEAU", error: "ICCPRO_B0007_PRESS_RESEAU_ERR" } },
        { id: 17, borne: "B0007", description: "Pression amont filtre", tags: { value: "ICCPRO_B0007_PRESS_AMONT_FILTR", error: "ICCPRO_B0007_PRESS_AMONT_FILTR_ERR" } },
        { id: 18, borne: "B0007", description: "Pression aval filtre", tags: { value: "ICCPRO_B0007_PRESS_AVAL_FILTR", error: "ICCPRO_B0007_PRESS_AVAL_FILTR_ERR" } },
        { id: 19, borne: "B0008", description: "Pression amont filtre", tags: { value: "ICCPRO_B0008_PRESS_AMONT_FILTR", error: "ICCPRO_B0008_PRESS_AMONT_FILTR_ERR" } },
        { id: 20, borne: "B0008", description: "Pression reseau", tags: { value: "ICCPRO_B0008_PRESS_RESEAU", error: "ICCPRO_B0008_PRESS_RESEAU_ERR" } },
        { id: 21, borne: "B0008", description: "Pression aval filtre", tags: { value: "ICCPRO_B0008_PRESS_AVAL_FILTR", error: "ICCPRO_B0008_PRESS_AVAL_FILTR_ERR" } },
        { id: 22, borne: "B0009", description: "Pression reseau", tags: { value: "ICCPRO_B0009_PRESS_RESEAU", error: "ICCPRO_B0009_PRESS_RESEAU_ERR" } },
        { id: 23, borne: "B0009", description: "Pression amont filtre", tags: { value: "ICCPRO_B0009_PRESS_AMONT_FILTR", error: "ICCPRO_B0009_PRESS_AMONT_FILTR_ERR" } },
        { id: 24, borne: "B0009", description: "Pression aval filtre", tags: { value: "ICCPRO_B0009_PRESS_AVAL_FILTR", error: "ICCPRO_B0009_PRESS_AVAL_FILTR_ERR" } },
        { id: 25, borne: "B0010", description: "Pression reseau", tags: { value: "ICCPRO_B0010_PRESS_RESEAU", error: "ICCPRO_B0010_PRESS_RESEAU_ERR" } },
        { id: 26, borne: "B0010", description: "Pression amont filtre", tags: { value: "ICCPRO_B0010_PRESS_AMONT_FILTR", error: "ICCPRO_B0010_PRESS_AMONT_FILTR_ERR" } },
        { id: 27, borne: "B0010", description: "Pression aval filtre", tags: { value: "ICCPRO_B0010_PRESS_AVAL_FILTR", error: "ICCPRO_B0010_PRESS_AVAL_FILTR_ERR" } },
        { id: 31, borne: "B0013", description: "Pression reseau", tags: { value: "ICCPRO_B0013_PRESS_RESEAU", error: "ICCPRO_B0013_PRESS_RESEAU_ERR" } },
        { id: 32, borne: "B0013", description: "Pression amont filtre", tags: { value: "ICCPRO_B0013_PRESS_AMONT_FILTR", error: "ICCPRO_B0013_PRESS_AMONT_FILTR_ERR" } },
        { id: 33, borne: "B0013", description: "Pression aval filtre", tags: { value: "ICCPRO_B0013_PRESS_AVAL_FILTR", error: "ICCPRO_B0013_PRESS_AVAL_FILTR_ERR" } },
        { id: 37, borne: "B0008", description: "Tension batterie", tags: { value: "ICCPRO_B0008_TENSION_BATTERIE", error: "ICCPRO_B0008_TENSION_BATTERIE_ERR" } },
        { id: 38, borne: "B0008", description: "RSSI signal com", tags: { value: "ICCPRO_B0008_RSSI_SIGNAL_COM", error: "ICCPRO_B0008_RSSI_SIGNAL_COM_ERR" } },
        { id: 39, borne: "B0009", description: "RSSI signal com", tags: { value: "ICCPRO_B0009_RSSI_SIGNAL_COM", error: "ICCPRO_B0009_RSSI_SIGNAL_COM_ERR" } },
        { id: 40, borne: "B0009", description: "Tension batterie", tags: { value: "ICCPRO_B0009_TENSION_BATTERIE", error: "ICCPRO_B0009_TENSION_BATTERIE_ERR" } }
    ],

    meters: [
        { id: 8, name: "CR0008_1", description: "Demonte Claude", fieldUnitId: 3, ownerId: 9, ownerType: 1, tags: { flow: "ICCPRO_CR0008_1_DEBIT", volume: "ICCPRO_CR0008_1_VOLUME", error: "ICCPRO_CR0008_1_ERR" } },
        { id: 4, name: "CR0003_2", description: "Demonte Claude", fieldUnitId: 3, ownerId: 4, ownerType: 1, tags: { flow: "ICCPRO_CR0003_2_DEBIT", volume: "ICCPRO_CR0003_2_VOLUME", error: "ICCPRO_CR0003_2_ERR" } },
        { id: 15, name: "CR0014_1", description: "Bolfa Patrick", fieldUnitId: 4, ownerId: 15, ownerType: 1, tags: { flow: "ICCPRO_CR0014_1_DEBIT", volume: "ICCPRO_CR0014_1_VOLUME", error: "ICCPRO_CR0014_1_ERR" } },
        { id: 16, name: "CR0014_2", description: "Vila Franck", fieldUnitId: 4, ownerId: 16, ownerType: 1, tags: { flow: "ICCPRO_CR0014_2_DEBIT", volume: "ICCPRO_CR0014_2_VOLUME", error: "ICCPRO_CR0014_2_ERR" } },
        { id: 14, name: "CR0013", description: "Jonquères Jean", fieldUnitId: 4, ownerId: 14, ownerType: 1, tags: { flow: "ICCPRO_CR0013_DEBIT", volume: "ICCPRO_CR0013_VOLUME", error: "ICCPRO_CR0013_ERR" } },
        { id: 13, name: "CR0011", description: "Jonquères Jean", fieldUnitId: 6, ownerId: 13, ownerType: 1, tags: { flow: "ICCPRO_CR0011_DEBIT", volume: "ICCPRO_CR0011_VOLUME", error: "ICCPRO_CR0011_ERR" } },
        { id: 5, name: "CR0004", description: "Jonquères Jean", fieldUnitId: 3, ownerId: 5, ownerType: 1, tags: { flow: "ICCPRO_CR0004_DEBIT", volume: "ICCPRO_CR0004_VOLUME", error: "ICCPRO_CR0004_ERR" } },
        { id: 1, name: "CR0001", description: "Château de Valmy_carbonnell Bernard", fieldUnitId: 5, ownerId: 1, ownerType: 1, tags: { flow: "ICCPRO_CR0001_DEBIT", volume: "ICCPRO_CR0001_VOLUME", error: "ICCPRO_CR0001_ERR" } },
        { id: 3, name: "CR0003_1", description: "Grill Julien", fieldUnitId: 3, ownerId: 3, ownerType: 1, tags: { flow: "ICCPRO_CR0003_1_DEBIT", volume: "ICCPRO_CR0003_1_VOLUME", error: "ICCPRO_CR0003_1_ERR" } },
        { id: 2, name: "CR0002", description: "Demonte Claude", fieldUnitId: 3, ownerId: 2, ownerType: 1, tags: { flow: "ICCPRO_CR0002_DEBIT", volume: "ICCPRO_CR0002_VOLUME", error: "ICCPRO_CR0002_ERR" } },
        { id: 7, name: "CR0007_1", description: "Demonte Claude", fieldUnitId: 3, ownerId: 7, ownerType: 1, tags: { flow: "ICCPRO_CR0007_1_DEBIT", volume: "ICCPRO_CR0007_1_VOLUME", error: "ICCPRO_CR0007_1_ERR" } },
        { id: 6, name: "CR0005", description: "Jonquères Jean", fieldUnitId: 3, ownerId: 6, ownerType: 1, tags: { flow: "ICCPRO_CR0005_DEBIT", volume: "ICCPRO_CR0005_VOLUME", error: "ICCPRO_CR0005_ERR" } },
        { id: 12, name: "CR0008_2", description: "Jonquères Jean", fieldUnitId: 3, ownerId: 10, ownerType: 1, tags: { flow: "CR0008_2_DEBIT", volume: "ICCPRO_CR0008_2_VOLUME", error: "ICCPRO_CR0008_2_ERR" } },
        { id: 11, name: "CR0007_2", description: "Vila Franck", fieldUnitId: 3, ownerId: 8, ownerType: 1, tags: { flow: "ICCPRO_CR0007_2_DEBIT", volume: "ICCPRO_CR0007_2_VOLUME", error: "ICCPRO_CR0007_2_ERR" } },
        { id: 9, name: "CR0009", description: "Guertin Benjamin", fieldUnitId: 3, ownerId: 11, ownerType: 1, tags: { flow: "ICCPRO_CR0009_DEBIT", volume: "ICCPRO_CR0009_VOLUME", error: "ICCPRO_CR0009_ERR" } },
        { id: 10, name: "CR0010", description: "Vila Franck", fieldUnitId: 3, ownerId: 12, ownerType: 1, tags: { flow: "ICCPRO_CR0010_DEBIT", volume: "ICCPRO_CR0010_VOLUME", error: "ICCPRO_CR0010_ERR" } }
    ]
};

module.exports = {
    MAPPING
};
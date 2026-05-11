require('dotenv').config();

module.exports = 
{
//--------------------------------------------------------------------------------------------------
  // Configuration générale du serveur
  port: 3000,
  host: '0.0.0.0',
  apiTimeout: 15000,  // Timeout pour les requêtes API (15 secondes)
  
  
//--------------------------------------------------------------------------------------------------
// Planification des mises à jour
  schedules: {
    nappes: '0 5 * * *',        // Tous les jours à 7h00 pour les nappes 
    qualite: '0 15 * * *',      // Tous les jours à 17h00 pour la qualité
	vigicrues: '0 * * * *',     // Toutes les heures (a la minute 0 de chaque heure)
	meteo: '*/10 * * * *',       // Toutes les 10 minutes
	iccpro: '*/5 * * * *'		// Toutes les 5 minutes
  },
   
//--------------------------------------------------------------------------------------------------
  // Codes BSS pour les nappes
  nappesCodes: [
    "10971X0198/LAFAR",
    "10972X0137/PONT", "10976X0058/RIMBAU",
    "10975X0032/SABIRO"
  ],
  
//--------------------------------------------------------------------------------------------------
  // Codes INSEE pour la qualité
  qualite: {
    communes: [
      "66008", "66011", "66016", "66048", "66053", "66065", "66093",
      "66115", "66129", "66133", "66148", "66168", "66175", "66196", "66225"
    ],
  parametresCibles: [ 
    "PH ", "CHLORE TOTAL", "CHLORE LIBRE", "TURBIDITÉ NÉPHÉLOMÉTRIQUE NFU", "CONDUCTIVITÉ À 25°C"
	]
  },
//--------------------------------------------------------------------------------------------------
  // Codes station pour surveillance crues
  vigicruesCodes: [
	"Y028406001",
	"Y011541001",
	"Y010522001"
	],
//--------------------------------------------------------------------------------------------------
  // Coordonnées Secteur(PR) pour la météo (pluviométrie)
  meteoSecteurs: {
    ARGELES: { 
      latitude: 42.5471, 
      longitude: 3.0225,
      api: "API_METEO_ARGELES"
    },
	BAGES: { 
      latitude: 42.606, 
      longitude: 2.8935,
      api: "API_METEO_BAGES"
    },
    BANYULS: { 
      latitude: 42.4838, 
      longitude: 3.129,
      api: "API_METEO_BANYULS"
    },
	CERBERE: { 
      latitude: 42.4525, 
      longitude: 3.1592,
      api: "API_METEO_CERBERE"
    },
	COLLIOURE: { 
      latitude: 42.5246, 
      longitude: 3.0823,
      api: "API_METEO_COLLIOURE"
    },
	ELNES: { 
      latitude: 42.6043, 
      longitude: 2.9718,
      api: "API_METEO_ELNES"
    },
	LAROQUE: { 
      latitude: 42.5235, 
      longitude: 2.9316,
      api: "API_METEO_LAROQUE"
    },
	MONTESQUIEU: { 
      latitude: 42.5199, 
      longitude: 2.8760,
      api: "API_METEO_MONTESQUIEU"
    },
	ORTAFFA: { 
      latitude: 42.5802, 
      longitude: 2.925,
      api: "API_METEO_ORTAFFA"
    },
	PALAU: { 
      latitude: 42.5724, 
      longitude: 2.9611,
      api: "API_METEO_PALAU"
    },
	PORTVENDRES: { 
      latitude: 42.5179, 
      longitude: 3.1055,
      api: "API_METEO_PORTVENDRES"
    },
	SAINTANDRE: { 
      latitude: 42.552, 
      longitude: 2.9713,
      api: "API_METEO_SAINTANDRE"
    },
	SAINTGENIS: { 
      latitude: 42.5433, 
      longitude: 2.9206,
      api: "API_METEO_SAINTGENIS"
    },
	SOREDE: { 
      latitude: 42.5307, 
      longitude: 2.9571,
      api: "API_METEO_SOREDE"
    },
	VILELONGUE: { 
      latitude: 42.5256, 
      longitude: 2.9043,
      api: "API_METEO_VILLELONGUE"
    },
  },

//--------------------------------------------------------------------------------------------------
  // REUT-ICCPRO

  iccpro: {
    baseUrl: process.env.ICCPRO_BASE_URL,
    tokenUrl: "/token",

    username: process.env.ICCPRO_USERNAME,
    password: process.env.ICCPRO_PASSWORD,

    clientId: process.env.ICCPRO_CLIENT_ID,
    clientSecret: process.env.ICCPRO_CLIENT_SECRET,

    timeout: 15000
  }
  
};
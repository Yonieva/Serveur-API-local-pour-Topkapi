# Serveur API local pour Topkapi

Projet réalisé dans le cadre de mon stage à la Communauté de Communes.

Ce serveur Node.js sert d’intermédiaire entre le logiciel Topkapi et plusieurs API externes :
- Open-Meteo
- Hub’Eau Nappes
- Hub’Eau Qualité Eau Potable
- Vigicrues
- EDF
- INSEE
- ICCPRO / REUT (Réutilisation des Eaux Usées après Traitement)

## Objectif

Topkapi appelle ce serveur local, qui récupère les données externes, les reformate, puis renvoie une réponse JSON simple exploitable par le script Topkapi.

## Architecture
Topkapi → Script Topkapi → Serveur Node.js local → APIs externes

## Exemple final pour un Utilisateur
HYPERVISION QUALITE DE l'EAU (exemple, chiffres factices)
<img width="1672" height="941" alt="Qualité - General" src="https://github.com/user-attachments/assets/e4906f53-f5e4-4dad-a78e-72f15a5b00f6" />
HYPERVISION ENERGIE (exemple, chiffres factices)
<img width="1672" height="941" alt="Energie - General" src="https://github.com/user-attachments/assets/436b5754-c2f1-4d06-91b1-8f315c96ea5a" />
HYPERVISION RECHERCHE DE FUITES (exemple, chiffres factices)
<img width="1672" height="941" alt="Fuites - General" src="https://github.com/user-attachments/assets/ad2327c5-363e-42b0-84b7-69b29061c3ed" />

SCHEMA SUPERVISION REUTILISATION DES EAUX USEES (REUT)
<img width="1913" height="957" alt="synoptique" src="https://github.com/user-attachments/assets/976ab5eb-fcd6-4ece-aa93-926ff13b8436" />
<img width="747" height="528" alt="popup" src="https://github.com/user-attachments/assets/b46db22a-6f1f-4369-9124-98510b4c3ec1" />


## Technologies

- Node.js
- Express
- Axios / Fetch
- node-cron
- PM2
- Topkapi Vision

## 🔌 Endpoints principaux

| Endpoint | Description |
|-----------|------------|
| `/api/data/meteo`              | Données météorologiques en temps réel et prévisions |
| `/api/data/nappes/:codeBss`    | Niveau et état des nappes phréatiques |
| `/api/data/qualite/:codeInsee` | Qualité de l'eau potable par commune |
| `/api/data/vigicrues/:station` | Niveaux et débits des cours d'eau (Vigicrues) |
| `/api/data/iccpro/api/get****` | Données REUT : compteurs, vannes, capteurs, volumes et débits |
| `/api/data/insee/api/get****`  | Données démographiques INSEE |
| `/api/data/edf/api/get****`    | Données de facturation et de consommation électrique EDF issues des fichiers CSV |

## Sécurité

Le fichier `.env` n’est pas publié sur GitHub.  

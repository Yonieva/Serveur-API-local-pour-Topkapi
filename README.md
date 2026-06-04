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

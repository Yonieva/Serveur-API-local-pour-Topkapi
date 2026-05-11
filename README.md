# Serveur API local pour Topkapi

Projet réalisé dans le cadre de mon stage à la Communauté de Communes.

Ce serveur Node.js sert d’intermédiaire entre le logiciel Topkapi et plusieurs API externes :
- Open-Meteo
- Hub’Eau Nappes
- Hub’Eau Qualité Eau Potable
- Vigicrues
- ICCPRO / REUT (Réutilisation des Eaux Usées après Traitement)

## Objectif

Topkapi appelle ce serveur local, qui récupère les données externes, les reformate, puis renvoie une réponse JSON simple exploitable par le script Topkapi.

## Architecture
Topkapi → Script Topkapi → Serveur Node.js local → APIs externes

<img width="953" height="665" alt="image" src="https://github.com/user-attachments/assets/18edb939-a1eb-4fe3-9aba-b10404ccc387" />

## Technologies

- Node.js
- Express
- Axios / Fetch
- node-cron
- PM2
- Topkapi Vision

## Endpoints principaux

| Endpoint | Rôle |
|---|---|
| `/api/data/meteo` | Données météo |
| `/api/data/nappes/:codeBss` | Données nappes phréatiques |
| `/api/data/qualite/:codeInsee` | Qualité de l’eau potable |
| `/api/data/vigicrues/:station` | Niveau ou débit Vigicrues |

## Sécurité

Le fichier `.env` n’est pas publié sur GitHub.  

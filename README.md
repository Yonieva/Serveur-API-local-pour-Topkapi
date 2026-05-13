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

## Endpoints principaux

| Endpoint | Rôle |
|---|---|
| `/api/data/meteo` | Données météo |
| `/api/data/nappes/:codeBss` | Données nappes phréatiques |
| `/api/data/qualite/:codeInsee` | Qualité de l’eau potable |
| `/api/data/vigicrues/:station` | Niveau ou débit Vigicrues |
| `/api/data/iccpro/api/get****` | Volume/Débit/Etat des vannes et compteurs du nouveau projet de Réutilisation des Eaux Usées Traitées |

## Sécurité

Le fichier `.env` n’est pas publié sur GitHub.  

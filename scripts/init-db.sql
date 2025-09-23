-- Script d'initialisation pour PostgreSQL
-- Création des utilisateurs et bases de données pour TalentFlow

-- Créer l'utilisateur talentflow
CREATE USER talentflow WITH PASSWORD 'talentflow_dev';

-- Créer la base de données talentflow
CREATE DATABASE talentflow OWNER talentflow;

-- Donner tous les privilèges sur la base talentflow
GRANT ALL PRIVILEGES ON DATABASE talentflow TO talentflow;

-- Créer l'utilisateur keycloak pour Keycloak
CREATE USER keycloak WITH PASSWORD 'keycloak_dev';

-- Créer la base de données keycloak
CREATE DATABASE keycloak OWNER keycloak;

-- Donner tous les privilèges sur la base keycloak
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- Créer l'utilisateur n8n pour n8n
CREATE USER n8n WITH PASSWORD 'n8n_dev';

-- Créer la base de données n8n
CREATE DATABASE n8n OWNER n8n;

-- Donner tous les privilèges sur la base n8n
GRANT ALL PRIVILEGES ON DATABASE n8n TO n8n;

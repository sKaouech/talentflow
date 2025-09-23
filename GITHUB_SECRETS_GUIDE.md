# 🔐 Guide Configuration GitHub Secrets

## 📋 Secrets à Configurer

### Navigation GitHub

1. Allez sur : https://github.com/sKaouech/talentflow
2. Cliquez sur `Settings` → `Secrets and variables` → `Actions`
3. Cliquez sur `New repository secret` pour chaque secret

### 🔑 Liste des Secrets

| Name               | Value                                           |
| ------------------ | ----------------------------------------------- |
| `SSH_PRIVATE_KEY`  | Votre clé privée SSH complète (voir ci-dessous) |
| `SERVER_USER`      | `root`                                          |
| `DEV_SERVER_HOST`  | `148.230.114.13`                                |
| `PROD_SERVER_HOST` | `148.230.114.13`                                |
| `DEV_URL`          | `https://talentflow-dev.seyka.fr`               |
| `PROD_URL`         | `https://talentflow.seyka.fr`                   |

### 🔑 Clé SSH Privée (SSH_PRIVATE_KEY)

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACCGhrvoAIEb3SVusrySybXhVtd/fqWpyjdnA96TQZ0XyiAAAAKA7YQdgO2E
HYAAAAALc3NoLWVkMjU1MTkAAAAghoa76ACBG90lbrK8ksm14VbXf36lqco3ZwPek0GdF8
ogAAAAQPVoQV7BYyb8vQmeU5K8jKuBT1Ov8jKJXJHfZhKvJYFAhoa76ACBG90lbrK8ksm1
4VbXf36lqco3ZwPek0GdF8ogAAAAGGthb3VlY2guc2VpZmRkaW5lQGdtYWlsLmNvbQECAwQ=
-----END OPENSSH PRIVATE KEY-----
```

## ✅ Vérification

Une fois tous les secrets configurés, vous devriez voir 6 secrets dans la liste :

- SSH_PRIVATE_KEY
- SERVER_USER
- DEV_SERVER_HOST
- PROD_SERVER_HOST
- DEV_URL
- PROD_URL

## 🚀 Test du Déploiement

Après configuration des secrets, testez avec :

```bash
# Test déploiement DEV
git checkout develop
echo "# Test déploiement automatique" >> README.md
git add README.md
git commit -m "test: premier déploiement automatique DEV"
git push origin develop
```

Le pipeline GitHub Actions se lancera automatiquement !

## 📊 Monitoring

- **Actions GitHub** : https://github.com/sKaouech/talentflow/actions
- **Application DEV** : https://talentflow-dev.seyka.fr
- **Application PROD** : https://talentflow.seyka.fr

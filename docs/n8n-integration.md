# Intégration n8n avec TalentFlow

Ce document décrit comment configurer et utiliser n8n pour automatiser les workflows de TalentFlow.

## 🎯 Vue d'ensemble

n8n permet d'automatiser les tâches répétitives de TalentFlow :

- Publication automatique d'appels d'offres sur LinkedIn
- Scraping d'AO depuis des sites externes
- Notifications par email/Slack
- Synchronisation avec des CRM tiers
- Génération et envoi automatique de rapports

## 🚀 Configuration Initiale

### 1. Démarrage de n8n

```bash
# Via Docker Compose
docker-compose up -d n8n

# Ou installation locale
npm install -g n8n
n8n start
```

Accès : http://localhost:5678 (admin/admin)

### 2. Configuration de Base

1. **Créer les credentials** :
   - TalentFlow API : Token d'authentification
   - LinkedIn API : OAuth credentials
   - SMTP : Configuration email

2. **Variables globales** :
   ```json
   {
     "talentflow_api_url": "http://api:3001/api/v1",
     "talentflow_webhook_secret": "your-webhook-secret"
   }
   ```

## 🔗 Workflows Disponibles

### 1. Publication LinkedIn Automatique

**Déclencheur** : Webhook lors de la publication d'un AO

```json
{
  "event": "tender.published",
  "data": {
    "id": "cm1234567890",
    "title": "Développeur Full-Stack React/Node.js",
    "content": "Nous recherchons un développeur expérimenté...",
    "skills": ["React", "Node.js", "TypeScript"],
    "location": "Paris",
    "remote": "hybrid",
    "dailyRate": 600,
    "startDate": "2024-01-15T00:00:00.000Z",
    "clientName": "TechCorp"
  },
  "tenant": {
    "id": "tenant123",
    "name": "Mon ESN",
    "slug": "mon-esn"
  }
}
```

**Workflow n8n** :

1. **Webhook Trigger** : Réception de l'événement
2. **Data Transformation** : Formatage du contenu LinkedIn
3. **LinkedIn API** : Publication du post
4. **TalentFlow API** : Mise à jour du statut de publication

### 2. Scraping d'Appels d'Offres

**Déclencheur** : Cron job (ex: toutes les heures)

**Workflow** :

1. **Schedule Trigger** : Exécution périodique
2. **HTTP Request** : Scraping du site cible
3. **HTML Extract** : Extraction des données
4. **Data Processing** : Nettoyage et structuration
5. **TalentFlow API** : Création de l'AO
6. **Notification** : Alert en cas d'erreur

### 3. Notifications Intelligentes

**Déclencheur** : Webhooks multiples

**Workflow** :

1. **Webhook** : Événements TalentFlow
2. **Switch** : Routage par type d'événement
3. **Template** : Génération du message
4. **Multi-channel** : Email + Slack + Teams

## 📋 Exemples de Workflows

### Publication LinkedIn

```json
{
  "name": "TalentFlow - Publication LinkedIn",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "tender-published",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {
              "name": "linkedin_content",
              "value": "🚀 Nouvelle mission disponible !\n\n📋 {{ $node.Webhook.json.data.title }}\n\n📍 Localisation: {{ $node.Webhook.json.data.location }}\n💰 TJM: {{ $node.Webhook.json.data.dailyRate }}€\n🏠 Mode: {{ $node.Webhook.json.data.remote }}\n\n🔧 Compétences recherchées:\n{{ $node.Webhook.json.data.skills.join(', ') }}\n\n{{ $node.Webhook.json.data.content.substring(0, 200) }}...\n\n#mission #freelance #{{ $node.Webhook.json.data.skills[0].toLowerCase() }}\n\nContactez-nous pour plus d'informations !"
            }
          ]
        }
      },
      "name": "Format Content",
      "type": "n8n-nodes-base.set",
      "position": [460, 300]
    },
    {
      "parameters": {
        "resource": "share",
        "text": "={{ $node['Format Content'].json.linkedin_content }}",
        "additionalFields": {
          "visibility": "PUBLIC"
        }
      },
      "name": "LinkedIn Post",
      "type": "n8n-nodes-base.linkedIn",
      "position": [680, 300]
    },
    {
      "parameters": {
        "url": "={{ $node.Webhook.json.tenant.api_url }}/tenders/{{ $node.Webhook.json.data.id }}/publications",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "talentflowApi",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "platform",
              "value": "linkedin"
            },
            {
              "name": "platformId",
              "value": "={{ $node['LinkedIn Post'].json.id }}"
            },
            {
              "name": "status",
              "value": "published"
            },
            {
              "name": "publishedAt",
              "value": "={{ new Date().toISOString() }}"
            }
          ]
        }
      },
      "name": "Update Publication Status",
      "type": "n8n-nodes-base.httpRequest",
      "position": [900, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Format Content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Format Content": {
      "main": [
        [
          {
            "node": "LinkedIn Post",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "LinkedIn Post": {
      "main": [
        [
          {
            "node": "Update Publication Status",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Scraping d'AO (exemple Indeed)

```json
{
  "name": "TalentFlow - Scraping Indeed",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "hours",
              "hoursInterval": 2
            }
          ]
        }
      },
      "name": "Schedule",
      "type": "n8n-nodes-base.cron",
      "position": [240, 300]
    },
    {
      "parameters": {
        "url": "https://fr.indeed.com/jobs?q=d%C3%A9veloppeur&l=Paris",
        "options": {
          "timeout": 30000
        }
      },
      "name": "Scrape Indeed",
      "type": "n8n-nodes-base.httpRequest",
      "position": [460, 300]
    },
    {
      "parameters": {
        "dataPropertyName": "data",
        "extractionValues": {
          "values": [
            {
              "key": "title",
              "cssSelector": ".jobTitle a span",
              "returnArray": true
            },
            {
              "key": "company",
              "cssSelector": ".companyName",
              "returnArray": true
            },
            {
              "key": "location",
              "cssSelector": ".companyLocation",
              "returnArray": true
            },
            {
              "key": "description",
              "cssSelector": ".job-snippet",
              "returnArray": true
            },
            {
              "key": "link",
              "cssSelector": ".jobTitle a",
              "returnArray": true,
              "attribute": "href"
            }
          ]
        }
      },
      "name": "Extract Job Data",
      "type": "n8n-nodes-base.htmlExtract",
      "position": [680, 300]
    },
    {
      "parameters": {
        "functionCode": "const jobs = [];\nconst titles = $input.first().json.title || [];\nconst companies = $input.first().json.company || [];\nconst locations = $input.first().json.location || [];\nconst descriptions = $input.first().json.description || [];\nconst links = $input.first().json.link || [];\n\nfor (let i = 0; i < titles.length; i++) {\n  if (titles[i] && companies[i]) {\n    jobs.push({\n      title: titles[i].trim(),\n      clientName: companies[i].trim(),\n      location: locations[i]?.trim() || '',\n      description: descriptions[i]?.trim() || '',\n      sourceUrl: `https://fr.indeed.com${links[i]}`,\n      source: 'indeed',\n      type: 'mission',\n      status: 'draft',\n      skills: extractSkills(titles[i] + ' ' + (descriptions[i] || ''))\n    });\n  }\n}\n\nfunction extractSkills(text) {\n  const skillsKeywords = ['React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java', 'PHP', 'Angular', 'Vue.js'];\n  return skillsKeywords.filter(skill => \n    text.toLowerCase().includes(skill.toLowerCase())\n  );\n}\n\nreturn jobs.map(job => ({ json: job }));"
      },
      "name": "Process Jobs",
      "type": "n8n-nodes-base.function",
      "position": [900, 300]
    },
    {
      "parameters": {
        "url": "http://api:3001/api/v1/tenders",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "talentflowApi",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ $json }}"
      },
      "name": "Create Tender",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1120, 300]
    }
  ]
}
```

## 🔧 Configuration des Credentials

### TalentFlow API

```json
{
  "name": "TalentFlow API",
  "type": "httpHeaderAuth",
  "data": {
    "name": "Authorization",
    "value": "Bearer YOUR_API_TOKEN"
  }
}
```

### LinkedIn API

```json
{
  "name": "LinkedIn",
  "type": "linkedInOAuth2Api",
  "data": {
    "clientId": "YOUR_LINKEDIN_CLIENT_ID",
    "clientSecret": "YOUR_LINKEDIN_CLIENT_SECRET",
    "scope": "w_member_social,r_liteprofile"
  }
}
```

## 📨 Webhooks TalentFlow

### Configuration dans l'API

```typescript
// apps/api/src/webhooks/webhooks.service.ts
@Injectable()
export class WebhooksService {
  async triggerWorkflow(event: string, data: any) {
    const workflows = await this.getActiveWorkflows(event)

    for (const workflow of workflows) {
      await this.callN8nWebhook(workflow.webhookUrl, {
        event,
        data,
        timestamp: new Date().toISOString(),
        tenant: await this.getTenantContext(),
      })
    }
  }
}
```

### Événements Disponibles

| Événement              | Description          | Payload                                      |
| ---------------------- | -------------------- | -------------------------------------------- |
| `tender.created`       | Nouvel AO créé       | `{ tender, tenant }`                         |
| `tender.published`     | AO publié            | `{ tender, tenant }`                         |
| `tender.updated`       | AO modifié           | `{ tender, changes, tenant }`                |
| `candidate.created`    | Nouveau candidat     | `{ candidate, tenant }`                      |
| `application.received` | Nouvelle candidature | `{ application, tender, candidate, tenant }` |
| `cv.generated`         | CV généré            | `{ cv, candidate, tenant }`                  |

## 🛠️ Workflows Personnalisés

### Template de Base

```json
{
  "name": "TalentFlow - Template",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "custom-workflow",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Validate Payload",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Validation du payload\nif (!$input.first().json.event) {\n  throw new Error('Event type is required');\n}\nreturn [$input.first()];"
      }
    },
    {
      "name": "Process Data",
      "type": "n8n-nodes-base.set",
      "parameters": {
        "values": {
          "string": [
            {
              "name": "processed_data",
              "value": "={{ JSON.stringify($node.Webhook.json) }}"
            }
          ]
        }
      }
    }
  ]
}
```

### Bonnes Pratiques

1. **Gestion d'erreurs** : Toujours inclure des nœuds de gestion d'erreur
2. **Logging** : Enregistrer les exécutions importantes
3. **Retry Logic** : Implémenter des tentatives en cas d'échec
4. **Validation** : Valider les données d'entrée
5. **Rate Limiting** : Respecter les limites des APIs externes

## 🔍 Monitoring et Debug

### Logs n8n

```bash
# Consulter les logs
docker-compose logs n8n

# Mode debug
docker-compose exec n8n n8n start --tunnel
```

### Webhook Testing

```bash
# Test d'un webhook
curl -X POST http://localhost:5678/webhook/tender-published \
  -H "Content-Type: application/json" \
  -d '{
    "event": "tender.published",
    "data": {
      "id": "test-id",
      "title": "Test Tender"
    }
  }'
```

### Métriques

- **Exécutions** : Nombre d'exécutions par workflow
- **Erreurs** : Taux d'échec par workflow
- **Performance** : Temps d'exécution moyen
- **Usage** : Workflows les plus utilisés

## 🚨 Sécurité

### Authentification

- **Webhooks** : Signature HMAC pour vérifier l'origine
- **API Calls** : Tokens d'authentification sécurisés
- **Credentials** : Chiffrement des credentials sensibles

### Exemple de Validation Webhook

```javascript
// Dans n8n Function node
const crypto = require('crypto')

const signature = $node.Webhook.json.headers['x-talentflow-signature']
const payload = JSON.stringify($node.Webhook.json.body)
const secret = 'your-webhook-secret'

const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex')

if (signature !== `sha256=${expectedSignature}`) {
  throw new Error('Invalid webhook signature')
}

return [$input.first()]
```

## 📚 Ressources

- [n8n Documentation](https://docs.n8n.io/)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Webhook Security](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/#security)

## 🆘 Dépannage

### Problèmes Courants

**Webhook non déclenché**

```bash
# Vérifier la configuration
curl -X GET http://localhost:5678/webhook-test/tender-published
```

**Erreur d'authentification LinkedIn**

```bash
# Renouveler les tokens OAuth
# Vérifier les scopes autorisés
```

**Timeout sur les requêtes**

```json
{
  "options": {
    "timeout": 30000,
    "retry": {
      "limit": 3
    }
  }
}
```

---

Cette documentation couvre les aspects essentiels de l'intégration n8n avec TalentFlow. Pour des besoins spécifiques, consultez l'équipe de développement.

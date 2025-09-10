# CI/CD con Node.js + Express + TypeScript (Laboratorio)

Este repositorio implementa un servicio web en Node.js + Express + TypeScript con un flujo CI/CD automatizado en GitHub Actions.

**Nota:** El laboratorio pedía despliegues en Azure AKS (staging) y Azure Container Apps (producción).  
Debido a limitaciones de permisos en la suscripción, solo se implementó la parte de CI/CD posible: construcción, pruebas, linting, formateo y empaquetado con Docker en GitHub Actions.


## Alcance logrado

- API REST en Node.js + Express + TypeScript, con CRUD funcional.
- Pruebas unitarias e integrales con Jest + Supertest.
- Configuración de linting y formateo (ESLint + Prettier).
- Contenedorización con Dockerfile multistage.
- Pipeline de CI en GitHub Actions: lint → format → build → test.
- Pipeline de CD simulado en GitHub Actions: construcción de imagen Docker y guardado como artifact.
- Prueba de publicación en Azure Container Registry (ACR) con docker push.
- Creación de AKS (staging): **no posible** por falta de permisos.
- Despliegue en Azure Container Apps (producción): **no posible** por falta de permisos.


## Tecnologías y Herramientas Utilizadas

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Testing:** Jest + Supertest
- **Linting/Formatting:** ESLint + Prettier
- **Contenedores:** Docker
- **CI/CD:** GitHub Actions
- **Registry:** Fue posible utilizar la herramienta Azure Container Registry (ACR), pero por las limitaciones de AKS y ACA no se utilizó de manera directa.
- **Orquestación:** No fue posible utilizar, por las limitaciones de Azure, Kubernetes (AKS) - *Staging*.
- **Serverless:** No fue posible utilizar, por las limitaciones de Azure, Azure Container Apps - *Producción*.


## Estructura del proyecto

```

node-express-ts-api/
├── .github/workflows/
│   ├── ci.yml
│   └── cd.yml (simulado)
├── src/
│   └── index.ts
├── tests/
│   └── app.e2e.test.ts
├── .dockerignore
├── .eslintignore
├── eslint.config.js
├── .gitignore
├── Dockerfile
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md

````


## Preparación del entorno local

### Crear carpeta y proyecto

```bash
mkdir node-express-ts-api
cd node-express-ts-api
git init
npm init -y
````

### Instalar dependencias

```bash
npm install express

npm install -D typescript ts-node-dev ts-node @types/node @types/express jest ts-jest @types/jest supertest @types/supertest eslint prettier @eslint/js typescript-eslint eslint-plugin-perfectionist cross-env
```

### Otras configuraciones

* `tsconfig.json`: compilador TypeScript.
* `jest.config.js`: configuración de pruebas.
* `eslint.config.js`: reglas de linting.


## Configuración del Proyecto

### TypeScript (`tsconfig.json`)

Configurado para:

* Target ES2020
* Módulos ESM
* Strict mode habilitado
* Salida en directorio `dist/`
* Compatibilidad con Jest

### ESLint y Prettier (`eslint.config.js`)

Configuración moderna con formato plano:

* Detección de promesas no manejadas
* Prevención de código no utilizado
* Reglas de seguridad (no-eval, no-implied-eval)
* Integración con Prettier para formateo consistente


## Implementación de la API

La API incluye:

* Endpoint raíz (`/`) con mensaje base
* Endpoint de health check (`/health`)
* CRUD completo para entidad "Assistants" con operaciones:

  * `GET /assistants` - Listar todos
  * `GET /assistants/:id` - Obtener por ID
  * `POST /assistants` - Crear nuevo
  * `PUT /assistants/:id` - Actualizar
  * `DELETE /assistants/:id` - Eliminar

---

## Pruebas Automatizadas

Se implementaron pruebas end-to-end con Jest y Supertest que cubren:

* Endpoints básicos (raíz y health check)
* Todas las operaciones CRUD
* Validación de respuestas HTTP y estructuras de datos
* Manejo de errores

### Ejecutar pruebas

```bash
npm test
```

## Contenedorización con Docker

### Dockerfile multi-stage

```dockerfile
# Builder stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runner stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Comandos Docker

```bash
# Construir imagen
npm run docker:build
# o manualmente
docker build -t node-express-ts-api:local .

# Ejecutar contenedor
npm run docker:run
# o manualmente
docker run --rm -p 3000:3000 node-express-ts-api:local
```


## Configuración de Azure

### Variables de entorno Azure

```powershell
$RG="rg-node-cicd"
$LOCATION="eastus2"
$ACR="nodecicdacr012025ucr"
$AKS="aks-staging-node-cicd"
$AKS_NODE_COUNT=2
$AKS_NODE_SIZE="Standard_DS2_v2"
$CONTAINERAPPS_ENV="env-containerapps"
$CONTAINERAPP_NAME="node-api-prod"
```

### Principales Comandos Azure CLI ejecutados

```bash
# Crear resource group
az group create --name $RG --location $LOCATION

# Crear Azure Container Registry
az acr create --resource-group $RG --name $ACR --sku Standard --location $LOCATION

# Obtener URL del ACR
$ACR_SERVER = "$(az acr show -n $ACR -g $RG --query loginServer -o tsv)"

# Login al ACR
az acr login --name $ACR

# Construir y subir imagen al ACR
$IMAGE_TAG = "$ACR_SERVER/node-express-ts-api:latest"
docker build -t $IMAGE_TAG .
docker push $IMAGE_TAG
```


## GitHub Actions

### CI: `.github/workflows/ci.yml`

Se ejecuta en:

* Push a `main`
* Pull requests

#### Pasos del CI:

1. Checkout del repositorio
2. Setup de Node.js 18 con cache de npm
3. Instalación de dependencias (`npm ci`)
4. Linting (`npm run lint`)
5. Verificación de formato (`npm run format:check`)
6. Compilación (`npm run build`)
7. Pruebas (`npm test`)


### CD Simulado: `.github/workflows/cd.yml`

Se ejecuta **tras un CI exitoso**.

#### Pasos del CD simulado:

1. Checkout del repositorio
2. Construcción de imagen Docker
3. Guardado de imagen como artifact (`image.tar.gz`)

> Esto simula el paso de “deploy”. En un escenario real, se empujaría la imagen a un registry y se desplegaría en AKS/ACA.



## Limitaciones y Desafíos

### Problemas con Azure Kubernetes Service (AKS)

No fue posible completar la configuración de AKS debido a:

* Limitaciones de permisos en la cuenta de Azure
* Restricciones de recursos en la suscripción



## Trabajo en Azure (limitado)

### Se logró:

* Creación de Resource Group (RG)
* Creación y login en Azure Container Registry (ACR)
* Construcción y push de imagen Docker al ACR


### No se pudo completar:

* Creación de AKS (staging)
* Creación de Azure Container Apps (producción)

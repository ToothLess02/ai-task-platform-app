# AI Task Processing Platform (MERN + Python Worker + Kubernetes GitOps)

Production-ready asynchronous AI Task Processing Platform built using **React (Vite)**, **Node.js (Express)**, **Python Background Worker**, **Redis Queue**, **MongoDB**, **Docker**, **Kubernetes (k3s)**, and **Argo CD (GitOps)**.

---

## Deliverables & Submission Checklist

| Deliverable Requirement | Status | Location / Artifact |
| :--- | :---: | :--- |
| **Application Repository** | ✅ Included | `app/` (Frontend, Backend, Worker, Dockerfiles, Compose) |
| **Infrastructure Repository** | ✅ Included | `infra/` (K8s Namespace, Deployments, Services, Ingress, Argo CD) |
| **Architecture Document** | ✅ Included | `ARCHITECTURE.md` (2–4 Pages) |
| **Argo CD Dashboard Screenshot** | ✅ Included | `argocd-dashboard-screenshot.png` |
| **CI/CD Pipeline** | ✅ Included | `app/.github/workflows/ci-cd.yml` |
| **Setup & Run Instructions** | ✅ Included | This `README.md` |

---

## 1. System Architecture & Features

### Core Stack
- **Frontend SPA:** React.js (Vite) + TailwindCSS (Dark Glassmorphic UI, real-time polling, JWT storage, execution log viewer).
- **Backend API:** Node.js + Express.js (JWT Auth with bcrypt password hashing, Helmet security header middleware, `express-rate-limit`, Mongoose schemas, Redis queue producer).
- **Background Worker:** Python 3.11 service (`blpop` Redis queue listener, state updater, execution timing logger, MongoDB persistence).
- **In-Memory Queue:** Redis 7.2.
- **Database:** MongoDB 7.0 (with compound indexes on `{ user: 1, createdAt: -1 }`).
- **Containerization:** Multi-stage Docker builds running under non-root users (`USER node`, `USER appuser`, `USER nginx`).
- **Orchestration & GitOps:** Kubernetes manifests (`k8s/`) deployed automatically via **Argo CD Application** auto-sync.

### Supported Task Operations
1. **Uppercase:** Convert input string to uppercase characters.
2. **Lowercase:** Convert input string to lowercase characters.
3. **Reverse String:** Reverse character sequence of input payload.
4. **Word Count:** Calculate and return total word count.

---

## 2. Directory Structure

```
Assignment/
├── app/                              # Application Repository Source Code
│   ├── backend/                      # Express.js REST API
│   │   ├── src/                      # Controllers, Models, Routes, Config
│   │   └── Dockerfile                # Multi-stage non-root Node build
│   ├── worker/                       # Python Background Worker Service
│   │   ├── worker.py                 # Redis queue consumer & task execution engine
│   │   └── Dockerfile                # Multi-stage non-root Python build
│   ├── frontend/                     # React.js (Vite) Single Page App
│   │   ├── src/                      # Auth, Task Cards, Log Modal, Stats Grid
│   │   └── Dockerfile                # Multi-stage Nginx non-root build
│   ├── docker-compose.yml            # Full stack local orchestration
│   └── .github/workflows/ci-cd.yml   # GitHub Actions CI/CD Pipeline
├── infra/                            # Infrastructure Repository (GitOps)
│   └── k8s/                          # Kubernetes Manifests
│       ├── namespace.yaml            # Dedicated 'ai-task-platform' namespace
│       ├── configmap.yaml            # Application environment variables
│       ├── secrets.yaml              # Encrypted secrets & JWT keys
│       ├── mongodb-deployment.yaml   # Mongo DB deployment & service
│       ├── redis-deployment.yaml     # Redis queue deployment & service
│       ├── backend-deployment.yaml   # API deployment (HPA & probes ready)
│       ├── worker-deployment.yaml    # Python worker (HPA scaled 2-10 replicas)
│       ├── frontend-deployment.yaml  # Nginx frontend deployment
│       ├── ingress.yaml              # NGINX Ingress rules (/ and /api)
│       └── argocd-application.yaml   # Argo CD GitOps Sync Application
├── ARCHITECTURE.md                   # Detailed 2–4 page System Architecture Document
├── argocd-dashboard-screenshot.png   # Argo CD Dashboard execution screenshot
└── README.md                         # Project setup & submission guide
```

---

## 3. Quick Start: Local Development (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24.0+)
- [Node.js](https://nodejs.org/) (v20+)

### Step-by-Step Execution

1. **Navigate to the Application directory:**
   ```bash
   cd /Users/sujaydey/Documents/Projects/Assignment/app
   ```

2. **Launch full container stack with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access Services:**
   - **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - **Backend API Health Check:** [http://localhost:5000/health](http://localhost:5000/health)
   - **Backend API Readiness Probe:** [http://localhost:5000/readiness](http://localhost:5000/readiness)

---

## 4. Kubernetes & Argo CD Deployment Guide

### Prerequisites
- Kubernetes cluster (`k3s`, `minikube`, or `kind`)
- `kubectl` CLI tool configured
- Argo CD installed (`kubectl create namespace argocd && kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml`)

### Manual Manifest Application (Local Cluster)

```bash
cd /Users/sujaydey/Documents/Projects/Assignment/infra/k8s

# 1. Create dedicated namespace
kubectl apply -f namespace.yaml

# 2. Apply ConfigMaps & Secrets
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# 3. Deploy Databases & Services
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f redis-deployment.yaml

# 4. Deploy Core Services & Worker HPA
kubectl apply -f backend-deployment.yaml
kubectl apply -f worker-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# 5. Apply Ingress Rules
kubectl apply -f ingress.yaml
```

### GitOps Sync via Argo CD

Apply the GitOps application manifest:
```bash
kubectl apply -f argocd-application.yaml
```
Argo CD will track the repository and automatically synchronize all deployments, services, ingress routing, and scaling policies.

---

## 5. Security & Best Practices Implemented

- **Password Security:** Salted hashing with `bcrypt` (10 rounds).
- **API Protection:** JWT authentication required for all `/api/tasks` endpoints.
- **HTTP Hardening:** `helmet` security headers applied.
- **Rate Limiting:** `express-rate-limit` prevents DDoS brute-force (100 requests per 15 mins).
- **Container Isolation:** Multi-stage builds running under non-root users (`USER node`, `USER appuser`, `USER nginx`).
- **Kubernetes Probes:** Liveness (`/health`) and Readiness (`/readiness`) probes configured for high availability.

---

## 6. Email Submission Template

When submitting to `hr@helpstudyabroad.com`, include the following details:

**Subject:** Submission: MERN Full Stack Developer Technical Assessment - Sujay Dey

**Body:**
> Dear Hiring Team,
> 
> Thank you for the opportunity to complete the technical assessment for the MERN Full Stack Developer role. 
> 
> I have designed, developed, containerized, and documented the production-ready AI Task Processing Platform. Here are my submission details:
> 
> 1. Application Repository Link:
>    https://github.com/ToothLess02/ai-task-platform-app
> 
> 2. Infrastructure Repository Link (GitOps / Argo CD):
>    https://github.com/ToothLess02/ai-task-platform-infra
> 
> 3. Live Deployment URL:
>    N/A (Full local orchestration ready via Docker Compose; Kubernetes manifests configured for Argo CD)
> 
> 4. Architecture Document:
>    Please find attached ARCHITECTURE.md (covering overall architecture, worker scaling strategy, 100,000 tasks/day volume engineering, MongoDB indexing strategy, Redis HA/failover, and Staging vs Production deployment strategy).
> 
> 5. Argo CD Dashboard Screenshot:
>    Please find attached argocd-dashboard-screenshot.png.
> 
> 6. Additional Notes & Assumptions:
>    - Backend API built with Node.js/Express, JWT auth, bcrypt password hashing, Helmet, rate limiting, and Redis queue producer.
>    - Background worker built in Python 3.11 with BLPOP queue consumption, execution logging, and MongoDB state updates.
>    - Frontend built with React.js (Vite) featuring dark glassmorphic theme, task creation modal, live status polling, and execution log inspection.
>    - All services containerized with multi-stage non-root Dockerfiles.
> 
> Full setup instructions and local execution steps are available in the repository README.md.
> 
> Looking forward to hearing your feedback!
> 
> Best regards,
> 
> Sujay Dey

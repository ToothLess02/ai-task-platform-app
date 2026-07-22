# Architecture & Operations Guide
## AI Task Processing Platform

**Author:** MERN Full Stack & DevOps Engineering  
**Version:** 1.0.0  
**Target Environment:** Kubernetes (k3s / EKS / GKE) & Argo CD GitOps  

---

## 1. Overall System Architecture

The AI Task Processing Platform is engineered as a decoupled, event-driven microservices system. It isolates client API ingestion from heavy background processing via an asynchronous messaging queue.

### Architectural Component Overview

```
                          +---------------------------------------+
                          |        User Web Browser / SPA         |
                          |     (React + Vite - Port 80/8080)     |
                          +-------------------+-------------------+
                                              |
                                     HTTP / REST API Calls
                                              v
                          +-------------------+-------------------+
                          |          NGINX Ingress                |
                          +---------+-------------------+---------+
                                    |                   |
                        /api/auth & /api/tasks          | Static Assets
                                    |                   v
                                    |       +-----------+-----------+
                                    |       |   Frontend Pods (2x)  |
                                    |       +-----------------------+
                                    v
                     +--------------+--------------+
                     |    Backend API Pods (2x)    |
                     |  (Node.js + Express.js)     |
                     +-------+--------------+------+
                             |              |
           MongoDB Read/Write|              | Producer: RPUSH Task
                             v              v
               +-------------+--+      +----+-------------+
               |  MongoDB Pod   |      |    Redis Pod     |
               | (PersistentDB) |      | (In-Memory Queue)|
               +-------+--------+      +----+-------------+
                       ^                    |
                       |                    | Consumer: BLPOP
                       | Task Status & Logs |
                       +--------------------+
                               ^
                               |
                   +-----------+-----------+
                   |  Python Worker Pods   |
                   | (Scaled via HPA 2-10) |
                   +-----------------------+
```

### End-to-End Task Lifecycle Sequence

1. **Authentication:** User authenticates via `/api/auth/login`. Node.js signs a stateless JWT token with `bcrypt` password verification.
2. **Task Creation:** Authenticated user submits task payload (Title, Input Text, Operation Type).
3. **Queue Ingestion:**
   - Node.js backend writes a Task document to MongoDB with status `Pending`.
   - Backend serializes the payload `{ taskId, inputText, operationType }` and pushes it to Redis list key `ai_task_queue` via `RPUSH`.
   - API immediately returns `201 Created` with task object (non-blocking).
4. **Worker Consumption:**
   - Python Worker pods listen continuously using blocking pop (`BLPOP ai_task_queue 5`).
   - On retrieving a payload, worker updates MongoDB task status to `Running` and records an initial execution log entry.
5. **Execution & Logging:**
   - Worker processes the requested operation (*Uppercase*, *Lowercase*, *Reverse String*, *Word Count*).
   - Execution duration is measured in milliseconds.
6. **Completion & Persistence:**
   - Result string and timing metrics are saved back to MongoDB.
   - Status updates to `Success` (or `Failed` if exception caught).
   - Frontend polls `/api/tasks` every 3s to reflect live status updates.

---

## 2. Worker Scaling Strategy

To maintain sub-second task processing SLAs during traffic bursts, worker scaling relies on a multi-tier horizontal scaling mechanism.

### Metrics-Driven Autoscaling (HPA & KEDA)

1. **CPU & Memory Thresholds (Standard HPA):**
   - Configured via Kubernetes `HorizontalPodAutoscaler` targeting `worker` deployment.
   - Scales up from 2 minimum replicas up to 10 maximum replicas when CPU utilization exceeds **75%**.

2. **Queue Length Auto-Scaling (KEDA - Kubernetes Event-driven Autoscaling):**
   - For queue-centric workloads, CPU metrics lag behind rapid queue growth. In high-throughput deployments, KEDA `Redis Scaler` monitors Redis queue depth (`LLEN ai_task_queue`).
   - Target backlog rule: **10 pending tasks per worker pod**.
   - Formula:
     $$\text{Target Replicas} = \left\lceil \frac{\text{Redis Queue Depth}}{10} \right\rceil$$

```yaml
# KEDA ScaledObject Example Strategy
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: redis-worker-scaler
  namespace: ai-task-platform
spec:
  scaleTargetRef:
    name: worker
  minReplicaCount: 2
  maxReplicaCount: 20
  triggers:
    - type: redis
      metadata:
        type: list
        key: ai_task_queue
        value: "10"
```

---

## 3. Handling High Task Volume (~100,000 Tasks / Day)

### Volume Metrics Calculation

- **Daily Volume:** $100,000 \text{ tasks/day}$
- **Average Throughput:** 
  $$\frac{100,000}{86,400 \text{ seconds}} \approx 1.16 \text{ tasks/second}$$
- **Peak Traffic Multiplier (10x):** ~12 to 20 tasks/second peak load.
- **Payload Size:** Average ~2 KB per task $\implies$ Daily Data Ingress $\approx 200 \text{ MB/day}$.

### High-Volume Capacity Enhancements

1. **Redis Connection Pooling & Non-Blocking Queue Operations:**
   - Node.js API uses `ioredis` with multiplexed connection pools, handling thousands of concurrent `RPUSH` commands without I/O blocking.
   - Python workers utilize multi-threaded or `asyncio` event loops with connection pooling (`redis.ConnectionPool`) to minimize socket negotiation overhead.

2. **Backpressure Control:**
   - API Rate Limiter (`express-rate-limit`) caps individual user submission rates (100 req / 15 mins) to prevent DDoS queue flooding.
   - If Redis queue depth exceeds 50,000 items, API returns `429 Too Many Requests / System Busy` to enforce graceful degradation.

3. **Database Write Optimization:**
   - Bulk status update buffer: Instead of isolated single writes under extreme spikes, workers can batch log updates in MongoDB using `bulkWrite()`.

---

## 4. MongoDB Indexing Strategy

To keep query latency $<5\text{ms}$ over millions of historical task records, target indexes match exact access patterns:

### Configured Indexes & Rationales

1. **Compound Index on User & Recency:**
   - `db.tasks.createIndex({ user: 1, createdAt: -1 })`
   - *Rationale:* Resolves the main dashboard query (`getTasks` for logged-in user sorted newest first) via index scan without in-memory sorting (`SORT_KEY_GENERATOR`).

2. **Compound Index on Status & Recency:**
   - `db.tasks.createIndex({ status: 1, createdAt: -1 })`
   - *Rationale:* Fast filtering by status (`Pending`, `Running`, `Failed`) for admin reporting and background monitoring.

3. **Unique Index on User Email:**
   - `db.users.createIndex({ email: 1 }, { unique: true })`
   - *Rationale:* Ensures instantaneous login lookups and guarantees email uniqueness constraints at database engine level.

4. **Automated Log Data Retention (TTL Index Strategy):**
   - For long-term production, old completed task logs are purged after 30 days using MongoDB Time-To-Live index:
   - `db.tasks.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 })`

---

## 5. Redis Failure Handling & Recovery Strategy

Redis acts as the transient operational state buffer. Robust failover strategies ensure zero task loss during node crashes or network partitions.

### Persistence Configuration (RDB + AOF)

- **Append-Only File (AOF):** Configured with `appendfsync everysec` for maximum data protection with minimal write performance penalty.
- **RDB Snapshots:** Periodic snapshots saved every 60 seconds if 1000 keys change.

### Failure Scenarios & Self-Healing Workflows

| Failure Scenario | Mitigation / Recovery Mechanism |
| :--- | :--- |
| **Worker Process Crash** | Python worker uses `BRPOPLPUSH` (Reliable Queue Pattern) moving items from `ai_task_queue` to `ai_task_processing`. On startup, worker inspects orphan tasks and re-queues them. |
| **Redis Node Outage** | Kubernetes Deployment automatically restarts Redis container. Persistent Volume Claim (PVC) re-attaches existing AOF logs to restore pending queue state instantly. |
| **Redis Master Failover** | Production deployment uses **Redis Sentinel** (1 Primary + 2 Replicas). `ioredis` automatically switches write target to elected master in $<3$ seconds. |
| **Dead Letter Queue (DLQ)** | Tasks failing $>3$ processing retries are pushed to `ai_task_dlq` for manual inspection rather than infinitely blocking the queue. |

---

## 6. Deployment Strategy (Staging vs. Production)

```
[Developer Push] ---> [GitHub Actions CI/CD] ---> [Docker Hub Registry]
                                                       |
                                            Update Infra Manifest Tags
                                                       |
                                                       v
                                            [GitOps Infra Repository]
                                                       |
                                             Argo CD Sync Engine
                                                       |
                       +-------------------------------+-------------------------------+
                       |                                                               |
                       v                                                               v
            [Staging Cluster Namespace]                                   [Production Cluster Namespace]
             (Auto-Sync & Preview Testing)                                (Automated Sync / Rolling Update)
```

### Staging Environment Strategy
- **Namespace:** `ai-task-staging`
- **Replicas:** Reduced footprint (1 Backend, 1 Worker, 1 Frontend).
- **Database:** Shared MongoDB / Redis instance with namespace isolation.
- **GitOps Policy:** Direct auto-sync triggered on push to `develop` branch.

### Production Environment Strategy
- **Namespace:** `ai-task-platform`
- **Replicas:** High Availability (2+ Backend, 3-10 Auto-scaled Workers, 2 Frontend).
- **Deployment Mechanics:** **RollingUpdate** strategy with `maxSurge: 25%` and `maxUnavailable: 0` to guarantee zero-downtime deployments.
- **GitOps Policy:** Argo CD auto-sync triggered on push to `main` branch with `prune: true` and `selfHeal: true`.
- **Security & Network:** Ingress TLS termination via Let's Encrypt / cert-manager, non-root container runtimes (`securityContext: runAsNonRoot: true`), and Secret encryption via Kubernetes Secrets / Vault.

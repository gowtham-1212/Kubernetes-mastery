# Phase 4: Configuration & Storage POC (Node.js TypeScript + PostgreSQL)

This directory demonstrates how to run a stateful application in Kubernetes using **ConfigMaps**, **Secrets**, and **Persistent Volume Claims (PVC)**.

## Architecture Overview & Data Flow

```mermaid
graph TD
    %% User/Traffic Layer
    User([External Client / Ingress]) -->|HTTP Requests| AppSvc[Service: ts-backend-service]

    %% Backend Layer
    subgraph Backend Layer [Node.js TypeScript API]
        AppSvc -->|Load Balances| AppPod1(Node.js Pod 1)
        AppSvc -->|Load Balances| AppPod2(Node.js Pod 2)
    end

    %% Configuration & Credentials
    subgraph Configuration Management
        CM[ConfigMap: postgres-config <br/> POSTGRES_USER, POSTGRES_DB]
        SEC[Secret: postgres-secret <br/> POSTGRES_PASSWORD]
    end

    CM -. "Injects Env Vars" .-> AppPod1
    CM -. "Injects Env Vars" .-> AppPod2
    SEC -. "Injects Password" .-> AppPod1
    SEC -. "Injects Password" .-> AppPod2

    CM -. "Injects Env Vars" .-> DBPod
    SEC -. "Injects Password" .-> DBPod

    %% Database Layer
    subgraph Database Layer [PostgreSQL Engine]
        AppPod1 ==>|TCP Connection: postgres-service:5432| DBSvc[Service: postgres-service]
        AppPod2 ==>|TCP Connection: postgres-service:5432| DBSvc
        DBSvc -->|Routes traffic| DBPod(Postgres Pod)
    end

    %% Storage Layer
    subgraph Storage Layer [Persistent Storage]
        PVC[(PersistentVolumeClaim: postgres-pvc <br/> 1GB Volume)]
        PV[[Persistent Volume <br/> Host Storage]]
        
        DBPod ==>|Mounts /var/lib/postgresql/data| PVC
        PVC -. "Binds to" .-> PV
    end
```
# backend-deployment.yaml flow diagram

```mermaid
graph TD
    subgraph Node.js App Stack
        CM[ConfigMap: postgres-config]
        SEC[Secret: postgres-secret]
        SVC_APP[ClusterIP Service <br/> ts-backend-service:80]
        POD_APP[Node.js TypeScript Pods <br/> backend-ts-app:v1]
        
        CM -. "Injects USER & DB" .-> POD_APP
        SEC -. "Injects PASSWORD" .-> POD_APP
        SVC_APP -->|Routes Port 80 to 3000| POD_APP
    end

    POD_APP ==>|Connects to DB via DNS| DB_SVC[postgres-service:5432]
```
# Step-by-Step Deployment Instructions
1. Build the Node.js TypeScript Image in Minikube
```Bash
# Navigate to the TypeScript app folder
cd backend-ts-poc

# Load image into Minikube (Foolproof method)
docker build -t backend-ts-app:v1 .
minikube image load backend-ts-app:v1
```

2. Apply Kubernetes Manifests
Run the files in order to build the infrastructure layers:

```Bash
# Step A: Create ConfigMap & Secret
kubectl apply -f db-config.yaml

# Step B: Request Storage (PVC)
kubectl apply -f db-storage.yaml

# Step C: Deploy PostgreSQL Database & Internal Service
kubectl apply -f db-deployment.yaml

# Step D: Deploy TypeScript Node.js Backend API
kubectl apply -f backend-deployment.yaml
```
Verification & Chaos Testing
## Step 1: Verify All Resources Are Bound and Running
```Bash
kubectl get pvc
```
# Status MUST show 'Bound'

kubectl get pods
# Output should show 2 backend pods and 1 postgres pod in 'Running' status
## Step 2: Test API Data Insertion
Port-forward the TypeScript API to your local machine:

```Bash
kubectl port-forward svc/ts-backend-service 8080:80
```
Insert a test user into PostgreSQL via HTTP:

```Bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Principal DevOps Engineer"}'
Query users:
```

```Bash
curl http://localhost:8080/users
```
## Step 3: The Ultimate Chaos Test (Proving Storage Persistence)
Delete the PostgreSQL pod completely:

```Bash
kubectl delete pod -l app=postgres
```
Wait a few seconds for the Deployment to recreate the Pod. Once running, execute the curl query again:

```Bash
curl http://localhost:8080/users
```
Result: The data remains intact because PostgreSQL re-attached to the existing postgres-pvc volume!

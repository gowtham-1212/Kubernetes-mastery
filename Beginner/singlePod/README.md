# Hardened Backend & Observability

This lab demonstrates how to build a production-grade, minimal-footprint backend using **Google Distroless** images and implement robust health monitoring.

## Learning Objectives
1.  **Distroless Images**: Using `gcr.io/distroless/nodejs20-debian12` to reduce attack surface and image size.
2.  **Health Checks**: Implementing native Docker health checks to monitor service "liveness".
3.  **Observability**: A secondary service that pings the API at 30-second intervals to verify uptime.
4.  **Multi-Stage Hardening**: Building in a full environment and running in a restricted one.

## Features
- **Fastify API**: Connected to PostgreSQL.
- **Distroless Runtime**: No shell, no package manager, just the binary.
- **Auto-Monitor**: A small shell-based service that "pulses" the API every 30s.

## Commands
```bash
# 1. Build and Start
docker-compose up --build

# 2. Monitor Logs
# Watch the 'monitor' service hit the API every 30s
docker-compose logs -f monitor

# 3. Check Health Status
docker inspect --format='{{json .State.Health}}' hardened-api
```
# Kubernetes

Deploying a Node.js App to a Single Pod
You asked to deploy this in a single Pod. While it's best practice to use a Deployment (as we discussed previously), creating a raw Pod is a great way to understand the absolute baseline of how Kubernetes runs a container.

Here is the step-by-step process.

## Step A: The "Minikube Docker Env" Gotcha
If you build a Docker image on your Mac normally, Kubernetes (inside the Minikube VM) cannot see it. We need to point your terminal to Minikube's internal Docker daemon first.

Run this command in your terminal:

```Bash
eval $(minikube docker-env)
```
(Note: This binds your current terminal tab to Minikube's Docker. Keep using this same tab for the next steps).

## Step B: Build the Image
Assuming you are in your Node.js project directory with a valid Dockerfile, build the image:

```Bash
docker build -t my-node-app:v1 .
```
## Step C: Write the Pod YAML
Create a file named pod.yaml and paste this inside:

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: node-app-pod
  labels:
    app: my-node-app
spec:
  containers:
  - name: node-container
    image: my-node-app:v1
    imagePullPolicy: Never   # This forces K8s to use the local image we just built
    ports:
    - containerPort: 3000    # Change this to whatever port your Node app uses
```
## Step D: Deploy and Verify
Apply the YAML file to your Minikube cluster:

```Bash
kubectl apply -f pod.yaml
```
Check if it is running:

```Bash
kubectl get pods
```
(Wait until the status changes from ContainerCreating to Running).

## Step E: Access the Application
A raw Pod is not exposed to your Mac's network by default. To test it in your browser, create a temporary tunnel:

```Bash
kubectl port-forward pod/node-app-pod 3000:3000
```
Now, open your browser and go to http://localhost:3000. You should see your Node.js app!

### Here is the exact step-by-step flow of what happens under the hood when you deployed that Node.js app to Minikube.

``` mermaid
sequenceDiagram
    autonumber
    actor Dev as You (kubectl)
    
    box Control Plane (The Brain)
        participant API as kube-apiserver
        participant ETCD as etcd (Database)
        participant Sched as kube-scheduler
    end
    
    box Worker Node (Minikube VM)
        participant Kubelet as kubelet
        participant Runtime as Container Runtime (Docker)
    end

    %% Step 1: The Request
    Dev->>API: kubectl apply -f pod.yaml (Desired State)
    API->>API: Validates YAML syntax & permissions
    
    %% Step 2: Storage
    API->>ETCD: Save Pod definition
    ETCD-->>API: Saved successfully (Pod is now "Pending")
    
    %% Step 3: Scheduling
    Sched->>API: Watches for "Pending" Pods with no Node assigned
    API-->>Sched: "Yes, 'node-app-pod' needs a Node"
    Note over Sched: Scheduler evaluates available Nodes (CPU/RAM)
    Sched->>API: "Assign 'node-app-pod' to Minikube Node"
    API->>ETCD: Update Pod status with assigned Node
    
    %% Step 4: Execution
    Kubelet->>API: Constantly polls: "Do I have new work?"
    API-->>Kubelet: "Yes, run 'node-app-pod'"
    
    %% Step 5: Container Creation
    Kubelet->>Runtime: Pull image 'my-node-app:v1'
    Runtime-->>Kubelet: Image ready
    Kubelet->>Runtime: Start container (Port 3000)
    Runtime-->>Kubelet: Container is running
    
    %% Step 6: Status Reporting
    Kubelet->>API: Update Pod status to "Running"
    API->>ETCD: Save "Running" state
    
    Note over Dev, Runtime: The "Actual State" now matches the "Desired State"
```
## Breaking Down the Magic (Why We Needed Each Piece)

* **Steps 1 & 2 (API Server & etcd):** Your `kubectl` command only ever talks to the `kube-apiserver`. The API server writes your request into `etcd` (the database). At this exact millisecond, your Node.js app is just a database entry labeled "Pending".
* **Step 3 (Scheduler):** The `kube-scheduler` is constantly watching the API server. It sees a "Pending" pod that doesn't have a home yet. Because you are using Minikube, there is only one worker node available. The Scheduler tells the API server, "Assign this pod to the Minikube node."
* **Steps 4 & 5 (Kubelet & Runtime):** The `kubelet` (the foreman living on the Minikube worker node) is also constantly watching the API server. It suddenly sees: "Oh! The API server says a pod belongs to my node now." The `kubelet` takes over, reaches out to the Container Runtime (Docker), and says, "Start the `my-node-app:v1` container."
* **Step 6 (The Loop Closes):** The `kubelet` reports back to the API server that the container successfully started. The API server updates `etcd`, and the deployment is complete.

> **💡 Architectural Insight:** Notice that the **Controller Manager** is missing from this breakdown. Why? Because you created a raw Pod directly! The Controller Manager's job is to manage Deployments and ReplicaSets. By bypassing a Deployment and writing a `pod.yaml` directly, you acted as the manager yourself.
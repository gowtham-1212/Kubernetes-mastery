#!/bin/bash

# Configuration
DEPLOYMENT_NAME="poc-backend-deployment"
POD_CAPACITY=50 # We assume 1 pod can handle 50 Requests Per Second

# Check if user provided the current API load
CURRENT_RPS=$1

if [ -z "$CURRENT_RPS" ]; then
  echo "❌ Error: Missing API Load Parameter."
  echo "Usage: ./scale-pods.sh <current_api_requests_per_second>"
  echo "Example: ./scale-pods.sh 120"
  exit 1
fi

echo "📊 Current API Load: $CURRENT_RPS Requests Per Second"
echo "⚙️  Capacity per Pod: $POD_CAPACITY Requests Per Second"

# Calculate required pods: (CURRENT_RPS + POD_CAPACITY - 1) / POD_CAPACITY
# This is a bash trick to simulate mathematical 'ceiling' (rounding up)
DESIRED_PODS=$(( (CURRENT_RPS + POD_CAPACITY - 1) / POD_CAPACITY ))

# Ensure we always have at least 1 pod running
if [ "$DESIRED_PODS" -lt 1 ]; then
    DESIRED_PODS=1
fi

echo "🚀 Scaling Deployment '$DEPLOYMENT_NAME' to $DESIRED_PODS replicas..."

# Issue the command to the Kubernetes API
kubectl scale deployment $DEPLOYMENT_NAME --replicas=$DESIRED_PODS

echo "✅ Scaling command issued. Run 'kubectl get pods' to see them spinning up."
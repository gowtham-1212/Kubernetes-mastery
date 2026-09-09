#!/bin/bash
CLUSTER_NAME="autoscale-cluster"
NODE_COUNT=1

echo "🤖 Local Cluster Autoscaler (CA) Started..."
echo "👀 Watching for Pending pods due to insufficient CPU..."

while true; do
  # Check if there are any pods stuck in the Pending state
  PENDING_PODS=$(kubectl get pods --field-selector=status.phase=Pending --no-headers 2>/dev/null | wc -l)
  
  if [ "$PENDING_PODS" -gt 0 ]; then
    echo "🚨 ALERT: $PENDING_PODS Pod(s) are Pending! Cluster capacity exhausted."
    echo "☁️  Simulating Cloud API call to provision new hardware..."
    
    # Provision a new node via k3d (Docker)
    NEW_NODE_NAME="worker-${NODE_COUNT}"
    k3d node create $NEW_NODE_NAME --cluster $CLUSTER_NAME --role agent
    
    # Push our app image into the new node so it doesn't get ErrImageNeverPull
    echo "🚚 Loading Docker image into new node cache..."
    k3d image import autoscale-api:v1 -c $CLUSTER_NAME
    
    echo "✅ Node $NEW_NODE_NAME successfully joined the cluster!"
    NODE_COUNT=$((NODE_COUNT + 1))
    
    # Sleep to allow the Scheduler time to place the pods on the new node
    sleep 15
  fi
  
  sleep 5
done
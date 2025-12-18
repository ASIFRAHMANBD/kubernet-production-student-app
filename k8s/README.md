# Kubernetes Deployment Guide - Student App

This directory contains Kubernetes configuration files for deploying the Student App in a production-ready environment using Kubernetes orchestration.

## 📋 Project Structure

```
k8s/
├── backend-deployment.yaml      # Backend service deployment configuration
├── frontend-deployment.yaml     # Frontend service deployment configuration
├── postgres-deployment.yaml     # PostgreSQL database deployment
├── ingress.yaml                 # Ingress controller for routing traffic
└── README.md                    # This file
```

## 📚 Understanding the Files

### backend-deployment.yaml
Defines the deployment for the Node.js backend service. Includes:
- Pod specifications
- Container image configuration
- Environment variables
- Resource limits and requests
- Service definition

### frontend-deployment.yaml
Configures the React frontend deployment. Includes:
- Nginx web server configuration
- Static asset serving
- Port exposure
- Replica management

### postgres-deployment.yaml
Sets up the PostgreSQL database with:
- Persistent volume claims for data storage
- Service definition for internal connectivity
- Database initialization
- Storage configuration

### ingress.yaml
Handles external traffic routing:
- URL path routing
- Service mapping
- TLS configuration (if applicable)
- Hostname mapping

---

## 🚀 Getting Started

### Prerequisites
- Kubernetes cluster (v1.20+)
- `kubectl` CLI installed and configured
- Docker images built and pushed to registry

### Quick Start

```bash
# Navigate to k8s directory
cd k8s/

# Deploy all resources
kubectl apply -f .

# Verify deployments
kubectl get deployments
kubectl get pods
kubectl get services
```

---

## 📦 Common kubectl Commands

### Checking Status

```bash
# List all deployments
kubectl get deployments

# List all pods with detailed info
kubectl get pods -o wide

# List all services
kubectl get services

# List all ingresses
kubectl get ingress

# Check nodes in cluster
kubectl get nodes

# View all resources
kubectl get all
```

### Detailed Information

```bash
# Describe a specific deployment
kubectl describe deployment backend-deployment

# Describe a specific pod
kubectl describe pod <pod-name>

# Describe a service
kubectl describe svc backend-service

# Get detailed YAML of a resource
kubectl get deployment backend-deployment -o yaml
```

### Viewing Logs

```bash
# View logs from a specific pod
kubectl logs <pod-name>

# Follow logs in real-time
kubectl logs <pod-name> -f

# View logs from a specific container in a pod
kubectl logs <pod-name> -c <container-name>

# View logs from previous crashed pod
kubectl logs <pod-name> --previous

# View logs from all pods in a deployment
kubectl logs -l app=backend --all-containers=true
```

### Executing Commands in Pods

```bash
# Execute a command in a pod
kubectl exec <pod-name> -- <command>

# Interactive shell session
kubectl exec -it <pod-name> -- /bin/bash

# Execute command in specific container
kubectl exec -it <pod-name> -c <container-name> -- /bin/sh
```

### Port Forwarding

```bash
# Forward local port to pod port
kubectl port-forward <pod-name> 3000:3000

# Forward local port to service port
kubectl port-forward svc/backend-service 3000:3000

# Forward with specific local address
kubectl port-forward --address 0.0.0.0 svc/backend-service 3000:3000
```

---

## 🔧 Deployment Management

### Deploy Resources

```bash
# Deploy all files in directory
kubectl apply -f .

# Deploy specific file
kubectl apply -f backend-deployment.yaml

# Deploy with specific namespace
kubectl apply -f . -n production

# Create namespace first
kubectl create namespace production
kubectl apply -f . -n production
```

### Update Deployments

```bash
# Update image of a deployment
kubectl set image deployment/backend-deployment backend=<new-image>:<tag>

# Update environment variables
kubectl set env deployment/backend-deployment ENV_VAR=value

# Scale deployment replicas
kubectl scale deployment backend-deployment --replicas=3

# Rolling update
kubectl rollout status deployment/backend-deployment
```

### Rolling Back

```bash
# View rollout history
kubectl rollout history deployment/backend-deployment

# Rollback to previous version
kubectl rollout undo deployment/backend-deployment

# Rollback to specific revision
kubectl rollout undo deployment/backend-deployment --to-revision=2

# Check rollout status
kubectl rollout status deployment/backend-deployment
```

---

## 🔍 Monitoring & Debugging

### Resource Usage

```bash
# View node resource usage
kubectl top nodes

# View pod resource usage
kubectl top pods

# View resource usage for specific deployment
kubectl top pods -l app=backend
```

### Events & Status

```bash
# View cluster events
kubectl get events

# View events sorted by time
kubectl get events --sort-by='.lastTimestamp'

# Describe events for a pod
kubectl describe pod <pod-name>
```

### Debugging Pods

```bash
# Check pod status
kubectl get pod <pod-name> -o wide

# Describe pod for issues
kubectl describe pod <pod-name>

# Check pod logs
kubectl logs <pod-name>

# Check previous logs
kubectl logs <pod-name> --previous

# Check resource quotas
kubectl describe resourcequota
```

---

## 🗑️ Cleanup & Deletion

### Delete Resources

```bash
# Delete all resources in directory
kubectl delete -f .

# Delete specific resource
kubectl delete -f backend-deployment.yaml

# Delete deployment by name
kubectl delete deployment backend-deployment

# Delete service
kubectl delete service backend-service

# Delete all resources with label
kubectl delete all -l app=backend

# Delete namespace (deletes all resources in it)
kubectl delete namespace production
```

### Delete Specific Resources

```bash
# Delete pod immediately
kubectl delete pod <pod-name> --grace-period=0 --force

# Delete multiple resources
kubectl delete deployment,service,pod -l app=backend
```

---

## 🔐 Namespace Management

```bash
# Create namespace
kubectl create namespace production

# Switch default namespace
kubectl config set-context --current --namespace=production

# View current namespace
kubectl config view --minify | grep namespace

# List all namespaces
kubectl get namespaces

# Deploy to specific namespace
kubectl apply -f backend-deployment.yaml -n production

# Get resources from all namespaces
kubectl get pods --all-namespaces

# Switch between namespaces
kubectl config set-context --current --namespace=default
```

---

## 📊 Advanced Kubectl Commands

### Using Labels & Selectors

```bash
# Get resources with specific label
kubectl get pods -l app=backend

# Get resources with multiple labels
kubectl get pods -l app=backend,tier=api

# List all labels
kubectl get pods --show-labels

# Add label to resource
kubectl label pod <pod-name> tier=api

# Remove label
kubectl label pod <pod-name> tier-
```

### Output Formatting

```bash
# Output as YAML
kubectl get deployment -o yaml

# Output as JSON
kubectl get deployment -o json

# Custom output format
kubectl get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase

# Wide output (more columns)
kubectl get pods -o wide
```

### Filtering & Searching

```bash
# Watch resources in real-time
kubectl get pods -w

# Get resources from specific node
kubectl get pods --field-selector spec.nodeName=node-1

# Get pods in pending state
kubectl get pods --field-selector=status.phase=Pending
```

---

## 📈 ConfigMaps & Secrets

```bash
# Create ConfigMap from file
kubectl create configmap app-config --from-file=config.yaml

# Create ConfigMap from literal
kubectl create configmap app-config --from-literal=key1=value1

# View ConfigMap
kubectl get configmap
kubectl describe configmap app-config

# Create Secret
kubectl create secret generic app-secret --from-literal=password=secret123

# View Secrets (data is encoded)
kubectl get secrets
kubectl describe secret app-secret
```

---

## 🌐 Service & Ingress

```bash
# Get service endpoints
kubectl get endpoints

# Describe ingress
kubectl describe ingress

# Get ingress details
kubectl get ingress -o yaml

# Test ingress routing
curl -H "Host: app.example.com" http://localhost
```

---

## 📝 Useful Aliases

Add these to your shell profile (`.bashrc`, `.zshrc`):

```bash
alias k=kubectl
alias kgp='kubectl get pods'
alias kgd='kubectl get deployments'
alias kgs='kubectl get services'
alias kl='kubectl logs'
alias ke='kubectl exec -it'
alias kdes='kubectl describe'
alias ka='kubectl apply -f'
alias kdel='kubectl delete'
alias kctx='kubectl config current-context'
```

---

## 🐛 Troubleshooting Common Issues

### Pod Won't Start
```bash
# Check pod status
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name>
```

### Service Not Accessible
```bash
# Verify service exists
kubectl get service <service-name>

# Check endpoints
kubectl get endpoints <service-name>

# Test pod connectivity
kubectl exec -it <pod-name> -- curl http://service-name:port
```

### Out of Resources
```bash
# Check node resources
kubectl top nodes
kubectl describe nodes

# Check pod resource requests
kubectl describe pod <pod-name>
```

---

## 📚 References

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

---

## ✅ Deployment Checklist

- [ ] Kubernetes cluster is running
- [ ] kubectl is configured to access cluster
- [ ] Docker images are built and pushed to registry
- [ ] All YAML files are valid
- [ ] ConfigMaps and Secrets are created
- [ ] Resource quotas are set (if needed)
- [ ] PersistentVolumes are available (for postgres)
- [ ] Ingress controller is installed
- [ ] All deployments are running
- [ ] Services are accessible
- [ ] Logs show no errors

---

**Last Updated:** December 18, 2025


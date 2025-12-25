# Student App - Kubernetes Deployment (Docker Hub: asif449)

Deploy the Student App to Kubernetes using Docker images hosted on Docker Hub.

## Prerequisites

```bash
# Install kubectl
brew install kubernetes-cli

# Verify kubectl
kubectl version --client

# Ensure a cluster is configured
kubectl cluster-info
kubectl get nodes
```

If you don't have a cluster:
- Local: Docker Desktop (enable Kubernetes), Minikube, or Kind
- Cloud: DigitalOcean, AWS EKS, GKE, AKS

## Build & Push Images (Docker Hub: asif449)

```bash
# Login to Docker Hub
docker login

# Backend
docker build -t asif449/student-backend:latest ./backend
docker push asif449/student-backend:latest

# Frontend
docker build -t asif449/student-frontend:latest ./frontend
docker push asif449/student-frontend:latest
```

Images referenced in manifests:
- Backend: `asif449/student-backend:latest`
- Frontend: `asif449/student-frontend:latest`

## Deploy Manifests

```bash
# Create namespace
kubectl create namespace student-app

# Deploy database
kubectl apply -f k8s/postgres-deployment.yaml -n student-app

# Deploy backend (port 5000 inside cluster)
kubectl apply -f k8s/backend-deployment.yaml -n student-app

# Deploy frontend (served via Nginx on port 80)
kubectl apply -f k8s/frontend-deployment.yaml -n student-app

# Optional: ingress routes '/' to frontend and '/api' to backend
kubectl apply -f k8s/ingress.yaml -n student-app
```

## Verify

```bash
kubectl get all -n student-app
kubectl get pods -n student-app
kubectl logs -l app=backend -n student-app --tail=50
kubectl logs -l app=frontend -n student-app --tail=50
kubectl logs -l app=postgres -n student-app --tail=50
```

## Access Options

- NodePort (default in manifests):
  - Frontend: node IP `http://<node-ip>:30080`
  - Backend API: node IP `http://<node-ip>:30500`

- Port-forward (handy for local clusters):
```bash
kubectl port-forward svc/frontend-service 4050:80 -n student-app
kubectl port-forward svc/backend-service 3000:5000 -n student-app
```
Access:
- Frontend: http://localhost:4050
- Backend:  http://localhost:3000

- Ingress (requires Nginx Ingress Controller):
  - `/` → frontend-service:80
  - `/api` → backend-service:5000

## Configuration Notes

- Backend container listens on `PORT=5000` (default). Service and ingress route to 5000.
- Frontend reads `REACT_APP_API_URL=http://backend-service:5000` within the cluster.
- PostgreSQL credentials (dev defaults):
  - user: `postgres`, password: `postgres`, db: `studentdb`
  - Service: `postgres-service:5432`

## Update Manifests (if needed)

- To change backend external NodePort:
```yaml
# k8s/backend-deployment.yaml (Service section)
ports:
  - port: 5000
    targetPort: 5000
    nodePort: 30500  # change within 30000-32767
```

- To adjust frontend NodePort:
```yaml
# k8s/frontend-deployment.yaml (Service section)
ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
```

## Cleanup

```bash
kubectl delete -f k8s/ingress.yaml -n student-app
kubectl delete -f k8s/frontend-deployment.yaml -n student-app
kubectl delete -f k8s/backend-deployment.yaml -n student-app
kubectl delete -f k8s/postgres-deployment.yaml -n student-app
kubectl delete namespace student-app
```

## Quick Troubleshooting

- Backend failing to connect to DB:
  - Ensure `postgres-service` is Ready: `kubectl get pods -l app=postgres -n student-app`
  - Check backend logs: `kubectl logs -l app=backend -n student-app`
- Frontend cannot call API:
  - Confirm `REACT_APP_API_URL` points to `http://backend-service:5000`
  - Test from a frontend pod: `kubectl exec -it <frontend-pod> -n student-app -- wget -qO- http://backend-service:5000/health`
- Ingress not reachable:
  - Verify Ingress Controller installed and `kubectl get ingress -n student-app`

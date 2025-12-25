# Kubernetes Production Student App

A complete production-ready Student Management Application deployed on Kubernetes with containerized frontend and backend services, PostgreSQL database, and Nginx reverse proxy.

## 🎯 Project Overview

This is a full-stack web application for managing student information, built with modern technologies and containerized for cloud-native deployment. The application demonstrates best practices for production Kubernetes deployments including:

- Containerized microservices (Frontend & Backend)
- Database persistence with PostgreSQL
- Traffic routing with Nginx Ingress
- Cloud-native architecture
- Infrastructure as Code (IaC) with Kubernetes YAML

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Internet / Client                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Kubernetes Ingress                        │
│              (External Traffic Router)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
┌───▼──────────────┐  ┌──▼──────────────┐  ┌─▼──────────────┐
│  Frontend Pod    │  │  Backend Pod    │  │ Database Pod   │
│  (React + Nginx) │  │  (Node.js)      │  │ (PostgreSQL)   │
│  :80 / :443      │  │  :3000          │  │ :5432          │
└────────────────┬─┘  └──┬───────────────┘  └────────────────┘
                │        │
                │        │
        ┌───────▼────────▼────────┐
        │  Kubernetes Services    │
        │  (Service Discovery)    │
        └────────────────────────┘
```

---

## 📦 Tech Stack

### Frontend
- **Framework**: React.js
- **Server**: Nginx
- **Container**: Docker
- **Port**: 80 / 443

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **Port**: 3000
- **Container**: Docker

### Database
- **System**: PostgreSQL
- **Persistence**: Kubernetes PersistentVolume
- **Port**: 5432

### Orchestration
- **Platform**: Kubernetes (k8s)
- **Ingress**: Nginx Ingress Controller
- **Infrastructure**: Docker Containers

---

## 📂 Project Structure

```
student-app/
├── backend/
│   ├── Dockerfile              # Backend container image
│   ├── server.js               # Express.js entry point
│   ├── package.json            # Backend dependencies
│   └── ...                     # Additional backend files
│
├── frontend/
│   ├── Dockerfile              # Frontend container image
│   ├── nginx.conf              # Nginx configuration
│   ├── package.json            # Frontend dependencies
│   ├── public/
│   │   └── index.html          # HTML entry point
│   └── src/
│       ├── App.js              # React root component
│       └── index.js            # React DOM render
│
├── k8s/
│   ├── backend-deployment.yaml    # Backend K8s manifest
│   ├── frontend-deployment.yaml   # Frontend K8s manifest
│   ├── postgres-deployment.yaml   # Database K8s manifest
│   ├── ingress.yaml               # Ingress controller config
│   └── README.md                  # Kubernetes guide
│
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

#### Local Development
- Node.js v14+ and npm/yarn
- Docker Desktop with Kubernetes enabled
- kubectl CLI (v1.20+)
- PostgreSQL (optional, for local testing)

#### Kubernetes Deployment
- Kubernetes cluster (v1.20+)
- kubectl configured to access cluster
- Docker registry access (DockerHub, ECR, etc.)
- Nginx Ingress Controller installed

### Quick Start (Local Development)

#### 1. Clone Repository
```bash
git clone git@github.com:ASIFRAHMANBD/kubernet-production-student-app.git
cd student-app
```

#### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file (if needed)
echo "DATABASE_URL=postgresql://user:password@localhost:5432/student_db" > .env

# Start server
npm start

# Server runs on http://localhost:3000
```

#### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
npm install

# Build React app
npm run build

# Start development server (alternative)
npm start

# App runs on http://localhost:3000 (dev) or served by Nginx
```

#### 4. Setup Database
```bash
# Using Docker
docker run --name postgres-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=student_db \
  -p 5432:5432 \
  postgres:latest

# Or use existing PostgreSQL installation
createdb student_db
```

---

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Build backend image
cd backend
docker build -t <registry>/student-app-backend:latest .
docker push <registry>/student-app-backend:latest

# Build frontend image
cd ../frontend
docker build -t <registry>/student-app-frontend:latest .
docker push <registry>/student-app-frontend:latest
```

### Run with Docker Compose (if available)
```bash
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment

### 1. Update Image References
Update the image names in k8s YAML files to your registry:

```bash
# Edit k8s/backend-deployment.yaml
# Change: image: <your-registry>/student-app-backend:latest

# Edit k8s/frontend-deployment.yaml
# Change: image: <your-registry>/student-app-frontend:latest
```

### 2. Deploy to Kubernetes

```bash
# Navigate to k8s directory
cd k8s/

# Create namespace (optional but recommended)
kubectl create namespace student-app

# Deploy all resources
kubectl apply -f . -n student-app

# Or deploy individually
kubectl apply -f postgres-deployment.yaml -n student-app
kubectl apply -f backend-deployment.yaml -n student-app
kubectl apply -f frontend-deployment.yaml -n student-app
kubectl apply -f ingress.yaml -n student-app
```

### 3. Verify Deployment

```bash
# Check all resources
kubectl get all -n student-app

# Check pods
kubectl get pods -n student-app

# Check services
kubectl get svc -n student-app

# Check ingress
kubectl get ingress -n student-app

# Check deployment status
kubectl rollout status deployment/backend-deployment -n student-app
kubectl rollout status deployment/frontend-deployment -n student-app
```

### 4. Access Application

```bash
# Get Ingress IP/Host
kubectl get ingress -n student-app

# Access via browser
http://<ingress-ip-or-hostname>
```

---

## 📊 API Endpoints

### Backend API (http://localhost:3000)

```
Base URL: /api

Endpoints:
├── GET    /students              # List all students
├── GET    /students/:id          # Get student by ID
├── POST   /students              # Create new student
├── PUT    /students/:id          # Update student
├── DELETE /students/:id          # Delete student
└── GET    /health                # Health check
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@postgres:5432/student_db
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

#### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=production
```

### Database Configuration

Default PostgreSQL credentials (can be changed in postgres-deployment.yaml):
- **Username**: postgres
- **Password**: postgres
- **Database**: student_db
- **Port**: 5432

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# Backend logs
kubectl logs deployment/backend-deployment -n student-app -f

# Frontend logs
kubectl logs deployment/frontend-deployment -n student-app -f

# Database logs
kubectl logs deployment/postgres-deployment -n student-app -f
```

### Access Pod Shell

```bash
# Backend pod shell
kubectl exec -it <backend-pod-name> -n student-app -- /bin/bash

# Database pod shell
kubectl exec -it <postgres-pod-name> -n student-app -- /bin/bash
```

### Port Forwarding

```bash
# Forward backend service
kubectl port-forward svc/backend-service 3000:3000 -n student-app

# Forward database service
kubectl port-forward svc/postgres-service 5432:5432 -n student-app

# Forward frontend service
kubectl port-forward svc/frontend-service 80:80 -n student-app
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run tests (if configured)
npm test

# Run with coverage
npm test -- --coverage
```

### Frontend Testing
```bash
cd frontend

# Run tests
npm test

# Build production bundle
npm run build
```

---

## 📈 Performance & Scaling

### Horizontal Pod Autoscaling (HPA)

```bash
# Scale backend deployment manually
kubectl scale deployment backend-deployment --replicas=3 -n student-app

# View autoscaling metrics
kubectl get hpa -n student-app

# Create HPA (if configured)
kubectl autoscale deployment backend-deployment \
  --min=2 --max=10 --cpu-percent=80 -n student-app
```

### Resource Limits

Current resource requests/limits (adjustable in YAML):
```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

---

## 🔐 Security Best Practices

- ✅ Container image scanning
- ✅ Pod security policies
- ✅ Network policies
- ✅ RBAC (Role-Based Access Control)
- ✅ Secrets management
- ✅ Environment variable encryption
- ✅ TLS/HTTPS support via Ingress

---

## 🧹 Cleanup

### Remove Kubernetes Resources

```bash
# Delete all resources in namespace
kubectl delete namespace student-app

# Or delete resources one by one
kubectl delete -f k8s/ -n student-app
```

### Remove Docker Images

```bash
docker rmi <registry>/student-app-backend:latest
docker rmi <registry>/student-app-frontend:latest
```

---

## 📚 Documentation

- [Kubernetes Guide](./k8s/README.md) - Detailed Kubernetes commands and management
- [Backend README](./backend/README.md) - Backend setup and API documentation
- [Frontend README](./frontend/README.md) - Frontend setup and component docs

---

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open Pull Request

### Development Workflow
- Follow code style guidelines
- Write tests for new features
- Update documentation
- Test in local environment before pushing

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Troubleshooting

### Common Issues

#### Pod won't start
```bash
# Check pod status
kubectl describe pod <pod-name> -n student-app

# View logs
kubectl logs <pod-name> -n student-app
```

#### Service not reachable
```bash
# Check service endpoints
kubectl get endpoints -n student-app

# Test connectivity
kubectl exec -it <pod-name> -n student-app -- curl http://service-name
```

#### Database connection errors
```bash
# Verify postgres pod is running
kubectl get pod -l app=postgres -n student-app

# Check database logs
kubectl logs -l app=postgres -n student-app
```

---

## 📞 Support & Contact

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: asif@example.com

---

## 📋 Useful Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Project Version**: 1.0.0  
**Last Updated**: December 18, 2025  
**Status**: Production Ready ✅

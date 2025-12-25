# Student App - Ansible Docker Deployment

A full-stack Student Management Application deployed with **Ansible** on a remote server using **Docker containers**.

## 🎯 Quick Start - Copy & Paste Commands

### **Step 1: Prepare Your Local Machine**

```bash
# Install Ansible (macOS)
brew install ansible

# Verify Ansible installation
ansible --version

# Verify SSH key exists
ls -la ~/.ssh/id_rsa.pub
```

### **Step 2: Copy SSH Key to Remote Server**

```bash
# Replace with your server IP
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_SERVER_IP
```

### **Step 3: Create Ansible Configuration Files**

**Update `ansible/inventory.ini`:**
```ini
[production]
prod_server ansible_host=YOUR_SERVER_IP ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa

[production:vars]
ansible_python_interpreter=/usr/bin/python3
```

**Update `ansible/group_vars/all.yml`:**
```yaml
---
app_name: student-app
project_dir: ~/student-app

# Database
vault_db_password: "YOUR_SECURE_PASSWORD"
db_host: localhost
db_port: 5432
db_user: postgres
db_name: student_db

# Ports
frontend_port: 4050
backend_port: 3000
```

### **Step 4: Run Ansible Deployment**

```bash
# Test connectivity
ansible -i ansible/inventory.ini production -m ping

# Deploy everything
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml

# Check running containers
ssh root@YOUR_SERVER_IP docker ps
```

### **Step 5: Update Frontend API URL**

**Edit `frontend/src/App.js` - Line 3:**
```javascript
const API_URL = 'http://YOUR_SERVER_IP:3000';
```

**Redeploy Frontend:**
```bash
# Copy updated file
scp frontend/src/App.js root@YOUR_SERVER_IP:~/student-app/frontend/src/

# Rebuild and restart
ssh root@YOUR_SERVER_IP "cd ~/student-app/frontend && docker build --no-cache -t student-app-frontend:latest . && docker stop student-app-frontend && docker rm student-app-frontend && docker run -d --name student-app-frontend -p 4050:4050 --restart always student-app-frontend:latest"
```

### **Step 6: Restart Backend with Host Network**

```bash
ssh root@YOUR_SERVER_IP "docker stop student-app-backend && docker rm student-app-backend && docker run -d --name student-app-backend --network host -e NODE_ENV=production -e DB_HOST=127.0.0.1 -e DB_PORT=5432 -e DB_USER=postgres -e DB_PASSWORD=YOUR_SECURE_PASSWORD -e DB_NAME=student_db -e PORT=3000 --restart always student-app-backend:latest"
```

---

## 📊 Access Your Application

```
Frontend:  http://YOUR_SERVER_IP:4050
Backend:   http://YOUR_SERVER_IP:3000
API:       http://YOUR_SERVER_IP:3000/api/students
Database:  YOUR_SERVER_IP:5432
```

---

## 🔧 Useful Commands

### **Check Application Status**

```bash
# Check all running containers
ssh root@YOUR_SERVER_IP docker ps

# View backend logs
ssh root@YOUR_SERVER_IP docker logs student-app-backend --tail 50

# View frontend logs
ssh root@YOUR_SERVER_IP docker logs student-app-frontend --tail 50

# View database logs
ssh root@YOUR_SERVER_IP docker logs student-app-postgres --tail 50
```

### **Restart Services**

```bash
# Restart frontend
ssh root@YOUR_SERVER_IP "docker restart student-app-frontend"

# Restart backend
ssh root@YOUR_SERVER_IP "docker restart student-app-backend"

# Restart database
ssh root@YOUR_SERVER_IP "docker restart student-app-postgres"
```

### **Test API Connectivity**

```bash
# Test if API is responding
curl http://YOUR_SERVER_IP:3000/api/students

# Test frontend (should return HTML)
curl -I http://YOUR_SERVER_IP:4050
```

### **Check Database Connection**

```bash
# Connect to PostgreSQL
ssh root@YOUR_SERVER_IP "docker exec -it student-app-postgres psql -U postgres -d student_db -c 'SELECT * FROM students;'"
```

---

## 📂 Project Structure

```
student-app/
├── ansible/
│   ├── inventory.ini              # Server configuration
│   ├── playbook.yml               # Deployment automation
│   └── group_vars/
│       └── all.yml                # Variables
│
├── backend/
│   ├── Dockerfile
│   ├── server.js                  # Express.js API
│   └── package.json
│
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf                 # Nginx config for port 4050
│   ├── src/
│   │   ├── App.js                 # React component
│   │   └── index.js
│   └── package.json
│
└── README.md                       # This file
```

---

## 🐳 Local Docker Testing (Optional)

```bash
# Build all images locally
cd backend && docker build -t student-app-backend:latest .
cd ../frontend && docker build -t student-app-frontend:latest .

# Run PostgreSQL
docker run -d --name postgres-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=student_db \
  -p 5432:5432 \
  postgres:14

# Run Backend
docker run -d --name backend \
  --network host \
  -e DB_HOST=127.0.0.1 \
  -e DB_PORT=5432 \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=student_db \
  -e PORT=3000 \
  student-app-backend:latest

# Run Frontend
docker run -d --name frontend \
  -p 4050:4050 \
  student-app-frontend:latest

# Stop all
docker stop postgres-db backend frontend
docker rm postgres-db backend frontend
```

---

## 🚀 API Endpoints

```
GET    http://YOUR_SERVER_IP:3000/api/students       # List all students
GET    http://YOUR_SERVER_IP:3000/api/students/:id   # Get student by ID
POST   http://YOUR_SERVER_IP:3000/api/students       # Create student
PUT    http://YOUR_SERVER_IP:3000/api/students/:id   # Update student
DELETE http://YOUR_SERVER_IP:3000/api/students/:id   # Delete student
GET    http://YOUR_SERVER_IP:3000/health             # Health check
```

---

## ⚠️ Important Notes

1. **Change Database Password** - Replace `vault_db_password` with a secure password
2. **Update Server IP** - Replace `YOUR_SERVER_IP` with actual IP (e.g., `198.46.141.67`)
3. **Port 4050** - Frontend runs on 4050 to avoid conflicts with port 80
4. **Host Network** - Backend uses `--network host` for database connectivity
5. **SSH Key** - Ensure SSH key is in `~/.ssh/id_rsa`

---

## 🧹 Cleanup

```bash
# Stop all containers
ssh root@YOUR_SERVER_IP "docker stop student-app-backend student-app-frontend student-app-postgres"

# Remove containers
ssh root@YOUR_SERVER_IP "docker rm student-app-backend student-app-frontend student-app-postgres"

# Remove images
ssh root@YOUR_SERVER_IP "docker rmi student-app-backend:latest student-app-frontend:latest postgres:14"
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| **API returns 30500 error** | Update `App.js` API_URL to `:3000` and rebuild frontend |
| **Backend can't connect to DB** | Use `--network host` when running backend container |
| **Frontend shows old version** | Rebuild without cache: `docker build --no-cache ...` |
| **Port already in use** | Change port mapping in docker run command |
| **Ansible connection failed** | Verify SSH key: `ssh root@YOUR_SERVER_IP` |

---

## 📝 Next Project Checklist

- [ ] Update `ansible/inventory.ini` with new server IP
- [ ] Update database password in `ansible/group_vars/all.yml`
- [ ] Update API URL in `frontend/src/App.js`
- [ ] Run `ansible-playbook` command
- [ ] Copy `frontend/src/App.js` to remote server
- [ ] Rebuild frontend with `docker build --no-cache`
- [ ] Test: `curl http://YOUR_SERVER_IP:3000/api/students`
- [ ] Test: Visit `http://YOUR_SERVER_IP:4050` in browser

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: December 25, 2025

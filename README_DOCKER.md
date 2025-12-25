# Student App - Docker + Ansible Deployment

This guide deploys the Student App on a single server using Docker containers orchestrated by Ansible.

## Prerequisites

```bash
# macOS: install Ansible
brew install ansible

# Ensure SSH key exists and copy to server
ls ~/.ssh/id_rsa.pub
ssh-copy-id -i ~/.ssh/id_rsa.pub root@YOUR_SERVER_IP
```

## Configure Ansible

Update `ansible/inventory.ini`:
```ini
[production]
prod_server ansible_host=YOUR_SERVER_IP ansible_user=root ansible_ssh_private_key_file=~/.ssh/id_rsa
```

Update `ansible/group_vars/all.yml`:
```yaml
vault_db_password: "YOUR_SECURE_PASSWORD"
frontend_port: 4050
backend_port: 3000
project_dir: ~/student-app
```

## Deploy with Ansible

```bash
# Test connectivity
ansible -i ansible/inventory.ini production -m ping

# Deploy
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml
```

## Post-deploy checks

```bash
# On server
ssh root@YOUR_SERVER_IP docker ps
ssh root@YOUR_SERVER_IP docker logs student-app-backend --tail 50
ssh root@YOUR_SERVER_IP docker logs student-app-frontend --tail 50
ssh root@YOUR_SERVER_IP docker logs student-app-postgres --tail 50
```

## Access

- Frontend: http://YOUR_SERVER_IP:4050
- Backend API: http://YOUR_SERVER_IP:3000/api/students

## Restart services

```bash
ssh root@YOUR_SERVER_IP "docker restart student-app-frontend student-app-backend student-app-postgres"
```

## Troubleshooting

- Update frontend `App.js` API to `http://YOUR_SERVER_IP:3000`
- Rebuild frontend without cache:
```bash
ssh root@YOUR_SERVER_IP "cd ~/student-app/frontend && docker build --no-cache -t student-app-frontend:latest . && docker stop student-app-frontend && docker rm student-app-frontend && docker run -d --name student-app-frontend -p 4050:4050 --restart always student-app-frontend:latest"
```
- Backend DB connectivity (host network):
```bash
ssh root@YOUR_SERVER_IP "docker stop student-app-backend && docker rm student-app-backend && docker run -d --name student-app-backend --network host -e DB_HOST=127.0.0.1 -e DB_PORT=5432 -e DB_USER=postgres -e DB_PASSWORD=YOUR_SECURE_PASSWORD -e DB_NAME=student_db -e PORT=3000 --restart always student-app-backend:latest"
```
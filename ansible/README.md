# Ansible Deployment for Student App

## Prerequisites

1. Install Ansible:
   ```bash
   # macOS
   brew install ansible
   
   # or via pip
   pip install ansible
   ```

2. Ensure target server has:
   - kubectl installed and configured
   - Access to your Kubernetes cluster
   - SSH access configured

## Setup

1. Edit `inventory.ini` and replace `YOUR_SERVER_IP` with your actual server IP/hostname

2. Test connection:
   ```bash
   ansible all -i inventory.ini -m ping
   ```

## Deploy

Run the playbook:
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml
```

### Check deployment only (dry-run):
```bash
ansible-playbook -i inventory.ini playbook.yml --check
```

### Run with verbose output:
```bash
ansible-playbook -i inventory.ini playbook.yml -v
```

## What the playbook does

1. Creates `/opt/student-app` directory on target server
2. Copies k8s manifests from local machine to server
3. Applies all Kubernetes manifests
4. Waits for deployments to be ready
5. Shows service endpoints

## Customization

- Edit variables in `group_vars/all.yml`
- Modify `playbook.yml` to add more tasks
- Create environment-specific inventory files (production.ini, staging.ini)

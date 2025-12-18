# Database Backup & Restore Guide

Comprehensive guide for backing up and restoring PostgreSQL databases in Kubernetes environments.

---

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Manual Backup](#manual-backup)
3. [Backup Restoration](#backup-restoration)
4. [Compressed Backups](#compressed-backups)
5. [Backup Management](#backup-management)
6. [Automated Backups](#automated-backups)
7. [Backup Strategies](#backup-strategies)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Reference

### Quick Backup
```bash
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb > backup.sql
```

### Quick Restore
```bash
kubectl exec -i <postgres-pod> -- psql -U postgres studentdb < backup.sql
```

### Quick Compressed Backup
```bash
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | gzip > backup.sql.gz
```

### Quick Compressed Restore
```bash
gunzip -c backup.sql.gz | kubectl exec -i <postgres-pod> -- psql -U postgres studentdb
```

---

## 🔐 Manual Backup

### Backup Commands

#### 1. Basic Full Database Backup
```bash
# Get pod name
kubectl get pods -n student-app -l app=postgres

# Backup database
kubectl exec <postgres-pod-name> -n student-app -- \
  pg_dump -U postgres studentdb > backup.sql

# Example:
# kubectl exec postgres-5c4f8d9f7c-abc12 -n student-app -- \
#   pg_dump -U postgres studentdb > backup.sql
```

#### 2. Backup with Custom Username
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U <username> studentdb > backup.sql

# Example:
kubectl exec postgres-pod -- \
  pg_dump -U myuser studentdb > backup.sql
```

#### 3. Backup Specific Schema Only
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -n public studentdb > schema_backup.sql
```

#### 4. Backup Specific Table Only
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -t students studentdb > students_table.sql
```

#### 5. Backup Multiple Specific Tables
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -t students -t courses -t enrollments studentdb > partial_backup.sql
```

#### 6. Backup All Databases
```bash
kubectl exec <postgres-pod> -- \
  pg_dumpall -U postgres > all_databases_backup.sql
```

#### 7. Backup with Verbose Output
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -v studentdb > backup.sql 2> backup.log
```

#### 8. Backup with Custom Format (Binary)
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -Fc studentdb > backup.dump

# Where:
# -F c = Custom format (binary, better compression)
# -F d = Directory format (parallel processing)
# -F t = TAR format
# -F p = Plain SQL (default)
```

---

## 🔄 Backup Restoration

### Restore Commands

#### 1. Basic Database Restore
```bash
# Create new database (if needed)
kubectl exec <postgres-pod> -- \
  psql -U postgres -c "CREATE DATABASE studentdb_restored;"

# Restore backup
kubectl exec -i <postgres-pod> -- \
  psql -U postgres studentdb_restored < backup.sql
```

#### 2. Restore to Existing Database
```bash
# Drop existing database (WARNING: Destructive)
kubectl exec <postgres-pod> -- \
  psql -U postgres -c "DROP DATABASE studentdb;"

# Create fresh database
kubectl exec <postgres-pod> -- \
  psql -U postgres -c "CREATE DATABASE studentdb;"

# Restore backup
kubectl exec -i <postgres-pod> -- \
  psql -U postgres studentdb < backup.sql
```

#### 3. Restore with Verbose Output
```bash
kubectl exec -i <postgres-pod> -- \
  psql -U postgres -d studentdb -v ON_ERROR_STOP=1 < backup.sql
```

#### 4. Restore Single Table
```bash
kubectl exec -i <postgres-pod> -- \
  psql -U postgres -d studentdb < students_table.sql
```

#### 5. Restore from Custom Format Backup
```bash
kubectl exec <postgres-pod> -- \
  pg_restore -U postgres -d studentdb backup.dump
```

#### 6. Restore from Directory Format (Parallel)
```bash
kubectl exec <postgres-pod> -- \
  pg_restore -U postgres -d studentdb -j 4 backup_dir/
```

#### 7. Preview Restore Script
```bash
# View the SQL commands that would be executed
kubectl exec <postgres-pod> -- \
  pg_restore -U postgres --schema-only backup.dump | head -50
```

#### 8. Restore Specific Schema
```bash
kubectl exec -i <postgres-pod> -- \
  pg_restore -U postgres -d studentdb -n public backup.dump
```

---

## 🗜️ Compressed Backups

### Backup Commands

#### 1. GZIP Compression (Recommended)
```bash
# Create compressed backup
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres studentdb | gzip > backup.sql.gz

# Check compressed backup size
ls -lh backup.sql.gz
```

#### 2. BZIP2 Compression (Better compression, slower)
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres studentdb | bzip2 > backup.sql.bz2
```

#### 3. Custom Format with Compression
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -Fc studentdb > backup.dump

# Compression is built-in with custom format
```

#### 4. Custom Format with Maximum Compression
```bash
kubectl exec <postgres-pod> -- \
  pg_dump -U postgres -Fc -Z 9 studentdb > backup.dump.gz
```

### Restore Compressed Backups

#### 1. Restore from GZIP Backup
```bash
# Method 1: Pipe from gunzip
gunzip -c backup.sql.gz | \
  kubectl exec -i <postgres-pod> -- \
  psql -U postgres studentdb

# Method 2: Extract then restore
gunzip backup.sql.gz
kubectl exec -i <postgres-pod> -- \
  psql -U postgres studentdb < backup.sql
```

#### 2. Restore from BZIP2 Backup
```bash
bunzip2 -c backup.sql.bz2 | \
  kubectl exec -i <postgres-pod> -- \
  psql -U postgres studentdb
```

#### 3. Restore from Custom Format
```bash
kubectl exec <postgres-pod> -- \
  pg_restore -U postgres -d studentdb backup.dump
```

#### 4. View Custom Format Contents (Without Restoring)
```bash
kubectl exec <postgres-pod> -- \
  pg_restore -U postgres -l backup.dump | head -30
```

---

## 📁 Backup Management

### List Backups

#### 1. List Backups in Current Directory
```bash
ls -lh *.sql
ls -lh *.sql.gz
ls -lh *.dump
```

#### 2. List All Backups with Details
```bash
ls -lh ~/postgres-backups/
```

#### 3. List Backups by Date
```bash
ls -lhtr ~/postgres-backups/
```

#### 4. Count Backups
```bash
ls -1 ~/postgres-backups/ | wc -l
```

#### 5. Find Large Backups
```bash
find ~/postgres-backups/ -type f -size +100M -ls
```

#### 6. Backups Modified in Last 7 Days
```bash
find ~/postgres-backups/ -type f -mtime -7 -ls
```

### Download Backups

#### 1. Download from Remote VPS
```bash
# Basic download
scp user@VPS_IP:~/postgres-backups/backup.sql ~/Downloads/

# Download with progress
scp -v user@VPS_IP:~/postgres-backups/backup.sql ~/Downloads/

# Download multiple backups
scp user@VPS_IP:~/postgres-backups/*.sql ~/Downloads/
```

#### 2. Download Compressed Backup
```bash
scp user@VPS_IP:~/postgres-backups/backup.sql.gz ~/Downloads/
```

#### 3. Download Specific Backup by Date
```bash
scp user@VPS_IP:~/postgres-backups/backup-2025-12-18.sql.gz ~/Downloads/
```

#### 4. Using rsync (Better for multiple files)
```bash
rsync -avz --progress user@VPS_IP:~/postgres-backups/ ~/Downloads/postgres-backups/
```

#### 5. Upload to Cloud Storage (AWS S3)
```bash
aws s3 cp backup.sql.gz s3://my-backup-bucket/postgres-backups/
aws s3 cp ~/postgres-backups/ s3://my-backup-bucket/postgres-backups/ --recursive
```

### Organize Backups

#### 1. Create Backup Directory
```bash
mkdir -p ~/postgres-backups
cd ~/postgres-backups
```

#### 2. Create Backup with Timestamp
```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
  gzip > ~/postgres-backups/backup-$TIMESTAMP.sql.gz
```

#### 3. Create Named Backup
```bash
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
  gzip > ~/postgres-backups/backup-prod-$(date +%Y-%m-%d).sql.gz
```

#### 4. Delete Old Backups (30 days retention)
```bash
find ~/postgres-backups/ -type f -name "*.sql.gz" -mtime +30 -delete
```

#### 5. Archive Old Backups
```bash
mkdir -p ~/postgres-backups/archive
find ~/postgres-backups/ -type f -name "*.sql.gz" -mtime +7 \
  -exec mv {} ~/postgres-backups/archive/ \;
```

---

## 🤖 Automated Backups

### Using Backup Script

#### 1. Create Backup Script (backup.sh)
```bash
#!/bin/bash

# Configuration
NAMESPACE="student-app"
POD_LABEL="app=postgres"
BACKUP_DIR="${HOME}/postgres-backups"
RETENTION_DAYS=30
DB_NAME="studentdb"
DB_USER="postgres"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get pod name
POD=$(kubectl get pods -n "$NAMESPACE" -l "$POD_LABEL" -o jsonpath='{.items[0].metadata.name}')

if [ -z "$POD" ]; then
  echo "Error: PostgreSQL pod not found"
  exit 1
fi

# Create backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup-${TIMESTAMP}.sql.gz"

echo "Starting backup to $BACKUP_FILE..."

# Perform backup
kubectl exec "$POD" -n "$NAMESPACE" -- \
  pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup completed: $BACKUP_FILE"
  echo "Size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
  echo "Backup failed!"
  exit 1
fi

# Clean old backups
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "backup-*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed successfully!"
```

#### 2. Make Script Executable
```bash
chmod +x backup.sh
```

#### 3. Test Script
```bash
./backup.sh
```

#### 4. Schedule with Cron (Daily at 2 AM)
```bash
# Edit crontab
crontab -e

# Add this line
0 2 * * * /path/to/backup.sh >> /var/log/postgres-backup.log 2>&1
```

#### 5. Schedule with Cron (Every 6 hours)
```bash
# Edit crontab
crontab -e

# Add this line
0 */6 * * * /path/to/backup.sh >> /var/log/postgres-backup.log 2>&1
```

#### 6. View Cron Jobs
```bash
crontab -l
```

### Using Kubernetes CronJob

#### 1. Create CronJob Manifest
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: postgres-backup
  namespace: student-app
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          serviceAccountName: postgres-backup-sa
          containers:
          - name: backup
            image: postgres:15-alpine
            command:
            - /bin/sh
            - -c
            - |
              pg_dump -h postgres-service -U postgres -d studentdb | \
              gzip > /backup/backup-$(date +%Y%m%d-%H%M%S).sql.gz
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

#### 2. Create Backup Storage
```bash
# Create PVC for backups
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: backup-pvc
  namespace: student-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
EOF
```

---

## 💾 Backup Strategies

### Daily Backup Strategy

```bash
# Daily backup script
#!/bin/bash

BACKUP_DIR="$HOME/postgres-backups/daily"
mkdir -p "$BACKUP_DIR"

# Keep only last 7 days
find "$BACKUP_DIR" -type f -mtime +7 -delete

# Create new backup
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
  gzip > "$BACKUP_DIR/backup-$(date +%Y-%m-%d).sql.gz"
```

### Weekly Full + Daily Incremental

```bash
#!/bin/bash

BACKUP_DIR="$HOME/postgres-backups"
DAY_OF_WEEK=$(date +%u)  # 1=Monday, 7=Sunday

mkdir -p "$BACKUP_DIR/full"
mkdir -p "$BACKUP_DIR/incremental"

if [ "$DAY_OF_WEEK" = "1" ]; then
  # Monday: Full backup
  kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
    gzip > "$BACKUP_DIR/full/backup-full-$(date +%Y-%m-%d).sql.gz"
else
  # Other days: Keep incremental (for this setup, same as daily)
  kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
    gzip > "$BACKUP_DIR/incremental/backup-$(date +%Y-%m-%d).sql.gz"
fi
```

### Multi-Destination Backups

```bash
#!/bin/bash

BACKUP_FILE="backup-$(date +%Y%m%d).sql.gz"

# Backup to local storage
kubectl exec <postgres-pod> -- pg_dump -U postgres studentdb | \
  gzip > ~/postgres-backups/$BACKUP_FILE

# Copy to external drive
cp ~/postgres-backups/$BACKUP_FILE /Volumes/ExternalDrive/postgres-backups/

# Upload to cloud
aws s3 cp ~/postgres-backups/$BACKUP_FILE s3://my-bucket/postgres-backups/

echo "Backup saved to: local, external, and cloud storage"
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 1. Pod Not Found
```bash
# Error: pod not found
# Solution: Get correct pod name
kubectl get pods -n student-app -l app=postgres

# Then use the correct name in commands
```

#### 2. Permission Denied
```bash
# Error: permission denied for schema public
# Solution: Use correct credentials
kubectl exec <pod> -- pg_dump -U postgres -W studentdb

# Or check PostgreSQL user permissions
kubectl exec <pod> -- psql -U postgres -c "\l"
```

#### 3. Database Connection Failed
```bash
# Error: could not connect to database
# Solution: Verify database exists
kubectl exec <pod> -- psql -U postgres -l

# Or check if service is running
kubectl get svc -n student-app
```

#### 4. Pipe Broken Error
```bash
# Error: broken pipe
# Solution: Check if pod is running
kubectl get pods -n student-app

# Or try with timeout
timeout 300 kubectl exec <pod> -- pg_dump -U postgres studentdb
```

#### 5. Out of Disk Space
```bash
# Error: No space left on device
# Solution: Check disk usage
df -h

# Clean old backups
find ~/postgres-backups/ -type f -mtime +30 -delete

# Or use stdout directly without intermediate file
kubectl exec <pod> -- pg_dump -U postgres studentdb | \
  gzip | ssh user@remote.server "cat > ~/backup.sql.gz"
```

#### 6. Backup Too Slow
```bash
# Solution: Use custom format for faster backup
kubectl exec <pod> -- pg_dump -U postgres -Fc studentdb > backup.dump

# Or limit connections
kubectl exec <pod> -- pg_dump -U postgres -j 4 studentdb > backup.sql
```

#### 7. Restore Fails
```bash
# Solution: Create fresh database first
kubectl exec <pod> -- psql -U postgres -c "DROP DATABASE IF EXISTS studentdb;"
kubectl exec <pod> -- psql -U postgres -c "CREATE DATABASE studentdb;"

# Then restore
kubectl exec -i <pod> -- psql -U postgres studentdb < backup.sql
```

### Verification Commands

```bash
# Verify backup integrity
tar -tzf backup.sql.gz | head  # For tar archives

# Verify backup size
ls -lh backup.sql*

# Test restore to temp database
kubectl exec <pod> -- psql -U postgres -c "CREATE DATABASE test_restore;"
kubectl exec -i <pod> -- psql -U postgres test_restore < backup.sql

# Verify table count
kubectl exec <pod> -- psql -U postgres studentdb -c "\dt"

# Check backup timestamp
stat backup.sql.gz | grep Modify
```

---

## 📊 Monitoring Backup Health

### Check Last Backup Date
```bash
ls -lt ~/postgres-backups/ | head -1
```

### Setup Backup Alert (if latest backup is older than 24 hours)
```bash
#!/bin/bash

BACKUP_DIR="$HOME/postgres-backups"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup-*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ALERT: No backups found!"
  exit 1
fi

BACKUP_AGE=$(($(date +%s) - $(stat -f%m "$LATEST_BACKUP")))
BACKUP_AGE_HOURS=$((BACKUP_AGE / 3600))

if [ $BACKUP_AGE_HOURS -gt 24 ]; then
  echo "ALERT: Latest backup is $BACKUP_AGE_HOURS hours old"
  # Send email or notification here
else
  echo "OK: Latest backup is $BACKUP_AGE_HOURS hours old"
fi
```

---

## 🎯 Best Practices

1. **Backup Frequency**: Daily backups minimum
2. **Retention Policy**: Keep at least 30 days of backups
3. **Test Restores**: Monthly restore tests from backups
4. **Multiple Locations**: Store backups locally, externally, and in cloud
5. **Encryption**: Encrypt sensitive backups at rest
6. **Compression**: Use gzip or bzip2 for space efficiency
7. **Monitoring**: Alert if backups fail or are too old
8. **Documentation**: Document backup/restore procedures
9. **Automation**: Use scripts and cron jobs for reliability
10. **Verification**: Verify backup integrity regularly

---

## 📞 Support & Reference

For more PostgreSQL backup information:
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Kubernetes Backup Best Practices](https://kubernetes.io/docs/tasks/run-application/run-stateful-application/)

---

**Last Updated**: December 18, 2025  
**Database**: PostgreSQL 15-alpine  
**Kubernetes Version**: 1.20+

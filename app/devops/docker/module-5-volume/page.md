# মডিউল ৫: Docker Volume (ডেটা persistence)

**সময়:** ~৬০ মিনিট | **আগে দরকার:** [মডিউল ৪](/devops/docker/module-4-dockerfile)

> **এক লাইনে সমস্যা:** container remove করলে তার ভেতরের সব ডেটা মুছে যায়। ডাটাবেস, আপলোড ফাইল, লগ — কিছুই টিকবে না। Volume সেই সমস্যার সমাধান।

> **কনসেপ্ট:** Container = ভাড়াটিয়া, Volume = নিজের ব্যাংক লকার। ভাড়াটিয়া চলে গেলেও লকারের জিনিস থাকে।

> **Core Principle:** Volumes decouple the **data lifecycle** from the **container lifecycle**। Container মুছে গেলেও data intact থাকে।

---

## 🎯 কেন Docker Volume?

| সমস্যা | Without Volume | With Volume |
|--------|---------------|-------------|
| Container restart | ❌ Data হারিয়ে যায় | ✅ Data থাকে |
| Container delete | ❌ সব মুছে যায় | ✅ Volume safe |
| Data backup | ❌ Difficult | ✅ Easy backup |
| Multiple containers | ❌ Share করা যায় না | ✅ Share possible |

---

## 🏠 Analogy: "হোটেল রুম vs নিজের লকার"

### Container without Volume (হোটেল রুম)

```
🏨 Hotel Room (Container)
├── 🛏️ Bed (Temporary)
├── 📺 TV (Temporary)
└── 🧳 Your luggage (Data)

Check-out করলে → সব হারিয়ে যায় ❌
```

### Container with Volume (হোটেল + ব্যাংক লকার)

```
🏨 Hotel Room (Container)      🏦 Bank Locker (Volume)
├── 🛏️ Bed (Temporary)        ├── 💰 Money (Persistent)
├── 📺 TV (Temporary)          ├── 📜 Documents (Persistent)
└── 🔗 Link to locker         └── 💎 Valuables (Persistent)

Check-out করলে → লকার safe থাকে ✅
```

---

## 📦 Volume Types

### 1️⃣ Named Volume (Production Best!)

**কনসেপ্ট:** Docker manage করা dedicated storage যা name দিয়ে reference করা যায়।

```
Docker Host
├── /var/lib/docker/volumes/
│   ├── db-data/          ← Named Volume
│   │   └── _data/
│   │       └── postgres files
│   ├── app-logs/         ← Named Volume
│   │   └── _data/
│   │       └── log files
│   └── uploads/          ← Named Volume
│       └── _data/
│           └── user files
```

**সুবিধা:**
- ✅ Docker manage করে (internal volume store)
- ✅ Backup/restore easy
- ✅ Cross-platform (Windows/Linux/Mac)
- ✅ Automatic permissions
- ✅ Production-ready
- ✅ Multiple containers এ reuse করা যায়
- ✅ Container lifecycle থেকে independent

**Use Cases:** Database, logs, user uploads, cache

**Best for:** Data যা container এর lifecycle এর বাইরে persist করতে হবে

---

### 2️⃣ Anonymous Volume (Temporary Persistence)

**কনসেপ্ট:** No name specified, Docker auto-generated name দেয়। Container এর সাথে tied।

```bash
# Anonymous volume তৈরি হয়
docker run -d -v /app/data myapp

# Docker random name দেয়
# Example: a3f5b8c9d2e1...
```

**বৈশিষ্ট্য:**
- ⚠️ No user-defined name
- ⚠️ Container এর সাথে loosely coupled
- ⚠️ Cleanup করা difficult (orphaned volumes)
- ✅ Temporary data এর জন্য ভালো

**⚠️ সমস্যা:**
- Container delete করলে volume খুঁজে পাওয়া কঠিন
- Multiple containers এ share করা যায় না
- Management complicated

**Use Cases:** Temporary data যা container lifetime এর বাইরে বেশি দিন লাগে না

**Best Practice:** Production এ avoid করো, Named Volume ব্যবহার করো

---

### 3️⃣ Bind Mount (Development)

**কনসেপ্ট:** Host এর specific folder সরাসরি mount। Direct host filesystem access।

```
Host Machine                Container
├── /home/user/            
│   └── project/           ← Bind Mount
│       ├── src/           ↔  /app/src/
│       ├── config/        ↔  /app/config/
│       └── logs/          ↔  /app/logs/
```

**সুবিধা:**
- ✅ Direct file access (host থেকে edit করো)
- ✅ Real-time code changes (hot reload)
- ✅ Easy debugging
- ✅ Development এর জন্য ideal

**⚠️ সমস্যা:**
- ❌ Path issues (Windows/Linux different)
- ❌ Permission problems (UID/GID mismatch)
- ❌ Security risks (full host access)
- ❌ Portability কম

**Use Cases:** Development, config files, hot reload, direct file sharing

**Best for:** Development environment, যেখানে direct host access প্রয়োজন

**⚠️ Security:** Proper access permissions ensure করতে হবে

---

### 4️⃣ tmpfs Mount (RAM-based Temporary)

**কনসেপ্ট:** RAM-based temporary storage। Disk এ write না করে memory তে থাকে।

```
Container Memory
└── tmpfs (RAM)
    ├── /tmp/
    └── /run/
    
Container stop → Data gone ❌
```

**বৈশিষ্ট্য:**
- ✅ Very fast (RAM speed)
- ✅ No disk writes
- ✅ Sensitive data এর জন্য ভালো
- ❌ Container stop = data lost
- ⚠️ Memory limitation

**Use Cases:** 
- Secrets/passwords (sensitive info)
- Temporary cache
- Session data
- Non-persistent data যা disk এ write করা উচিত না

**Best for:** Data যা disk এ write করা উচিত না (security/performance)

---

## 📊 Volume Types Comparison

| বৈশিষ্ট্য | Named Volume | Anonymous Volume | Bind Mount | tmpfs Mount |
|---------|--------------|------------------|------------|-------------|
| **Management** | Docker managed | Docker managed | Manual | Docker managed |
| **Name** | User-defined | Auto-generated | N/A | N/A |
| **Location** | Docker dir | Docker dir | Host path | RAM |
| **Portability** | ✅ High | ✅ Medium | ❌ Low | ✅ High |
| **Permissions** | ✅ Auto | ✅ Auto | Manual setup | ✅ Auto |
| **Performance** | ✅ Optimized | ✅ Optimized | OS dependent | ⚡ Fastest |
| **Persistence** | ✅ Permanent | ⚠️ Temporary | ✅ Permanent | ❌ Lost on stop |
| **Sharing** | ✅ Easy reuse | ❌ Hard to find | ✅ Direct access | ❌ No sharing |
| **Backup** | ✅ Easy | ⚠️ Difficult | Manual | ❌ Can't backup |
| **Production** | ✅ **Best** | ❌ Avoid | ⚠️ Careful | ⚠️ Specific use |
| **Development** | ✅ Good | ❌ Not recommended | ✅ **Best** | ⚠️ Testing only |
| **Security** | ✅ Isolated | ✅ Isolated | ⚠️ Host access | ✅ Memory only |
| **Cleanup** | ✅ Easy | ⚠️ Orphaned | N/A | ✅ Auto |

---

## 🛠️ Volume Commands (Essential)

### Create & Inspect

```bash
# Named volume তৈরি
docker volume create db-data

# সব volumes দেখো
docker volume ls

# Volume details
docker volume inspect db-data

# Output:
# [
#     {
#         "Name": "db-data",
#         "Driver": "local",
#         "Mountpoint": "/var/lib/docker/volumes/db-data/_data",
#         "Created": "2024-01-24T10:30:00Z"
#     }
# ]
```

---

### Volume with Container

```bash
# Named volume ব্যবহার (Production)
docker run -d \
  --name postgres \
  -v db-data:/var/lib/postgresql/data \
  postgres:15-alpine

# Anonymous volume ব্যবহার (Temporary)
docker run -d \
  --name temp-app \
  -v /app/data \
  myapp:latest

# Bind mount ব্যবহার (Development)
docker run -d \
  --name app \
  -v $(pwd)/config:/app/config:ro \
  myapp:latest

# Multiple volumes একসাথে
docker run -d \
  --name app \
  -v db-data:/data \
  -v app-logs:/logs \
  -v $(pwd)/config:/app/config:ro \
  myapp:latest

# tmpfs mount (In-memory)
docker run -d \
  --name secure-app \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  myapp:latest
```

---

### Sharing Data Between Containers

```bash
# Shared volume তৈরি
docker volume create shared_data

# Container 1: Write data
docker run -d \
  --name writer \
  -v shared_data:/app/data \
  writer-app

# Container 2: Read data
docker run -d \
  --name reader \
  -v shared_data:/app/data \
  reader-app

# Both containers একই volume access করতে পারে
# এটা data sharing এর জন্য perfect
```

---

### Volume Management

```bash
# Volume delete (container stop করার পর)
docker volume rm db-data

# Unused volumes clean করো
docker volume prune

# Force remove with containers
docker rm -v container-name

# Volume size check
docker system df -v
```

---

## 📂 Volume Lifecycle

### 1️⃣ Creation

```bash
# Explicit creation
docker volume create --name db-data

# Auto-creation (docker run time)
docker run -v db-data:/data myapp
```

---

### 2️⃣ Usage

```
Container Start
    ↓
Volume Mount
    ↓
Application writes data
    ↓
Data persists in volume
    ↓
Container Stop
    ↓
Volume remains (data safe!)
```

---

### 3️⃣ Backup

```bash
# Method 1: Tar backup
docker run --rm \
  -v db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz -C /data .

# Method 2: Copy to host
docker run --rm \
  -v db-data:/source \
  -v $(pwd)/backup:/backup \
  alpine cp -r /source/. /backup/
```

---

### 4️⃣ Restore

```bash
# Stop container
docker stop postgres

# Restore from backup
docker run --rm \
  -v db-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/db-backup.tar.gz"

# Start container
docker start postgres
```

---

### 5️⃣ Migration

```bash
# Volume copy to another volume
docker run --rm \
  -v old-volume:/source \
  -v new-volume:/destination \
  alpine sh -c "cp -a /source/. /destination/"
```

---

### 6️⃣ Cleanup

```bash
# Remove specific volume
docker volume rm db-data

# Clean all unused
docker volume prune -f

# Clean with containers
docker-compose down -v
```

---

## 🎯 Production Use Case 1: PostgreSQL Database

### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: prod-db
    restart: unless-stopped
    
    # Named volume for data
    volumes:
      - db-data:/var/lib/postgresql/data
      - db-backups:/backups
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=myapp
      - POSTGRES_USER=appuser
    
    # Backup configuration
    labels:
      - "backup.enable=true"
      - "backup.schedule=0 2 * * *"  # Daily 2 AM

volumes:
  db-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres  # Production disk
  
  db-backups:
    driver: local
```

---

### Automatic Backup Script

```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_backup_${DATE}.sql.gz"

# Create backup
docker exec prod-db pg_dump -U appuser myapp | gzip > ${BACKUP_DIR}/${BACKUP_FILE}

# Keep only last 7 days
find ${BACKUP_DIR} -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: ${BACKUP_FILE}"
```

**Cron setup:**
```bash
# Daily backup at 2 AM
0 2 * * * /opt/scripts/backup-postgres.sh >> /var/log/db-backup.log 2>&1
```

---

## 🎯 Production Use Case 2: Application Logs

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    image: myapp/backend:latest
    
    volumes:
      # Application logs
      - app-logs:/app/logs
      
      # Log rotation config
      - ./logrotate.conf:/etc/logrotate.d/app:ro
    
    environment:
      - LOG_LEVEL=info
      - LOG_PATH=/app/logs
    
    restart: unless-stopped

  # Log aggregator (optional)
  fluentd:
    image: fluent/fluentd:latest
    volumes:
      - app-logs:/logs:ro  # Read-only access
      - ./fluentd.conf:/fluentd/etc/fluent.conf
    restart: unless-stopped

volumes:
  app-logs:
    driver: local
```

---

### Log Rotation Configuration

**logrotate.conf:**
```
/app/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 appuser appuser
}
```

---

### Monitor Log Size

```bash
#!/bin/bash
# check-log-size.sh

LOG_VOLUME="app-logs"
MAX_SIZE_MB=1000

CURRENT_SIZE=$(docker volume inspect $LOG_VOLUME \
  --format '{{.Mountpoint}}' | xargs du -sm | cut -f1)

if [ $CURRENT_SIZE -gt $MAX_SIZE_MB ]; then
    echo "⚠️ Warning: Log volume size is ${CURRENT_SIZE}MB"
    # Trigger cleanup
    docker exec backend /app/cleanup-logs.sh
fi
```

---

## 🎯 Production Use Case 3: File Uploads

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    image: myapp/backend:latest
    
    volumes:
      # User uploads (images, documents)
      - uploads:/app/uploads
      
      # Temporary uploads
      - temp-uploads:/tmp/uploads
    
    environment:
      - UPLOAD_PATH=/app/uploads
      - UPLOAD_MAX_SIZE=10M
      - ALLOWED_TYPES=jpg,png,pdf
    
    restart: unless-stopped
  
  # Image processor
  thumbnail-service:
    image: myapp/thumbnails:latest
    volumes:
      - uploads:/uploads:ro  # Read-only
      - thumbnails:/thumbnails
    restart: unless-stopped
  
  # Nginx for serving static files
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - uploads:/usr/share/nginx/html/uploads:ro
      - thumbnails:/usr/share/nginx/html/thumbs:ro
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

volumes:
  uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/storage/uploads  # Large disk
  
  thumbnails:
    driver: local
  
  temp-uploads:
    driver: local
    driver_opts:
      type: tmpfs
      device: tmpfs
      o: size=1G  # 1GB RAM
```

---

### Upload Cleanup Script

```bash
#!/bin/bash
# cleanup-old-uploads.sh

UPLOAD_DIR="/mnt/storage/uploads"
DAYS_OLD=90

# Delete files older than 90 days
find ${UPLOAD_DIR} -type f -mtime +${DAYS_OLD} -delete

# Clean empty directories
find ${UPLOAD_DIR} -type d -empty -delete

echo "✅ Cleaned uploads older than ${DAYS_OLD} days"
```

---

## 💾 Backup & Restore Strategies

### Strategy 1: Manual Backup (Development)

```bash
# Backup
docker run --rm \
  -v db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore
docker run --rm \
  -v db-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/backup-20240124.tar.gz -C /data"
```

---

### Strategy 2: Automated Backup (Production)

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  backup:
    image: offen/docker-volume-backup:latest
    container_name: backup-service
    restart: unless-stopped
    
    volumes:
      - db-data:/backup/db-data:ro
      - app-logs:/backup/app-logs:ro
      - uploads:/backup/uploads:ro
      - /mnt/backups:/archive
    
    environment:
      # Backup schedule (daily at 2 AM)
      - BACKUP_CRON_EXPRESSION=0 2 * * *
      
      # Retention policy
      - BACKUP_RETENTION_DAYS=30
      
      # Compression
      - BACKUP_COMPRESSION=gz
      
      # Notification
      - BACKUP_NOTIFICATION_WEBHOOK=${SLACK_WEBHOOK}
    
    labels:
      - "docker-volume-backup.stop-during-backup=true"

volumes:
  db-data:
  app-logs:
  uploads:
```

---

### Strategy 3: Cloud Backup (AWS S3)

```yaml
version: '3.8'

services:
  backup-to-s3:
    image: alpine:latest
    container_name: s3-backup
    
    volumes:
      - db-data:/data:ro
      - ./backup-script.sh:/backup.sh:ro
    
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_KEY}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET}
      - S3_BUCKET=my-backups
    
    entrypoint: ["/backup.sh"]

volumes:
  db-data:
```

**backup-script.sh:**

```bash
#!/bin/sh
apk add --no-cache aws-cli

# Create backup
tar czf /tmp/backup.tar.gz -C /data .

# Upload to S3
aws s3 cp /tmp/backup.tar.gz \
  s3://${S3_BUCKET}/backups/$(date +%Y%m%d-%H%M%S).tar.gz

# Cleanup
rm /tmp/backup.tar.gz
```

---

## 🔍 Volume Monitoring

### Check Volume Usage

```bash
# All volumes size
docker system df -v

# Specific volume size
docker volume inspect db-data \
  --format '{{.Mountpoint}}' | xargs du -sh

# Find large files
docker run --rm \
  -v db-data:/data \
  alpine du -h /data | sort -rh | head -20
```

---

### Volume Health Check

```bash
#!/bin/bash
# volume-health-check.sh

VOLUMES=("db-data" "app-logs" "uploads")
THRESHOLD_GB=50

for vol in "${VOLUMES[@]}"; do
    MOUNTPOINT=$(docker volume inspect $vol --format '{{.Mountpoint}}')
    SIZE_GB=$(du -sm $MOUNTPOINT | cut -f1)
    SIZE_GB=$((SIZE_GB / 1024))
    
    echo "📊 Volume: $vol - Size: ${SIZE_GB}GB"
    
    if [ $SIZE_GB -gt $THRESHOLD_GB ]; then
        echo "⚠️ Warning: Volume $vol exceeds ${THRESHOLD_GB}GB"
        # Send alert
    fi
done
```

---

## 🔐 Security Best Practices

### 1️⃣ Read-Only Mounts

```yaml
services:
  app:
    volumes:
      - config:/app/config:ro  # ✅ Read-only
      - data:/app/data         # Read-write
```

---

### 2️⃣ Separate Sensitive Data

```yaml
services:
  app:
    volumes:
      - db-data:/data           # Regular data
      - secrets:/secrets:ro     # Sensitive (separate volume)
    
volumes:
  db-data:
  secrets:
    driver: local
    driver_opts:
      type: tmpfs  # In-memory, more secure
```

---

### 3️⃣ Volume Encryption

```yaml
volumes:
  encrypted-data:
    driver: local
    driver_opts:
      type: none
      o: bind,encryption=aes256
      device: /mnt/encrypted
```

---

### 4️⃣ Permissions

```bash
# Set correct ownership
docker run --rm \
  -v db-data:/data \
  alpine chown -R 999:999 /data  # PostgreSQL user
```

---

## 🎯 Complete Production Example

### Full Stack App with Volumes

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    image: myapp/frontend:latest
    restart: unless-stopped
    # No volumes needed (stateless)
  
  # Backend API
  backend:
    image: myapp/backend:latest
    restart: unless-stopped
    
    volumes:
      # Application logs
      - app-logs:/app/logs
      
      # User uploads
      - uploads:/app/uploads
      
      # Config (read-only)
      - ./config:/app/config:ro
    
    environment:
      - DATABASE_URL=postgresql://postgres:5432/mydb
      - REDIS_URL=redis://redis:6379
  
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    
    volumes:
      # Database data (persistent)
      - postgres-data:/var/lib/postgresql/data
      
      # Backups
      - postgres-backups:/backups
      
      # Init scripts (read-only)
      - ./init-db.sql:/docker-entrypoint-initdb.d/init.sql:ro
    
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
  
  # Redis Cache
  redis:
    image: redis:7-alpine
    restart: unless-stopped
    
    volumes:
      # Redis persistence
      - redis-data:/data
    
    command: redis-server --appendonly yes
  
  # Nginx (Static files)
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    
    volumes:
      # Nginx config
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      
      # SSL certificates
      - ssl-certs:/etc/nginx/ssl:ro
      
      # Static files
      - uploads:/usr/share/nginx/html/uploads:ro
  
  # Backup Service
  backup:
    image: offen/docker-volume-backup:latest
    restart: unless-stopped
    
    volumes:
      - postgres-data:/backup/postgres:ro
      - redis-data:/backup/redis:ro
      - uploads:/backup/uploads:ro
      - /mnt/backups:/archive
    
    environment:
      - BACKUP_CRON_EXPRESSION=0 2 * * *
      - BACKUP_RETENTION_DAYS=30

volumes:
  # Database
  postgres-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres
  
  postgres-backups:
    driver: local
  
  # Cache
  redis-data:
    driver: local
  
  # Application
  app-logs:
    driver: local
  
  uploads:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/storage/uploads
  
  # Security
  ssl-certs:
    driver: local
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Permission Denied

**Error:**
```
Permission denied: '/data/file.txt'
```

**Solution:**
```bash
# Check container user
docker exec myapp id

# Fix ownership
docker run --rm \
  -v my-volume:/data \
  alpine chown -R 1000:1000 /data
```

---

### Issue 2: Volume Full

**Error:**
```
No space left on device
```

**Check & Fix:**
```bash
# Check size
docker system df -v

# Clean logs
docker run --rm \
  -v app-logs:/logs \
  alpine find /logs -name "*.log" -mtime +7 -delete

# Prune unused
docker volume prune -f
```

---

### Issue 3: Volume Not Mounting

**Debug:**
```bash
# Inspect volume
docker volume inspect my-volume

# Check container mounts
docker inspect my-container | grep Mounts -A 20

# Test mount
docker run --rm \
  -v my-volume:/test \
  alpine ls -la /test
```

---

### Issue 4: Data Loss After Restart

**Cause:** Using anonymous volume

**Solution:** Use named volume
```yaml
# ❌ Bad (anonymous)
volumes:
  - /app/data

# ✅ Good (named)
volumes:
  - db-data:/app/data
```

---

## 📋 Production Checklist

### Before Deployment

- [ ] Named volumes for all persistent data
- [ ] Backup strategy configured
- [ ] Volume monitoring setup
- [ ] Permissions configured correctly
- [ ] Read-only mounts for configs
- [ ] Volume size limits set
- [ ] Cleanup scripts created
- [ ] Documentation updated

### During Operation

- [ ] Regular backup tests
- [ ] Volume size monitoring
- [ ] Backup rotation working
- [ ] Log cleanup running
- [ ] Security audit passed

---

## 🎯 Best Practices (Production Ready)

### 1️⃣ Volume Selection Strategy

```
Use Case                     → Recommended Volume Type
─────────────────────────────────────────────────────
Production Database          → Named Volume ✅
Development Code            → Bind Mount ✅
Temporary Cache             → tmpfs Mount ✅
Short-term Storage          → Anonymous Volume (rarely)
User Uploads               → Named Volume ✅
Application Logs           → Named Volume ✅
Secrets/Passwords          → tmpfs Mount ✅
Config Files               → Bind Mount (read-only) ✅
```

---

### 2️⃣ Core Best Practices

1. **Named volumes for persistent data** - Container lifecycle এর বাইরে যা লাগবে
2. **Bind mounts for development** - Direct access/hot reload এর জন্য
3. **Regular cleanup of unused volumes** - Space free up করতে `docker volume prune`
4. **Proper access permissions** - Security risks avoid করতে bind mount এর permissions check করো
5. **Avoid anonymous volumes in production** - Management difficult, orphaned volumes হয়
6. **Use read-only mounts** - যেখানে শুধু read করতে হবে `:ro` flag ব্যবহার করো

---

### 3️⃣ Security Guidelines

```bash
# ✅ Good: Read-only config
docker run -v ./config:/app/config:ro myapp

# ✅ Good: Separate sensitive data
docker run --tmpfs /secrets:ro,size=10m myapp

# ❌ Bad: Full host access
docker run -v /:/host myapp

# ❌ Bad: Root permissions on bind mount
docker run -v /etc:/container-etc myapp
```

---

## 💡 Key Takeaways

1. **Named Volume = Production Standard** - সবসময় named volume ব্যবহার করো persistent data এর জন্য
2. **Avoid Anonymous Volumes** - Production এ use করো না, management difficult
3. **Bind Mounts = Development Only** - Security risk আছে, production এ careful
4. **tmpfs = Sensitive Data** - Secrets, passwords memory তে রাখো, disk এ না
5. **Backup is Must** - Automatic backup strategy থাকতে হবে
6. **Monitor Size** - Volume size regularly check করো, cleanup script setup করো
7. **Read-Only Configs** - Config files read-only mount করো security এর জন্য
8. **Separate Concerns** - Database, logs, uploads আলাদা volume ব্যবহার করো
9. **Test Restore** - শুধু backup না, restore test করো regularly
10. **Data Lifecycle ≠ Container Lifecycle** - Volume decouple করে data persistence ensure করো

---

## 🎓 Quick Reference

```bash
# Create volume
docker volume create my-volume

# Use volume
docker run -v my-volume:/data myapp

# Bind mount (development)
docker run -v $(pwd):/app myapp

# Read-only mount
docker run -v my-volume:/data:ro myapp

# Backup
docker run --rm -v my-volume:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Restore
docker run --rm -v my-volume:/data -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data

# Inspect
docker volume inspect my-volume

# Clean
docker volume prune -f
```

---

**🚀 মনে রাখো:** Volume হলো container এর permanent storage। সঠিক volume strategy = data safe, backup easy, production ready!

---

**পরের মডিউল:** [মডিউল ৬: Docker Network](/devops/docker/module-6-network)

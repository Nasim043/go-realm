# Docker Container & Linux: প্রোডাকশন এসেনশিয়াল

> **টিপ:** Container = Isolated Linux Process। এই concept টা বুঝলে ৯০% সমস্যা solve করতে পারবে।

---

## 🎯 Container Reality

| কনসেপ্ট | বাস্তবতা | প্রোডাকশনে Impact |
|---------|---------|-------------------|
| Container | Isolated Linux process | VM না, lightweight |
| PID 1 | Container এর main process | এটা মরলে container মরবে |
| Signal | Process control mechanism | Graceful shutdown এর জন্য must |
| Memory Limit | Resource constraint | OOM kill থেকে বাঁচায় |

---

## 1️⃣ PID 1 (সবচেয়ে গুরুত্বপূর্ণ!)

### কেন গুরুত্বপূর্ণ?

```
PID 1 exits → Container stops
```

### প্রোডাকশন প্যাটার্ন

```dockerfile
# ❌ খারাপ - Shell as PID 1
CMD sh -c "node server.js"

# ✅ ভালো - App as PID 1
CMD ["node", "server.js"]

# ✅ সেরা - Init system দিয়ে
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
```

### Zombie Process Problem

| Without Init | With Init (tini) |
|-------------|------------------|
| Zombie processes pile up | Properly reaped |
| Memory leak হতে পারে | Clean shutdown |
| ❌ Production risk | ✅ Production safe |

---

## 2️⃣ Signal Handling (Graceful Shutdown)

### Signal Flow

```
docker stop → SIGTERM (10s) → SIGKILL (force)
```

| Signal | Type | Can Handle | Use Case |
|--------|------|------------|----------|
| **SIGTERM** | Graceful | ✅ Yes | `docker stop` |
| **SIGKILL** | Force | ❌ No | After timeout |
| **SIGINT** | Interrupt | ✅ Yes | Ctrl+C (local) |

### Go Example (Production)

```go
func main() {
    server := &http.Server{Addr: ":8080"}
    
    // Signal channel
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
    
    // Start server
    go server.ListenAndServe()
    
    // Wait for signal
    <-stop
    
    // Graceful shutdown (30s timeout)
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    server.Shutdown(ctx)
}
```

### Node.js Example

```javascript
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    
    // Force exit after 30s
    setTimeout(() => process.exit(1), 30000);
});
```

---

## 3️⃣ Resource Limits (Must in Production!)

### Memory Limits

```bash
# ❌ খারাপ - No limit (risk!)
docker run myapp

# ✅ ভালো - With limits
docker run -m 512m myapp

# ✅ সেরা - Memory + reservation
docker run \
  --memory 512m \
  --memory-reservation 256m \
  myapp
```

### CPU Limits

```bash
# Limit to 2 CPUs
docker run --cpus 2 myapp

# Use 50% of CPU
docker run --cpus 0.5 myapp
```

### প্রোডাকশন Values

| Service Type | Memory | CPU | Reason |
|-------------|--------|-----|--------|
| Web API | 512MB - 1GB | 1-2 | Standard |
| Worker | 256MB - 512MB | 0.5-1 | Background |
| Database | 2GB - 4GB | 2-4 | Heavy load |

---

## 4️⃣ OOM Killer

### কখন Trigger হয়?

```
Memory Usage > Memory Limit → OOM Killer → Container Killed
```

### Debug OOM

```bash
# Check if OOM killed
docker inspect myapp | grep OOMKilled

# View OOM events
dmesg | grep -i oom

# Monitor memory live
docker stats myapp
```

### প্রোডাকশন Solution

```yaml
# docker-compose.yml
services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

---

## 5️⃣ Container Lifecycle

### State Flow

```
Created → Running → Stopped → Removed
           ↓
        Restarting
```

### Restart Policies

| Policy | Behavior | Production |
|--------|----------|-----------|
| `no` | Never restart | ❌ Only for testing |
| `on-failure` | Restart on error | ✅ Stateless apps |
| `always` | Always restart | ⚠️ Can hide issues |
| `unless-stopped` | Restart unless stopped | ✅ **Best choice** |

```bash
# প্রোডাকশন setup
docker run -d \
  --name myapp \
  --restart unless-stopped \
  -m 512m \
  --cpus 1 \
  myapp
```

---

## 6️⃣ Debugging Containers

### Essential Commands

```bash
# Check running containers
docker ps

# View logs (last 100 lines)
docker logs --tail 100 -f myapp

# Inspect container
docker inspect myapp

# Execute command inside
docker exec -it myapp sh

# Check resource usage
docker stats myapp

# View processes inside container
docker top myapp
```

### Container Stopped? Debug এভাবে

```bash
# Check exit code
docker inspect --format='{{.State.ExitCode}}' myapp

# View full logs
docker logs myapp

# Check events
docker events --filter container=myapp
```

---

## 7️⃣ Health Checks

### Dockerfile এ

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --spider http://localhost:8080/health || exit 1
```

### Docker Run এ

```bash
docker run -d \
  --health-cmd='curl -f http://localhost:8080/health || exit 1' \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  myapp
```

### Health Status Check

```bash
docker inspect --format='{{.State.Health.Status}}' myapp
# Output: healthy | unhealthy | starting
```

---

## 8️⃣ Networking Basics

### Container এ Container Access

```bash
# Create network
docker network create app-net

# Run containers on same network
docker run -d --name backend --network app-net mybackend
docker run -d --name frontend --network app-net myfrontend

# Frontend can access: http://backend:8080
```

### Port Mapping

```bash
# Map port
docker run -p 8080:8080 myapp

# Bind to localhost only (secure!)
docker run -p 127.0.0.1:8080:8080 myapp
```

---

## 9️⃣ Volumes (Data Persistence)

### Named Volume (Production)

```bash
# Create volume
docker volume create app-data

# Use volume
docker run -v app-data:/app/data myapp
```

### Bind Mount (Config files)

```bash
# Read-only config
docker run -v /host/config.yml:/app/config.yml:ro myapp
```

---

## 🔟 Production Checklist

### Container Configuration

- [ ] Resource limits set (`-m`, `--cpus`)
- [ ] Restart policy: `unless-stopped`
- [ ] Health check configured
- [ ] Proper signal handling in app
- [ ] Non-root user in Dockerfile
- [ ] Logging to stdout/stderr

### Runtime Setup

- [ ] Custom network (not default)
- [ ] Named volumes for data
- [ ] Environment variables secure
- [ ] Port exposure minimal
- [ ] Monitoring enabled

---

## 🚨 Common Issues & Solutions

### Issue 1: Container exits immediately

**Check:**
```bash
docker logs myapp
docker inspect --format='{{.State.ExitCode}}' myapp
```

**Common causes:**
- PID 1 process exits
- Missing dependencies
- Configuration error

### Issue 2: Container unresponsive

**Debug:**
```bash
# Check if running
docker ps

# Check resource usage
docker stats myapp

# Execute shell
docker exec -it myapp sh
```

### Issue 3: OOM Killed

**Solution:**
```bash
# Increase memory
docker run -m 1g myapp

# Monitor usage
docker stats myapp
```

---

## 💡 Production Best Practices

### 1. Always Set Limits

```bash
docker run -m 512m --cpus 1 myapp
```

### 2. Use Health Checks

```dockerfile
HEALTHCHECK CMD curl -f http://localhost/health || exit 1
```

### 3. Implement Graceful Shutdown

```go
signal.Notify(stop, syscall.SIGTERM)
```

### 4. Log to stdout/stderr

```go
log.Println("Message")  // ✅ Good
// Don't write to /var/log files
```

### 5. Monitor Resources

```bash
docker stats --no-stream
```

---

## 🎯 Key Takeaways

1. **Container = Process** - VM না, isolated process
2. **PID 1 is King** - এটা মরলে container মরবে
3. **SIGTERM → Graceful** - সবসময় handle করো
4. **Set Limits** - Memory ও CPU limit must
5. **Health Checks** - Production এ optional না

---

## 📋 Quick Reference

```bash
# Run with production settings
docker run -d \
  --name myapp \
  --restart unless-stopped \
  -m 512m --cpus 1 \
  -p 8080:8080 \
  --health-cmd='curl -f http://localhost:8080/health' \
  myapp:latest

# Monitor
docker stats myapp
docker logs -f myapp

# Graceful stop (30s timeout)
docker stop -t 30 myapp
```

---

**📌 মনে রাখো:** Container হলো একটা process with superpowers। Process management বুঝলে container management easy হয়ে যাবে!

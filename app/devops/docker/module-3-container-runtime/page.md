# মডিউল ৩: Container = Linux Process (Runtime Reality)

> **এই একটা concept বুঝলে ৯০% প্রোডাকশন সমস্যা নিজে solve করতে পারবে:** Container কোনো ছোট VM না — এটা একটা **isolated Linux process**।

**সময়:** ~৬০ মিনিট | **আগে দরকার:** [মডিউল ২](/devops/docker/module-2-image-container)

---

## এই মডিউল শেষে তুমি পারবে

| Skill | মানে কী |
| --- | --- |
| PID 1 ব্যাখ্যা | container হঠাৎ exit করলে কারণ ধরতে পারা |
| Signal handling | `docker stop`-এ ডেটা না হারিয়ে graceful shutdown |
| Resource limit | memory/CPU limit দিয়ে VPS-কে বাঁচানো |
| OOM debug | "container মরে গেল কেন?" — উত্তর দেওয়া |
| Health check + restart policy | নিজে থেকে সেরে ওঠা সেটআপ |

---

## ১. Container Reality (এক নজরে)

| কনসেপ্ট | বাস্তবতা | প্রোডাকশনে Impact |
| --- | --- | --- |
| Container | Isolated Linux process | VM না, lightweight |
| PID 1 | Container-এর main process | এটা মরলে container মরবে |
| Signal | Process control mechanism | Graceful shutdown-এর জন্য must |
| Memory Limit | Resource constraint | OOM kill থেকে বাঁচায় |

### Linux Process Model (যতটুকু দরকার)

- Linux-এ প্রতিটি চলমান প্রোগ্রাম একটি **process**, যার একটি **PID** আছে।
- **Fork:** এক process আরেকটি child process তৈরি করে।
- **Signal:** process-কে বার্তা পাঠানোর উপায় (থামো, রিলোড করো, মরে যাও)।
- **Isolation:** Docker কার্নেলের namespace (আলাদা PID/network/mount view) আর cgroup (CPU/RAM কোটা) ব্যবহার করে — এই দুটোই container বানায়।

```text
হোস্টে দেখতে:                    container-এর ভেতরে দেখতে:
PID 4821  /app/server            PID 1  /app/server
   ↑ একই প্রসেস, শুধু আলাদা namespace-এ আলাদা PID
```

> Container-এর ভেতরে `rm -rf /` করলে container-এর filesystem যাবে, হোস্টের কিছু হবে না — এটাই mount namespace-এর কাজ।

---

## ২. PID 1 (সবচেয়ে গুরুত্বপূর্ণ)

```text
PID 1 exits  →  Container stops
```

Container-এ যে প্রসেস প্রথমে চালু হয় সেটাই PID 1। এটি container-এর জীবন-মৃত্যু নিয়ন্ত্রণ করে।

### প্রোডাকশন প্যাটার্ন

```dockerfile
# ❌ খারাপ - Shell as PID 1 (shell signal forward করে না)
CMD ./app

# ✅ ভালো - App নিজেই PID 1 (exec form)
CMD ["./app"]

# ✅ সেরা - init system দিয়ে (zombie reaping)
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./app"]
```

> **🔑 Exec form vs shell form:** `CMD ./app` (shell form) আসলে `/bin/sh -c "./app"` চালায় — তখন PID 1 হয় `sh`, যে SIGTERM তোমার অ্যাপে পাঠায় না। ফলে `docker stop` graceful হয় না, ১০ সেকেন্ড পরে SIGKILL। **সবসময় JSON array (exec) form লেখো।**

### Zombie Process Problem

| Without Init | With Init (tini) |
| --- | --- |
| Zombie process জমতে থাকে | ঠিকভাবে reap হয় |
| Memory leak হতে পারে | Clean shutdown |
| ❌ Production risk | ✅ Production safe |

- **কখন tini লাগবে:** অ্যাপ যদি child process spawn করে (shell script, ffmpeg, cron-জাতীয় কাজ)। সহজ পথ: `docker run --init ...`।
- **কখন লাগবে না:** একক Go binary যা কোনো child বানায় না।

---

## ৩. Signal Handling (Graceful Shutdown)

```text
docker stop  ──SIGTERM──▶  App (১০ সেকেন্ড সময়)  ──না থামলে──▶ SIGKILL (জোরে মারা)
```

| Signal | ধরন | Handle করা যায়? | কখন আসে |
| --- | --- | --- | --- |
| **SIGTERM** | Graceful | ✅ হ্যাঁ | `docker stop` |
| **SIGKILL** | Force | ❌ না | timeout-এর পরে |
| **SIGINT** | Interrupt | ✅ হ্যাঁ | Ctrl+C (লোকাল) |

Graceful shutdown না থাকলে: চলমান HTTP request কেটে যায়, DB transaction অসম্পূর্ণ থাকে, message queue-তে ack যায় না।

### Go উদাহরণ (প্রোডাকশন)

```go
func main() {
    server := &http.Server{Addr: ":8080"}

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)

    go server.ListenAndServe()

    <-stop // SIGTERM-এর জন্য অপেক্ষা

    // চলমান request শেষ করার সুযোগ দাও
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    server.Shutdown(ctx)
}
```

### Node.js উদাহরণ

```javascript
process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000); // ৩০ সেকেন্ড পরে জোর করে
});
```

```bash
# stop timeout বাড়াও, যদি shutdown-এ সময় লাগে
docker stop -t 30 api
```

---

## ৪. Resource Limits (প্রোডাকশনে বাধ্যতামূলক)

limit না দিলে একটি container পুরো VPS-এর RAM খেয়ে ফেলতে পারে — তখন হোস্টের OOM killer **যে কোনো** প্রসেস মারে, এমনকি তোমার ডাটাবেস।

```bash
# ❌ খারাপ - কোনো limit নেই
docker run myapp

# ✅ ভালো
docker run -m 512m myapp

# ✅ সেরা - limit + reservation
docker run --memory 512m --memory-reservation 256m --cpus 1 myapp
```

```bash
docker run --cpus 2 myapp     # সর্বোচ্চ ২ CPU
docker run --cpus 0.5 myapp   # অর্ধেক CPU
```

### প্রোডাকশন শুরু করার মান

| Service Type | Memory | CPU | কারণ |
| --- | --- | --- | --- |
| Web API | 512MB – 1GB | 1–2 | স্ট্যান্ডার্ড |
| Worker | 256MB – 512MB | 0.5–1 | ব্যাকগ্রাউন্ড |
| Database | 2GB – 4GB | 2–4 | ভারী লোড |

> এগুলো শুরুর বিন্দু। `docker stats` দেখে আসল ব্যবহারের ~১.৫x সেট করো।

---

## ৫. OOM Killer ("container হঠাৎ মরে গেল")

```text
Memory Usage > Memory Limit  →  OOM Killer  →  Container Killed (exit code 137)
```

```bash
# OOM-এ মরেছে কিনা
docker inspect api --format '{{.State.OOMKilled}} {{.State.ExitCode}}'

# কার্নেল লগে প্রমাণ
dmesg | grep -i oom

# live মনিটর
docker stats api
```

| Exit code | মানে |
| --- | --- |
| `0` | স্বাভাবিকভাবে শেষ |
| `1` | অ্যাপ error দিয়ে exit |
| `137` | SIGKILL — সাধারণত OOM বা stop timeout |
| `143` | SIGTERM — graceful stop |

### সমাধান (compose-এ)

```yaml
services:
  app:
    image: myapp:1.4.2
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

> **Go-specific:** container limit ৫১২MB হলে `GOMEMLIMIT=450MiB` সেট করো — GC আগেভাগে চালু হবে, OOM-এর আগেই মেমরি ছাড়বে।

---

## ৬. Container Lifecycle ও Restart Policy

```text
Created ──▶ Running ──▶ Stopped ──▶ Removed
              │  ▲
              ▼  │
           Restarting
```

| Policy | আচরণ | প্রোডাকশন |
| --- | --- | --- |
| `no` | কখনো restart না | ❌ শুধু টেস্টিং |
| `on-failure` | error হলে restart | ✅ stateless অ্যাপ |
| `always` | সবসময় restart (ম্যানুয়াল stop-এর পরেও reboot-এ ওঠে) | ⚠️ সমস্যা ঢেকে ফেলে |
| `unless-stopped` | তুমি নিজে না থামালে restart | ✅ **সেরা পছন্দ** |

```bash
docker run -d \
  --name api \
  --restart unless-stopped \
  -m 512m --cpus 1 \
  myapp:1.4.2
```

> **⚠️ Restart loop:** container বারবার crash করে restart হলে `docker ps` দেখাবে "Restarting"। তখন `docker logs` দেখা ছাড়া উপায় নেই — restart policy সমস্যা লুকিয়ে ফেলে, সমাধান করে না।

---

## ৭. Health Check

Restart policy শুধু **crash** ধরে। কিন্তু process বেঁচে আছে অথচ request নিচ্ছে না (deadlock, DB pool শেষ) — সেটা ধরতে health check লাগে।

### Dockerfile-এ

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --spider -q http://localhost:8080/health || exit 1
```

### `docker run`-এ

```bash
docker run -d \
  --health-cmd='curl -f http://localhost:8080/health || exit 1' \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  myapp
```

```bash
docker inspect api --format '{{.State.Health.Status}}'
# healthy | unhealthy | starting
```

| প্যারামিটার | মানে | টিপ |
| --- | --- | --- |
| `--interval` | কত পর পর চেক | ৩০s সাধারণত যথেষ্ট |
| `--timeout` | কত সেকেন্ড অপেক্ষা | অ্যাপের p99 latency-র বেশি |
| `--start-period` | বুট হওয়ার grace time | migration চললে বাড়াও |
| `--retries` | কতবার fail = unhealthy | ৩ |

> **📌 নোট:** Docker নিজে unhealthy container restart করে না (Swarm/K8s করে)। কিন্তু compose-এ `depends_on: condition: service_healthy` কাজে লাগে (মডিউল ৭)।

---

## ৮. Debugging Playbook

```bash
# চলছে কি?
docker ps -a

# কী বলছে?
docker logs --tail 200 -f api

# কেন থামল?
docker inspect api --format '{{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}}'

# রিসোর্স খাচ্ছে কত?
docker stats --no-stream

# ভেতরে কী প্রসেস চলছে?
docker top api

# ভেতরে ঢোকো
docker exec -it api sh

# কী ঘটছে (event stream)
docker events --filter container=api
```

### লক্ষণ → কারণ ম্যাপ

| লক্ষণ | সম্ভাব্য কারণ | চেক |
| --- | --- | --- |
| সাথে সাথে exit | PID 1 exit করেছে, config error, binary নেই | `docker logs`, exit code |
| Exit 137 | OOM বা stop timeout | `.State.OOMKilled` |
| Exit 127 | "command not found" — ভুল path/binary নাম | `docker exec ... ls -l` |
| `docker stop` ১০s ঝুলে থাকে | SIGTERM handle হচ্ছে না (shell form CMD) | exec form + signal handler |
| চলছে কিন্তু response নেই | deadlock, DB pool শেষ | health check, `docker stats` |

---

## ৯. প্রোডাকশন Quick Reference

```bash
docker run -d \
  --name api \
  --restart unless-stopped \
  -m 512m --cpus 1 \
  -p 127.0.0.1:8080:8080 \
  --health-cmd='wget --spider -q http://localhost:8080/health || exit 1' \
  --health-interval=30s \
  myapp:1.4.2

docker stats api
docker logs -f api
docker stop -t 30 api     # graceful, ৩০ সেকেন্ড সময় দিয়ে
```

### Runtime Checklist

- [ ] Resource limit সেট করা (`-m`, `--cpus`)
- [ ] Restart policy: `unless-stopped`
- [ ] Health check কনফিগার করা
- [ ] অ্যাপে SIGTERM handler আছে
- [ ] CMD/ENTRYPOINT exec form-এ লেখা
- [ ] Non-root user (মডিউল ৪)
- [ ] Log stdout/stderr-এ যাচ্ছে (ফাইলে নয়) — `docker logs` তখনই কাজ করে

---

## ✅ Self-check

- [ ] `docker stop` দিলে ভেতরে ঠিক কী ঘটে?
- [ ] PID 1 special কেন?
- [ ] `CMD ./app` আর `CMD ["./app"]`-এর পার্থক্য প্রোডাকশনে কী প্রভাব ফেলে?
- [ ] Memory limit দিলে অ্যাপ কেন মারা যায়, exit code কত হয়?
- [ ] `always` আর `unless-stopped`-এর পার্থক্য কী?

**পরের মডিউল:** [মডিউল ৪: Dockerfile ও Image Build](/devops/docker/module-4-dockerfile)

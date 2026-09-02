# মডিউল ৮: VPS-এ প্রোডাকশন ডিপ্লয় ও অপারেশন

> **লক্ষ্য:** এক VPS-এ Go + PostgreSQL অ্যাপ deploy করা, নিরাপদে আপডেট করা, ব্যাকআপ রাখা, আর কিছু ভাঙলে ১০ মিনিটে কারণ বের করা।

**সময়:** ~৬০ মিনিট | **আগে দরকার:** [মডিউল ৭](/devops/docker/module-7-compose)

---

## ১. পুরো ছবি

```text
        Internet
           │  :443
           ▼
     ┌───────────┐   VPS (Ubuntu)
     │   Nginx   │  ← TLS, domain, rate limit   [host বা container]
     └─────┬─────┘
           │ 127.0.0.1:8080
           ▼
     ┌───────────┐        ┌──────────────┐
     │  api      │───────▶│  db          │  (internal network)
     │ myapp:1.4.2│       │ postgres:16  │
     └───────────┘        └──────┬───────┘
                                 │
                            db-data volume ──▶ প্রতিদিনের ব্যাকআপ (off-server)
```

| স্তর | দায়িত্ব | মডিউল |
| --- | --- | --- |
| Nginx | TLS, domain, reverse proxy | [Nginx কোর্স](/devops/nginx) |
| Container runtime | limit, restart, health | [মডিউল ৩](/devops/docker/module-3-container-runtime) |
| Image | ছোট, non-root, version-tagged | [মডিউল ৪](/devops/docker/module-4-dockerfile) |
| Volume | ডেটা টিকে থাকা + ব্যাকআপ | [মডিউল ৫](/devops/docker/module-5-volume) |
| Network | DB বাইরে থেকে অদৃশ্য | [মডিউল ৬](/devops/docker/module-6-network) |
| Compose | সব এক ফাইলে | [মডিউল ৭](/devops/docker/module-7-compose) |

---

## ২. সার্ভার প্রস্তুতি (একবারই)

```bash
# Docker Engine + compose plugin (অফিসিয়াল স্ক্রিপ্ট)
curl -fsSL https://get.docker.com | sh

# নিজের user-কে docker গ্রুপে (⚠️ কার্যত root access দেওয়া হচ্ছে)
sudo usermod -aG docker $USER && newgrp docker

# boot-এ চালু
sudo systemctl enable --now docker

# ফায়ারওয়াল: শুধু SSH + HTTP(S)
sudo ufw allow OpenSSH && sudo ufw allow 80,443/tcp && sudo ufw enable
```

### সব container-এর জন্য লগ ঘোরানো (ডিস্ক বাঁচায়)

```json
// /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": { "max-size": "10m", "max-file": "3" }
}
```

```bash
sudo systemctl restart docker
```

> **⚠️ ফায়ারওয়ালের ফাঁদ:** Docker নিজেই iptables-এ নিয়ম বসায়, তাই `-p 5432:5432` করা পোর্ট **UFW-কে পাশ কাটিয়ে** ইন্টারনেটে খুলে যেতে পারে। তাই ডাটাবেসের পোর্ট কখনো publish করবে না, দরকার হলে `-p 127.0.0.1:5432:5432` লিখবে।

---

## ৩. ডিপ্লয় ফ্লো

### কোথায় build হবে?

| পদ্ধতি | কীভাবে | কখন |
| --- | --- | --- |
| **সার্ভারে build** | `git pull && docker compose up -d --build` | ছোট প্রজেক্ট, ১ সার্ভার |
| **Registry দিয়ে** (প্রস্তাবিত) | CI-তে build+push → সার্ভারে `pull` | RAM কম থাকে, rollback সহজ, একাধিক সার্ভার |

```bash
# ✅ Registry ফ্লো
# CI / লোকাল মেশিনে:
docker build -t registry.example.com/myapp:1.4.3 .
docker push registry.example.com/myapp:1.4.3

# সার্ভারে:
sed -i 's/^APP_VERSION=.*/APP_VERSION=1.4.3/' .env
docker compose pull api
docker compose up -d
docker compose ps
curl -f http://localhost:8080/health || echo "ROLLBACK দরকার"
```

### ছোট deploy স্ক্রিপ্ট

```bash
#!/usr/bin/env bash
# deploy.sh — ব্যবহার: ./deploy.sh 1.4.3
set -euo pipefail

VERSION="$1"
cd /srv/myapp

echo "→ ব্যাকআপ নিচ্ছি"
./backup.sh

echo "→ image নামাচ্ছি: $VERSION"
sed -i "s/^APP_VERSION=.*/APP_VERSION=${VERSION}/" .env
docker compose pull api
docker compose up -d

echo "→ health চেক"
for i in $(seq 1 15); do
  if curl -fsS http://localhost:8080/health > /dev/null; then
    echo "✅ deploy সফল: $VERSION"; exit 0
  fi
  sleep 2
done

echo "❌ health fail — লগ দেখো: docker compose logs --tail 100 api"
exit 1
```

> **রোলব্যাক = আগের tag:** `./deploy.sh 1.4.2`। এটাই version tag রাখার আসল পুরস্কার।

---

## ৪. ব্যাকআপ ও রিস্টোর (আলোচনার অযোগ্য — must)

```bash
#!/usr/bin/env bash
# backup.sh
set -euo pipefail
STAMP=$(date +%F-%H%M)
mkdir -p /srv/backups

# ডাটাবেস dump (volume কপি করার চেয়ে নিরাপদ ও পোর্টেবল)
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "/srv/backups/db-${STAMP}.sql.gz"

# আপলোড ফাইলের volume (থাকলে)
docker run --rm -v uploads:/data -v /srv/backups:/backup alpine \
  tar czf "/backup/uploads-${STAMP}.tar.gz" -C /data .

# ৭ দিনের পুরনো মুছে ফেলো
find /srv/backups -type f -mtime +7 -delete
```

```bash
# রিস্টোর
gunzip -c /srv/backups/db-2026-09-01-0300.sql.gz \
  | docker compose exec -T db psql -U "$POSTGRES_USER" "$POSTGRES_DB"
```

```bash
# প্রতি রাত ৩টায়
crontab -e
0 3 * * * cd /srv/myapp && ./backup.sh >> /var/log/backup.log 2>&1
```

> **🔴 নিয়ম:** যে ব্যাকআপ কখনো restore করে দেখোনি, সেটা ব্যাকআপ নয় — অনুমান। মাসে একবার staging-এ restore করে দেখো, আর কপি সার্ভারের বাইরে রাখো (S3/অন্য মেশিন)।

---

## ৫. রোজকার অপারেশন

```bash
# অবস্থা
docker compose ps
docker stats --no-stream

# লগ
docker compose logs --tail 200 -f api
docker compose logs --since 30m db

# ডিস্ক
docker system df
df -h

# সাপ্তাহিক পরিষ্কার (⚠️ --volumes দেবে না)
docker system prune -af
```

### কী মনিটর করবে (মিনিমাম)

| জিনিস | কমান্ড / সিগন্যাল | কেন |
| --- | --- | --- |
| Container up? | `docker compose ps` | restart loop ধরতে |
| Health | `.State.Health.Status` | চলছে কিন্তু কাজ করছে না, এমন কেস |
| RAM/CPU | `docker stats` | OOM-এর আগেই টের পাওয়া |
| ডিস্ক | `df -h`, `docker system df` | ডিস্ক ভরলে DB write fail করে |
| ব্যাকআপ চলছে কি | cron লগ | নীরব ব্যর্থতাই সবচেয়ে বিপজ্জনক |

---

## ৬. ইনসিডেন্ট প্লেবুক (কিছু ভাঙলে)

```text
সাইট ডাউন
   │
   ├─▶ docker compose ps  ──── container নেই/Restarting?
   │        └─▶ docker compose logs --tail 200 <svc>
   │              └─▶ exit code দেখো: 137=OOM, 127=binary নেই, 1=অ্যাপ error
   │
   ├─▶ container up কিন্তু 502  ──── Nginx → api পোর্ট/নাম ঠিক আছে?
   │        └─▶ docker compose exec nginx wget -qO- http://api:8080/health
   │
   ├─▶ DB connection error  ──── একই network-এ আছে? পাসওয়ার্ড/host ঠিক?
   │        └─▶ docker compose exec api ping -c1 db
   │
   └─▶ ধীর / hang  ──── docker stats (CPU/RAM), তারপর slow query দেখো
```

| উপসর্গ | প্রথম চেক | সাধারণ কারণ |
| --- | --- | --- |
| Exit 137 | `.State.OOMKilled` | memory limit ছোট / leak |
| Exit 127 | `docker compose exec api ls -l` | ভুল binary নাম বা path |
| 502 Bad Gateway | nginx থেকে upstream-এ কল | ভুল service নাম/পোর্ট, api down |
| `no such host: db` | network তালিকা | সার্ভিস আলাদা network-এ |
| ডিস্ক full | `docker system df` | লগ rotation নেই, পুরনো image |
| `docker stop` ঝুলে যায় | CMD form | shell form, SIGTERM পৌঁছায় না |

```bash
# গুরুত্বপূর্ণ ডায়াগনস্টিক এক জায়গায়
docker compose ps
docker inspect $(docker compose ps -q api) \
  --format '{{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}} health={{if .State.Health}}{{.State.Health.Status}}{{end}}'
docker compose logs --tail 200 api
```

---

## ৭. সিকিউরিটি হার্ডেনিং (প্রোডাকশন মিনিমাম)

- [ ] অ্যাপ non-root user-এ চলে (`USER appuser`)
- [ ] ডাটাবেসের পোর্ট publish করা নেই; backend network `internal: true`
- [ ] Secret ইমেজে নেই — `.env` / secret manager থেকে আসে (`chmod 600 .env`)
- [ ] নির্দিষ্ট version tag, `latest` নয়
- [ ] Base image নিয়মিত আপডেট + `docker scout cve` / `trivy` স্ক্যান
- [ ] Nginx-এ TLS, HTTP → HTTPS redirect
- [ ] `--read-only` + `--tmpfs /tmp` যেখানে সম্ভব
- [ ] `docker` গ্রুপে শুধু বিশ্বাসযোগ্য user (এটা root-সমান)
- [ ] হোস্টে unattended-upgrades চালু

---

## ৮. মাস্টার চেকলিস্ট (deploy-এর আগে)

**Image**
- [ ] Multi-stage build, non-root, `.dockerignore` আছে
- [ ] Version tag দেওয়া, secret embed করা নেই
- [ ] HEALTHCHECK আছে, `/health` endpoint কাজ করে

**Runtime**
- [ ] `restart: unless-stopped`
- [ ] memory/CPU limit সেট
- [ ] অ্যাপে SIGTERM handler (graceful shutdown)
- [ ] লগ stdout/stderr-এ, rotation চালু

**ডেটা**
- [ ] সব persistent ডেটা named volume-এ
- [ ] cron ব্যাকআপ চালু ও একবার restore টেস্ট করা

**নেটওয়ার্ক**
- [ ] শুধু ৮০/৪৪৩ পাবলিক
- [ ] DB internal network-এ, publish করা নেই

**অপারেশন**
- [ ] `./deploy.sh <version>` আর রোলব্যাকের ধাপ লেখা আছে
- [ ] `docker compose ps` + health চেক করে deploy শেষ করা হয়

---

## ✅ Self-check

- [ ] UFW থাকা সত্ত্বেও publish করা পোর্ট কেন ইন্টারনেটে খুলে যেতে পারে?
- [ ] নতুন version deploy করে ভাঙলে ঠিক কোন ধাপগুলোতে রোলব্যাক করবো?
- [ ] ডাটাবেস ব্যাকআপ ঠিক কোথায় থাকে এবং restore কমান্ড কী?
- [ ] Container "Restarting" দেখালে প্রথম দুটি কমান্ড কী?
- [ ] Exit code 137 আর 127-এর মানে কী?

---

🎓 **কোর্স শেষ।** এখান থেকে পরের ধাপ: [Nginx কোর্স](/devops/nginx) দিয়ে TLS ও domain routing পাকা করা, তারপর CI দিয়ে build+push স্বয়ংক্রিয় করা।

[← রোডম্যাপে ফিরে যাও](/devops/docker)

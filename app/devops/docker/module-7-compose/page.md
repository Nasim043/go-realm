# মডিউল ৭: Docker Compose (পুরো stack এক ফাইলে)

> **এক লাইনে:** ৫টা `docker run` কমান্ড মুখস্থ রাখার বদলে একটা YAML ফাইলে পুরো stack লিখে রাখো — `docker compose up -d` দিলেই সব দাঁড়িয়ে যাবে।

**সময়:** ~৬০ মিনিট | **আগে দরকার:** [মডিউল ৬](/devops/docker/module-6-network)

---

## এই মডিউল শেষে তুমি পারবে

| Skill | মানে কী |
| --- | --- |
| Compose ফাইল লেখা | Go API + PostgreSQL + Nginx এক ফাইলে |
| Dependency ম্যানেজ | DB ready হওয়ার পর app চালু করা |
| Env ও secret | `.env` দিয়ে dev/prod আলাদা করা |
| Update ও rollback | downtime কমিয়ে নতুন version deploy |

---

## ১. কেন Compose?

```bash
# ❌ Compose ছাড়া — প্রতিবার এই তিনটা কমান্ড ঠিকঠাক মনে রাখতে হবে
docker network create app-net
docker volume create db-data
docker run -d --name db --network app-net -v db-data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=... postgres:16-alpine
docker run -d --name api --network app-net -p 127.0.0.1:8080:8080 \
  -e DATABASE_URL=... --restart unless-stopped myapp:1.4.2
```

```bash
# ✅ Compose দিয়ে
docker compose up -d
```

| দিক | `docker run` | Compose |
| --- | --- | --- |
| Config কোথায় | তোমার মাথায় / bash history | git-এ থাকা ফাইলে |
| Network/volume | হাতে তৈরি করতে হয় | নিজে থেকেই তৈরি হয় |
| একাধিক সার্ভিস | কমান্ডের পর কমান্ড | এক কমান্ড |
| Reproducible? | না | হ্যাঁ |

> **📌 নোট:** নতুন Docker-এ কমান্ড `docker compose` (স্পেস সহ, plugin)। পুরনো `docker-compose` (হাইফেন) legacy। ফাইলের `version:` ফিল্ডটিও এখন deprecated — লেখার দরকার নেই।

---

## ২. মিনিমাল উদাহরণ: Go API + PostgreSQL

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data      # ডেটা টিকে থাকবে
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [backend]
    # ⚠️ পোর্ট publish করা হয়নি — DB শুধু ভেতর থেকেই অ্যাক্সেসযোগ্য

  api:
    build:
      context: .
      dockerfile: Dockerfile
    image: myapp:${APP_VERSION:-dev}
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy          # DB ready হলে তবেই api চালু
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable
      APP_ENV: production
      PORT: 8080
    ports:
      - "127.0.0.1:8080:8080"               # শুধু localhost, Nginx সামনে বসবে
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      start_period: 20s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1"
    networks: [backend]

volumes:
  db-data:

networks:
  backend:
```

`DATABASE_URL`-এ host হিসেবে `db` লেখা — এটা service-এর নাম। Compose-এর নিজস্ব DNS সেটাকে container IP-তে resolve করে (মডিউল ৬)।

### সাথের `.env` ফাইল

```bash
# .env  (git-এ কমিট করবে না! .gitignore + .dockerignore-এ রাখো)
POSTGRES_USER=appuser
POSTGRES_PASSWORD=super-secret-value
POSTGRES_DB=appdb
APP_VERSION=1.4.2
```

```bash
# .env ফাইল Compose নিজেই পড়ে নেয়
docker compose up -d
```

---

## ৩. প্রতিদিনের কমান্ড

```bash
docker compose up -d              # সব চালু (background)
docker compose up -d --build      # রিবিল্ড করে চালু
docker compose ps                 # অবস্থা
docker compose logs -f api        # এক সার্ভিসের লগ
docker compose exec api sh        # ভেতরে ঢোকা
docker compose restart api        # শুধু একটা restart
docker compose stop               # থামানো (container থাকবে)
docker compose down               # থামিয়ে container+network মুছে ফেলা
docker compose down -v            # ⚠️ volume সহ — ডেটা মুছে যাবে
docker compose config             # ফাইনাল কনফিগ (ENV resolve করে) দেখা
docker compose pull               # নতুন image নামানো
```

| কমান্ড | Volume-এর কী হয় | কখন |
| --- | --- | --- |
| `stop` | কিছু হয় না | সাময়িক বন্ধ |
| `down` | থাকে (named volume) | রিডিপ্লয় |
| `down -v` | 🔴 মুছে যায় | শুধু ইচ্ছাকৃত reset-এ |

---

## ৪. `depends_on`-এর ফাঁদ

```yaml
# ❌ শুধু "container চালু হয়েছে" বোঝায় — DB তখনো connection নিতে প্রস্তুত না
depends_on:
  - db

# ✅ healthcheck pass করলে তবেই
depends_on:
  db:
    condition: service_healthy
```

> **তবুও:** অ্যাপে DB connection retry রাখা উচিত। প্রোডাকশনে DB restart হলে compose তোমার অ্যাপকে আবার চালু করে দেবে না — অ্যাপকেই সামলাতে হবে।

---

## ৫. Dev আর Prod আলাদা করা (override pattern)

```yaml
# docker-compose.yml  ← বেস (প্রোডাকশনে এটাই)
services:
  api:
    image: myapp:${APP_VERSION}
    restart: unless-stopped
```

```yaml
# docker-compose.override.yml  ← লোকালি নিজে থেকেই যুক্ত হয়
services:
  api:
    build: .
    volumes:
      - .:/app                    # লাইভ কোড mount (শুধু dev-এ!)
    environment:
      APP_ENV: development
      LOG_LEVEL: debug
    ports:
      - "8080:8080"               # dev-এ সরাসরি এক্সপোজ করলেও চলে
  db:
    ports:
      - "127.0.0.1:5432:5432"     # dev-এ DB GUI দিয়ে দেখতে
```

```bash
# লোকাল: base + override দুটোই পড়বে
docker compose up -d

# প্রোডাকশন: override বাদ দিয়ে শুধু base
docker compose -f docker-compose.yml up -d
```

| ফাইল | কোথায় | কী থাকে |
| --- | --- | --- |
| `docker-compose.yml` | সব জায়গায় | সার্ভিস, network, volume, limit |
| `docker-compose.override.yml` | শুধু লোকাল | bind mount, debug ENV, খোলা পোর্ট |
| `docker-compose.prod.yml` | (বিকল্প) সার্ভারে | `-f` দিয়ে স্পষ্টভাবে দেওয়া হয় |

---

## ৬. Nginx সহ পূর্ণ প্রোডাকশন Stack

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      retries: 5
    networks: [backend]

  api:
    image: myapp:${APP_VERSION}
    restart: unless-stopped
    depends_on:
      db: { condition: service_healthy }
    env_file: .env
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:8080/health"]
      interval: 30s
      start_period: 20s
    deploy:
      resources:
        limits: { memory: 512M, cpus: "1" }
    logging:
      driver: json-file
      options: { max-size: "10m", max-file: "3" }   # ডিস্ক ভরে যাওয়া ঠেকায়
    networks: [backend, frontend]
    # কোনো ports: নেই — বাইরের জগতে শুধু nginx-ই যাবে

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    depends_on: [api]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    networks: [frontend]

volumes:
  db-data:

networks:
  frontend:
  backend:
    internal: true     # 🔒 এই network-এর container ইন্টারনেটে যেতে পারবে না
```

```text
Internet ──▶ nginx ──frontend net──▶ api ──backend net(internal)──▶ db
                                                                   ▲
                                          db ইন্টারনেট থেকে অদৃশ্য ┘
```

> Nginx-এর কনফিগ কীভাবে লিখবে: [Nginx মডিউল ৩ — Reverse Proxy](/devops/nginx/module-3-reverse-proxy)

---

## ৭. আপডেট ও রোলব্যাক (প্রোডাকশন ফ্লো)

```bash
# ১. নতুন version build (CI-তে বা সার্ভারে)
docker build -t myapp:1.4.3 .

# ২. .env-এ version বদলাও
sed -i 's/^APP_VERSION=.*/APP_VERSION=1.4.3/' .env

# ৩. শুধু যে সার্ভিস বদলেছে সেটাই রিক্রিয়েট হবে
docker compose up -d

# ৪. যাচাই
docker compose ps
curl -f http://localhost:8080/health

# ৫. সমস্যা হলে রোলব্যাক — আগের tag-এ ফিরে যাও
sed -i 's/^APP_VERSION=.*/APP_VERSION=1.4.2/' .env
docker compose up -d
```

> এই কারণেই version tag গুরুত্বপূর্ণ। `latest` দিয়ে চললে রোলব্যাক করার মতো কিছুই থাকে না।

---

## ৮. Common Mistakes

| ভুল | ফল | সমাধান |
| --- | --- | --- |
| `.env` git-এ কমিট | secret ফাঁস | `.gitignore` + `.dockerignore` |
| `ports: "5432:5432"` DB-তে | ইন্টারনেট থেকে DB open | পোর্ট বাদ দাও, বা `127.0.0.1:` prefix |
| `down -v` অভ্যাসবশত | ডাটাবেস উধাও | `down` ব্যবহার করো, `-v` নয় |
| প্রোডাকশনে source bind mount | ইমেজ আর সার্ভারের কোড আলাদা | mount শুধু override ফাইলে |
| logging option না দেওয়া | JSON লগে ডিস্ক ভরে যায় | `max-size` + `max-file` |
| resource limit না দেওয়া | এক সার্ভিস পুরো VPS খায় | `deploy.resources.limits` |

---

## ✅ Self-check

- [ ] `depends_on` আর `condition: service_healthy`-র পার্থক্য কী?
- [ ] `docker compose down` আর `down -v`-এর পার্থক্য কী?
- [ ] API থেকে DB-তে connect করতে host হিসেবে কী লিখবো, কেন?
- [ ] `internal: true` network কী ঠেকায়?
- [ ] নতুন version deploy করে সমস্যা হলে কীভাবে রোলব্যাক করবো?

**পরের মডিউল:** [মডিউল ৮: VPS-এ প্রোডাকশন ডিপ্লয়](/devops/docker/module-8-production)

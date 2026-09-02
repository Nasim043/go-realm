# মডিউল ৬: Docker Network (container-এ container যোগাযোগ)

**সময়:** ~৬০ মিনিট | **আগে দরকার:** [মডিউল ৫](/devops/docker/module-5-volume)

> **এক লাইনে সমস্যা:** app container থেকে `localhost:5432` দিলে DB পাওয়া যায় না — কারণ প্রতিটি container-এর নিজের localhost। Network আর DNS নাম দিয়ে এই সমস্যার সমাধান।

> **কনসেপ্ট:** Container = বাড়ি, Network = রাস্তা। রাস্তা ছাড়া বাড়িগুলো একে অপরের সাথে যোগাযোগ করতে পারে না।

---

## 🎯 কেন Docker Network?

| সমস্যা | Solution | Production Impact |
|--------|----------|-------------------|
| Container একে অপরকে দেখে না | Network তৈরি করো | Microservices communicate |
| Localhost কাজ করে না | Container name use করো | Service discovery |
| Port conflict | Internal network | Secure communication |
| External access না দিতে চাই | Internal-only network | Security |

---

## 🏘️ Analogy: "অ্যাপার্টমেন্ট বিল্ডিং"

### Real-World Scenario

```
🏢 Building (Docker Host)
├── 🚪 Apartment 101 (Frontend Container)
│   └── Room 3000 (Port 3000)
├── 🚪 Apartment 201 (Backend Container)
│   └── Room 8080 (Port 8080)
└── 🚪 Apartment 301 (Database Container)
    └── Room 5432 (Port 5432)
```

### 3 ধরনের Communication:

1. **Internal Network (করিডোর)** - Apartment গুলো নিজেদের মধ্যে কথা বলে
2. **Bridge Network (Building Gate)** - বাইরের মানুষ specific apartment এ ঢুকে
3. **Host Network (Open Door)** - সব apartment সরাসরি accessible

---

## 📡 Docker Network Types

### 1️⃣ Bridge (Default) - সবচেয়ে Common

**কনসেপ্ট:** Private রাস্তা যেখানে containers চলাচল করে।

```
┌─────────────────────────────────────┐
│         Docker Host                 │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Bridge Network (bridge0)   │  │
│  │                              │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  │  │
│  │  │ Web │  │ API │  │ DB  │  │  │
│  │  │:3000│◄─┤:8080│◄─┤:5432│  │  │
│  │  └─────┘  └─────┘  └─────┘  │  │
│  │     ▲                        │  │
│  └─────┼────────────────────────┘  │
│        │ Port mapping              │
└────────┼───────────────────────────┘
         │
    Internet 🌐
```

**কখন ব্যবহার:** 99% cases (default)

---

### 2️⃣ Host Network - Direct Access

**কনসেপ্ট:** Container সরাসরি host এর network ব্যবহার করে।

```
┌─────────────────────────────────────┐
│         Docker Host                 │
│                                     │
│  Container → Host Network → :8080  │
│  (No isolation, direct access)     │
└────────────────────┬────────────────┘
                     │
                Internet 🌐
```

**কখন ব্যবহার:** 
- Performance critical apps (monitoring)
- Direct host port access needed

**⚠️ Risk:** Security কম, isolation নেই

---

### 3️⃣ None Network - Isolated

**কনসেপ্ট:** কোনো network নেই, সম্পূর্ণ isolated।

```
┌─────────────────────────────────────┐
│         Docker Host                 │
│                                     │
│         ┌─────────┐                 │
│         │Container│ 🔒              │
│         │(Locked) │                 │
│         └─────────┘                 │
│                                     │
└─────────────────────────────────────┘
```

**কখন ব্যবহার:** 
- Batch processing
- Security tests
- No network needed

---

### 4️⃣ Custom Bridge Network (Production Best!)

**কনসেপ্ট:** নিজের private road তৈরি করো।

```
┌─────────────────────────────────────┐
│         Docker Host                 │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   app-network (custom)       │  │
│  │                              │  │
│  │  frontend ◄──► backend       │  │
│  │     │            │           │  │
│  │     └────────────┴──► db     │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   monitoring-network         │  │
│  │                              │  │
│  │  prometheus ◄──► grafana     │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**সুবিধা:**
- ✅ Container name দিয়ে access (DNS)
- ✅ Network isolation
- ✅ Security control

---

## 🛠️ Production Setup Examples

### Example 1: Basic Web App

```bash
# 1. Custom network তৈরি
docker network create app-net

# 2. Database চালু (শুধু internal access)
docker run -d \
  --name postgres-db \
  --network app-net \
  -e POSTGRES_PASSWORD=secret \
  postgres:15-alpine

# 3. Backend চালু (internal + external)
docker run -d \
  --name backend \
  --network app-net \
  -p 8080:8080 \
  -e DATABASE_URL=postgres://postgres:secret@postgres-db:5432/mydb \
  mybackend:latest

# 4. Frontend চালু (external only)
docker run -d \
  --name frontend \
  --network app-net \
  -p 3000:3000 \
  -e API_URL=http://backend:8080 \
  myfrontend:latest
```

**Access:**
```
User → :3000 → Frontend
Frontend → backend:8080 → Backend
Backend → postgres-db:5432 → Database
```

**Security:** Database শুধু internal, বাইরে থেকে access নেই! ✅

---

### Example 2: Multi-Network (Production Pattern)

```bash
# Frontend network (public-facing)
docker network create frontend-net

# Backend network (internal)
docker network create backend-net

# Database
docker run -d \
  --name db \
  --network backend-net \
  postgres:15-alpine

# Backend (connects to both networks)
docker run -d \
  --name api \
  --network backend-net \
  myapi:latest

docker network connect frontend-net api

# Frontend (only frontend network)
docker run -d \
  --name web \
  --network frontend-net \
  -p 80:3000 \
  myweb:latest
```

**Network Diagram:**

```
Internet
   │
   ▼
┌──────────┐
│   Web    │ (frontend-net only)
│  :3000   │
└────┬─────┘
     │ frontend-net
     ▼
┌──────────┐
│   API    │ (both networks) ◄── Bridge!
│  :8080   │
└────┬─────┘
     │ backend-net
     ▼
┌──────────┐
│    DB    │ (backend-net only)
│  :5432   │
└──────────┘
```

**Security:** Web → API → DB (one-way flow) ✅

---

## 🐳 Docker Compose Network (Automatic!)

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    image: myapp/frontend:latest
    ports:
      - "80:3000"
    networks:
      - frontend-net
    environment:
      - API_URL=http://backend:8080
    restart: unless-stopped

  # Backend
  backend:
    image: myapp/backend:latest
    networks:
      - frontend-net  # Frontend access করার জন্য
      - backend-net   # Database access করার জন্য
    environment:
      - DATABASE_URL=postgresql://postgres:secret@database:5432/mydb
    restart: unless-stopped

  # Database
  database:
    image: postgres:15-alpine
    networks:
      - backend-net  # শুধু backend access করবে
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb
    volumes:
      - db-data:/var/lib/postgresql/data
    restart: unless-stopped

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true  # External access blocked!

volumes:
  db-data:
```

**Automatic DNS:**
- `frontend` কন্টেইনার থেকে `backend` এ access: `http://backend:8080`
- `backend` কন্টেইনার থেকে `database` এ access: `postgresql://database:5432`

---

## 🔍 Network Commands (Production Debugging)

### Network Management

```bash
# সব network দেখো
docker network ls

# Network details
docker network inspect app-net

# Network তৈরি
docker network create my-net

# Custom subnet দিয়ে
docker network create --subnet=172.18.0.0/16 my-custom-net

# Network delete
docker network rm my-net

# Unused networks clean
docker network prune
```

---

### Container Network Info

```bash
# Container এর network দেখো
docker inspect <container> | grep Networks -A 20

# Container এ network connect
docker network connect app-net my-container

# Container থেকে network disconnect
docker network disconnect app-net my-container

# Container এর IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container
```

---

### Network Troubleshooting

```bash
# Container থেকে ping test
docker exec my-container ping other-container

# DNS resolution test
docker exec my-container nslookup backend

# Port check
docker exec my-container nc -zv backend 8080

# Network connectivity test
docker exec my-container curl http://backend:8080/health
```

---

## 🎯 Production Best Practices

### 1️⃣ Network Isolation

```yaml
# ❌ খারাপ - সব একই network
networks:
  - app-net

# ✅ ভালো - Layer করে network
networks:
  frontend-net:    # Public-facing
  backend-net:     # Internal APIs
  database-net:    # Database only
```

---

### 2️⃣ Internal Networks

```yaml
networks:
  database-net:
    driver: bridge
    internal: true  # 🔒 External access blocked
```

**Use Case:** Database, Redis, RabbitMQ (শুধু internal)

---

### 3️⃣ Custom Subnet (Large Apps)

```yaml
networks:
  app-net:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
          gateway: 172.28.0.1
```

**কখন:** Multiple networks, IP conflict avoid করতে

---

### 4️⃣ DNS Resolution

```yaml
services:
  backend:
    networks:
      app-net:
        aliases:
          - api
          - api-server
```

**Result:** `backend`, `api`, `api-server` - তিনটা নামেই access করা যাবে

---

## 🔐 Security Patterns

### Pattern 1: DMZ Network

```
Internet
   │
   ▼
[Load Balancer] ◄─── dmz-network (exposed)
   │
   ▼
[API Gateway] ◄─── app-network (internal)
   │
   ▼
[Services] ◄─── backend-network (internal)
   │
   ▼
[Database] ◄─── data-network (internal: true)
```

**docker-compose.yml:**

```yaml
networks:
  dmz-net:
    driver: bridge
  app-net:
    driver: bridge
  data-net:
    driver: bridge
    internal: true

services:
  nginx:
    networks: [dmz-net, app-net]
  
  api:
    networks: [app-net, data-net]
  
  database:
    networks: [data-net]
```

---

### Pattern 2: Service Mesh (Advanced)

```yaml
services:
  service-a:
    networks:
      - service-mesh
  
  service-b:
    networks:
      - service-mesh
  
  envoy:  # Service mesh proxy
    networks:
      - service-mesh
      - external-net

networks:
  service-mesh:
    internal: true
  external-net:
    driver: bridge
```

---

## 📊 Network Performance

### Connection Types Performance

| Type | Latency | Throughput | Use Case |
|------|---------|------------|----------|
| **Same container** | 0ms | Max | Localhost calls |
| **Same network** | <1ms | ~10 Gbps | Microservices |
| **Different network** | 1-2ms | ~1 Gbps | Cross-service |
| **Host network** | <0.5ms | Max | High performance |

---

### Optimization Tips

```yaml
services:
  app:
    networks:
      app-net:
        # Custom MTU for performance
        driver_opts:
          com.docker.network.driver.mtu: 1450
```

---

## 🛡️ Production Checklist

### Network Security

- [ ] Database network `internal: true`
- [ ] শুধু প্রয়োজনীয় ports expose
- [ ] Custom networks (default bridge না)
- [ ] Network segmentation করা
- [ ] Unnecessary port mappings remove করা

### Network Design

- [ ] Service discovery দিয়ে container names
- [ ] DNS aliases configure করা
- [ ] Health checks সব services এ
- [ ] Network overlap check করা
- [ ] Documentation clear আছে

---

## 🔥 Real Production Example: E-commerce

```yaml
version: '3.8'

services:
  # Public Layer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    networks:
      - public-net
      - app-net
    restart: unless-stopped

  # Application Layer
  frontend:
    image: shop/frontend:latest
    networks:
      - app-net
    restart: unless-stopped

  api:
    image: shop/api:latest
    networks:
      - app-net
      - backend-net
    restart: unless-stopped

  # Service Layer
  auth-service:
    image: shop/auth:latest
    networks:
      - backend-net
      - data-net
    restart: unless-stopped

  order-service:
    image: shop/orders:latest
    networks:
      - backend-net
      - data-net
    restart: unless-stopped

  # Cache Layer
  redis:
    image: redis:7-alpine
    networks:
      - backend-net
    restart: unless-stopped

  # Data Layer
  postgres:
    image: postgres:15-alpine
    networks:
      - data-net
    volumes:
      - db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

networks:
  public-net:
    driver: bridge
  app-net:
    driver: bridge
  backend-net:
    driver: bridge
  data-net:
    driver: bridge
    internal: true  # 🔒 Fully isolated

volumes:
  db-data:
```

**Network Flow:**

```
Internet
   ↓
nginx (public-net, app-net)
   ↓
frontend (app-net)
   ↓
api (app-net, backend-net)
   ↓
auth/order services (backend-net, data-net)
   ↓
postgres/redis (data-net - ISOLATED!)
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Container can't reach another

**Debug:**
```bash
# Check if same network
docker network inspect app-net

# Test DNS
docker exec container1 ping container2

# Test port
docker exec container1 nc -zv container2 8080
```

**Solution:**
```bash
docker network connect app-net container1
```

---

### Issue 2: "Connection refused"

**Causes:**
1. Wrong port
2. Service not ready (no health check)
3. Different network

**Solution:**
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

---

### Issue 3: DNS not working

**Check:**
```bash
docker exec container nslookup backend
```

**Solution:** Use custom network (not default bridge)

```bash
docker network create app-net
docker run --network app-net --name backend myimage
```

---

## 💡 Key Takeaways

1. **Custom Networks সবসময়** - Default bridge এড়িয়ে চলো
2. **Network Segmentation** - Frontend, Backend, Data আলাদা করো
3. **Internal Networks** - Database/Cache external access block করো
4. **Service Names ব্যবহার** - IP address না, container name
5. **Health Checks must** - Network dependency management এর জন্য

---

## 🎓 Quick Reference

```bash
# Create network
docker network create app-net

# Run with network
docker run --network app-net --name backend myimage

# Connect running container
docker network connect app-net my-container

# Inspect
docker network inspect app-net

# Test connectivity
docker exec container1 ping container2

# View container's networks
docker inspect container | grep Networks -A 10
```

---

**🚀 মনে রাখো:** Network হলো containers এর যোগাযোগ system। সঠিক network design = secure, scalable, maintainable application!

---

**পরের মডিউল:** [মডিউল ৭: Docker Compose](/devops/docker/module-7-compose)

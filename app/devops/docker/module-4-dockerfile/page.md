# মডিউল ৪: Dockerfile ও Image Build (Go-এর জন্য)

> **লক্ষ্য:** ৮০০MB-এর ইমেজকে ১৫MB-তে নামানো, build ১০ গুণ দ্রুত করা, এবং নিরাপদ প্রোডাকশন ইমেজ তৈরি করা।

**সময়:** ~৯০ মিনিট | **আগে দরকার:** [মডিউল ৩](/devops/docker/module-3-container-runtime)

---

## এই মডিউল শেষে তুমি পারবে

- ✅ প্রোডাকশন-রেডি Dockerfile লিখতে
- ✅ ইমেজ সাইজ ৮০০MB → ১৫MB-তে কমাতে
- ✅ Layer caching কাজে লাগিয়ে build ১০x দ্রুত করতে
- ✅ ENTRYPOINT vs CMD-এর ফাঁদগুলো এড়াতে
- ✅ সিকিউরিটি বেস্ট প্র্যাকটিস অ্যাপ্লাই করতে

---

## পার্ট ১: বেসিক কনসেপ্ট

| কনসেপ্ট | সহজ ভাষায় | প্রোডাকশনে কেন দরকার |
| --- | --- | --- |
| **Dockerfile** | রেসিপি বুক — ইমেজ তৈরির স্টেপ-বাই-স্টেপ গাইড | রিপ্রোডিউসিবল বিল্ড, ভার্সন কন্ট্রোল |
| **Image** | রেডি-টু-রান প্যাকেজ (সব ডিপেনডেন্সি সহ) | একবার বিল্ড, যেকোনো জায়গায় রান |
| **Layer** | প্রতিটি ইন্সট্রাকশন একটি লেয়ার তৈরি করে | ক্যাশিং, দ্রুত বিল্ড, ছোট সাইজ |
| **Multi-stage** | বিল্ড ও রানটাইম আলাদা করা | ছোট, নিরাপদ, প্রোডাকশন-রেডি ইমেজ |

```text
Dockerfile ──docker build──▶ Image ──docker run──▶ Container
 (তুমি লেখো)                (layer-এর স্তূপ)      (চলন্ত প্রসেস)
```

> **💡 টিপ:** Dockerfile একবার ভালো করে লিখলে প্রোডাকশনের ৯০% সমস্যা এড়ানো যায়।

---

## পার্ট ২: ইন্সট্রাকশন রেফারেন্স

### ১. FROM — বেস ইমেজ সিলেকশন

| ইমেজ টাইপ | সাইজ | কখন ব্যবহার | প্রোডাকশন |
| --- | --- | --- | --- |
| `golang:1.24` | ~800MB | ডেভেলপমেন্ট, টেস্টিং | ❌ বড় সাইজ |
| `golang:1.24-alpine` | ~300MB | বিল্ড স্টেজ | ✅ ভালো |
| `alpine:3.19` | ~7MB | রানটাইম স্টেজ | ✅ সেরা |
| `scratch` | 0MB | স্ট্যাটিক বাইনারি | ✅ মিনিমাল |

```dockerfile
# ❌ খারাপ - বিশাল ইমেজ
FROM golang:1.24

# ✅ ভালো - বিল্ডের জন্য alpine
FROM golang:1.24-alpine AS builder

# ✅ সেরা - রানটাইমের জন্য alpine বা scratch
FROM alpine:3.19
# অথবা
FROM scratch
```

> **কোনটা বাছবে?** shell দিয়ে ডিবাগ করতে চাইলে `alpine`। সর্বোচ্চ ছোট ও নিরাপদ চাইলে `scratch` (কিন্তু ভেতরে ঢুকে কিছু দেখা যাবে না)।

---

### ২. WORKDIR — কাজের ডিরেক্টরি

```dockerfile
# ❌ খারাপ - root এ কাজ করা
COPY . /
RUN go build

# ✅ ভালো - ডেডিকেটেড ডিরেক্টরি
# পরবর্তী সব কমান্ড (COPY, RUN) এই ফোল্ডারের ভেতরেই রান হবে।
# অনেকটা লিনাক্সের cd (change directory)-র মতো, কিন্তু ডিরেক্টরি না থাকলে তৈরিও করে দেয়।
WORKDIR /app
COPY . .
RUN go build
```

> **⚠️ সতর্কতা:** সবসময় WORKDIR ব্যবহার করো। ফাইল অর্গানাইজেশন ও ENTRYPOINT-এর relative path (`./app`) ঠিক রাখতে এটা জরুরি।

---

### ৩. COPY vs ADD

| কমান্ড | কী করে | কখন | রেকমেন্ডেশন |
| --- | --- | --- | --- |
| `COPY` | শুধু ফাইল কপি | ৯৫% সময় | ✅ সবসময় এটাই |
| `ADD` | কপি + URL ডাউনলোড + tar এক্সট্র্যাক্ট | বিশেষ ক্ষেত্রে | ⚠️ এড়িয়ে চলো |

- সিনট্যাক্স: `COPY <source> <destination>`
- destination `/test/` এভাবে `/` দিয়ে শেষ হলে সেটা ফোল্ডার বোঝায়

```dockerfile
# ✅ ভালো - COPY ব্যবহার
COPY go.mod go.sum ./
COPY main.go .

# ❌ খারাপ - অকারণে ADD (implicit behavior, cache অনিশ্চিত)
ADD https://example.com/file.tar.gz .

# ✅ ভালো - নির্দিষ্ট ফোল্ডার কপি (সব কিছু না)
COPY cmd/ ./cmd/
COPY internal/ ./internal/
```

---

### ৪. RUN — লেয়ার অপটিমাইজেশন

```dockerfile
# ❌ খারাপ - অনেক লেয়ার (স্লো বিল্ড, বড় ইমেজ)
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache tzdata
RUN apk add --no-cache curl

# ✅ ভালো - এক লেয়ার
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl

# ✅ সেরা - ক্লিনআপ সহ (একই লেয়ারে মুছতে হবে, নইলে সাইজ কমে না)
RUN apk add --no-cache ca-certificates tzdata && \
    rm -rf /var/cache/apk/*
```

> **💡 কেন একই লেয়ারে মুছতে হবে?** পরের লেয়ারে ফাইল ডিলিট করলে আগের লেয়ারে সেটা থেকেই যায় — ইমেজ সাইজ কমে না, শুধু দেখা যায় না।

---

### ৫. ENV — Environment Variables

```dockerfile
# ✅ বিল্ড টাইম কনফিগ
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# ✅ রানটাইম কনফিগ (ডিফল্ট মান)
ENV APP_ENV=production \
    LOG_LEVEL=info \
    PORT=8080
```

```dockerfile
# ❌ সেন্সিটিভ ডাটা কখনো ইমেজে না — docker history দিয়ে যে কেউ দেখতে পাবে
ENV DB_PASSWORD=secret123
```

```bash
# ✅ রানটাইমে ইনজেক্ট করো
docker run --env-file .env myapp
```

---

### ৬. EXPOSE — পোর্ট ডকুমেন্টেশন

```dockerfile
EXPOSE 8080
```

> **📌 নোট:** এটা শুধু ডকুমেন্টেশন — আসলে কোনো পোর্ট খোলে না, সিকিউরিটিও দেয় না। পোর্ট আসলে খোলে `docker run -p 8080:8080 myapp`।

---

### ৭. USER — Non-root (সিকিউরিটি)

```dockerfile
# ❌ খারাপ - কিছু না লিখলে ডিফল্ট root

# ✅ ভালো - non-root user তৈরি করে সুইচ
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser
USER appuser

# ✅ সেরা - ownership সহ কপি
COPY --chown=appuser:appgroup ./app .
USER appuser
```

> **🔒 নিয়ম:** প্রোডাকশনে কখনো root হিসেবে অ্যাপ চালাবে না। container escape হলে ক্ষতির মাত্রা এতেই কমে।
> **⚠️ খেয়াল রাখো:** non-root user 1024-এর নিচের পোর্টে (৮০, ৪৪৩) bind করতে পারবে না — অ্যাপ 8080-এ চালাও, পোর্ট ম্যাপিং দিয়ে ৮০-তে আনো।

---

### ৮. HEALTHCHECK

```dockerfile
# ✅ HTTP endpoint check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# ✅ Custom script
COPY healthcheck.sh /usr/local/bin/
HEALTHCHECK CMD /usr/local/bin/healthcheck.sh
```

বিস্তারিত: [মডিউল ৩ — Health Check](/devops/docker/module-3-container-runtime)

---

## পার্ট ৩: ENTRYPOINT vs CMD (গভীরে — এটাই সবচেয়ে বেশি বাগ তৈরি করে)

### ৩.১ ENTRYPOINT — container-এর main program

**ENTRYPOINT** container-কে একটি executable program-এর মতো বানায়।

```dockerfile
ENTRYPOINT ["./app"]
```

👉 অর্থ: container start হলেই `./app` রান করবে।

**কেন ব্যবহার করবো:**

- Main process fixed রাখতে
- Accidental override ঠেকাতে
- Production backend / worker / cron-এর জন্য

📌 **Production Go backend = ENTRYPOINT mandatory**

### ৩.২ `./app` মানে কী?

```dockerfile
WORKDIR /app
ENTRYPOINT ["./app"]
```

| অংশ | অর্থ |
| --- | --- |
| `.` | বর্তমান directory (WORKDIR) |
| `/` | এর ভেতরে |
| `app` | Go build করা binary |

➡️ "WORKDIR-এর ভেতরের `app` নামের executable চালাও"

### ৩.৩ Argument behavior (🔥 খুব গুরুত্বপূর্ণ)

```bash
docker run my-image --help
```

Docker internally চালায়:

```bash
./app --help
```

👉 `app` replace হয় না
👉 `--help` শুধু argument হিসেবে যুক্ত হয়

### ৩.৪ Build command ও ENTRYPOINT — MUST MATCH

> **Golden Rule:** ENTRYPOINT-এ যে নাম দিবে, **ঠিক সেই নামেই binary build হতে হবে।**

```dockerfile
# ✅ সঠিক
RUN go build -o app
ENTRYPOINT ["./app"]
```

```dockerfile
# ✅ সঠিক
RUN go build -o my-server
ENTRYPOINT ["./my-server"]
```

```dockerfile
# ❌ Beginner trap
RUN go build          # module name অনুযায়ী binary বানায়, "app" নামে না
ENTRYPOINT ["./app"]
```

📛 ফলাফল:

```text
exec: "./app": no such file or directory
```

### ৩.৫ CMD — default argument provider

**CMD** main command না, বরং **default argument** দেয়।

```dockerfile
CMD ["--port=8080"]
```

```bash
docker run my-image --port=9090   # CMD সম্পূর্ণ replace হয়ে যায়
```

### ৩.৬ এক নজরে তুলনা

| বিষয় | ENTRYPOINT | CMD |
| --- | --- | --- |
| Role | Main process | Default args |
| Override | ❌ কঠিন (`--entrypoint` লাগে) | ✅ সহজ (শুধু argument দাও) |
| Production backend | ✅ YES | ⚠️ সীমিত |
| Best use | API / worker | Flags / options |

### ৩.৭ ENTRYPOINT + CMD (Best practice combo)

```dockerfile
ENTRYPOINT ["./app"]
CMD ["--port=8080"]
```

```bash
docker run my-image
# চালায়: ./app --port=8080

docker run my-image --port=9090
# চালায়: ./app --port=9090
```

👉 Main process fixed, args flexible।

### ৩.৮ ENTRYPOINT-জনিত বাস্তব বাগ

| 🐞 বাগ | কারণ | সমাধান |
| --- | --- | --- |
| Container সাথে সাথে exit | ENTRYPOINT নেই, শুধু CMD; বা process daemon মোডে চলে গেছে | foreground-এ চলে এমন process দাও |
| Config override করা যাচ্ছে না | সব কিছু ENTRYPOINT-এ hardcoded | পরিবর্তনশীল অংশ CMD/ENV-তে নাও |
| `no such file or directory` | binary নামের মিল নেই, বা ভুল WORKDIR | `go build -o` আর ENTRYPOINT মিলাও |
| `docker run image bash` কাজ করে না | ENTRYPOINT override হয় না | `docker run --entrypoint sh -it image` |

### ৩.৯ Debug Checklist (রাত ৩টার জন্য)

```bash
docker inspect <container> --format '{{.Config.Entrypoint}} {{.Config.Cmd}} {{.Config.WorkingDir}}'
docker run --rm --entrypoint sh -it myapp:1.4.2 -c 'ls -l && id'
```

- `Config.Entrypoint` ঠিক আছে?
- `WorkingDir` ঠিক আছে?
- binary আছে এবং executable (`ls -l`)?

### ৩.১০ Mental Model

> 🧠 Container = OS না
> 🧠 Container = Program
> 🧠 ENTRYPOINT = সেই program-এর start

**মুখস্থ রাখার নিয়ম:**

- ENTRYPOINT = main executable
- Binary name must match
- CMD = optional args
- Production backend = ENTRYPOINT mandatory
- সবসময় **exec form** (JSON array), shell form না

---

## পার্ট ৪: Layer Caching

### সহজ কনসেপ্ট: "ভিডিও গেম সেভ পয়েন্ট"

ডকার ক্যাশকে ভিডিও গেমের **সেভ পয়েন্ট** ভাবো।

- ইমেজের প্রতিটি লাইন (`COPY`, `RUN`) একেকটি লেভেল।
- বিল্ডের সময় ডকার চেক করে: **"আগের বার আর এবারের ইনপুট কি হুবহু এক?"**
- এক হলে কাজটা আর করে না, সেভ করা রেজাল্ট ব্যবহার করে (**Cache Hit** ✅)।
- ভিন্ন হলে নতুন করে করে (**Cache Miss** ❌)।

### ⚠️ ডমিনো এফেক্ট

**একবার কোনো ধাপে ক্যাশ ভাঙলে, তার পরের সব ধাপের ক্যাশ বাতিল হয়ে যায়।**

```text
COPY go.mod go.sum ./   ✅ hit
RUN go mod download     ✅ hit
COPY . .                ❌ miss  ← কোড বদলেছে
RUN go build            ❌ miss  ← ডমিনো
```

### অর্ডার অপটিমাইজেশন

ধরো `main.go`-তে মাত্র **এক লাইন** বদলেছ:

```dockerfile
# ❌ খারাপ অর্ডার — প্রতিবার পুরো rebuild
FROM golang:1.24-alpine
WORKDIR /app

COPY . .                # কোড বদলেছে → Cache Miss ❌
RUN go mod download     # ডমিনো এফেক্টে এটাও নতুন করে ⚠️ ৫ মিনিট নষ্ট
RUN go build -o app .
```

```dockerfile
# ✅ ভালো অর্ডার — স্মার্ট ক্যাশিং
FROM golang:1.24-alpine
WORKDIR /app

COPY go.mod go.sum ./   # ফাইলে হাত দেইনি → Cache Hit ✅
RUN go mod download     # ক্যাশ থেকেই আসবে ✅ ০ সেকেন্ড

COPY . .                # এখান থেকে নতুন কাজ শুরু
RUN go build -o app .
```

| ধাপ | খারাপ অর্ডার ❌ | ভালো অর্ডার ✅ |
| --- | --- | --- |
| ডিপেন্ডেন্সি ডাউনলোড | পুরোটা আবার | স্কিপ (ক্যাশ) |
| সময় | ২–৫ মিনিট | ~১০ সেকেন্ড |
| ব্যান্ডউইথ | ৫০০MB নষ্ট | ০MB |

> **⚡ গোল্ডেন রুল:** যা **কম বদলায়** (go.mod) তা **উপরে**, যা **বেশি বদলায়** (source code) তা **নিচে**।

---

## পার্ট ৫: Multi-Stage Build (প্রোডাকশন মাস্ট)

### সহজ কনসেপ্ট: "রান্নাঘর বনাম ডাইনিং টেবিল"

১. **Stage 1 (Builder — রান্নাঘর):** হাঁড়ি-পাতিল, বটি, আগুন লাগে (Go compiler, git, SDK)। রান্না শেষ হলে এগুলোর দরকার নেই।
২. **Stage 2 (Production — ডাইনিং টেবিল):** শুধু **তৈরি খাবার** (binary) পরিবেশন করা হয়।

**ফলাফল:** রান্নাঘর (৮০০MB) ফেলে দিয়ে শুধু প্লেট (১৫MB) নিয়ে প্রোডাকশনে যাই।

| ফিচার | Single-Stage | Multi-Stage |
| --- | --- | --- |
| **ইমেজ সাইজ** | ৮০০MB+ (সব টুলস সহ) | ১৫–৩০MB (শুধু অ্যাপ) |
| **বিল্ড টুলস** | কম্পাইলার প্রোডাকশনে যায় (রিস্কি) | সব ফেলে দেওয়া হয় |
| **সিকিউরিটি** | কম (অ্যাটাকার টুলস পায়) | বেশি (কোনো টুলস নেই) |
| **ডিপ্লয়** | স্লো (বড় pull) | সুপার ফাস্ট |

### প্রোডাকশন-রেডি Multi-Stage Dockerfile

```dockerfile
# ============================================
# Stage 1: Builder (রান্নাঘর) 🍳
# ============================================
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# ১. স্মার্ট ক্যাশিং: আগে go.mod
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# ২. সোর্স কোড
COPY . .

# ৩. অপ্টিমাইজড বিল্ড
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a \
    -o /build/app \
    ./cmd/server

# ============================================
# Stage 2: Production (ডাইনিং টেবিল) 🍽️
# ============================================
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

# ৪. সিকিউরিটি: non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

# ৫. ম্যাজিক কপি: আগের স্টেজ থেকে শুধু বাইনারি
COPY --from=builder --chown=appuser:appgroup /build/app .

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["./app"]
```

### কোড ব্রেকডাউন — এই ফ্ল্যাগগুলো কেন?

**১. `-ldflags='-w -s'`**

- `-w`: ডিবাগিং তথ্য (DWARF) ফেলে দেয়
- `-s`: সিম্বল টেবিল ফেলে দেয়
- **লাভ:** বাইনারি সাইজ ৩০–৪০% কমে। প্রোডাকশনে binary ডিবাগ করব না, তাই দরকার নেই।

**২. `CGO_ENABLED=0`**

- Go-কে বলে C লাইব্রেরি (libc) ব্যবহার না করতে।
- **লাভ:** **Static binary** তৈরি হয়, যা কোনো ডিপেন্ডেন্সি ছাড়াই চলে — এমনকি `scratch` ইমেজেও।

**৩. `USER appuser`**

- ডিফল্টে container **root**-এ চলে, যা বিপজ্জনক। অ্যাপ হ্যাক হলে পুরো container-এর কন্ট্রোল চলে যায়।
- **সমাধান:** কম ক্ষমতার `appuser` তৈরি করে সেখানে সুইচ করা।

**৪. `COPY --from=builder`**

- এটাই multi-stage-এর আসল জাদু। শুধু `/build/app` ফাইলটা আনা হলো; সোর্স কোড, `.git`, কম্পাইলার — সব আগের স্টেজেই থেকে গেল, ফাইনাল ইমেজে যায়নি।

---

## পার্ট ৬: .dockerignore (Must Have)

| সমস্যা | সমাধান | ফলাফল |
| --- | --- | --- |
| বিশাল build context | .dockerignore | দ্রুত build |
| Secret leak (.env, .git) | .dockerignore | নিরাপদ image |
| অকারণে cache invalidation | .dockerignore | ভালো caching |

```text
# Git
.git
.gitignore

# Editor
.vscode
.idea
*.swp

# Docs
README.md
docs/
*.md

# Tests
*_test.go
**/*_test.go
testdata/

# Build artifacts
bin/
dist/
build/
*.exe

# Dependencies (container-এ ডাউনলোড হবে)
vendor/

# Environment / secrets
.env
.env.*
*.env

# CI/CD
.github/
.gitlab-ci.yml
Jenkinsfile

# Docker
Dockerfile*
docker-compose*.yml
.dockerignore

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Temp
tmp/
temp/
*.tmp
```

---

## পার্ট ৭: Security Best Practices

### চেকলিস্ট

- [ ] Non-root user ব্যবহার করেছো
- [ ] Official base image ব্যবহার করেছো
- [ ] Multi-stage build করেছো
- [ ] কোনো secret ইমেজে embed করোনি
- [ ] `latest` tag ব্যবহার করোনি
- [ ] শুধু দরকারি dependency install করেছো
- [ ] `.dockerignore` ফাইল আছে
- [ ] ইমেজ scan করেছো (`docker scout cve myapp:1.4.2` বা `trivy image myapp:1.4.2`)

```dockerfile
# ✅ নির্দিষ্ট version (latest না)
FROM golang:1.24-alpine AS builder

# ✅ checksum verify
RUN go mod verify

# ✅ ইমেজে secret না
# ❌ করো না: COPY .env .
# ✅ করো: docker run --env-file .env myapp

# ✅ মিনিমাল runtime
FROM alpine:3.19
# FROM scratch   # আরও secure, কিন্তু ডিবাগ কঠিন

# ✅ Non-root
USER appuser
```

```bash
# ✅ Read-only filesystem (আরও এক স্তর সুরক্ষা)
docker run --read-only --tmpfs /tmp myapp:1.4.2
```

> **🔐 Secret-এর নিয়ম:** ইমেজের প্রতিটি লেয়ার `docker history` দিয়ে পড়া যায়। একবার secret লেয়ারে ঢুকলে পরে `rm` করেও তা মোছা যায় না। Secret সবসময় রানটাইমে ইনজেক্ট করো।

---

## পার্ট ৮: Build Optimization

### ১. ক্যাশ-ফ্রেন্ডলি অর্ডার

```dockerfile
# ❌ সহজেই cache ভাঙে
COPY . .
RUN go build

# ✅ স্মার্ট caching
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build
```

### ২. Layer merging

```dockerfile
# ❌ অনেক layer
RUN apk add curl
RUN apk add git
RUN apk add ca-certificates

# ✅ এক layer
RUN apk add --no-cache curl git ca-certificates
```

### ৩. BuildKit cache mount (আধুনিক Docker)

```dockerfile
# syntax=docker/dockerfile:1

# মডিউল ক্যাশ ও build ক্যাশ layer-এর বাইরে রাখা হয় —
# তাই cache miss হলেও আবার ডাউনলোড/কম্পাইল লাগে না
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    go build -o app ./cmd/server
```

```bash
export DOCKER_BUILDKIT=1   # নতুন Docker-এ ডিফল্ট
```

### ইমেজ সাইজের তুলনা

```dockerfile
# ধাপ ১: কোনো অপটিমাইজেশন নেই
FROM golang:1.24
WORKDIR /app
COPY . .
RUN go build -o app .
CMD ["./app"]
```

**Result:** ~850MB 😱

```dockerfile
# ধাপ ২: multi-stage + alpine
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app .

FROM alpine:3.19
COPY --from=builder /app/app .
CMD ["./app"]
```

**Result:** ~25MB 🎉

```dockerfile
# ধাপ ৩: static binary + scratch
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -ldflags="-w -s" -o app .

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/app /app
ENTRYPOINT ["/app"]
```

**Result:** ~8–15MB 🚀

---

## পার্ট ৯: Common Mistakes (এড়িয়ে চলো)

| # | ভুল | কেন খারাপ | ঠিক পথ |
| --- | --- | --- | --- |
| ১ | `FROM golang:latest` | আজ আর কাল আলাদা build | `FROM golang:1.24-alpine` |
| ২ | `RUN apk add vim nano htop` | ইমেজ বড়, attack surface বড় | শুধু `ca-certificates` জাতীয় যা লাগে |
| ৩ | `COPY . .` (ignore ছাড়া) | `.git`, `.env` ইমেজে ঢোকে | `.dockerignore` + নির্দিষ্ট COPY |
| ৪ | USER না দেওয়া | root-এ চলে | `USER appuser` |
| ৫ | `.dockerignore` না থাকা | ধীর build, secret leak | ফাইল তৈরি করো |
| ৬ | shell form `CMD ./app` | SIGTERM পৌঁছায় না | `CMD ["./app"]` |
| ৭ | ইমেজে secret | `docker history`-তে দেখা যায় | `--env-file` / secret manager |

---

## পার্ট ১০: সম্পূর্ণ Real-World Example (Go)

### Project Structure

```text
myapp/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── handler/
│   ├── service/
│   └── repository/
├── pkg/
│   └── logger/
├── migrations/
├── config/
├── go.mod
├── go.sum
├── Dockerfile
├── .dockerignore
└── docker-compose.yml
```

### main.go (graceful shutdown + health endpoint)

```go
package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"
)

func main() {
    mux := http.NewServeMux()

    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from Docker! 🐳\n")
    })

    // Health check endpoint — HEALTHCHECK এখানেই হিট করবে
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"status":"healthy"}`)
    })

    server := &http.Server{Addr: ":8080", Handler: mux}

    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)

    go func() {
        log.Println("Server starting on :8080")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    <-stop
    log.Println("Shutting down gracefully...")

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Printf("Shutdown error: %v", err)
    }
    log.Println("Server stopped")
}
```

### Dockerfile (metadata ও build arg সহ পূর্ণ সংস্করণ)

```dockerfile
# ============================================
# Build Arguments
# ============================================
ARG GO_VERSION=1.24
ARG ALPINE_VERSION=3.19

# ============================================
# Stage 1: Build
# ============================================
FROM golang:${GO_VERSION}-alpine AS builder

RUN apk add --no-cache git

WORKDIR /build

COPY go.mod go.sum ./
RUN go mod download && go mod verify

COPY cmd/ ./cmd/
COPY internal/ ./internal/
COPY pkg/ ./pkg/

# Version metadata — বাইনারিতেই বসিয়ে দেওয়া
ARG VERSION=dev
ARG BUILD_TIME
ARG GIT_COMMIT

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s \
    -X main.Version=${VERSION} \
    -X main.BuildTime=${BUILD_TIME} \
    -X main.GitCommit=${GIT_COMMIT}" \
    -a \
    -o app \
    ./cmd/server

# ============================================
# Stage 2: Production
# ============================================
FROM alpine:${ALPINE_VERSION}

LABEL maintainer="your-email@example.com" \
      description="My Go Application"

RUN apk add --no-cache ca-certificates tzdata && update-ca-certificates

ENV TZ=Asia/Dhaka \
    APP_ENV=production \
    LOG_LEVEL=info \
    PORT=8080

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

RUN mkdir -p /app/logs /app/data && chown -R appuser:appgroup /app

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /build/app .

# কনফিগ/মাইগ্রেশন লাগলে
# COPY --chown=appuser:appgroup ./config ./config
# COPY --chown=appuser:appgroup ./migrations ./migrations

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["./app"]
CMD ["serve"]
```

### Build & Run

```bash
# Build with metadata
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S') \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t myapp:1.0.0 \
  -t myapp:latest \
  .

# Run (production flags)
docker run -d \
  --name myapp \
  --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  --env-file .env \
  --memory 512m --cpus 1 \
  myapp:1.0.0

# যাচাই
curl http://localhost:8080/health
docker logs -f myapp
docker inspect --format='{{.State.Health.Status}}' myapp
docker images myapp        # সাইজ দেখো

# graceful stop
docker stop -t 30 myapp
```

---

## 📋 Deployment Checklist

**Pre-Deployment**

- [ ] Multi-stage build ব্যবহার করেছো
- [ ] Non-root user সেট করেছো
- [ ] `.dockerignore` তৈরি করেছো
- [ ] Health check আছে
- [ ] নির্দিষ্ট version tag ব্যবহার করেছো
- [ ] কোনো secret embed করোনি
- [ ] ইমেজ scan করেছো
- [ ] ইমেজ সাইজ optimize করেছো

**Build Time**

- [ ] Dependency caching সঠিক অর্ডারে
- [ ] Layer অর্ডার optimize করা
- [ ] Build argument documented
- [ ] Version metadata বাইনারিতে ঢোকানো

**Runtime**

- [ ] Resource limit সেট (`--memory`, `--cpus`)
- [ ] Restart policy কনফিগার করা
- [ ] Log stdout/stderr-এ
- [ ] Persistent ডেটার জন্য volume
- [ ] ENV প্রপারভাবে ইনজেক্ট করা
- [ ] Port exposure ন্যূনতম

---

## ✅ Self-check

- [ ] Layer caching-এর ডমিনো এফেক্ট ব্যাখ্যা করতে পারি?
- [ ] Multi-stage build ইমেজ ছোট করে কীভাবে?
- [ ] `CGO_ENABLED=0` কেন `scratch`-এর জন্য দরকার?
- [ ] ENTRYPOINT আর CMD একসাথে কীভাবে কাজ করে?
- [ ] `exec: "./app": no such file or directory` দেখলে প্রথমে কী চেক করবো?

### Key Takeaways

1. **Multi-stage = Must** — প্রোডাকশনে সবসময়
2. **Order Matters** — dependency আগে, source code পরে
3. **Security First** — non-root, no secrets, minimal base
4. **Cache is King** — layer caching বুঝলে build ১০x দ্রুত
5. **Test Locally** — deploy-এর আগে লোকালি চালিয়ে দেখো

**পরের মডিউল:** [মডিউল ৫: Docker Volume](/devops/docker/module-5-volume)

# Dockerfile মাস্টারি: Go অ্যাপ্লিকেশনের জন্য প্রোডাকশন গাইড

---

## 🎯 এই গাইড শেষে তুমি পারবে

- ✅ প্রোডাকশন-রেডি Dockerfile লিখতে
- ✅ ইমেজ সাইজ 800MB থেকে 15MB এ কমাতে
- ✅ সিকিউরিটি বেস্ট প্র্যাকটিস অ্যাপ্লাই করতে
- ✅ বিল্ড টাইম ১০ গুণ দ্রুত করতে
- ✅ প্রোডাকশনে কনফিডেন্টলি ডিপ্লয় করতে

---

## 📚 পার্ট ১: Dockerfile বেসিক কনসেপ্ট

### কি এবং কেন?

| কনসেপ্ট | সহজ ভাষায় | প্রোডাকশনে কেন দরকার |
|---------|-----------|---------------------|
| **Dockerfile** | একটি রেসিপি বুক - ইমেজ তৈরির স্টেপ-বাই-স্টেপ গাইড | রিপ্রোডিউসিবল বিল্ড, ভার্সন কন্ট্রোল |
| **Image** | একটি রেডি-টু-রান প্যাকেজ (সব ডিপেনডেন্সি সহ) | একবার বিল্ড, যেকোনো জায়গায় রান |
| **Layer** | প্রতিটি ইন্সট্রাকশন একটি লেয়ার তৈরি করে | ক্যাশিং, দ্রুত বিল্ড, ছোট সাইজ |
| **Multi-stage** | বিল্ড ও রানটাইম আলাদা করা | ছোট, নিরাপদ, প্রোডাকশন-রেডি ইমেজ |

> **💡 টিপ:** Dockerfile হলো তোমার অ্যাপের ব্লুপ্রিন্ট। এটা একবার ভালো করে লিখলে, প্রোডাকশনে ৯০% সমস্যা এড়াতে পারবে।

---

## 📝 Dockerfile ইন্সট্রাকশন (সিনিয়র লেভেল)

### ১. FROM - বেস ইমেজ সিলেকশন

| ইমেজ টাইপ | সাইজ | কখন ব্যবহার করবে | প্রোডাকশন |
|-----------|------|-------------------|-----------|
| `golang:1.21` | ~800MB | ডেভেলপমেন্ট, টেস্টিং | ❌ বড় সাইজ |
| `golang:1.21-alpine` | ~300MB | বিল্ড স্টেজ | ✅ ভালো |
| `alpine:3.19` | ~7MB | রানটাইম স্টেজ | ✅ সেরা |
| `scratch` | 0MB | স্ট্যাটিক বাইনারি | ✅ মিনিমাল |

**প্রোডাকশন প্যাটার্ন:**

```dockerfile
# ❌ খারাপ - বিশাল ইমেজ
FROM golang:1.21

# ✅ ভালো - বিল্ডের জন্য alpine
FROM golang:1.21-alpine AS builder

# ✅ সেরা - রানটাইমের জন্য scratch/alpine
FROM scratch
# অথবা
FROM alpine:3.19
```

---

### ২. WORKDIR - কাজের ডিরেক্টরি

```dockerfile
# ❌ খারাপ - root এ কাজ করা
COPY . /
RUN go build

# ✅ ভালো - ডেডিকেটেড ডিরেক্টরি
# ডিরেক্টরি তৈরি । পরবর্তী সব কমান্ড (যেমন COPY, RUN) এই ফোল্ডারের ভেতরেই এক্সিকিউট বা রান হয়।
# এটি অনেকটা লিনাক্সের cd (change directory) কমান্ডের মতো।
WORKDIR /app
COPY . .
RUN go build
```

> **⚠️ সতর্কতা:** সবসময় WORKDIR ব্যবহার করো। এটা ফাইল অর্গানাইজেশন এবং সিকিউরিটির জন্য জরুরি।

---

### ৩. COPY vs ADD - ফাইল কপি করা

| কমান্ড | কি করে | কখন ব্যবহার | প্রোডাকশন রেকমেন্ডেশন |
|--------|--------|-------------|---------------------|
| `COPY` | শুধু ফাইল কপি করে | ৯৫% সময় | ✅ সবসময় এটা ব্যবহার করো |
| `ADD` | ফাইল কপি + URL ডাউনলোড + tar এক্সট্র্যাক্ট | বিশেষ ক্ষেত্রে | ⚠️ এড়িয়ে চলো |

- COPY Source Destination
- /test/ means its a folder (ends with /)

**প্রোডাকশন প্যাটার্ন:**

```dockerfile
# ✅ ভালো - COPY ব্যবহার
COPY go.mod go.sum ./
COPY main.go .

# ❌ খারাপ - ADD ব্যবহার (যদি না দরকার হয়)
ADD https://example.com/file.tar.gz .

# ✅ ভালো - নির্দিষ্ট ফাইল কপি (সব কিছু না)
COPY cmd/ ./cmd/
COPY internal/ ./internal/
```

---

### ৪. RUN - কমান্ড এক্সিকিউট করা

**লেয়ার অপটিমাইজেশন:**

```dockerfile
# ❌ খারাপ - অনেক লেয়ার (স্লো বিল্ড)
RUN apk add --no-cache ca-certificates
RUN apk add --no-cache tzdata
RUN apk add --no-cache curl

# ✅ ভালো - এক লেয়ার (দ্রুত বিল্ড)
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl

# ✅ সেরা - ক্লিনআপ সহ
RUN apk add --no-cache ca-certificates tzdata && \
    rm -rf /var/cache/apk/*
```

> **💡 টিপ:** একাধিক `RUN` কমান্ড একসাথে করো (`&&` দিয়ে)। এতে লেয়ার কম হবে, ইমেজ ছোট হবে।

---

### ৫. Docker ENTRYPOINT & CMD

<details>
    <summary>ENTRYPOINT & CMD</summary>

### 1️⃣ ENTRYPOINT — Container এর Main Program

### কী?

**ENTRYPOINT** container-কে একটি executable program এর মতো বানায়।

```dockerfile
ENTRYPOINT ["./app"]
```

👉 অর্থ: container start হলেই `./app` রান করবে

---

### কেন ENTRYPOINT ব্যবহার করবো?

- Main process fixed রাখতে
- Accidental override ঠেকাতে
- Production backend / worker / cron এর জন্য

📌 **Production Go backend = ENTRYPOINT mandatory**

---

### ENTRYPOINT কিভাবে কাজ করে (Breakdown)

```dockerfile
WORKDIR /app
ENTRYPOINT ["./app"]
```

| অংশ   | অর্থ                        |
| ----- | --------------------------- |
| `.`   | বর্তমান directory (WORKDIR) |
| `/`   | এর ভেতরে                    |
| `app` | Go build করা binary         |

➡️ "WORKDIR এর ভেতরের app নামের executable চালাও"

---

### Argument behavior (🔥 খুব গুরুত্বপূর্ণ)

```bash
docker run my-image --help
```

Docker internally চালায়:

```bash
./app --help
```

👉 `app` replace হয় না
👉 `--help` শুধু argument হিসেবে যুক্ত হয়

---

## 2️⃣ Build Command & ENTRYPOINT — MUST MATCH

### Golden Rule

> ENTRYPOINT এ যে নাম দিবে, **ঠিক সেই নামেই binary build হতে হবে**

### ✅ Correct examples

```dockerfile
RUN go build -o app
ENTRYPOINT ["./app"]
```

```dockerfile
RUN go build -o my-server
ENTRYPOINT ["./my-server"]
```

```dockerfile
RUN go build -o main
ENTRYPOINT ["./main"]
```

---

### ❌ Common Mistake (Beginner Trap)

```dockerfile
RUN go build
ENTRYPOINT ["./app"]
```

⚠️ কারণ:

- `go build` default binary বানায় module name অনুযায়ী
- `app` নামে file তৈরি হয়নি

📛 Error:

```
exec: "./app": no such file or directory
```

---

## 3️⃣ CMD — Default Argument Provider

### কী?

**CMD** main command না, বরং **default argument** দেয়।

```dockerfile
CMD ["--port=8080"]
```

---

### CMD override behavior

```bash
docker run my-image --port=9090
```

👉 CMD replace হয়ে যাবে

---

## 4️⃣ ENTRYPOINT vs CMD (One-glance Table)

| বিষয়               | ENTRYPOINT   | CMD             |
| ------------------ | ------------ | --------------- |
| Role               | Main process | Default args    |
| Override           | ❌ Hard       | ✅ Easy          |
| Production backend | ✅ YES        | ⚠️ Limited      |
| Best use           | API / worker | Flags / options |

---

## 5️⃣ ENTRYPOINT + CMD (Best Practice Combo)

### Recommended pattern

```dockerfile
ENTRYPOINT ["./app"]
CMD ["--port=8080"]
```

### Behavior

```bash
docker run my-image
# runs: ./app --port=8080

 docker run my-image --port=9090
# runs: ./app --port=9090
```

👉 Main process fixed
👉 Args flexible

---

## 6️⃣ Production-grade Go Dockerfile (Minimal & Safe)

```dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o app

FROM alpine
WORKDIR /app
COPY --from=builder /app/app .
ENTRYPOINT ["./app"]
```

---

## 7️⃣ Real Production Bugs (ENTRYPOINT related)

### 🐞 Bug 1: Container exits immediately

- ENTRYPOINT missing
- CMD only used

### 🐞 Bug 2: Cannot override config

- Everything hardcoded in ENTRYPOINT

### 🐞 Bug 3: "no such file or directory"

- Binary name mismatch
- Wrong WORKDIR

---

## 8️⃣ Debug Checklist (3 AM ready)

- `docker inspect <container>`
- Check `Config.Entrypoint`
- Check `WorkingDir`
- `ls -l` inside container
- Verify binary exists & executable

---

## 9️⃣ Interview-ready Q&A

**Q1:** ENTRYPOINT আর CMD পার্থক্য কী?

> ENTRYPOINT main process, CMD default argument

**Q2:** Production backend-এ কোনটা ব্যবহার করবে?

> ENTRYPOINT + CMD

**Q3:** `docker run image bash` কাজ করে না কেন?

> ENTRYPOINT override হয় না

**Q4:** Binary mismatch error কেন হয়?

> go build output name আর ENTRYPOINT আলাদা

---

## 🔟 Mental Model (Final)

> 🧠 Container = OS না
> 🧠 Container = Program
> 🧠 ENTRYPOINT = program start

---

## ✅ Final Rules (Memorize)

- ENTRYPOINT = main executable
- Binary name must match
- CMD = optional args
- Production backend = ENTRYPOINT mandatory

---

📌 **Keep this file. This alone will save hours of debugging.**

</details>

---

### ৬. ENV - Environment Variables

```dockerfile
# ✅ বিল্ড টাইম কনফিগ
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

# ✅ রানটাইম কনফিগ
ENV APP_ENV=production \
    LOG_LEVEL=info \
    PORT=8080

# 💡 মেন্টর টিপ: সেন্সিটিভ ডাটা ENV এ রাখো না!
# ❌ এভাবে করো না:
ENV DB_PASSWORD=secret123

# ✅ এভাবে করো:
# docker run --env-file .env myapp
```

---

### ৭. EXPOSE - পোর্ট ডকুমেন্টেশন

```dockerfile
# ডকুমেন্টেশনের জন্য (সিকিউরিটি না!)
EXPOSE 8080

# 💡 নোট: এটা শুধু ডকুমেন্টেশন, আসলে পোর্ট open করে না
# পোর্ট open করতে: docker run -p 8080:8080 myapp
```

---

### ৮. USER - Non-root User (সিকিউরিটি!)

```dockerfile
# ❌ খারাপ - root হিসেবে রান (সিকিউরিটি রিস্ক)
# (কিছু না লিখলে ডিফল্ট root)

# ✅ ভালো - non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

USER appuser

# ✅ সেরা - ownership সহ
COPY --chown=appuser:appgroup ./app .
USER appuser
```

> **🔒 সিকিউরিটি:** প্রোডাকশনে কখনো root হিসেবে অ্যাপ রান করো না! এটা ইন্ডাস্ট্রি স্ট্যান্ডার্ড।

---

### ৯. HEALTHCHECK - হেলথ মনিটরিং

```dockerfile
# ✅ HTTP endpoint check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# ✅ Custom script
COPY healthcheck.sh /usr/local/bin/
HEALTHCHECK CMD /usr/local/bin/healthcheck.sh
```

---

## 🏗️ পার্ট ২: Layer Caching & Optimization

### 🎮 সহজ কনসেপ্ট: "ভিডিও গেম সেভ পয়েন্ট"

ডকার ক্যাশকে আপনি ভিডিও গেমের **"সেভ পয়েন্ট" (Save Point)** মনে করতে পারেন।

* ডকার ইমেজের প্রতিটি লাইন (`COPY`, `RUN`) একেকটি লেভেল বা স্টেজ।
* বিল্ড করার সময় ডকার চেক করে: **"আগের বার আর এবারের ইনপুট কি হুবহু এক?"**
* যদি **এক** হয়: সে কাজটি আর করে না। সেভ করা রেজাল্ট ব্যবহার করে (**Cache Hit** ✅)।
* যদি **ভিন্ন** হয়: সে নতুন করে কাজটি করে (**Cache Miss** ❌)।



### ⚠️ সমস্যা: "ডমিনো এফেক্ট" (Domino Effect)

সবচেয়ে গুরুত্বপূর্ণ নিয়ম হলো: **একবার যদি কোনো একটি ধাপে ক্যাশ ভেঙে যায় (Cache Miss), তবে তার পরের সব ধাপের ক্যাশ বাতিল হয়ে যাবে এবং নতুন করে রান হবে।**

### অর্ডার অপটিমাইজেশন (Practical Example)

ধরুন, আপনি `main.go` ফাইলে মাত্র **এক লাইন কোড** পরিবর্তন করেছেন। এখন দেখুন দুই অর্ডারে কী ঘটে:

#### ❌ ১. খারাপ অর্ডার (সবসময় পুরো Rebuild)

এখানে সোর্স কোড (`COPY . .`) শুরুতে থাকায়, কোড বদলানোর সাথে সাথে ক্যাশ ভেঙে যায়। ফলে লাইব্রেরিগুলো অকারণে আবার ডাউনলোড হয়।

```dockerfile
FROM golang:1.21-alpine

# ১. কোড কপি (যেহেতু কোড বদলেছে, এখানে Cache Miss ❌)
COPY . .

# ২. মডিউল ডাউনলোড (আগের ধাপ নতুন করে হয়েছে, তাই ডমিনো এফেক্টে এটাও নতুন করে হবে ⚠️)
RUN go mod download  # ← সমস্যা: ৫ মিনিট সময় নষ্ট!

# ৩. বিল্ড
RUN go build -o app .

```

#### ✅ ২. ভালো অর্ডার (স্মার্ট ক্যাশিং)

এখানে আমরা কম পরিবর্তন হওয়া জিনিস (`go.mod`) আগে রেখেছি।

```dockerfile
FROM golang:1.21-alpine
WORKDIR /app

# ১. ডিপেন্ডেন্সি ফাইল কপি (ফাইলে হাত দেইনি, তাই Cache Hit ✅)
COPY go.mod go.sum ./

# ২. মডিউল ডাউনলোড (আগের ধাপ ক্যাশড, তাই এটাও ক্যাশ থেকে আসবে ✅)
RUN go mod download  # ← সুবিধা: ডাউনলোড স্কিপ করবে, ০ সেকেন্ড লাগবে!

# ৩. সোর্স কোড কপি (এখানে এসে দেখবে কোড বদলেছে, এখান থেকে নতুন কাজ শুরু)
COPY . .
RUN go build -o app .

```

---

### 📊 কেন এটা জরুরি? (তুলনামূলক চিত্র)

**দৃশ্যপট:** আপনি কোডে মাত্র ১টি লাইন পরিবর্তন করে আবার বিল্ড দিলেন।

| ধাপ | খারাপ অর্ডার ❌ | ভালো অর্ডার ✅ |
| --- | --- | --- |
| **ডিপেন্ডেন্সি ডাউনলোড** | আবার পুরোটা ডাউনলোড করবে (কারণ আগের ধাপ ভেঙেছে) | **স্কিপ করবে** (ক্যাশ ব্যবহার করবে) |
| **সময় লাগবে** | ২-৫ মিনিট (ইন্টারনেট স্পিডের ওপর নির্ভরশীল) | **১০ সেকেন্ড** (শুধুমাত্র কম্পাইল টাইম) |
| **ব্যান্ডউইথ** | ৫০০ MB নষ্ট | ০ MB |

> **⚡ গোল্ডেন রুল:**
> ডকারফাইলে যেই জিনিসগুলো **কম পরিবর্তন হয় (যেমন go.mod)** সেগুলোকে **উপরে** রাখুন। আর যেই জিনিসগুলো **বেশি পরিবর্তন হয় (যেমন source code)** সেগুলোকে **নিচে** রাখুন।

---

## 🚀 পার্ট ৩: Multi-Stage Build (প্রোডাকশন মাস্ট!)

### 🍳 সহজ কনসেপ্ট: "রান্নাঘর বনাম ডাইনিং টেবিল"

মাল্টি-স্টেপ বিল্ডকে আপনি **রান্না (Cooking) বনাম পরিবেশন (Serving)** এর সাথে তুলনা করতে পারেন।

১. **Stage 1 (Builder - রান্নাঘর):** রান্না করার জন্য আপনার হাড়ি-পাতিল, বটি, মশলা, এবং আগুনের দরকার হয় (Go Compiler, Git, SDK)। রান্না শেষ হয়ে গেলে এই ভারী জিনিসগুলোর আর দরকার নেই।

২. **Stage 2 (Production - ডাইনিং টেবিল):** খাবার টেবিলে আপনি শুধুই **তৈরি খাবারটি** (Binary) পরিবেশন করেন। সেখানে নোংরা হাড়ি-পাতিল বা বটি আনা হয় না।

**ফলাফল:** আমরা রান্নাঘর (800MB) ফেলে দিয়ে শুধু খাবারের প্লেট (15MB) নিয়ে কাস্টমারের (Production) কাছে যাই।

### 📊 Single-Stage vs Multi-Stage

| ফিচার | Single-Stage | Multi-Stage | প্রোডাকশন |
| --- | --- | --- | --- |
| **ইমেজ সাইজ** | **800MB+** (সব টুলস সহ) | **15-30MB** (শুধু অ্যাপ) | ✅ Multi-stage |
| **বিল্ড টুলস** | কম্পাইলার প্রোডাকশনে যায় (রিস্কি) | সব ফেলে দেওয়া হয় | ✅ Multi-stage |
| **সিকিউরিটি** | কম (হ্যাকাররা টুলস পায়) | বেশি (কোনো টুলস নেই) | ✅ Multi-stage |
| **পারফরম্যান্স** | স্লো ডেপ্লয়মেন্ট | সুপার ফাস্ট ডেপ্লয়মেন্ট | ✅ Multi-stage |

---

### 🛠️ প্রোডাকশন-রেডি Multi-Stage Dockerfile

নিচের ডকারফাইলটি অত্যন্ত অপ্টিমাইজড এবং সিকিউর। প্রতিটি ফ্ল্যাগ কেন ব্যবহার করা হয়েছে তা নিচে ব্যাখ্যা করা হলো।

```dockerfile
# ============================================
# Stage 1: The Builder (রান্নাঘর) 🍳
# ============================================
FROM golang:1.21-alpine AS builder

# Git এবং অন্যান্য টুলস ইন্সটল (শুধু বিল্ডের জন্য দরকার)
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /build

# ১. স্মার্ট ক্যাশিং: আগে go.mod কপি করছি যাতে বারবার ডাউনলোড না হয়
COPY go.mod go.sum ./
RUN go mod download
RUN go mod verify

# ২. সোর্স কোড কপি
COPY . .

# ৩. সুপার অপ্টিমাইজড বিল্ড (ব্যাখ্যা নিচে দেখুন)
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s -extldflags "-static"' \
    -a \
    -o /build/app \
    ./cmd/server

# ============================================
# Stage 2: Production (ডাইনিং টেবিল) 🍽️
# ============================================
FROM alpine:3.19

# রানটাইমের জন্য মিনিমাম রিকোয়ারমেন্ট
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl

# ৪. সিকিউরিটি: রুট ইউজার বাদ দিয়ে সাধারণ ইউজার তৈরি
RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

# ৫. ম্যাজিক কপি: আগের স্টেজ থেকে শুধু বাইনারিটা নিয়ে আসা
COPY --from=builder --chown=appuser:appgroup /build/app .

# কনফিগারেশন ফাইল (যদি লাগে)
# COPY --chown=appuser:appgroup ./config ./config
# COPY --chown=appuser:appgroup ./migrations ./migrations

# ৬. সাধারণ ইউজারে সুইচ করা (হ্যাক হলেও ক্ষতি কম হবে)
USER appuser

# ৭. হেলথ চেক (কুবারনেটিস বা ডকারের জন্য জরুরি)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

# ৮. সিগন্যাল হ্যান্ডলিং এর জন্য Exec Form
CMD ["./app"]

```

---

### 🔍 কোড ব্রেকডাউন: কেন এই ফ্ল্যাগগুলো ব্যবহার করলাম?

#### ১. বিল্ড অপ্টিমাইজেশন ফ্ল্যাগস (`-ldflags`)

```bash
-ldflags='-w -s'

```

* **`-w`**: ডিবাগিং তথ্য (DWARF) ফেলে দেয়।
* **`-s`**: সিম্বল টেবিল (Symbol Table) ফেলে দেয়।
* **লাভ:** এই দুটি ফ্ল্যাগ ব্যবহার করলে বাইনারি সাইজ **৩০-৪০% কমে যায়**। যেহেতু প্রোডাকশনে আমরা কোড ডিবাগ করব না, তাই এগুলো দরকার নেই।

#### ২. `CGO_ENABLED=0`

* এটি Go-কে বলে কোনো C লাইব্রেরি (libc) ব্যবহার না করতে।
* **লাভ:** এর ফলে একটি **Static Binary** তৈরি হয় যা যেকোনো লিনাক্সে কোনো ডিপেন্ডেন্সি ছাড়াই চলতে পারে (এমনকি `scratch` বা খালি ইমেজেও)।

#### ৩. সিকিউরিটি: `USER appuser`

* ডিফল্টভাবে ডকার কন্টেইনার **root** হিসেবে চলে। এটা খুব বিপজ্জনক। যদি হ্যাকার আপনার অ্যাপ হ্যাক করে, সে পুরো কন্টেইনারের কন্ট্রোল পেয়ে যাবে।
* **সমাধান:** আমরা `appuser` নামে একটি দুর্বল ইউজার তৈরি করেছি। হ্যাকার ঢুকলেও সে সিস্টেমের কোনো ক্ষতি করতে পারবে না।

#### ৪. `COPY --from=builder`

* এটিই মাল্টি-স্টেজের আসল জাদু। আমরা `builder` স্টেজ থেকে শুধু `/build/app` ফাইলটি কপি করে এনেছি। বাকি সব সোর্স কোড, গিট ফোল্ডার, কম্পাইলার—সব আগের স্টেজে ধ্বংস হয়ে গেছে।

## 🔐 পার্ট ৪: Security Best Practices

### Security Checklist

- [ ] Non-root user ব্যবহার করেছো
- [ ] Official base image ব্যবহার করেছো
- [ ] Multi-stage build করেছো
- [ ] Secret embed করো নি
- [ ] Latest tag ব্যবহার করো নি
- [ ] Minimal dependencies install করেছো
- [ ] .dockerignore ফাইল আছে

### সিকিউর Dockerfile প্যাটার্ন

```dockerfile
# ✅ Specific version (not latest)
FROM golang:1.21-alpine AS builder

# ✅ Verify checksums
RUN go mod verify

# ✅ No secrets in image
# ❌ করো না: COPY .env .
# ✅ করো: docker run --env-file .env myapp

# ✅ Minimal runtime
FROM alpine:3.19
# FROM scratch  # আরও secure, কিন্তু debugging কঠিন

# ✅ Non-root user
USER appuser

# ✅ Read-only filesystem (optional)
# docker run --read-only --tmpfs /tmp myapp
```

---

## 📦 পার্ট ৫: .dockerignore (Must Have!)

### কেন দরকার?

| সমস্যা | সমাধান | ফলাফল |
|--------|--------|-------|
| বিশাল context size | .dockerignore | দ্রুত build |
| Secrets leak | .dockerignore | নিরাপদ image |
| Cache invalidation | .dockerignore | ভালো caching |

### প্রোডাকশন .dockerignore

```
# Git files
.git
.gitignore
.gitattributes

# Development files
.vscode
.idea
*.swp
*.swo
*~

# Documentation
README.md
docs/
*.md

# Test files
*_test.go
**/*_test.go
testdata/

# Build artifacts
bin/
dist/
build/
*.exe

# Dependencies (will be downloaded in container)
vendor/

# Environment files
.env
.env.*
*.env

# CI/CD files
.github/
.gitlab-ci.yml
Jenkinsfile

# Docker files
Dockerfile*
docker-compose*.yml
.dockerignore

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/
*.tmp
```

---

## 🎯 পার্ট ৬: সম্পূর্ণ Real-World Example

### Project Structure

```
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

### Production-Ready Dockerfile

```dockerfile
# ============================================
# Build Arguments
# ============================================
ARG GO_VERSION=1.21
ARG ALPINE_VERSION=3.19

# ============================================
# Stage 1: Dependencies
# ============================================
FROM golang:${GO_VERSION}-alpine AS deps

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy dependency files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# ============================================
# Stage 2: Build
# ============================================
FROM golang:${GO_VERSION}-alpine AS builder

WORKDIR /build

# Copy dependencies from deps stage
COPY --from=deps /go/pkg /go/pkg

# Copy dependency files
COPY go.mod go.sum ./

# Copy source code
COPY cmd/ ./cmd/
COPY internal/ ./internal/
COPY pkg/ ./pkg/

# Build arguments for metadata
ARG VERSION=dev
ARG BUILD_TIME
ARG GIT_COMMIT

# Build with optimizations and metadata
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s \
    -X main.Version=${VERSION} \
    -X main.BuildTime=${BUILD_TIME} \
    -X main.GitCommit=${GIT_COMMIT}" \
    -a \
    -installsuffix cgo \
    -o app \
    ./cmd/server

# Verify binary
RUN chmod +x app && ./app --version || true

# ============================================
# Stage 3: Production
# ============================================
FROM alpine:${ALPINE_VERSION}

# Labels for metadata
LABEL maintainer="your-email@example.com" \
      version="${VERSION}" \
      description="My Go Application"

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    curl \
    && update-ca-certificates

# Set timezone
ENV TZ=Asia/Dhaka

# Create non-root user and group
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Create necessary directories
RUN mkdir -p /app/logs /app/data && \
    chown -R appuser:appgroup /app

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=appuser:appgroup /build/app .

# Copy configuration files (if any)
# COPY --chown=appuser:appgroup ./config ./config
# COPY --chown=appuser:appgroup ./migrations ./migrations

# Create healthcheck script
RUN echo '#!/bin/sh' > /app/healthcheck.sh && \
    echo 'wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1' >> /app/healthcheck.sh && \
    chmod +x /app/healthcheck.sh && \
    chown appuser:appgroup /app/healthcheck.sh

# Switch to non-root user
USER appuser

# Environment variables
ENV APP_ENV=production \
    LOG_LEVEL=info \
    PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD /app/healthcheck.sh

# Expose port
EXPOSE 8080

# Run application
ENTRYPOINT ["./app"]
CMD ["serve"]
```

### Build & Run Commands

```bash
# Build with metadata
docker build \
  --build-arg VERSION=1.0.0 \
  --build-arg BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S') \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  -t myapp:1.0.0 \
  -t myapp:latest \
  .

# Run in production mode
docker run -d \
  --name myapp \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DATABASE_URL=${DATABASE_URL} \
  -e JWT_SECRET=${JWT_SECRET} \
  --memory 512m \
  --cpus 1 \
  -v $(pwd)/logs:/app/logs \
  myapp:1.0.0

# Check logs
docker logs -f myapp

# Check health
docker inspect --format='{{.State.Health.Status}}' myapp
```

---

## 🧪 পার্ট ৭: Build Optimization Techniques

### ১. Build Cache Optimization

```dockerfile
# ❌ খারাপ - Cache invalidated easily
COPY . .
RUN go build

# ✅ ভালো - Smart caching
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build
```

### ২. Layer Merging

```dockerfile
# ❌ খারাপ - অনেক layers
RUN apk add curl
RUN apk add git
RUN apk add ca-certificates
RUN rm -rf /var/cache/apk/*

# ✅ ভালো - এক layer
RUN apk add --no-cache curl git ca-certificates
```

### ৩. BuildKit Features (Modern Docker)

```dockerfile
# Enable BuildKit
# export DOCKER_BUILDKIT=1

# Cache mount (dependencies)
RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Bind mount (go build cache)
RUN --mount=type=cache,target=/root/.cache/go-build \
    --mount=type=cache,target=/go/pkg/mod \
    go build -o app .
```

---

## 📊 পার্ট ৮: Image Size Comparison

### Before Optimization

```dockerfile
FROM golang:1.21
WORKDIR /app
COPY . .
RUN go build -o app .
CMD ["./app"]
```

**Result:** 850MB 😱

### After Basic Optimization

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o app .

FROM alpine:3.19
COPY --from=builder /app/app .
CMD ["./app"]
```

**Result:** 25MB 🎉

### After Full Optimization

```dockerfile
FROM golang:1.21-alpine AS builder
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

**Result:** 8-15MB 🚀

---

## ⚠️ পার্ট ৯: Common Mistakes (এড়িয়ে চলো!)

### ১. Using Latest Tag

```dockerfile
# ❌ খারাপ - unpredictable builds
FROM golang:latest
FROM alpine:latest

# ✅ ভালো - specific versions
FROM golang:1.21-alpine
FROM alpine:3.19
```

### ২. Installing Unnecessary Packages

```dockerfile
# ❌ খারাপ - অপ্রয়োজনীয় tools
RUN apk add vim nano htop bash zsh

# ✅ ভালো - শুধু যা দরকার
RUN apk add --no-cache ca-certificates
```

### ৩. Copying Everything

```dockerfile
# ❌ খারাপ - সব কিছু copy
COPY . .

# ✅ ভালো - শুধু যা দরকার + .dockerignore
COPY go.mod go.sum ./
COPY cmd/ ./cmd/
COPY internal/ ./internal/
```

### ৪. Running as Root

```dockerfile
# ❌ খারাপ - root user (security risk)
# (no USER specified)

# ✅ ভালো - non-root user
USER appuser
```

### ৫. Not Using .dockerignore

```
# ❌ খারাপ - no .dockerignore
# Result: .git, node_modules, etc. copied

# ✅ ভালো - proper .dockerignore
# Result: fast, clean build
```

---

## 📋 Production Deployment Checklist

### Pre-Deployment

- [ ] Multi-stage build ব্যবহার করেছো
- [ ] Non-root user সেট করেছো
- [ ] .dockerignore ফাইল তৈরি করেছো
- [ ] Health check add করেছো
- [ ] Specific version tags ব্যবহার করেছো
- [ ] Secret embed করো নি
- [ ] Image scan করেছো (security vulnerabilities)
- [ ] Image size optimize করেছো

### Build Time

- [ ] Dependency caching সঠিক
- [ ] Layer অর্ডার optimize করা
- [ ] Build arguments documented
- [ ] Version metadata included

### Runtime

- [ ] Resource limits set (`--memory`, `--cpus`)
- [ ] Restart policy configured
- [ ] Logging setup করা
- [ ] Volumes for persistent data
- [ ] Environment variables প্রপার
- [ ] Port exposure minimal

---

### Key Takeaways (মনে রাখো)

1. **Multi-stage = Must** - প্রোডাকশনে সবসময় multi-stage build
2. **Order Matters** - Dependencies আগে, source code পরে
3. **Security First** - Non-root user, no secrets, minimal base
4. **Cache is King** - Layer caching বুঝলে build ১০x দ্রুত
5. **Test Locally** - প্রোডাকশনে deploy করার আগে locally test করো

## 🛠️ পার্ট ১০: Simple Go HTTP Server Example

### main.go

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
    // Create HTTP server
    mux := http.NewServeMux()
    
    // Root handler
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello from Docker! 🐳\n")
    })
    
    // Health check endpoint
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        fmt.Fprintf(w, `{"status":"healthy"}`)
    })
    
    server := &http.Server{
        Addr:    ":8080",
        Handler: mux,
    }
    
    // Channel for graceful shutdown
    stop := make(chan os.Signal, 1)
    signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
    
    // Start server in goroutine
    go func() {
        log.Println("Server starting on :8080")
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()
    
    // Wait for signal
    <-stop
    log.Println("Shutting down gracefully...")
    
    // Shutdown with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()
    
    if err := server.Shutdown(ctx); err != nil {
        log.Printf("Shutdown error: %v", err)
    }
    
    log.Println("Server stopped")
}
```

### go.mod

```go
module myapp

go 1.21
```

### Dockerfile (Production Ready)

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /build

# Copy dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o app .

# Production stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata

RUN addgroup -g 1001 appgroup && \
    adduser -D -u 1001 -G appgroup appuser

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /build/app .

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

EXPOSE 8080

CMD ["./app"]
```

### Build & Test

```bash
# Build
docker build -t myapp:latest .

# Run
docker run -d -p 8080:8080 --name myapp myapp:latest

# Test
curl http://localhost:8080
curl http://localhost:8080/health

# Check health
docker inspect --format='{{.State.Health.Status}}' myapp

# View logs
docker logs -f myapp

# Stop (graceful)
docker stop myapp

# Remove
docker rm myapp
```

---

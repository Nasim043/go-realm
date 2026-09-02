# মডিউল ২: Image ও Container হাতে-কলমে

> **এই মডিউলের লক্ষ্য:** নিজে Dockerfile লেখার আগেই রেডিমেড ইমেজ দিয়ে কাজ চালানো শেখা — run, inspect, logs, exec, cleanup। এই কমান্ডগুলোই প্রোডাকশনে ৮০% সময় ব্যবহার হয়।

**সময়:** ~৪৫ মিনিট | **আগে দরকার:** [মডিউল ১](/devops/docker/module-1-foundation)

---

## এই মডিউল শেষে তুমি পারবে

| Skill | মানে কী |
| --- | --- |
| Image ব্যবস্থাপনা | pull, tag, list, history, remove |
| Container চালানো | `-d`, `-p`, `--name`, `-e`, `--rm` আত্মবিশ্বাসের সাথে ব্যবহার |
| Observability | logs, exec, inspect, stats দিয়ে অবস্থা বোঝা |
| Cleanup | ডিস্ক ভরে যাওয়া থেকে VPS বাঁচানো |

---

## ১. Image: কী দিয়ে তৈরি?

একটি image হলো **read-only layer-এর স্তূপ**। Container চালু হলে তার উপরে একটা পাতলা **writable layer** বসে।

```text
   Container (চলন্ত)
   ┌─────────────────────────────┐
   │  Writable layer  ← container remove হলে এটাই মুছে যায়
   ├─────────────────────────────┤
   │  Layer 3: COPY app .        │ ┐
   │  Layer 2: RUN apk add ...   │ ├─ Image (read-only, শেয়ার্ড)
   │  Layer 1: FROM alpine:3.19  │ ┘
   └─────────────────────────────┘
```

এই কারণে:

- একই base image ব্যবহার করা ১০টা অ্যাপ ডিস্কে base layer **একবারই** রাখে।
- Container-এর ভেতরে লেখা ডেটা image-এ যায় না — writable layer-এ থাকে, আর container মুছলে শেষ।
- Layer order বদলালে build cache ভাঙে (মডিউল ৪-এ বিস্তারিত)।

```bash
# ইমেজের layer গুলো দেখো
docker history nginx:1.27-alpine

# ইমেজের পূর্ণ metadata (ENTRYPOINT, ENV, ExposedPorts)
docker inspect nginx:1.27-alpine
```

---

## ২. Tag: version-ই তোমার rollback

```text
myapp:1.4.2   ← immutable, প্রোডাকশনে এটাই deploy করবে
myapp:latest  ← শুধু সুবিধার জন্য, প্রোডাকশনে ভরসা করো না
```

| Tag প্যাটার্ন | কখন | কেন |
| --- | --- | --- |
| `myapp:1.4.2` | প্রোডাকশন deploy | কোন কোড চলছে জানা যায়, rollback সহজ |
| `myapp:<git-sha>` | CI build | কমিটের সাথে ১:১ ম্যাপিং |
| `myapp:latest` | লোকাল dev | মানে "সর্বশেষ push", নির্দিষ্ট কিছু না |

```bash
docker build -t myapp:1.4.2 -t myapp:latest .
docker tag myapp:1.4.2 registry.example.com/myapp:1.4.2
docker push registry.example.com/myapp:1.4.2
```

> **⚠️ প্রোডাকশন রুল:** `latest` দিয়ে deploy করলে কোন version চলছে তুমি জানো না — মানে rollback-ও করতে পারবে না।

---

## ৩. Image Commands (রেফারেন্স)

| Command | কাজ |
| --- | --- |
| `docker images` | সব image দেখা |
| `docker pull <image>:<tag>` | registry থেকে নামানো |
| `docker build -t <name>:<tag> .` | Dockerfile থেকে build |
| `docker tag <id> <repo>:<tag>` | নতুন নাম/tag দেওয়া |
| `docker push <repo>:<tag>` | registry-তে পাঠানো |
| `docker history <image>` | layer গুলো ও সাইজ |
| `docker inspect <image>` | পূর্ণ metadata |
| `docker rmi <image>` | image মুছে ফেলা |
| `docker image prune -a` | কোনো container ব্যবহার করছে না এমন image মোছা |

---

## ৪. `docker run`: যে ফ্ল্যাগগুলো আসলে দরকার

```bash
docker run -d \
  --name api \                     # নাম দাও, নইলে random নাম মনে রাখতে হবে
  --restart unless-stopped \       # সার্ভার reboot হলেও উঠবে
  -p 127.0.0.1:8080:8080 \         # হোস্ট:কন্টেইনার (localhost-এ বাঁধা = নিরাপদ)
  -e APP_ENV=production \          # environment variable
  --env-file .env \                # অথবা ফাইল থেকে
  -m 512m --cpus 1 \               # resource limit (মডিউল ৩)
  -v api-data:/app/data \          # named volume (মডিউল ৫)
  --network app-net \              # custom network (মডিউল ৬)
  myapp:1.4.2
```

| ফ্ল্যাগ | মানে | ভুলে গেলে যা হয় |
| --- | --- | --- |
| `-d` | background-এ চালানো | terminal আটকে থাকে |
| `--name` | পড়া যায় এমন নাম | `docker ps` থেকে id খুঁজতে হয় |
| `-p host:container` | পোর্ট ম্যাপ | বাইরে থেকে অ্যাপে ঢোকা যায় না |
| `--rm` | exit করলেই container মুছে যাবে | পরীক্ষামূলক container জমতে থাকে |
| `-it` | interactive + TTY | shell-এ কাজ করা যায় না |
| `--restart unless-stopped` | crash/reboot-এ auto start | reboot-এর পর অ্যাপ down |

```bash
# এককালীন কাজ — শেষে নিজেই মুছে যাবে
docker run --rm -it alpine:3.19 sh

# একটা কমান্ড চালিয়ে বেরিয়ে যাওয়া
docker run --rm postgres:16-alpine psql --version
```

---

## ৫. Container Commands (রেফারেন্স)

| Command | কাজ |
| --- | --- |
| `docker ps` / `docker ps -a` | চলমান / সব container |
| `docker run <image>` | image থেকে container চালু |
| `docker start / stop / restart <name>` | চালু / থামানো / রিস্টার্ট |
| `docker logs -f --tail 100 <name>` | লগ দেখা (live) |
| `docker exec -it <name> sh` | ভেতরে ঢুকে কমান্ড চালানো |
| `docker inspect <name>` | পূর্ণ config ও state |
| `docker stats <name>` | live CPU/RAM ব্যবহার |
| `docker top <name>` | ভেতরের প্রসেসগুলো |
| `docker cp <name>:/path ./local` | ফাইল আনা-নেওয়া |
| `docker rm -f <name>` | জোর করে মুছে ফেলা |

---

## ৬. তিনটি ডিবাগ কমান্ড, যা তোমাকে বাঁচাবে

```bash
# ১. কী বলছে অ্যাপ?
docker logs --tail 200 -f api

# ২. ভেতরে আসলে কী আছে?
docker exec -it api sh
  ls -l /app
  env | sort
  wget -qO- localhost:8080/health

# ৩. Docker কী মনে করছে? (আসল config)
docker inspect api --format '{{json .Config}}' | jq
docker inspect api --format '{{.State.Status}} {{.State.ExitCode}}'
```

> **💡 slim image-এ `sh` নেই?** `scratch` বা `distroless` ইমেজে shell থাকে না। তখন debug করতে হয় সাইডকার দিয়ে:
> `docker run --rm -it --pid container:api --network container:api nicolaka/netshoot`

---

## ৭. Cleanup: VPS-এর ডিস্ক বাঁচানো

Docker চুপচাপ ডিস্ক খায় — পুরনো image, বন্ধ container, dangling volume, build cache।

```bash
# কে কত জায়গা নিচ্ছে
docker system df

# নিরাপদ পরিষ্কার (বন্ধ container + dangling image + build cache)
docker container prune
docker image prune

# আক্রমণাত্মক (ব্যবহার না হওয়া সব image-ও যাবে)
docker system prune -a

# ⚠️ volume সহ — ডেটা মুছে যেতে পারে, বুঝে চালাও
docker system prune -a --volumes
```

| কমান্ড | মুছে | ঝুঁকি |
| --- | --- | --- |
| `docker container prune` | বন্ধ container | কম |
| `docker image prune` | dangling image | কম |
| `docker system prune -a` | + ব্যবহারহীন সব image | আবার pull/build করতে হবে |
| `... --volumes` | + ব্যবহারহীন volume | 🔴 **ডেটা হারাতে পারে** |

---

## ৮. Common Mistakes

| ভুল | লক্ষণ | সমাধান |
| --- | --- | --- |
| `-p` ছাড়া run | curl করলে connection refused | `-p 8080:8080` দাও |
| পোর্ট উল্টে লেখা | ভুল সার্ভিসে হিট | মনে রাখো `-p HOST:CONTAINER` |
| `0.0.0.0`-এ DB expose | ইন্টারনেট থেকে DB access | `-p 127.0.0.1:5432:5432` |
| container-এ config edit | restart-এ পরিবর্তন উধাও | ENV বা volume ব্যবহার করো |
| `latest` deploy | কোন version চলছে জানা নেই | version tag ব্যবহার করো |

---

## ✅ Self-check

- [ ] `docker ps` আর `docker ps -a`-র পার্থক্য বলতে পারি?
- [ ] Container-এর ভেতরে ফাইল লিখলে সেটা image-এ যায় কি?
- [ ] অ্যাপ চলছে না — প্রথম তিনটি কমান্ড কী চালাবো?
- [ ] `-p 127.0.0.1:5432:5432` কেন `-p 5432:5432` থেকে নিরাপদ?
- [ ] `docker system prune -a --volumes` কেন বিপজ্জনক?

**পরের মডিউল:** [মডিউল ৩: Container = Linux Process](/devops/docker/module-3-container-runtime)

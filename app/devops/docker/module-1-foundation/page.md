# মডিউল ১: Docker Foundation — কেন, কী, কীভাবে

> **এই মডিউলের লক্ষ্য:** কমান্ড মুখস্থ করা নয়। Docker আসলে কোন সমস্যা সমাধান করে এবং ভেতরে কী ঘটে — সেই mental model তৈরি করা।

**সময়:** ~৩০ মিনিট

---

## এই মডিউল শেষে তুমি পারবে

| Skill | মানে কী |
| --- | --- |
| সমস্যা ব্যাখ্যা | Docker ছাড়া VPS deploy-এ কী কী ভাঙে, বলতে পারা |
| VM vs Container | কার্নেল শেয়ারিং দিয়ে পার্থক্য ব্যাখ্যা করা |
| Image vs Container | কোনটা template, কোনটা process — গুলিয়ে না ফেলা |
| Architecture | `docker run` লিখলে কে কার সাথে কথা বলে, বলতে পারা |
| Lifecycle | Build → Ship → Run → Manage → Destroy চেনা |

---

## ১. আসল সমস্যাটা কী?

তুমি লোকাল মেশিনে Go অ্যাপ লিখলে, চলল। VPS-এ তুলে দিলে — ভাঙল।

```text
Laptop                          VPS
──────                          ───
Go 1.24                         Go 1.19
libc 2.39                       libc 2.31
Postgres 16                     Postgres 13
ENV: .env file                  ENV: নেই
                                 │
                                 ▼
                        "কিন্তু আমার মেশিনে তো চলে!"
```

| সমস্যা | Docker ছাড়া | Docker দিয়ে |
| --- | --- | --- |
| Dependency version | সার্ভারে ম্যানুয়ালি install/upgrade | ইমেজের ভেতরেই lock করা |
| "আমার মেশিনে চলে" | নিয়মিত ঘটে | ইমেজ একই → behavior একই |
| নতুন সার্ভারে move | আবার পুরো setup | `docker run` — শেষ |
| Rollback | কঠিন, ম্যানুয়াল | আগের image tag চালাও |
| দুই অ্যাপ, দুই version | conflict | আলাদা container, conflict নেই |

### Docker কী সমাধান করে **না** (সৎ কথা)

- Docker তোমার খারাপ কোড ঠিক করবে না। ধীর query Docker-এও ধীর।
- Docker auto-scaling বা self-healing cluster দেয় না — সেটা Kubernetes-এর কাজ।
- Database-এর ডেটা সেফটি Docker দেয় না — সেটা তোমার volume + backup strategy (মডিউল ৫)।
- Container VM-এর মতো পূর্ণ isolation দেয় না — কার্নেল শেয়ার করা হয়।

> **📌 এই কোর্সের স্কোপ:** এক VPS-এ Go + PostgreSQL অ্যাপ confident ভাবে deploy, restart, debug, update করা। ❌ Kubernetes নয়, ❌ cloud complexity নয়।

---

## ২. VM vs Container (কার্নেল স্পেসসহ)

```text
        VIRTUAL MACHINE                        CONTAINER
   ┌──────────┬──────────┐              ┌──────────┬──────────┐
   │  App A   │  App B   │              │  App A   │  App B   │
   ├──────────┼──────────┤              ├──────────┼──────────┤
   │ Guest OS │ Guest OS │  ← ভারী       │ user     │ user     │
   │ + Kernel │ + Kernel │               │ space    │ space    │
   ├──────────┴──────────┤              ├──────────┴──────────┤
   │     Hypervisor      │              │   Docker Engine     │
   ├─────────────────────┤              ├─────────────────────┤
   │      Host OS + Kernel│             │   Host OS + Kernel  │ ← শেয়ার্ড
   └─────────────────────┘              └─────────────────────┘
        GB, মিনিট                            MB, সেকেন্ড
```

| টপিক | Virtual Machine (VM) | Container |
| --- | --- | --- |
| **এটা কী** | কম্পিউটারের ভেতরে আরেকটা পূর্ণ কম্পিউটার। নিজের OS ও কার্নেল চালায়। | ছোট, দ্রুত একটি বক্স — হোস্টের কার্নেল শেয়ার করে অ্যাপ চালায়। |
| **কার্নেল স্পেস** | প্রতিটি VM-এর নিজের আলাদা কার্নেল স্পেস | সব কনটেইনার হোস্টের **একই কার্নেল স্পেস** শেয়ার করে |
| **কীভাবে কাজ করে** | নিজস্ব OS কপি + ভার্চুয়াল হার্ডওয়্যার (hypervisor) | একই কার্নেল, কিন্তু আলাদা user space |
| **স্পিড** | ধীর — পুরো OS বুট হয় | খুব দ্রুত — বুট লাগে না |
| **রিসোর্স** | অনেক RAM/CPU | অনেক কম |
| **OS রিকোয়ারমেন্ট** | ভিন্ন OS চালাতে পারে (Windows on Linux) | হোস্টের মতো একই কার্নেল লাগে (সব Linux-based) |
| **সাইজ** | GB | MB |
| **সিকিউরিটি** | বেশি — কার্নেলসহ পুরো আলাদা | কম — শেয়ার্ড কার্নেল ভাঙলে সবাই ঝুঁকিতে |
| **স্কেলেবিলিটি** | অনেক VM দ্রুত তৈরি করা কঠিন | সেকেন্ডে অনেক container তৈরি/ধ্বংস |
| **টুলস** | VirtualBox, VMware, Hyper-V | Docker, Podman, Kubernetes |
| **কিসের জন্য ভালো** | ফুল OS, ভিন্ন OS টাইপ, লিগেসি সিস্টেম | লাইটওয়েট অ্যাপ ও মাইক্রোসার্ভিস |

> **🧠 এক লাইনে:** VM = আলাদা বাড়ি (নিজের ভিত্তি সহ)। Container = একই বিল্ডিংয়ের আলাদা ফ্ল্যাট (ভিত্তি শেয়ার করা)।

---

## ৩. Image vs Container (সবচেয়ে বেশি গুলিয়ে ফেলা জিনিস)

```text
  Dockerfile  ──build──▶  Image  ──run──▶  Container  ──run──▶ Container
   (রেসিপি)              (প্যাকেট)          (চলন্ত প্রসেস)     (আরেকটা প্রসেস)
                          read-only          এক ইমেজ থেকে অনেক container
```

| Feature | Docker **Image** | Docker **Container** |
| --- | --- | --- |
| Nature | Blueprint / Template | Running instance (একটি Linux process) |
| Mutability | Immutable — বদলানো যায় না, নতুন version = নতুন image | Mutable — ভেতরে লিখলে বদলায় |
| Storage | Registry (Docker Hub, private) | হোস্টের RAM + writable layer |
| Lifecycle | একবার build, বারবার reuse | Start → Stop → Remove |
| Example | `mysql:8.0` | সেই ইমেজ থেকে চলা একটি MySQL instance |

- **Image = রেসিপি** 🍳 → OS layer, তোমার কোড, dependency, ENV — সব প্যাক করা।
- **Container = সেই রেসিপিতে রান্না করা খাবার** 🍲 → একই রেসিপি থেকে ১০ প্লেট বানানো যায়।

> **⚠️ পরিণতি (মনে রাখো):** container remove করলে তার writable layer মুছে যায়। মানে container-এর ভেতরে লেখা ডেটা **হারিয়ে যাবে** — যদি না তুমি volume ব্যবহার করো (মডিউল ৫)।

---

## ৪. Docker Architecture — `docker run` লিখলে কী ঘটে?

Docker একটি **Client–Server Architecture**। তিনটি অংশ:

```text
   ┌──────────────────┐   REST API / UNIX socket   ┌──────────────────────┐
   │  Docker Client   │ ─────────────────────────▶ │   Docker Daemon      │
   │  (docker CLI)    │ ◀───────────────────────── │   (dockerd)          │
   └──────────────────┘        result / logs       │  images, containers, │
                                                   │  networks, volumes   │
                                                   └──────────┬───────────┘
                                                              │ pull / push
                                                              ▼
                                                   ┌──────────────────────┐
                                                   │  Docker Registry     │
                                                   │  (Hub / private)     │
                                                   └──────────────────────┘
```

| উপাদান | কাজ | তোমার জন্য মানে |
| --- | --- | --- |
| **Client (`docker` CLI)** | তোমার কমান্ড daemon-এ পাঠায় | তুমি যা টাইপ করো, সেটা শুধু একটা API call |
| **Daemon (`dockerd`)** | ইমেজ, container, network, volume ম্যানেজ করে | আসল কাজ এখানেই হয়; এটা বন্ধ = docker কাজ করবে না |
| **Registry** | ইমেজের লাইব্রেরি (Docker Hub / private) | `pull` করলে এখান থেকে নামে, `push` করলে এখানে ওঠে |

> **💡 প্রোডাকশন insight:** daemon root হিসেবে চলে। তাই যাকে `docker` কমান্ডের access দিচ্ছ, তাকে কার্যত root access দিচ্ছ।

---

## ৫. Docker Lifecycle — "Build, Ship, Run"

```text
   Dockerfile ──▶ [ BUILD ] ──▶ Image ──▶ [ SHIP ] ──▶ Registry
                                              │
                                              ▼ pull
                                          [ RUN ] ──▶ Container
                                              │
                                   ┌──────────┴──────────┐
                                   ▼                     ▼
                              [ MANAGE ]            [ DESTROY ]
                          stop/start/logs/exec       docker rm
```

| ধাপ | কমান্ড | কী হয় |
| --- | --- | --- |
| **Build** | `docker build` | Dockerfile → পোর্টেবল read-only image |
| **Ship** | `docker push` / `docker pull` | Registry-তে ওঠানো / সার্ভারে নামানো |
| **Run** | `docker run` | Image থেকে isolated container process চালু |
| **Manage** | `docker stop/start/logs/exec/stats` | মনিটর, restart, ডিবাগ |
| **Destroy** | `docker rm` / `docker rmi` | Container ও তার temporary ডেটা মুছে ফেলা |

---

## ৬. হাতে-কলমে: প্রথম ১০ মিনিট

```bash
# ১. Docker ঠিকভাবে বসেছে কিনা
docker version
docker info

# ২. প্রথম container (image না থাকলে নিজেই pull করবে)
docker run hello-world

# ৩. একটা আসল সার্ভার চালাও
docker run -d -p 8080:80 --name web nginx:1.27-alpine
curl http://localhost:8080

# ৪. কী চলছে দেখো
docker ps            # চলমান
docker ps -a         # সব (বন্ধসহ)
docker logs web      # লগ
docker exec -it web sh   # ভেতরে ঢোকো, তারপর: exit

# ৫. পরিষ্কার করো
docker stop web
docker rm web
```

### এখানেই "container = process" প্রমাণ করে দেখো

```bash
docker run -d --name web nginx:1.27-alpine

# হোস্ট থেকেই container-এর প্রসেস দেখা যায়
docker top web
ps aux | grep nginx      # হোস্টেও nginx প্রসেস দেখতে পাবে

docker rm -f web
```

> VM হলে হোস্ট থেকে ভেতরের প্রসেস এভাবে দেখা যেত না। এটাই শেয়ার্ড কার্নেলের প্রমাণ।

---

## ৭. Common Mistakes (শুরুতেই)

| ভুল | কী হয় | ঠিক পথ |
| --- | --- | --- |
| `docker run` বারবার চালানো | প্রতিবার নতুন container জমে | `docker start <name>` বা `--rm` ব্যবহার |
| Container-এর ভেতরে ফাইল লিখে রাখা | `rm` করলেই ডেটা শেষ | Volume (মডিউল ৫) |
| `latest` tag | কাল অন্য version নামবে | `nginx:1.27-alpine` — নির্দিষ্ট version |
| Container-কে VM ভাবা | ভেতরে ssh/systemd বসানোর চেষ্টা | এক container = এক process |

---

## ✅ Self-check (পরের মডিউলে যাওয়ার আগে)

- [ ] VPS-এ "production" বলতে আমি কী বুঝি?
- [ ] Docker ছাড়া VPS-এ অ্যাপ চালালে কী কী সমস্যা হয়?
- [ ] VM আর container-এর মূল পার্থক্য কার্নেল দিয়ে ব্যাখ্যা করতে পারি?
- [ ] Container restart হলে কী reset হয়, কী হয় না?
- [ ] `docker run` লিখলে client, daemon, registry-র মধ্যে কী ঘটে?

**পরের মডিউল:** [মডিউল ২: Image ও Container হাতে-কলমে](/devops/docker/module-2-image-container)

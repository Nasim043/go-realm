# Docker: VPS-এ Go অ্যাপ চালানোর ৮ মডিউলের রোডম্যাপ

এই কোর্স একজন backend developer-এর জন্য, যে Go লেখে এবং **নিজের VPS-এ Docker দিয়ে অ্যাপ deploy, update, debug ও maintain করতে চায়**।

> মুখস্থ নয়। প্রতিটি concept **diagram + table + প্রোডাকশন উদাহরণ** দিয়ে সাজানো, যাতে এক নজরে mental model তৈরি হয়।

❌ Kubernetes নয় ❌ Cloud complexity নয় ✅ Practical + Confident

---

## এক নজরে: Docker কোথায় বসে?

```text
   তোমার কোড                  Image                     VPS
   ┌────────┐   build    ┌──────────────┐   run   ┌──────────────┐
   │ main.go│ ─────────▶ │ myapp:1.4.2  │ ──────▶ │  container    │
   │Dockerfile│          │ (immutable)  │         │ + volume      │
   └────────┘            └──────────────┘         │ + network     │
                              │ push/pull         └──────┬────────┘
                              ▼                          │
                         Registry                   Nginx :443
                                                         │
                                                     Internet
```

---

## কোর্স শেষে তুমি কী পারবে?

| Skill | মানে কী |
| --- | --- |
| Mental model | Container = isolated Linux process — এটা দিয়ে সমস্যা ব্যাখ্যা করা |
| Image build | ৮০০MB → ১৫MB, non-root, cache-friendly Dockerfile |
| Runtime control | limit, restart policy, health check, graceful shutdown |
| ডেটা ও নেটওয়ার্ক | volume দিয়ে ডেটা রক্ষা, network দিয়ে DB লুকানো |
| এক ফাইলে stack | Compose দিয়ে Go + Postgres + Nginx |
| অপারেশন | deploy, rollback, backup, ইনসিডেন্ট ডিবাগিং |

---

## Curriculum

| মডিউল | সময় | ফোকাস | Outcome |
| --- | --- | --- | --- |
| [মডিউল ১](/devops/docker/module-1-foundation) | ৩০ মিনিট | কেন Docker, VM vs Container, architecture, lifecycle | ভয় কেটে mental model তৈরি |
| [মডিউল ২](/devops/docker/module-2-image-container) | ৪৫ মিনিট | image, tag, run flags, logs/exec/inspect, cleanup | রেডিমেড ইমেজ দিয়ে কাজ চালানো |
| [মডিউল ৩](/devops/docker/module-3-container-runtime) | ৬০ মিনিট | PID 1, signal, limit, OOM, restart, health | "container মরল কেন" — উত্তর জানা |
| [মডিউল ৪](/devops/docker/module-4-dockerfile) | ৯০ মিনিট | Dockerfile, ENTRYPOINT/CMD, cache, multi-stage, security | প্রোডাকশন ইমেজ নিজে বানানো |
| [মডিউল ৫](/devops/docker/module-5-volume) | ৬০ মিনিট | named volume, bind mount, tmpfs, backup | ডেটা আর হারাবে না |
| [মডিউল ৬](/devops/docker/module-6-network) | ৬০ মিনিট | bridge, custom network, DNS, isolation | DB ইন্টারনেট থেকে অদৃশ্য |
| [মডিউল ৭](/devops/docker/module-7-compose) | ৬০ মিনিট | Compose দিয়ে পুরো stack, override, update | এক কমান্ডে পুরো stack |
| [মডিউল ৮](/devops/docker/module-8-production) | ৬০ মিনিট | VPS deploy, rollback, backup, incident playbook | আত্মবিশ্বাসে প্রোডাকশন চালানো |

**মোট সময়:** ~৭ ঘণ্টা

---

## শেখার ক্রম কেন এই রকম

```text
[১] Foundation ──▶ [২] Image/Container ──▶ [৩] Runtime (process reality)
                                                    │
                                                    ▼
       [৬] Network ◀── [৫] Volume ◀── [৪] Dockerfile (নিজের image)
            │
            ▼
       [৭] Compose ──▶ [৮] Production Deploy
```

| ধাপ | কেন আগে |
| --- | --- |
| ১ → ২ | কী জিনিস না বুঝলে কমান্ড শুধু মুখস্থ হয় |
| ২ → ৩ | container চালাতে পারলে তবেই "কেন মরল" প্রশ্নের মানে হয় |
| ৩ → ৪ | PID 1 ও signal বুঝলে ENTRYPOINT/CMD নিজে থেকেই পরিষ্কার হয় |
| ৪ → ৫ | নিজের image চললে তার পরের প্রশ্নই হলো — ডেটা কোথায় থাকবে |
| ৫ → ৬ | ডেটা টিকলে এবার একাধিক সার্ভিস জোড়া লাগানো |
| ৬ → ৭ | হাতে যা করেছো, Compose সেটাই ফাইলে লিখে রাখে |
| ৭ → ৮ | stack দাঁড়ালে তবেই deploy, backup, rollback-এর পালা |

---

## প্রতিটি মডিউলের গঠন

```text
শেখার লক্ষ্য → Diagram → Table → প্রোডাকশন উদাহরণ → Common mistake → Self-check
```

---

## যা যা লাগবে

- একটি Linux VPS (২GB RAM যথেষ্ট) অথবা লোকাল Linux/WSL2
- Docker Engine + compose plugin (`curl -fsSL https://get.docker.com | sh`)
- একটি ছোট Go অ্যাপ (মডিউল ৪-এ পূর্ণ উদাহরণ দেওয়া আছে)

**শুরু করো:** [মডিউল ১: Docker Foundation →](/devops/docker/module-1-foundation)

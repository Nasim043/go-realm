# Docker Architecture & Lifecycle

এই ডকুমেন্টটির মূল উদ্দেশ্য হলো Docker-এর আর্কিটেকচারাল কম্পোনেন্ট এবং একটি কন্টেইনারের লাইফসাইকেল সম্পর্কে স্বচ্ছ ধারণা প্রদান করা।

## 1. Docker Architecture

Docker একটি **Client-Server Architecture** ব্যবহার করে। এর কার্যপদ্ধতি প্রধানত তিনটি মূল উপাদানের উপর ভিত্তি করে গঠিত: Docker Client, Docker Host (Daemon), এবং Docker Registry।

### প্রধান উপাদানসমূহ (Core Components)

#### ১. Docker Client (The CLI)

Docker ব্যবহারকারীদের জন্য এটিই প্রধান ইন্টারফেস। যখন আপনি `docker build`, `docker run`, বা `docker pull`-এর মতো কমান্ড রান করেন, তখন Docker Client সেই কমান্ডটি Docker Daemon-এর কাছে প্রেরণ করে। Client এবং Daemon একে অপরের সাথে **REST API**, **UNIX Sockets**, বা **Network Interface**-এর মাধ্যমে যোগাযোগ করে।

#### ২. Docker Daemon (`dockerd`)

এটি Docker-এর "মস্তিষ্ক" বা সার্ভার সাইড প্রসেস যা হোস্ট অপারেটিং সিস্টেমে ব্যাকগ্রাউন্ডে চলে।

* **দায়িত্ব:** এটি Docker API রিকোয়েস্ট গ্রহণ করে এবং Docker অবজেক্টগুলো (Images, Containers, Networks, Volumes) ম্যানেজ করে।
* **কমিউনিকেশন:** এটি অন্যান্য ডেমন বা ক্লায়েন্টের সাথে যোগাযোগ স্থাপন করতে পারে।

#### ৩. Docker Registry

এটি Docker ইমেজগুলোর স্টোরেজ বা লাইব্রেরি।

* **Docker Hub:** এটি ডিফল্ট পাবলিক রেজিস্ট্রি যেখানে অফিশিয়াল ইমেজগুলো থাকে।
* **Private Registry:** এন্টারপ্রাইজ লেভেলে সিকিউরড ইমেজ রাখার জন্য নিজস্ব প্রাইভেট রেজিস্ট্রি ব্যবহার করা হয়।
* **কাজ:** যখন `docker pull` বা `docker run` কমান্ড দেওয়া হয়, তখন ডেমন প্রয়োজনীয় ইমেজটি এখান থেকেই ডাউনলোড করে।

---

### Docker আর্কিটেকচার Diagram
```
          +--------------------+
          |    Docker Client    |
          | (Command Line Tool) |
          +--------------------+
                    |
                    |  Sends Commands (e.g., run, build)
                    |
          +---------------------+
          |   Docker Daemon     |<---| Runs and Manages Containers |
          | (Server, Docker API)|     +-----------------------------+
          +---------------------+
                    |
                    |  Pulls/Pushes Images
                    |
         +-----------------------+
         | Docker Registry (Hub) |
         |  (Docker Hub, Private) |
         +-----------------------+
```

---

## 2. Docker Lifecycle

Docker লাইফসাইকেল বলতে একটি কন্টেইনার তৈরি থেকে শুরু করে সেটি ধ্বংস (Destroy) হওয়া পর্যন্ত পুরো পরিক্রমাকে বোঝায়। একে সাধারণত **"Build, Ship, and Run"** ওয়ার্কফ্লো বলা হয়।

### লাইফসাইকেলের ধাপসমূহ (Phases)

1. **Build Phase (Image Creation):**
* `Dockerfile` নামক স্ক্রিপ্টের মাধ্যমে সোর্স কোড এবং ডিপেন্ডেন্সিগুলোকে একটি read-only টেমপ্লেট বা **Image**-এ রূপান্তর করা হয়।


2. **Ship/Distribution Phase (Push/Pull):**
* তৈরিকৃত ইমেজটি `docker push` কমান্ডের মাধ্যমে রেজিস্ট্রিতে আপলোড করা হয় এবং `docker pull`-এর মাধ্যমে অন্য সার্ভারে নামানো হয়।


3. **Run Phase (Containerization):**
* ইমেজ থেকে একটি **Container** (Run-time Instance) চালু করা হয়। এটি একটি আইসোলেটেড এনভায়রনমেন্ট যেখানে অ্যাপ্লিকেশনটি রান করে।


4. **Management Phase:**
* প্রয়োজন অনুযায়ী কন্টেইনারকে `Stop`, `Restart`, বা `Pause` করা হয়। লগ মনিটরিং এবং রিসোর্স ম্যানেজমেন্ট এই ধাপের অংশ।


5. **Destruction Phase:**
* যখন কন্টেইনারটির আর প্রয়োজন থাকে না, তখন `docker rm` কমান্ডের মাধ্যমে এটি এবং এর সাথে যুক্ত রিসোর্স মুছে ফেলা হয়।


### Docker LifeCycle Diagram
```
+-----------------+
|  Image Creation |  <-- Dockerfile
+-----------------+
         |
         v
+------------------+  <-- Pull Image
| Image Download   |
| (from Registry)  |
+------------------+
         |
         v
+-----------------+  <-- Run Container
| Container Run   |
| (Instance of    |
| the Image)      |
+-----------------+
         |
         v
+------------------+  <-- Manage Container
| Container Stop/  |
| Remove           |
+------------------+
```


---

### Lifecycle Summary Table

| ধাপ (Stage) | কমান্ড উদাহরণ | বর্ণনা |
| --- | --- | --- |
| **Build** | `docker build` | Dockerfile থেকে একটি পোর্টেবল ইমেজ তৈরি করা। |
| **Pull** | `docker pull` | রেজিস্ট্রি থেকে ইমেজ লোকাল মেশিনে নিয়ে আসা। |
| **Run** | `docker run` | ইমেজের ওপর ভিত্তি করে একটি কন্টেইনার প্রসেস চালু করা। |
| **Stop** | `docker stop` | চলমান কন্টেইনারকে গ্রেসফুলি বন্ধ করা। |
| **Destroy** | `docker rm` | বন্ধ থাকা কন্টেইনার এবং তার টেম্পোরারি ডেটা মুছে ফেলা। |

---
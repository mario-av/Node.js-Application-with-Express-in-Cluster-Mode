# Deployment of a Node.js Application in Cluster Mode with Express

**Author:** Mario Acosta Vargas  
**Date:** January 2026  
**Version:** 1.0.0

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1. [A Quick Look at Clusters](#11-a-quick-look-at-clusters)
2. [Using Clusters](#2-using-clusters)
   - 2.1. [First Without Cluster](#21-first-without-cluster)
   - 2.2. [Now with More Cluster!](#22-now-with-more-cluster)
3. [Performance Metrics](#3-performance-metrics)
4. [Using PM2 to Manage a Node.js Cluster](#4-using-pm2-to-manage-a-nodejs-cluster)
5. [Questions](#5-questions)

---

## 1. Introduction

When building a production application, one usually seeks ways to optimize its performance. A Node.js instance runs on a single thread, which means that on a multi-core system, not all cores will be utilized by the application. To take advantage of available cores, we can launch a cluster of Node.js processes and distribute the load among them.

In this practice, we will see how to create child processes using the Node.js cluster module to improve performance and, later, how to manage the cluster with the PM2 process manager.

### 1.1. A Quick Look at Clusters

The Node.js cluster module allows the creation of child processes (workers) that run simultaneously and share the same server port. Each spawned child has its own event loop and memory.

Having multiple processes means that multiple requests can be processed simultaneously. If there is a blocking operation in one worker, other workers can continue handling other requests.

---

## 2. Using Clusters

### 2.1. First Without Cluster

We will start with a test Node.js application that does not use clusters.

**Code (`app_mav.js`):**

```javascript
const express = require("express");
const app = express();
const port = 3000;
const limit = 5000000000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/:n", function (req, res) {
  let n = parseInt(req.params.n);
  let count = 0;
  if (n > limit) n = limit;
  for (let i = 0; i <= n; i++) {
    count += i;
  }
  res.send(`Final count is ${count}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```

**Running the Application:**
We start the application with `node app_mav.js`.

![Terminal App Without Cluster](config/assets/1.png)

Accessing the root route `/`:

![Browser Root](config/assets/2.png)

Accessing the API `/api/50`:

![Browser API](config/assets/3.png)

**Blocking Test:**
If we launch a costly request (`/api/5000000000`) followed immediately by a light one (`/api/50`), we observe that the second one hangs waiting for the first one to finish, due to the single thread nature.

![Blocking 1](config/assets/4.1.png)
![Blocking 2](config/assets/4.2.png)

### 2.2. Now with More Cluster!

Now we will use the cluster module to spawn child processes.

**Code (`app-cluster_mav.js`):**

```javascript
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;
// ... (master and workers code)
if (cluster.isMaster) {
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }
  // ...
} else {
  // ... (express app code)
}
```

**Running with Cluster:**
When starting `node app-cluster_mav.js`, we see several workers starting (one per core).

![Terminal App Cluster](config/assets/5.png)

**Non-Blocking Test:**
Repeating the previous test, now the light request responds immediately even if the heavy one is being processed in another worker.

![Non-Blocking 1](config/assets/6.1.png)
![Non-Blocking 2](config/assets/6.2.png)

---

## 3. Performance Metrics

We use `loadtest` to perform load testing and compare results.

**Load WITHOUT Cluster (n=500,000):**
`loadtest http://localhost:3000/api/500000 -n 1000 -c 100`

![Loadtest No Cluster Small 1](config/assets/7.1.png)
![Loadtest No Cluster Small 2](config/assets/7.2.png)
![Loadtest No Cluster Small 3](config/assets/7.3.png)

**Load WITHOUT Cluster (n=500,000,000):**
For very heavy operations, performance drops drastically and latency increases.

![Loadtest No Cluster Large 1](config/assets/8.1.png)
![Loadtest No Cluster Large 2](config/assets/8.2.png)

**Load WITH Cluster (n=500,000):**
With the cluster enabled, we see an improvement in concurrency handling.

![Loadtest Cluster Small 1](config/assets/9.1.png)
![Loadtest Cluster Small 2](config/assets/9.2.png)

**Load WITH Cluster (n=500,000,000):**
Even with heavy operations, the cluster allows maintaining some availability and distributing the load.

![Loadtest Cluster Large 1](config/assets/10.1.png)
![Loadtest Cluster Large 2](config/assets/10.2.png)

---

## 4. Using PM2 to Manage a Node.js Cluster

PM2 is a production process manager that facilitates creating clusters without modifying the application code.

**Starting with PM2:**
`pm2 start app_mav.js -i 0` (0 indicates using all available cores).

![PM2 Start 1](config/assets/11.1.png)
![PM2 Start 2](config/assets/11.2.png)

**Load Tests with PM2:**

_Small Load:_
![PM2 Loadtest Small](config/assets/12.png)

_Large Load:_
![PM2 Loadtest Large](config/assets/13.png)

**Process Management:**

_List processes (`pm2 ls`):_
![PM2 ls](config/assets/14.png)

_Logs (`pm2 logs`):_
![PM2 logs](config/assets/15.png)

_Monitoring (`pm2 monit`):_
![PM2 Monit 1](config/assets/16.1.png)
![PM2 Monit 2](config/assets/16.2.png)
![PM2 Monit 3](config/assets/16.3.png)
![PM2 Monit 4](config/assets/16.4.png)

**Ecosystem File:**
We can use `ecosystem.config.js` to define the configuration.
`pm2 start ecosystem.config.js`

![PM2 Ecosystem](config/assets/17.png)

**Stopping and Deleting:**
`pm2 stop cluster-app` and `pm2 delete cluster-app`.

![PM2 Stop](config/assets/18.png)
![PM2 Delete](config/assets/19.png)

---

## 5. Questions

**Task: Investigate the following commands and explain what terminal output they offer and what they are used for:**

1.  **`pm2 ls`**:
    - **Usage**: Displays a list of all processes managed by PM2.
    - **Output**: A table showing the process ID (id), name, mode (fork/cluster), status (online/stopped), restarts count, uptime, CPU usage, and memory usage.

2.  **`pm2 logs`**:
    - **Usage**: Shows real-time logs of the applications.
    - **Output**: Streams standard output (stdout) and error output (stderr) from all running processes, useful for debugging and monitoring activity.

3.  **`pm2 monit`**:
    - **Usage**: Launches a real-time monitoring dashboard in the terminal.
    - **Output**: An interactive interface showing CPU and Memory usage per process, along with real-time logs and metadata for the selected process.

**Could you say why in some specific cases, like this one, the non-clustered application has better results?**

In very light and fast operations, where the number of tasks is very small, the extra cost of managing Inter-Process Communication (IPC) and the cluster load distribution can outweigh the benefits of using multiple threads.

A single thread works well for simple I/O tasks or basic calculations. For trivial requests, it may occasionally show slightly better performance in terms of latency. However, the cluster provides greater reliability when dealing with heavy load or many concurrent tasks.

---
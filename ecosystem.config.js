// 1. PM2 Ecosystem Configuration File
module.exports = {
  // 2. Define applications array
  apps: [
    {
      // 3. Application name for PM2
      name: "cluster-app",
      // 4. Entry point script
      script: "app_mav.js",
      // 5. Number of instances (0 = auto-detect CPUs)
      instances: 0,
      // 6. Execution mode (cluster for load balancing)
      exec_mode: "cluster",
    },
  ],
};

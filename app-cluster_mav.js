// 1. Import required modules
const express = require("express");
const port = 3000;
const limit = 5000000000;
const cluster = require("cluster");
const totalCPUs = require("os").cpus().length;

// 2. Check if current process is master
if (cluster.isMaster) {
  // 3. Log number of CPUs available
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Master ${process.pid} is running`);

  // 4. Fork workers for each CPU core
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  // 5. Handle worker exit and spawn replacement
  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log("Let's fork another worker!");
    cluster.fork();
  });
} else {
  // 6. Worker process - create express app
  const app = express();
  console.log(`Worker ${process.pid} started`);

  // 7. Define root route
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // 8. Define API route with parameter n
  app.get("/api/:n", function (req, res) {
    let n = parseInt(req.params.n);
    let count = 0;

    // 9. Limit n to prevent excessive computation
    if (n > limit) n = limit;

    // 10. Perform CPU-intensive calculation
    for (let i = 0; i <= n; i++) {
      count += i;
    }

    // 11. Send response with result
    res.send(`Final count is ${count}`);
  });

  // 12. Start server on specified port
  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

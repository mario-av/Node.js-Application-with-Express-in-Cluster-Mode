// 1. Import express module
const express = require("express");

// 2. Create express application
const app = express();

// 3. Define port and limit constants
const port = 3000;
const limit = 5000000000;

// 4. Define root route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// 5. Define API route with parameter n
app.get("/api/:n", function (req, res) {
  // 6. Parse parameter to integer
  let n = parseInt(req.params.n);
  let count = 0;

  // 7. Limit n to prevent excessive computation
  if (n > limit) n = limit;

  // 8. Perform CPU-intensive calculation
  for (let i = 0; i <= n; i++) {
    count += i;
  }

  // 9. Send response with result
  res.send(`Final count is ${count}`);
});

// 10. Start server on specified port
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

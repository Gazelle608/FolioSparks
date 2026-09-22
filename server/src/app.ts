import routes from "./routes/index.js";

app.use("/api", apiLimiter, routes);

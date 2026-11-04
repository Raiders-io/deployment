import express from "express";
import type { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import logger from "./logger.js";
import { readConfig, normalizeRoute } from "./config.js";

const config = readConfig();
const app: Application = express();

// Uncomment this to log the IP address of the client making the request
app.use(logger);

app.set("trust proxy", 1); // trust first proxy

// https://www.npmjs.com/package/express-rate-limit
// https://express-rate-limit.mintlify.app/reference/configuration
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.limit,
  message: config.rateLimit.message,
  standardHeaders: "draft-8",
  passOnStoreError: true, // Passes (true) or blocks (false) the request to the next middleware in case of store error
  // skip: // Skip the request, eg. if the request is from a trusted IP address (localhost, internal network, etc.)
  skipSuccessfulRequests: false, // Skip successful requests (status < 400)
  skipFailedRequests: false, // Skip failed requests (status >= 400)
});

// https://www.npmjs.com/package/express-slow-down
const speedLimiter = slowDown({
  windowMs: config.slowdown.windowMs,
  delayAfter: config.slowdown.delayAfter,
  delayMs: config.slowdown.delayMs,
  maxDelayMs: config.slowdown.maxDelayMs,
});

app.use(speedLimiter);
app.use(limiter);

const PORT: number = Number(process.env.PORT) || 3000;

if (isNaN(PORT) || PORT <= 0) {
  throw new Error(
    `Invalid PORT value: ${process.env.PORT}. Must be a positive number.`,
  );
}

const proxies = config.proxy.map((proxyConfig) => {
  // Normalize all routes to ensure they start with / and have no consecutive slashes
  const routes = proxyConfig.routes.map(normalizeRoute);

  // Verify that after normalization, no route is empty
  const invalidRoutes = routes.filter((route) => route !== "/" && !route);
  if (invalidRoutes.length > 0) {
    throw new Error(
      `Proxy '${proxyConfig.name}' has invalid routes after normalization: ${invalidRoutes.join(", ")}`,
    );
  }

  const middleware = createProxyMiddleware({
    target: proxyConfig.target,
    changeOrigin: true,
    ws: proxyConfig.websocket === true,
    pathFilter: (pathname: string) => {
      // Use some() to check if pathname starts with any of the normalized routes
      return routes.some((route) => pathname.startsWith(route));
    },
  });

  app.use(middleware);
  return { middleware, websocket: proxyConfig.websocket === true };
});

const websocketProxy = proxies.find((proxy) => proxy.websocket);

const server = http.createServer(app);
if (websocketProxy) {
  server.on("upgrade", websocketProxy.middleware.upgrade);
}

server.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

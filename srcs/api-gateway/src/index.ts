import express from "express";
import type { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import fs from "fs";
import path from "path";
import logger from "./logger.js";

interface ProxyConfig {
  name: string;
  target: string;
  routes: string[];
  websocket?: boolean;
}

interface GatewayConfig {
  proxy: ProxyConfig[];
  slowdown: {
    windowMs: number;
    delayAfter: number;
    delayMs: number;
    maxDelayMs: number;
  };
  rateLimit: {
    windowMs: number;
    limit: number;
    message: string;
  };
}

function readConfig(): GatewayConfig {
  const configPath = path.resolve(
    process.env.GATEWAY_CONFIG_PATH ?? "config/gateway.json",
  );
  const config = JSON.parse(fs.readFileSync(configPath, "utf8")) as GatewayConfig;

  if (
    !Array.isArray(config.proxy) ||
    config.proxy.length === 0 ||
    config.proxy.some(
      (proxy) =>
        !proxy.name ||
        !proxy.target ||
        !Array.isArray(proxy.routes) ||
        proxy.routes.length === 0,
    )
  ) {
    throw new Error(
      `Invalid gateway configuration in ${configPath}: proxy entries need name, target and routes`,
    );
  }

  return config;
}

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
const proxies = config.proxy.map((proxyConfig) => {
  const routes = proxyConfig.routes.map((route) =>
    route.startsWith("/") ? route : `/${route}`,
  );
  const middleware = createProxyMiddleware({
    target: proxyConfig.target,
    changeOrigin: true,
    ws: proxyConfig.websocket === true,
    pathFilter: (pathname: string) =>
      routes.some((route) => pathname.startsWith(route)),
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

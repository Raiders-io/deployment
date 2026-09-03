import express from "express";
import type { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";
import { rateLimit } from "express-rate-limit";
import { slowDown } from "express-slow-down";
import logger from "./logger.js";

const app: Application = express();

// Uncomment this to log the IP address of the client making the request
// app.use(logger);

app.set("trust proxy", 1); // trust first proxy

// https://www.npmjs.com/package/express-rate-limit
// https://express-rate-limit.mintlify.app/reference/configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  limit: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: "draft-8",
  passOnStoreError: true, // Passes (true) or blocks (false) the request to the next middleware in case of store error
  // skip: // Skip the request, eg. if the request is from a trusted IP address (localhost, internal network, etc.)
  skipSuccessfulRequests: false, // Skip successful requests (status < 400)
  skipFailedRequests: false, // Skip failed requests (status >= 400)
});

// https://www.npmjs.com/package/express-slow-down
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, //15 minutes
  delayAfter: 10,
  delayMs: () => 200,
  maxDelayMs: 5000,
});

app.use(speedLimiter);
app.use(limiter);

const PORT: number = Number(process.env.PORT) || 3000;
const MESSAGING_SERVICE_URL: string =
  process.env.MESSAGING_SERVICE_URL || "http://messaging-service:3334";
const AUTH_SERVICE_URL: string =
  process.env.AUTH_SERVICE_URL || "http://auth-service:3333";
const USER_SERVICE_URL: string =
  process.env.USER_SERVICE_URL || "http://user-service:3333";
const OBJ_SERVICE_URL: string =
  process.env.OBJ_SERVICE_URL || "http://object-api:3333";

const LESSON_SERVICE_URL: string =
  process.env.LESSON_SERVICE_URL || "http://lesson_api:3333";

const messagingProxy = createProxyMiddleware({
  target: MESSAGING_SERVICE_URL,
  changeOrigin: true,
  ws: true,
  pathFilter: (pathname: string) =>
    pathname.startsWith("/socket.io") || pathname.startsWith("/api/messaging"),
});

app.use(
  createProxyMiddleware({
    target: OBJ_SERVICE_URL,
    pathFilter: "/api/v1/storage/**",
    changeOrigin: true,
  }),
);

app.use(
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    pathFilter: (pathname: string) =>
      pathname.startsWith("/api/v1/auth") ||
      pathname.startsWith("/api/v1/account"),
    changeOrigin: true,
  }),
);

app.use(
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    pathFilter: (pathname: string) =>
      pathname.startsWith("/profile") || pathname.startsWith("/friends"),
    changeOrigin: true,
  }),
);

const lessonProxy = createProxyMiddleware({
  target: LESSON_SERVICE_URL,
  pathFilter: (pathname: string) =>
    pathname.startsWith("/api/v1/lessons") ||
    pathname.startsWith("/api/v1/search") ||
    pathname.startsWith("/lessons") ||
    pathname.startsWith("/search"),
  changeOrigin: true,
});

app.use(lessonProxy);

app.use(messagingProxy);

const server = http.createServer(app);
server.on("upgrade", messagingProxy.upgrade);

server.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

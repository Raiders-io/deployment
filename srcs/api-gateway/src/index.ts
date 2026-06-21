import express from "express";
import type { Application } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import http from "http";

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 3000;
const MESSAGING_SERVICE_URL: string =
  process.env.MESSAGING_SERVICE_URL || "http://messaging-service:3335";
// const AUTH_SERVICE_URL: string =
//   process.env.AUTH_SERVICE_URL || "http://auth-service:3333";

const OBJ_SERVICE_URL: string =
  process.env.OBJ_SERVICE_URL || "http://object-api:3333";

const messagingProxy = createProxyMiddleware({
  target: MESSAGING_SERVICE_URL,
  pathFilter: "/socket.io/**",
  changeOrigin: true,
  ws: true,
});

app.use("/test", (req, res) => {
  res.send("test route");
});

app.use(
  createProxyMiddleware({
    target: OBJ_SERVICE_URL,
    pathFilter: "/api/v1/storage/**",
    changeOrigin: true,
  }),
);

// app.use(
//   createProxyMiddleware({
//     target: AUTH_SERVICE_URL,
//     pathFilter: "/auth/**",
//     changeOrigin: true,
//   }),
// );

app.use(messagingProxy);

const server = http.createServer(app);
server.on("upgrade", messagingProxy.upgrade);

server.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

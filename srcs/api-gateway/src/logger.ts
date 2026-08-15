import express from "express";

const logger = (
  req: express.Request,
  _res: express.Response,
  next: express.NextFunction,
) => {
  console.log({
    ip: req.ip,
    ips: req.ips,
    xForwardedFor: req.headers["x-forwarded-for"],
    remoteAddress: req.socket.remoteAddress,
    url: req.originalUrl,
  });
  next();
};

export default logger;

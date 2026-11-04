import fs from "fs";
import path from "path";

export interface ProxyConfig {
  name: string;
  target: string;
  routes: string[];
  websocket?: boolean;
}

export interface GatewayConfig {
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

/**
 * Normalizes a route string to ensure it:
 * - Starts with exactly one forward slash
 * - Has no leading or trailing whitespace
 * - Has no consecutive slashes
 * - Returns "/" for empty or whitespace-only strings
 */
export function normalizeRoute(route: string): string {
  const trimmed = route.trim();
  if (!trimmed) {
    return "/";
  }
  // Replace multiple consecutive slashes with a single slash
  const normalized = trimmed.replace(/\/{2,}/g, "/");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

/**
 * Reads and validates the gateway configuration from the specified path.
 * Throws descriptive errors for any validation failures.
 */
export function readConfig(): GatewayConfig {
  const configPath = path.resolve(
    process.env.GATEWAY_CONFIG_PATH ?? "config/gateway.json",
  );

  let config: GatewayConfig;
  try {
    const fileContent = fs.readFileSync(configPath, "utf8");
    config = JSON.parse(fileContent) as GatewayConfig;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to read or parse gateway configuration from ${configPath}: ${errorMessage}`,
    );
  }

  if (
    !config ||
    typeof config !== "object" ||
    !Array.isArray(config.proxy) ||
    config.proxy.length === 0
  ) {
    throw new Error(
      `Invalid gateway configuration in ${configPath}: 'proxy' must be a non-empty array`,
    );
  }

  for (const proxy of config.proxy) {
    if (!proxy || typeof proxy !== "object") {
      throw new Error(
        `Invalid gateway configuration in ${configPath}: each proxy entry must be an object`,
      );
    }

    if (
      !proxy.name ||
      typeof proxy.name !== "string" ||
      proxy.name.trim() === ""
    ) {
      throw new Error(
        `Invalid gateway configuration in ${configPath}: proxy entry missing or invalid 'name'`,
      );
    }

    if (
      !proxy.target ||
      typeof proxy.target !== "string" ||
      proxy.target.trim() === ""
    ) {
      throw new Error(
        `Invalid gateway configuration in ${configPath}: proxy '${proxy.name}' missing or invalid 'target'`,
      );
    }

    if (!Array.isArray(proxy.routes) || proxy.routes.length === 0) {
      throw new Error(
        `Invalid gateway configuration in ${configPath}: proxy '${proxy.name}' missing or empty 'routes' array`,
      );
    }

    for (const route of proxy.routes) {
      if (typeof route !== "string" || route.trim() === "") {
        throw new Error(
          `Invalid gateway configuration in ${configPath}: proxy '${proxy.name}' has invalid route '${route}'`,
        );
      }
    }

    if (proxy.websocket !== undefined && typeof proxy.websocket !== "boolean") {
      throw new Error(
        `Invalid gateway configuration in ${configPath}: proxy '${proxy.name}' has invalid 'websocket' value`,
      );
    }
  }

  // Validate slowdown config
  if (
    !config.slowdown ||
    typeof config.slowdown !== "object" ||
    typeof config.slowdown.windowMs !== "number" ||
    typeof config.slowdown.delayAfter !== "number" ||
    typeof config.slowdown.delayMs !== "number" ||
    typeof config.slowdown.maxDelayMs !== "number"
  ) {
    throw new Error(
      `Invalid gateway configuration in ${configPath}: 'slowdown' configuration is missing or invalid`,
    );
  }

  // Validate rateLimit config
  if (
    !config.rateLimit ||
    typeof config.rateLimit !== "object" ||
    typeof config.rateLimit.windowMs !== "number" ||
    typeof config.rateLimit.limit !== "number" ||
    typeof config.rateLimit.message !== "string"
  ) {
    throw new Error(
      `Invalid gateway configuration in ${configPath}: 'rateLimit' configuration is missing or invalid`,
    );
  }

  return config;
}

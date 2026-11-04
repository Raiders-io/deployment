# API Gateway

A lightweight Express-based API gateway with reverse proxy capabilities, rate limiting, and request slowing for the Transcendence project.

## Configuration

The API Gateway uses a JSON configuration file to define proxy rules, rate limiting, and slow down settings.

### Configuration File Location

By default, the gateway looks for `config/gateway.json` relative to the working directory. You can specify a custom path using the `GATEWAY_CONFIG_PATH` environment variable:

```bash
# Default (looks for ./config/gateway.json)
node dist/index.js

# Custom path
export GATEWAY_CONFIG_PATH=/path/to/your/config.json
node dist/index.js
```

### Configuration Structure

```json
{
  "proxy": [
    {
      "name": "service-name",
      "target": "http://service-host:port",
      "routes": ["/api/v1/prefix", "/api/v2/other"],
      "websocket": false
    }
  ],
  "slowdown": {
    "windowMs": 300000,
    "delayAfter": 400,
    "delayMs": 200,
    "maxDelayMs": 5000
  },
  "rateLimit": {
    "windowMs": 300000,
    "limit": 500,
    "message": "Too many requests from this IP, please try again after 5 minutes"
  }
}
```

## Proxy Configuration

### Required Fields

| Field    | Type     | Description                                                       |
| -------- | -------- | ----------------------------------------------------------------- |
| `name`   | string   | Unique identifier for the proxy service                           |
| `target` | string   | Base URL of the target service (e.g., `http://auth-service:3333`) |
| `routes` | string[] | Array of URL prefixes to proxy to this service                    |

### Optional Fields

| Field       | Type    | Default | Description                             |
| ----------- | ------- | ------- | --------------------------------------- |
| `websocket` | boolean | `false` | Enable WebSocket support for this proxy |

### Route Configuration

- **All routes must start with `/`** (they are automatically normalized if not)
- **Routes are prefix-matched**: `/api/users` will match `/api/users`, `/api/users/123`, `/api/users/profile`, etc.
- **Route normalization**: Multiple slashes are collapsed, whitespace is trimmed

### Examples

```json
{
  "proxy": [
    {
      "name": "auth",
      "target": "http://auth-service:3333",
      "routes": ["/api/v1/auth", "/api/v1/account"]
    },
    {
      "name": "messaging",
      "target": "http://messaging-service:3334",
      "routes": ["/api/socket.io", "/api/messaging"],
      "websocket": true
    },
    {
      "name": "storage",
      "target": "http://object-api:3333",
      "routes": ["/api/v1/storage"]
    }
  ]
}
```

**Note**: Only one proxy should have `websocket: true`. The gateway will use the first websocket-enabled proxy for upgrade requests.

## Rate Limiting Configuration

| Field      | Type   | Default | Description                                              |
| ---------- | ------ | ------- | -------------------------------------------------------- |
| `windowMs` | number | -       | Time window in milliseconds (e.g., `300000` = 5 minutes) |
| `limit`    | number | -       | Maximum number of requests per window per IP             |
| `message`  | string | -       | Error message returned when limit is exceeded            |

### Example

```json
{
  "rateLimit": {
    "windowMs": 300000,
    "limit": 500,
    "message": "Too many requests from this IP, please try again after 5 minutes"
  }
}
```

## Slow Down Configuration

| Field        | Type   | Default | Description                                      |
| ------------ | ------ | ------- | ------------------------------------------------ |
| `windowMs`   | number | -       | Time window in milliseconds                      |
| `delayAfter` | number | -       | Number of requests in window before delay starts |
| `delayMs`    | number | -       | Initial delay in milliseconds                    |
| `maxDelayMs` | number | -       | Maximum delay in milliseconds                    |

### Example

```json
{
  "slowdown": {
    "windowMs": 300000,
    "delayAfter": 400,
    "delayMs": 200,
    "maxDelayMs": 5000
  }
}
```

This means: after 400 requests in 5 minutes, each additional request is delayed by 200ms, up to a maximum of 5000ms.

## Environment Variables

| Variable              | Required | Default               | Description                            |
| --------------------- | -------- | --------------------- | -------------------------------------- |
| `PORT`                | No       | `3000`                | Port the gateway listens on            |
| `GATEWAY_CONFIG_PATH` | No       | `config/gateway.json` | Path to the gateway configuration file |

## Docker Deployment

### Build the Image

```bash
cd /path/to/Transcendence/deployment/srcs/api-gateway
docker build -t api-gateway .
```

### Run with Configuration Volume

Mount your configuration file as a volume:

```bash
docker run -d \
  --name api-gateway \
  -p 3000:3000 \
  -v /path/to/your/config.json:/app/config/gateway.json \
  api-gateway
```

### Run with Environment Variables

```bash
docker run -d \
  --name api-gateway \
  -p 8080:3000 \
  -e PORT=3000 \
  -e GATEWAY_CONFIG_PATH=/app/config/custom-gateway.json \
  -v /path/to/config:/app/config \
  api-gateway
```

## Development

### Install Dependencies

```bash
npm install
```

### Run in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server when source files change.

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

## Logging

The gateway includes a built-in request logger. To enable IP address logging, uncomment the following line in `src/index.ts`:

```typescript
app.use(logger);
```

## Troubleshooting

### Common Issues

1. **"Invalid gateway configuration"**
   - Verify your `gateway.json` is valid JSON
   - Ensure all required fields (`name`, `target`, `routes`) are present
   - Check that `routes` is a non-empty array

2. **"Address already in use"**
   - Make sure no other service is using the configured PORT
   - Check for zombie processes: `lsof -i :3000`

3. **Routes not matching**
   - Routes must start with `/`
   - Routes are prefix-matched, not exact-matched
   - Check your route definitions for typos

4. **WebSocket not working**
   - Only one proxy can have `websocket: true`
   - Ensure the WebSocket proxy is the last one defined (recommended)

### Validation Errors

The gateway performs extensive configuration validation:

- Checks that all proxy entries have valid names, targets, and routes
- Validates that rateLimit and slowdown configurations have all required numeric fields
- Normalizes routes to prevent errors

If you see a validation error, carefully read the error message which will indicate exactly which field is invalid.

## Example Configuration

Here's a complete example configuration for the Transcendence project:

```json
{
  "proxy": [
    {
      "name": "messaging",
      "target": "http://messaging-service:3334",
      "routes": ["/api/socket.io", "/api/messaging"],
      "websocket": true
    },
    {
      "name": "object",
      "target": "http://object-api:3333",
      "routes": ["/api/v1/storage"]
    },
    {
      "name": "auth",
      "target": "http://auth-service:3333",
      "routes": ["/api/v1/auth", "/api/v1/account"]
    },
    {
      "name": "user",
      "target": "http://user-service:3333",
      "routes": ["/api/v1/profile", "/api/v1/friends"]
    },
    {
      "name": "lesson",
      "target": "http://lesson_api:3333",
      "routes": ["/api/v1/lessons", "/api/v1/search"]
    }
  ],
  "slowdown": {
    "windowMs": 300000,
    "delayAfter": 400,
    "delayMs": 200,
    "maxDelayMs": 5000
  },
  "rateLimit": {
    "windowMs": 300000,
    "limit": 500,
    "message": "Too many requests from this IP, please try again after 5 minutes"
  }
}
```

## Architecture Notes

- The gateway uses `http-proxy-middleware` for proxying requests
- Rate limiting is provided by `express-rate-limit`
- Request slowing is provided by `express-slow-down`
- The configuration is validated at startup and fails fast on errors
- Routes are automatically normalized to ensure consistency

## License

This project is part of the Transcendence project.

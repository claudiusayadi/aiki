# Dynamic Swagger Server Configuration

## Overview

The Swagger documentation now automatically configures the server URL based on the environment:

- **Development/Test**: `http://localhost:<PORT>`
- **Production/Staging**: `https://<DOMAIN>`

## Configuration

### Environment Variables

Add the `DOMAIN` variable to your `.env` file for production:

```bash
# .env.production
NODE_ENV=production
DOMAIN=api.yourdomain.com
API_PORT=443  # or your production port
```

### Development

In development, the server URL is automatically set to:

```
http://localhost:5154
```

### Production

In production, set the `DOMAIN` environment variable:

```bash
DOMAIN=api.yourdomain.com
```

The server URL will automatically be:

```
https://api.yourdomain.com
```

## How It Works

The `main.ts` file dynamically determines the protocol and host:

```typescript
const isDevelopment = env === 'development' || env === 'test';
const protocol = isDevelopment ? 'http' : 'https';
const host = isDevelopment
  ? `localhost:${port}`
  : process.env.DOMAIN || 'api.yourdomain.com';
const baseUrl = `${protocol}://${host}`;
```

Then adds the server to Swagger:

```typescript
const config = new DocumentBuilder()
  // ... other configs
  .addServer(baseUrl, `${env.charAt(0).toUpperCase() + env.slice(1)} server`)
  .build();
```

## Multiple Servers (Optional)

If you want to show multiple server options in Swagger, you can add them:

```typescript
const config = new DocumentBuilder()
  .setTitle(title)
  .setDescription(pkg.description)
  .addCookieAuth(tokensConfig.access)
  .setVersion(pkg.version)
  // Add multiple servers
  .addServer('http://localhost:5154', 'Local development')
  .addServer('https://staging-api.yourdomain.com', 'Staging server')
  .addServer('https://api.yourdomain.com', 'Production server')
  .build();
```

This allows users to switch between servers in the Swagger UI dropdown.

## Benefits

✅ Automatic protocol selection (http vs https)
✅ Environment-aware configuration
✅ No hardcoded URLs in code
✅ Easy to configure for different environments
✅ Proper HTTPS in production
✅ Works with reverse proxies and load balancers

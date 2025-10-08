# Aiki

A modern task management API built with NestJS, designed to help users organize and prioritize their work efficiently through flexible subscription plans.

## Overview

Aiki (from the Hausa word for "tasks") is a RESTful API that provides comprehensive task management capabilities with integrated payment processing. The platform supports multiple subscription tiers, allowing users to choose plans that match their productivity needs.

## Features

### Core Functionality

- **Task Management**: Create, update, delete, and restore tasks with soft-delete support
- **User Authentication**: Secure JWT-based authentication with email verification
- **Flexible Plans**: Multiple subscription tiers including free starter, pay-per-task, and unlimited subscription models
- **Payment Integration**: Seamless Paystack integration for payment processing
- **Email Notifications**: Automated email delivery for account verification
- **Rate Limiting**: Built-in request throttling for API protection
- **Health Monitoring**: Application health check endpoints

### Technical Highlights

- RESTful API architecture with Swagger documentation
- PostgreSQL database with TypeORM
- Redis for session management
- Cookie-based authentication
- Role-based access control (RBAC)
- Comprehensive error handling and logging
- Environment-based configuration

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis (ioredis)
- **Authentication**: Passport.js with JWT strategy
- **Email**: Nodemailer with Handlebars templates
- **Payments**: Paystack API integration
- **Validation**: class-validator and class-transformer
- **Security**: Helmet, CORS, Argon2 password hashing
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- Redis 6.x or higher
- Yarn package manager (or your preferred pm)

## Installation

```bash
# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
yarn migration:run
```

## Configuration

Copy the `.env.example` file to `.env` and fill in the required configuration values.

## Running the Application

```bash
# Development mode with watch
yarn start:dev

# Production build
yarn build
yarn start:prod

# Debug mode
yarn start:debug
```

The API will be available at `http://localhost:5154/api/v1`

Swagger documentation: `http://localhost:5154/api/v1/docs`

## Database Migrations

```bash
# Generate a new migration
yarn migration:generate --name=MigrationName

# Run pending migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Sign in with credentials
- `POST /api/v1/auth/signout` - Sign out current user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification code
- `PATCH /api/v1/auth/change-password` - Change user password

### Tasks

- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks` - List all tasks
- `GET /api/v1/tasks/:id` - Get task by ID
- `PATCH /api/v1/tasks/:id` - Update a task
- `DELETE /api/v1/tasks/:id` - Soft delete a task
- `GET /api/v1/tasks/:id/restore` - Restore a deleted task

### Plans

- `POST /api/v1/plans` - Create a new plan (admin)
- `GET /api/v1/plans` - List available plans
- `GET /api/v1/plans/:id` - Get plan details
- `PATCH /api/v1/plans/:id` - Update a plan (admin)
- `DELETE /api/v1/plans/:id` - Delete a plan (admin)

### Payments

- `POST /api/v1/payments/initialize` - Initialize a payment
- `POST /api/v1/payments/verify` - Verify a payment
- `POST /api/v1/payments/webhook` - Paystack webhook handler
- `GET /api/v1/payments` - List user payments
- `GET /api/v1/payments/:id` - Get payment details

### Users

- `GET /api/v1/users` - List users (admin)
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/users/recover` - Recover deleted user account

### Health

- `GET /api/v1/health` - Application health check
- `GET /api/v1/health/metrics` - Detailed health metrics

## Testing (WIP)

```bash
# Run unit tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate test coverage
yarn test:cov

# Run end-to-end tests
yarn test:e2e
```

## Project Structure

```
src/
├── core/               # Core functionality
│   ├── config/        # Configuration files
│   ├── db/            # Database setup and migrations
│   ├── redis/         # Redis service
│   └── common/        # Shared utilities and decorators
├── modules/           # Feature modules
│   ├── auth/          # Authentication module
│   ├── email/         # Email service
│   ├── health/        # Health check module
│   ├── payments/      # Payment processing
│   ├── plans/         # Subscription plans
│   ├── tasks/         # Task management
│   └── users/         # User management
└── main.ts            # Application entry point
```

## Security

- Passwords hashed with Argon2
- JWT tokens for stateless authentication
- HTTP-only cookies for token storage
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- SQL injection prevention via TypeORM

## Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment variables
2. Configure your production database connection
3. Set up SSL/TLS certificates for HTTPS
4. Configure proper CORS origins
5. Set up Redis for session storage
6. Configure email service credentials
7. Set up Paystack production keys
8. Run database migrations
9. Build and start the application:

```bash
yarn build
yarn start:prod
```

## License

UNLICENSED - Proprietary software

## Support

For issues and questions, please refer to the project's issue tracker or contact me on [X](https://x.com/ClaudiusAyadi)

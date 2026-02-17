# NestJS Backend with Supabase PostgreSQL

A production-ready NestJS backend application configured with Supabase PostgreSQL database using TypeORM.

## Features

- **NestJS Framework**: Scalable and efficient Node.js framework
- **TypeORM Integration**: Object-Relational Mapping with PostgreSQL
- **Supabase PostgreSQL**: Cloud-hosted PostgreSQL database
- **Environment Validation**: Runtime validation of environment variables
- **Global Validation Pipes**: Automatic DTO validation
- **CORS Enabled**: Cross-Origin Resource Sharing support
- **Production-Ready Structure**: Organized folder structure for scalability

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and PostgreSQL database

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your Supabase PostgreSQL connection string

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
PORT=3000
NODE_ENV=development
```

## Getting Your Supabase Database URL

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Under **Connection String**, find the **URI** format
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your database password
5. Paste it into your `.env` file

## Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards
│   ├── interceptors/      # Response interceptors
│   └── pipes/             # Custom pipes
├── config/                 # Configuration files
│   ├── database.config.ts # Database configuration
│   └── environment.validation.ts # Env validation
├── modules/               # Feature modules
│   └── users/            # Example user module
│       ├── dto/          # Data Transfer Objects
│       ├── entities/     # TypeORM entities
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── app.module.ts          # Root module
└── main.ts                # Application entry point
```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Debug Mode
```bash
npm run start:debug
```

## API Endpoints

### Users Module (Example)

- `POST /users` - Create a new user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Example Request

Create a user:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securePassword123"
  }'
```

## Database Configuration

The application uses TypeORM with the following configuration:

- **autoLoadEntities**: Automatically loads entity files
- **synchronize**: Auto-sync database schema (disabled in production)
- **SSL**: Enabled with `rejectUnauthorized: false` for Supabase
- **Logging**: Enabled in development mode

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| PORT | Application port | No (default: 3000) |
| NODE_ENV | Environment (development/production) | No (default: development) |

## Security Features

- No hardcoded credentials
- Environment variable validation on startup
- Global validation pipes with whitelist
- DTO validation using class-validator
- SSL-enabled database connections

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Building for Production

```bash
npm run build
```

The compiled output will be in the `dist/` directory.

## Common Issues

### Database Connection Failed
- Verify your DATABASE_URL is correct
- Ensure your Supabase project is active
- Check if your IP is allowed in Supabase network settings

### Port Already in Use
- Change the PORT in your `.env` file
- Or stop the process using the port: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)

## License

MIT

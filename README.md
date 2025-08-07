# Band Calendar Hub

A private, mobile-first web application for band members to securely share and coordinate calendar events using Google OAuth authentication.

## Overview

Band Calendar Hub enables bands to centralize rehearsal schedules, performance dates, and other events in one secure platform. Only approved members can access and manage the calendar.

## Key Features

- 🔐 Google OAuth authentication (secure, member-only access)
- 👑 Admin interface for managing authorized users
- 📱 Mobile-first, responsive calendar views (monthly, weekly, daily)
- ✨ Enhanced event creation and editing with modal support
- 🎯 Role-based permissions (Admin vs. Member)
- 📝 Audit tracking (created by, last updated by)

## Technology Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js/Express.js
- **Database:** Local JSON files (`db.json`, `authorized_users.json`)
- **Authentication:** Passport.js with Google OAuth2.0 Strategy
- **Hosting:** Docker (production), concurrent development (local)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm
- Google Cloud Platform account (for OAuth setup)

### 1. Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd bandorg
```

2. Install dependencies:
```bash
npm install          # Root dependencies (concurrently)
cd client && npm install && cd ..
cd server && npm install && cd ..
```

3. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your Google OAuth credentials
```

4. Configure Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services > Credentials**
   - Create OAuth client ID for web application
   - Add authorized origins: `http://localhost:3001`
   - Add redirect URIs: `http://localhost:3001/auth/google/callback`
   - Copy Client ID and Secret to your `.env` file

### 2. Running the Application

#### Development Mode
```bash
npm start  # Starts both client (port 3000) and server (port 3001)
```

#### Production with Docker
```bash
docker build \
  --build-arg GOOGLE_CLIENT_ID=your_client_id \
  --build-arg GOOGLE_CLIENT_SECRET=your_client_secret \
  --build-arg SESSION_SECRET=your_session_secret \
  --build-arg ADMIN_EMAIL=admin@example.com \
  -t bandorg .

docker run -p 3001:3001 bandorg
```

### 3. Initial Setup

1. The application will automatically create an admin user based on the `ADMIN_EMAIL` environment variable
2. Admin users can then add additional authorized users through the admin interface
3. Only users in the authorized users list can access the application

## Testing

```bash
# Run server tests
cd server && npm test

# Run client tests  
cd client && npm test
```

## Project Structure

```
bandorg/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   └── package.json
├── server/           # Express backend
│   ├── src/
│   │   ├── index.js       # Main server file
│   │   ├── auth.js        # Authentication middleware
│   │   └── authorizedUsers.js
│   ├── test/
│   └── package.json
├── docs/            # Comprehensive documentation
│   ├── README.md    # Detailed documentation
│   └── PRD.md       # Product Requirements Document
├── Dockerfile
└── README.md        # This file
```

## Documentation

For detailed documentation, see:
- [Full Documentation](./docs/README.md) - Complete setup and usage guide
- [Product Requirements](./docs/PRD.md) - Detailed feature specifications
- [Deployment Guide](./docs/deployment_plan.md) - Production deployment instructions

## Contributing

1. Check existing issues and documentation
2. Run tests before submitting changes
3. Follow the existing code style and patterns
4. Update documentation if needed

## Security

- All authentication is handled through Google OAuth
- Session management with secure cookies
- Role-based access control
- Input validation and sanitization
- Regular dependency updates

## License

ISC License - see package.json for details

---

For detailed setup instructions, feature documentation, and technical specifications, see the [full documentation](./docs/README.md).
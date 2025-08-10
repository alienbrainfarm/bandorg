# Band Calendar Hub - Copilot Instructions

## Project Overview

Band Calendar Hub is a secure, mobile-first web application that enables band members to share and coordinate calendar events. The application uses Google OAuth for authentication and provides role-based access control.

### Key Features
- 🔐 Google OAuth authentication (secure, member-only access)
- 👑 Admin interface for managing authorized users
- 📱 Mobile-first, responsive calendar views (monthly, weekly, daily)
- ✨ Enhanced event creation and editing with modal support
- 🎯 Role-based permissions (Admin vs. Member)
- 📝 Audit tracking (created by, last updated by)

## Architecture

This is a full-stack JavaScript application with:

### Frontend (./client/)
- **Framework**: React.js 18.2.0
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router DOM
- **Calendar**: React Big Calendar for event display
- **Testing**: React Testing Library + Jest
- **Build**: Create React App (CRA)

### Backend (./server/)
- **Framework**: Express.js
- **Authentication**: Passport.js with Google OAuth2.0 Strategy
- **Database**: Local JSON files (`db.json`, `authorized_users.json`)
- **Testing**: Mocha + Chai + Supertest
- **Linting**: ESLint with modern configuration

### Development Setup
- **Process Management**: Concurrently runs both client and server
- **Ports**: Client (3000), Server (3001)
- **Proxy**: Client proxies API requests to server
- **Environment**: `.env` files for configuration

## Development Patterns

### File Structure
```
bandorg/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/        # Page-level components
│   │   └── styles/       # CSS and styling
│   └── package.json
├── server/           # Express backend
│   ├── src/
│   │   ├── index.js      # Main server file with routes
│   │   ├── auth.js       # Authentication middleware
│   │   └── authorizedUsers.js  # User management logic
│   └── test/            # Server-side tests
├── docs/            # Comprehensive documentation
└── .copilot/        # This directory
```

### Common Development Tasks

#### Starting Development
```bash
npm start  # Runs both client and server concurrently
```

#### Running Tests
```bash
# Server tests
cd server && npm test

# Client tests  
cd client && npm test
```

#### Linting
```bash
cd server && npm run lint        # Check linting
cd server && npm run lint:fix    # Auto-fix linting issues
```

## Code Style and Conventions

### ESLint Configuration
- Uses modern ESLint configuration (`@eslint/js`)
- Enforces consistent return statements in arrow functions
- Requires underscore prefix for unused variables
- React app extends standard CRA ESLint rules

### Key Patterns to Follow

#### API Route Structure (Server)
- All routes defined in `server/src/index.js`
- Authentication middleware protects all routes except auth endpoints
- RESTful conventions: GET, POST, PUT, DELETE
- JSON response format with proper error handling

#### Component Structure (Client)
- Functional components with hooks
- Props destructuring in component parameters
- Tailwind CSS for styling with mobile-first approach
- Event handlers follow `handle*` naming convention

#### Authentication Flow
1. Google OAuth redirect to `/auth/google`
2. Callback to `/auth/google/callback`
3. Session-based authentication with `req.isAuthenticated()`
4. User authorization check against `authorized_users.json`

#### Data Management
- Events stored in `server/db.json`
- Users stored in `server/authorized_users.json`
- File-based persistence with JSON format
- Audit fields: `createdBy`, `lastUpdatedBy`

## Security Considerations

### Authentication & Authorization
- **Google OAuth**: Only Google-authenticated users allowed
- **Authorized Users**: Additional layer - users must be in authorized list
- **Role-Based Access**: Admin vs Member permissions
- **Session Management**: Express sessions with secure cookies

### Best Practices
- Input validation on all API endpoints
- Session secret in environment variables
- No sensitive data in client-side code
- Regular dependency updates for security patches

## Testing Guidelines

### Server Tests (Mocha + Chai)
- Test files in `server/test/` directory
- Naming convention: `*.test.js`
- Setup file: `testSetup.js` for common test utilities
- Test categories: Admin API, Events API
- Use Supertest for HTTP endpoint testing

### Client Tests (Jest + React Testing Library)
- Test files co-located with components or in `__tests__` directories
- Focus on user interactions and component behavior
- Use React Testing Library's user-centric queries
- Test accessibility and responsive behavior

### Test Data
- Tests create temporary data that doesn't affect production files
- Mock Google OAuth for testing
- Clean up test data after test runs

## Environment Configuration

### Required Environment Variables (Server)
```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
ADMIN_EMAIL=admin@example.com  # Primary admin user
PORT=3001  # Optional, defaults to 3001
```

### Development vs Production
- **Development**: Use `.env` file in server directory
- **Production**: Use Docker with build-time arguments
- **Database**: File-based storage suitable for small teams

## Common Development Scenarios

### Adding New API Endpoints
1. Add route in `server/src/index.js`
2. Include authentication middleware
3. Implement request validation
4. Add proper error handling
5. Write tests in appropriate test file
6. Update documentation if needed

### Adding New React Components
1. Create component file in appropriate directory
2. Use functional component with hooks
3. Apply Tailwind CSS for styling
4. Ensure mobile responsiveness
5. Add prop validation if complex
6. Write tests for user interactions

### Modifying Calendar Features
- Calendar logic uses React Big Calendar
- Event data structure defined in server API
- Date handling with date-fns library
- Mobile-first responsive design required

### User Management
- Admin users can add/remove authorized users
- Primary admin (from ADMIN_EMAIL) cannot be deleted
- User roles: 'admin' or 'member'
- Changes persist to `authorized_users.json`

## Deployment

### Docker Production Build
```bash
docker build \
  --build-arg GOOGLE_CLIENT_ID=your_client_id \
  --build-arg GOOGLE_CLIENT_SECRET=your_client_secret \
  --build-arg SESSION_SECRET=your_session_secret \
  --build-arg ADMIN_EMAIL=admin@example.com \
  -t bandorg .
```

### Local Development
- Ensure Node.js 18+ installed
- Install dependencies in root, client, and server directories
- Configure Google OAuth credentials
- Set up environment variables

## Documentation

Comprehensive documentation available in `./docs/`:
- `README.md`: Complete setup and usage guide
- `PRD.md`: Product Requirements Document
- `deployment_plan.md`: Production deployment instructions
- `CODE_QUALITY_REVIEW.md`: Code quality standards and review

For detailed technical specifications and setup instructions, always refer to the documentation in the `docs/` directory.
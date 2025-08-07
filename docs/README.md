# Band Calendar Hub Documentation

Welcome to the documentation for **Band Calendar Hub** – a private, mobile-first web application for band members to securely share and coordinate calendar events.

## Overview
Band Calendar Hub enables bands to centralize rehearsal schedules, performance dates, and other events in one secure, Google Account-authenticated platform. Only approved members can access and manage the calendar.

## Key Features
- Google OAuth authentication (secure, member-only access)
- Admin interface for managing authorized users
- Mobile-first, responsive calendar views (monthly, weekly, daily) with improved UI
- Enhanced event creation and editing with dynamic modal title, close button, and ESC key support
- Prevent interaction with background elements when hamburger menu is open
- Audit log and admin dashboard

## Technology Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js/Express.js
- **Database:** Local JSON file (`db.json`)
- **Authentication:** Passport.js with Google OAuth2.0 Strategy
- **Hosting:** Docker (local development)

## Documentation Contents
- `PRD.md`: Full Product Requirements Document
- Additional guides and technical documentation (coming soon)

## Getting Started
1. Review the `PRD.md` for detailed requirements and user stories.
2. Follow the technical architecture recommendations for setup.
3. Use the admin dashboard to manage member access.

## Local Development Setup

### 1. Environment Variables

For local development and testing, the `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET` are expected to be set as environment variables in your shell or passed as build arguments to Docker.

**Important:** Never hardcode sensitive credentials directly into your code or commit them to version control.

**Setup Steps:**
1. Copy the example environment file: `cp server/.env.example server/.env`
2. Edit `server/.env` with your actual Google OAuth credentials
3. Follow the GCP setup instructions below to obtain your credentials

### 2. Google Cloud Platform (GCP) OAuth Setup Hints
To obtain your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Navigate to **APIs & Services > Credentials**.
3.  Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
4.  Choose **Web application** as the Application type.
5.  Configure the following:
    *   **Name:** `bandorg_webclient` (or a name of your choice)
    *   **Authorized JavaScript origins:**
        *   `http://localhost:3001` (for local development)
    *   **Authorized redirect URIs:**
        *   `http://localhost:3001/auth/google/callback` (for local development)
6.  Click **CREATE** and copy your Client ID and Client Secret into your `server/.env` file.

### 3. Install Dependencies and Run

After setting up the `.env` file and GCP credentials, you can install dependencies and run the application:

```bash
npm install # in the root directory to install concurrently
npm install # in the client directory
npm install # in the server directory
npm start # in the root directory to start both client and server
```

Alternatively, to run with Docker, you must pass the `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET` as build arguments:

```bash
docker build \
  --build-arg GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID \
  --build-arg GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET \
  --build-arg SESSION_SECRET=YOUR_SESSION_SECRET \
  --build-arg ADMIN_EMAIL=your-admin-email@example.com \
  -t bandorg .
```

Then, run the Docker container:

```bash
docker run -p 3001:3001 bandorg
```

## Contribution
For suggestions or improvements, please open an issue or submit a pull request.

---

For more details, see the full [Product Requirements Document](./PRD.md).

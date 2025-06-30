# Band Calendar Hub Documentation

Welcome to the documentation for **Band Calendar Hub** – a private, mobile-first web application for band members to securely share and coordinate calendar events.

## Overview
Band Calendar Hub enables bands to centralize rehearsal schedules, performance dates, and other events in one secure, Google Account-authenticated platform. Only approved members can access and manage the calendar.

## Key Features
- Google OAuth authentication (secure, member-only access)
- Admin interface for managing authorized users
- Mobile-first, responsive calendar views (monthly, weekly, daily)
- Event creation, editing, and categorization
- Touch-optimized UI for smartphones
- Event notifications and reminders
- Audit log and admin dashboard

## Technology Stack
- **Frontend:** React.js or Vue.js, Tailwind CSS
- **Backend:** Node.js/Express.js or Python/FastAPI
- **Database:** Google Cloud Firestore
- **Authentication:** Firebase Auth (Google OAuth)
- **Hosting:** Google Cloud Run (serverless)

## Documentation Contents
- `PRD.md`: Full Product Requirements Document
- Additional guides and technical documentation (coming soon)

## Getting Started
1. Review the `PRD.md` for detailed requirements and user stories.
2. Follow the technical architecture recommendations for setup.
3. Use the admin dashboard to manage member access.

## Local Development Setup

### 1. Environment Variables (`server/.env`)
Create a file named `.env` in the `server/` directory with the following content. Replace the placeholder values with your actual credentials:

```
# Google OAuth Client ID - Obtain this from Google Cloud Console
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Google OAuth Client Secret - Obtain this from Google Cloud Console
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# Session Secret - A long, random string for session encryption
SESSION_SECRET=YOUR_STRONG_RANDOM_SESSION_SECRET_HERE

# Admin Email - The email address of the default admin user
ADMIN_EMAIL=john@alien-planet.net
```

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

Alternatively, to run with Docker:

```bash
docker build -t bandorg .
docker run -p 3001:3001 bandorg
```

## Contribution
For suggestions or improvements, please open an issue or submit a pull request.

---

For more details, see the full [Product Requirements Document](./PRD.md).

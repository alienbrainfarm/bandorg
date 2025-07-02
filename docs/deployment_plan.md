# GCP Deployment Plan

This document outlines the plan to deploy the Band Calendar Hub application to Google Cloud Platform (GCP). The plan is divided into phases and sessions to allow for iterative development and deployment.

## Phase 1: Local Development Refinement

*Goal: Ensure the application is fully functional and tested in the local Docker environment before moving to the cloud.*

**Session 1: Feature Completeness**
- [ ] Implement "edit event" functionality.
- [ ] Implement "delete event" functionality.
- [ ] Implement user management features as per `PRD.md` (Admin roles, promoting/demoting users).

**Session 2: Testing**
- [ ] Write backend tests for "edit event" and "delete event" APIs.
- [ ] Write backend tests for user management APIs.
- [ ] Write frontend tests for all new features.

**Session 3: Documentation and Cleanup**
- [ ] Update `README.md` to reflect the final state of the local development setup.
- [ ] Clean up any unused code or files.

## Phase 2: GCP Setup and Migration

*Goal: Prepare the GCP environment and migrate the application from local dependencies to cloud services.*

**Session 4: GCP Project and Firestore Setup**
- [ ] Create a new GCP project.
- [ ] Enable required APIs (Firestore, Cloud Build, Cloud Run).
- [ ] Create a Firestore database.
- [ ] Define and implement the Firestore schema based on `PRD.md`.

**Session 5: Authentication Migration**
- [ ] Set up Firebase Authentication.
- [ ] Replace the `passport-google-oauth20` implementation with Firebase Authentication on the server.
- [ ] Update the client-side authentication flow to work with Firebase.

**Session 6: Database Migration**
- [ ] Refactor the server-side code to use Firestore instead of `db.json`.
- [ ] Create scripts to migrate existing data from `db.json` and `authorized_users.json` to Firestore (optional, for development).

## Phase 3: Deployment

*Goal: Containerize and deploy the application to GCP Cloud Run.*

**Session 7: Containerization and CI/CD**
- [ ] Review and update the `Dockerfile` for production.
- [ ] Set up a `cloudbuild.yaml` file for Google Cloud Build.
- [ ] Configure Cloud Build triggers (e.g., on push to `main` branch).

**Session 8: Cloud Run Deployment**
- [ ] Deploy the container to Cloud Run.
- [ ] Configure environment variables for the Cloud Run service.
- [ ] Test the deployed application.

## Phase 4: Post-Deployment

*Goal: Ensure the application is stable, monitored, and accessible.*

**Session 9: Monitoring and Domain**
- [ ] Set up logging and monitoring in GCP.
- [ ] Map a custom domain to the Cloud Run service.
- [ ] Final verification and user acceptance testing.

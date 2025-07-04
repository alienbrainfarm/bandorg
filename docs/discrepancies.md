# Project Discrepancies

This document outlines the discrepancies found between the project's documentation (PRD.md and README.md) and the actual implementation.

## 1. Tech Stack

*   **Database:** The PRD specifies the use of **Google Cloud Firestore** as the database, but the project is currently using a local `db.json` file for data storage. This is a major architectural difference.
*   **Authentication:** The PRD recommends **Firebase Authentication**, while the project implements authentication using `passport-google-oauth20`.

## 2. Database Schema

*   The `authorized_users.json` file is used instead of a database table for storing authorized users.
*   The PRD defines `createdBy` and `lastUpdatedBy` fields in the `events` table, which are not present in the `db.json` file.

## 3. Features

*   **Event Management:** The PRD states that users can edit and delete their own events, and admins can delete any event. This functionality has been implemented and verified.
*   **User Management:** The PRD describes a role-based access control system with admin and member roles. The current implementation seems to have a simpler user management system, but the admin interface visibility has been addressed.

## 4. Local Development Setup

*   The `README.md` file mentions a `server/.env` file for storing environment variables. While this file is not committed, the `ADMIN_EMAIL` is now handled at runtime, ensuring the superadmin is always present.

## 5. Recommendations

*   **Database:** Decide whether to proceed with the local `db.json` file or migrate to Google Cloud Firestore as specified in the PRD. If Firestore is the chosen path, the database logic in the server needs to be updated.
*   **Authentication:** The current `passport-google-oauth20` implementation is functional and has been fully tested. It's worth considering if migrating to Firebase Authentication would offer any advantages, as suggested in the PRD.
*   **Features:** The core event management features (create, edit, delete) are implemented. Further enhancements to user management can be considered.
*   **Documentation:** The `README.md` has been updated to reflect the current project setup, including the superadmin handling and improved UI features.

# Project Discrepancies

This document outlines the discrepancies found between the project's documentation (PRD.md and README.md) and the actual implementation.

## 1. Tech Stack

*   **Database:** The PRD specifies the use of **Google Cloud Firestore** as the database, but the project is currently using a local `db.json` file for data storage. This is a major architectural difference.
*   **Authentication:** The PRD recommends **Firebase Authentication**, while the project implements authentication using `passport-google-oauth20`.

## 2. Database Schema

*   The `authorized_users.json` file is used instead of a database table for storing authorized users.
*   The PRD defines `createdBy` and `lastUpdatedBy` fields in the `events` table, which are not present in the `db.json` file.

## 3. Features

*   **Event Management:** The PRD states that users can edit and delete their own events, and admins can delete any event. The existing tests only cover event creation and retrieval, suggesting that update and delete functionalities might be missing.
*   **User Management:** The PRD describes a role-based access control system with admin and member roles. The current implementation seems to have a simpler user management system.

## 4. Local Development Setup

*   The `README.md` file mentions a `server/.env` file for storing environment variables, but this file is not present in the project structure. This could cause confusion for developers trying to set up the project locally.

## 5. Recommendations

*   **Database:** Decide whether to proceed with the local `db.json` file or migrate to Google Cloud Firestore as specified in the PRD. If Firestore is the chosen path, the database logic in the server needs to be updated.
*   **Authentication:** The current `passport-google-oauth20` implementation is functional, but it's worth considering if migrating to Firebase Authentication would offer any advantages, as suggested in the PRD.
*   **Features:** Implement the missing event management features (edit and delete) and enhance the user management system to align with the PRD.
*   **Documentation:** Update the `README.md` to reflect the actual project setup, including the correct database and authentication methods, and provide clear instructions for setting up the environment.

# Plan to Fix Issues (Plan B)

This document outlines a multi-step plan to address the issues identified in `docs/issues.md`, incorporating recommendations from `docs/GTP41-recommendations.md` and considering the discrepancies noted in `docs/discrepancies.md`.

## Phase 1: Superadmin and Test Environment Stabilization

**Objective:** Ensure the superadmin is correctly managed at runtime and that tests are isolated from this logic.

### Step 1.1: Implement Runtime Superadmin Check
- **Issue Addressed:** "Superadmin is only set at build time, not at runtime"
- **Description:** Implement the logic from `docs/GTP41-recommendations.md` into `server/src/index.js` to ensure the `ADMIN_EMAIL` from the environment variables is always present and marked as admin in `authorized_users.json` at server startup.
- **Verification:** Manually test by starting the server with a new `ADMIN_EMAIL` and verifying `authorized_users.json`.

### Step 1.2: Ensure Test Isolation for Superadmin Logic
- **Issue Addressed:** "Superadmin logic interferes with test isolation (`authorized_users.json` modified during tests)"
- **Description:** Ensure the superadmin runtime check is *only* executed when `NODE_ENV` is not `'test'`, as suggested in `docs/GTP41-recommendations.md`. This should prevent `authorized_users.json` from being modified during test runs.
- **Verification:** Run all server-side tests (`npm test` in `server` directory) and confirm no unexpected modifications to `authorized_users.json` occur.

## Phase 2: Frontend UI/UX Improvements

**Objective:** Resolve visual and interaction issues in the client-side application.

### Step 2.1: Fix Placeholder Title
- **Issue Addressed:** "Placeholder title is shown on the website instead of the intended landing page"
- **Description:** Investigate `client/src/App.js`, `client/public/index.html`, and related components to identify and replace the placeholder title with the correct application title.
- **Verification:** Verify the correct title is displayed in the browser tab and on the landing page.

### Step 2.2: Correct Calendar Component Theme
- **Issue Addressed:** "Calendar component does not render with the correct blue/green theme"
- **Description:** Examine `client/src/components/Calendar.css`, `client/src/tailwind.css`, and `client/public/tailwind.output.css` to debug why the blue/green theme is not applying. This might involve checking Tailwind CSS configuration and class application.
- **Verification:** Visually confirm the calendar component displays the intended blue/green theme.

### Step 2.3: Improve Year/Week/Day Views
- **Issue Addressed:** "The year/week/day views are ugly and not in calendar format"
- **Description:** Refactor `client/src/pages/YearView.js`, `client/src/pages/WeekView.js`, and `client/src/pages/DayView.js` to use `react-big-calendar` or a similar calendar library component to display events in a proper calendar format, aligning with the PRD's mobile-first design.
- **Verification:** Visually confirm the year, week, and day views are well-formatted and functional calendar displays.

### Step 2.4: Enhance Event Details Popup
- **Issue Addressed:**
    - "When Adding an event 'Event Details' is displayed. There is no need."
    - "The Event details popup needs an X so it can be closed/canceled"
    - "Using ESC does not close the Event/Details popup"
- **Description:**
    - Modify `client/src/components/EventModal.js` to remove the redundant "Event Details" display when adding a new event.
    - Add a close button (e.g., an 'X') to the `EventModal` for explicit closing.
    - Implement logic in `EventModal.js` to close the modal when the ESC key is pressed.
- **Verification:** Test event creation, ensure the redundant title is gone, and verify both 'X' button and ESC key close the modal.

### Step 2.5: Prevent Interaction with Background Buttons
- **Issue Addressed:** "If the hamburger menu is open, don't allow buttons outside of it to be active"
- **Description:** Implement a mechanism (e.g., a modal overlay or disabling pointer events on background elements) in `client/src/components/HamburgerMenu.js` and related components to prevent interaction with elements outside the hamburger menu when it's open.
- **Verification:** Open the hamburger menu and attempt to click on elements outside of it; confirm they are unresponsive.

## Phase 3: Event Management and Admin Interface Refinements

**Objective:** Ensure event creation/editing functions correctly and the admin interface is accessible.

### Step 3.1: Verify Event Creation and Editing
- **Issue Addressed:** "Event creation and editing not functioning as expected"
- **Description:** Thoroughly test the event creation and editing workflows, including saving, updating, and displaying events. Debug any issues found in `client/src/components/EventModal.js` and relevant backend API endpoints in `server/src/controllers/` or `server/src/routes/`.
- **Verification:** Successfully create, edit, and view events.

### Step 3.2: Ensure Admin Interface Visibility
- **Issue Addressed:** "The Admin interface does not appear when called from the year/week/day menus"
- **Description:** Investigate the routing and rendering logic in `client/src/pages/YearView.js`, `client/src/pages/WeekView.js`, `client/src/pages/DayView.js`, and `client/src/pages/ManageUsersPage.js` to ensure the admin interface (likely `ManageUsersModal.js` or `ManageUsersPage.js`) is correctly triggered and displayed when accessed from the calendar views.
- **Verification:** Navigate to the admin interface from each calendar view and confirm it appears correctly.

## Phase 4: Authentication Flow Testing and Documentation Updates

**Objective:** Fully test the Google OAuth flow and update documentation.

### Step 4.1: Fully Test Google OAuth Authentication Flow
- **Issue Addressed:** "Google OAuth authentication flow not fully tested"
- **Description:** Conduct comprehensive testing of the Google OAuth authentication flow, including successful login, logout, and handling of unauthorized access attempts. This may involve reviewing `server/src/auth.js`, `server/src/passportConfig.js`, and client-side authentication logic.
- **Verification:** Confirm all authentication scenarios work as expected.

### Step 4.2: Update Documentation
- **Description:** As issues are resolved and changes are implemented, update `docs/README.md` and `docs/discrepancies.md` to reflect the current state of the project, especially regarding the superadmin setup, database usage, and authentication methods.
- **Verification:** Review documentation for accuracy and completeness.

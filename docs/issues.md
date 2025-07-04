# Testing Issues Checklist

Use this checklist to track issues found during testing. Check off issues as they are resolved.

- [ ] Superadmin is only set at build time, not at runtime
- [ ] Superadmin logic interferes with test isolation (`authorized_users.json` modified during tests)
- [x] Placeholder title is shown on the website instead of the intended landing page
- [x] Calendar component does not render with the correct blue/green theme
- [ ] Google OAuth authentication flow not fully tested
- [x] Event creation and editing not functioning as expected
- [ ] The Admin interface does not appear when called from the year/week/day menus
- [x] The year/week/day views are ugly and not in calendar format
- [x] When Adding an event "Event Details" is displayed. There is no need.
- [x] The Event details popup needs an X so it can be closed/canceled
- [x] Usinging ESC does not close the Event/Details popup
- [x] If the hamburger menu is open, dont allow buttons outside of it to be active

_Add new issues below as they are discovered. Check them
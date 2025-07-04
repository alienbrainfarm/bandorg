# GPT-4.1 Recommendations for Superadmin Setup

## Issue Identified

The current implementation sets the superadmin (primary admin) email in `authorized_users.json` at Docker image build time using the `ADMIN_EMAIL` build argument. This approach has several limitations:

- The superadmin is only set during the image build process. If you want to change the superadmin, you must rebuild the Docker image.
- If `authorized_users.json` is deleted or overwritten at runtime, the superadmin information is lost.
- There is no mechanism to ensure the superadmin (from `.env`) always exists in `authorized_users.json` at runtime.

## Recommendation

**Always ensure the superadmin (from `process.env.ADMIN_EMAIL`) exists in `authorized_users.json` and is marked as admin at server startup.**

This allows you to change the superadmin by updating the `.env` file and restarting the server, without needing to rebuild the Docker image.

## Implementation Example

Add the following logic at the top of your `server/src/index.js` file, before the server starts.  
**Important:** To avoid interfering with automated tests, only run this logic when `NODE_ENV` is not set to `'test'`:

```javascript
if (process.env.NODE_ENV !== 'test') {
  // Ensure superadmin exists in authorized_users.json at runtime
  (async () => {
    const superadminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    if (!superadminEmail) return;
    try {
      let users = [];
      if (fs.existsSync(authorizedUsersPath)) {
        users = JSON.parse(await fsPromises.readFile(authorizedUsersPath, 'utf8'));
      }
      if (!users.some(u => u.email === superadminEmail)) {
        users.push({ email: superadminEmail, isAdmin: true });
        await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(users, null, 2));
        console.log(`Superadmin ${superadminEmail} added to authorized_users.json`);
      } else {
        // Ensure superadmin is always admin
        users = users.map(u =>
          u.email === superadminEmail ? { ...u, isAdmin: true } : u
        );
        await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(users, null, 2));
      }
    } catch (err) {
      console.error('Error ensuring superadmin in authorized_users.json:', err);
    }
  })();
}
```

## Summary

This approach ensures the superadmin is always present and has admin rights, based on the current `.env` at runtime, not just at build time.  
By skipping this logic during tests (`NODE_ENV === 'test'`), you avoid interfering with test isolation and allow tests to control the state of `authorized_users.json` as needed.
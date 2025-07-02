const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const authorizedUsersPath = path.join(__dirname, '../authorized_users.json');

const readAuthorizedUsers = async () => {
  if (!fs.existsSync(authorizedUsersPath)) {
    return [];
  }
  try {
    const data = await fsPromises.readFile(authorizedUsersPath, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error('authorized_users.json is malformed, re-initializing:', e);
    await fsPromises.writeFile(authorizedUsersPath, '[]', 'utf8');
    return [];
  }
};

const writeAuthorizedUsers = async (users) => {
  await fsPromises.writeFile(authorizedUsersPath, JSON.stringify(users, null, 2));
};

module.exports = {
  readAuthorizedUsers,
  writeAuthorizedUsers,
  authorizedUsersPath
};
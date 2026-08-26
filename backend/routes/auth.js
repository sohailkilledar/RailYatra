const express = require('express');
const crypto = require('crypto');
const { readData, writeData } = require('../storageManager');
const { HashMap } = require('../dsa/hashMap');

const router = express.Router();

function loadUserMap() {
  const users = readData('users.json', []);
  const map = new HashMap();
  for (const user of users) {
    map.set(user.email, user);
  }
  return map;
}

function saveUserMap(map) {
  writeData('users.json', map.values());
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const userMap = loadUserMap();

  if (userMap.has(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: 'U' + Date.now(),
    name,
    email,
    password: hashPassword(password)
  };

  userMap.set(email, newUser);
  saveUserMap(userMap);

  res.json({ id: newUser.id, name: newUser.name, email: newUser.email });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const userMap = loadUserMap();
  const user = userMap.get(email);

  if (!user || user.password !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ id: user.id, name: user.name, email: user.email });
});

module.exports = router;

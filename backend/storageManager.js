const fs = require('fs');
const path = require('path');

const storageDir = path.join(__dirname, 'storage');

function ensureFile(fileName, defaultValue) {
  const filePath = path.join(storageDir, fileName);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
  return filePath;
}

function readData(fileName, defaultValue) {
  const filePath = ensureFile(fileName, defaultValue);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeData(fileName, data) {
  const filePath = ensureFile(fileName, data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readData, writeData };

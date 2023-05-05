const path = require('node:path');
const fs = require('node:fs');
const process = require('node:process');
const { stdin } = process;

const txtPath = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(txtPath);

console.log('Hi! Write something here:');

process.on('exit', () => {
  console.log('Nice to meet you! Bye!');
});

process.on('SIGINT', () => {
  process.exit();
});

stdin.on('data', (data) => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  writeStream.write(data);
});
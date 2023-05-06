const path = require('node:path');
const fs = require('node:fs');
const process = require('node:process');
const { stdin: input, stdout: output } = require('node:process');
const readline = require('node:readline');

const txtPath = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(txtPath);
const rl = readline.createInterface({ input, output });

console.log('Hi! Write something here:');

process.on('exit', () => {
  console.log('Nice to meet you! Bye!');
});

process.on('SIGINT', () => {
  process.exit();
});

rl.on('line', (data) => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  }
  writeStream.write(`${data}\n`);
});

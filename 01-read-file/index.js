const path = require('node:path'); 
const fs = require('fs');
const txtPath = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(txtPath);
stream.setEncoding('utf-8');

stream.on('data', (chunk) => {
  console.log(chunk);
});

stream.on('error', (error) => {
  console.log(`Something went wrong: ${error.message}`);
});

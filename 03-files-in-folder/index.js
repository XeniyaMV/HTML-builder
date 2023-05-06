const path = require('node:path');
const fs = require('node:fs/promises');

const secretFolderPath = path.join(__dirname, 'secret-folder');

async function findFiles(myPath) {
  try {
    const files = await fs.readdir(myPath, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    for (const file of files) {
      if (file.isFile()) {
        const stat = await fs.stat(path.join(myPath, file.name));
        const output = `${path.parse(file.name).name} - ${path.parse(file.name).ext.replace('.', '')} - ${stat.size}`;
        console.log(output);
      }
    }
  } catch (err) {
    console.log(err.message);
  }
}

findFiles(secretFolderPath);
const path = require('node:path');
const fs = require('node:fs/promises');

async function copyDir(pathFrom, pathTo) {
  try {
    await fs.mkdir(pathTo, { recursive: true });
    const fromDirContent = await fs.readdir(pathFrom, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    const toDirContent = await fs.readdir(pathTo, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    
    if (toDirContent.length !== 0) {
      for (const item of toDirContent) {
        if (item.isDirectory()) {
          await fs.rm(path.join(pathTo, item.name), {recursive: true});
        } else {
          await fs.unlink(path.join(pathTo, item.name));
        }
      }
    }
    for (const item of fromDirContent) {
      const pathFileFrom = path.join(pathFrom, item.name);
      const pathFileTo = path.join(pathTo, item.name);
      if (item.isDirectory()) {
        copyDir(pathFileFrom, pathFileTo);
      } else {
        fs.copyFile(pathFileFrom, pathFileTo);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

const pathFrom = path.join(__dirname, 'files');
const pathTo = path.join(__dirname, 'files-copy');
copyDir(pathFrom, pathTo); 

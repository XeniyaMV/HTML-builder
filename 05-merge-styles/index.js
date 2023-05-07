const path = require('node:path');
const fs = require('node:fs');
const fsP = require('node:fs/promises');

async function readFile(pathReadFile) {
  const openFile = await fsP.open(pathReadFile);
  const stream = openFile.createReadStream();
  let fileContent = '';
  stream.setEncoding('utf-8');

  for await (const data of stream) {
    fileContent += data;
  }
  stream.on('error', (err) => {
    console.log(err);
  });
  return fileContent;
}

function writeFile(pathWriteFile, content) {
  const stream = fs.createWriteStream(pathWriteFile);
  content = content.join('\n');
  stream.write(content);
}

async function createBundle(pathBundleFolder) {
  const pathBundle = path.join(pathBundleFolder, 'bundle.css');
  const stylesPath = path.join(__dirname, 'styles');
  let styles = [];
  try {
    const stylesCont = await fsP.readdir(stylesPath, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    for (const item of stylesCont) {
      if(item.isFile()) {
        if (path.extname(item.name) === '.css') {
          const style = await readFile(path.join(stylesPath, item.name));
          styles.push(style);
        }
      }
    }
    writeFile(pathBundle, styles);
  } catch (err) {
    console.log(err);
  }

}

const pathBundleFolder = path.join(__dirname, 'project-dist');
createBundle(pathBundleFolder);
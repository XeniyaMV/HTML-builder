const path = require('node:path');
const fs = require('node:fs');
const fsP = require('node:fs/promises');
const readline = require('node:readline');


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

function writeLineFile(pathTo, components) {
  const stream = fs.createWriteStream(pathTo);
  const rl = readline.createInterface({
    input: fs.createReadStream(path.join(__dirname, 'template.html')),
  });

  rl.on('line', (line) => {
    const index = line.toString().search(/\S/);
    const myLine = line.toString().trim();
    const array = myLine.split(' ');
    const pattern = /{{[a-z]*}}/;
    let space = '';
    for (let i = 0; i < index; i++) {
      space += ' ';
    }

    for (let item of array) {
      if (item.match(pattern)) {
        const template = item.match(pattern)[0].slice(2, -2);
        if (Object.prototype.hasOwnProperty.call(components, template)) {
          let stringComponents = components[template].split('\n');
          for (let i = 0; i < stringComponents.length; i += 1) {
            stringComponents[i] = `${space}${stringComponents[i]}`;
          }
          stream.write(stringComponents.join('\n'));
          if (array.indexOf(item) === 0 && array.length !== 1) {
            stream.write('\n');
          }
        } else {
          item = `${space}${item}`;
          stream.write(item);
        }
      } else {
        if (array.indexOf(item) === 0) {
          item = `${space}${item}`;
        }
        stream.write(item);
        stream.write(' ');
      }
    }
    stream.write('\n');
  });
}

async function createBundle(pathBundleFolder) {
  const pathBundle = path.join(pathBundleFolder, 'style.css');
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

async function copyDir(pathFrom, pathTo) {
  try {
    await fsP.mkdir(pathTo, { recursive: true });
    const fromDirContent = await fsP.readdir(pathFrom, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    const toDirContent = await fsP.readdir(pathTo, {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    
    if (toDirContent.length !== 0) {
      for (const item of toDirContent) {
        if (item.isDirectory()) {
          await fsP.rm(path.join(pathTo, item.name), {recursive: true});
        } else {
          await fsP.unlink(path.join(pathTo, item.name));
        }
      }
    }
    for (const item of fromDirContent) {
      const pathFileFrom = path.join(pathFrom, item.name);
      const pathFileTo = path.join(pathTo, item.name);
      if (item.isDirectory()) {
        copyDir(pathFileFrom, pathFileTo);
      } else {
        fsP.copyFile(pathFileFrom, pathFileTo);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

async function buildPage () {
  try {
    await fsP.mkdir(path.join(__dirname, 'project-dist'), { recursive: true });
    const componentsFolder = await fsP.readdir(path.join(__dirname, 'components'), {
      encoding: 'utf-8',
      withFileTypes: true,
    });
    const components = {};
    for (const file of componentsFolder) {
      if (file.isFile()) {
        if (path.extname(file.name) === '.html') {
          const name = path.parse(file.name).name;
          const filePath = path.join(__dirname, 'components', file.name);
          components[name] = await readFile(filePath);
        }
      }
    }
    writeLineFile(path.join(__dirname, 'project-dist', 'index.html'), components);
    createBundle(path.join(__dirname, 'project-dist'));
    copyDir(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
  } catch (err) {
    console.log(err);
  }
}

buildPage();
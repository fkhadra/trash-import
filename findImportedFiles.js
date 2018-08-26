const fs = require('fs');
const { join, basename, extname } = require('path');
const { createInterface } = require('readline');

const PATTERN = {
  MATCH: /(import|export) .+ from ('.+';|".+";|'.+'|".+")/,
  IS_IMPORT: /import| export \*| export {/
};

async function getImportedFiles(fileList) {
  const imported = new Set();
  const promises = [];

  for (const filePath of fileList) {
    const currentPath = filePath.replace(basename(filePath), '');
    let buffer = '';
    promises.push(
      new Promise((resolve, reject) => {
        createInterface({
          input: fs.createReadStream(filePath)
        })
          .on('line', line => {
            const hasBuffer = buffer.length > 0;
            if (
              PATTERN.IS_IMPORT.test(line) ||
              hasBuffer
            ) {
              const match = hasBuffer
                ? buffer.match(PATTERN.MATCH)
                : line.match(PATTERN.MATCH);

              if (match) {
                f = match[2].replace(/;|'|"/g, '');
                imported.add(join(currentPath, f));
              } else {
                buffer = `${buffer} ${line}`;
                const match = buffer.match(PATTERN.MATCH);
                if (match) {
                  buffer = '';
                  f = match[2].replace(/;|'|"/g, '');
                  imported.add(join(currentPath, f));
                }
              }
            }
          })
          .on('close', () => resolve(imported));
      })
    );
  }

  await Promise.all(promises);

  return imported;
}

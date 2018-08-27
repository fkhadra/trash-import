const { createReadStream } = require('fs');
const { join, basename } = require('path');
const { createInterface } = require('readline');
const StringBuffer = require('./StringBuffer');

const PATTERN = {
  MATCH: /(import|export) .+ from ('.+';|".+";|'.+'|".+")/,
  COULD_BE_IMPORT: /^import|^export \*|^export {/
};

function getAbsoluteImportFromMatch(path, value) {
  return join(path, value.replace(/;|'|"/g, ''));
}

async function scanImport(fileList) {
  const imported = new Set();
  const promises = [];

  for (const filePath of fileList) {
    const currentPath = filePath.replace(basename(filePath), '');
    const stringBuffer = new StringBuffer();

    promises.push(
      new Promise(resolve => {
        createInterface({
          input: createReadStream(filePath)
        })
          .on('line', line => {
            if (
              PATTERN.COULD_BE_IMPORT.test(line)
              || !stringBuffer.isEmpty()) {

              const match = stringBuffer.isEmpty()
                ? line.match(PATTERN.MATCH)
                : stringBuffer.value.match(PATTERN.MATCH);

              if (match) {
                imported.add(getAbsoluteImportFromMatch(currentPath, match[2]));
              } else {
                stringBuffer.append(line);
                
                const match = stringBuffer.value.match(PATTERN.MATCH);

                if (match) {
                  stringBuffer.clear();
                  imported.add(
                    getAbsoluteImportFromMatch(currentPath, match[2])
                  );
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

module.exports = scanImport;

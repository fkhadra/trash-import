const { readdirSync, lstatSync } = require('fs');
const { join } = require('path');

const tree = [];

function browseDirectory(dir) {
  for (const file of readdirSync(dir)) {
    const currentPathname = join(dir, file);
    const stat = lstatSync(currentPathname);

    if (stat.isFile()) {
      tree.push(currentPathname);
    } else if (stat.isDirectory()) {
      browseDirectory(currentPathname);
    }
  }
  return tree;
}

module.exports = browseDirectory;

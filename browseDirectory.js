const { readdirSync, lstatSync } = require('fs');
const { join, extname, basename } = require('path');

const tree = [];

const directoryToExclude = [
  '.git',
  'node_modules',
  // yep still exists
  '.svn'
];

const extensionToExclude = [
  '.json',
  '.lock',
  '.map'
];

function browseDirectory(dir) {
  for (const pathname of readdirSync(dir)) {
    const currentPathname = join(dir, pathname);
    const stat = lstatSync(currentPathname);

    if (stat.isFile() && !extensionToExclude.includes(extname(pathname))) {
      tree.push(currentPathname);
    } else if (stat.isDirectory() && !directoryToExclude.includes(basename(pathname))) {
      browseDirectory(currentPathname);
    }
  }
  return tree;
}

module.exports = browseDirectory;

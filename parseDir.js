const { readdirSync, lstatSync } = require('fs');
const { join } = require('path');

function parseDir(dir, tree = []) {
  for (const file of readdirSync(dir)) {
    const currentPathname = join(dir, file);
    const stat = lstatSync(currentPathname);
    
    if (stat.isFile()) {
      tree.push(currentPathname);
    } else if (stat.isDirectory()) {
      parseDir(currentPathname, tree);
    }
  }
  return tree;
}

export { parseDir };

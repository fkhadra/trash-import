#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const { join, basename, extname } = require('path');
const { createInterface } = require('readline');


program
  .arguments('<baseDir>')
  .option('--delete', 'Delete files')
  .action(baseDir => {
    console.log(baseDir);
    process.exit();
  })
  // .action(function(file) {
  //   console.log('user: %s pass: %s file: %s',
  //       program.username, program.password, file);
  // })
  .parse(process.argv);

// console.log(program);
// process.exit()



(async function () {
  const tree = parseDir(join(baseDir, 'src'));
  let imported = await getImportedFiles(tree);

  console.log('Number of files: ', tree.length);
  console.log('Number of import: ', imported.size);

  const toDelete = new Set(
    tree.filter(file => {
      if (file.endsWith('src/index.js') || file.endsWith('lib/index.js')) {
        return false;
      } else if (basename(file) === 'index.js') {
        return !imported.has(file.replace('/' + basename(file), ''));
      } else {
        return !imported.has(file.replace(extname(file), ''));
      }
    })
  );

  console.log(toDelete);

  //console.log(toDelete);
  // for (const file of toDelete) {
  //   if (basename(file) !== 'index.js') {
  //     fs.unlinkSync(file);
  //     //  process.exit()
  //   }
  // }
})();

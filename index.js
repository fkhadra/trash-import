#!/usr/bin/env node

const program = require('commander');
const { existsSync } = require('fs');
const { basename, extname, resolve } = require('path');
const browseDirectory = require('./browseDirectory');
const scanImport = require('./scanImport');

program
  .arguments('<directory>')
  .description(`Look 👀 for unused import and remove 💩 the files if you want to.
  src/index.js and lib/index.js are ignored.
  `)
  .option('--delete', 'Delete unused import. BACKUP YOUR FILES FIRST')
  .action(async (directory) => {
    if (! existsSync(directory)) {
      throw new Error("The path provided doesn't match an existing directory")
    }

    const tree = browseDirectory(directory);
    const imported = await scanImport(tree);

    console.log('Number of files:', tree.length);
    console.log('Number of unique import:', imported.size);

    const toDelete = new Set(
      tree.filter(pathname => {
        const fileName = basename(pathname);

        if (pathname.endsWith('src/index.js') || pathname.endsWith('lib/index.js')) {
          return false;
        } else if (fileName === 'index.js') {
          return !imported.has(pathname.replace('/' + fileName, ''));
        } else {
          return !imported.has(pathname.replace(extname(fileName), ''));
        }
      })
    );

    console.log('Number of files to delete:', toDelete.size)
    
    for (const pathname of toDelete) {
      const absolutePathname = resolve(pathname);
      const fileName = basename(pathname);

      console.log('-', absolutePathname);

      if (fileName === 'index.js') {
        console.log('⚠️', `Directory ${absolutePathname.replace(fileName, '')} could be removed`, '⚠️')
      }

      if (program.delete) {
        fs.unlinkSync(absolutePathname);
      }
    }
  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

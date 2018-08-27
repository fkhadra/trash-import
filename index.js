#!/usr/bin/env node

const program = require('commander');
const { existsSync, writeFile } = require('fs');
const { basename, extname, resolve } = require('path');
const browseDirectory = require('./browseDirectory');
const scanImport = require('./scanImport');

program
  .arguments('<directory>')
  .description(
    `Look 👀 for unused import and remove 💩 the files if you want to.`
  )
  .option('-d, --delete', 'Delete unused import. BACKUP YOUR FILES FIRST')
  .option('-o, --output <pathname>', 'Save output to json file')
  .option('-s, --silent', 'Disable output')
  // See later if needed
  // .option(
  //   '-e, --exclude <exclude>',
  //   'List of files or directory comma separeted to exclude',
  //   pathname => pathname.split(',').map(path => resolve(path))
  // )
  .action(async directory => {
    if (!existsSync(directory)) {
      throw new Error("The path provided doesn't match an existing directory");
    }

    const directoryTree = browseDirectory(directory);
    const importedFiles = await scanImport(directoryTree);

    // hardcoded value for the moment
    // if (program.exclude) {
    //   console.log('Excluded:');
    //   for (const file of program.exclude) {
    //     console.log('-', file)
    //   }
    // }

    const filesToDelete = new Set(
      directoryTree.filter(pathname => {
        const fileName = basename(pathname);

        if (
          pathname.endsWith('src/index.js') ||
          pathname.endsWith('lib/index.js')
        ) {
          return false;
        } else if (fileName === 'index.js') {
          return !importedFiles.has(pathname.replace('/' + fileName, ''));
        } else {
          return !importedFiles.has(pathname.replace(extname(fileName), ''));
        }
      })
    );

    const reportToDelete = [];
    const reportToCheck = [];

    for (const pathname of filesToDelete) {
      const absolutePathname = resolve(pathname);
      reportToDelete.push(absolutePathname);

      if (program.delete) {
        fs.unlinkSync(absolutePathname);
      }
    }

    if (! program.silent) {
      console.log('Number of files:', directoryTree.length);
      console.log('Number of unique import:', importedFiles.size);
      console.log('Number of files to delete:', filesToDelete.size);

      for (const pathname of reportToDelete) {
        const fileName = basename(pathname);
        console.log('-', pathname);

        if (fileName === 'index.js') {
          const directory = pathname.replace(
            fileName,
            ''
          );
          reportToCheck.push(directory);

          console.log(
            '⚠️',
            `Directory ${directory} could be removed`,
            '⚠️'
          );
        }
      }
    }

    if (program.output) {
      const report = {
        directory,
        deleteFromDisk: program.delete ? true : false,
        files: directoryTree.length,
        uniqueImport: importedFiles.size,
        toDelete: {
          files: filesToDelete.size,
          list: reportToDelete,
          check: reportToCheck
        }
      };

      writeFile(program.output, JSON.stringify(report, null, 4), (err) => {
        if (err) {
          throw new Error(err);
        }
      });
    }


  })
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

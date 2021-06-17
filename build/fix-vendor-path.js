const { serverBuildDir } = require('./consts');
const fs = require('fs');

/*
 * Webpack chunking seems to have a bug related to relative paths. This script just removes the 
 * unnecessary 'server/' prefix. The 'task/' part comes from AWS. vendor.js should be in the same
 * directory as the handler, but for some reason AWS always wants to ascend a directory (../). Their
 * working dir is called 'task', so descend back down again.
 */
fs.readdir(serverBuildDir, (_err, files) =>
    files.forEach(file => {
        const filePath = `${serverBuildDir}/${file}`;

        fs.readFile(filePath, 'utf8', function (_err, data) {
            const result = data.replace(/server\/vendor.js/g, 'task/vendor.js');
            fs.writeFile(filePath, result, 'utf8', () => {});
        })
    })
);

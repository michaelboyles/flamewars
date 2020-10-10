const fs = require('fs');
const js2ts = require('json-schema-to-typescript');

const dir = '../schemas/';
const extension = '.schema.json';
fs.readdir(dir, (err, files) =>
    files.forEach(file =>
        js2ts.compileFromFile(dir + file, {cwd: dir})
            .then(ts => fs.writeFileSync('dist/' + file.replace(extension, '') + '.ts', ts))
    )
);
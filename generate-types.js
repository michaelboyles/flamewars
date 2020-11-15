const fs = require('fs');
const js2ts = require('json-schema-to-typescript');

const dir = './schemas/';
const extension = '.schema.json';
const outputDir = 'common/types/';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

fs.readdir(dir, (_err, files) =>
    files.forEach(file =>
        js2ts.compileFromFile(dir + file, {cwd: dir})
            .then(ts => fs.writeFileSync(outputDir + file.replace(extension, '') + '.ts', ts))
    )
);
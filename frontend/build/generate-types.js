const { schemaDir, schemaExtension, schemaTypeDir } = require('../../backend/build/consts');
const fs = require('fs');
const js2ts = require('json-schema-to-typescript');

if (!fs.existsSync(schemaTypeDir)) {
    fs.mkdirSync(schemaTypeDir, { recursive: true });
}

fs.readdir(schemaDir, (_err, files) =>
    files.forEach(file =>
        js2ts.compileFromFile(schemaDir + file, {cwd: schemaDir})
            .then(ts => fs.writeFileSync(schemaTypeDir + file.replace(schemaExtension, '') + '.ts', ts))
    )
);

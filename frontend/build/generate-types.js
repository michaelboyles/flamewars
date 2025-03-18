import { schemaDir, schemaExtension, schemaTypeDir } from '../../backend/build/consts.js';
import fs from 'fs';
import js2ts from 'json-schema-to-typescript';

if (!fs.existsSync(schemaTypeDir)) {
    fs.mkdirSync(schemaTypeDir, { recursive: true });
}

fs.readdir(schemaDir, (_err, files) =>
    files.forEach(file =>
        js2ts.compileFromFile(schemaDir + file, {cwd: schemaDir})
            .then(ts => fs.writeFileSync(schemaTypeDir + file.replace(schemaExtension, '') + '.ts', ts))
    )
);

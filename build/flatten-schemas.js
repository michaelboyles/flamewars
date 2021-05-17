const { schemaDir, schemaExtension, schemaBuildDir } = require('./consts');
const fs = require('fs');
const util = require('util');
const refParser = require('@apidevtools/json-schema-ref-parser');
const readdir = util.promisify(fs.readdir);

if (!fs.existsSync(schemaBuildDir)) {
    fs.mkdirSync(schemaBuildDir, { recursive: true });
}

// AWS doesn't like $id attributes so recursively remove them
const removeIds = jsonObj => {
    if (Array.isArray(jsonObj)) {
        jsonObj.forEach(removeIds);
    }
    else if (typeof jsonObj === 'object') {
        delete jsonObj['$id'];
        Object.values(jsonObj).forEach(removeIds);
    }
};

async function flattenSchemas() {
    const files = await readdir(schemaDir);
    files.filter(file => file.endsWith(schemaExtension))
        .forEach(file => {
            refParser.bundle(schemaDir + file, (err, bundledSchema) => {
                if (err) {
                    throw { msg: 'Error while bundling JSON schema', file, err };
                }
                removeIds(bundledSchema);
                fs.writeFile(schemaBuildDir + file, JSON.stringify(bundledSchema), err => {
                    if (err) {
                        throw { msg: 'Error writing file for JSON schema', file, err };
                    }
                });
            })
        });
};

flattenSchemas();

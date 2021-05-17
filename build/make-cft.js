const { schemaBuildDir } = require('./consts');
const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

/*
 * Inject JSON schemas into the CloudFormation Template template -- yes, a template for a template.
 * There are two special directives %USE_SCHEMA% and %USE_SCHEMA_DESC% which take a single argument,
 * a schema filename. This script replaces those directives with the schema content or the description
 * field of the schema respectively. The resulting document is ready for AWS.
 */
async function makeCft() {    
    const files = await readdir(schemaBuildDir);
    if (!files?.length) {
        throw `No schemas found in ${schemaBuildDir}. Did you forget to bundle them first?`;
    }

    const fileNameToData = {};

    for (let file of files) {
        const content = await readFile(schemaBuildDir + file, 'utf8');
        fileNameToData[file] = {
            content: content,
            description: JSON.parse(content).description
        };
    }

    let cftTemplate = await readFile('cft.yml', 'utf8');
    Object.entries(fileNameToData)
        .forEach(([fileName, data]) => {
            cftTemplate = cftTemplate.replace('%USE_SCHEMA% ' + fileName, data.content);
            cftTemplate = cftTemplate.replace('%USE_SCHEMA_DESC% ' + fileName, data.description);
        });

    const firstUseSchema = cftTemplate.indexOf('%USE_SCHEMA');
    if (firstUseSchema >= 0) {
        const lineNum = cftTemplate.substr(0, firstUseSchema).split('\n').length;
        throw `Unresolved %USE_SCHEMA reference in CFT on line ${lineNum}`;
    }
    
    fs.writeFile('dist/cft.yml', cftTemplate, err => {
        if (err) {
            throw { msg: 'Error writing file for CFT', err };
        }
    });
}

makeCft();

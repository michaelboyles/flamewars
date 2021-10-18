const { buildDir, zipFile } = require('./consts');
const fs = require('fs');
const archiver = require('archiver');

const output = fs.createWriteStream(zipFile);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
    console.log(`Server zip file size: ${archive.pointer()} bytes`);
});
archive.on('error', err => { throw err; });
archive.on('warning', warning => {
    if (warning.code === 'ENOENT') {
        console.warn(warning);
    } else {
        throw warning;
    }
});

archive.pipe(output);
archive.glob('*.js', {cwd: buildDir});
archive.finalize();

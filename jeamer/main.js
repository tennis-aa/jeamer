#!/usr/bin/env node

const path = require('path');
const { render } = require(path.join(__dirname,'render.js'));

const ifile = process.argv[2]
let ofile;

if (process.argv.length === 4) {
    ofile = process.argv[3];
} else {
    const fileParts = ifile.split(".");
    fileParts[fileParts.length - 1] = "html";
    ofile = fileParts.join(".");
}

render(ifile, ofile, "pretty");
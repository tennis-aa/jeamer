import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nunjucks from 'nunjucks';
import * as cheerio from 'cheerio';
import jsbeautify from 'js-beautify';
const beautify_html = jsbeautify.html;
import addBiblio from './biblio.js';

const pkgDir = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.join(pkgDir, 'templates');
const macroDir = path.join(pkgDir, 'macros');

// Configure Nunjucks environment
const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader([ ".", templateDir, macroDir ]),
    { trimBlocks: true, lstripBlocks: true, autoescape: false }
);

const variables = {
    lang: "en",
    revealjs_url: "https://unpkg.com/reveal.js@^4",
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
};

function render(ifile, ofile, format = null) {
    let result = env.render(ifile, variables);
    const $ = cheerio.load(result);
    addBiblio($);
    let out;
    if (format === "pretty") out = beautify_html($.html(),{"indent-size":2});
    else out = $.html();
    fs.writeFileSync(ofile, out, 'utf-8');
}

export default render;

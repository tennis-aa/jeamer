#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const pkgDir = path.dirname(fileURLToPath(import.meta.url));
import { Command } from 'commander';
import render from './render.js';
import { beamerToRevealjs } from './beamerToJeamer.js';

const program = new Command().name("jeamer")
  .description("Create html slides with Nunjucks templates");


program.command("render", { isDefault: true })
  .description("(default command) Create html slides with Nunjucks templates.")
  .argument("<input>", "Input file")
  .option("-o, --output <file>", "output file")
  .option("-p, --pretty", "pretty print")
  .action((ifile,options) => {
    if (options.output === undefined) {
      let fileParts = ifile.split(".");
      fileParts[fileParts.length - 1] = "html";
      options.output = fileParts.join("."); 
    }
    render(ifile,options.output, options.pretty ? "pretty": "unformatted");
  });

program.command("frombeamer")
  .description(`convert a beamer (latex) source file into a template to be used with jeamer 
(this utility is not robust and will likely require several manual adjustments after conversion)`)
  .argument("<input>", "input file")
  .option("-o, --output <file>", "output file")
  .action((ifile,options) => {
    if (options.output === undefined) {
      let fileParts = ifile.split(".");
      fileParts[fileParts.length - 1] = "njk";
      options.output = fileParts.join("."); 
    }
    const tex = fs.readFileSync(ifile,"utf-8");
    const j = beamerToRevealjs(tex);
    fs.writeFileSync(options.output, j, "utf-8");
  });

program.command("init")
  .description("create a base template to start writing your own presentation")
  .option("-o, --output <file>", "name of the file for the slides", "index.njk")
  .action(options => {
    fs.copyFileSync(path.join(pkgDir,"templates","revealjs_base.njk"),options.output);
  });

program.parse();
#!/usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import render from './render.js';
import { beamerToRevealjs } from './beamerToJeamer.js';

const program = new Command();

program.name("jeamer")
  .description("Create html slides from Nunjucks templates")
  .argument("<input>", "Input file")
  .option("-o, --output <output>", "Output file")
  .option("-p, --pretty", "Pretty print")
  .action((ifile,options) => {
    if (options.output === undefined) {
      let fileParts = ifile.split(".");
      fileParts[fileParts.length - 1] = "html";
      options.output = fileParts.join("."); 
    }
    render(ifile,options.output, options.pretty ? "pretty": "unformatted");
  });

program.command("frombeamer")
  .description(`Convert a beamer (latex) source file into a template to be used with jeamer. 
This utility is not robust and will likely require several manual adjustments after conversion.`)
  .argument("<input>", "Input file")
  .option("-o, --output <output>", "Output file")
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

program.parse();
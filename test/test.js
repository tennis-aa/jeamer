import render from '../jeamer/render.js'
render("examples/test_macro.njk", "examples/test_macrojs.html","pretty")

import { beamerToRevealjs } from '../jeamer/beamerToJeamer.js'
import fs from "fs"
const tex = fs.readFileSync("./examples/testlatex.tex","utf-8");
const j = beamerToRevealjs(tex);
fs.writeFileSync("./examples/testlatex.njk", j, "utf-8");
render("./examples/testlatex.njk", "./examples/testlatex.html", "pretty");
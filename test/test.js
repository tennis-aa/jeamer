const path = require('path');
const dir = process.cwd()
const { render } = require(path.join(dir, 'jeamer', 'render.js'));
render("examples/test_macro.njk", "examples/test_macrojs.html","pretty")

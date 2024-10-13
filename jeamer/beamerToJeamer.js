import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const pkgDir = path.dirname(fileURLToPath(import.meta.url));
import { unified } from "unified";
import { unifiedLatexFromString } from "@unified-latex/unified-latex-util-parse";
import { unifiedLatexToHast } from "@unified-latex/unified-latex-to-hast";
import { htmlLike } from "@unified-latex/unified-latex-util-html-like";
import { getArgsContent } from "@unified-latex/unified-latex-util-arguments";
import { printRaw } from "@unified-latex/unified-latex-util-print-raw";
import rehypeStringify from "rehype-stringify";
import jsbeautify from 'js-beautify';
const beautify_html = jsbeautify.html;

const processor1 = unified()
  .use(unifiedLatexFromString, {
    macros: {
      citep: { signature: "s o o m" },
      citet: { signature: "s o o m" },
      citealt: { signature: "s o o m" },
      bibliography: { signature: "m" }
    }
  })
  .use(unifiedLatexToHast, {
    macroReplacements: {
      section: (node) => {
        const args = getArgsContent(node).findLast((x) => x !== null);
        const title = printRaw(args);
        return htmlLike({
          tag: "div",
          attributes: { "data-title": title },
        });
      },
      citep: (node) => {
        const args = getArgsContent(node);
        return {
          type: "string",
          content: '{{ citep("' + printRaw(args[args.length - 1]) + '") }}'
        };
      },
      citet: (node) => {
        const args = getArgsContent(node);
        return {
          type: "string",
          content: '{{ citet("' + printRaw(args[args.length - 1]) + '") }}'
        };
      },
      citealt: (node) => {
        const args = getArgsContent(node);
        return {
          type: "string",
          content: '{{ citealt("' + printRaw(args[args.length - 1]) + '") }}'
        };
      },
      bibliography: (node) => {
        const args = getArgsContent(node);
        return {
          type: "string",
          content: '{{ bibliography("' + printRaw(args[args.length - 1]) + '.bib") }}'
        };
      },
      titlepage: () => {
        return {
          type: "string",
          content: "{{ maketitle() }}"
        };
      },
    },
    environmentReplacements: {
      frame: (node) => {
        let args = getArgsContent(node).findLast((x) => x !== null);
        node.content.unshift(htmlLike({
          tag: "h1",
          content: args
        }))
        return htmlLike({
          tag: "section",
          content: node.content
        })
      },
      note: (node) => {
        return htmlLike({
          tag: "aside",
          attributes: { class: "notes" },
          content: node.content
        });
      },
    }
  })
  .use(rehypeStringify);

function beamerToHTML(s) {
  const out = processor1.processSync(s);
  return String(out);
}

export function beamerToRevealjs(s) {
  const html = beautify_html(beamerToHTML(s), { "indent-size": 2 });
  let j = fs.readFileSync(path.join(pkgDir, "templates", "revealjs_base.njk"), "utf-8");
  j = j.replace("{# insert slides here #}", html);
  return j;
}

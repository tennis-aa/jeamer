import fs from 'fs';
import * as cheerio from 'cheerio';
import Cite from 'citation-js';

const dataCite = ["data-citep", "data-citet", "data-citealt"];

function getCitations($) {
  const citationKeys = new Set();

  $("[data-cite]").each((i, el) => {
    citationKeys.add($(el).attr("data-cite"));
  });

  return Array.from(citationKeys);
}

function buildBibliography(citations, bibliofile) {
  const bibData = fs.readFileSync(bibliofile, 'utf-8');
  const bib = new Cite(bibData);
  const entries = {}
  const citations_good = Array();
  for (let i=0; i<citations.length;++i) {
    const cite = citations[i];
    try {
      const label = bib.format('citation',{template: 'apa', entry: cite}).slice(1,-1);
      const full_citation = bib.format('bibliography',{template: 'apa',format: 'html', entry: cite});
      entries[cite] = [label,full_citation];
      citations_good.push(cite);
    }
    catch{
      console.log("Citation not found in bibliography file: ", cite)
    }
  }
  const entriesHtml = bib.format('bibliography',{template: 'apa', format: 'html', entry: citations_good, asEntryArray: true});
  return [entries, entriesHtml];
}

function mergeBiblio($, entriesHtml) {
  const bibSection = $('section#bibliography');

  entriesHtml.forEach(entry => {
    const div = $('<div>').addClass('bibliography-entry').html(entry[1]);
    bibSection.append(div);
  });

  return $;
}

function inTextStyle(cite) {
  cite.addClass('citation-intext').attr('href', '#/bibliography').get(0).tagName = 'a';
}

function replaceInText($, entries) {
  $('[data-cite]').each((i, cite) => {
    let entry = entries[$(cite).attr('data-cite')]
    entry = entry ? entry[0] : "??";
    if ($(cite).attr('data-citet') !== undefined) {
      const nameYear = entry === '??' ? ['?', '?'] : entry.split(', ');
      $(cite).text(`${nameYear[0]} (${nameYear[1]})`);
      inTextStyle($(cite));
    }
    else if ($(cite).attr('data-citealt') !== undefined) {
      $(cite).text(entry);
      inTextStyle($(cite));
    }
    else if ($(cite).attr('data-citefull')  !== undefined) {
      if (entry !== "??") entry = cheerio.load(entries[$(cite).attr('data-cite')][1])("div div").html(); 
      $(cite).html(entry);
    }
    else { // ($(cite).attr('data-citep')) !== undefined or unspecified
      $(cite).text(`(${entry})`);
      inTextStyle($(cite));
    }
  });

  return $;
}

function addBiblio($) {
  const bibSection = $('section#bibliography');

  if (!bibSection.length) {
    return $;
  }

  const bibliofile = bibSection.attr('data-bibfile');
  if (!bibliofile) {
    console.error("The bibliography section has to specify the data-bibfile attribute with the path to the bibfile.");
    return $;
  }

  const citations = getCitations($);
  const [entries,entriesHtml] = buildBibliography(citations, bibliofile);
  mergeBiblio($, entriesHtml);
  replaceInText($, entries);

  return $;
}

export default addBiblio;

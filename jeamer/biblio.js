import fs from 'fs';
import * as cheerio from 'cheerio';
import Cite from 'citation-js';

function getCitations($) {
  const citationKeys = new Set();

  $("[data-cite]").each((i, el) => {
    let citations = $(el).attr("data-cite").split(",");
    for (let j=0; j < citations.length; ++j)
      citationKeys.add(citations[j].trim());
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
  const perpage = bibSection.attr('data-perpage') || 5;

  let section;
  entriesHtml.forEach((entry, index) => {
    if (index % perpage === 0) {
      section = $('<section>').addClass('bibliography-section');
      bibSection.append(section);
    }
    const div = $('<div>').addClass('bibliography-entry').html(entry[1]);
    section.append(div);
  });

  return $;
}

function inTextStyle(cite) {
  cite.addClass('citation-intext').attr('href', '#/bibliography').get(0).tagName = 'a';
}

function replaceInText($, entries) {
  $('[data-cite]').each((i, cite) => {
    let refs = $(cite).attr('data-cite').split(",").map(s => s.trim());
    let refs_entry = [];
    for (let j=0; j<refs.length; ++j) {
      let entry = entries[refs[j]];
      entry = entry ? entry[0] : "??";
      refs_entry.push(entry);
    }
    if ($(cite).attr('data-citet') !== undefined) {
      let out = "";
      for (let j=0; j<refs.length; ++j) {
        let nameYear = refs_entry[j] === '??' ? ['?', '?'] : refs_entry[j].split(', ');
        out += `${nameYear[0]} (${nameYear[1]}); `;
      }
      out = out.slice(0,-2);
      $(cite).text(out);
      inTextStyle($(cite));
    }
    else if ($(cite).attr('data-citealt') !== undefined) {
      let out = "";
      for (let j=0; j<refs.length; ++j) {
        out += refs_entry[j] + "; ";
      }
      out = out.slice(0,-2);
      $(cite).text(out);
      inTextStyle($(cite));
    }
    else if ($(cite).attr('data-citefull') !== undefined) {
      let out = "";
      for (let j=0; j<refs.length; ++j) {
        if (refs_entry[j] !== "??") out += cheerio.load(entries[refs[j]][1])("div div").html() + "; ";
      }
      out = out.slice(0,-2);
      $(cite).html(out);
    }
    else { // ($(cite).attr('data-citep')) !== undefined or unspecified
      let out = "";
      for (let j=0; j<refs.length; ++j) {
        out += refs_entry[j] + "; ";
      }
      out = out.slice(0,-2);
      $(cite).text("(" + out + ")");
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

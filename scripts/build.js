import 'dotenv/config';

import fse from 'fs-extra';
import path from 'path';

import client from '../lib/contentful.js';
import nunjucks from '../lib/nunjucks.js';

import config from '../config.js';

/**
 * Deletes the dist directory to ensure a clean build.
 *
 * @returns Promise<void>
 */
function clean() {
  return fse.remove('dist');
}

/**
 * Copies static files from src/static to the dist directory.
 *
 * @returns Promise<void>
 */
function copyStatic() {
  return fse.copy('src/static', 'dist');
}

/**
 * Gets entries from Contentful for a given content type.
 *
 * @param {string} contentType
 * @returns Promise<Array>
 */
async function getEntries(contentType) {
  const data = await client.getEntries({
    content_type: contentType,
  });

  return data.items;
}

/**
 * Gets all entries from Contentful, as defined in config.js.
 *
 * @returns Promise.<Array>
 */
async function getAllEntries() {
  const [pages, ...rest] = await Promise.all([
    getEntries('page'),

    // From config.js.
    ...config.data.map(({ contentType }) => (
      getEntries(contentType)
    )),
  ]);

  return [pages, ...rest];
}

/**
 * Gets all data and conforms entries data into usable page
 * data using the keys defined in config.js.
 *
 * @returns Promise<Object>
 */
async function getData() {
  const [pages, ...rest] = await getAllEntries();

  return rest.reduce((acc, items, i) => {
    const key = config.data[i].key;

    return {
      ...acc,
      [key]: items,
    };
  }, { pages });
}

/**
 * Builds a page with data using the given template and
 * context.
 *
 * @param {string} template
 * @param {string} dest
 * @param {Object} ctx
 * @returns Promise<void>
 */
function buildPage(template, dest, ctx = {}) {
  const outputPath = path.normalize(dest);

  return new Promise((resolve) => {
    nunjucks.render(template, ctx, (err, res) => {
      if (err) throw err;

      fse.outputFile(outputPath, res, () => {
        console.log(`Wrote "${outputPath}"`);
        resolve();
      });
    });
  });
}

/**
 * Builds all pages, as defined in config.js.
 *
 * @returns Promise<void>
 */
async function buildPages() {
  const data = await getData();

  // Template globals.
  nunjucks.addGlobal('pages', data.pages);

  // Build pages.
  return Promise.all([
    ...config.targets.map(({ template, dest }) => buildPage(template, dest)),

    // Contentful pages.
    ...data.pages.map((page) => {
      const ctx = page.fields;
      const outputPath = `dist/${ctx.url}/index.html`;

      return buildPage('page.njk', outputPath, ctx);
    }),
  ]);
}

/**
 * Builds the application.
 *
 * @returns Promise<void>
 */
async function build() {
  await clean();
  await buildPages();
  await copyStatic();
}

build();

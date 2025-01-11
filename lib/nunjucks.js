import fs from 'fs';
import nunjucks from 'nunjucks';
import path from 'path';

import markdown from './markdown.js';

/**
 * The Nunjucks environment.
 */
const env = nunjucks.configure('src');

/**
 * Returns the current Nunjucks context.
 * 
 * @example
 * 
 * {{ ctx() | dump }}
 */
env.addGlobal('ctx', function () {
  return this.ctx;
});

/**
 * Reads a file and returns the contents.
 * 
 * @example
 * 
 * {{ readFile("src/test.md") | markdown | safe }}
 */
env.addGlobal('readFile', function (filePath) {
  const fullPath = path.resolve(process.cwd(), filePath);

  const str = fs.readFileSync(fullPath, 'utf8');

  return str;
});

/**
 * Renders a module with the given context. The `moduleId`
 * must correspond to the module's respective file name in
 * `src/modules`.
 * 
 * @example
 * 
 * {{ renderModule("Foo", { foo: 'bar' }) }}
 */
env.addGlobal('renderModule', function (moduleId, extraContext = {}) {
  const template = path.normalize(`modules/${moduleId}.njk`);

  try {
    const res = env.render(template, {
      ...this.ctx,
      ...extraContext,
    });

    return env.filters.safe(res);
  } catch (err) {
    return err.message;
  }
});

/**
 * Like dump, but the output is wrapped in `<pre>` tags.
 * 
 * @example
 * 
 * {{ ctx() | debug }}
 */
env.addFilter('debug', function (obj) {
  const str = `<pre>${env.filters.dump(obj, 2)}</pre>`;

  return env.filters.safe(str);
});

/**
 * Renders markdown.
 * 
 * @example
 * 
 * {{ "# Heading" | markdown | safe }}
 */
env.addFilter('markdown', function (str) {
  if (renderInline) {
    return markdown.renderInline(str);
  } else {
    return markdown.render(str);
  }
});

/**
 * Renders inline markdown (result will not be wrapped in
 * `<p>` tags).
 * 
 * @example
 * 
 * {{ "# Heading" | markdownInline | safe }}
 */
env.addFilter('markdownInline', function (str, renderInline = false) {
  if (renderInline) {
    return markdown.renderInline(str);
  } else {
    return markdown.render(str);
  }
});

export default env;

import fs from 'fs';
import nunjucks from 'nunjucks';
import path from 'path';

import markdown from './markdown.js';

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
 * Reads a file and returns the contents.
 * 
 * @example
 * 
 * {{ "src/test.md" | readFile | markdown | safe }}
 */
env.addFilter('readFile', function (filePath, fn) {
  const fullPath = path.resolve(process.cwd(), filePath);

  try {
    const str = fs.readFileSync(fullPath, 'utf8');
    fn(null, str);
  } catch (error) {
    fn(error, null);
  }
}, true);

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
 * Renders markdown. If `renderInline` is `true`, the
 * result will not be enclosed in `<p>` tags.
 * 
 * @example
 * 
 * {{ "# Heading" | markdown | safe }}
 */
env.addFilter('markdown', function (str, renderInline = false) {
  if (renderInline) {
    return markdown.renderInline(str);
  } else {
    return markdown.render(str);
  }
});

export default env;

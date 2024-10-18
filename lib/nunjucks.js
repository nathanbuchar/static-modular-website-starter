import nunjucks from 'nunjucks';
import path from 'path';

import markdown from './markdown.js';

const env = nunjucks.configure('src');

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

env.addGlobal('ctx', function () {
  return this.ctx;
});

env.addFilter('markdown', function (str, renderInline = false) {
  const renderFn = renderInline ? markdown.renderInline : markdown.render;
  
  return renderFn(str);
});

env.addFilter('selectByField', function (items, field, value = true) {
  return items.filter((item) => {
    return Boolean(item.fields[field]) === value;
  });
});

export default env;

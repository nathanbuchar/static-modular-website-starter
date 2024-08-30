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

env.addFilter('markdown', function (str) {
  return markdown.render(str);
});

env.addFilter('selectByField', function (items, field, value = true) {
  return items.filter((item) => {
    return Boolean(item.fields[field]) === value;
  });
});

export default env;

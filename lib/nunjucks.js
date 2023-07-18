import nunjucks from 'nunjucks';

import markdown from './markdown.js';

const env = nunjucks.configure('src');

// Globals
env.addGlobal('renderModule', (moduleId, data) => {
  const template = `modules/${moduleId}.njk`;

  try {
    return env.filters.safe(env.render(template, data));
  } catch (err) {
    return err.message;
  }
});

// Filters
env.addFilter('markdown', (str) => {
  return markdown.render(str);
});

env.addFilter('selectByField', (items, field, value = true) => {
  return items.filter((item) => {
    return Boolean(item.fields[field]) === value;
  });
});

export default env;

import 'dotenv/config';

import engine from './lib/engine.js';

import clean from './lib/plugins/clean.js';
import contentful from './lib/plugins/contentful.js';
import copy from './lib/plugins/copy.js';

const config = {
  engine,
  plugins: [
    clean('dist'),
    contentful([
      {
        key: 'pages',
        contentType: 'page',
      },
    ]),
    copy([
      {
        from: 'src/static', 
        to: 'dist',
      },
    ]),
  ],
  targets: [
    {
      template: '404.njk',
      dest: 'dist/404.html',
    },
    {
      template: 'test.njk',
      dest: 'dist/test/index.html',
    },
    {
      template: 'debug.njk',
      dest: 'dist/debug/index.html',
      include: '*',
    },
    (ctx) => {
      return ctx.pages.map((page) => {
        return {
          template: 'page.njk',
          dest: `dist/${page.fields.url}/index.html`,
          include: ['pages'],
          extraContext: {
            ...page.fields,
          },
        };
      })
    },
  ],
};

export default config;
import 'dotenv/config';

import client from './lib/client.js';
import engine from './lib/engine.js';

const config = {
  client,
  engine,
  sources: [
    {
      name: 'pages',
      contentType: 'page'
    }
  ],
  targets: [
    {
      src: 'src/static',
      dest: 'dist'
    },
    {
      template: '404.njk',
      dest: 'dist/404.html',
    },
    {
      template: 'test.njk',
      dest: 'dist/test/index.html'
    },
    {
      template: 'debug.njk',
      dest: 'dist/debug/index.html',
      include: '*'
    },
    (data) => {
      return data.pages.map((page) => {
        return {
          template: 'page.njk',
          dest: `dist/${page.fields.url}/index.html`,
          include: ['pages'],
          extraContext: {
            ...page.fields
          }
        };
      })
    }
  ]
};

export default config;
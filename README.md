# Static modular website starter

Extends [Static Website Starter](https://github.com/nathanbuchar/static-website-starter) to support dynamic modules within Contentful.

**Contentful content models**

`Page`

```js
{
  "name": "Page",
  "description": "",
  "displayField": "url",
  "sys": {
    "id": "page",
    // [truncated]
  },
  "fields": [
    {
      "id": "title",
      "name": "Title",
      "type": "Symbol",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false
    },
    {
      "id": "url",
      "name": "URL",
      "type": "Symbol",
      "localized": false,
      "required": true,
      "validations": [
        {
          "unique": true
        },
        {
          "regexp": {
            "pattern": "^\\/([\\w-]+\\/?)*$",
            "flags": null
          }
        }
      ],
      "disabled": false,
      "omitted": false
    },
    {
      "id": "date",
      "name": "Date",
      "type": "Date",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false
    },
    {
      "id": "blogPost",
      "name": "Blog Post",
      "type": "Boolean",
      "localized": false,
      "required": false,
      "validations": [],
      "defaultValue": {
        "en-US": false
      },
      "disabled": false,
      "omitted": false
    },
    {
      "id": "modules",
      "name": "Modules",
      "type": "Array",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false,
      "items": {
        "type": "Link",
        "validations": [],
        "linkType": "Entry"
      }
    }
  ]
}
```

`Markdown`

```js
{
  "name": "Markdown",
  "description": "",
  "displayField": "content",
  "sys": {
    "id": "markdown",
    // [truncated]
  },
  "fields": [
    {
      "id": "content",
      "name": "Content",
      "type": "Text",
      "localized": false,
      "required": true,
      "validations": [],
      "disabled": false,
      "omitted": false
    }
  ]
}
```

`Blog List`

```js
{
  "name": "Blog List",
  "description": "",
  "displayField": "title",
  "sys": {
    "id": "blogList",
    // [truncated]
  },
  "fields": [
    {
      "id": "title",
      "name": "Title",
      "type": "Symbol",
      "localized": false,
      "required": false,
      "validations": [],
      "disabled": false,
      "omitted": false
    }
  ]
}
```

**Scripts**

`npm run build` - Builds the static site.

`npm run server` - Runs the static file server.

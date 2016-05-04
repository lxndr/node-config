Application configuration manager for Node.js and browsers.

**Basics:**

```javascript
const config = new Config()
  /* default values */
  .source({
    a: 1,
    b: [2, 3, true]
  })
  /* browser local storage */
  .source('localStorage', {
    mutable: true
  })
  /* JSON file */
  .source('file', {
    path: './config.json'
  })
  /* YAML file */
  .source('file', {
    path: './config.json',
    parser: 'yaml'
  })
  /* directory */
  .source('directory', {
    path: './config',
    parser: 'yaml' /* defaults to 'json' */
  });

config.reload().catch(error => {
  console.error(error.message);
})
```

```javascript
config.on('b', (value) => {
  console.log(`Value 'b' changed to ${value}`);
});

const b = config.get('b');

config.set('b[2]', false);
```

**Namespaces:**

```javascript
const cfg = config.of('b')
```

**Custom parser:**
```javascript
import * as json5 from 'json5';

const config = new Config()
  .source('file', {
    path: './config.json5',
    parser: {
      parse(text) {
        return json5.parse(text);
      },
      stringify(value) {
        /* prettify output, this have to be human-readable file */
        return json5.stringify(value, ' ', 2);
      }
    }
  });
```

**Custom source:**

```javascript
config.source(new SequelizeConfigSource({
  model: 'param'
}));
```

or

```javascript
/* register configuration source class */
config.register('seqelize', SequelizeConfigSource);
/* add configuration source */
config.source('seqelize', {
  model: 'param'
});

```

on how to make your own configuration source class see '[src/sources](src/sources)' directory.

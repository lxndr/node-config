[![license](https://img.shields.io/github/license/lxndr/node-config.svg?style=flat)](https://tldrlegal.com/license/mit-license) [![dependencies status](https://img.shields.io/david/lxndr/node-config.svg?style=flat)](https://david-dm.org/lxndr/node-config) [![devDependencies status](https://img.shields.io/david/dev/lxndr/node-config.svg?style=flat)](https://david-dm.org/lxndr/node-config#info=devDependencies)

Application configuration manager for Node.js and browsers.

**Basics:**

```javascript
const config = new Config()
  /* default values */
  .use({
    a: 1,
    b: [2, 3, true]
  })
  /* browser local storage */
  .use('localStorage', {
    mutable: true
  })
  /* JSON file */
  .use('file', {
    path: './config.json'
  })
  /* YAML file */
  .use('file', {
    path: './config.json',
    parser: 'yaml'
  })
  /* directory */
  .use('directory', {
    path: './config',
    parser: 'yaml' /* defaults to 'json' */
  });

config.reload().catch(err => {
  console.error(err.message);
})
```

```javascript
config.on('b', value => {
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
  .use('file', {
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

**Custom provider:**

```javascript
config.use(new SequelizeConfigProvider({
  model: 'param'
}));
```

or

```javascript
/* register configuration provider class */
config.register('seqelize', SequelizeConfigProvider);
/* add configuration provider */
config.use('seqelize', {
  model: 'param'
});

```

on how to make your own configuration provider class see [src/providers](src/providers) directory.

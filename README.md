[![license](https://img.shields.io/github/license/lxndr/node-config.svg?style=flat)](https://tldrlegal.com/license/mit-license)
[![dependencies status](https://img.shields.io/david/lxndr/node-config.svg?style=flat)](https://david-dm.org/lxndr/node-config)
[![devDependencies status](https://img.shields.io/david/dev/lxndr/node-config.svg?style=flat)](https://david-dm.org/lxndr/node-config#info=devDependencies)

Application configuration manager for Node.js and browsers.

**API**

```javascript
new Config([options])
  /* static methods */
  register(name, klass) -> void
  /* instance methods */
  use(provider, [options]) -> this
  reload() -> Primise
  persist() -> Promise
  of(key) -> ConfigProxy
  get(key, [defaultValue]) -> any
  set(key, value) -> this
  set(value) -> this
```

**Usage:**

```javascript
const config = new Config({
  enchance: true
});
```

Options:
  - *enchance* (= false) - Forces Config constructor to create proxified version of itself. See below.

**Schema:**

Schema allows you to define what to do with specific parts of your configuration.

This is completely optional and can be defined at any time. Schema mostly used when *reload()* and *persist()* are called, and does not validate values.

```javascript
/* only define default value */
config.schema({
  'user.name': 'guest',
  'user.role': ['guest']
});

/* more complex example */
config.schema({
  'user.role': {
    type: 'array',
    default: ['guest'],
    stringified: true
  }
});
```

*NOTE: Array ['guest'] is just an example, you can default to any type of value.*

**Providers:**

Providers define places and the ways the values for configuration are loaded and stored.

```javascript
/* static object (the object is cloned) */
config.use({
  a: 1,
  b: [2, 3, true]
});

/* registers a function that called every configuration reloaded */
config.use(function () {
  return Promise.resolve({
    user: {
      name: 'guest',
      role: ['guest']
    }
  });
});

/* browser local storage */
config.use('localStorage', {
  mutable: true
});

/* JSON file */
config.use('file', {
  path: './config.json'
});

/* YAML file */
config.use('file', {
  path: './config.yaml',
  parser: 'yaml'
});

/* directory */
config.use('directory', {
  path: './config',
  parser: 'yaml' /* defaults to 'json' */
});
```

You have to call *reload()* after calling *use()*.

**Getting:**

```javascript
/* simple get */
const v = config.get('user.roles');
const v = config.get('user.roles[0]');
/* with default value */
const v = config.get('user.roles', ['guest']);
/* in enchanced mode */
const v = config['user.roles'];
/* or even */
const v = config.user.roles;
```

**Setting:**

```javascript
/* simple set */
config.set('user.name', 'admin');
config.set('user.roles[0]', 'admin');
/* in enchanced mode */
const v = config['user.roles[0]'] = 'admin';
```

**Loading and saving:**

You have to call it every time you add providers.

```javascript
config.reload().catch(err => {
  console.error(err.message);
});
```

You have to call it every time you change configuration and what to save it.

```javascript
config.persist().catch(err => {
  console.error(err.message);
});
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

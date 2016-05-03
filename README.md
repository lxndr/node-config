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
  });

config.reload().catch(error => {
  console.error(error.message);
})
```

**Custom sources:**

```javascript
config.source(new SequelizeConfigSource({
  model: 'param'
}));
```

or

```javascript
/* register configuration source class */
config.register(SequelizeConfigSource);
/* add configuration source */
config.source('seqelize', {
  model: 'param'
});

```

**Namespaces:**

```javascript
const cfg = config.of('b')
```

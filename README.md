# loader-manager

Simply smallest **loader manager** using Promise

[Github repo](https://github.com/williammanco/loader-manager)

## Install

```sh
yarn add loader-manager
```

## Features
```
  ☮️ chainable
  📦 969 byte --- 298 byte (gzipped)
  👟 flexible
```

## Example

```js
import LoaderManager from 'loader-manager'

const loader = new LoaderManager();

// add asset to loader and load and apply a middleware function to change data
loader
  .add('data', './example.json')
  .load(false, (e) => e.children = []);

// add asset to loader and will start only next load method 
loader.add('data', './data.json');

// load only last 2 asset (until last .load())
loader
  .add('mock', './myMock.json')
  .load();

loader
  .add('cats', './catOnTheTable.png')
  .add('banana', './myBanana.png')
  .load((resource) => {
    // get last loaded resource
    console.log(resource);

    // assets loaded in resources property
    console.log(loader.resources);
  });


// if load all assets in batch
loader.batch((e) => {
  console.log('loaded: ', e)
});


```

## Build

```sh
yarn build
```

# License

MIT © [William Manco](mailto:wmanco88@gmail.com)
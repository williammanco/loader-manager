# loader-manager

Simply smallest **loader manager** using Promise

[Github repo](https://github.com/williammanco/loader-manager)

## Install

```sh
yarn add loader-manager
```

## Features
```
  ⛓ chainable
  🛴 simply
  💃 dependency free
  📦 1.2kB - 586B (gzip)
```

## Example

```js
import LoaderManager from 'loader-manager'

const loader = new LoaderManager();

// add asset to loader, load and apply a middleware function to change data
loader
  .add('data', './example.json')
  .load(false, (e) => e.children = []);

// add asset to loader and will start from next load method 
loader.add('data', './data.json');

// load only last 2 asset (until last .load())
loader
  .add('mock', './myMock.json')
  .load();

// add a custom promise to loader
loader.add('myPromise', new Promise());

loader
  .add('cats', './catOnTheTable.png')
  .add('banana', './myBanana.png')
  .load((resources) => {
    // get last loaded resources
    console.log(resources);

    // assets loaded in resources property
    console.log(loader.resources);
  });


// if you want to load all assets togheter
loader.batch((resources) => {
  console.log('loaded: ', resources)
});

// get loaded assets
loader.resources

```

## Build

```sh
npm run-script build
```

# License

MIT © [William Manco](mailto:wmanco88@gmail.com)
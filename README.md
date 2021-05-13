# PuzzleIO / Conductor

Handle the most complex sync/async (or combination of both) workflows in a declarative style.

Conductor helps you making your code more human-readable, although it's super-complex.

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]

## Installation

```sh

# NPM
npm i @puzzleio/conductor --save

# Yarn
yarn install @puzzleio/conductor

```

## Usage

### Simple mode

For most of the cases, simple mode (which uses default settings) works fine, unless you want to have full control over the options (e.g. runner, handler validator, conditional block factory and so on).

```js

const { Conductor } = require('@puzzleio/conductor');

const conductor = Conductor.createDefault();

conductor
  .add((n, m) =>n + m)  // add received numbers together
  .add(n => n + 1)      // increase it by one
  .if({
    check: n => n % 2 === 0, // even number is received
    handler: n => console.log(`${n} is an even number.`)
  }, {
    handler: n => console.log(`if ${n} is not an even number, for sure it's an odd number.`)
  });

conductor.run(1, 2)
  .then(() => console.log('Workflow was executed successfully.'))
  .catch(console.error);

// output will be:
// 4 is an even number.
// Workflow was executed successfully.

```

```ts

import { Conductor } from '@puzzleio/conductor';

const conductor = Conductor.createDefault();

conductor
  .add((n, m) =>n + m)  // add received numbers together
  .add(n => n + 1)      // increase it by one
  .if({
    check: n => n % 2 === 0, // even number is received
    handler: n => console.log(`${n} is an even number.`)
  }, {
    handler: n => console.log(`if ${n} is not an even number, for sure it's an odd number.`)
  });

conductor.run(1, 2)
  .then(() => console.log('Workflow was executed successfully.'))
  .catch(console.error);

// output will be:
// 4 is an even number.
// Workflow was executed successfully.
```

And you're good to go!

## License

MIT

[npm-image]: https://img.shields.io/npm/v/@puzzleio/conductor.svg?color=orange
[npm-url]: https://npmjs.org/package/@puzzleio/conductor/config
[downloads-image]: https://img.shields.io/npm/dt/@puzzleio/conductor.svg
[downloads-url]: https://npmjs.org/package/@puzzleio/conductor

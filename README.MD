## YaBSON

Binary-encoded serialization of JavaScript objects with generator-based parser
and serializer

This library is designed to transfer large arbitrary amounts of data into
chunks. The main goal is to provide a very simple and easily extensible API and
implementation. This also illustrates pedagogically the interest of
[iterators and generators](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Iterators_and_Generators)
in JavaScript. Note that, like the JSON API, this library does not support
circular references.

## Example

```js
import { getParser, getSerializer } from "yabson";
// Deno: import { getParser, getSerializer } from "https://deno.land/x/yabson@v1.0.2";

const object = {
  array: [
    1,
    2,
    3.1415927,
    true,
    undefined,
    null,
    NaN,
    42n,
  ],
  typedArray: new Uint8Array([1, 2, 3]),
  misc: {
    date: new Date(),
    error: new Error("error"),
    regExp: /test/gi,
  },
  map: new Map([["key", "value"], [42, { value: "result" }]]),
  set: new Set([1, 2, 3]),
};

// `chunkSize` (optional) is the max. size in bytes of `chunk` in the for-of loop below
const serializer = getSerializer(object, { chunkSize: 16 });
const parser = getParser();

let result;
for (const chunk of serializer) {
  // `chunk` is a Uint8array of binary encoded data
  result = parser.next(chunk);
}
// displays a deep clone of `object`
console.log(result.value);
```

## Example with a custom type

```js
import {
  getParser,
  getSerializer,
  parseString,
  registerType,
  serializeString,
} from "yabson";

// Custom type class
class CustomType {
  constructor(name) {
    this.name = name;
  }
}

// Register the custom type
registerType(serializeCustomType, parseCustomType, testCustomType);

function* serializeCustomType(data, customType) {
  yield* serializeString(data, customType.name);
}

function* parseCustomType(data) {
  const name = yield* parseString(data);
  return new CustomType(name);
}

function testCustomType(value) {
  return value instanceof CustomType;
}

const array = [
  new CustomType("first"),
  new CustomType("second"),
];

const serializer = getSerializer(array);
const parser = getParser();

let result;
for (const chunk of serializer) {
  result = parser.next(chunk);
}
console.log(result.value);
```

## Install

```sh
npm install https://www.npmjs.com/package/yabson
```

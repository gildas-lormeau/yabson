## YaBSON

YaBSON is a library allowing schemaless binary-encoded parsing/serialization of 
JavaScript data with a generator-based parser/serializer.

This library is designed to transfer large arbitrary amounts of data into
chunks. The main goal is to provide a very simple and easily extensible API and
implementation. This also illustrates pedagogically the interest of
[iterators and generators](https://developer.mozilla.org/docs/Web/JavaScript/Guide/Iterators_and_Generators)
in JavaScript. Note that the binary encoding is determined by the platform
endianness.

## Example

```js
import { getParser, getSerializer } from "yabson";
// Deno: import { getParser, getSerializer } from "https://deno.land/x/yabson";
// Browser: import { getParser, getSerializer } from "https://unpkg.com/yabson";

// `object` is the data to serialize
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
    "string",
  ],
  [Symbol("symbol")]: "symbol",
  typedArray: new Uint8Array([1, 2, 3]),
  misc: {
    date: new Date(),
    error: new Error("error"),
    regExp: /test/gi,
  },
  map: new Map([["key", "value"], [42, { value: "result" }]]),
  set: new Set([1, 2, 3]),
  stringObject: new String("abc"),
  numberObject: new Number(123),
  booleanObject: new Boolean(true),
  arrayBuffer: new Uint16Array([1, 2, 3]).buffer,
};
// Create empty slots in `object.array`
object.array[12] = 12;
// Add a circular reference
object.map.set(object.array, object);
// Add a property to a native object
object.numberObject.myProperty = "propertyValue";

// `chunkSize` (optional) is the max. size in bytes of `chunk` in the for-of loop below
const serializer = getSerializer(object, { chunkSize: 16 });
const parser = getParser();

let result;
// `chunk` is a Uint8Array of binary encoded data
for (const chunk of serializer) {
  // Parse immediately binary data
  result = parser.next(chunk);
}
// Display a deep clone of `object`
console.log(result.value);
```

Test it on JSFiddle: https://jsfiddle.net/np4581x2

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
  // Delegate serialization to `serializeString` from yabson
  yield* serializeString(data, customType.name);
}

function* parseCustomType(data) {
  // Delegate parsing to `parseString` from yabson
  const name = yield* parseString(data);
  return new CustomType(name);
}

function testCustomType(value) {
  return value instanceof CustomType;
}

// Run test
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
// Display a deep clone of `array`
console.log(result.value);
```

## Install

```sh
npm install https://www.npmjs.com/package/yabson
```

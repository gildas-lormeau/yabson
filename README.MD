## YaBSON

Binary-encoded serialization of JavaScript objects with generator-based parser
and serializer.

Example

```js
import { getParser, getSerializer } from "./index.js";

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

const serializer = getSerializer(object, { chunkSize: 16 }); // chunkSize (optional) is the size in bytes of the chunk values
const parser = getParser();

let result;
for (const chunk of serializer) {
  result = parser.next(chunk); // chunk is a Uint8array of binary encoded data
}
console.log(result.value); // displays a deep copy of object
```

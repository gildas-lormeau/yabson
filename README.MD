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

const serializer = getSerializer(object, { chunkSize: 16 });
const parser = getParser();

let result;
for (const chunk of serializer) {
  result = parser.next(chunk);
}
console.log(result.value);
```

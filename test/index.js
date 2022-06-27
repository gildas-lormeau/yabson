/* global Deno, BigUint64Array, BigInt64Array */

import { getSerializer, clone } from "./../index.js";
import { getSerializer as getSerializerAsync, clone as cloneAsync } from "./../index-async.js";

const MAX_CHUNK_SIZE = 16 * 1024;
const MAX_TESTS = 32;
const MAX_DEPTH = 4;

const objects = new Set();
const createFunctions = [
	createNumber,
	createBoolean,
	createUndefined,
	createNull,
	createNaN,
	createString,
	createTypedArray,
	createArrayBuffer,
	createBigInt,
	createRegExp,
	createDate,
	createError,
	createMap,
	createSet,
	createStringObject,
	createNumberObject,
	createBooleanObject,
	createArray,
	createObject,
	createReference,
	createSymbol
];

Deno.test("Fuzzing tests should run without errors", () => {
	for (let indexTest = 0; indexTest < MAX_TESTS; indexTest++) {
		if (!test()) {
			return false;
		}
	}
	return true;
});
Deno.test("Fuzzing tests should run without errors (Async API)", async () => {
	return test();

	async function test(indexTest = 0) {
		if (await testAsync()) {
			if (indexTest < MAX_TESTS) {
				await test(indexTest + 1);
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
});

function test() {
	const object = createObject();
	const copy = clone(object);
	const serializerObject = getSerializer(object, { chunkSize: MAX_CHUNK_SIZE });
	const serializerCopy = getSerializer(copy, { chunkSize: MAX_CHUNK_SIZE });
	let serializedObject, serializedCopy;
	do {
		serializedObject = serializerObject.next();
		serializedCopy = serializerCopy.next();
		if (!serializedObject.done &&
			!serializedCopy.done &&
			JSON.stringify(Array.from(serializedObject.value)) != JSON.stringify(Array.from(serializedCopy.value))) {
			return false;
		}
	} while (!serializedObject.done && !serializedCopy.done);
	return true;
}

async function testAsync() {
	const object = createObject();
	const copy = await cloneAsync(object);
	const serializerObject = getSerializerAsync(object, { chunkSize: MAX_CHUNK_SIZE })[Symbol.asyncIterator]();
	const serializerCopy = getSerializerAsync(copy, { chunkSize: MAX_CHUNK_SIZE })[Symbol.asyncIterator]();
	return test();

	async function test() {
		const [serializedObject, serializedCopy] = await Promise.all([serializerObject.next(), serializerCopy.next()]);
		if (!serializedObject.done &&
			!serializedCopy.done &&
			JSON.stringify(Array.from(serializedObject.value)) != JSON.stringify(Array.from(serializedCopy.value))) {
			return false;
		}
		if (!serializedObject.done && !serializedCopy.done) {
			return test();
		} else {
			return true;
		}
	}
}

function createValue(depth = 0) {
	if (depth < MAX_DEPTH) {
		const indexCreateFunction = Math.floor(Math.random() * createFunctions.length);
		const value = createFunctions[indexCreateFunction](depth);
		return value;
	} else {
		return undefined;
	}
}

function createNumber() {
	if (Math.random() < .5) {
		return (Math.random() - .5) * (Math.pow(10, Math.floor(Math.random() * 64)) * 2);
	} else {
		const maximums = [
			256,
			65536,
			2147483647,
			Number.MAX_SAFE_INTEGER * 2
		];
		return Math.floor((Math.random() - .5) * maximums[Math.floor(Math.random() * maximums.length)]);
	}
}

function createBoolean() {
	return Math.random() < .5;
}

function createUndefined() {
	return undefined;
}

function createNull() {
	return null;
}

function createNaN() {
	return NaN;
}

function createBigInt() {
	const array = new Uint8Array(8);
	for (let indexArray = 0; indexArray < array.length; indexArray++) {
		array[indexArray] = Math.floor(Math.random() * 256);
	}
	return new BigInt64Array(array.buffer)[0];
}

function createArray(depth = 0) {
	const array = [];
	objects.add(array);
	for (let index = 0; index < 16 + Math.floor(Math.random() * 16); index++) {
		if (Math.random() > .1) {
			array[index] = createValue(depth + 1);
		}
	}
	for (let index = 0; index < Math.floor(Math.random() * 4); index++) {
		array[createSymbol()] = createValue(depth + 1);
	}
	return array;
}

function createString() {
	let string = "";
	for (let index = 0; index < 16 + Math.floor(Math.random() * 16); index++) {
		string += String.fromCharCode(Math.floor(Math.random() * 58) + 64);
	}
	return string;
}

function createStringObject() {
	return new String(createString());
}

function createNumberObject() {
	return new Number(createNumber());
}

function createBooleanObject() {
	return new Boolean(createBoolean());
}

function createMap(depth = 0) {
	const map = new Map();
	objects.add(map);
	for (let index = 0; index < 16 + Math.floor(Math.random() * 16); index++) {
		map.set(createValue(depth + 1), createValue(depth + 1));
	}
	return map;
}

function createSet(depth = 0) {
	const set = new Set();
	objects.add(set);
	for (let index = 0; index < 16 + Math.floor(Math.random() * 16); index++) {
		set.add(createValue(depth + 1));
	}
	return set;
}

function createObject(depth = 0) {
	const object = {};
	objects.add(object);
	for (let index = 0; index < 16 + Math.floor(Math.random() * 16); index++) {
		object[createString()] = createValue(depth + 1);
	}
	for (let index = 0; index < Math.floor(Math.random() * 4); index++) {
		object[createSymbol()] = createValue(depth + 1);
	}
	return object;
}

function createReference() {
	return Array.from(objects)[Math.floor(Math.random() * objects.size)];
}

function createTypedArray() {
	const array = new Uint8Array(Math.floor(Math.random() * 4) * 8);
	for (let indexArray = 0; indexArray < array.length; indexArray++) {
		array[indexArray] = Math.floor(Math.random() * 256);
	}
	switch (Math.floor(Math.random() * 12)) {
		case 0: return new BigUint64Array(array.buffer);
		case 2: return new BigInt64Array(array.buffer);
		case 3: return new Float64Array(array.buffer);
		case 4: return new Uint32Array(array.buffer);
		case 5: return new Int32Array(array.buffer);
		case 6: return new Uint16Array(array.buffer);
		case 7: return new Float32Array(array.buffer);
		case 8: return new Int16Array(array.buffer);
		case 9: return new Uint8ClampedArray(array.buffer);
		case 10: return new Uint8Array(array.buffer);
		case 11: return new Int8Array(array.buffer);
	}
}

function createArrayBuffer() {
	const array = new Uint8Array(Math.floor(Math.random() * 4) * 8);
	for (let indexArray = 0; indexArray < array.length; indexArray++) {
		array[indexArray] = Math.floor(Math.random() * 256);
	}
	return array.buffer;
}

function createRegExp() {
	return new RegExp(createString().replace(/\[|\]|\\/g, ""));
}

function createDate() {
	return new Date(Math.floor(Math.random() * 80 * 360 * 24 * 60 * 60 * 1000));
}

function createError() {
	return new Error(createString());
}

function createSymbol() {
	return Symbol(createString());
}
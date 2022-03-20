/* global TextEncoder, TextDecoder, BigInt64Array, BigUint64Array */

const MAX_CHUNK_SIZE = 8 * 1024 * 1024;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const types = new Array(256);
let typeIndex = 0;

registerType({ parse: parseObject, serialize: serializeObject, test: testObject });
registerType({ parse: parseArray, serialize: serializeArray, test: testArray });
registerType({ parse: parseString, serialize: serializeString, test: testString });
registerType({ parse: parseBigUint64Array, serialize: serializeBigUint64Array, test: testBigUint64Array });
registerType({ parse: parseBigInt64Array, serialize: serializeBigInt64Array, test: testBigInt64Array });
registerType({ parse: parseFloat64Array, serialize: serializeFloat64Array, test: testFloat64Array });
registerType({ parse: parseFloat32Array, serialize: serializeFloat32Array, test: testFloat32Array });
registerType({ parse: parseUint32Array, serialize: serializeUint32Array, test: testUint32Array });
registerType({ parse: parseInt32Array, serialize: serializeInt32Array, test: testInt32Array });
registerType({ parse: parseUint16Array, serialize: serializeUint16Array, test: testUint16Array });
registerType({ parse: parseInt16Array, serialize: serializeInt16Array, test: testInt16Array });
registerType({ parse: parseUint8ClampedArray, serialize: serializeUint8ClampedArray, test: testUint8ClampedArray });
registerType({ parse: parseUint8Array, serialize: serializeUint8Array, test: testUint8Array });
registerType({ parse: parseInt8Array, serialize: serializeInt8Array, test: testInt8Array });
registerType({ parse: parseNumber, serialize: serializeNumber, test: testNumber });
registerType({ parse: parseBigInt, serialize: serializeBigInt, test: testBigInt });
registerType({ parse: parseUint32, serialize: serializeUint32, test: testUint32 });
registerType({ parse: parseInt32, serialize: serializeInt32, test: testInt32 });
registerType({ parse: parseUint16, serialize: serializeUint16, test: testUint16 });
registerType({ parse: parseInt16, serialize: serializeInt16, test: testInt16 });
registerType({ parse: parseUint8, serialize: serializeUint8, test: testUint8 });
registerType({ parse: parseInt8, serialize: serializeInt8, test: testInt8 });
registerType({ parse: parseUndefinedValue, test: testUndefinedValue });
registerType({ parse: parseNullValue, test: testNullValue });
registerType({ parse: parseNaNValue, test: testNaNValue });
registerType({ parse: parseBoolean, serialize: serializeBoolean, test: testBoolean });
registerType({ parse: parseMap, serialize: serializeMap, test: testMap });
registerType({ parse: parseSet, serialize: serializeSet, test: testSet });
registerType({ parse: parseDate, serialize: serializeDate, test: testDate });
registerType({ parse: parseError, serialize: serializeError, test: testError });
registerType({ parse: parseRegExp, serialize: serializeRegExp, test: testRegExp });

export { getSerializer, getParser, registerType };

function registerType(functions) {
	typeIndex++;
	types[types.length - typeIndex] = functions;
}

class WriteStream {
	constructor(chunkSize) {
		this.offset = 0;
		this.value = new Uint8Array(chunkSize);
	}

	*append(array) {
		if (this.pending) {
			const pending = this.pending;
			this.pending = null;
			this.offset = 0;
			this.value = new Uint8Array(this.value.length);
			yield* this.append(pending);
			yield* this.append(array);
		} else if (this.offset + array.length > this.value.length) {
			this.value.set(array.subarray(0, this.value.length - this.offset), this.offset);
			this.pending = array.subarray(this.value.length - this.offset);
			yield this.value;
		} else {
			this.value.set(array, this.offset);
			this.offset += array.length;
		}
	}
}

function* getSerializer(value, { chunkSize = MAX_CHUNK_SIZE } = {}) {
	const data = new WriteStream(chunkSize);
	yield* serializeValue(data, value);
	if (data.offset) {
		yield data.value.subarray(0, data.offset);
	}
}

function* serializeValue(data, value) {
	const type = types.findIndex(({ test } = {}) => test && test(value));
	const serialize = types[type].serialize;
	yield* data.append(new Uint8Array([type]));
	if (serialize) {
		yield* serialize(data, value);
	}
}

function* serializeBoolean(data, boolean) {
	const serializedBoolean = new Uint8Array([Number(boolean)]);
	yield* data.append(serializedBoolean);
}

function* serializeNumber(data, number) {
	const serializedNumber = new Uint8Array(new Float64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt8(data, number) {
	const serializedNumber = new Uint8Array(new Int8Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint8(data, number) {
	const serializedNumber = new Uint8Array([number]);
	yield* data.append(serializedNumber);
}

function* serializeInt16(data, number) {
	const serializedNumber = new Uint8Array(new Int16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint16(data, number) {
	const serializedNumber = new Uint8Array(new Uint16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt32(data, number) {
	const serializedNumber = new Uint8Array(new Int32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint32(data, number) {
	const serializedNumber = new Uint8Array(new Uint32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeBigInt(data, number) {
	const serializedNumber = new Uint8Array(new BigInt64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeString(data, string) {
	const encodedString = textEncoder.encode(string);
	yield* serializeValue(data, encodedString.length);
	yield* data.append(encodedString);
}

function* serializeObject(data, object) {
	const entries = Object.entries(object);
	yield* serializeValue(data, entries.length);
	for (const [key, value] of entries) {
		yield* serializeString(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeArray(data, array) {
	yield* serializeValue(data, array.length);
	for (const value of array) {
		yield* serializeValue(data, value);
	}
}

function* serializeUint8Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(array);
}

function* serializeInt8Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8Array(array.buffer));
}

function* serializeUint8ClampedArray(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8ClampedArray(array.buffer));
}

function* serializeInt16Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Int16Array(array.buffer));
}

function* serializeUint16Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint16Array(array.buffer));
}

function* serializeInt32Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Int32Array(array.buffer));
}

function* serializeUint32Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint32Array(array.buffer));
}

function* serializeFloat32Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Float32Array(array.buffer));
}

function* serializeFloat64Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new Float64Array(array.buffer));
}

function* serializeBigInt64Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new BigInt64Array(array.buffer));
}

function* serializeBigUint64Array(data, array) {
	yield* serializeValue(data, array.length);
	yield* data.append(new BigUint64Array(array.buffer));
}

function* serializeMap(data, map) {
	const entries = map.entries();
	yield* serializeValue(data, map.size);
	for (const [key, value] of entries) {
		yield* serializeValue(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeSet(data, set) {
	yield* serializeValue(data, set.size);
	for (const value of set) {
		yield* serializeValue(data, value);
	}
}

function* serializeDate(data, date) {
	yield* serializeNumber(data, date.getTime());
}

function* serializeError(data, error) {
	yield* serializeString(data, error.name);
	yield* serializeString(data, error.message);
	yield* serializeString(data, error.stack);
}

function* serializeRegExp(data, regExp) {
	yield* serializeString(data, regExp.source);
	yield* serializeString(data, regExp.flags);
}

class ReadStream {
	constructor() {
		this.offset = 0;
		this.value = new Uint8Array(0);
	}

	*consume(size) {
		if (this.offset + size > this.value.length) {
			const pending = this.value.slice(this.offset, this.value.length);
			const value = yield;
			this.value = new Uint8Array(pending.length + value.length);
			this.value.set(pending);
			this.value.set(value, pending.length);
			this.offset = 0;
			return yield* this.consume(size);
		} else {
			const result = this.value.slice(this.offset, this.offset + size);
			this.offset += result.length;
			return result;
		}
	}
}

function getParser() {
	const parseGenerator = getParseGenerator();
	parseGenerator.next();
	return parseGenerator;
}

function* getParseGenerator() {
	const result = yield* parseValue(new ReadStream());
	return result;
}

function* parseValue(data) {
	const array = yield* data.consume(1);
	const parserType = array[0];
	const parser = types[parserType].parse;
	const result = yield* parser(data);
	return result;
}

function* parseBoolean(data) {
	const array = yield* data.consume(1);
	return Boolean(array[0]);
}

function* parseNumber(data) {
	const array = yield* data.consume(8);
	return new Float64Array(array.buffer)[0];
}

function* parseInt8(data) {
	const array = yield* data.consume(1);
	return new Int8Array(array.buffer)[0];
}

function* parseUint8(data) {
	const array = yield* data.consume(1);
	return new Uint8Array(array.buffer)[0];
}

function* parseInt16(data) {
	const array = yield* data.consume(2);
	return new Int16Array(array.buffer)[0];
}

function* parseUint16(data) {
	const array = yield* data.consume(2);
	return new Uint16Array(array.buffer)[0];
}

function* parseInt32(data) {
	const array = yield* data.consume(4);
	return new Int32Array(array.buffer)[0];
}

function* parseUint32(data) {
	const array = yield* data.consume(4);
	return new Uint32Array(array.buffer)[0];
}

function* parseBigInt(data) {
	const array = yield* data.consume(8);
	return new BigInt64Array(array.buffer)[0];
}

function* parseString(data) {
	const size = yield* parseValue(data);
	const array = yield* data.consume(size);
	return textDecoder.decode(array);
}

// eslint-disable-next-line require-yield
function* parseUndefinedValue() {
	return undefined;
}

// eslint-disable-next-line require-yield
function* parseNaNValue() {
	return NaN;
}

// eslint-disable-next-line require-yield
function* parseNullValue() {
	return null;
}

function* parseObject(data) {
	const size = yield* parseValue(data);
	const object = {};
	for (let indexKey = 0; indexKey < size; indexKey++) {
		const key = yield* parseString(data);
		const value = yield* parseValue(data);
		object[key] = value;
	}
	return object;
}

function* parseArray(data) {
	const length = yield* parseValue(data);
	const array = [];
	for (let indexArray = 0; indexArray < length; indexArray++) {
		array.push(yield* parseValue(data));
	}
	return array;
}

function* parseUint8Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length);
	return array;
}

function* parseInt8Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length);
	return new Int8Array(array.buffer);
}

function* parseUint8ClampedArray(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length);
	return new Uint8ClampedArray(array.buffer);
}

function* parseInt16Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 2);
	return new Int16Array(array.buffer);
}

function* parseUint16Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 2);
	return new Uint16Array(array.buffer);
}

function* parseInt32Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 4);
	return new Int32Array(array.buffer);
}

function* parseUint32Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 4);
	return new Uint32Array(array.buffer);
}

function* parseFloat32Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 4);
	return new Float32Array(array.buffer);
}

function* parseFloat64Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 8);
	return new Float64Array(array.buffer);
}

function* parseBigInt64Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 8);
	return new BigInt64Array(array.buffer);
}

function* parseBigUint64Array(data) {
	const length = yield* parseValue(data);
	const array = yield* data.consume(length * 8);
	return new BigUint64Array(array.buffer);
}

function* parseMap(data) {
	const size = yield* parseValue(data);
	const map = new Map();
	for (let indexKey = 0; indexKey < size; indexKey++) {
		const key = yield* parseValue(data);
		const value = yield* parseValue(data);
		map.set(key, value);
	}
	return map;
}

function* parseSet(data) {
	const size = yield* parseValue(data);
	const set = new Set();
	for (let indexKey = 0; indexKey < size; indexKey++) {
		const value = yield* parseValue(data);
		set.add(value);
	}
	return set;
}

function* parseDate(data) {
	const milliseconds = yield* parseNumber(data);
	return new Date(milliseconds);
}

function* parseError(data) {
	const name = yield* parseString(data);
	const message = yield* parseString(data);
	const stack = yield* parseString(data);
	const error = new Error(message);
	error.name = name;
	error.stack = stack;
	return error;
}

function* parseRegExp(data) {
	const source = yield* parseString(data);
	const flags = yield* parseString(data);
	return new RegExp(source, flags);
}

function testUndefinedValue(value) {
	return value === undefined;
}

function testNullValue(value) {
	return value === null;
}

function testNaNValue(value) {
	return Number.isNaN(value);
}

function testString(value) {
	return typeof value == "string";
}

function testArray(value) {
	return typeof value.length == "number";
}

function testObject(value) {
	return value === Object(value);
}

function testInt8(value) {
	return testInteger(value) && value >= -128 && value <= 127;
}

function testUint8(value) {
	return testInteger(value) && value >= 0 && value <= 255;
}

function testInt16(value) {
	return testInteger(value) && value >= -32768 && value <= 32767;
}

function testUint16(value) {
	return testInteger(value) && value >= 0 && value <= 65535;
}

function testInt32(value) {
	return testInteger(value) && value >= -2147483648 && value <= 2147483647;
}

function testUint32(value) {
	return testInteger(value) && value >= 0 && value <= 4294967295;
}

function testInteger(value) {
	return testNumber(value) && value == Number.parseInt(value, 10);
}

function testNumber(value) {
	return typeof value == "number";
}
function testBigInt(value) {
	return typeof value == "bigint";
}

function testBoolean(value) {
	return typeof value == "boolean";
}

function testUint8Array(value) {
	return value instanceof Uint8Array;
}

function testInt8Array(value) {
	return value instanceof Int8Array;
}

function testUint8ClampedArray(value) {
	return value instanceof Uint8ClampedArray;
}

function testInt16Array(value) {
	return value instanceof Int16Array;
}

function testUint16Array(value) {
	return value instanceof Uint16Array;
}

function testInt32Array(value) {
	return value instanceof Int32Array;
}

function testUint32Array(value) {
	return value instanceof Uint32Array;
}

function testFloat32Array(value) {
	return value instanceof Float32Array;
}

function testFloat64Array(value) {
	return value instanceof Float64Array;
}

function testBigInt64Array(value) {
	return value instanceof BigInt64Array;
}

function testBigUint64Array(value) {
	return value instanceof BigUint64Array;
}

function testMap(value) {
	return value instanceof Map;
}

function testSet(value) {
	return value instanceof Set;
}

function testDate(value) {
	return value instanceof Date;
}

function testError(value) {
	return value instanceof Error;
}

function testRegExp(value) {
	return value instanceof RegExp;
}
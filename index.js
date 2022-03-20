/* global TextEncoder, TextDecoder, BigInt64Array, BigUint64Array */

const MAX_CHUNK_SIZE = 8 * 1024 * 1024;

const TYPE_UNDEFINED_VALUE = 0;
const TYPE_NULL_VALUE = 1;
const TYPE_NAN_VALUE = 2;
const TYPE_BOOLEAN = 3;
const TYPE_STRING = 4;
const TYPE_MAP = 5;
const TYPE_SET = 6;
const TYPE_DATE = 7;
const TYPE_ERROR = 8;
const TYPE_REGEXP = 9;
const TYPE_INT8 = 10;
const TYPE_UINT8 = 11;
const TYPE_INT16 = 12;
const TYPE_UINT16 = 13;
const TYPE_INT32 = 14;
const TYPE_UINT32 = 15;
const TYPE_BIGINT = 16;
const TYPE_NUMBER = 17;
const TYPE_INT8_ARRAY = 18;
const TYPE_UINT8_ARRAY = 19;
const TYPE_UINT8_CLAMPED_ARRAY = 20;
const TYPE_INT16_ARRAY = 21;
const TYPE_UINT16_ARRAY = 22;
const TYPE_INT32_ARRAY = 23;
const TYPE_UINT32_ARRAY = 24;
const TYPE_FLOAT32_ARRAY = 25;
const TYPE_FLOAT64_ARRAY = 26;
const TYPE_BIG_INT64_ARRAY = 27;
const TYPE_BIG_UINT64_ARRAY = 28;
const TYPE_ARRAY = 29;
const TYPE_OBJECT = 30;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const types = new Map();
types.set(TYPE_UNDEFINED_VALUE, { parse: parseUndefinedValue, serialize: serializeUndefinedValue, testType: isUndefinedValue });
types.set(TYPE_NULL_VALUE, { parse: parseNullValue, serialize: serializeNullValue, testType: isNullValue });
types.set(TYPE_NAN_VALUE, { parse: parseNaNValue, serialize: serializeNaNValue, testType: isNaNValue });
types.set(TYPE_BOOLEAN, { parse: parseBoolean, serialize: serializeBoolean, testType: isBoolean });
types.set(TYPE_STRING, { parse: parseString, serialize: serializeString, testType: isString });
types.set(TYPE_MAP, { parse: parseMap, serialize: serializeMap, testType: isMap });
types.set(TYPE_SET, { parse: parseSet, serialize: serializeSet, testType: isSet });
types.set(TYPE_DATE, { parse: parseDate, serialize: serializeDate, testType: isDate });
types.set(TYPE_ERROR, { parse: parseError, serialize: serializeError, testType: isError });
types.set(TYPE_REGEXP, { parse: parseRegExp, serialize: serializeRegExp, testType: isRegExp });
types.set(TYPE_INT8, { parse: parseInt8, serialize: serializeInt8, testType: isInt8 });
types.set(TYPE_UINT8, { parse: parseUint8, serialize: serializeUint8, testType: isUint8 });
types.set(TYPE_INT16, { parse: parseInt16, serialize: serializeInt16, testType: isInt16 });
types.set(TYPE_UINT16, { parse: parseUint16, serialize: serializeUint16, testType: isUint16 });
types.set(TYPE_INT32, { parse: parseInt32, serialize: serializeInt32, testType: isInt32 });
types.set(TYPE_UINT32, { parse: parseUint32, serialize: serializeUint32, testType: isUint32 });
types.set(TYPE_BIGINT, { parse: parseBigInt, serialize: serializeBigInt, testType: isBigInt });
types.set(TYPE_NUMBER, { parse: parseNumber, serialize: serializeNumber, testType: isNumber });
types.set(TYPE_INT8_ARRAY, { parse: parseInt8Array, serialize: serializeInt8Array, testType: isInt8Array });
types.set(TYPE_UINT8_ARRAY, { parse: parseUint8Array, serialize: serializeUint8Array, testType: isUint8Array });
types.set(TYPE_UINT8_CLAMPED_ARRAY, { parse: parseUint8ClampedArray, serialize: serializeUint8ClampedArray, testType: isUint8ClampedArray });
types.set(TYPE_INT16_ARRAY, { parse: parseInt16Array, serialize: serializeInt16Array, testType: isInt16Array });
types.set(TYPE_UINT16_ARRAY, { parse: parseUint16Array, serialize: serializeUint16Array, testType: isUint16Array });
types.set(TYPE_INT32_ARRAY, { parse: parseInt32Array, serialize: serializeInt32Array, testType: isInt32Array });
types.set(TYPE_UINT32_ARRAY, { parse: parseUint32Array, serialize: serializeUint32Array, testType: isUint32Array });
types.set(TYPE_FLOAT32_ARRAY, { parse: parseFloat32Array, serialize: serializeFloat32Array, testType: isFloat32Array });
types.set(TYPE_FLOAT64_ARRAY, { parse: parseFloat64Array, serialize: serializeFloat64Array, testType: isFloat64Array });
types.set(TYPE_BIG_INT64_ARRAY, { parse: parseBigInt64Array, serialize: serializeBigInt64Array, testType: isBigInt64Array });
types.set(TYPE_BIG_UINT64_ARRAY, { parse: parseBigUint64Array, serialize: serializeBigUint64Array, testType: isBigUint64Array });
types.set(TYPE_ARRAY, { parse: parseArray, serialize: serializeArray, testType: isArray });
types.set(TYPE_OBJECT, { parse: parseObject, serialize: serializeObject, testType: isObject });

export { getSerializer, getParser };

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
	const type = Array.from(types.entries()).find(([, { testType }]) => testType(value))[0];
	const serialize = types.get(type).serialize;
	yield* serialize(data, value);
}

function* serializeBoolean(data, boolean) {
	yield* data.append(new Uint8Array([TYPE_BOOLEAN]));
	const serializedBoolean = new Uint8Array([Number(boolean)]);
	yield* data.append(serializedBoolean);
}

function* serializeNumber(data, number) {
	yield* data.append(new Uint8Array([TYPE_NUMBER]));
	const serializedNumber = new Uint8Array(new Float64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt8(data, number) {
	yield* data.append(new Uint8Array([TYPE_INT8]));
	const serializedNumber = new Uint8Array(new Int8Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint8(data, number) {
	yield* data.append(new Uint8Array([TYPE_UINT8]));
	const serializedNumber = new Uint8Array([number]);
	yield* data.append(serializedNumber);
}

function* serializeInt16(data, number) {
	yield* data.append(new Uint8Array([TYPE_INT16]));
	const serializedNumber = new Uint8Array(new Int16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint16(data, number) {
	yield* data.append(new Uint8Array([TYPE_UINT16]));
	const serializedNumber = new Uint8Array(new Uint16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt32(data, number) {
	yield* data.append(new Uint8Array([TYPE_INT32]));
	const serializedNumber = new Uint8Array(new Int32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint32(data, number) {
	yield* data.append(new Uint8Array([TYPE_UINT32]));
	const serializedNumber = new Uint8Array(new Uint32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeBigInt(data, number) {
	yield* data.append(new Uint8Array([TYPE_BIGINT]));
	const serializedNumber = new Uint8Array(new BigInt64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeString(data, string) {
	yield* data.append(new Uint8Array([TYPE_STRING]));
	const encodedString = textEncoder.encode(string);
	yield* serializeValue(data, encodedString.length);
	yield* data.append(encodedString);
}

function* serializeNullValue(data) {
	yield* data.append(new Uint8Array([TYPE_NULL_VALUE]));
}

function* serializeUndefinedValue(data) {
	yield* data.append(new Uint8Array([TYPE_UNDEFINED_VALUE]));
}

function* serializeNaNValue(data) {
	yield* data.append(new Uint8Array([TYPE_NAN_VALUE]));
}

function* serializeObject(data, object) {
	yield* data.append(new Uint8Array([TYPE_OBJECT]));
	const entries = Object.entries(object);
	yield* serializeValue(data, entries.length);
	for (const [key, value] of entries) {
		yield* serializeString(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeArray(data, array) {
	yield* data.append(new Uint8Array([TYPE_ARRAY]));
	yield* serializeValue(data, array.length);
	for (const value of array) {
		yield* serializeValue(data, value);
	}
}

function* serializeUint8Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_UINT8_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(array);
}

function* serializeInt8Array(data, array) {
	yield* data.append(new Int8Array([TYPE_INT8_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8Array(array.buffer));
}

function* serializeUint8ClampedArray(data, array) {
	yield* data.append(new Uint8Array([TYPE_UINT8_CLAMPED_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8ClampedArray(array.buffer));
}

function* serializeInt16Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_INT16_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Int16Array(array.buffer));
}

function* serializeUint16Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_UINT16_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint16Array(array.buffer));
}

function* serializeInt32Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_INT32_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Int32Array(array.buffer));
}

function* serializeUint32Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_UINT32_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint32Array(array.buffer));
}

function* serializeFloat32Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_FLOAT32_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Float32Array(array.buffer));
}

function* serializeFloat64Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_FLOAT64_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Float64Array(array.buffer));
}

function* serializeBigInt64Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_BIG_INT64_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new BigInt64Array(array.buffer));
}

function* serializeBigUint64Array(data, array) {
	yield* data.append(new Uint8Array([TYPE_BIG_UINT64_ARRAY]));
	yield* serializeValue(data, array.length);
	yield* data.append(new BigUint64Array(array.buffer));
}

function* serializeMap(data, map) {
	yield* data.append(new Uint8Array([TYPE_MAP]));
	const entries = map.entries();
	yield* serializeValue(data, map.size);
	for (const [key, value] of entries) {
		yield* serializeValue(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeSet(data, set) {
	yield* data.append(new Uint8Array([TYPE_SET]));
	yield* serializeValue(data, set.size);
	for (const value of set) {
		yield* serializeValue(data, value);
	}
}

function* serializeDate(data, date) {
	yield* data.append(new Uint8Array([TYPE_DATE]));
	yield* serializeNumber(data, date.getTime());
}

function* serializeError(data, error) {
	yield* data.append(new Uint8Array([TYPE_ERROR]));
	yield* serializeString(data, error.name);
	yield* serializeString(data, error.message);
	yield* serializeString(data, error.stack);
}

function* serializeRegExp(data, regExp) {
	yield* data.append(new Uint8Array([TYPE_REGEXP]));
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
	const parser = types.get(parserType).parse;
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
		const key = yield* parseValue(data);
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
	const milliseconds = yield* parseValue(data);
	return new Date(milliseconds);
}

function* parseError(data) {
	const name = yield* parseValue(data);
	const message = yield* parseValue(data);
	const stack = yield* parseValue(data);
	const error = new Error(message);
	error.name = name;
	error.stack = stack;
	return error;
}

function* parseRegExp(data) {
	const source = yield* parseValue(data);
	const flags = yield* parseValue(data);
	return new RegExp(source, flags);
}

function isUndefinedValue(value) {
	return value === undefined;
}

function isNullValue(value) {
	return value === null;
}

function isNaNValue(value) {
	return Number.isNaN(value);
}

function isString(value) {
	return typeof value == "string";
}

function isArray(value) {
	return typeof value.length == "number";
}

function isObject(value) {
	return value === Object(value);
}

function isInt8(value) {
	return isInteger(value) && value >= -128 && value <= 127;
}

function isUint8(value) {
	return isInteger(value) && value >= 0 && value <= 255;
}

function isInt16(value) {
	return isInteger(value) && value >= -32768 && value <= 32767;
}

function isUint16(value) {
	return isInteger(value) && value >= 0 && value <= 65535;
}

function isInt32(value) {
	return isInteger(value) && value >= -2147483648 && value <= 2147483647;
}

function isUint32(value) {
	return isInteger(value) && value >= 0 && value <= 4294967295;
}

function isInteger(value) {
	return isNumber(value) && value == Number.parseInt(value, 10);
}

function isNumber(value) {
	return typeof value == "number";
}
function isBigInt(value) {
	return typeof value == "bigint";
}

function isBoolean(value) {
	return typeof value == "boolean";
}

function isUint8Array(value) {
	return value instanceof Uint8Array;
}

function isInt8Array(value) {
	return value instanceof Int8Array;
}

function isUint8ClampedArray(value) {
	return value instanceof isUint8ClampedArray;
}

function isInt16Array(value) {
	return value instanceof Int16Array;
}

function isUint16Array(value) {
	return value instanceof Uint16Array;
}

function isInt32Array(value) {
	return value instanceof Int32Array;
}

function isUint32Array(value) {
	return value instanceof Uint32Array;
}

function isFloat32Array(value) {
	return value instanceof Float32Array;
}

function isFloat64Array(value) {
	return value instanceof Float64Array;
}

function isBigInt64Array(value) {
	return value instanceof BigInt64Array;
}

function isBigUint64Array(value) {
	return value instanceof BigUint64Array;
}

function isMap(value) {
	return value instanceof Map;
}

function isSet(value) {
	return value instanceof Set;
}

function isDate(value) {
	return value instanceof Date;
}

function isError(value) {
	return value instanceof Error;
}

function isRegExp(value) {
	return value instanceof RegExp;
}
/* global TextEncoder, TextDecoder, BigInt64Array, BigUint64Array */

const MAX_CHUNK_SIZE = 8 * 1024 * 1024;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const types = new Array(256);
let typeIndex = 0;

registerType({ parse: parseObject, serialize: serializeObject, testType: isObject });
registerType({ parse: parseArray, serialize: serializeArray, testType: isArray });
registerType({ parse: parseString, serialize: serializeString, testType: isString });
registerType({ parse: parseBigUint64Array, serialize: serializeBigUint64Array, testType: isBigUint64Array });
registerType({ parse: parseBigInt64Array, serialize: serializeBigInt64Array, testType: isBigInt64Array });
registerType({ parse: parseFloat64Array, serialize: serializeFloat64Array, testType: isFloat64Array });
registerType({ parse: parseFloat32Array, serialize: serializeFloat32Array, testType: isFloat32Array });
registerType({ parse: parseUint32Array, serialize: serializeUint32Array, testType: isUint32Array });
registerType({ parse: parseInt32Array, serialize: serializeInt32Array, testType: isInt32Array });
registerType({ parse: parseUint16Array, serialize: serializeUint16Array, testType: isUint16Array });
registerType({ parse: parseInt16Array, serialize: serializeInt16Array, testType: isInt16Array });
registerType({ parse: parseUint8ClampedArray, serialize: serializeUint8ClampedArray, testType: isUint8ClampedArray });
registerType({ parse: parseUint8Array, serialize: serializeUint8Array, testType: isUint8Array });
registerType({ parse: parseInt8Array, serialize: serializeInt8Array, testType: isInt8Array });
registerType({ parse: parseNumber, serialize: serializeNumber, testType: isNumber });
registerType({ parse: parseBigInt, serialize: serializeBigInt, testType: isBigInt });
registerType({ parse: parseUint32, serialize: serializeUint32, testType: isUint32 });
registerType({ parse: parseInt32, serialize: serializeInt32, testType: isInt32 });
registerType({ parse: parseUint16, serialize: serializeUint16, testType: isUint16 });
registerType({ parse: parseInt16, serialize: serializeInt16, testType: isInt16 });
registerType({ parse: parseUint8, serialize: serializeUint8, testType: isUint8 });
registerType({ parse: parseInt8, serialize: serializeInt8, testType: isInt8 });
registerType({ parse: parseUndefinedValue, serialize: serializeUndefinedValue, testType: isUndefinedValue });
registerType({ parse: parseNullValue, serialize: serializeNullValue, testType: isNullValue });
registerType({ parse: parseNaNValue, serialize: serializeNaNValue, testType: isNaNValue });
registerType({ parse: parseBoolean, serialize: serializeBoolean, testType: isBoolean });
registerType({ parse: parseMap, serialize: serializeMap, testType: isMap });
registerType({ parse: parseSet, serialize: serializeSet, testType: isSet });
registerType({ parse: parseDate, serialize: serializeDate, testType: isDate });
registerType({ parse: parseError, serialize: serializeError, testType: isError });
registerType({ parse: parseRegExp, serialize: serializeRegExp, testType: isRegExp });

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
	const type = types.findIndex(({ testType } = {}) => testType && testType(value));
	const serialize = types[type].serialize;
	yield* serialize(data, type, value);
}

function* serializeBoolean(data, type, boolean) {
	yield* data.append(new Uint8Array([type]));
	const serializedBoolean = new Uint8Array([Number(boolean)]);
	yield* data.append(serializedBoolean);
}

function* serializeNumber(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Float64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt8(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Int8Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint8(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array([number]);
	yield* data.append(serializedNumber);
}

function* serializeInt16(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Int16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint16(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Uint16Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeInt32(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Int32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeUint32(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new Uint32Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeBigInt(data, type, number) {
	yield* data.append(new Uint8Array([type]));
	const serializedNumber = new Uint8Array(new BigInt64Array([number]).buffer);
	yield* data.append(serializedNumber);
}

function* serializeString(data, type, string) {
	yield* data.append(new Uint8Array([type]));
	const encodedString = textEncoder.encode(string);
	yield* serializeValue(data, encodedString.length);
	yield* data.append(encodedString);
}

function* serializeNullValue(data, type) {
	yield* data.append(new Uint8Array([type]));
}

function* serializeUndefinedValue(data, type) {
	yield* data.append(new Uint8Array([type]));
}

function* serializeNaNValue(data, type) {
	yield* data.append(new Uint8Array([type]));
}

function* serializeObject(data, type, object) {
	yield* data.append(new Uint8Array([type]));
	const entries = Object.entries(object);
	yield* serializeValue(data, entries.length);
	for (const [key, value] of entries) {
		yield* serializeValue(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeArray(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	for (const value of array) {
		yield* serializeValue(data, value);
	}
}

function* serializeUint8Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(array);
}

function* serializeInt8Array(data, type, array) {
	yield* data.append(new Int8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8Array(array.buffer));
}

function* serializeUint8ClampedArray(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint8ClampedArray(array.buffer));
}

function* serializeInt16Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Int16Array(array.buffer));
}

function* serializeUint16Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint16Array(array.buffer));
}

function* serializeInt32Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Int32Array(array.buffer));
}

function* serializeUint32Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Uint32Array(array.buffer));
}

function* serializeFloat32Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Float32Array(array.buffer));
}

function* serializeFloat64Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new Float64Array(array.buffer));
}

function* serializeBigInt64Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new BigInt64Array(array.buffer));
}

function* serializeBigUint64Array(data, type, array) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, array.length);
	yield* data.append(new BigUint64Array(array.buffer));
}

function* serializeMap(data, type, map) {
	yield* data.append(new Uint8Array([type]));
	const entries = map.entries();
	yield* serializeValue(data, map.size);
	for (const [key, value] of entries) {
		yield* serializeValue(data, key);
		yield* serializeValue(data, value);
	}
}

function* serializeSet(data, type, set) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, set.size);
	for (const value of set) {
		yield* serializeValue(data, value);
	}
}

function* serializeDate(data, type, date) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, date.getTime());
}

function* serializeError(data, type, error) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, error.name);
	yield* serializeValue(data, error.message);
	yield* serializeValue(data, error.stack);
}

function* serializeRegExp(data, type, regExp) {
	yield* data.append(new Uint8Array([type]));
	yield* serializeValue(data, regExp.source);
	yield* serializeValue(data, regExp.flags);
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
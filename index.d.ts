// deno-lint-ignore-file ban-types no-explicit-any

interface TypedArray {
    length: number;
    buffer: ArrayBuffer;
}

interface SerializerOptions {
    chunkSize?: number;
}

interface SerializerData {
    append(array: Uint8Array): Generator<Uint8Array, void, void>;
    flush(): Generator<void, void, void>;
    addObject(value: any): void;
}

interface ParserData {
    consume(size: number): Generator<void, any, Uint8Array>;
    createObjectWrapper(): Object;
    addObjectSetter(functionArguments: Array<any>, setterFunction: Function): void;
    executeSetters(): void;
}

export function getSerializer(value: any, options?: SerializerOptions): Generator<Uint8Array, void, void>;
export function getParser(): Generator<void, any, Uint8Array>;
export function registerType(serialize: Function, parse: Function, test: Function, type?: number): void;
export function clone(object: any, options?: SerializerOptions): Object;
export function serialize(object: any, options?: SerializerOptions): Uint8Array;
export function parse(array: Uint8Array): any;

export function serializeValue(data: SerializerData, value: any): Generator<Uint8Array, void, void>;
export function serializeObject(data: SerializerData, object: object): Generator<Uint8Array, void, void>;
export function serializeArray(data: SerializerData, array: Array<any>): Generator<Uint8Array, void, void>;
export function serializeString(data: SerializerData, string: string): Generator<Uint8Array, void, void>;
export function serializeTypedArray(data: SerializerData, array: TypedArray): Generator<Uint8Array, void, void>;
export function serializeArrayBuffer(data: SerializerData, array: ArrayBuffer): Generator<Uint8Array, void, void>;
export function serializeNumber(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeBigInt(data: SerializerData, number: bigint): Generator<Uint8Array, void, void>;
export function serializeUint32(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeInt32(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeUint16(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeInt16(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeUint8(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeInt8(data: SerializerData, number: number): Generator<Uint8Array, void, void>;
export function serializeBoolean(data: SerializerData, boolean: boolean): Generator<Uint8Array, void, void>;
export function serializeMap(data: SerializerData, map: Map<any, any>): Generator<Uint8Array, void, void>;
export function serializeSet(data: SerializerData, set: Set<any>): Generator<Uint8Array, void, void>;
export function serializeDate(data: SerializerData, date: Date): Generator<Uint8Array, void, void>;
export function serializeError(data: SerializerData, error: Error): Generator<Uint8Array, void, void>;
export function serializeRegExp(data: SerializerData, regExp: RegExp): Generator<Uint8Array, void, void>;
export function serializeStringObject(data: SerializerData, string: String): Generator<Uint8Array, void, void>;
export function serializeNumberObject(data: SerializerData, number: Number): Generator<Uint8Array, void, void>;
export function serializeBooleanObject(data: SerializerData, boolean: Boolean): Generator<Uint8Array, void, void>;
export function serializeSymbol(data: SerializerData, symbol: Symbol): Generator<Uint8Array, void, void>;

export function parseValue(data: ParserData): Generator<void, any, Uint8Array>;
export function parseObject(data: ParserData): Generator<void, Object, Uint8Array>;
export function parseArray(data: ParserData): Generator<void, Array<any>, Uint8Array>;
export function parseString(data: ParserData): Generator<void, string, Uint8Array>;
export function parseBigUint64Array(data: ParserData): Generator<void, BigUint64Array, Uint8Array>;
export function parseBigInt64Array(data: ParserData): Generator<void, BigInt64Array, Uint8Array>;
export function parseFloat64Array(data: ParserData): Generator<void, Float64Array, Uint8Array>;
export function parseFloat32Array(data: ParserData): Generator<void, Float32Array, Uint8Array>;
export function parseUint32Array(data: ParserData): Generator<void, Uint32Array, Uint8Array>;
export function parseInt32Array(data: ParserData): Generator<void, Uint32Array, Uint8Array>;
export function parseUint16Array(data: ParserData): Generator<void, Uint16Array, Uint8Array>;
export function parseInt16Array(data: ParserData): Generator<void, Int16Array, Uint8Array>;
export function parseUint8ClampedArray(data: ParserData): Generator<void, Uint8ClampedArray, Uint8Array>;
export function parseUint8Array(data: ParserData): Generator<void, Uint8Array, Uint8Array>;
export function parseInt8Array(data: ParserData): Generator<void, Int8Array, Uint8Array>;
export function parseNumber(data: ParserData): Generator<void, number, Uint8Array>;
export function parseBigInt(data: ParserData): Generator<void, bigint, Uint8Array>;
export function parseUint32(data: ParserData): Generator<void, number, Uint8Array>;
export function parseInt32(data: ParserData): Generator<void, number, Uint8Array>;
export function parseUint16(data: ParserData): Generator<void, number, Uint8Array>;
export function parseInt16(data: ParserData): Generator<void, number, Uint8Array>;
export function parseUint8(data: ParserData): Generator<void, number, Uint8Array>;
export function parseInt8(data: ParserData): Generator<void, number, Uint8Array>;
export function parseArrayBuffer(data: ParserData): Generator<void, number, ArrayBuffer>;
export function parseUndefined(): Generator<void, undefined, Uint8Array>;
export function parseNull(): Generator<void, null, Uint8Array>;
export function parseNaN(): Generator<void, number, Uint8Array>;
export function parseBoolean(data: ParserData): Generator<void, boolean, Uint8Array>;
export function parseMap(data: ParserData): Generator<void, Map<any, any>, Uint8Array>;
export function parseSet(data: ParserData): Generator<void, Set<any>, Uint8Array>;
export function parseDate(data: ParserData): Generator<void, Date, Uint8Array>;
export function parseError(data: ParserData): Generator<void, Error, Uint8Array>;
export function parseRegExp(data: ParserData): Generator<void, RegExp, Uint8Array>;
export function parseStringObject(data: ParserData): Generator<void, String, Uint8Array>;
export function parseNumberObject(data: ParserData): Generator<void, Number, Uint8Array>;
export function parseBooleanObject(data: ParserData): Generator<void, Boolean, Uint8Array>;
export function parseSymbol(data: ParserData): Generator<void, Symbol, Uint8Array>;

export function testObject(value: any): boolean;
export function testArray(value: any): boolean;
export function testString(value: any): boolean;
export function testBigUint64Array(value: any): boolean;
export function testBigInt64Array(value: any): boolean;
export function testFloat64Array(value: any): boolean;
export function testUint32Array(value: any): boolean;
export function testInt32Array(value: any): boolean;
export function testUint16Array(value: any): boolean;
export function testFloat32Array(value: any): boolean;
export function testInt16Array(value: any): boolean;
export function testUint8ClampedArray(value: any): boolean;
export function testUint8Array(value: any): boolean;
export function testInt8Array(value: any): boolean;
export function testNumber(value: any): boolean;
export function testBigInt(value: any): boolean;
export function testUint32(value: any): boolean;
export function testInt32(value: any): boolean;
export function testUint16(value: any): boolean;
export function testInt16(value: any): boolean;
export function testUint8(value: any): boolean;
export function testInt8(value: any): boolean;
export function testArrayBuffer(value: any): boolean;
export function testInteger(value: any): boolean;
export function testUndefined(value: any): boolean;
export function testNull(value: any): boolean;
export function testNaN(value: any): boolean;
export function testBoolean(value: any): boolean;
export function testMap(value: any): boolean;
export function testSet(value: any): boolean;
export function testDate(value: any): boolean;
export function testError(value: any): boolean;
export function testRegExp(value: any): boolean;
export function testStringObject(value: any): boolean;
export function testNumberObject(value: any): boolean;
export function testBooleanObject(value: any): boolean;
export function testSymbol(value: any): boolean;
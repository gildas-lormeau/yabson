// deno-lint-ignore-file no-explicit-any ban-types

interface TypedArray {
    length: number;
    buffer: ArrayBuffer;
}

interface SerializerOptions {
    chunkSize?: number;
}

interface SerializerData {
    append(array: Uint8Array): Promise<Uint8Array>;
    flush(): Promise<void>;
    addObject(value: any): void;
}

interface ParserData {
    consume(size: number): Promise<Uint8Array>;
    createObjectWrapper(): Object;
    addObjectSetter(functionArguments: Array<any>, setterFunction: Function): void;
    executeSetters(): void;
}

export function getSerializer(value: any, options?: SerializerOptions): AsyncGenerator<Uint8Array, void, void>;
export function getParser(): AsyncGenerator<Uint8Array>;
export function registerType(serialize: Function, parse: Function, test: Function, type?: number): void;
export function clone(object: any, options?: SerializerOptions): Promise<any>;
export function serialize(object: any, options?: SerializerOptions): Promise<Uint8Array>;
export function parse(array: Uint8Array): Promise<any>;

export function serializeValue(data: SerializerData, value: any): Promise<Uint8Array>;
export function serializeObject(data: SerializerData, object: object): Promise<Uint8Array>;
export function serializeArray(data: SerializerData, array: Array<any>): Promise<Uint8Array>;
export function serializeString(data: SerializerData, string: string): Promise<Uint8Array>;
export function serializeTypedArray(data: SerializerData, array: TypedArray): Promise<Uint8Array>;
export function serializeArrayBuffer(data: SerializerData, array: ArrayBuffer): Promise<Uint8Array>;
export function serializeNumber(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeBigInt(data: SerializerData, number: bigint): Promise<Uint8Array>;
export function serializeUint32(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeInt32(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeUint16(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeInt16(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeUint8(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeInt8(data: SerializerData, number: number): Promise<Uint8Array>;
export function serializeBoolean(data: SerializerData, boolean: boolean): Promise<Uint8Array>;
export function serializeMap(data: SerializerData, map: Map<any, any>): Promise<Uint8Array>;
export function serializeSet(data: SerializerData, set: Set<any>): Promise<Uint8Array>;
export function serializeDate(data: SerializerData, date: Date): Promise<Uint8Array>;
export function serializeError(data: SerializerData, error: Error): Promise<Uint8Array>;
export function serializeRegExp(data: SerializerData, regExp: RegExp): Promise<Uint8Array>;
export function serializeStringObject(data: SerializerData, string: String): Promise<Uint8Array>;
export function serializeNumberObject(data: SerializerData, number: Number): Promise<Uint8Array>;
export function serializeBooleanObject(data: SerializerData, boolean: Boolean): Promise<Uint8Array>;
export function serializeSymbol(data: SerializerData, symbol: Symbol): Promise<Uint8Array>;

export function parseValue(data: ParserData): Promise<Uint8Array>;
export function parseObject(data: ParserData): Promise<Uint8Array>;
export function parseArray(data: ParserData): Promise<Uint8Array>;
export function parseString(data: ParserData): Promise<Uint8Array>;
export function parseBigUint64Array(data: ParserData): Promise<Uint8Array>;
export function parseBigInt64Array(data: ParserData): Promise<Uint8Array>;
export function parseFloat64Array(data: ParserData): Promise<Uint8Array>;
export function parseFloat32Array(data: ParserData): Promise<Uint8Array>;
export function parseUint32Array(data: ParserData): Promise<Uint8Array>;
export function parseInt32Array(data: ParserData): Promise<Uint8Array>;
export function parseUint16Array(data: ParserData): Promise<Uint8Array>;
export function parseInt16Array(data: ParserData): Promise<Uint8Array>;
export function parseUint8ClampedArray(data: ParserData): Promise<Uint8Array>;
export function parseUint8Array(data: ParserData): Promise<Uint8Array>;
export function parseInt8Array(data: ParserData): Promise<Uint8Array>;
export function parseNumber(data: ParserData): Promise<Uint8Array>;
export function parseBigInt(data: ParserData): Promise<Uint8Array>;
export function parseUint32(data: ParserData): Promise<Uint8Array>;
export function parseInt32(data: ParserData): Promise<Uint8Array>;
export function parseUint16(data: ParserData): Promise<Uint8Array>;
export function parseInt16(data: ParserData): Promise<Uint8Array>;
export function parseUint8(data: ParserData): Promise<Uint8Array>;
export function parseInt8(data: ParserData): Promise<Uint8Array>;
export function parseArrayBuffer(data: ParserData): Promise<ArrayBuffer>;
export function parseUndefined(): Promise<Uint8Array>;
export function parseNull(): Promise<Uint8Array>;
export function parseNaN(): Promise<Uint8Array>;
export function parseBoolean(data: ParserData): Promise<Uint8Array>;
export function parseMap(data: ParserData): Promise<Uint8Array>;
export function parseSet(data: ParserData): Promise<Uint8Array>;
export function parseDate(data: ParserData): Promise<Uint8Array>;
export function parseError(data: ParserData): Promise<Uint8Array>;
export function parseRegExp(data: ParserData): Promise<Uint8Array>;
export function parseStringObject(data: ParserData): Promise<Uint8Array>;
export function parseNumberObject(data: ParserData): Promise<Uint8Array>;
export function parseBooleanObject(data: ParserData): Promise<Uint8Array>;
export function parseSymbol(data: ParserData): Promise<Uint8Array>;

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
// tslint:disable: no-bitwise
// const b = new ArrayBuffer(16)
// const a = new Float64Array(b)
// a[0] = -0.001
// a[1] = -0.002
// const c = new Float64Array(b)
// console.log(a, b, c[0])

import { IOperatantType, I } from './vm'

// const d = new Float64Array(b.slice(8))
// a[1] = 0.03
// console.log(c, d[0])

export const concatBuffer = (buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer => {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength)
  tmp.set(new Uint8Array(buffer1), 0)
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength)
  return tmp.buffer
}

/**
 * Converts an ArrayBuffer to a String.
 *
 * @param buffer - Buffer to convert.
 * @returns String.
 */
export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)))
}

/**
 * Converts a String to an ArrayBuffer.
 *
 * @param str - String to convert.
 * @returns ArrayBuffer.
 */
export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const stringLength = str.length
  const buffer = new ArrayBuffer(stringLength * 2)
  const bufferView = new Uint16Array(buffer)
  for (let i = 0; i < stringLength; i++) {
    bufferView[i] = str.charCodeAt(i)
  }
  return buffer
}

export const getByProp = (obj: any, prop: string): any =>
  String(prop).split('.').reduce((o: any, p: string): any => o[p], obj)

// const u = { name: { age: "TOMY" } }
// console.time("check")
// for (let i = 0; i < 10000; i++) {
//   console.log(u.name.age)
//   console.log("LOG SOMETHING...")
//   console.log("LOG SOMETHING...3", "LOG SOMETHING...2")
// }
// console.timeEnd("check")

export const parseStringsArray = (buffer: ArrayBuffer): string[] => {
  const strings: string[] = []
  let i = 0
  while(i < buffer.byteLength) {
    const lentOffset = i + 4
    const len = readUInt32(buffer, i, lentOffset)
    const start = lentOffset
    const end = lentOffset + len * 2
    const str = readString(buffer, start, end)
    strings.push(str)
    i = end
  }
  return strings
}

export const readFloat64 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Float64Array(buffer.slice(from, to)))[0]
}

export const readUInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint8Array(buffer.slice(from, to)))[0]
}

export const readInt8 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int8Array(buffer.slice(from, to)))[0]
}

export const readInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Int16Array(buffer.slice(from, to)))[0]
}

export const readUInt16 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint16Array(buffer.slice(from, to)))[0]
}

export const readUInt32 = (buffer: ArrayBuffer, from: number, to: number): number => {
  return (new Uint32Array(buffer.slice(from, to)))[0]
}

export const readString = (buffer: ArrayBuffer, from: number, to: number): string => {
  return arrayBufferToString(buffer.slice(from, to))
}


const OPERANT_TYPE_MASK = 0b11110000
const OPERANT_BYTE_LEN_MASK = ~OPERANT_TYPE_MASK

export const createFloat64OperantBuff = (ot: IOperatantType, value: number, forceLength?: number): ArrayBuffer =>  {
  const numBuf = value !== void 0
      ? new Float64Array([value]).buffer
      : new ArrayBuffer(0)
  const byteLength = forceLength || getByteLengthFromFloat64(value)
  // console.log('---> byteLength', byteLength)
  const head = createOperantHead(ot, byteLength)
  return concatBuffer(head, numBuf.slice(8 - byteLength))
  // console.log('-> head', head)
  // console.log('-> value', new Uint8Array(numBuf))
  // console.log('-> operant', 'length -> ', numBuf.byteLength, new Uint8Array(operantBuf))
  // return operantBuf
}

export const createInt32OperantBuff = (ot: IOperatantType, value: number, forceLength?: number): ArrayBuffer =>  {
  const numBuf = value !== void 0
      ? new Uint32Array([value]).buffer
      : new ArrayBuffer(0)
  const byteLength = forceLength || getByteLengthFromInt32(value)
  const head = createOperantHead(ot, byteLength)
  return concatBuffer(head, numBuf.slice(0, byteLength))
}

export const createOperantBuffer = (ot: IOperatantType, value: number, forceLength?: number): ArrayBuffer => {
  if (ot === IOperatantType.NUMBER) {
    return createFloat64OperantBuff(ot, value, forceLength)
  } else {
    // return createInt32OperantBuff(ot, value, forceLength)
    return createInt32OperantBuff(ot, value, forceLength)
  }
}

export const getOperatantByBuffer = (arrayBuffer: ArrayBuffer, i: number = 0): [IOperatantType, number, number] => {
  const buffer = new Uint8Array(arrayBuffer)
  const head = buffer[i++]
  const [ot, byteLength] = getOperantTypeAndByteLengthByNum(head)
  // console.log('head -> ', head, buffer.slice(i, i + byteLength))
  // const value = getFloat64OperatantValueByBuffer(buffer, i, byteLength)
  const value = ot === IOperatantType.NUMBER
    ? getFloat64OperatantValueByBuffer(buffer, i, byteLength)
    : getInt32OperatantValueByBuffer(buffer, i, byteLength)
  return [ot, value, byteLength]
}

const createOperantHead = (ot: IOperatantType, byteLength: number): ArrayBuffer => {
  return new Uint8Array([ot | byteLength]).buffer
}

// const saveNumberToMinimalByteBuffer = (
//   largeBuf: Float64Array | Int32Array,
//   forceLength?: number,
// ): ArrayBuffer => {
//   const uint8buf = new Uint8Array(largeBuf.buffer)
//   const i = (largeBuf instanceof Float64Array)
//     ? getByteLengthFromFloat64()
//   // largeBuf[0] = num
//   // let i = 0
//   // while (uint8buf[i] === 0) {
//   //   i++
//   // }
//   // i = forceLength
//   //   ? uint8buf.length - forceLength
//   //   : i
//   return uint8buf.slice(i).buffer
// }

export const getFloat64OperatantValueByBuffer = (
  buffer: Uint8Array, i: number = 0, byteLength: number): number => {
  const num64Buf = new Float64Array(1)
  const num8For64Buf = new Uint8Array(num64Buf.buffer)
  num8For64Buf.set(buffer.slice(i, i + byteLength), num8For64Buf.length - byteLength)
  return num64Buf[0]
}

export const getInt32OperatantValueByBuffer = (
  buffer: Uint8Array, i: number = 0, byteLength: number): number => {
  const num32Buf = new Int32Array(1)
  const num8For32Buf = new Uint8Array(num32Buf.buffer)
  num8For32Buf.set(buffer.slice(i, i + byteLength), 0)
  return num32Buf[0]
}

export const getOperantTypeAndByteLengthByNum = (head: number): [IOperatantType, number] => {
  const ot = head & OPERANT_TYPE_MASK
  const byteLength = head & OPERANT_BYTE_LEN_MASK
  return [ot, byteLength]
}

export const getByteLengthFromInt32 = (num: number): number => {
  const n32Buf = new Int32Array([num])
  const n8For32Buf = new Uint8Array(n32Buf.buffer)
  let i = n8For32Buf.length
  while (i-- > 0) {
    if (n8For32Buf[i] > 0) {
      break
    }
  }
  return i + 1
}

export const getByteLengthFromFloat64 = (num: number): number => {
  const n64Buf = new Float64Array([num])
  const n8For64Buf = new Uint8Array(n64Buf.buffer)
  let i = 0
  while (n8For64Buf[i] === 0) {
    i++
  }
  return 8 - i
}

export const getOperantName = (o: I): string => {
  return I[o]
}

const test = (ot: IOperatantType, num: number, len?: number): void => {
  const a = getOperatantByBuffer(createOperantBuffer(ot, num))
  console.assert(a[0] === ot && a[1] === num)
  if (len) {
    console.assert(a[2] === len)
  }
  if (a[0] !== ot || a[1] !== num) {
    throw new Error("assert failed")
  }
}

const testCases = (): void => {
  test(IOperatantType.NUMBER, 3, 2)
  test(IOperatantType.NUMBER, 3.14, 8)
  test(IOperatantType.NUMBER, 0.33)
  test(IOperatantType.REGISTER, 108, 1)
  test(IOperatantType.FUNCTION_INDEX, 0, 0)
  test(IOperatantType.CLOSURE_REGISTER, 0, 0)
  test(IOperatantType.REGISTER, 0, 0)
  const types = [
    IOperatantType.REGISTER,
    IOperatantType.FUNCTION_INDEX,
    IOperatantType.ADDRESS,
    IOperatantType.ARG_COUNT,
  ]
  for (let i = 0; i < 1000; i++) {
    test(IOperatantType.NUMBER, Math.random() * 1000)
    const t = types[Math.floor(Math.random() * types.length)]
    const n = Math.floor(Math.random() * 10000000)
    console.log(t, n)
    test(t, n)
  }
}

export class CategoriesPriorityQueue<T = any> {
  public categories: { [x in number]: T[] } = {}
  constructor() {}

  public push(item: T, p: number = 100): void {
    const list: T[] = this.categories[p] || []
    list.push(item)
    this.categories[p] = list
  }

  public clear(): void {
    this.categories = {}
  }

  *[Symbol.iterator] (): IterableIterator<T> {
    const ll: T[][] = Object
      .entries(this.categories)
      .sort(([x], [y]): number => Number(x) - Number[y])
      .map(([_, list]): any => list)
    for (const l of ll) {
      for (const i of l) {
        yield i
      }
    }
  }
}

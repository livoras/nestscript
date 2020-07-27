// tslint:disable: no-bitwise
// const b = new ArrayBuffer(16)
// const a = new Float64Array(b)
// a[0] = -0.001
// a[1] = -0.002
// const c = new Float64Array(b)
// console.log(a, b, c[0])

import { IOperatantType } from './vm'
import { constants } from 'buffer'

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

const num64Buf = new Float64Array(1)
const num8For64Buf = new Uint8Array(num64Buf.buffer)

export const createOperantBuffer = (ot: IOperatantType, value: number): ArrayBuffer => {
  num64Buf[0] = value
  let i = 0
  while (num8For64Buf[i] === 0) {
    i++
  }
  const numBytes = 8 - i
  const head = ot | numBytes
  const buffer = new Uint8Array(numBytes + 1)
  buffer[0] = head
  buffer.set(num8For64Buf.slice(i), 1)
  return buffer.buffer
}

export const getOperatantByBuffer = (arrayBuffer: ArrayBuffer, i: number = 0): [IOperatantType, number, number] => {
  const buffer = new Uint8Array(arrayBuffer)
  const head = buffer[i]
  i++
  const ot = head & OPERANT_TYPE_MASK
  const byteLength = head & OPERANT_BYTE_LEN_MASK
  num8For64Buf.set(buffer.slice(i, i + byteLength), 8 - byteLength)
  return [ot, num64Buf[0], byteLength]
}

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.createVMFromArrayBuffer = exports.VirtualMachine = exports.operantBytesSize = exports.I = void 0;
const utils_1 = __webpack_require__(1);
var I;
(function (I) {
    I[I["MOV"] = 0] = "MOV";
    I[I["ADD"] = 1] = "ADD";
    I[I["SUB"] = 2] = "SUB";
    I[I["MUL"] = 3] = "MUL";
    I[I["DIV"] = 4] = "DIV";
    I[I["MOD"] = 5] = "MOD";
    I[I["EXP"] = 6] = "EXP";
    I[I["NEG"] = 7] = "NEG";
    I[I["INC"] = 8] = "INC";
    I[I["DEC"] = 9] = "DEC";
    I[I["LT"] = 10] = "LT";
    I[I["GT"] = 11] = "GT";
    I[I["EQ"] = 12] = "EQ";
    I[I["LE"] = 13] = "LE";
    I[I["GE"] = 14] = "GE";
    I[I["NE"] = 15] = "NE";
    I[I["AND"] = 16] = "AND";
    I[I["OR"] = 17] = "OR";
    I[I["XOR"] = 18] = "XOR";
    I[I["NOT"] = 19] = "NOT";
    I[I["SHL"] = 20] = "SHL";
    I[I["SHR"] = 21] = "SHR";
    I[I["JMP"] = 22] = "JMP";
    I[I["JE"] = 23] = "JE";
    I[I["JNE"] = 24] = "JNE";
    I[I["JG"] = 25] = "JG";
    I[I["JL"] = 26] = "JL";
    I[I["JIF"] = 27] = "JIF";
    I[I["JF"] = 28] = "JF";
    I[I["JGE"] = 29] = "JGE";
    I[I["JLE"] = 30] = "JLE";
    I[I["PUSH"] = 31] = "PUSH";
    I[I["POP"] = 32] = "POP";
    I[I["CALL"] = 33] = "CALL";
    I[I["PRINT"] = 34] = "PRINT";
    I[I["RET"] = 35] = "RET";
    I[I["PAUSE"] = 36] = "PAUSE";
    I[I["EXIT"] = 37] = "EXIT";
    I[I["CALL_CTX"] = 38] = "CALL_CTX";
    I[I["CALL_VAR"] = 39] = "CALL_VAR";
    I[I["CALL_REG"] = 40] = "CALL_REG";
    I[I["MOV_CTX"] = 41] = "MOV_CTX";
    I[I["MOV_PROP"] = 42] = "MOV_PROP";
    I[I["SET_CTX"] = 43] = "SET_CTX";
    I[I["NEW_OBJ"] = 44] = "NEW_OBJ";
    I[I["NEW_ARR"] = 45] = "NEW_ARR";
    I[I["SET_KEY"] = 46] = "SET_KEY";
    I[I["FUNC"] = 47] = "FUNC";
    I[I["ALLOC"] = 48] = "ALLOC";
})(I = exports.I || (exports.I = {}));
exports.operantBytesSize = {
    [4]: 2,
    [5]: 2,
    [0]: 2,
    [1]: 2,
    [2]: 2,
    [6]: 2,
    [8]: 4,
    [3]: 8,
    [7]: 0,
};
class VirtualMachine {
    constructor(codes, functionsTable, stringsTable, entryFunctionIndex, globalSize, ctx) {
        this.codes = codes;
        this.functionsTable = functionsTable;
        this.stringsTable = stringsTable;
        this.entryFunctionIndex = entryFunctionIndex;
        this.globalSize = globalSize;
        this.ctx = ctx;
        this.ip = 0;
        this.fp = 0;
        this.sp = -1;
        this.stack = [];
        this.heap = [];
        this.closureTable = {};
        this.closureTables = [];
        this.isRunning = false;
        this.makeClosureIndex = (index) => {
            if (this.closureTable[index] === undefined) {
                this.closureTable[index] = this.heap.length;
                this.heap.push(undefined);
            }
            return this.closureTable[index];
        };
        this.init();
    }
    init() {
        const { globalSize, functionsTable, entryFunctionIndex } = this;
        this.stack = [];
        this.heap = [];
        const globalIndex = globalSize + 1;
        const mainLocalSize = functionsTable[entryFunctionIndex].localSize;
        this.fp = globalIndex;
        this.stack[this.fp] = -1;
        this.sp = this.fp + mainLocalSize;
        this.stack.length = this.sp + 1;
        this.closureTable = {};
        this.closureTables = [this.closureTable];
        console.log('globalIndex', globalIndex, 'localSize', functionsTable[entryFunctionIndex].localSize);
        console.log("start ---> fp", this.fp, this.sp);
    }
    run() {
        this.ip = this.functionsTable[this.entryFunctionIndex].ip;
        console.log("start stack", this.stack);
        this.isRunning = true;
        while (this.isRunning) {
            this.fetchAndExecute();
        }
    }
    setReg(dst, src) {
        if (dst.type === 1) {
            this.heap[this.makeClosureIndex(dst.index)] = src.value;
        }
        else {
            this.stack[dst.index] = src.value;
        }
    }
    getReg(operatant) {
        if (operatant.type === 1) {
            return this.heap[this.makeClosureIndex(operatant.index)];
        }
        else {
            return this.stack[operatant.index];
        }
    }
    fetchAndExecute() {
        const stack = this.stack;
        const op = this.nextOperator();
        switch (op) {
            case I.PUSH: {
                this.push(this.nextOperant().value);
                break;
            }
            case I.EXIT: {
                console.log('exit stack size -> ', stack.length);
                console.log('stack -> ', this.stack);
                console.log('heap -> ', this.heap);
                console.log('closures -> ', this.closureTables);
                this.isRunning = false;
                this.closureTables = [];
                this.init();
                break;
            }
            case I.CALL: {
                const funcInfo = this.nextOperant().value;
                const numArgs = this.nextOperant().value;
                this.callFunction(funcInfo, numArgs);
                break;
            }
            case I.RET: {
                const fp = this.fp;
                this.fp = stack[fp];
                this.ip = stack[fp - 1];
                this.sp = fp - stack[fp - 2] - 3;
                this.stack = stack.slice(0, this.sp + 1);
                this.closureTables.pop();
                this.closureTable = this.closureTables[this.closureTables.length - 1];
                break;
            }
            case I.PRINT: {
                const val = this.nextOperant();
                console.log(val.value);
                break;
            }
            case I.MOV: {
                const dst = this.nextOperant();
                const src = this.nextOperant();
                this.setReg(dst, src);
                break;
            }
            case I.JMP: {
                const address = this.nextOperant();
                this.ip = address.value;
                break;
            }
            case I.JE: {
                this.jumpWithCondidtion((a, b) => a === b);
                break;
            }
            case I.JNE: {
                this.jumpWithCondidtion((a, b) => a !== b);
                break;
            }
            case I.JG: {
                this.jumpWithCondidtion((a, b) => a > b);
                break;
            }
            case I.JL: {
                this.jumpWithCondidtion((a, b) => a < b);
                break;
            }
            case I.JGE: {
                this.jumpWithCondidtion((a, b) => a >= b);
                break;
            }
            case I.JLE: {
                this.jumpWithCondidtion((a, b) => a <= b);
                break;
            }
            case I.JIF: {
                const cond = this.nextOperant();
                const address = this.nextOperant();
                if (cond.value) {
                    this.ip = address.value;
                }
                break;
            }
            case I.JF: {
                const cond = this.nextOperant();
                const address = this.nextOperant();
                if (!cond.value) {
                    this.ip = address.value;
                }
                break;
            }
            case I.CALL_CTX:
            case I.CALL_VAR: {
                let o;
                if (op === I.CALL_CTX) {
                    o = this.ctx;
                }
                else {
                    o = this.nextOperant().value;
                }
                const f = this.nextOperant().value;
                const numArgs = this.nextOperant().value;
                const args = [];
                for (let i = 0; i < numArgs; i++) {
                    args.push(stack[this.sp--]);
                }
                stack[0] = o[f].apply(o, args);
                this.stack = stack.slice(0, this.sp + 1);
                break;
            }
            case I.CALL_REG: {
                const o1 = this.nextOperant();
                const f = o1.value;
                const numArgs = this.nextOperant().value;
                const args = [];
                for (let i = 0; i < numArgs; i++) {
                    args.push(stack[this.sp--]);
                }
                f(...args);
                break;
            }
            case I.MOV_CTX: {
                const dst = this.nextOperant();
                const propKey = this.nextOperant();
                const src = utils_1.getByProp(this.ctx, propKey.value);
                this.setReg(dst, { value: src });
                break;
            }
            case I.SET_CTX: {
                const propKey = this.nextOperant();
                const val = this.nextOperant();
                this.ctx[propKey.value] = val.value;
                break;
            }
            case I.NEW_OBJ: {
                const dst = this.nextOperant();
                const o = {};
                this.setReg(dst, { value: o });
                break;
            }
            case I.NEW_ARR: {
                const dst = this.nextOperant();
                const o = [];
                this.setReg(dst, { value: o });
                break;
            }
            case I.SET_KEY: {
                const o = this.nextOperant().value;
                const key = this.nextOperant().value;
                const value = this.nextOperant().value;
                o[key] = value;
                break;
            }
            case I.FUNC: {
                const dst = this.nextOperant();
                const funcInfo = this.nextOperant().value;
                const callback = this.newCallback(Object.assign(Object.assign({}, funcInfo), { closureTable: Object.assign({}, this.closureTable) }));
                this.setReg(dst, { value: callback });
                break;
            }
            case I.MOV_PROP: {
                const dst = this.nextOperant();
                const o = this.nextOperant().value;
                const k = this.nextOperant().value;
                const v = utils_1.getByProp(o, k);
                this.setReg(dst, { value: v });
                break;
            }
            case I.LT: {
                this.binaryExpression((a, b) => a < b);
                break;
            }
            case I.GT: {
                this.binaryExpression((a, b) => a > b);
                break;
            }
            case I.EQ: {
                this.binaryExpression((a, b) => a === b);
                break;
            }
            case I.LE: {
                this.binaryExpression((a, b) => a <= b);
                break;
            }
            case I.GE: {
                this.binaryExpression((a, b) => a >= b);
                break;
            }
            case I.ADD: {
                this.binaryExpression((a, b) => a + b);
                break;
            }
            case I.SUB: {
                this.binaryExpression((a, b) => a - b);
                break;
            }
            case I.MUL: {
                this.binaryExpression((a, b) => a * b);
                break;
            }
            case I.DIV: {
                this.binaryExpression((a, b) => a / b);
                break;
            }
            case I.MOD: {
                this.binaryExpression((a, b) => a % b);
                break;
            }
            case I.ALLOC: {
                const dst = this.nextOperant();
                this.getReg(dst);
                break;
            }
            default:
                console.log(this.ip);
                throw new Error("Unknow command " + op);
        }
        return op;
    }
    push(val) {
        this.stack[++this.sp] = val;
    }
    callFunction(funcInfo, numArgs) {
        if (!funcInfo.closureTable) {
            funcInfo.closureTable = {};
        }
        this.closureTable = funcInfo.closureTable;
        this.closureTables.push(funcInfo.closureTable);
        const stack = this.stack;
        stack[++this.sp] = numArgs;
        stack[++this.sp] = this.ip;
        stack[++this.sp] = this.fp;
        this.ip = funcInfo.ip;
        this.fp = this.sp;
        this.sp += funcInfo.localSize;
    }
    nextOperator() {
        return readUInt8(this.codes, this.ip, ++this.ip);
    }
    nextOperant() {
        const codes = this.codes;
        const valueType = readUInt8(codes, this.ip, ++this.ip);
        let value;
        switch (valueType) {
            case 0:
            case 1:
            case 2:
            case 6:
            case 4:
            case 5: {
                const j = this.ip + 2;
                value = readInt16(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 8: {
                const j = this.ip + 4;
                value = readUInt32(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 3: {
                const j = this.ip + 8;
                value = readFloat64(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 7:
                value = 0;
                break;
            default:
                throw new Error("Unknown operant " + valueType);
        }
        return {
            type: valueType,
            value: this.parseValue(valueType, value),
            raw: value,
            index: valueType === 0 ? (this.fp + value) : value,
        };
    }
    parseValue(valueType, value) {
        switch (valueType) {
            case 1:
                return this.heap[this.closureTable[value]];
            case 0:
                return this.stack[this.fp + value];
            case 6:
            case 3:
            case 8:
                return value;
            case 2:
                return this.stack[value];
            case 5:
                return this.stringsTable[value];
            case 4:
                return Object.assign({}, this.functionsTable[value]);
            case 7:
                return this.stack[0];
            default:
                throw new Error("Unknown operant " + valueType);
        }
    }
    jumpWithCondidtion(cond) {
        const op1 = this.nextOperant();
        const op2 = this.nextOperant();
        const address = this.nextOperant();
        if (cond(op1.value, op2.value)) {
            this.ip = address.value;
        }
    }
    binaryExpression(exp) {
        const o1 = this.nextOperant();
        const o2 = this.nextOperant();
        const ret = exp(o1.value, o2.value);
        this.stack[o1.index] = ret;
    }
    newCallback(funcInfo) {
        return (...args) => {
            args.reverse();
            args.forEach((arg) => this.push(arg));
            this.callFunction(funcInfo, args.length);
            let op = null;
            let callCount = 1;
            while (callCount !== 0) {
                op = this.fetchAndExecute();
                if (op === I.CALL) {
                    callCount++;
                }
                else if (op === I.RET) {
                    callCount--;
                }
                else {
                }
            }
        };
    }
}
exports.VirtualMachine = VirtualMachine;
const createVMFromArrayBuffer = (buffer, ctx = {}) => {
    const mainFunctionIndex = readUInt32(buffer, 0, 4);
    const funcionTableBasicIndex = readUInt32(buffer, 4, 8);
    const stringTableBasicIndex = readUInt32(buffer, 8, 12);
    const globalsSize = readUInt32(buffer, 12, 16);
    console.log('main function index', mainFunctionIndex, 'function table basic index', funcionTableBasicIndex, 'string table basic index', stringTableBasicIndex, 'globals szie ', globalsSize);
    const stringsTable = parseStringsArray(buffer.slice(stringTableBasicIndex));
    const codesBuf = buffer.slice(4 * 4, funcionTableBasicIndex);
    const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex);
    const funcsTable = parseFunctionTable(funcsBuf);
    console.log('string table', stringsTable);
    console.log('function table', funcsTable);
    console.log(mainFunctionIndex, funcsTable, 'function basic index', funcionTableBasicIndex);
    console.log('codes length -->', codesBuf.byteLength, stringTableBasicIndex);
    console.log('main start index', funcsTable[mainFunctionIndex].ip, stringTableBasicIndex);
    return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex, globalsSize, ctx);
};
exports.createVMFromArrayBuffer = createVMFromArrayBuffer;
const parseFunctionTable = (buffer) => {
    const funcs = [];
    let i = 0;
    while (i < buffer.byteLength) {
        const ipEnd = i + 4;
        const ip = readUInt32(buffer, i, ipEnd);
        const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2));
        funcs.push({ ip, numArgs: numArgsAndLocal[0], localSize: numArgsAndLocal[1] });
        i += 8;
    }
    return funcs;
};
const parseStringsArray = (buffer) => {
    const strings = [];
    let i = 0;
    while (i < buffer.byteLength) {
        const lentOffset = i + 4;
        const len = readUInt32(buffer, i, lentOffset);
        const start = lentOffset;
        const end = lentOffset + len * 2;
        const str = readString(buffer, start, end);
        strings.push(str);
        i = end;
    }
    return strings;
};
const readFloat64 = (buffer, from, to) => {
    return (new Float64Array(buffer.slice(from, to)))[0];
};
const readUInt8 = (buffer, from, to) => {
    return (new Uint8Array(buffer.slice(from, to)))[0];
};
const readInt8 = (buffer, from, to) => {
    return (new Int8Array(buffer.slice(from, to)))[0];
};
const readInt16 = (buffer, from, to) => {
    return (new Int16Array(buffer.slice(from, to)))[0];
};
const readUInt16 = (buffer, from, to) => {
    return (new Uint16Array(buffer.slice(from, to)))[0];
};
const readUInt32 = (buffer, from, to) => {
    return (new Uint32Array(buffer.slice(from, to)))[0];
};
const readString = (buffer, from, to) => {
    return utils_1.arrayBufferToString(buffer.slice(from, to));
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getByProp = exports.stringToArrayBuffer = exports.arrayBufferToString = exports.concatBuffer = void 0;
exports.concatBuffer = (buffer1, buffer2) => {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};
exports.arrayBufferToString = (buffer) => {
    return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)));
};
exports.stringToArrayBuffer = (str) => {
    const stringLength = str.length;
    const buffer = new ArrayBuffer(stringLength * 2);
    const bufferView = new Uint16Array(buffer);
    for (let i = 0; i < stringLength; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return buffer;
};
exports.getByProp = (obj, prop) => String(prop).split('.').reduce((o, p) => o[p], obj);


/***/ })
/******/ ]);
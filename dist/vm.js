(function(e, a) { for(var i in a) e[i] = a[i]; }(exports, /******/ (function(modules) { // webpackBootstrap
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
exports.Callable = exports.createVMFromArrayBuffer = exports.VirtualMachine = exports.I = void 0;
const utils_1 = __webpack_require__(1);
const scope_1 = __webpack_require__(2);
var I;
(function (I) {
    I[I["VAR"] = 0] = "VAR";
    I[I["CLS"] = 1] = "CLS";
    I[I["MOV"] = 2] = "MOV";
    I[I["ADD"] = 3] = "ADD";
    I[I["SUB"] = 4] = "SUB";
    I[I["MUL"] = 5] = "MUL";
    I[I["DIV"] = 6] = "DIV";
    I[I["MOD"] = 7] = "MOD";
    I[I["EXP"] = 8] = "EXP";
    I[I["INC"] = 9] = "INC";
    I[I["DEC"] = 10] = "DEC";
    I[I["LT"] = 11] = "LT";
    I[I["GT"] = 12] = "GT";
    I[I["EQ"] = 13] = "EQ";
    I[I["LE"] = 14] = "LE";
    I[I["GE"] = 15] = "GE";
    I[I["NE"] = 16] = "NE";
    I[I["WEQ"] = 17] = "WEQ";
    I[I["WNE"] = 18] = "WNE";
    I[I["LG_AND"] = 19] = "LG_AND";
    I[I["LG_OR"] = 20] = "LG_OR";
    I[I["AND"] = 21] = "AND";
    I[I["OR"] = 22] = "OR";
    I[I["XOR"] = 23] = "XOR";
    I[I["SHL"] = 24] = "SHL";
    I[I["SHR"] = 25] = "SHR";
    I[I["ZSHR"] = 26] = "ZSHR";
    I[I["JMP"] = 27] = "JMP";
    I[I["JE"] = 28] = "JE";
    I[I["JNE"] = 29] = "JNE";
    I[I["JG"] = 30] = "JG";
    I[I["JL"] = 31] = "JL";
    I[I["JIF"] = 32] = "JIF";
    I[I["JF"] = 33] = "JF";
    I[I["JGE"] = 34] = "JGE";
    I[I["JLE"] = 35] = "JLE";
    I[I["PUSH"] = 36] = "PUSH";
    I[I["POP"] = 37] = "POP";
    I[I["CALL"] = 38] = "CALL";
    I[I["PRINT"] = 39] = "PRINT";
    I[I["RET"] = 40] = "RET";
    I[I["PAUSE"] = 41] = "PAUSE";
    I[I["EXIT"] = 42] = "EXIT";
    I[I["CALL_CTX"] = 43] = "CALL_CTX";
    I[I["CALL_VAR"] = 44] = "CALL_VAR";
    I[I["CALL_REG"] = 45] = "CALL_REG";
    I[I["MOV_CTX"] = 46] = "MOV_CTX";
    I[I["MOV_PROP"] = 47] = "MOV_PROP";
    I[I["SET_CTX"] = 48] = "SET_CTX";
    I[I["NEW_OBJ"] = 49] = "NEW_OBJ";
    I[I["NEW_ARR"] = 50] = "NEW_ARR";
    I[I["NEW_REG"] = 51] = "NEW_REG";
    I[I["SET_KEY"] = 52] = "SET_KEY";
    I[I["FUNC"] = 53] = "FUNC";
    I[I["ALLOC"] = 54] = "ALLOC";
    I[I["PLUS"] = 55] = "PLUS";
    I[I["MINUS"] = 56] = "MINUS";
    I[I["NOT"] = 57] = "NOT";
    I[I["VOID"] = 58] = "VOID";
    I[I["DEL"] = 59] = "DEL";
    I[I["NEG"] = 60] = "NEG";
    I[I["TYPE_OF"] = 61] = "TYPE_OF";
    I[I["IN"] = 62] = "IN";
    I[I["INST_OF"] = 63] = "INST_OF";
    I[I["MOV_THIS"] = 64] = "MOV_THIS";
    I[I["TRY"] = 65] = "TRY";
    I[I["TRY_END"] = 66] = "TRY_END";
    I[I["THROW"] = 67] = "THROW";
    I[I["GET_ERR"] = 68] = "GET_ERR";
    I[I["MOV_ARGS"] = 69] = "MOV_ARGS";
    I[I["FORIN"] = 70] = "FORIN";
    I[I["FORIN_END"] = 71] = "FORIN_END";
    I[I["BREAK_FORIN"] = 72] = "BREAK_FORIN";
    I[I["CONT_FORIN"] = 73] = "CONT_FORIN";
    I[I["BVAR"] = 74] = "BVAR";
    I[I["BLOCK"] = 75] = "BLOCK";
    I[I["END_BLOCK"] = 76] = "END_BLOCK";
    I[I["CLR_BLOCK"] = 77] = "CLR_BLOCK";
})(I = exports.I || (exports.I = {}));
const NO_RETURN_SYMBOL = Symbol();
class VMRunTimeError extends Error {
    constructor(error) {
        super(error);
        this.error = error;
    }
}
class VirtualMachine {
    constructor(codes, functionsTable, entryIndx, stringsTable, globalSize, ctx) {
        this.codes = codes;
        this.functionsTable = functionsTable;
        this.entryIndx = entryIndx;
        this.stringsTable = stringsTable;
        this.globalSize = globalSize;
        this.ctx = ctx;
        this.ip = 0;
        this.fp = 0;
        this.sp = -1;
        this.stack = [];
        this.callingFunctionInfo = {
            isInitClosure: true,
            closureScope: new scope_1.Scope(),
            variables: new scope_1.Scope(),
            args: [],
        };
        this.callingFunctionInfos = [];
        this.allThis = [];
        this.isRunning = false;
        const mainClosureScope = new scope_1.Scope();
        mainClosureScope.isRestoreWhenChange = false;
        this.mainFunction = this.parseToJsFunc(functionsTable[this.entryIndx], mainClosureScope);
        this.init();
    }
    init() {
        const { globalSize, mainFunction } = this;
        const { meta } = this.getMetaFromFunc(mainFunction);
        const [ip, numArgs, localSize] = meta;
        this.stack.splice(0);
        const globalIndex = globalSize + 1;
        this.fp = globalIndex;
        this.stack[this.fp] = -1;
        this.sp = this.fp;
        this.stack.length = this.sp + 1;
        this.callingFunctionInfos = [];
        this.allThis = [];
    }
    reset() {
        this.init();
        this.error = null;
    }
    run() {
        this.callFunction(this.mainFunction, void 0, '', 0, false);
        this.isRunning = true;
        while (this.isRunning) {
            this.fetchAndExecute();
        }
    }
    setReg(dst, src) {
        const callingFunctionInfo = this.callingFunctionInfo;
        if (dst.type === 208) {
            this.checkVariableScopeAndNew();
            callingFunctionInfo.variables.set(dst.index, src.value);
        }
        else if (dst.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.set(dst.index, src.value);
        }
        else if (dst.type === 0 || dst.type === 112) {
            if (dst.type === 112) {
                this.callingFunctionInfo.returnValue = src.value;
            }
            if (dst.raw <= -4) {
                this.callingFunctionInfo.args[-4 - dst.raw] = src.value;
            }
            else {
                this.stack[dst.index] = src.value;
            }
        }
        else {
            console.error(dst);
            throw new Error(`Cannot process register type ${dst.type}`);
        }
    }
    newReg(o) {
        const callingFunctionInfo = this.callingFunctionInfo;
        if (o.type === 208) {
            this.checkVariableScopeAndNew();
            this.callingFunctionInfo.variables.new(o.index);
        }
        else if (o.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.new(o.index);
        }
        else {
            console.error(o);
            throw new Error(`Cannot process register type ${o.type}`);
        }
    }
    getReg(o) {
        if (o.type === 208) {
            if (!this.callingFunctionInfo.variables) {
                throw new Error('variable is not declared.');
            }
            return this.callingFunctionInfo.variables.get(o.index);
        }
        else if (o.type === 16) {
            return this.callingFunctionInfo.closureScope.get(o.index);
        }
        else if (o.type === 0 || o.type === 112) {
            return this.stack[o.index];
        }
        else {
            throw new Error(`Cannot process register type ${o.type}`);
        }
    }
    fetchAndExecute() {
        if (!this.isRunning) {
            throw new VMRunTimeError('try to run again...');
        }
        let op = this.nextOperator();
        let isCallVMFunction = false;
        switch (op) {
            case I.VAR:
            case I.CLS: {
                const o = this.nextOperant();
                this.newReg(o);
                break;
            }
            case I.PUSH: {
                const value = this.nextOperant().value;
                this.push(value);
                break;
            }
            case I.EXIT: {
                this.isRunning = false;
                break;
            }
            case I.RET: {
                this.returnCurrentFunction();
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
                const funcName = this.nextOperant().value;
                const numArgs = this.nextOperant().value;
                const isNewExpression = this.nextOperant().value;
                isCallVMFunction = this.callFunction(void 0, o, funcName, numArgs, isNewExpression);
                break;
            }
            case I.CALL_REG: {
                const o = this.nextOperant();
                const f = o.value;
                const numArgs = this.nextOperant().value;
                const isNewExpression = this.nextOperant().value;
                isCallVMFunction = this.callFunction(f, void 0, '', numArgs, isNewExpression);
                break;
            }
            case I.MOV_CTX: {
                const dst = this.nextOperant();
                const propKey = this.nextOperant();
                const src = this.ctx[propKey.value];
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
            case I.NEW_REG: {
                const dst = this.nextOperant();
                const pattern = this.nextOperant();
                const flags = this.nextOperant();
                try {
                    this.setReg(dst, { value: new RegExp(pattern.value, flags.value) });
                }
                catch (e) {
                    throw new VMRunTimeError(e);
                }
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
                const funcOperant = this.nextOperant();
                const funcInfoMeta = funcOperant.value;
                const func = this.parseToJsFunc(funcInfoMeta, this.callingFunctionInfo.closureScope.fork());
                this.setReg(dst, { value: func });
                break;
            }
            case I.MOV_PROP: {
                const dst = this.nextOperant();
                const o = this.nextOperant();
                const k = this.nextOperant();
                const v = o.value[k.value];
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
            case I.NE: {
                this.binaryExpression((a, b) => a !== b);
                break;
            }
            case I.WEQ: {
                this.binaryExpression((a, b) => a == b);
                break;
            }
            case I.WNE: {
                this.binaryExpression((a, b) => a != b);
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
            case I.AND: {
                this.binaryExpression((a, b) => a & b);
                break;
            }
            case I.OR: {
                this.binaryExpression((a, b) => a | b);
                break;
            }
            case I.XOR: {
                this.binaryExpression((a, b) => a ^ b);
                break;
            }
            case I.SHL: {
                this.binaryExpression((a, b) => a << b);
                break;
            }
            case I.SHR: {
                this.binaryExpression((a, b) => a >> b);
                break;
            }
            case I.ZSHR: {
                this.binaryExpression((a, b) => a >>> b);
                break;
            }
            case I.LG_AND: {
                this.binaryExpression((a, b) => a && b);
                break;
            }
            case I.LG_OR: {
                this.binaryExpression((a, b) => a || b);
                break;
            }
            case I.INST_OF: {
                this.binaryExpression((a, b) => {
                    return a instanceof b;
                });
                break;
            }
            case I.IN: {
                this.binaryExpression((a, b) => {
                    return a in b;
                });
                break;
            }
            case I.ALLOC: {
                const dst = this.nextOperant();
                this.getReg(dst);
                break;
            }
            case I.PLUS: {
                this.uniaryExpression((val) => +val);
                break;
            }
            case I.MINUS: {
                this.uniaryExpression((val) => -val);
                break;
            }
            case I.VOID: {
                this.uniaryExpression((val) => void val);
                break;
            }
            case I.NOT: {
                this.uniaryExpression((val) => ~val);
                break;
            }
            case I.NEG: {
                this.uniaryExpression((val) => !val);
                break;
            }
            case I.TYPE_OF: {
                this.uniaryExpression((val) => typeof val);
                break;
            }
            case I.DEL: {
                const o1 = this.nextOperant().value;
                const o2 = this.nextOperant().value;
                delete o1[o2];
                break;
            }
            case I.MOV_THIS: {
                this.setReg(this.nextOperant(), { value: this.currentThis });
                break;
            }
            case I.TRY: {
                const catchAddress = this.nextOperant();
                const endAddress = this.nextOperant();
                let callCount = 1;
                const currentFunctionInfo = this.callingFunctionInfo;
                while (callCount > 0 && this.isRunning) {
                    try {
                        const [o, isCallVMFunc] = this.fetchAndExecute();
                        op = o;
                        if (isCallVMFunc) {
                            callCount++;
                        }
                        if (o === I.RET) {
                            callCount--;
                            if (callCount === 0) {
                                break;
                            }
                        }
                        if (o === I.TRY_END && callCount === 1) {
                            this.ip = endAddress.value;
                            break;
                        }
                    }
                    catch (e) {
                        if (e instanceof VMRunTimeError) {
                            throw e;
                        }
                        this.popToFunction(currentFunctionInfo);
                        this.error = e;
                        this.ip = catchAddress.value;
                        break;
                    }
                }
                break;
            }
            case I.THROW: {
                const err = this.nextOperant();
                throw err.value;
                break;
            }
            case I.TRY_END: {
                break;
            }
            case I.GET_ERR: {
                const o = this.nextOperant();
                this.setReg(o, { value: this.error });
                break;
            }
            case I.MOV_ARGS: {
                const dst = this.nextOperant();
                this.setReg(dst, { value: this.stack[this.fp - 3] });
                break;
            }
            case I.FORIN: {
                const dst = this.nextOperant();
                const target = this.nextOperant();
                const startAddress = this.nextOperant();
                const endAddress = this.nextOperant();
                forIn: for (const i in target.value) {
                    this.setReg(dst, { value: i });
                    while (true) {
                        const o = this.fetchAndExecute()[0];
                        if (o === I.BREAK_FORIN) {
                            break forIn;
                        }
                        if (o === I.FORIN_END || o === I.CONT_FORIN) {
                            this.ip = startAddress.value;
                            continue forIn;
                        }
                    }
                }
                this.ip = endAddress.value;
                break;
            }
            case I.FORIN_END:
            case I.BREAK_FORIN:
            case I.CONT_FORIN: {
                break;
            }
            case I.BLOCK: {
                const o = this.nextOperant();
                this.checkClosureAndFork();
                this.checkVariableScopeAndNew();
                this.callingFunctionInfo.closureScope.front(o.value);
                this.callingFunctionInfo.variables.front(o.value);
                break;
            }
            case I.CLR_BLOCK:
            case I.END_BLOCK: {
                const o = this.nextOperant();
                this.callingFunctionInfo.closureScope.back(o.value);
                this.callingFunctionInfo.variables.back(o.value);
                break;
            }
            default:
                throw new VMRunTimeError("Unknow command " + op + " " + I[op]);
        }
        return [op, isCallVMFunction];
    }
    checkClosureAndFork() {
        const callingFunctionInfo = this.callingFunctionInfo;
        if (!callingFunctionInfo.isInitClosure) {
            callingFunctionInfo.closureScope = this.callingFunctionInfo.closureScope.fork();
            callingFunctionInfo.isInitClosure = true;
        }
    }
    checkVariableScopeAndNew() {
        if (!this.callingFunctionInfo.variables) {
            this.callingFunctionInfo.variables = new scope_1.Scope();
        }
    }
    returnCurrentFunction() {
        const stack = this.stack;
        const fp = this.fp;
        this.fp = stack[fp];
        this.ip = stack[fp - 1];
        this.sp = fp - stack[fp - 2] - 4;
        this.stack.splice(this.sp + 1);
        if (this.callingFunctionInfo.returnValue === NO_RETURN_SYMBOL) {
            this.stack[0] = undefined;
        }
        this.allThis.pop();
        this.currentThis = this.allThis[this.allThis.length - 1];
        this.callingFunctionInfos.pop();
        this.callingFunctionInfo = this.callingFunctionInfos[this.callingFunctionInfos.length - 1];
    }
    push(val) {
        this.stack[++this.sp] = val;
    }
    nextOperator() {
        return utils_1.readUInt8(this.codes, this.ip, ++this.ip);
    }
    nextOperant() {
        const [operantType, value, byteLength] = utils_1.getOperatantByBuffer(this.codes, this.ip++);
        this.ip = this.ip + byteLength;
        if (operantType === 0) {
        }
        return {
            type: operantType,
            value: this.parseValue(operantType, value),
            raw: value,
            index: operantType === 0 ? (this.fp + value) : value,
        };
    }
    parseValue(valueType, value) {
        switch (valueType) {
            case 16:
                return this.callingFunctionInfo.closureScope.get(value);
            case 0:
                if (value <= -4) {
                    if ((-4 - value) < this.callingFunctionInfo.args.length) {
                        return this.callingFunctionInfo.args[-4 - value];
                    }
                    else {
                        return void 0;
                    }
                }
                return this.stack[this.fp + value];
            case 96:
            case 48:
            case 128:
                return value;
            case 32:
                return this.stack[value];
            case 80:
                return this.stringsTable[value];
            case 64:
                return this.functionsTable[value];
            case 112:
                return this.stack[0];
            case 144:
                return !!value;
            case 160:
                return null;
            case 176:
                return void 0;
            case 208:
                if (!this.callingFunctionInfo.variables) {
                    return undefined;
                }
                return this.callingFunctionInfo.variables.get(value);
            default:
                throw new VMRunTimeError("Unknown operant " + valueType);
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
    uniaryExpression(exp) {
        const o = this.nextOperant();
        const ret = exp(o.value);
        this.setReg(o, { value: ret });
    }
    binaryExpression(exp) {
        const o1 = this.nextOperant();
        const o2 = this.nextOperant();
        const ret = exp(o1.value, o2.value);
        this.setReg(o1, { value: ret });
    }
    callFunction(func, o, funcName, numArgs, isNewExpression) {
        const stack = this.stack;
        const f = func || o[funcName];
        let isCallVMFunction = false;
        const isNullOrUndefined = o === void 0 || o === null || o === this.ctx;
        if ((f instanceof Callable) && !isNewExpression) {
            const arg = new NumArgs(numArgs);
            if (!isNullOrUndefined) {
                if (typeof o[funcName] === 'function') {
                    o[funcName](arg);
                }
                else {
                    throw new VMRunTimeError(`The function ${funcName} is not a function`);
                }
            }
            else {
                f(arg);
            }
            isCallVMFunction = true;
        }
        else {
            const args = [];
            for (let i = 0; i < numArgs; i++) {
                args.unshift(stack[this.sp--]);
            }
            if (!isNullOrUndefined) {
                stack[0] = isNewExpression
                    ? new o[funcName](...args)
                    : o[funcName](...args);
            }
            else {
                stack[0] = isNewExpression
                    ? new f(...args)
                    : f(...args);
            }
            this.stack.splice(this.sp + 1);
        }
        return isCallVMFunction;
    }
    popToFunction(targetFunctionInfo) {
        while (this.callingFunctionInfos[this.callingFunctionInfos.length - 1] !== targetFunctionInfo) {
            this.returnCurrentFunction();
        }
    }
    parseToJsFunc(meta, closureScope) {
        const vm = this;
        const func = function (...args) {
            const [ip, _, localSize] = meta;
            vm.isRunning = true;
            const n = args[0];
            const isCalledFromJs = !(n instanceof NumArgs);
            let numArgs = 0;
            let allArgs = [];
            if (isCalledFromJs) {
                args.forEach((arg) => vm.push(arg));
                numArgs = args.length;
                allArgs = [...args];
            }
            else {
                numArgs = n.numArgs;
                const end = vm.sp + 1;
                allArgs = vm.stack.slice(end - numArgs, end);
            }
            const currentCallingFunctionInfo = vm.callingFunctionInfo = {
                isInitClosure: false,
                closureScope,
                variables: null,
                args: allArgs,
                returnValue: NO_RETURN_SYMBOL,
            };
            vm.callingFunctionInfos.push(vm.callingFunctionInfo);
            if (vm.allThis.length === 0) {
                vm.currentThis = vm.ctx;
            }
            else {
                vm.currentThis = this || vm.ctx;
            }
            vm.allThis.push(vm.currentThis);
            const stack = vm.stack;
            if (isCalledFromJs) {
                stack[0] = undefined;
            }
            stack[++vm.sp] = allArgs;
            stack[++vm.sp] = numArgs;
            stack[++vm.sp] = vm.ip;
            stack[++vm.sp] = vm.fp;
            vm.ip = ip;
            vm.fp = vm.sp;
            vm.sp += localSize;
            if (isCalledFromJs) {
                let callCount = 1;
                while (callCount > 0 && vm.isRunning) {
                    const [op, isCallVMFunction] = vm.fetchAndExecute();
                    if (isCallVMFunction) {
                        callCount++;
                    }
                    else if (op === I.RET) {
                        callCount--;
                    }
                }
                if (currentCallingFunctionInfo.returnValue !== NO_RETURN_SYMBOL) {
                    return currentCallingFunctionInfo.returnValue;
                }
            }
        };
        Object.setPrototypeOf(func, Callable.prototype);
        try {
            Object.defineProperty(func, 'length', { value: meta[1] });
        }
        catch (e) { }
        vm.setMetaToFunc(func, meta);
        return func;
    }
    setMetaToFunc(func, meta) {
        Object.defineProperty(func, '__vm_func_info__', {
            enumerable: false,
            value: { meta },
            writable: false,
        });
    }
    getMetaFromFunc(func) {
        return func.__vm_func_info__;
    }
}
exports.VirtualMachine = VirtualMachine;
const createVMFromArrayBuffer = (buffer, ctx = {}) => {
    const mainFunctionIndex = utils_1.readUInt32(buffer, 0, 4);
    const funcionTableBasicIndex = utils_1.readUInt32(buffer, 4, 8);
    const stringTableBasicIndex = utils_1.readUInt32(buffer, 8, 12);
    const globalsSize = utils_1.readUInt32(buffer, 12, 16);
    const stringsTable = utils_1.parseStringsArray(buffer.slice(stringTableBasicIndex));
    const codesBuf = new Uint8Array(buffer.slice(4 * 4, funcionTableBasicIndex));
    const funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex);
    const funcsTable = parseFunctionTable(funcsBuf);
    return new VirtualMachine(codesBuf, funcsTable, mainFunctionIndex, stringsTable, globalsSize, ctx);
};
exports.createVMFromArrayBuffer = createVMFromArrayBuffer;
const parseFunctionTable = (buffer) => {
    const funcs = [];
    let i = 0;
    while (i < buffer.byteLength) {
        const ipEnd = i + 4;
        const ip = utils_1.readUInt32(buffer, i, ipEnd);
        const numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2));
        funcs.push([ip, numArgsAndLocal[0], numArgsAndLocal[1]]);
        i += 8;
    }
    return funcs;
};
class Callable extends Function {
    constructor() {
        super();
    }
}
exports.Callable = Callable;
class NumArgs {
    constructor(numArgs) {
        this.numArgs = numArgs;
    }
}
if (typeof window !== 'undefined') {
    window.VirtualMachine = VirtualMachine;
    window.createVMFromArrayBuffer = createVMFromArrayBuffer;
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesPriorityQueue = exports.getOperantName = exports.getByteLengthFromFloat64 = exports.getByteLengthFromInt32 = exports.getOperantTypeAndByteLengthByNum = exports.getInt32OperatantValueByBuffer = exports.getFloat64OperatantValueByBuffer = exports.getOperatantByBuffer = exports.createOperantBuffer = exports.createInt32OperantBuff = exports.createFloat64OperantBuff = exports.readString = exports.readUInt32 = exports.readUInt16 = exports.readInt16 = exports.readInt8 = exports.readUInt8 = exports.readFloat64 = exports.parseStringsArray = exports.getByProp = exports.stringToArrayBuffer = exports.arrayBufferToString = exports.concatBuffer = void 0;
const vm_1 = __webpack_require__(0);
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
exports.getByProp = (obj, prop) => {
    if (typeof prop === 'string') {
        return String(prop).split('.').reduce((o, p) => o[p], obj);
    }
    else {
        return obj[prop];
    }
};
exports.parseStringsArray = (buffer) => {
    const strings = [];
    let i = 0;
    while (i < buffer.byteLength) {
        const lentOffset = i + 4;
        const len = exports.readUInt32(buffer, i, lentOffset);
        const start = lentOffset;
        const end = lentOffset + len * 2;
        const str = exports.readString(buffer, start, end);
        strings.push(str);
        i = end;
    }
    return strings;
};
exports.readFloat64 = (buffer, from, to) => {
    return (new Float64Array(buffer.slice(from, to)))[0];
};
exports.readUInt8 = (buffer, from, to) => {
    return buffer[from];
};
exports.readInt8 = (buffer, from, to) => {
    return (new Int8Array(buffer.slice(from, to)))[0];
};
exports.readInt16 = (buffer, from, to) => {
    return (new Int16Array(buffer.slice(from, to)))[0];
};
exports.readUInt16 = (buffer, from, to) => {
    return (new Uint16Array(buffer.slice(from, to)))[0];
};
exports.readUInt32 = (buffer, from, to) => {
    return (new Uint32Array(buffer.slice(from, to)))[0];
};
exports.readString = (buffer, from, to) => {
    return exports.arrayBufferToString(buffer.slice(from, to));
};
const OPERANT_TYPE_MASK = 0b11110000;
const OPERANT_BYTE_LEN_MASK = ~OPERANT_TYPE_MASK;
exports.createFloat64OperantBuff = (ot, value, forceLength) => {
    const numBuf = value !== void 0
        ? new Float64Array([value]).buffer
        : new ArrayBuffer(0);
    const byteLength = forceLength || exports.getByteLengthFromFloat64(value);
    const head = createOperantHead(ot, byteLength);
    return exports.concatBuffer(head, numBuf.slice(8 - byteLength));
};
exports.createInt32OperantBuff = (ot, value, forceLength) => {
    const numBuf = value !== void 0
        ? new Uint32Array([value]).buffer
        : new ArrayBuffer(0);
    const byteLength = forceLength || exports.getByteLengthFromInt32(value);
    const head = createOperantHead(ot, byteLength);
    return exports.concatBuffer(head, numBuf.slice(0, byteLength));
};
exports.createOperantBuffer = (ot, value, forceLength) => {
    if (ot === 48) {
        return exports.createFloat64OperantBuff(ot, value, forceLength);
    }
    else {
        return exports.createInt32OperantBuff(ot, value, forceLength);
    }
};
exports.getOperatantByBuffer = (arrayBuffer, i = 0) => {
    const buffer = arrayBuffer;
    const head = buffer[i++];
    const [ot, byteLength] = exports.getOperantTypeAndByteLengthByNum(head);
    const value = ot === 48
        ? exports.getFloat64OperatantValueByBuffer(buffer, i, byteLength)
        : exports.getInt32OperatantValueByBuffer(buffer, i, byteLength);
    return [ot, value, byteLength];
};
const createOperantHead = (ot, byteLength) => {
    return new Uint8Array([ot | byteLength]).buffer;
};
const num64Buf = new Float64Array(1);
const num8For64Buf = new Uint8Array(num64Buf.buffer);
exports.getFloat64OperatantValueByBuffer = (buffer, i = 0, byteLength) => {
    num64Buf[0] = 0;
    const s = num8For64Buf.length - byteLength;
    for (let j = 0; j < byteLength; j++) {
        num8For64Buf[s + j] = buffer[i + j];
    }
    return num64Buf[0];
};
const num32Buf = new Int32Array(1);
const num8For32Buf = new Uint8Array(num32Buf.buffer);
exports.getInt32OperatantValueByBuffer = (buffer, i = 0, byteLength) => {
    num32Buf[0] = 0;
    for (let j = 0; j < byteLength; j++) {
        num8For32Buf[j] = buffer[j + i];
    }
    return num32Buf[0];
};
exports.getOperantTypeAndByteLengthByNum = (head) => {
    const ot = head & OPERANT_TYPE_MASK;
    const byteLength = head & OPERANT_BYTE_LEN_MASK;
    return [ot, byteLength];
};
exports.getByteLengthFromInt32 = (num) => {
    const n32Buf = new Int32Array([num]);
    const n8For32Buf = new Uint8Array(n32Buf.buffer);
    let i = n8For32Buf.length;
    while (i-- > 0) {
        if (n8For32Buf[i] > 0) {
            break;
        }
    }
    return i + 1;
};
exports.getByteLengthFromFloat64 = (num) => {
    const n64Buf = new Float64Array([num]);
    const n8For64Buf = new Uint8Array(n64Buf.buffer);
    let i = 0;
    while (n8For64Buf[i] === 0) {
        i++;
    }
    return 8 - i;
};
exports.getOperantName = (o) => {
    return vm_1.I[o];
};
class CategoriesPriorityQueue {
    constructor() {
        this.categories = {};
    }
    push(item, p = 100) {
        const list = this.categories[p] || [];
        list.push(item);
        this.categories[p] = list;
    }
    clear() {
        this.categories = {};
    }
    *[Symbol.iterator]() {
        const ll = Object
            .entries(this.categories)
            .sort(([x], [y]) => Number(x) - Number[y])
            .map(([_, list]) => list);
        for (const l of ll) {
            for (const i of l) {
                yield i;
            }
        }
    }
}
exports.CategoriesPriorityQueue = CategoriesPriorityQueue;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
class Scope {
    constructor(scope = {}, heap = [], isRestoreWhenChange = true) {
        this.scope = scope;
        this.heap = heap;
        this.isRestoreWhenChange = isRestoreWhenChange;
        this.scope.blockNameMap = new Map();
    }
    front(blockName) {
        this.scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope);
        this.scope.blockName = blockName;
        this.scope.blockNameMap.set(blockName, this.scope);
    }
    back(blockName) {
        const targetScope = this.scope.blockNameMap.get(blockName);
        if (this.isRestoreWhenChange) {
            const len = targetScope.len;
            this.heap.splice(len);
        }
        this.scope = Object.getPrototypeOf(targetScope);
    }
    fork() {
        const scope = Object.setPrototypeOf({ len: this.heap.length }, this.scope);
        return new Scope(scope, this.heap, this.isRestoreWhenChange);
    }
    new(key) {
        const index = this.heap.length;
        this.scope[key] = index;
        this.heap.push(void 0);
    }
    set(key, value) {
        if (!(key in this.scope)) {
            throw new Error('variable is used before decleration');
        }
        const index = this.scope[key];
        this.heap[index] = value;
    }
    get(key) {
        const index = this.scope[key];
        return this.heap[index];
    }
    printScope() {
        let scope = this.scope;
        const scopes = [];
        while (scope.len !== undefined) {
            scopes.push(JSON.stringify(scope));
            scope = Object.getPrototypeOf(scope);
        }
        return `len ${scopes.length}: ` + scopes.join(' <- ');
    }
}
exports.Scope = Scope;


/***/ })
/******/ ])));
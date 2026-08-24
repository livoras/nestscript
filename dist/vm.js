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
    I[I["CALL_REF"] = 78] = "CALL_REF";
    I[I["FORIN_INIT"] = 79] = "FORIN_INIT";
    I[I["FORIN_NEXT"] = 80] = "FORIN_NEXT";
    I[I["FINALLY_END"] = 81] = "FINALLY_END";
    I[I["LET"] = 82] = "LET";
    I[I["CONST"] = 83] = "CONST";
    I[I["INIT"] = 84] = "INIT";
    I[I["TYPEOF_CTX"] = 85] = "TYPEOF_CTX";
    I[I["DEF_PROP"] = 86] = "DEF_PROP";
    I[I["DELETE_REF"] = 87] = "DELETE_REF";
    I[I["DELETE_CTX"] = 88] = "DELETE_CTX";
    I[I["GLOBAL_BIND"] = 89] = "GLOBAL_BIND";
    I[I["ENTER_WITH"] = 90] = "ENTER_WITH";
    I[I["EXIT_WITH"] = 91] = "EXIT_WITH";
    I[I["WITH_GET"] = 92] = "WITH_GET";
    I[I["WITH_SET"] = 93] = "WITH_SET";
    I[I["WITH_RESOLVE"] = 94] = "WITH_RESOLVE";
    I[I["WITH_TYPEOF"] = 95] = "WITH_TYPEOF";
    I[I["WITH_DELETE"] = 96] = "WITH_DELETE";
    I[I["DEF_DATA"] = 97] = "DEF_DATA";
    I[I["ABRUPT_JUMP"] = 98] = "ABRUPT_JUMP";
    I[I["SET_ARGS"] = 99] = "SET_ARGS";
})(I = exports.I || (exports.I = {}));
const NO_RETURN_SYMBOL = Symbol();
const CALL_VM_FUNCTION_FLAG = 1 << 8;
const OPCODE_MASK = CALL_VM_FUNCTION_FLAG - 1;
const ES5_WHITE_SPACE = /^[\u0009\u000B\u000C\u0020\u00A0\u000A\u000D\u2028\u2029\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]+|[\u0009\u000B\u000C\u0020\u00A0\u000A\u000D\u2028\u2029\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]+$/g;
const toES5Number = (value) => Number(typeof value === 'string' ? value.replace(ES5_WHITE_SPACE, '') : value);
const ES5NumberPrototype = new Number(0);
const ES5Number = function (value) {
    const number = arguments.length === 0 ? 0 : toES5Number(value);
    if (this instanceof ES5Number) {
        return Object.setPrototypeOf(new Number(number), ES5NumberPrototype);
    }
    return number;
};
Object.defineProperty(ES5NumberPrototype, 'constructor', {
    configurable: true,
    value: ES5Number,
    writable: true,
});
ES5Number.prototype = ES5NumberPrototype;
Object.setPrototypeOf(ES5Number, Number);
for (const name of ['MAX_VALUE', 'MIN_VALUE', 'NaN', 'NEGATIVE_INFINITY', 'POSITIVE_INFINITY']) {
    Object.defineProperty(ES5Number, name, {
        configurable: false,
        enumerable: false,
        value: Number[name],
        writable: false,
    });
}
const INTRINSIC_GLOBALS = new Map([
    ['undefined', void 0],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['parseFloat', parseFloat],
    ['parseInt', parseInt],
    ['isFinite', isFinite],
    ['isNaN', isNaN],
    ['decodeURI', decodeURI],
    ['decodeURIComponent', decodeURIComponent],
    ['encodeURI', encodeURI],
    ['encodeURIComponent', encodeURIComponent],
]);
class VMRunTimeError extends Error {
    constructor(error) {
        super(error);
        this.error = error;
    }
}
const ARGUMENTS_META = Symbol('nestscript.arguments');
const RESTRICTED_PROPERTY_ACCESSOR = Object.getOwnPropertyDescriptor(Function.prototype, 'caller').get;
const defineRestrictedProperties = (object, names) => {
    for (const name of names) {
        Object.defineProperty(object, name, {
            configurable: false,
            enumerable: false,
            get: RESTRICTED_PROPERTY_ACCESSOR,
            set: RESTRICTED_PROPERTY_ACCESSOR,
        });
    }
};
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
            argumentsValue: [],
            strict: false,
            capturedWithObjects: [],
        };
        this.callingFunctionInfos = [];
        this.tryHandlers = [];
        this.withEnvironments = [];
        this.allThis = [];
        this.isRunning = false;
        this.decodedOperants = new Array(codes.length);
        for (const [name, value] of [
            ['undefined', void 0],
            ['NaN', NaN],
            ['Infinity', Infinity],
        ]) {
            const descriptor = Object.getOwnPropertyDescriptor(ctx, name);
            if (!descriptor || descriptor.configurable) {
                Object.defineProperty(ctx, name, {
                    configurable: false,
                    enumerable: false,
                    value,
                    writable: false,
                });
            }
        }
        if (ctx.Number === Number) {
            ctx.Number = ES5Number;
        }
        for (const name of [
            'Object', 'Function', 'Array', 'String', 'Boolean', 'Number', 'Date', 'RegExp',
            'Error', 'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
            'Math', 'JSON', 'parseFloat', 'parseInt', 'isFinite', 'isNaN',
            'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent',
        ]) {
            const descriptor = Object.getOwnPropertyDescriptor(ctx, name);
            if (descriptor && descriptor.enumerable) {
                Object.defineProperty(ctx, name, Object.assign(Object.assign({}, descriptor), { enumerable: false }));
            }
        }
        const mainClosureScope = new scope_1.Scope();
        mainClosureScope.isRestoreWhenChange = false;
        this.mainFunction = this.parseToJsFunc(functionsTable[this.entryIndx], mainClosureScope);
        this.init();
    }
    init() {
        const { globalSize, mainFunction } = this;
        const { meta } = this.getMetaFromFunc(mainFunction);
        const [ip, numArgs, localSize] = meta;
        this.stack.length = 0;
        this.setStack(0, undefined);
        const globalIndex = globalSize + 1;
        this.fp = globalIndex;
        this.setStack(this.fp, -1);
        this.sp = this.fp;
        this.stack.length = this.sp + 1;
        this.callingFunctionInfos = [];
        this.tryHandlers = [];
        this.withEnvironments = [];
        this.allThis = [];
    }
    reset() {
        this.init();
        this.error = null;
    }
    run() {
        this.callFunctionValue(this.mainFunction, this.ctx, 0, false);
        this.isRunning = true;
        while (this.isRunning) {
            this.executeNextPacked();
        }
    }
    executeNext(exceptionBoundary) {
        const packed = this.executeNextPacked(exceptionBoundary);
        return [packed & OPCODE_MASK, (packed & CALL_VM_FUNCTION_FLAG) !== 0];
    }
    executeNextPacked(exceptionBoundary) {
        try {
            return this.fetchAndExecutePacked();
        }
        catch (e) {
            if (e instanceof VMRunTimeError) {
                throw e;
            }
            if (this.handleThrow(e, exceptionBoundary)) {
                return I.THROW;
            }
            throw e;
        }
    }
    fetchAndExecute() {
        const packed = this.fetchAndExecutePacked();
        return [packed & OPCODE_MASK, (packed & CALL_VM_FUNCTION_FLAG) !== 0];
    }
    setReg(dst, src) {
        this.writeReg(dst, src.value);
    }
    writeReg(dst, value) {
        const callingFunctionInfo = this.callingFunctionInfo;
        if (dst.type === 208) {
            this.checkVariableScopeAndNew();
            callingFunctionInfo.variables.set(dst.index, value);
        }
        else if (dst.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.set(dst.index, value);
        }
        else if (dst.type === 0 || dst.type === 112) {
            if (dst.type === 112) {
                this.callingFunctionInfo.returnValue = value;
            }
            if (dst.raw <= -4) {
                const index = -4 - dst.raw;
                this.callingFunctionInfo.args[index] = value;
                const argsObject = this.callingFunctionInfo.argumentsValue;
                const meta = argsObject && argsObject[ARGUMENTS_META];
                if (meta && meta.mapped.has(index) && Object.prototype.hasOwnProperty.call(argsObject, index)) {
                    Reflect.set(argsObject, index, value);
                }
            }
            else {
                this.setStack(dst.index, value);
            }
        }
        else {
            console.error(dst);
            throw new Error(`Cannot process register type ${dst.type}`);
        }
    }
    writeDecodedReg(dst, value) {
        const callingFunctionInfo = this.callingFunctionInfo;
        const index = dst.type === 0 ? this.fp + dst.raw : dst.raw;
        if (dst.type === 208) {
            this.checkVariableScopeAndNew();
            callingFunctionInfo.variables.set(index, value);
        }
        else if (dst.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.set(index, value);
        }
        else if (dst.type === 0 || dst.type === 112) {
            if (dst.type === 112) {
                this.callingFunctionInfo.returnValue = value;
            }
            if (dst.raw <= -4) {
                const argumentIndex = -4 - dst.raw;
                this.callingFunctionInfo.args[argumentIndex] = value;
                const argsObject = this.callingFunctionInfo.argumentsValue;
                const meta = argsObject && argsObject[ARGUMENTS_META];
                if (meta &&
                    meta.mapped.has(argumentIndex) &&
                    Object.prototype.hasOwnProperty.call(argsObject, argumentIndex)) {
                    Reflect.set(argsObject, argumentIndex, value);
                }
            }
            else {
                this.setStack(index, value);
            }
        }
        else {
            console.error(dst);
            throw new Error(`Cannot process register type ${dst.type}`);
        }
    }
    newReg(o) {
        this.newBinding(o, true, true);
    }
    newBinding(o, mutable, initialized) {
        const callingFunctionInfo = this.callingFunctionInfo;
        if (o.type === 208) {
            this.checkVariableScopeAndNew();
            this.callingFunctionInfo.variables.new(o.index, { mutable, initialized });
        }
        else if (o.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.new(o.index, { mutable, initialized });
        }
        else {
            console.error(o);
            throw new Error(`Cannot process register type ${o.type}`);
        }
    }
    initReg(dst, src) {
        if (dst.type === 208) {
            this.checkVariableScopeAndNew();
            this.callingFunctionInfo.variables.init(dst.index, src.value);
        }
        else if (dst.type === 16) {
            this.checkClosureAndFork();
            this.callingFunctionInfo.closureScope.init(dst.index, src.value);
        }
        else {
            throw new Error(`Cannot initialize register type ${dst.type}`);
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
    fetchAndExecutePacked() {
        if (!this.isRunning) {
            throw new VMRunTimeError('try to run again...');
        }
        const op = this.nextOperator();
        let isCallVMFunction = false;
        switch (op) {
            case I.VAR:
            case I.CLS: {
                const o = this.nextOperant(false);
                this.newReg(o);
                break;
            }
            case I.GLOBAL_BIND: {
                const binding = this.nextOperant(false);
                const name = this.nextOperant().value;
                this.newReg(binding);
                const variables = this.callingFunctionInfo.variables;
                const closureScope = this.callingFunctionInfo.closureScope;
                if (!Object.prototype.hasOwnProperty.call(this.ctx, name)) {
                    Object.defineProperty(this.ctx, name, {
                        configurable: false,
                        enumerable: true,
                        get: () => binding.type === 16
                            ? closureScope.get(binding.index)
                            : variables.get(binding.index),
                        set: (value) => binding.type === 16
                            ? closureScope.set(binding.index, value)
                            : variables.set(binding.index, value),
                    });
                }
                break;
            }
            case I.LET:
            case I.CONST: {
                const o = this.nextOperant(false);
                this.newBinding(o, op === I.LET, false);
                break;
            }
            case I.INIT: {
                const dst = this.nextOperant(false);
                const src = this.nextOperant();
                this.initReg(dst, src);
                break;
            }
            case I.PUSH: {
                const value = this.nextOperantValue();
                this.push(value);
                break;
            }
            case I.EXIT: {
                this.isRunning = false;
                break;
            }
            case I.RET: {
                if (!this.beginReturn()) {
                    this.returnCurrentFunction();
                }
                break;
            }
            case I.PRINT: {
                const val = this.nextOperant();
                console.log(val.value);
                break;
            }
            case I.MOV: {
                const dst = this.nextDecodedOperant();
                const value = this.nextOperantValue();
                this.writeDecodedReg(dst, value);
                break;
            }
            case I.JMP: {
                this.ip = this.nextOperantValue();
                break;
            }
            case I.ABRUPT_JUMP: {
                const address = this.nextOperant().value;
                this.routeJump({ type: 'jump', address, functionInfo: this.callingFunctionInfo });
                break;
            }
            case I.JE: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left === right) {
                    this.ip = address;
                }
                break;
            }
            case I.JNE: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left !== right) {
                    this.ip = address;
                }
                break;
            }
            case I.JG: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left > right) {
                    this.ip = address;
                }
                break;
            }
            case I.JL: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left < right) {
                    this.ip = address;
                }
                break;
            }
            case I.JGE: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left >= right) {
                    this.ip = address;
                }
                break;
            }
            case I.JLE: {
                const left = this.nextOperant().value;
                const right = this.nextOperant().value;
                const address = this.nextOperant().value;
                if (left <= right) {
                    this.ip = address;
                }
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
                const condition = this.nextOperantValue();
                const address = this.nextOperantValue();
                if (!condition) {
                    this.ip = address;
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
                const f = this.nextOperantValue();
                const numArgs = this.nextOperantValue();
                const isNewExpression = this.nextOperantValue();
                isCallVMFunction = this.callFunction(f, void 0, '', numArgs, isNewExpression);
                break;
            }
            case I.CALL_REF: {
                const f = this.nextOperant().value;
                const receiver = this.nextOperant().value;
                const numArgs = this.nextOperant().value;
                const isNewExpression = this.nextOperant().value;
                isCallVMFunction = this.callFunctionValue(f, receiver, numArgs, isNewExpression);
                break;
            }
            case I.MOV_CTX: {
                const dst = this.nextOperant(false);
                const propKey = this.nextOperant();
                const key = propKey.value;
                let src;
                if (this.ctx !== null && this.ctx !== void 0 && key in Object(this.ctx)) {
                    src = this.ctx[key];
                }
                else if (INTRINSIC_GLOBALS.has(key)) {
                    src = INTRINSIC_GLOBALS.get(key);
                }
                else {
                    throw new ReferenceError(`${key} is not defined`);
                }
                this.writeReg(dst, src);
                break;
            }
            case I.TYPEOF_CTX: {
                const dst = this.nextOperant(false);
                const key = this.nextOperant().value;
                let value;
                if (this.ctx !== null && this.ctx !== void 0 && key in Object(this.ctx)) {
                    value = this.ctx[key];
                }
                else if (INTRINSIC_GLOBALS.has(key)) {
                    value = INTRINSIC_GLOBALS.get(key);
                }
                else {
                    this.writeReg(dst, 'undefined');
                    break;
                }
                this.writeReg(dst, typeof value);
                break;
            }
            case I.SET_CTX: {
                const propKey = this.nextOperant();
                const val = this.nextOperant();
                const key = propKey.value;
                if (this.callingFunctionInfo.strict && !(key in Object(this.ctx)) && !INTRINSIC_GLOBALS.has(key)) {
                    throw new ReferenceError(`${key} is not defined`);
                }
                const success = Reflect.set(this.ctx, key, val.value);
                if (!success && this.callingFunctionInfo.strict) {
                    throw new TypeError(`Cannot assign to read only property '${String(key)}'`);
                }
                break;
            }
            case I.ENTER_WITH: {
                const value = this.nextOperant().value;
                const endAddress = this.nextOperant().value;
                if (value === null || value === undefined) {
                    throw new TypeError(`Cannot convert ${value} to object`);
                }
                this.appendInternal(this.withEnvironments, {
                    object: Object(value),
                    functionInfo: this.callingFunctionInfo,
                    endAddress,
                });
                break;
            }
            case I.EXIT_WITH: {
                const environment = this.withEnvironments[this.withEnvironments.length - 1];
                if (environment && environment.functionInfo === this.callingFunctionInfo) {
                    this.withEnvironments.pop();
                }
                break;
            }
            case I.WITH_GET:
            case I.WITH_TYPEOF: {
                const dst = this.nextOperant(false);
                const name = this.nextOperant().value;
                const fallbackKind = this.nextOperant().value;
                const fallback = this.nextOperant(false);
                const environment = this.findWithEnvironment(name);
                let value;
                if (environment) {
                    value = environment.object[name];
                }
                else {
                    value = this.readNameFallback(name, fallbackKind, fallback, op === I.WITH_TYPEOF);
                }
                this.writeReg(dst, op === I.WITH_TYPEOF ? typeof value : value);
                break;
            }
            case I.WITH_SET: {
                const name = this.nextOperant().value;
                const fallbackKind = this.nextOperant().value;
                const fallback = this.nextOperant(false);
                const value = this.nextOperant().value;
                const environment = this.findWithEnvironment(name);
                if (environment) {
                    const success = Reflect.set(environment.object, name, value);
                    if (!success && this.callingFunctionInfo.strict) {
                        throw new TypeError(`Cannot assign to read only property '${String(name)}'`);
                    }
                }
                else {
                    this.writeNameFallback(name, fallbackKind, fallback, value);
                }
                break;
            }
            case I.WITH_RESOLVE: {
                const dst = this.nextOperant(false);
                const receiverDst = this.nextOperant(false);
                const name = this.nextOperant().value;
                const fallbackKind = this.nextOperant().value;
                const fallback = this.nextOperant(false);
                const environment = this.findWithEnvironment(name);
                if (environment) {
                    this.writeReg(dst, environment.object[name]);
                    this.writeReg(receiverDst, environment.object);
                }
                else {
                    this.writeReg(dst, this.readNameFallback(name, fallbackKind, fallback, false));
                    this.writeReg(receiverDst, fallbackKind === 0 ? this.ctx : undefined);
                }
                break;
            }
            case I.WITH_DELETE: {
                const dst = this.nextOperant(false);
                const name = this.nextOperant().value;
                const fallbackKind = this.nextOperant().value;
                this.nextOperant(false);
                const environment = this.findWithEnvironment(name);
                let deleted;
                if (environment) {
                    deleted = Reflect.deleteProperty(environment.object, name);
                }
                else if (fallbackKind === 0) {
                    deleted = INTRINSIC_GLOBALS.has(name) ? false : Reflect.deleteProperty(this.ctx, name);
                }
                else {
                    deleted = false;
                }
                if (!deleted && this.callingFunctionInfo.strict) {
                    throw new TypeError(`Cannot delete property '${String(name)}'`);
                }
                this.writeReg(dst, deleted);
                break;
            }
            case I.NEW_OBJ: {
                const dst = this.nextOperant(false);
                const o = {};
                this.writeReg(dst, o);
                break;
            }
            case I.NEW_REG: {
                const dst = this.nextOperant(false);
                const pattern = this.nextOperant();
                const flags = this.nextOperant();
                try {
                    this.writeReg(dst, new RegExp(pattern.value, flags.value));
                }
                catch (e) {
                    throw new VMRunTimeError(e);
                }
                break;
            }
            case I.NEW_ARR: {
                const dst = this.nextOperant(false);
                const o = [];
                this.writeReg(dst, o);
                break;
            }
            case I.SET_KEY: {
                const o = this.nextOperantValue();
                const key = this.nextOperantValue();
                const value = this.nextOperantValue();
                const success = Reflect.set(o, key, value);
                if (!success && this.callingFunctionInfo.strict) {
                    throw new TypeError(`Cannot assign to read only property '${String(key)}'`);
                }
                const meta = o && o[ARGUMENTS_META];
                const index = typeof key === 'symbol' ? NaN : (typeof key === 'number' ? key : Number(key));
                if (meta && Number.isInteger(index) && String(index) === String(key) && meta.mapped.has(index)) {
                    meta.values[index] = value;
                }
                break;
            }
            case I.DEF_PROP: {
                const o = this.nextOperant().value;
                const key = this.nextOperant().value;
                const accessor = this.nextOperant().value;
                const kind = this.nextOperant().value;
                Object.defineProperty(o, key, {
                    [kind]: accessor,
                    configurable: true,
                    enumerable: true,
                });
                break;
            }
            case I.DEF_DATA: {
                const object = this.nextOperant().value;
                const key = this.nextOperant().value;
                const value = this.nextOperant().value;
                Object.defineProperty(object, key, {
                    configurable: true,
                    enumerable: true,
                    value,
                    writable: true,
                });
                break;
            }
            case I.FUNC: {
                const dst = this.nextOperant(false);
                const funcOperant = this.nextOperant();
                const funcInfoMeta = funcOperant.value;
                const func = this.parseToJsFunc(funcInfoMeta, this.callingFunctionInfo.closureScope.fork(), this.currentThis, this.callingFunctionInfo.argumentsValue, this.captureWithObjects());
                this.writeReg(dst, func);
                break;
            }
            case I.MOV_PROP: {
                const dst = this.nextDecodedOperant();
                const o = this.nextOperantValue();
                const k = this.nextOperantValue();
                let v = o[k];
                if (k === 'constructor' && v === Number && this.ctx.Number === ES5Number) {
                    v = ES5Number;
                }
                this.writeDecodedReg(dst, v);
                break;
            }
            case I.LT: {
                const dst = this.nextDecodedOperant();
                const left = this.parseValue(dst.type, dst.raw);
                const right = this.nextOperantValue();
                this.writeDecodedReg(dst, left < right);
                break;
            }
            case I.GT: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value > right);
                break;
            }
            case I.EQ: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value === right);
                break;
            }
            case I.NE: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value !== right);
                break;
            }
            case I.WEQ: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value == right);
                break;
            }
            case I.WNE: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value != right);
                break;
            }
            case I.LE: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value <= right);
                break;
            }
            case I.GE: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value >= right);
                break;
            }
            case I.ADD: {
                const dst = this.nextDecodedOperant();
                const left = this.parseValue(dst.type, dst.raw);
                const right = this.nextOperantValue();
                this.writeDecodedReg(dst, left + right);
                break;
            }
            case I.SUB: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value - right);
                break;
            }
            case I.MUL: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value * right);
                break;
            }
            case I.DIV: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value / right);
                break;
            }
            case I.MOD: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value % right);
                break;
            }
            case I.AND: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value & right);
                break;
            }
            case I.OR: {
                const dst = this.nextDecodedOperant();
                const left = this.parseValue(dst.type, dst.raw);
                const right = this.nextOperantValue();
                this.writeDecodedReg(dst, left | right);
                break;
            }
            case I.XOR: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value ^ right);
                break;
            }
            case I.SHL: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value << right);
                break;
            }
            case I.SHR: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value >> right);
                break;
            }
            case I.ZSHR: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value >>> right);
                break;
            }
            case I.LG_AND: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value && right);
                break;
            }
            case I.LG_OR: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value || right);
                break;
            }
            case I.INST_OF: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value instanceof right);
                break;
            }
            case I.IN: {
                const dst = this.nextOperant();
                const right = this.nextOperant().value;
                this.writeReg(dst, dst.value in right);
                break;
            }
            case I.ALLOC: {
                const dst = this.nextOperant();
                this.getReg(dst);
                break;
            }
            case I.PLUS: {
                const dst = this.nextOperant();
                this.writeReg(dst, toES5Number(dst.value));
                break;
            }
            case I.MINUS: {
                const dst = this.nextOperant();
                this.writeReg(dst, -dst.value);
                break;
            }
            case I.VOID: {
                const dst = this.nextOperant();
                this.writeReg(dst, void dst.value);
                break;
            }
            case I.NOT: {
                const dst = this.nextOperant();
                this.writeReg(dst, ~dst.value);
                break;
            }
            case I.NEG: {
                const dst = this.nextOperant();
                this.writeReg(dst, !dst.value);
                break;
            }
            case I.TYPE_OF: {
                const dst = this.nextOperant();
                this.writeReg(dst, typeof dst.value);
                break;
            }
            case I.DEL: {
                const o1 = this.nextOperant().value;
                const o2 = this.nextOperant().value;
                delete o1[o2];
                break;
            }
            case I.DELETE_REF: {
                const dst = this.nextOperant(false);
                const base = this.nextOperant().value;
                const key = this.nextOperant().value;
                if (base === null || base === undefined) {
                    throw new TypeError(`Cannot convert ${base} to object`);
                }
                const object = Object(base);
                const deleted = typeof object === 'function' && key === 'length'
                    ? false
                    : Reflect.deleteProperty(object, key);
                const meta = object && object[ARGUMENTS_META];
                const index = typeof key === 'symbol' ? NaN : (typeof key === 'number' ? key : Number(key));
                if (deleted && meta && Number.isInteger(index) && String(index) === String(key)) {
                    meta.mapped.delete(index);
                }
                if (!deleted && this.callingFunctionInfo.strict) {
                    throw new TypeError(`Cannot delete property '${String(key)}'`);
                }
                this.writeReg(dst, deleted);
                break;
            }
            case I.DELETE_CTX: {
                const dst = this.nextOperant(false);
                const key = this.nextOperant().value;
                const deleted = INTRINSIC_GLOBALS.has(key)
                    ? false
                    : Reflect.deleteProperty(this.ctx, key);
                if (!deleted && this.callingFunctionInfo.strict) {
                    throw new TypeError(`Cannot delete property '${String(key)}'`);
                }
                this.writeReg(dst, deleted);
                break;
            }
            case I.MOV_THIS: {
                this.writeReg(this.nextOperant(false), this.currentThis);
                break;
            }
            case I.TRY: {
                const catchAddress = this.nextOperant().value;
                const finallyAddress = this.nextOperant().value;
                const endAddress = this.nextOperant().value;
                const hasCatch = this.nextOperant().value;
                const hasFinally = this.nextOperant().value;
                this.appendInternal(this.tryHandlers, {
                    functionInfo: this.callingFunctionInfo,
                    catchAddress,
                    finallyAddress,
                    endAddress,
                    hasCatch,
                    hasFinally,
                    phase: 'try',
                    startAddress: this.ip,
                });
                break;
            }
            case I.THROW: {
                const err = this.nextOperant();
                throw err.value;
                break;
            }
            case I.TRY_END: {
                this.finishTryRegion();
                break;
            }
            case I.FINALLY_END: {
                this.finishFinally();
                break;
            }
            case I.GET_ERR: {
                const o = this.nextOperant(false);
                this.writeReg(o, this.error);
                break;
            }
            case I.MOV_ARGS: {
                const dst = this.nextOperant(false);
                this.writeReg(dst, this.callingFunctionInfo.argumentsValue);
                break;
            }
            case I.SET_ARGS: {
                this.callingFunctionInfo.argumentsValue = this.nextOperant().value;
                break;
            }
            case I.FORIN: {
                const dst = this.nextOperant();
                const target = this.nextOperant();
                const startAddress = this.nextOperant();
                const endAddress = this.nextOperant();
                forIn: for (const i in target.value) {
                    this.writeReg(dst, i);
                    while (true) {
                        const o = this.fetchAndExecutePacked() & OPCODE_MASK;
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
            case I.FORIN_INIT: {
                const dst = this.nextOperant(false);
                const target = this.nextOperant().value;
                const keys = [];
                for (const key in target) {
                    this.appendInternal(keys, key);
                }
                this.writeReg(dst, { index: 0, keys });
                break;
            }
            case I.FORIN_NEXT: {
                const dst = this.nextOperant(false);
                const iterator = this.nextOperant().value;
                const endAddress = this.nextOperant().value;
                if (iterator.index >= iterator.keys.length) {
                    this.ip = endAddress;
                }
                else {
                    this.writeReg(dst, iterator.keys[iterator.index++]);
                }
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
        return op | (isCallVMFunction ? CALL_VM_FUNCTION_FLAG : 0);
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
    beginReturn() {
        const functionInfo = this.callingFunctionInfo;
        const value = functionInfo.returnValue === NO_RETURN_SYMBOL
            ? void 0
            : functionInfo.returnValue;
        return this.routeReturn({ type: 'return', value, functionInfo });
    }
    routeReturn(completion) {
        while (this.tryHandlers.length > 0) {
            const handler = this.tryHandlers[this.tryHandlers.length - 1];
            if (handler.functionInfo !== completion.functionInfo) {
                break;
            }
            if (handler.phase !== 'finally' && handler.hasFinally) {
                handler.phase = 'finally';
                handler.pending = completion;
                this.ip = handler.finallyAddress;
                return true;
            }
            this.tryHandlers.pop();
        }
        return false;
    }
    routeJump(completion) {
        while (this.tryHandlers.length > 0) {
            const handler = this.tryHandlers[this.tryHandlers.length - 1];
            if (handler.functionInfo !== completion.functionInfo) {
                break;
            }
            if (handler.phase !== 'finally' &&
                completion.address >= handler.startAddress &&
                completion.address < handler.endAddress) {
                this.ip = completion.address;
                return;
            }
            if (handler.phase !== 'finally' && handler.hasFinally) {
                handler.phase = 'finally';
                handler.pending = completion;
                this.ip = handler.finallyAddress;
                return;
            }
            this.tryHandlers.pop();
        }
        this.ip = completion.address;
    }
    finishTryRegion() {
        const handler = this.tryHandlers[this.tryHandlers.length - 1];
        if (!handler || handler.functionInfo !== this.callingFunctionInfo || handler.phase === 'finally') {
            throw new VMRunTimeError('TRY_END without an active try or catch region');
        }
        if (handler.hasFinally) {
            handler.phase = 'finally';
            handler.pending = { type: 'normal' };
            this.ip = handler.finallyAddress;
        }
        else {
            this.tryHandlers.pop();
            this.ip = handler.endAddress;
        }
    }
    finishFinally() {
        const handler = this.tryHandlers.pop();
        if (!handler || handler.phase !== 'finally') {
            throw new VMRunTimeError('FINALLY_END without an active finally region');
        }
        const pending = handler.pending || { type: 'normal' };
        if (pending.type === 'normal') {
            this.ip = handler.endAddress;
            return;
        }
        if (pending.type === 'return') {
            pending.functionInfo.returnValue = pending.value;
            this.setStack(0, pending.value);
            if (!this.routeReturn(pending)) {
                this.returnCurrentFunction();
            }
            return;
        }
        if (pending.type === 'jump') {
            this.routeJump(pending);
            return;
        }
        throw pending.value;
    }
    handleThrow(error, exceptionBoundary) {
        while (this.tryHandlers.length > 0) {
            const handler = this.tryHandlers[this.tryHandlers.length - 1];
            if (exceptionBoundary) {
                const boundaryIndex = this.callingFunctionInfos.indexOf(exceptionBoundary);
                const handlerIndex = this.callingFunctionInfos.indexOf(handler.functionInfo);
                if (handlerIndex < boundaryIndex) {
                    return false;
                }
            }
            if (this.callingFunctionInfo !== handler.functionInfo) {
                this.popToFunction(handler.functionInfo);
            }
            if (handler.phase === 'try' && handler.hasCatch) {
                handler.phase = 'catch';
                this.error = error;
                this.ip = handler.catchAddress;
                return true;
            }
            if (handler.phase !== 'finally' && handler.hasFinally) {
                handler.phase = 'finally';
                handler.pending = { type: 'throw', value: error };
                this.ip = handler.finallyAddress;
                return true;
            }
            this.tryHandlers.pop();
        }
        return false;
    }
    returnCurrentFunction() {
        const stack = this.stack;
        const fp = this.fp;
        const completedFunction = this.callingFunctionInfo;
        this.fp = stack[fp];
        this.ip = stack[fp - 1];
        this.sp = fp - stack[fp - 2] - 4;
        this.stack.length = this.sp + 1;
        if (this.callingFunctionInfo.returnValue === NO_RETURN_SYMBOL) {
            this.setStack(0, undefined);
        }
        this.allThis.pop();
        this.currentThis = this.allThis[this.allThis.length - 1];
        this.callingFunctionInfos.pop();
        this.callingFunctionInfo = this.callingFunctionInfos[this.callingFunctionInfos.length - 1];
        if (this.withEnvironments.length > 0) {
            this.withEnvironments = this.withEnvironments.filter((environment) => {
                return environment.functionInfo !== completedFunction;
            });
        }
    }
    push(val) {
        this.setStack(++this.sp, val);
    }
    setStack(index, value) {
        this.setArrayIndex(this.stack, index, value);
    }
    appendInternal(array, value) {
        this.setArrayIndex(array, array.length, value);
    }
    setArrayIndex(array, index, value) {
        if (!Object.prototype.hasOwnProperty.call(array, index) &&
            index in array) {
            Object.defineProperty(array, index, {
                configurable: true,
                enumerable: true,
                value,
                writable: true,
            });
        }
        else {
            array[index] = value;
        }
    }
    findWithEnvironment(name) {
        this.withEnvironments = this.withEnvironments.filter((environment) => {
            return environment.functionInfo !== this.callingFunctionInfo || this.ip < environment.endAddress;
        });
        for (let i = this.withEnvironments.length - 1; i >= 0; i--) {
            const environment = this.withEnvironments[i];
            if (environment.functionInfo === this.callingFunctionInfo &&
                name in environment.object) {
                return environment;
            }
        }
        const captured = this.callingFunctionInfo.capturedWithObjects || [];
        for (let i = captured.length - 1; i >= 0; i--) {
            if (name in captured[i]) {
                return {
                    object: captured[i],
                    functionInfo: this.callingFunctionInfo,
                    endAddress: Number.POSITIVE_INFINITY,
                };
            }
        }
        return undefined;
    }
    captureWithObjects() {
        const objects = [...(this.callingFunctionInfo.capturedWithObjects || [])];
        for (const environment of this.withEnvironments) {
            if (environment.functionInfo === this.callingFunctionInfo &&
                this.ip < environment.endAddress) {
                objects.push(environment.object);
            }
        }
        return objects;
    }
    readNameFallback(name, kind, fallback, typeofSafe) {
        if (kind === 1) {
            return this.parseValue(fallback.type, fallback.raw);
        }
        if (kind === 2) {
            return this.callingFunctionInfo.argumentsValue;
        }
        if (this.ctx !== null && this.ctx !== undefined && name in Object(this.ctx)) {
            return this.ctx[name];
        }
        if (INTRINSIC_GLOBALS.has(name)) {
            return INTRINSIC_GLOBALS.get(name);
        }
        if (typeofSafe) {
            return undefined;
        }
        throw new ReferenceError(`${name} is not defined`);
    }
    writeNameFallback(name, kind, fallback, value) {
        if (kind === 1) {
            this.writeReg(fallback, value);
            return;
        }
        if (kind === 2) {
            this.callingFunctionInfo.argumentsValue = value;
            return;
        }
        if (this.callingFunctionInfo.strict && !(name in Object(this.ctx)) && !INTRINSIC_GLOBALS.has(name)) {
            throw new ReferenceError(`${name} is not defined`);
        }
        const success = Reflect.set(this.ctx, name, value);
        if (!success && this.callingFunctionInfo.strict) {
            throw new TypeError(`Cannot assign to read only property '${String(name)}'`);
        }
    }
    nextOperator() {
        return this.codes[this.ip++];
    }
    nextDecodedOperant() {
        const startIp = this.ip;
        let decoded = this.decodedOperants[startIp];
        if (decoded === undefined) {
            const head = this.codes[startIp];
            const operantType = (head & 0b11110000);
            const byteLength = head & 0b00001111;
            const valueOffset = startIp + 1;
            decoded = {
                type: operantType,
                raw: operantType === 48
                    ? utils_1.getFloat64OperatantValueByBuffer(this.codes, valueOffset, byteLength)
                    : utils_1.getInt32OperatantValueByBuffer(this.codes, valueOffset, byteLength),
                nextIp: valueOffset + byteLength,
            };
            this.decodedOperants[startIp] = decoded;
        }
        this.ip = decoded.nextIp;
        return decoded;
    }
    nextOperantValue() {
        const decoded = this.nextDecodedOperant();
        return this.parseValue(decoded.type, decoded.raw);
    }
    nextOperant(resolveValue = true) {
        const decoded = this.nextDecodedOperant();
        return {
            type: decoded.type,
            value: resolveValue ? this.parseValue(decoded.type, decoded.raw) : decoded.raw,
            raw: decoded.raw,
            index: decoded.type === 0 ? (this.fp + decoded.raw) : decoded.raw,
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
        this.writeReg(o, ret);
    }
    binaryExpression(exp) {
        const o1 = this.nextOperant();
        const o2 = this.nextOperant();
        const ret = exp(o1.value, o2.value);
        this.writeReg(o1, ret);
    }
    callFunction(func, o, funcName, numArgs, isNewExpression) {
        const f = func !== void 0 ? func : o[funcName];
        const isNullOrUndefined = o === void 0 || o === null || o === this.ctx;
        return this.invokeFunction(f, o, !isNullOrUndefined, numArgs, isNewExpression);
    }
    callFunctionValue(func, receiver, numArgs, isNewExpression) {
        return this.invokeFunction(func, receiver, true, numArgs, isNewExpression);
    }
    invokeFunction(func, receiver, hasReceiver, numArgs, isNewExpression) {
        if (typeof func !== 'function') {
            throw new TypeError('Value is not a function');
        }
        if (isNewExpression &&
            func instanceof Callable &&
            (this.getMetaFromFunc(func).meta[3] & 1) === 1) {
            throw new TypeError('Arrow functions are not constructors');
        }
        if ((func instanceof Callable) && !isNewExpression) {
            const arg = new NumArgs(numArgs);
            if (hasReceiver) {
                func.call(receiver, arg);
            }
            else {
                func(arg);
            }
            return true;
        }
        const args = new Array(numArgs);
        for (let i = 0; i < numArgs; i++) {
            this.setArrayIndex(args, numArgs - i - 1, this.stack[this.sp--]);
        }
        this.setStack(0, isNewExpression
            ? new func(...args)
            : func.apply(hasReceiver ? receiver : void 0, args));
        this.stack.length = this.sp + 1;
        return false;
    }
    popToFunction(targetFunctionInfo) {
        while (this.callingFunctionInfos[this.callingFunctionInfos.length - 1] !== targetFunctionInfo) {
            this.returnCurrentFunction();
        }
    }
    parseToJsFunc(meta, closureScope, lexicalThis, lexicalArguments, lexicalWithObjects = []) {
        const vm = this;
        const isArrow = (meta[3] & 1) === 1;
        const isStrict = (meta[3] & 2) === 2;
        const usesArguments = (meta[3] & 4) === 4;
        const func = function (...args) {
            const [ip, _, localSize] = meta;
            vm.isRunning = true;
            const n = args.length > 0 ? args[0] : undefined;
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
                argumentsValue: isArrow ? (lexicalArguments || []) : undefined,
                func,
                strict: isStrict,
                capturedWithObjects: lexicalWithObjects,
                returnValue: NO_RETURN_SYMBOL,
            };
            if (!isArrow && usesArguments) {
                currentCallingFunctionInfo.argumentsValue = vm.createArgumentsObject(allArgs, func, isStrict, meta[1]);
            }
            vm.appendInternal(vm.callingFunctionInfos, vm.callingFunctionInfo);
            if (isArrow) {
                vm.currentThis = lexicalThis;
            }
            else if (isStrict) {
                vm.currentThis = this;
            }
            else {
                vm.currentThis = this === void 0 || this === null ? vm.ctx : Object(this);
            }
            vm.appendInternal(vm.allThis, vm.currentThis);
            const stack = vm.stack;
            if (isCalledFromJs) {
                vm.setStack(0, undefined);
            }
            vm.setStack(++vm.sp, allArgs);
            vm.setStack(++vm.sp, numArgs);
            vm.setStack(++vm.sp, vm.ip);
            vm.setStack(++vm.sp, vm.fp);
            vm.ip = ip;
            vm.fp = vm.sp;
            vm.sp += localSize;
            if (isCalledFromJs) {
                try {
                    while (vm.callingFunctionInfos.includes(currentCallingFunctionInfo) &&
                        vm.isRunning) {
                        vm.executeNextPacked(currentCallingFunctionInfo);
                    }
                }
                catch (e) {
                    while (vm.callingFunctionInfos.includes(currentCallingFunctionInfo)) {
                        const abandonedFrame = vm.callingFunctionInfo;
                        vm.tryHandlers = vm.tryHandlers.filter((handler) => {
                            return handler.functionInfo !== abandonedFrame;
                        });
                        vm.returnCurrentFunction();
                    }
                    throw e;
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
        try {
            if (isStrict) {
                defineRestrictedProperties(func, ['caller', 'arguments']);
            }
            else {
                Object.defineProperty(func, 'caller', {
                    configurable: true,
                    enumerable: false,
                    value: undefined,
                    writable: true,
                });
            }
        }
        catch (e) { }
        return func;
    }
    createArgumentsObject(values, callee, strict, formalCount) {
        const object = Object.create(Object.prototype);
        const mapped = new Set();
        Object.defineProperty(object, ARGUMENTS_META, {
            value: { values, mapped },
        });
        Object.defineProperty(object, 'length', {
            configurable: true,
            enumerable: false,
            value: values.length,
            writable: true,
        });
        values.forEach((value, index) => {
            Object.defineProperty(object, String(index), {
                configurable: true,
                enumerable: true,
                value,
                writable: true,
            });
            if (!strict && index < formalCount) {
                mapped.add(index);
            }
        });
        if (strict) {
            defineRestrictedProperties(object, ['caller', 'callee']);
        }
        else {
            Object.defineProperty(object, 'callee', {
                configurable: true,
                enumerable: false,
                value: callee,
                writable: true,
            });
        }
        return object;
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
        const numArgsLocalAndFlags = new Uint16Array(buffer.slice(ipEnd, ipEnd + 3 * 2));
        funcs.push([
            ip,
            numArgsLocalAndFlags[0],
            numArgsLocalAndFlags[1],
            numArgsLocalAndFlags[2],
        ]);
        i += 10;
    }
    return funcs;
};
class Callable extends Function {
    constructor() {
        super();
    }
}
exports.Callable = Callable;
Object.defineProperty(Callable.prototype, 'constructor', {
    configurable: true,
    value: Function,
    writable: true,
});
Object.defineProperty(Callable.prototype, 'bind', {
    configurable: true,
    value: function (...args) {
        const bound = Function.prototype.bind.apply(this, args);
        defineRestrictedProperties(bound, ['caller', 'arguments']);
        return bound;
    },
    writable: true,
});
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
    new(key, { mutable = true, initialized = true } = {}) {
        const index = this.heap.length;
        this.scope[key] = index;
        this.heap.push({ value: void 0, mutable, initialized });
    }
    set(key, value) {
        if (!(key in this.scope)) {
            throw new Error('variable is used before decleration');
        }
        const index = this.scope[key];
        const cell = this.heap[index];
        if (!cell.initialized) {
            throw new ReferenceError('Cannot access binding before initialization');
        }
        if (!cell.mutable) {
            throw new TypeError('Assignment to constant variable');
        }
        cell.value = value;
    }
    init(key, value) {
        if (!(key in this.scope)) {
            throw new ReferenceError('binding is not declared');
        }
        const cell = this.heap[this.scope[key]];
        if (cell.initialized) {
            throw new ReferenceError('binding is already initialized');
        }
        cell.value = value;
        cell.initialized = true;
    }
    get(key) {
        if (!(key in this.scope)) {
            throw new ReferenceError('binding is not declared');
        }
        const index = this.scope[key];
        const cell = this.heap[index];
        if (!cell.initialized) {
            throw new ReferenceError('Cannot access binding before initialization');
        }
        return cell.value;
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
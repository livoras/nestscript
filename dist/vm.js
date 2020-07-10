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

var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVMFromArrayBuffer = exports.VirtualMachine = exports.operantBytesSize = exports.I = void 0;
var utils_1 = __webpack_require__(1);
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
    I[I["AUSE"] = 36] = "AUSE";
    I[I["EXIT"] = 37] = "EXIT";
    I[I["CALL_CTX"] = 38] = "CALL_CTX";
    I[I["CALL_VAR"] = 39] = "CALL_VAR";
    I[I["MOV_CTX"] = 40] = "MOV_CTX";
    I[I["MOV_PROP"] = 41] = "MOV_PROP";
    I[I["SET_CTX"] = 42] = "SET_CTX";
    I[I["NEW_OBJ"] = 43] = "NEW_OBJ";
    I[I["NEW_ARR"] = 44] = "NEW_ARR";
    I[I["SET_KEY"] = 45] = "SET_KEY";
    I[I["CALLBACK"] = 46] = "CALLBACK";
})(I = exports.I || (exports.I = {}));
exports.operantBytesSize = (_a = {},
    _a[3] = 2,
    _a[4] = 2,
    _a[0] = 2,
    _a[1] = 2,
    _a[5] = 2,
    _a[7] = 4,
    _a[2] = 8,
    _a[6] = 0,
    _a);
var VirtualMachine = (function () {
    function VirtualMachine(codes, functionsTable, stringsTable, entryFunctionIndex, globalSize, ctx) {
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
        this.isRunning = false;
        this.init();
    }
    VirtualMachine.prototype.init = function () {
        var _a = this, globalSize = _a.globalSize, functionsTable = _a.functionsTable, entryFunctionIndex = _a.entryFunctionIndex;
        var globalIndex = globalSize + 1;
        var mainLocalSize = functionsTable[entryFunctionIndex].localSize;
        this.fp = globalIndex;
        this.stack[this.fp] = -1;
        this.sp = this.fp + mainLocalSize;
        this.stack.length = this.sp + 1;
        console.log('globalIndex', globalIndex, 'localSize', functionsTable[entryFunctionIndex].localSize);
        console.log("start ---> fp", this.fp, this.sp);
    };
    VirtualMachine.prototype.run = function () {
        this.ip = this.functionsTable[this.entryFunctionIndex].ip;
        console.log("start stack", this.stack);
        this.isRunning = true;
        while (this.isRunning) {
            this.fetchAndExecute();
        }
    };
    VirtualMachine.prototype.fetchAndExecute = function () {
        var stack = this.stack;
        var op = this.nextOperator();
        switch (op) {
            case I.PUSH: {
                this.push(this.nextOperant().value);
                break;
            }
            case I.EXIT: {
                console.log('exit stack size -> ', stack.length);
                this.stack = [];
                this.isRunning = false;
                this.init();
                break;
            }
            case I.CALL: {
                var funcInfo = this.nextOperant().value;
                var numArgs = this.nextOperant().value;
                this.callFunction(funcInfo, numArgs);
                break;
            }
            case I.RET: {
                var fp = this.fp;
                this.fp = stack[fp];
                this.ip = stack[fp - 1];
                this.sp = fp - stack[fp - 2] - 3;
                this.stack = stack.slice(0, this.sp + 1);
                break;
            }
            case I.PRINT: {
                var val = this.nextOperant();
                console.log(val.value);
                break;
            }
            case I.MOV: {
                var dst = this.nextOperant();
                var src = this.nextOperant();
                this.stack[dst.index] = src.value;
                break;
            }
            case I.JMP: {
                var address = this.nextOperant();
                this.ip = address.value;
                break;
            }
            case I.JE: {
                this.jumpWithCondidtion(function (a, b) { return a === b; });
                break;
            }
            case I.JNE: {
                this.jumpWithCondidtion(function (a, b) { return a !== b; });
                break;
            }
            case I.JG: {
                this.jumpWithCondidtion(function (a, b) { return a > b; });
                break;
            }
            case I.JL: {
                this.jumpWithCondidtion(function (a, b) { return a < b; });
                break;
            }
            case I.JGE: {
                this.jumpWithCondidtion(function (a, b) { return a >= b; });
                break;
            }
            case I.JLE: {
                this.jumpWithCondidtion(function (a, b) { return a <= b; });
                break;
            }
            case I.JIF: {
                var cond = this.nextOperant();
                var address = this.nextOperant();
                if (cond.value) {
                    this.ip = address.value;
                }
                break;
            }
            case I.JF: {
                var cond = this.nextOperant();
                var address = this.nextOperant();
                if (!cond.value) {
                    this.ip = address.value;
                }
                break;
            }
            case I.CALL_CTX:
            case I.CALL_VAR: {
                var o = void 0;
                if (op === I.CALL_CTX) {
                    o = this.ctx;
                }
                else {
                    o = this.nextOperant().value;
                }
                var f = this.nextOperant().value;
                var numArgs = this.nextOperant().value;
                var args = [];
                for (var i = 0; i < numArgs; i++) {
                    args.push(stack[this.sp--]);
                }
                console.log(o, f, op === I.CALL_CTX);
                stack[0] = o[f].apply(o, args);
                this.stack = stack.slice(0, this.sp + 1);
                break;
            }
            case I.MOV_CTX: {
                var dst = this.nextOperant();
                var propKey = this.nextOperant();
                var src = utils_1.getByProp(this.ctx, propKey.value);
                this.stack[dst.index] = src;
                break;
            }
            case I.SET_CTX: {
                var propKey = this.nextOperant();
                var val = this.nextOperant();
                this.ctx[propKey.value] = val.value;
                break;
            }
            case I.NEW_OBJ: {
                var dst = this.nextOperant();
                var o = {};
                this.stack[dst.index] = o;
                break;
            }
            case I.NEW_ARR: {
                var dst = this.nextOperant();
                var o = [];
                this.stack[dst.index] = o;
                break;
            }
            case I.SET_KEY: {
                var o = this.nextOperant().value;
                var key = this.nextOperant().value;
                var value = this.nextOperant().value;
                o[key] = value;
                break;
            }
            case I.CALLBACK: {
                var dst = this.nextOperant();
                var funcInfo = this.nextOperant().value;
                var callback = this.newCallback(funcInfo);
                stack[dst.index] = callback;
                break;
            }
            case I.MOV_PROP: {
                var dst = this.nextOperant();
                var o = this.nextOperant().value;
                var k = this.nextOperant().value;
                var v = utils_1.getByProp(o, k);
                stack[dst.index] = v;
                break;
            }
            case I.LT: {
                this.binaryExpression(function (a, b) { return a < b; });
                break;
            }
            case I.GT: {
                this.binaryExpression(function (a, b) { return a > b; });
                break;
            }
            case I.EQ: {
                this.binaryExpression(function (a, b) { return a === b; });
                break;
            }
            case I.LE: {
                this.binaryExpression(function (a, b) { return a <= b; });
                break;
            }
            case I.GE: {
                this.binaryExpression(function (a, b) { return a >= b; });
                break;
            }
            case I.ADD: {
                this.binaryExpression(function (a, b) { return a + b; });
                break;
            }
            case I.SUB: {
                this.binaryExpression(function (a, b) { return a - b; });
                break;
            }
            case I.MUL: {
                this.binaryExpression(function (a, b) { return a * b; });
                break;
            }
            case I.DIV: {
                this.binaryExpression(function (a, b) { return a / b; });
                break;
            }
            case I.MOD: {
                this.binaryExpression(function (a, b) { return a % b; });
                break;
            }
            default:
                console.log(this.ip);
                throw new Error("Unknow command " + op);
        }
        return op;
    };
    VirtualMachine.prototype.push = function (val) {
        this.stack[++this.sp] = val;
    };
    VirtualMachine.prototype.callFunction = function (funcInfo, numArgs) {
        var stack = this.stack;
        stack[++this.sp] = numArgs;
        stack[++this.sp] = this.ip;
        stack[++this.sp] = this.fp;
        this.ip = funcInfo.ip;
        this.fp = this.sp;
        this.sp += funcInfo.localSize;
    };
    VirtualMachine.prototype.nextOperator = function () {
        return readUInt8(this.codes, this.ip, ++this.ip);
    };
    VirtualMachine.prototype.nextOperant = function () {
        var codes = this.codes;
        var valueType = readUInt8(codes, this.ip, ++this.ip);
        var value;
        switch (valueType) {
            case 0:
            case 1:
            case 5:
            case 3:
            case 4: {
                var j = this.ip + 2;
                value = readInt16(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 7: {
                var j = this.ip + 4;
                value = readUInt32(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 2: {
                var j = this.ip + 8;
                value = readFloat64(codes, this.ip, j);
                this.ip = j;
                break;
            }
            case 6:
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
    };
    VirtualMachine.prototype.parseValue = function (valueType, value) {
        switch (valueType) {
            case 0:
                return this.stack[this.fp + value];
            case 5:
            case 2:
            case 7:
                return value;
            case 1:
                return this.stack[value];
            case 4:
                return this.stringsTable[value];
            case 3:
                return this.functionsTable[value];
            case 6:
                return this.stack[0];
            default:
                throw new Error("Unknown operant " + valueType);
        }
    };
    VirtualMachine.prototype.jumpWithCondidtion = function (cond) {
        var op1 = this.nextOperant();
        var op2 = this.nextOperant();
        var address = this.nextOperant();
        if (cond(op1.value, op2.value)) {
            this.ip = address.value;
        }
    };
    VirtualMachine.prototype.binaryExpression = function (exp) {
        var o1 = this.nextOperant();
        var o2 = this.nextOperant();
        var ret = exp(o1.value, o2.value);
        this.stack[o1.index] = ret;
    };
    VirtualMachine.prototype.newCallback = function (funcInfo) {
        var _this = this;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            args.reverse();
            args.forEach(function (arg) { return _this.push(arg); });
            _this.callFunction(funcInfo, args.length);
            var op = null;
            var callCount = 1;
            while (callCount !== 0) {
                op = _this.fetchAndExecute();
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
    };
    return VirtualMachine;
}());
exports.VirtualMachine = VirtualMachine;
var createVMFromArrayBuffer = function (buffer, ctx) {
    if (ctx === void 0) { ctx = {}; }
    var mainFunctionIndex = readUInt32(buffer, 0, 4);
    var funcionTableBasicIndex = readUInt32(buffer, 4, 8);
    var stringTableBasicIndex = readUInt32(buffer, 8, 12);
    var globalsSize = readUInt32(buffer, 12, 16);
    console.log('main function index', mainFunctionIndex, 'function table basic index', funcionTableBasicIndex, 'string table basic index', stringTableBasicIndex, 'globals szie ', globalsSize);
    var stringsTable = parseStringsArray(buffer.slice(stringTableBasicIndex));
    var codesBuf = buffer.slice(4 * 4, funcionTableBasicIndex);
    var funcsBuf = buffer.slice(funcionTableBasicIndex, stringTableBasicIndex);
    var funcsTable = parseFunctionTable(funcsBuf);
    console.log('string table', stringsTable);
    console.log('function table', funcsTable);
    console.log(mainFunctionIndex, funcsTable, 'function basic index', funcionTableBasicIndex);
    console.log('codes length -->', codesBuf.byteLength, stringTableBasicIndex);
    console.log('main start index', funcsTable[mainFunctionIndex].ip, stringTableBasicIndex);
    return new VirtualMachine(codesBuf, funcsTable, stringsTable, mainFunctionIndex, globalsSize, ctx);
};
exports.createVMFromArrayBuffer = createVMFromArrayBuffer;
var parseFunctionTable = function (buffer) {
    var funcs = [];
    var i = 0;
    while (i < buffer.byteLength) {
        var ipEnd = i + 4;
        var ip = readUInt32(buffer, i, ipEnd);
        var numArgsAndLocal = new Uint16Array(buffer.slice(ipEnd, ipEnd + 2 * 2));
        funcs.push({ ip: ip, numArgs: numArgsAndLocal[0], localSize: numArgsAndLocal[1] });
        i += 8;
    }
    return funcs;
};
var parseStringsArray = function (buffer) {
    var strings = [];
    var i = 0;
    while (i < buffer.byteLength) {
        var lentOffset = i + 4;
        var len = readUInt32(buffer, i, lentOffset);
        var start = lentOffset;
        var end = lentOffset + len * 2;
        var str = readString(buffer, start, end);
        strings.push(str);
        i = end;
    }
    return strings;
};
var readFloat64 = function (buffer, from, to) {
    return (new Float64Array(buffer.slice(from, to)))[0];
};
var readUInt8 = function (buffer, from, to) {
    return (new Uint8Array(buffer.slice(from, to)))[0];
};
var readInt8 = function (buffer, from, to) {
    return (new Int8Array(buffer.slice(from, to)))[0];
};
var readInt16 = function (buffer, from, to) {
    return (new Int16Array(buffer.slice(from, to)))[0];
};
var readUInt16 = function (buffer, from, to) {
    return (new Uint16Array(buffer.slice(from, to)))[0];
};
var readUInt32 = function (buffer, from, to) {
    return (new Uint32Array(buffer.slice(from, to)))[0];
};
var readString = function (buffer, from, to) {
    return utils_1.arrayBufferToString(buffer.slice(from, to));
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.getByProp = exports.stringToArrayBuffer = exports.arrayBufferToString = exports.concatBuffer = void 0;
exports.concatBuffer = function (buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};
exports.arrayBufferToString = function (buffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)));
};
exports.stringToArrayBuffer = function (str) {
    var stringLength = str.length;
    var buffer = new ArrayBuffer(stringLength * 2);
    var bufferView = new Uint16Array(buffer);
    for (var i = 0; i < stringLength; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return buffer;
};
exports.getByProp = function (obj, prop) {
    return String(prop).split('.').reduce(function (o, p) { return o[p]; }, obj);
};


/***/ })
/******/ ]);
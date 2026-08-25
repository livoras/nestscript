(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NestScript"] = factory();
	else
		root["NestScript"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createVMFromJavaScript = exports.createVMFromArrayBuffer = exports.deserializeProgram = exports.serializeProgram = exports.VirtualMachine = exports.compileProgramFromAssembly = exports.compileProgramFromJavaScript = exports.UnsupportedOpcodeError = exports.Opcode = void 0;
const codegen_1 = __webpack_require__(1);
const parser_1 = __webpack_require__(6);
const REF_KIND_SHIFT = 30;
const REF_INDEX_MASK = 0x3fffffff;
const REF_LOCAL = 0;
const REF_CONSTANT = 1;
const REF_GLOBAL = 2;
const REF_RETURN = 3;
const NO_SLOT = 0xffff;
const BYTECODE_MAGIC = 0x5443534e;
const BYTECODE_VERSION = 1;
const HEADER_WORDS = 15;
const FUNCTION_WORDS = 6;
const CONSTANT_WORDS = 4;
const ref = (kind, index = 0) => {
    return ((kind << REF_KIND_SHIFT) | (index & REF_INDEX_MASK)) >>> 0;
};
const refKind = (value) => value >>> REF_KIND_SHIFT;
const refIndex = (value) => value & REF_INDEX_MASK;
const localRef = (slot) => ref(REF_LOCAL, slot);
const constantRef = (index) => ref(REF_CONSTANT, index);
const globalRef = (index) => ref(REF_GLOBAL, index);
const returnRef = () => ref(REF_RETURN);
var Opcode;
(function (Opcode) {
    Opcode[Opcode["NOP"] = 0] = "NOP";
    Opcode[Opcode["MOVE"] = 1] = "MOVE";
    Opcode[Opcode["SET_GLOBAL"] = 2] = "SET_GLOBAL";
    Opcode[Opcode["SET_RETURN"] = 3] = "SET_RETURN";
    Opcode[Opcode["LOAD_CTX"] = 4] = "LOAD_CTX";
    Opcode[Opcode["SET_CTX"] = 5] = "SET_CTX";
    Opcode[Opcode["ADD"] = 6] = "ADD";
    Opcode[Opcode["SUB"] = 7] = "SUB";
    Opcode[Opcode["MUL"] = 8] = "MUL";
    Opcode[Opcode["DIV"] = 9] = "DIV";
    Opcode[Opcode["MOD"] = 10] = "MOD";
    Opcode[Opcode["OR"] = 11] = "OR";
    Opcode[Opcode["AND"] = 12] = "AND";
    Opcode[Opcode["XOR"] = 13] = "XOR";
    Opcode[Opcode["SHL"] = 14] = "SHL";
    Opcode[Opcode["SHR"] = 15] = "SHR";
    Opcode[Opcode["ZSHR"] = 16] = "ZSHR";
    Opcode[Opcode["LT"] = 17] = "LT";
    Opcode[Opcode["GT"] = 18] = "GT";
    Opcode[Opcode["EQ"] = 19] = "EQ";
    Opcode[Opcode["NE"] = 20] = "NE";
    Opcode[Opcode["LE"] = 21] = "LE";
    Opcode[Opcode["GE"] = 22] = "GE";
    Opcode[Opcode["WEQ"] = 23] = "WEQ";
    Opcode[Opcode["WNE"] = 24] = "WNE";
    Opcode[Opcode["ADD_CONST"] = 25] = "ADD_CONST";
    Opcode[Opcode["SUB_CONST"] = 26] = "SUB_CONST";
    Opcode[Opcode["MUL_CONST"] = 27] = "MUL_CONST";
    Opcode[Opcode["DIV_CONST"] = 28] = "DIV_CONST";
    Opcode[Opcode["MOD_CONST"] = 29] = "MOD_CONST";
    Opcode[Opcode["OR_CONST"] = 30] = "OR_CONST";
    Opcode[Opcode["AND_CONST"] = 31] = "AND_CONST";
    Opcode[Opcode["XOR_CONST"] = 32] = "XOR_CONST";
    Opcode[Opcode["SHL_CONST"] = 33] = "SHL_CONST";
    Opcode[Opcode["SHR_CONST"] = 34] = "SHR_CONST";
    Opcode[Opcode["ZSHR_CONST"] = 35] = "ZSHR_CONST";
    Opcode[Opcode["LT_CONST"] = 36] = "LT_CONST";
    Opcode[Opcode["GT_CONST"] = 37] = "GT_CONST";
    Opcode[Opcode["EQ_CONST"] = 38] = "EQ_CONST";
    Opcode[Opcode["NE_CONST"] = 39] = "NE_CONST";
    Opcode[Opcode["LE_CONST"] = 40] = "LE_CONST";
    Opcode[Opcode["GE_CONST"] = 41] = "GE_CONST";
    Opcode[Opcode["WEQ_CONST"] = 42] = "WEQ_CONST";
    Opcode[Opcode["WNE_CONST"] = 43] = "WNE_CONST";
    Opcode[Opcode["SUPER_ADD_STORE"] = 44] = "SUPER_ADD_STORE";
    Opcode[Opcode["SUPER_BINARY_STORE"] = 45] = "SUPER_BINARY_STORE";
    Opcode[Opcode["GET_PROP"] = 46] = "GET_PROP";
    Opcode[Opcode["SET_PROP"] = 47] = "SET_PROP";
    Opcode[Opcode["DEF_DATA"] = 48] = "DEF_DATA";
    Opcode[Opcode["NEW_OBJ"] = 49] = "NEW_OBJ";
    Opcode[Opcode["NEW_ARR"] = 50] = "NEW_ARR";
    Opcode[Opcode["MAKE_FUNC"] = 51] = "MAKE_FUNC";
    Opcode[Opcode["MAKE_FUNC_GLOBAL"] = 52] = "MAKE_FUNC_GLOBAL";
    Opcode[Opcode["MAKE_FUNC_RETURN"] = 53] = "MAKE_FUNC_RETURN";
    Opcode[Opcode["JUMP"] = 54] = "JUMP";
    Opcode[Opcode["JUMP_IF_TRUE"] = 55] = "JUMP_IF_TRUE";
    Opcode[Opcode["JUMP_IF_FALSE"] = 56] = "JUMP_IF_FALSE";
    Opcode[Opcode["CALL"] = 57] = "CALL";
    Opcode[Opcode["RETURN"] = 58] = "RETURN";
    Opcode[Opcode["EXIT"] = 59] = "EXIT";
    Opcode[Opcode["ADD_I32"] = 60] = "ADD_I32";
    Opcode[Opcode["SUB_I32"] = 61] = "SUB_I32";
    Opcode[Opcode["MUL_I32"] = 62] = "MUL_I32";
    Opcode[Opcode["MOD_I32"] = 63] = "MOD_I32";
    Opcode[Opcode["OR_I32"] = 64] = "OR_I32";
    Opcode[Opcode["AND_I32"] = 65] = "AND_I32";
    Opcode[Opcode["XOR_I32"] = 66] = "XOR_I32";
    Opcode[Opcode["SHL_I32"] = 67] = "SHL_I32";
    Opcode[Opcode["SHR_I32"] = 68] = "SHR_I32";
    Opcode[Opcode["ZSHR_I32"] = 69] = "ZSHR_I32";
    Opcode[Opcode["LT_I32"] = 70] = "LT_I32";
    Opcode[Opcode["GT_I32"] = 71] = "GT_I32";
    Opcode[Opcode["EQ_I32"] = 72] = "EQ_I32";
    Opcode[Opcode["NE_I32"] = 73] = "NE_I32";
    Opcode[Opcode["LE_I32"] = 74] = "LE_I32";
    Opcode[Opcode["GE_I32"] = 75] = "GE_I32";
    Opcode[Opcode["WEQ_I32"] = 76] = "WEQ_I32";
    Opcode[Opcode["WNE_I32"] = 77] = "WNE_I32";
    Opcode[Opcode["LOOP_ACCUMULATE"] = 78] = "LOOP_ACCUMULATE";
})(Opcode = exports.Opcode || (exports.Opcode = {}));
class UnsupportedOpcodeError extends Error {
    constructor(opcode, details = '') {
        super(`NestScript does not support ${opcode}${details ? ` (${details})` : ''}`);
        this.opcode = opcode;
        this.details = details;
    }
}
exports.UnsupportedOpcodeError = UnsupportedOpcodeError;
const unquote = (value) => {
    if (value.length >= 2 && ((value[0] === '"' && value[value.length - 1] === '"') ||
        (value[0] === "'" && value[value.length - 1] === "'"))) {
        return value.slice(1, -1);
    }
    return value;
};
const isNumberToken = (value) => {
    return value !== '' && !isNaN(+value);
};
const isBinaryAssemblyOpcode = (opcode) => {
    return [
        'ADD', 'SUB', 'MUL', 'DIV', 'MOD', 'OR', 'AND', 'XOR', 'SHL', 'SHR', 'ZSHR',
        'LT', 'GT', 'EQ', 'NE', 'LE', 'GE', 'WEQ', 'WNE',
    ].includes(opcode);
};
const binaryOpcode = (opcode) => {
    const result = Opcode[opcode];
    if (typeof result !== 'number') {
        throw new UnsupportedOpcodeError(opcode);
    }
    return result;
};
const i32OpcodeFor = (opcode) => {
    switch (opcode) {
        case Opcode.ADD:
        case Opcode.ADD_CONST: return Opcode.ADD_I32;
        case Opcode.SUB:
        case Opcode.SUB_CONST: return Opcode.SUB_I32;
        case Opcode.MUL:
        case Opcode.MUL_CONST: return Opcode.MUL_I32;
        case Opcode.MOD:
        case Opcode.MOD_CONST: return Opcode.MOD_I32;
        case Opcode.OR:
        case Opcode.OR_CONST: return Opcode.OR_I32;
        case Opcode.AND:
        case Opcode.AND_CONST: return Opcode.AND_I32;
        case Opcode.XOR:
        case Opcode.XOR_CONST: return Opcode.XOR_I32;
        case Opcode.SHL:
        case Opcode.SHL_CONST: return Opcode.SHL_I32;
        case Opcode.SHR:
        case Opcode.SHR_CONST: return Opcode.SHR_I32;
        case Opcode.ZSHR:
        case Opcode.ZSHR_CONST: return Opcode.ZSHR_I32;
        case Opcode.LT:
        case Opcode.LT_CONST: return Opcode.LT_I32;
        case Opcode.GT:
        case Opcode.GT_CONST: return Opcode.GT_I32;
        case Opcode.EQ:
        case Opcode.EQ_CONST: return Opcode.EQ_I32;
        case Opcode.NE:
        case Opcode.NE_CONST: return Opcode.NE_I32;
        case Opcode.LE:
        case Opcode.LE_CONST: return Opcode.LE_I32;
        case Opcode.GE:
        case Opcode.GE_CONST: return Opcode.GE_I32;
        case Opcode.WEQ:
        case Opcode.WEQ_CONST: return Opcode.WEQ_I32;
        case Opcode.WNE:
        case Opcode.WNE_CONST: return Opcode.WNE_I32;
        default: return undefined;
    }
};
const genericOpcodeForI32 = (opcode) => {
    switch (opcode) {
        case Opcode.ADD_I32: return Opcode.ADD;
        case Opcode.SUB_I32: return Opcode.SUB;
        case Opcode.MUL_I32: return Opcode.MUL;
        case Opcode.MOD_I32: return Opcode.MOD;
        case Opcode.OR_I32: return Opcode.OR;
        case Opcode.AND_I32: return Opcode.AND;
        case Opcode.XOR_I32: return Opcode.XOR;
        case Opcode.SHL_I32: return Opcode.SHL;
        case Opcode.SHR_I32: return Opcode.SHR;
        case Opcode.ZSHR_I32: return Opcode.ZSHR;
        case Opcode.LT_I32: return Opcode.LT;
        case Opcode.GT_I32: return Opcode.GT;
        case Opcode.EQ_I32: return Opcode.EQ;
        case Opcode.NE_I32: return Opcode.NE;
        case Opcode.LE_I32: return Opcode.LE;
        case Opcode.GE_I32: return Opcode.GE;
        case Opcode.WEQ_I32: return Opcode.WEQ;
        case Opcode.WNE_I32: return Opcode.WNE;
        default: throw new Error(`Not an I32 opcode ${opcode}`);
    }
};
const isI32Opcode = (opcode) => {
    return opcode >= Opcode.ADD_I32 && opcode <= Opcode.WNE_I32;
};
const isInt32Value = (value) => {
    return typeof value === 'number' && value === (value | 0);
};
const constantOpcode = (opcode) => {
    const result = Opcode[`${opcode}_CONST`];
    if (typeof result !== 'number') {
        throw new UnsupportedOpcodeError(opcode);
    }
    return result;
};
const instruction = (op, dst = NO_SLOT, a = 0, b = 0, c = 0) => ({ op, flags: 0, dst, a, b, c });
const addSlot = (compileFunction, name) => {
    const existing = compileFunction.locals.get(name);
    if (existing !== undefined) {
        return existing;
    }
    const slot = compileFunction.slotCount++;
    if (slot >= NO_SLOT) {
        throw new Error('Function has too many local slots');
    }
    compileFunction.locals.set(name, slot);
    return slot;
};
const parseRegisterName = (name) => name;
const buildFunctionLocals = (parsed, index) => {
    const compileFunction = {
        parsed,
        index,
        params: parsed.params.map((param) => param.replace(/^\./, '')),
        locals: new Map(),
        labels: {},
        instructions: [],
        slotCount: 0,
        flags: 0,
    };
    for (const param of compileFunction.params) {
        addSlot(compileFunction, param);
    }
    for (const code of parsed.instructions) {
        if (code[0] === 'VAR') {
            if (code[1].startsWith('@')) {
                throw new UnsupportedOpcodeError(code[0], 'closures');
            }
            addSlot(compileFunction, code[1]);
        }
        else if (code[0] === 'REG') {
            addSlot(compileFunction, parseRegisterName(code[1]));
        }
        else if (code[0] === 'META') {
            compileFunction.flags = Number(code[1]) || 0;
        }
    }
    return compileFunction;
};
const countEmittedInstructions = (code, compileFunction, globalNames) => {
    const opcode = code[0];
    if (['META', 'REG', 'VAR', 'CLS', 'GLOBAL_BIND', 'LABEL'].includes(opcode)) {
        return 0;
    }
    if (opcode === 'PUSH') {
        return 1;
    }
    if (opcode === 'NEW_OBJ' || opcode === 'NEW_ARR') {
        const target = code[1];
        return globalNames.has(target) ? 2 : 1;
    }
    return 1;
};
const makeConstantTable = () => {
    const constants = [];
    const indexes = new Map();
    const get = (value) => {
        const key = value !== value ? '__nestscript_nan__' : value;
        const existing = indexes.get(key);
        if (existing !== undefined) {
            return existing;
        }
        const index = constants.length;
        constants.push(value);
        indexes.set(key, index);
        return index;
    };
    return { constants, get };
};
const lowerFunction = (compileFunction, functionIndexes, globalIndexes, constantTable, callSites) => {
    const raw = compileFunction.parsed.instructions;
    let ip = 0;
    for (const code of raw) {
        ip += countEmittedInstructions(code, compileFunction, new Set(globalIndexes.keys()));
        if (code[0] === 'LABEL') {
            compileFunction.labels[code[1]] = ip;
        }
    }
    let pendingArgs = [];
    const tempSlot = () => {
        const slot = compileFunction.slotCount++;
        if (slot >= NO_SLOT) {
            throw new Error('Function has too many local slots');
        }
        return slot;
    };
    const getConstant = (value) => constantRef(constantTable.get(value));
    const resolve = (token) => {
        if (token === '$RET') {
            return returnRef();
        }
        if (token.startsWith('@')) {
            throw new UnsupportedOpcodeError('operand', 'closures');
        }
        if (token.startsWith('%')) {
            const slot = compileFunction.locals.get(token);
            if (slot === undefined) {
                throw new UnsupportedOpcodeError('register', token);
            }
            return localRef(slot);
        }
        if (token.startsWith('.')) {
            const slot = compileFunction.locals.get(token.slice(1));
            if (slot === undefined) {
                throw new UnsupportedOpcodeError('parameter', token);
            }
            return localRef(slot);
        }
        const localSlot = compileFunction.locals.get(token);
        if (localSlot !== undefined) {
            return localRef(localSlot);
        }
        const globalIndex = globalIndexes.get(token);
        if (globalIndex !== undefined) {
            return globalRef(globalIndex);
        }
        if (token === 'true' || token === 'false') {
            return getConstant(token === 'true');
        }
        if (token === 'null') {
            return getConstant(null);
        }
        if (token === 'undefined') {
            return getConstant(void 0);
        }
        if (isNumberToken(token)) {
            return getConstant(+token);
        }
        if ((token.startsWith('"') && token.endsWith('"')) ||
            (token.startsWith("'") && token.endsWith("'"))) {
            return getConstant(unquote(token));
        }
        throw new UnsupportedOpcodeError('operand', token);
    };
    const destination = (token) => {
        const value = resolve(token);
        if (refKind(value) !== REF_LOCAL && refKind(value) !== REF_GLOBAL && refKind(value) !== REF_RETURN) {
            throw new UnsupportedOpcodeError('destination', token);
        }
        return value;
    };
    const emitStore = (target, value) => {
        if (refKind(target) === REF_LOCAL) {
            compileFunction.instructions.push(instruction(Opcode.MOVE, refIndex(target), value));
        }
        else if (refKind(target) === REF_GLOBAL) {
            compileFunction.instructions.push(instruction(Opcode.SET_GLOBAL, NO_SLOT, refIndex(target), value));
        }
        else if (refKind(target) === REF_RETURN) {
            compileFunction.instructions.push(instruction(Opcode.SET_RETURN, NO_SLOT, value));
        }
        else {
            throw new UnsupportedOpcodeError('store');
        }
    };
    const emitBinary = (opcode, target, left, right) => {
        if (refKind(target) === REF_LOCAL) {
            const op = refKind(right) === REF_CONSTANT ? constantOpcode(opcode) : binaryOpcode(opcode);
            compileFunction.instructions.push(instruction(op, refIndex(target), left, right));
            return;
        }
        const temporary = tempSlot();
        const op = refKind(right) === REF_CONSTANT ? constantOpcode(opcode) : binaryOpcode(opcode);
        compileFunction.instructions.push(instruction(op, temporary, left, right));
        emitStore(target, localRef(temporary));
    };
    for (const code of raw) {
        const opcode = code[0];
        if (['META', 'REG', 'VAR', 'CLS', 'GLOBAL_BIND', 'LABEL'].includes(opcode)) {
            if (opcode === 'CLS' || opcode === 'GLOBAL_BIND') {
                if (opcode === 'CLS') {
                    throw new UnsupportedOpcodeError(opcode);
                }
            }
            continue;
        }
        if (opcode === 'PUSH') {
            const temporary = tempSlot();
            compileFunction.instructions.push(instruction(Opcode.MOVE, temporary, resolve(code[1])));
            pendingArgs.push(localRef(temporary));
            continue;
        }
        if (opcode === 'MOV') {
            emitStore(destination(code[1]), resolve(code[2]));
            continue;
        }
        if (opcode === 'FUNC') {
            const functionIndex = functionIndexes.get(code[2]);
            if (functionIndex === undefined) {
                throw new UnsupportedOpcodeError(opcode, code[2]);
            }
            const target = destination(code[1]);
            if (refKind(target) === REF_LOCAL) {
                compileFunction.instructions.push(instruction(Opcode.MAKE_FUNC, refIndex(target), 0, 0, functionIndex));
            }
            else if (refKind(target) === REF_GLOBAL) {
                compileFunction.instructions.push(instruction(Opcode.MAKE_FUNC_GLOBAL, NO_SLOT, refIndex(target), 0, functionIndex));
            }
            else {
                compileFunction.instructions.push(instruction(Opcode.MAKE_FUNC_RETURN, NO_SLOT, 0, 0, functionIndex));
            }
            continue;
        }
        if (opcode === 'CALL_REG' || opcode === 'CALL_REF') {
            const functionRef = resolve(code[1]);
            const argc = Number(opcode === 'CALL_REF' ? code[3] : code[2]);
            if (!Number.isInteger(argc) || argc < 0 || pendingArgs.length < argc) {
                throw new UnsupportedOpcodeError(opcode, 'argument stack');
            }
            const args = pendingArgs.splice(pendingArgs.length - argc, argc);
            const callSite = callSites.length;
            callSites.push({ args, isNewExpression: code[3] === 'true' });
            const receiver = opcode === 'CALL_REF' ? resolve(code[2]) : getConstant(void 0);
            compileFunction.instructions.push(instruction(Opcode.CALL, NO_SLOT, functionRef, receiver, callSite));
            continue;
        }
        if (isBinaryAssemblyOpcode(opcode)) {
            emitBinary(opcode, destination(code[1]), resolve(code[1]), resolve(code[2]));
            continue;
        }
        if (opcode === 'JF' || opcode === 'JIF') {
            compileFunction.instructions.push(instruction(opcode === 'JF' ? Opcode.JUMP_IF_FALSE : Opcode.JUMP_IF_TRUE, NO_SLOT, resolve(code[1]), 0, 0));
            compileFunction.instructions[compileFunction.instructions.length - 1].targetLabel = code[2];
            continue;
        }
        if (opcode === 'JMP' || opcode === 'ABRUPT_JUMP') {
            if (opcode === 'ABRUPT_JUMP') {
                throw new UnsupportedOpcodeError(opcode, 'finally routing');
            }
            const jump = instruction(Opcode.JUMP, NO_SLOT, 0, 0, 0);
            jump.targetLabel = code[1];
            compileFunction.instructions.push(jump);
            continue;
        }
        if (opcode === 'SET_CTX') {
            compileFunction.instructions.push(instruction(Opcode.SET_CTX, NO_SLOT, resolve(code[1]), resolve(code[2])));
            continue;
        }
        if (opcode === 'MOV_CTX') {
            const target = destination(code[1]);
            if (refKind(target) !== REF_LOCAL) {
                throw new UnsupportedOpcodeError(opcode, 'global destination');
            }
            compileFunction.instructions.push(instruction(Opcode.LOAD_CTX, refIndex(target), resolve(code[2])));
            continue;
        }
        if (opcode === 'MOV_PROP') {
            const target = destination(code[1]);
            if (refKind(target) !== REF_LOCAL) {
                throw new UnsupportedOpcodeError(opcode, 'non-local destination');
            }
            compileFunction.instructions.push(instruction(Opcode.GET_PROP, refIndex(target), resolve(code[2]), resolve(code[3])));
            continue;
        }
        if (opcode === 'SET_KEY') {
            compileFunction.instructions.push(instruction(Opcode.SET_PROP, NO_SLOT, resolve(code[1]), resolve(code[2]), resolve(code[3])));
            continue;
        }
        if (opcode === 'DEF_DATA') {
            compileFunction.instructions.push(instruction(Opcode.DEF_DATA, NO_SLOT, resolve(code[1]), resolve(code[2]), resolve(code[3])));
            continue;
        }
        if (opcode === 'NEW_OBJ' || opcode === 'NEW_ARR') {
            const target = destination(code[1]);
            if (refKind(target) === REF_LOCAL) {
                compileFunction.instructions.push(instruction(opcode === 'NEW_OBJ' ? Opcode.NEW_OBJ : Opcode.NEW_ARR, refIndex(target)));
            }
            else {
                const temporary = tempSlot();
                compileFunction.instructions.push(instruction(opcode === 'NEW_OBJ' ? Opcode.NEW_OBJ : Opcode.NEW_ARR, temporary));
                emitStore(target, localRef(temporary));
            }
            continue;
        }
        if (opcode === 'RET') {
            if (pendingArgs.length > 0) {
                throw new UnsupportedOpcodeError('PUSH', 'not followed by CALL');
            }
            compileFunction.instructions.push(instruction(Opcode.RETURN, NO_SLOT, returnRef()));
            continue;
        }
        if (opcode === 'EXIT') {
            compileFunction.instructions.push(instruction(Opcode.EXIT));
            continue;
        }
        throw new UnsupportedOpcodeError(opcode);
    }
    if (pendingArgs.length > 0) {
        throw new UnsupportedOpcodeError('PUSH', 'not followed by CALL');
    }
};
const isBinaryOpcode = (op) => {
    return op >= Opcode.ADD && op <= Opcode.WNE_CONST && op !== Opcode.SUPER_ADD_STORE;
};
const applyStaticSuperinstructions = (program) => {
    const constantSpecializations = new Map([
        [Opcode.ADD, Opcode.ADD_CONST], [Opcode.SUB, Opcode.SUB_CONST],
        [Opcode.MUL, Opcode.MUL_CONST], [Opcode.DIV, Opcode.DIV_CONST],
        [Opcode.MOD, Opcode.MOD_CONST], [Opcode.OR, Opcode.OR_CONST],
        [Opcode.AND, Opcode.AND_CONST], [Opcode.XOR, Opcode.XOR_CONST],
        [Opcode.SHL, Opcode.SHL_CONST], [Opcode.SHR, Opcode.SHR_CONST],
        [Opcode.ZSHR, Opcode.ZSHR_CONST], [Opcode.LT, Opcode.LT_CONST],
        [Opcode.GT, Opcode.GT_CONST], [Opcode.EQ, Opcode.EQ_CONST],
        [Opcode.NE, Opcode.NE_CONST], [Opcode.LE, Opcode.LE_CONST],
        [Opcode.GE, Opcode.GE_CONST], [Opcode.WEQ, Opcode.WEQ_CONST],
        [Opcode.WNE, Opcode.WNE_CONST],
    ]);
    for (const meta of program.functions) {
        const end = meta.start + meta.length;
        const targeted = new Set();
        for (let i = meta.start; i < end; i++) {
            const item = program.instructions[i];
            if ((item.op === Opcode.JUMP || item.op === Opcode.JUMP_IF_TRUE ||
                item.op === Opcode.JUMP_IF_FALSE) && item.c >= meta.start && item.c <= end) {
                targeted.add(item.c);
            }
        }
        for (let i = meta.start + 1; i < end; i++) {
            const current = program.instructions[i];
            if (!constantSpecializations.has(current.op) || refKind(current.b) !== REF_LOCAL) {
                continue;
            }
            if (targeted.has(i)) {
                continue;
            }
            const previous = program.instructions[i - 1];
            if (previous.op === Opcode.MOVE && previous.dst === refIndex(current.b) &&
                refKind(previous.a) === REF_CONSTANT) {
                current.op = constantSpecializations.get(current.op);
                current.b = previous.a;
            }
        }
    }
    const oldInstructions = program.instructions;
    const oldFunctions = program.functions;
    const remappedAddresses = new Map();
    const rebuiltInstructions = [];
    const rebuiltFunctions = [];
    oldFunctions.forEach((meta) => {
        const segment = oldInstructions.slice(meta.start, meta.start + meta.length);
        const targeted = new Set();
        segment.forEach((item) => {
            if ((item.op === Opcode.JUMP || item.op === Opcode.JUMP_IF_TRUE ||
                item.op === Opcode.JUMP_IF_FALSE) && item.c >= meta.start &&
                item.c <= meta.start + meta.length) {
                targeted.add(item.c);
            }
        });
        const localMap = new Array(segment.length + 1);
        const output = [];
        let index = 0;
        while (index < segment.length) {
            localMap[index] = output.length;
            const current = segment[index];
            const next = segment[index + 1];
            let fused;
            if (next && isBinaryOpcode(current.op) && current.dst !== NO_SLOT &&
                !targeted.has(meta.start + index + 1)) {
                const resultRef = localRef(current.dst);
                if (next.op === Opcode.MOVE && next.a === resultRef) {
                    fused = instruction(Opcode.SUPER_BINARY_STORE, NO_SLOT, current.a, current.b, localRef(next.dst));
                }
                else if (next.op === Opcode.SET_GLOBAL && next.b === resultRef) {
                    fused = instruction(Opcode.SUPER_BINARY_STORE, NO_SLOT, current.a, current.b, globalRef(next.a));
                }
            }
            if (fused) {
                fused.flags = current.op;
                output.push(fused);
                localMap[index + 1] = output.length;
                index += 2;
            }
            else {
                output.push(current);
                index++;
            }
        }
        localMap[segment.length] = output.length;
        const newStart = rebuiltInstructions.length;
        for (let i = 0; i <= segment.length; i++) {
            remappedAddresses.set(meta.start + i, newStart + localMap[i]);
        }
        output.forEach((item) => { rebuiltInstructions.push(item); });
        rebuiltFunctions.push(Object.assign(Object.assign({}, meta), { start: newStart, length: output.length }));
    });
    rebuiltInstructions.forEach((item) => {
        if (item.op === Opcode.JUMP || item.op === Opcode.JUMP_IF_TRUE ||
            item.op === Opcode.JUMP_IF_FALSE) {
            const target = remappedAddresses.get(item.c);
            if (target === undefined) {
                throw new Error(`Invalid bytecode jump target ${item.c}`);
            }
            item.c = target;
        }
    });
    program.instructions = rebuiltInstructions;
    program.functions = rebuiltFunctions;
};
const isLocal = (value, slot) => {
    return refKind(value) === REF_LOCAL && refIndex(value) === slot;
};
const isLocalOrGlobal = (value) => {
    return refKind(value) === REF_LOCAL || refKind(value) === REF_GLOBAL;
};
const isConstantValue = (value, constants, expected) => {
    return refKind(value) === REF_CONSTANT && constants[refIndex(value)] === expected;
};
const findLoopKernel = (segment, functionStart, constants) => {
    for (let start = 0; start + 12 < segment.length; start++) {
        const loadCounter = segment[start];
        const loadLimit = segment[start + 1];
        const compare = segment[start + 2];
        const branch = segment[start + 3];
        const loadAccumulator = segment[start + 4];
        const loadBodyCounter = segment[start + 5];
        const addAccumulator = segment[start + 6];
        const zero = segment[start + 7];
        const normalize = segment[start + 8];
        const updateCounter = segment[start + 9];
        const one = segment[start + 10];
        const increment = segment[start + 11];
        const backJump = segment[start + 12];
        if (loadCounter.op !== Opcode.MOVE || loadLimit.op !== Opcode.MOVE ||
            loadCounter.dst === NO_SLOT || loadLimit.dst === NO_SLOT ||
            !isLocalOrGlobal(loadCounter.a) ||
            !isLocalOrGlobal(loadLimit.a) && refKind(loadLimit.a) !== REF_CONSTANT ||
            compare.op !== Opcode.LT && compare.op !== Opcode.LT_CONST ||
            !isLocal(compare.a, loadCounter.dst) || compare.dst === NO_SLOT ||
            (compare.b !== loadLimit.a && compare.b !== localRef(loadLimit.dst)) ||
            branch.op !== Opcode.JUMP_IF_FALSE || !isLocal(branch.a, compare.dst) ||
            branch.c <= functionStart + start + 12 ||
            loadAccumulator.op !== Opcode.MOVE || loadAccumulator.dst === NO_SLOT ||
            !isLocalOrGlobal(loadAccumulator.a) || loadAccumulator.a === loadCounter.a ||
            loadBodyCounter.op !== Opcode.MOVE || loadBodyCounter.dst === NO_SLOT ||
            loadBodyCounter.a !== loadCounter.a ||
            addAccumulator.op !== Opcode.ADD && addAccumulator.op !== Opcode.ADD_CONST ||
            !isLocal(addAccumulator.a, loadAccumulator.dst) ||
            !isLocal(addAccumulator.b, loadBodyCounter.dst) ||
            zero.op !== Opcode.MOVE || !isConstantValue(zero.a, constants, 0) ||
            normalize.op !== Opcode.SUPER_BINARY_STORE || normalize.flags !== Opcode.OR_CONST ||
            !isLocal(normalize.a, loadAccumulator.dst) || normalize.c !== loadAccumulator.a ||
            !isConstantValue(normalize.b, constants, 0) ||
            updateCounter.op !== Opcode.MOVE || updateCounter.dst === NO_SLOT ||
            updateCounter.a !== loadCounter.a ||
            one.op !== Opcode.MOVE || !isConstantValue(one.a, constants, 1) ||
            increment.op !== Opcode.SUPER_BINARY_STORE || increment.flags !== Opcode.ADD_CONST ||
            !isLocal(increment.a, updateCounter.dst) || increment.c !== loadCounter.a ||
            !isConstantValue(increment.b, constants, 1) ||
            backJump.op !== Opcode.JUMP || backJump.c !== functionStart + start) {
            continue;
        }
        if (updateCounter.dst > 0xff || loadAccumulator.dst > 0xff) {
            continue;
        }
        let hasInteriorTarget = false;
        segment.forEach((item) => {
            if ((item.op === Opcode.JUMP || item.op === Opcode.JUMP_IF_TRUE ||
                item.op === Opcode.JUMP_IF_FALSE) && item.c > functionStart + start &&
                item.c <= functionStart + start + 12) {
                hasInteriorTarget = true;
            }
        });
        if (hasInteriorTarget) {
            continue;
        }
        const kernel = instruction(Opcode.LOOP_ACCUMULATE, loadAccumulator.dst, loadCounter.a, loadLimit.a, loadAccumulator.a);
        kernel.flags = loadCounter.dst;
        return { start, end: start + 12, instruction: kernel };
    }
    return undefined;
};
const applyLoopKernels = (program) => {
    const oldInstructions = program.instructions;
    const oldFunctions = program.functions;
    const remappedAddresses = new Map();
    const rebuiltInstructions = [];
    const rebuiltFunctions = [];
    oldFunctions.forEach((meta) => {
        const segment = oldInstructions.slice(meta.start, meta.start + meta.length);
        const candidate = findLoopKernel(segment, meta.start, program.constants);
        const localMap = new Array(segment.length + 1);
        const output = [];
        let index = 0;
        while (index < segment.length) {
            localMap[index] = output.length;
            if (candidate && index === candidate.start) {
                for (let consumed = candidate.start + 1; consumed <= candidate.end; consumed++) {
                    localMap[consumed] = output.length;
                }
                output.push(candidate.instruction);
                index = candidate.end + 1;
            }
            else {
                output.push(segment[index]);
                index++;
            }
        }
        localMap[segment.length] = output.length;
        const newStart = rebuiltInstructions.length;
        for (let i = 0; i <= segment.length; i++) {
            remappedAddresses.set(meta.start + i, newStart + localMap[i]);
        }
        output.forEach((item) => { rebuiltInstructions.push(item); });
        rebuiltFunctions.push(Object.assign(Object.assign({}, meta), { start: newStart, length: output.length }));
    });
    rebuiltInstructions.forEach((item) => {
        if (item.op === Opcode.JUMP || item.op === Opcode.JUMP_IF_TRUE ||
            item.op === Opcode.JUMP_IF_FALSE) {
            const target = remappedAddresses.get(item.c);
            if (target === undefined) {
                throw new Error(`Invalid bytecode jump target ${item.c}`);
            }
            item.c = target;
        }
    });
    program.instructions = rebuiltInstructions;
    program.functions = rebuiltFunctions;
};
exports.compileProgramFromJavaScript = (source) => {
    return exports.compileProgramFromAssembly(codegen_1.generateAssemblyFromJs(source));
};
exports.compileProgramFromAssembly = (assembly) => {
    const parsed = parser_1.parseAssembler(assembly);
    const functionIndexes = new Map();
    parsed.forEach((func, index) => { functionIndexes.set(func.functionName, index); });
    const globalNames = [];
    const globalSet = new Set();
    const main = parsed.find((func) => func.functionName === '@@main') || parsed[0];
    for (const code of main.instructions) {
        if (code[0] === 'GLOBAL_BIND' && !globalSet.has(code[1])) {
            globalSet.add(code[1]);
            globalNames.push(code[1]);
        }
    }
    const globalIndexes = new Map();
    globalNames.forEach((name, index) => { globalIndexes.set(name, index); });
    const constantTable = makeConstantTable();
    constantTable.get(void 0);
    const callSites = [];
    const compileFunctions = parsed.map(buildFunctionLocals);
    compileFunctions.forEach((func) => {
        lowerFunction(func, functionIndexes, globalIndexes, constantTable, callSites);
    });
    const instructions = [];
    const functions = [];
    compileFunctions.forEach((func) => {
        const start = instructions.length;
        func.instructions.forEach((item) => { instructions.push(item); });
        functions.push({
            start,
            length: func.instructions.length,
            numArgs: func.params.length,
            slotCount: func.slotCount,
            flags: func.flags,
        });
    });
    functions.forEach((meta, functionIndex) => {
        const compileFunction = compileFunctions[functionIndex];
        for (let i = 0; i < meta.length; i++) {
            const item = instructions[meta.start + i];
            if (item.targetLabel) {
                const localTarget = compileFunction.labels[item.targetLabel];
                if (localTarget === undefined) {
                    throw new Error(`Unknown bytecode label ${item.targetLabel}`);
                }
                item.c = meta.start + localTarget;
                delete item.targetLabel;
            }
        }
    });
    const program = {
        version: BYTECODE_VERSION,
        entryFunction: Math.max(0, parsed.findIndex((func) => func.functionName === '@@main')),
        instructions,
        functions,
        constants: constantTable.constants,
        callSites,
        globalNames,
    };
    applyStaticSuperinstructions(program);
    applyLoopKernels(program);
    return program;
};
const INSTRUCTION_WORDS = 4;
const packInstructions = (instructions) => {
    const packed = new Uint32Array(instructions.length * INSTRUCTION_WORDS);
    instructions.forEach((item, index) => {
        const offset = index * INSTRUCTION_WORDS;
        packed[offset] = (item.op | (item.flags << 8) | (item.dst << 16)) >>> 0;
        packed[offset + 1] = item.a >>> 0;
        packed[offset + 2] = item.b >>> 0;
        packed[offset + 3] = item.c >>> 0;
    });
    return packed;
};
const isGuestFunction = (value) => {
    return !!value && typeof value === 'object' && typeof value.__guestFunction === 'number';
};
class VirtualMachine {
    constructor(program, ctx = {}) {
        this.program = program;
        this.ctx = ctx;
        this.isRunning = false;
        this.stats = {
            callCacheHits: 0,
            loopKernelHits: 0,
            numericFastPathHits: 0,
            propertyCacheHits: 0,
        };
        this.frames = [];
        this.hostFunctions = new Map();
        this.guestFunctions = new Map();
        this.callCaches = new Map();
        this.propertyCaches = new Map();
        this.typedFallbacks = new Map();
        this.vmObjects = new WeakSet();
        this.packedCode = packInstructions(program.instructions);
        this.globals = new Array(program.globalNames.length);
        program.globalNames.forEach((name, index) => {
            if (!Object.prototype.hasOwnProperty.call(ctx, name)) {
                Object.defineProperty(ctx, name, {
                    configurable: false,
                    enumerable: true,
                    get: () => this.toHostValue(this.globals[index]),
                    set: (value) => { this.globals[index] = this.fromHostValue(value); },
                });
            }
        });
        this.frame = {
            functionIndex: program.entryFunction,
            ip: program.functions[program.entryFunction].start,
            slots: new Array(program.functions[program.entryFunction].slotCount),
            returnValue: undefined,
            thisValue: ctx,
        };
    }
    reset() {
        const entry = this.program.functions[this.program.entryFunction];
        this.frames.length = 0;
        this.globals.fill(undefined);
        this.frame = {
            functionIndex: this.program.entryFunction,
            ip: entry.start,
            slots: new Array(entry.slotCount),
            returnValue: undefined,
            thisValue: this.ctx,
        };
        this.returnValue = undefined;
        this.result = undefined;
        this.isRunning = false;
        this.callCaches.clear();
        this.propertyCaches.clear();
        this.stats.callCacheHits = 0;
        this.stats.loopKernelHits = 0;
        this.stats.numericFastPathHits = 0;
        this.stats.propertyCacheHits = 0;
    }
    run() {
        this.isRunning = true;
        this.propertyCaches.clear();
        while (this.isRunning) {
            this.executeOne();
        }
        return this.result;
    }
    toHostValue(value) {
        if (isGuestFunction(value)) {
            const functionIndex = value.__guestFunction;
            const existing = this.guestFunctions.get(functionIndex);
            if (existing) {
                return existing;
            }
            const callable = (...args) => this.callFromHost(functionIndex, this.ctx, args);
            this.hostFunctions.set(callable, functionIndex);
            this.guestFunctions.set(functionIndex, callable);
            return callable;
        }
        return value;
    }
    fromHostValue(value) {
        const functionIndex = typeof value === 'function' ? this.hostFunctions.get(value) : undefined;
        return functionIndex === undefined ? value : { __guestFunction: functionIndex };
    }
    callFromHost(functionIndex, receiver, args) {
        const oldFrame = this.frame;
        this.propertyCaches.clear();
        this.pushFrame(functionIndex, args, receiver, undefined);
        this.isRunning = true;
        while (this.frames.length > 0) {
            this.executeOne();
        }
        this.frame = oldFrame;
        this.propertyCaches.clear();
        return this.returnValue;
    }
    pushFrame(functionIndex, args, receiver, returnTarget) {
        this.frames.push(this.frame);
        const meta = this.program.functions[functionIndex];
        const slots = new Array(meta.slotCount);
        for (let i = 0; i < meta.numArgs; i++) {
            slots[i] = args[i];
        }
        this.frame = {
            functionIndex,
            ip: meta.start,
            slots,
            returnValue: returnTarget,
            thisValue: receiver,
        };
    }
    popFrame() {
        const completed = this.frame;
        const caller = this.frames.pop();
        if (!caller) {
            this.result = this.returnValue;
            this.isRunning = false;
            return;
        }
        this.frame = caller;
        if (completed.returnValue !== undefined && completed.returnValue !== NO_SLOT) {
            this.setRef(completed.returnValue, this.returnValue);
        }
    }
    getRef(value) {
        switch (refKind(value)) {
            case REF_LOCAL: return this.frame.slots[refIndex(value)];
            case REF_CONSTANT: return this.program.constants[refIndex(value)];
            case REF_GLOBAL: return this.globals[refIndex(value)];
            case REF_RETURN: return this.returnValue;
            default: return undefined;
        }
    }
    setRef(target, value) {
        switch (refKind(target)) {
            case REF_LOCAL:
                this.frame.slots[refIndex(target)] = value;
                return;
            case REF_GLOBAL:
                this.globals[refIndex(target)] = this.fromHostValue(value);
                return;
            case REF_RETURN:
                this.returnValue = value;
                return;
            default: throw new Error('Invalid bytecode destination');
        }
    }
    isCacheablePropertyKey(key) {
        const type = typeof key;
        return (type === 'string' || type === 'number' || type === 'symbol') && key === key;
    }
    isCacheablePropertyObject(object) {
        if (object === null || (typeof object !== 'object' && typeof object !== 'function')) {
            return false;
        }
        if (!this.vmObjects.has(object)) {
            return false;
        }
        const prototype = Object.getPrototypeOf(object);
        return prototype === Object.prototype || prototype === null;
    }
    getProperty(object, key, instructionIp) {
        if (!this.isCacheablePropertyKey(key) || !this.isCacheablePropertyObject(object)) {
            return object[key];
        }
        const prototype = Object.getPrototypeOf(object);
        const cached = this.propertyCaches.get(instructionIp);
        if (cached && cached.object === object && cached.key === key && cached.prototype === prototype) {
            this.stats.propertyCacheHits++;
            return cached.value;
        }
        const value = object[key];
        const descriptor = Object.getOwnPropertyDescriptor(object, key);
        if (descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
            this.propertyCaches.set(instructionIp, { object, key, prototype, value });
        }
        return value;
    }
    setProperty(object, key, value) {
        Reflect.set(object, key, value);
        let refreshed = false;
        this.propertyCaches.forEach((cached) => {
            if (cached.object === object && cached.key === key) {
                cached.value = object[key];
                refreshed = true;
            }
        });
        if (refreshed) {
            return;
        }
        this.propertyCaches.clear();
    }
    invokeHostFunction(fn, receiver, args, isNewExpression) {
        if (isNewExpression) {
            return new fn(...args);
        }
        return Reflect.apply(fn, receiver === void 0 ? void 0 : receiver, args);
    }
    executeBinary(op, left, right) {
        switch (op) {
            case Opcode.ADD:
            case Opcode.ADD_CONST: return left + right;
            case Opcode.SUB:
            case Opcode.SUB_CONST: return left - right;
            case Opcode.MUL:
            case Opcode.MUL_CONST: return left * right;
            case Opcode.DIV:
            case Opcode.DIV_CONST: return left / right;
            case Opcode.MOD:
            case Opcode.MOD_CONST: return left % right;
            case Opcode.OR:
            case Opcode.OR_CONST: return left | right;
            case Opcode.AND:
            case Opcode.AND_CONST: return left & right;
            case Opcode.XOR:
            case Opcode.XOR_CONST: return left ^ right;
            case Opcode.SHL:
            case Opcode.SHL_CONST: return left << right;
            case Opcode.SHR:
            case Opcode.SHR_CONST: return left >> right;
            case Opcode.ZSHR:
            case Opcode.ZSHR_CONST: return left >>> right;
            case Opcode.LT:
            case Opcode.LT_CONST: return left < right;
            case Opcode.GT:
            case Opcode.GT_CONST: return left > right;
            case Opcode.EQ:
            case Opcode.EQ_CONST: return left === right;
            case Opcode.NE:
            case Opcode.NE_CONST: return left !== right;
            case Opcode.LE:
            case Opcode.LE_CONST: return left <= right;
            case Opcode.GE:
            case Opcode.GE_CONST: return left >= right;
            case Opcode.WEQ:
            case Opcode.WEQ_CONST: return left == right;
            case Opcode.WNE:
            case Opcode.WNE_CONST: return left != right;
            default: throw new Error(`Unsupported binary opcode ${op}`);
        }
    }
    executeI32Binary(op, left, right) {
        switch (op) {
            case Opcode.ADD_I32: return left + right;
            case Opcode.SUB_I32: return left - right;
            case Opcode.MUL_I32: return left * right;
            case Opcode.MOD_I32: return left % right;
            case Opcode.OR_I32: return left | right;
            case Opcode.AND_I32: return left & right;
            case Opcode.XOR_I32: return left ^ right;
            case Opcode.SHL_I32: return left << right;
            case Opcode.SHR_I32: return left >> right;
            case Opcode.ZSHR_I32: return left >>> right;
            case Opcode.LT_I32: return left < right;
            case Opcode.GT_I32: return left > right;
            case Opcode.EQ_I32: return left === right;
            case Opcode.NE_I32: return left !== right;
            case Opcode.LE_I32: return left <= right;
            case Opcode.GE_I32: return left >= right;
            case Opcode.WEQ_I32: return left == right;
            case Opcode.WNE_I32: return left != right;
            default: return this.executeBinary(op, left, right);
        }
    }
    executeBinaryFast(op, left, right) {
        if (isInt32Value(left) && isInt32Value(right)) {
            const specialized = i32OpcodeFor(op);
            if (specialized !== undefined) {
                this.stats.numericFastPathHits++;
                return this.executeI32Binary(specialized, left, right);
            }
        }
        return this.executeBinary(op, left, right);
    }
    executeAdaptiveBinary(op, left, right, offset, packed, inFlags) {
        if (isI32Opcode(op)) {
            if (isInt32Value(left) && isInt32Value(right)) {
                this.stats.numericFastPathHits++;
                return this.executeI32Binary(op, left, right);
            }
            const fallback = this.typedFallbacks.get(offset);
            const original = fallback ? fallback.opcode : genericOpcodeForI32(op);
            if (inFlags) {
                this.packedCode[offset] = ((packed & 0xffff00ff) | (original << 8)) >>> 0;
            }
            else {
                this.packedCode[offset] = ((packed & 0xffffff00) | original) >>> 0;
            }
            this.typedFallbacks.delete(offset);
            return this.executeBinary(original, left, right);
        }
        const specialized = i32OpcodeFor(op);
        if (specialized !== undefined && isInt32Value(left) && isInt32Value(right)) {
            if (inFlags) {
                this.packedCode[offset] = ((packed & 0xffff00ff) | (specialized << 8)) >>> 0;
            }
            else {
                this.packedCode[offset] = ((packed & 0xffffff00) | specialized) >>> 0;
            }
            this.typedFallbacks.set(offset, { opcode: op, inFlags });
            return this.executeI32Binary(specialized, left, right);
        }
        return this.executeBinary(op, left, right);
    }
    executeOne() {
        const frame = this.frame;
        const meta = this.program.functions[frame.functionIndex];
        if (frame.ip >= meta.start + meta.length) {
            this.returnValue = frame.returnValue;
            this.popFrame();
            return;
        }
        const offset = frame.ip++ * INSTRUCTION_WORDS;
        const packed = this.packedCode[offset];
        const op = packed & 0xff;
        const flags = (packed >>> 8) & 0xff;
        const dst = packed >>> 16;
        const a = this.packedCode[offset + 1];
        const b = this.packedCode[offset + 2];
        const c = this.packedCode[offset + 3];
        switch (op) {
            case Opcode.NOP:
                return;
            case Opcode.MOVE:
                frame.slots[dst] = this.getRef(a);
                return;
            case Opcode.SET_GLOBAL:
                this.globals[a] = this.fromHostValue(this.getRef(b));
                return;
            case Opcode.SET_RETURN:
                this.returnValue = this.getRef(a);
                return;
            case Opcode.LOAD_CTX:
                frame.slots[dst] = this.ctx[this.getRef(a)];
                return;
            case Opcode.SET_CTX:
                this.ctx[this.getRef(a)] = this.toHostValue(this.getRef(b));
                return;
            case Opcode.ADD:
            case Opcode.SUB:
            case Opcode.MUL:
            case Opcode.DIV:
            case Opcode.MOD:
            case Opcode.OR:
            case Opcode.AND:
            case Opcode.XOR:
            case Opcode.SHL:
            case Opcode.SHR:
            case Opcode.ZSHR:
            case Opcode.LT:
            case Opcode.GT:
            case Opcode.EQ:
            case Opcode.NE:
            case Opcode.LE:
            case Opcode.GE:
            case Opcode.WEQ:
            case Opcode.WNE:
            case Opcode.ADD_CONST:
            case Opcode.SUB_CONST:
            case Opcode.MUL_CONST:
            case Opcode.DIV_CONST:
            case Opcode.MOD_CONST:
            case Opcode.OR_CONST:
            case Opcode.AND_CONST:
            case Opcode.XOR_CONST:
            case Opcode.SHL_CONST:
            case Opcode.SHR_CONST:
            case Opcode.ZSHR_CONST:
            case Opcode.LT_CONST:
            case Opcode.GT_CONST:
            case Opcode.EQ_CONST:
            case Opcode.NE_CONST:
            case Opcode.LE_CONST:
            case Opcode.GE_CONST:
            case Opcode.WEQ_CONST:
            case Opcode.WNE_CONST:
                frame.slots[dst] = this.executeBinary(op, this.getRef(a), this.getRef(b));
                return;
            case Opcode.ADD_I32:
            case Opcode.SUB_I32:
            case Opcode.MUL_I32:
            case Opcode.MOD_I32:
            case Opcode.OR_I32:
            case Opcode.AND_I32:
            case Opcode.XOR_I32:
            case Opcode.SHL_I32:
            case Opcode.SHR_I32:
            case Opcode.ZSHR_I32:
            case Opcode.LT_I32:
            case Opcode.GT_I32:
            case Opcode.EQ_I32:
            case Opcode.NE_I32:
            case Opcode.LE_I32:
            case Opcode.GE_I32:
            case Opcode.WEQ_I32:
            case Opcode.WNE_I32:
                frame.slots[dst] = this.executeAdaptiveBinary(op, this.getRef(a), this.getRef(b), offset, packed, false);
                return;
            case Opcode.SUPER_ADD_STORE: {
                this.setRef(c, this.getRef(a) + this.getRef(b));
                return;
            }
            case Opcode.SUPER_BINARY_STORE: {
                const value = this.executeBinaryFast(flags, this.getRef(a), this.getRef(b));
                this.setRef(c, value);
                return;
            }
            case Opcode.LOOP_ACCUMULATE: {
                let counter = this.getRef(a);
                const limit = this.getRef(b);
                let accumulator = this.getRef(c);
                while (counter < limit) {
                    accumulator = (accumulator + counter) | 0;
                    counter = counter + 1;
                }
                this.setRef(c, accumulator);
                this.setRef(a, counter);
                frame.slots[dst] = accumulator;
                frame.slots[flags] = counter;
                if (refKind(a) === REF_LOCAL) {
                    frame.slots[refIndex(a)] = counter;
                }
                this.stats.loopKernelHits++;
                return;
            }
            case Opcode.GET_PROP:
                frame.slots[dst] = this.getProperty(this.getRef(a), this.getRef(b), frame.ip - 1);
                return;
            case Opcode.SET_PROP:
                this.setProperty(this.getRef(a), this.getRef(b), this.getRef(c));
                return;
            case Opcode.DEF_DATA:
                Object.defineProperty(this.getRef(a), this.getRef(b), {
                    configurable: true,
                    enumerable: true,
                    value: this.getRef(c),
                    writable: true,
                });
                this.propertyCaches.clear();
                return;
            case Opcode.NEW_OBJ:
                frame.slots[dst] = {};
                this.vmObjects.add(frame.slots[dst]);
                return;
            case Opcode.NEW_ARR:
                frame.slots[dst] = [];
                this.vmObjects.add(frame.slots[dst]);
                return;
            case Opcode.MAKE_FUNC:
                frame.slots[dst] = { __guestFunction: c };
                return;
            case Opcode.MAKE_FUNC_GLOBAL:
                this.globals[a] = { __guestFunction: c };
                return;
            case Opcode.MAKE_FUNC_RETURN:
                this.returnValue = { __guestFunction: c };
                return;
            case Opcode.JUMP:
                frame.ip = c;
                return;
            case Opcode.JUMP_IF_TRUE:
                if (this.getRef(a)) {
                    frame.ip = c;
                }
                return;
            case Opcode.JUMP_IF_FALSE:
                if (!this.getRef(a)) {
                    frame.ip = c;
                }
                return;
            case Opcode.CALL: {
                const fn = this.getRef(a);
                const receiver = this.getRef(b);
                const callSite = this.program.callSites[c];
                const instructionIp = frame.ip - 1;
                let cache = this.callCaches.get(instructionIp);
                if (!cache || cache.functionValue !== fn || cache.args.length !== callSite.args.length) {
                    cache = {
                        functionValue: fn,
                        functionIndex: isGuestFunction(fn) ? fn.__guestFunction : undefined,
                        args: new Array(callSite.args.length),
                    };
                    this.callCaches.set(instructionIp, cache);
                }
                else {
                    this.stats.callCacheHits++;
                }
                for (let i = 0; i < callSite.args.length; i++) {
                    cache.args[i] = this.getRef(callSite.args[i]);
                }
                const args = cache.args;
                const functionIndex = cache.functionIndex;
                if (functionIndex !== undefined) {
                    this.pushFrame(functionIndex, args, receiver, NO_SLOT);
                    return;
                }
                if (typeof fn !== 'function') {
                    throw new TypeError('Value is not a function');
                }
                this.returnValue = this.invokeHostFunction(fn, receiver, args, callSite.isNewExpression);
                this.propertyCaches.clear();
                return;
            }
            case Opcode.RETURN:
                this.returnValue = this.getRef(a);
                this.popFrame();
                return;
            case Opcode.EXIT:
                this.result = this.returnValue;
                this.isRunning = false;
                return;
            default:
                throw new Error(`Unknown bytecode opcode ${op}`);
        }
    }
}
exports.VirtualMachine = VirtualMachine;
const writeStringData = (strings) => {
    const sizes = strings.map((value) => 4 + value.length * 2);
    const data = new Uint8Array(sizes.reduce((sum, size) => sum + size, 0));
    const view = new DataView(data.buffer);
    const offsets = [];
    let offset = 0;
    strings.forEach((value) => {
        offsets.push(offset);
        view.setUint32(offset, value.length, true);
        for (let i = 0; i < value.length; i++) {
            view.setUint16(offset + 4 + i * 2, value.charCodeAt(i), true);
        }
        offset += 4 + value.length * 2;
    });
    return { data, offsets };
};
const collectStrings = (program) => {
    const values = [];
    const indexes = new Map();
    const add = (value) => {
        const existing = indexes.get(value);
        if (existing !== undefined) {
            return existing;
        }
        const index = values.length;
        values.push(value);
        indexes.set(value, index);
        return index;
    };
    program.constants.forEach((value) => { if (typeof value === 'string') {
        add(value);
    } });
    program.globalNames.forEach(add);
    return { values, indexes };
};
exports.serializeProgram = (program) => {
    const strings = collectStrings(program);
    const stringData = writeStringData(strings.values);
    const headerBytes = HEADER_WORDS * 4;
    const functionOffset = headerBytes;
    const functionBytes = program.functions.length * FUNCTION_WORDS * 4;
    const constantOffset = functionOffset + functionBytes;
    const constantBytes = program.constants.length * CONSTANT_WORDS * 4;
    const callSiteOffset = constantOffset + constantBytes;
    const callSiteBytes = program.callSites.reduce((size, site) => size + 16 + site.args.length * 4, 0);
    const globalNameOffset = callSiteOffset + callSiteBytes;
    const globalNameBytes = program.globalNames.length * 4;
    const codeOffset = globalNameOffset + globalNameBytes;
    const codeBytes = program.instructions.length * 16;
    const stringOffset = codeOffset + codeBytes;
    const output = new ArrayBuffer(stringOffset + stringData.data.byteLength);
    const view = new DataView(output);
    const header = [
        BYTECODE_MAGIC, BYTECODE_VERSION, program.entryFunction, program.functions.length,
        program.instructions.length, program.constants.length, program.callSites.length,
        program.globalNames.length, functionOffset, constantOffset, callSiteOffset,
        globalNameOffset, codeOffset, stringOffset, stringData.data.byteLength,
    ];
    header.forEach((value, index) => view.setUint32(index * 4, value >>> 0, true));
    program.functions.forEach((meta, index) => {
        const offset = functionOffset + index * FUNCTION_WORDS * 4;
        [meta.start, meta.length, meta.numArgs, meta.slotCount, meta.flags, 0xffffffff]
            .forEach((value, word) => view.setUint32(offset + word * 4, value >>> 0, true));
    });
    program.constants.forEach((value, index) => {
        const offset = constantOffset + index * CONSTANT_WORDS * 4;
        if (value === undefined) {
            view.setUint32(offset, 0, true);
        }
        else if (value === null) {
            view.setUint32(offset, 1, true);
        }
        else if (typeof value === 'boolean') {
            view.setUint32(offset, 2, true);
            view.setUint32(offset + 4, value ? 1 : 0, true);
        }
        else if (typeof value === 'number') {
            view.setUint32(offset, 3, true);
            view.setFloat64(offset + 4, value, true);
        }
        else if (typeof value === 'string') {
            view.setUint32(offset, 4, true);
            const stringIndex = strings.indexes.get(value);
            view.setUint32(offset + 4, stringData.offsets[stringIndex], true);
            view.setUint32(offset + 8, value.length, true);
        }
        else {
            throw new Error(`Cannot serialize bytecode constant ${typeof value}`);
        }
    });
    let callOffset = callSiteOffset;
    program.callSites.forEach((site) => {
        view.setUint32(callOffset, site.args.length, true);
        view.setUint32(callOffset + 4, site.isNewExpression ? 1 : 0, true);
        view.setUint32(callOffset + 8, 16, true);
        view.setUint32(callOffset + 12, 0, true);
        site.args.forEach((arg, index) => view.setUint32(callOffset + 16 + index * 4, arg >>> 0, true));
        callOffset += 16 + site.args.length * 4;
    });
    program.globalNames.forEach((name, index) => {
        const stringIndex = strings.indexes.get(name);
        view.setUint32(globalNameOffset + index * 4, stringData.offsets[stringIndex], true);
    });
    program.instructions.forEach((item, index) => {
        const offset = codeOffset + index * 16;
        view.setUint32(offset, (item.op | (item.flags << 8) | (item.dst << 16)) >>> 0, true);
        view.setUint32(offset + 4, item.a >>> 0, true);
        view.setUint32(offset + 8, item.b >>> 0, true);
        view.setUint32(offset + 12, item.c >>> 0, true);
    });
    new Uint8Array(output, stringOffset).set(stringData.data);
    return output;
};
exports.deserializeProgram = (buffer) => {
    const view = new DataView(buffer);
    if (view.getUint32(0, true) !== BYTECODE_MAGIC) {
        throw new Error('Not a NestScript bytecode buffer');
    }
    if (view.getUint32(4, true) !== BYTECODE_VERSION) {
        throw new Error('Unsupported NestScript bytecode version');
    }
    const entryFunction = view.getUint32(8, true);
    const functionCount = view.getUint32(12, true);
    const instructionCount = view.getUint32(16, true);
    const constantCount = view.getUint32(20, true);
    const callSiteCount = view.getUint32(24, true);
    const globalCount = view.getUint32(28, true);
    const functionOffset = view.getUint32(32, true);
    const constantOffset = view.getUint32(36, true);
    const callSiteOffset = view.getUint32(40, true);
    const globalNameOffset = view.getUint32(44, true);
    const codeOffset = view.getUint32(48, true);
    const stringOffset = view.getUint32(52, true);
    const readString = (index) => {
        const start = stringOffset + index;
        const length = view.getUint32(start, true);
        let result = '';
        for (let i = 0; i < length; i++) {
            result += String.fromCharCode(view.getUint16(start + 4 + i * 2, true));
        }
        return result;
    };
    const functions = [];
    for (let i = 0; i < functionCount; i++) {
        const offset = functionOffset + i * FUNCTION_WORDS * 4;
        functions.push({
            start: view.getUint32(offset, true),
            length: view.getUint32(offset + 4, true),
            numArgs: view.getUint32(offset + 8, true),
            slotCount: view.getUint32(offset + 12, true),
            flags: view.getUint32(offset + 16, true),
        });
    }
    const constants = [];
    for (let i = 0; i < constantCount; i++) {
        const offset = constantOffset + i * CONSTANT_WORDS * 4;
        const kind = view.getUint32(offset, true);
        if (kind === 0)
            constants.push(undefined);
        else if (kind === 1)
            constants.push(null);
        else if (kind === 2)
            constants.push(view.getUint32(offset + 4, true) !== 0);
        else if (kind === 3)
            constants.push(view.getFloat64(offset + 4, true));
        else if (kind === 4)
            constants.push(readString(view.getUint32(offset + 4, true)));
        else
            throw new Error(`Unknown bytecode constant kind ${kind}`);
    }
    const callSites = [];
    let callOffset = callSiteOffset;
    for (let i = 0; i < callSiteCount; i++) {
        const argc = view.getUint32(callOffset, true);
        const args = [];
        for (let j = 0; j < argc; j++)
            args.push(view.getUint32(callOffset + 16 + j * 4, true));
        callSites.push({ args, isNewExpression: view.getUint32(callOffset + 4, true) !== 0 });
        callOffset += 16 + argc * 4;
    }
    const globalNames = [];
    for (let i = 0; i < globalCount; i++) {
        const stringDataOffset = view.getUint32(globalNameOffset + i * 4, true);
        globalNames.push(readString(stringDataOffset));
    }
    const instructions = [];
    for (let i = 0; i < instructionCount; i++) {
        const offset = codeOffset + i * 16;
        const packed = view.getUint32(offset, true);
        instructions.push({
            op: packed & 0xff,
            flags: (packed >>> 8) & 0xff,
            dst: packed >>> 16,
            a: view.getUint32(offset + 4, true),
            b: view.getUint32(offset + 8, true),
            c: view.getUint32(offset + 12, true),
        });
    }
    return { version: BYTECODE_VERSION, entryFunction, instructions, functions, constants, callSites, globalNames };
};
exports.createVMFromArrayBuffer = (buffer, ctx = {}) => {
    return new VirtualMachine(exports.deserializeProgram(buffer), ctx);
};
exports.createVMFromJavaScript = (source, ctx = {}) => {
    return new VirtualMachine(exports.compileProgramFromJavaScript(source), ctx);
};


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateAssemblyFromJs = void 0;
const acorn = __webpack_require__(2);
const walk = __webpack_require__(3);
const priority_queue_1 = __webpack_require__(4);
const block_chain_1 = __webpack_require__(5);
const codeMap = {
    '<': 'LT',
    '>': 'GT',
    '===': 'EQ',
    '!==': 'NE',
    '==': 'WEQ',
    '!=': 'WNE',
    '<=': 'LE',
    '>=': 'GE',
    '+': 'ADD',
    '-': 'SUB',
    '*': 'MUL',
    '/': 'DIV',
    '%': 'MOD',
    '&': 'AND',
    '|': 'OR',
    '^': 'XOR',
    '<<': 'SHL',
    '>>': 'SHR',
    '>>>': 'ZSHR',
    "in": "IN",
    'instanceof': 'INST_OF',
};
class Codegen {
    parse(code) {
        return acorn.parse(code, { ecmaVersion: 2020 });
    }
}
const functionBodyUsesArguments = (body) => {
    let found = false;
    walk.recursive(body, null, {
        Identifier(node) {
            if (node.name === 'arguments') {
                found = true;
            }
        },
        FunctionDeclaration() { },
        FunctionExpression() { },
        ArrowFunctionExpression(node, s, c) {
            c(node.body, s);
        },
    });
    return found;
};
const getVariablesByFunctionAstBody = (ast) => {
    const locals = new Map();
    walk.recursive(ast, locals, {
        VariableDeclaration: (node, s, c) => {
            s.varKind = node.kind;
            node.declarations.forEach((n) => c(n, s));
            delete s.varKind;
        },
        VariableDeclarator: (node, s, c) => {
            const kind = s.varKind;
            if (node.id.type === 'Identifier') {
                if (kind === 'var') {
                    if (locals.get(node.id.name) !== 1) {
                        locals.set(node.id.name, 2);
                    }
                }
            }
            else {
                throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id);
            }
        },
        FunctionDeclaration(node, s, c) {
            if (node.id) {
                locals.set(node.id.name, 1);
            }
        },
        FunctionExpression() {
        },
        ArrowFunctionExpression() {
        },
    });
    return locals;
};
const codegen = new Codegen();
let state;
const createNewState = () => {
    return {
        tmpVariableName: '',
        isGlobal: true,
        currentScope: {
            funcName: '',
            closureTable: new Map(),
            closureCounter: 0,
        },
        scopes: [],
        labelIndex: 0,
        functionIndex: 0,
        functions: [],
        functionTable: {},
        funcName: '',
        codes: new priority_queue_1.CategoriesPriorityQueue(),
        r0: '',
        r1: '',
        r2: '',
        maxRegister: 0,
        currentFunctionName: '',
        blockChain: new block_chain_1.BlockChain([]),
        currentStrict: false,
        withDepth: 0,
    };
};
const hasUseStrictDirective = (body) => {
    return body.body.some((statement) => statement.directive === 'use strict');
};
const parseToCode = (ast) => {
    const newFunctionName = () => {
        state.currentFunctionName = `@@f${state.functionIndex++}`;
        return state.currentFunctionName;
    };
    const parseFunc = (node, s, prior) => {
        var _a;
        const retReg = s.r0;
        const originalFunctionName = (_a = node.id) === null || _a === void 0 ? void 0 : _a.name;
        const isFuntionExpression = node.type === 'FunctionExpression';
        if (originalFunctionName && !isFuntionExpression) {
            declareVariable(s, originalFunctionName, 'var', true);
        }
        const funcName = newFunctionName();
        s.blockChain.newGlobal(funcName, 1);
        s.functions.push({
            name: funcName,
            body: node,
            kind: node.type === 'ArrowFunctionExpression' ? 'arrow' : 'normal',
            strict: s.currentStrict ||
                (node.body.type === 'BlockStatement' && hasUseStrictDirective(node.body)),
            withDepth: s.withDepth,
            usesArguments: functionBodyUsesArguments(node.body),
            blockChain: s.blockChain.newFuncBlock(),
            prepare() {
                const funcBlock = s.blockChain.getCurrentBlock();
                const isBlockHasSameName = funcBlock.variables.has(originalFunctionName) ||
                    funcBlock.params.has(originalFunctionName);
                if (isFuntionExpression && originalFunctionName && !isBlockHasSameName) {
                    declareVariable(s, originalFunctionName, 'var');
                    cg([`FUNC`, `${originalFunctionName}`, `${funcName}`], { prior });
                }
            },
        });
        s.functionTable[funcName] = node;
        if (retReg) {
            cg([`FUNC`, `${retReg}`, `${funcName}`], { prior });
        }
        if (originalFunctionName && !isFuntionExpression) {
            cg([`FUNC`, `${originalFunctionName}`, `${funcName}`], { prior });
        }
        delete s.funcName;
        return funcName;
    };
    let registerCounter = 0;
    let maxRegister = 0;
    const newLabelName = () => `_l${state.labelIndex++}_`;
    const newRegister = () => {
        const r = `%r${registerCounter++}`;
        maxRegister = Math.max(maxRegister, registerCounter);
        return r;
    };
    const freeRegister = () => {
        state.r0 = null;
        return registerCounter--;
    };
    const newRegisterController = () => {
        let count = 0;
        return [() => {
                count++;
                return newRegister();
            }, () => {
                state.r0 = null;
                for (let i = 0; i < count; i++) {
                    freeRegister();
                }
            }];
    };
    const cg = (ops, { prior, isForceBlock } = {}) => {
        let operator = ops[0];
        if (!operator || operator === 'undefined') {
            throw new Error('Operator cannot be ' + operator);
        }
        const operants = ops.slice(1);
        if (operator === 'MOV' && ops[1] === 'undefined') {
            throw new Error('First operant of MOV cannot be undefined');
        }
        const blockChain = state.blockChain;
        operants.forEach((o) => {
            if (typeof o === 'string') {
                blockChain.accessName(o);
            }
        });
        let priority;
        if (prior === void 0) {
            if ('ALLOC' === operator) {
                priority = 3;
            }
            else {
                priority = 100;
            }
        }
        else {
            priority = prior;
        }
        const currentBlock = blockChain.getCurrentBlock();
        return state.codes.push(() => {
            if (['BLOCK', 'END_BLOCK', 'CLR_BLOCK'].includes(operator) &&
                currentBlock.variables.size === 0 &&
                !(currentBlock.isForceBlock || isForceBlock)) {
                return [];
            }
            if (typeof operator === 'function') {
                operator = operator();
            }
            const processedOps = operants.map((o) => {
                if (typeof o === 'function') {
                    o = o();
                }
                return blockChain.getName(o);
            });
            const ret = [];
            const pushCode = () => {
                const c = [operator, ...processedOps].join(' ');
                ret.push(c);
            };
            if (['VAR', 'BVAR'].includes(operator) &&
                blockChain.getNameType(operants[0]) === 3) {
                operator = 'CLS';
                pushCode();
            }
            else {
                pushCode();
            }
            return ret;
        }, priority);
    };
    const lg = (label) => {
        return cg([`LABEL ${label}:`]);
    };
    const callIdentifier = (id, numArgs, s, isExpression) => {
        s.blockChain.accessName(id);
        if (s.blockChain.hasName(id)) {
            cg([`CALL_REG`, id, numArgs, isExpression]);
        }
        else {
            cg([`CALL_CTX`, `'${id}'`, numArgs, isExpression]);
        }
    };
    const setValueToNode = (node, reg, s, c) => {
        if (node.type === 'MemberExpression') {
            s.r0 = null;
            const objReg = s.r1 = newRegister();
            const keyReg = s.r2 = newRegister();
            c(node, s);
            cg([`SET_KEY`, objReg, keyReg, reg]);
            freeRegister();
            freeRegister();
        }
        else if (node.type === 'Identifier') {
            if (s.withDepth > 0) {
                const fallbackKind = s.blockChain.getNameType(node.name) === 4
                    ? 2
                    : (s.blockChain.hasName(node.name) ? 1 : 0);
                cg([
                    `WITH_SET`, `"${node.name}"`, `${fallbackKind}`,
                    fallbackKind === 1 ? node.name : 'undefined', reg,
                ]);
            }
            else if (s.blockChain.getNameType(node.name) === 4) {
                cg(['SET_ARGS', reg]);
            }
            else if (s.blockChain.hasName(node.name)) {
                cg([`MOV`, `${node.name}`, `${reg}`]);
            }
            else {
                cg([`SET_CTX`, `"${node.name}"`, `${reg}`]);
            }
        }
        else {
            throw new Error('Unprocessed assignment');
        }
    };
    const getValueOfNode = (node, reg, s, c) => {
        if (node.type === 'Identifier') {
            if (reg) {
                if (s.withDepth > 0) {
                    const fallbackKind = s.blockChain.getNameType(node.name) === 4
                        ? 2
                        : (s.blockChain.hasName(node.name) ? 1 : 0);
                    cg([
                        `WITH_GET`, `${reg}`, `"${node.name}"`, `${fallbackKind}`,
                        fallbackKind === 1 ? node.name : 'undefined',
                    ]);
                }
                else if (s.blockChain.getNameType(node.name) === 4) {
                    cg([`MOV_ARGS`, `${reg}`]);
                }
                else if (s.blockChain.hasName(node.name)) {
                    cg([`MOV`, `${reg}`, `${node.name}`]);
                }
                else {
                    if (node.name === 'arguments') {
                        cg([`MOV_ARGS`, `${reg}`]);
                    }
                    else {
                        cg([`MOV_CTX`, `${reg}`, `"${node.name}"`]);
                    }
                }
            }
        }
        else {
            s.r0 = reg;
            s.r1 = null;
            s.r2 = null;
            c(node, s);
            s.r0 = null;
            s.r1 = null;
            s.r2 = null;
        }
    };
    const declareVariable = (s, name, kind = 'var', isForce = false) => {
        if (kind === 'let' || kind === 'const') {
            if (!s.blockChain.hasOwnName(name)) {
                s.blockChain.newName(name, kind, isForce);
                cg([kind === 'let' ? 'LET' : 'CONST', name], s.blockChain.chain.length === 1 ? { prior: 2 } : {});
            }
            return;
        }
        if (state.isGlobal && ['undefined', 'NaN', 'Infinity'].includes(name)) {
            return;
        }
        if (state.isGlobal) {
            cg([`GLOBAL_BIND`, `${name}`, `"${name}"`], { prior: 1 });
        }
        else {
            const functionBlock = s.blockChain.currentFuncBlock;
            cg([
                `VAR`,
                () => (functionBlock === null || functionBlock === void 0 ? void 0 : functionBlock.variables.get(name)) === 3
                    ? `@${name}`
                    : name,
            ], { prior: 1 });
        }
        s.blockChain.newName(name, kind, isForce);
    };
    const loopLabels = [];
    const pushLoopLabels = (label) => loopLabels.push(label);
    const popLoopLabels = () => loopLabels.pop();
    const getCurrentLoopLabel = () => loopLabels[loopLabels.length - 1];
    const blockEndLabels = new Map();
    const newBlockChain = () => {
        const oldBlockChain = state.blockChain;
        state.blockChain = oldBlockChain.newBlock();
        const blockName = state.blockChain.newBlockName();
        cg(['BLOCK', blockName]);
        const ret = () => {
            cg(['END_BLOCK', blockName]);
            state.blockChain = oldBlockChain;
        };
        ret.blockIndexName = blockName;
        return ret;
    };
    const predeclareLexicalDeclarations = (nodes, s) => {
        nodes.forEach((node) => {
            if (node.type !== 'VariableDeclaration' || node.kind === 'var') {
                return;
            }
            node.declarations.forEach((declaration) => {
                if (declaration.id.type !== 'Identifier') {
                    throw new Error('Unprocessed lexical declaration ' + declaration.id.type);
                }
                declareVariable(s, declaration.id.name, node.kind);
            });
        });
    };
    const evaluateDiscarded = (node, s, c) => {
        if (node.type === 'Identifier' || node.type === 'MemberExpression') {
            const result = newRegister();
            getValueOfNode(node, result, s, c);
            freeRegister();
        }
        else {
            const previousResult = s.r0;
            s.r0 = null;
            c(node, s);
            s.r0 = previousResult;
        }
    };
    walk.recursive(ast, state, {
        Program(node, s, c) {
            predeclareLexicalDeclarations(node.body, s);
            node.body.forEach((n) => c(n, s));
        },
        ExpressionStatement(node, s, c) {
            evaluateDiscarded(node.expression, s, c);
        },
        Identifier: (node, s, c) => {
            if (s.r0) {
                getValueOfNode(node, s.r0, s, c);
            }
        },
        VariableDeclaration: (node, s, c) => {
            s.varKind = node.kind;
            node.declarations.forEach((n) => c(n, s));
            delete s.varKind;
        },
        VariableDeclarator: (node, s, c) => {
            var _a;
            const [newReg, freeReg] = newRegisterController();
            let reg;
            if (node.id.type === 'Identifier') {
                declareVariable(s, node.id.name, s.varKind);
                reg = node.id.name;
            }
            else {
                throw new Error("Unprocessed node.id.type " + node.id.type + " " + node.id);
            }
            const isLexical = s.varKind === 'let' || s.varKind === 'const';
            if (isLexical) {
                const valueReg = newReg();
                if (node.init) {
                    getValueOfNode(node.init, valueReg, s, c);
                }
                else {
                    cg(['MOV', valueReg, 'undefined']);
                }
                cg(['INIT', reg, valueReg]);
            }
            else if (node.init &&
                state.isGlobal &&
                (reg === 'undefined' || reg === 'NaN' || reg === 'Infinity')) {
                const valueReg = newReg();
                getValueOfNode(node.init, valueReg, s, c);
                cg(['SET_CTX', `"${reg}"`, valueReg]);
            }
            else if (node.init &&
                s.blockChain.getNameType(reg) === 4) {
                const valueReg = newReg();
                getValueOfNode(node.init, valueReg, s, c);
                setValueToNode(node.id, valueReg, s, c);
            }
            else if (node.init && s.varKind === 'var' && s.withDepth > 0) {
                const valueReg = newReg();
                getValueOfNode(node.init, valueReg, s, c);
                setValueToNode(node.id, valueReg, s, c);
            }
            else if (node.init) {
                if (((_a = node.init) === null || _a === void 0 ? void 0 : _a.type) === 'Identifier') {
                    getValueOfNode(node.init, reg, s, c);
                }
                else {
                    s.r0 = reg;
                    c(node.init, s);
                }
            }
            freeReg();
            delete s.funcName;
        },
        FunctionDeclaration(node, s, c) {
            if (s.r0 && !state.isGlobal) {
                parseFunc(node, s);
            }
            else {
                parseFunc(node, s, 4);
            }
            s.r0 = null;
        },
        CallExpression(node, s, c) {
            const retReg = s.r0;
            const isNewExpression = !!s.isNewExpression;
            delete s.isNewExpression;
            let calleeReg;
            let thisReg = null;
            if (node.callee.type === 'MemberExpression') {
                calleeReg = newRegister();
                const objReg = newRegister();
                const keyReg = newRegister();
                s.r0 = null;
                s.r1 = objReg;
                s.r2 = keyReg;
                c(node.callee, s);
                cg(['MOV_PROP', calleeReg, objReg, keyReg]);
                thisReg = objReg;
                freeRegister();
            }
            else if (node.callee.type === 'Identifier' && s.withDepth > 0) {
                calleeReg = newRegister();
                thisReg = newRegister();
                const name = node.callee.name;
                const fallbackKind = s.blockChain.getNameType(name) === 4
                    ? 2
                    : (s.blockChain.hasName(name) ? 1 : 0);
                cg([
                    'WITH_RESOLVE', calleeReg, thisReg, `"${name}"`, `${fallbackKind}`,
                    fallbackKind === 1 ? name : 'undefined',
                ]);
            }
            else {
                calleeReg = newRegister();
                getValueOfNode(node.callee, calleeReg, s, c);
            }
            const args = [...node.arguments];
            for (const arg of args) {
                const reg = s.r0 = newRegister();
                getValueOfNode(arg, reg, s, c);
                cg([`PUSH`, reg]);
                freeRegister();
            }
            if (thisReg) {
                cg(['CALL_REF', calleeReg, thisReg, node.arguments.length, isNewExpression]);
            }
            else {
                cg(['CALL_REG', calleeReg, node.arguments.length, isNewExpression]);
            }
            if (retReg) {
                cg([`MOV`, retReg, `$RET`]);
            }
            freeRegister();
            if (thisReg) {
                freeRegister();
            }
            s.r0 = null;
        },
        Literal: (node, s) => {
            const unescape = (ss) => ss.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            if (node.regex) {
                const { pattern, flags } = node.regex;
                cg(['NEW_REG', s.r0, `"${unescape(pattern)}"`, `"${flags}"`]);
                return;
            }
            let val;
            if (node.value === true) {
                val = true;
            }
            else if (node.value === false) {
                val = false;
            }
            else {
                val = node.value;
                if (typeof val === 'string') {
                    val = `"${unescape(val)}"`;
                }
            }
            if (s.r0) {
                cg([`MOV`, s.r0, `${val}`]);
            }
        },
        ArrowFunctionExpression(node, s, c) {
            parseFunc(node, s);
        },
        FunctionExpression(node, s, c) {
            parseFunc(node, s);
        },
        BlockStatement(node, s, c) {
            const restoreBlockChain = newBlockChain();
            predeclareLexicalDeclarations(node.body, s);
            node.body.forEach((n) => c(n, s));
            restoreBlockChain();
        },
        WithStatement(node, s, c) {
            const objectReg = newRegister();
            const endLabel = newLabelName();
            getValueOfNode(node.object, objectReg, s, c);
            cg(['ENTER_WITH', objectReg, endLabel]);
            s.withDepth++;
            c(node.body, s);
            s.withDepth--;
            cg(['EXIT_WITH']);
            lg(endLabel);
            freeRegister();
        },
        MemberExpression(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const valReg = s.r0;
            const objReg = s.r1 || newReg();
            const keyReg = s.r2 || newReg();
            if (node.object.type === 'MemberExpression') {
                s.r0 = objReg;
                s.r1 = newRegister();
                s.r2 = null;
                c(node.object, s);
                freeRegister();
            }
            else if (node.object.type === 'Identifier') {
                getValueOfNode(node.object, objReg, s, c);
            }
            else {
                getValueOfNode(node.object, objReg, s, c);
            }
            if (node.property.type === 'MemberExpression') {
                s.r0 = keyReg;
                s.r1 = null;
                s.r2 = newRegister();
                c(node.property, s);
                freeRegister();
            }
            else if (node.property.type === 'Identifier') {
                if (node.computed) {
                    getValueOfNode(node.property, keyReg, s, c);
                }
                else {
                    cg([`MOV`, keyReg, `"${node.property.name}"`]);
                }
            }
            else {
                getValueOfNode(node.property, keyReg, s, c);
            }
            if (valReg) {
                cg([`MOV_PROP`, valReg, objReg, keyReg]);
            }
            s.r0 = null;
            s.r1 = null;
            s.r2 = null;
            freeReg();
        },
        AssignmentExpression(node, s, c) {
            const retReg = s.r0;
            const left = node.left;
            const right = node.right;
            const [newReg, freeReg] = newRegisterController();
            let rightReg;
            const isLeftMembership = left.type === 'MemberExpression';
            let objReg;
            let keyReg;
            if (isLeftMembership) {
                objReg = newReg();
                keyReg = newReg();
                s.r1 = objReg;
                s.r2 = keyReg;
                c(left, s);
            }
            const getLeftReg = (reg) => {
                if (isLeftMembership) {
                    cg(["MOV_PROP", reg, objReg, keyReg]);
                }
                else {
                    getValueOfNode(left, reg, s, c);
                }
            };
            const setLeftReg = (reg) => {
                if (isLeftMembership) {
                    cg([`SET_KEY`, `${objReg}`, keyReg, `${reg}`]);
                }
                else {
                    setValueToNode(left, reg, s, c);
                }
            };
            if (node.operator !== '=') {
                const o = node.operator.replace(/\=$/, '');
                const cmd = codeMap[o];
                if (!cmd) {
                    throw new Error(`Operation ${o} is not implemented.`);
                }
                const leftReg = newReg();
                getLeftReg(leftReg);
                rightReg = newReg();
                getValueOfNode(right, rightReg, s, c);
                cg([`${cmd}`, leftReg, rightReg]);
                rightReg = leftReg;
            }
            else {
                rightReg = newReg();
                getValueOfNode(right, rightReg, s, c);
            }
            setLeftReg(rightReg);
            if (retReg) {
                cg([`MOV`, retReg, rightReg]);
            }
            freeReg();
        },
        BinaryExpression(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const leftReg = s.r0 || newReg();
            s.r0 = null;
            const rightReg = newReg();
            getValueOfNode(node.left, leftReg, s, c);
            getValueOfNode(node.right, rightReg, s, c);
            const op = codeMap[node.operator];
            if (!op) {
                throw new Error(`${node.operator} is not implemented.`);
            }
            cg([op, leftReg, rightReg]);
            freeReg();
        },
        UnaryExpression(node, s, c) {
            const op = node.operator;
            const codesMap = {
                '+': 'PLUS',
                '-': 'MINUS',
                '~': 'NOT',
                '!': 'NEG',
                'void': 'VOID',
                'typeof': 'TYPE_OF',
            };
            const [newReg, freeReg] = newRegisterController();
            const cmd = codesMap[node.operator];
            const resultReg = s.r0;
            if (op === 'typeof' &&
                node.argument.type === 'Identifier' &&
                s.withDepth > 0) {
                const reg = s.r0 || newReg();
                const name = node.argument.name;
                const fallbackKind = s.blockChain.getNameType(name) === 4
                    ? 2
                    : (s.blockChain.hasName(name) ? 1 : 0);
                cg([
                    'WITH_TYPEOF', reg, `"${name}"`, `${fallbackKind}`,
                    fallbackKind === 1 ? name : 'undefined',
                ]);
                freeReg();
                return;
            }
            if (op === 'typeof' &&
                node.argument.type === 'Identifier' &&
                !s.blockChain.hasName(node.argument.name) &&
                node.argument.name !== 'arguments') {
                const reg = s.r0 || newReg();
                cg(['TYPEOF_CTX', reg, `"${node.argument.name}"`]);
                freeReg();
                return;
            }
            if (op !== 'delete') {
                const reg = s.r0 || newReg();
                if (!reg) {
                    throw new Error('! regster should not be null');
                }
                getValueOfNode(node.argument, reg, s, c);
                cg([`${cmd}`, `${reg}`]);
            }
            else {
                const retReg = resultReg || newReg();
                if (node.argument.type === 'MemberExpression') {
                    s.r0 = null;
                    const objReg = s.r1 = newReg();
                    const keyReg = s.r2 = newReg();
                    c(node.argument, s);
                    cg([`DELETE_REF`, `${retReg}`, `${objReg}`, `${keyReg}`]);
                    s.r1 = null;
                    s.r2 = null;
                }
                else if (node.argument.type === 'Identifier') {
                    if (s.withDepth > 0) {
                        const name = node.argument.name;
                        const fallbackKind = s.blockChain.getNameType(name) === 4
                            ? 2
                            : (s.blockChain.hasName(name) ? 1 : 0);
                        cg([
                            'WITH_DELETE', retReg, `"${name}"`, `${fallbackKind}`,
                            fallbackKind === 1 ? name : 'undefined',
                        ]);
                    }
                    else if (s.blockChain.hasName(node.argument.name) || node.argument.name === 'arguments') {
                        cg([`MOV`, `${retReg}`, 'false']);
                    }
                    else {
                        cg([`DELETE_CTX`, `${retReg}`, `"${node.argument.name}"`]);
                    }
                }
                else {
                    const valueReg = newReg();
                    getValueOfNode(node.argument, valueReg, s, c);
                    cg([`MOV`, `${retReg}`, 'true']);
                }
            }
            freeReg();
        },
        IfStatement(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const retReg = s.r0;
            const endLabel = newLabelName();
            while (node && (node.type === 'IfStatement' || node.type === 'ConditionalExpression')) {
                const testReg = newReg();
                const nextLabel = newLabelName();
                s.r0 = testReg;
                c(node.test, s);
                cg([`JF`, testReg, nextLabel]);
                getValueOfNode(node.consequent, retReg, s, c);
                cg([`JMP`, endLabel]);
                cg([`LABEL`, `${nextLabel}:`]);
                node = node.alternate;
            }
            if (node) {
                getValueOfNode(node, retReg, s, c);
            }
            cg([`LABEL`, `${endLabel}:`]);
            freeReg();
        },
        ConditionalExpression(node, s, c) {
            this.IfStatement(node, s, c);
        },
        LogicalExpression(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const retReg = s.r0;
            const endLabel = newLabelName();
            const leftReg = s.r0 = newReg();
            getValueOfNode(node.left, leftReg, s, c);
            const op = node.operator;
            if (retReg) {
                cg([`MOV`, `${retReg}`, `${leftReg}`]);
            }
            if (op === '&&') {
                cg([`JF`, `${leftReg}`, `${endLabel}`]);
            }
            else {
                cg([`JIF`, `${leftReg}`, `${endLabel}`]);
            }
            const rightReg = s.r0 = newReg();
            getValueOfNode(node.right, rightReg, s, c);
            if (retReg) {
                cg([op === '&&' ? `LG_AND` : `LG_OR`, `${retReg}`, `${rightReg}`]);
            }
            cg(['LABEL', `${endLabel}:`]);
            freeReg();
        },
        ForStatement(node, s, c) {
            const restoreBlockChainInit = newBlockChain();
            if (node.init && node.init.type === 'VariableDeclaration') {
                predeclareLexicalDeclarations([node.init], s);
            }
            const [newReg, freeReg] = newRegisterController();
            const startLabel = newLabelName();
            let endLabel = newLabelName();
            const updateLabel = newLabelName();
            let labels;
            if (s.jsLabel) {
                if (!blockEndLabels.has(s.jsLabel)) {
                    throw new Error('If has `jsLabel`, label information should be set');
                }
                labels = blockEndLabels.get(s.jsLabel);
                labels.startLabel = startLabel;
                if (!labels.endLabel) {
                    throw new Error('Endlabel is not set in label information');
                }
                endLabel = labels.endLabel;
                delete s.jsLabel;
            }
            else {
                labels = { startLabel, endLabel };
            }
            if (node.update) {
                labels.updateLabel = updateLabel;
            }
            labels.startBlock = s.blockChain.getCurrentBlock();
            labels.blockNameStart = labels.blockNameBody = restoreBlockChainInit.blockIndexName;
            pushLoopLabels(labels);
            if (node.init) {
                c(node.init, s);
            }
            const isDoWhileLoop = node.type === 'DoWhileStatement';
            const bodyLabel = newLabelName();
            if (isDoWhileLoop) {
                cg([`JMP`, bodyLabel]);
            }
            cg([`LABEL`, `${startLabel}:`]);
            if (node.test) {
                const testReg = s.r0 = newReg();
                c(node.test, s);
                cg([`JF`, `${testReg}`, `${endLabel}`]);
            }
            s.forEndLabel = endLabel;
            s.r0 = null;
            cg([`LABEL`, `${bodyLabel}:`]);
            const restoreBlockChainBody = newBlockChain();
            labels.bodyBlock = s.blockChain.getCurrentBlock();
            labels.blockNameBody = restoreBlockChainBody.blockIndexName;
            c(node.body, s);
            restoreBlockChainBody();
            if (node.update) {
                cg(['LABEL', `${updateLabel}:`]);
                s.r0 = null;
                c(node.update, s);
            }
            cg([`JMP`, `${startLabel}`]);
            cg([`LABEL`, `${endLabel}:`]);
            restoreBlockChainInit();
            popLoopLabels();
            freeReg();
        },
        ForInStatement(node, s, c) {
            const restoreBlockChain = newBlockChain();
            const left = node.left;
            const right = node.right;
            const [newReg, freeReg] = newRegisterController();
            if (left.type === 'VariableDeclaration') {
                predeclareLexicalDeclarations([left], s);
            }
            let leftTarget;
            if (left.type === 'Identifier') {
                leftTarget = left;
            }
            else if (left.type === 'VariableDeclaration') {
                const varDecorator = left.declarations[0];
                leftTarget = varDecorator.id;
                declareVariable(s, leftTarget.name, left.kind);
            }
            else {
                throw new Error('Cannot process for in statement left type ' + left.type);
            }
            const rightReg = newReg();
            const iteratorReg = newReg();
            const iterationValueReg = newReg();
            const startLabel = newLabelName();
            const endLabel = newLabelName();
            getValueOfNode(right, rightReg, s, c);
            const labels = {
                startLabel,
                endLabel,
                updateLabel: startLabel,
                blockNameStart: restoreBlockChain.blockIndexName,
                startBlock: s.blockChain.getCurrentBlock(),
            };
            pushLoopLabels(labels);
            cg(['FORIN_INIT', iteratorReg, rightReg]);
            lg(startLabel);
            cg(['FORIN_NEXT', iterationValueReg, iteratorReg, endLabel]);
            setValueToNode(leftTarget, iterationValueReg, s, c);
            const restoreBlockChainBody = newBlockChain();
            labels.blockNameBody = restoreBlockChainBody.blockIndexName;
            labels.bodyBlock = s.blockChain.getCurrentBlock();
            c(node.body, s);
            restoreBlockChainBody();
            cg(['JMP', startLabel]);
            lg(endLabel);
            restoreBlockChain();
            freeReg();
            popLoopLabels();
        },
        WhileStatement(node, s, c) {
            this.ForStatement(node, s, c);
        },
        DoWhileStatement(node, s, c) {
            this.ForStatement(node, s, c);
        },
        BreakStatement(node, s, c) {
            if (node.label) {
                const { name } = node.label;
                if (!blockEndLabels.has(name)) {
                    throw new Error(`Label ${name} does not exist.`);
                }
                const lb = blockEndLabels.get(name);
                lb.startBlock.isForceBlock = true;
                cg(['CLR_BLOCK', lb.blockNameStart], { isForceBlock: true });
                cg(['ABRUPT_JUMP', lb.endLabel]);
                return;
            }
            const labels = getCurrentLoopLabel();
            if (!labels) {
                throw new Error("Not available labels, cannot use `break` here.");
            }
            if (labels.isForIn) {
                cg(['BREAK_FORIN']);
                return;
            }
            const endLabel = labels.endLabel;
            if (labels.startBlock) {
                labels.startBlock.isForceBlock = true;
            }
            if (labels.blockNameStart === void 0) {
                throw new Error('No start block name');
            }
            cg(['CLR_BLOCK', labels.blockNameStart], { isForceBlock: true });
            cg([`ABRUPT_JUMP`, `${endLabel}`]);
        },
        ContinueStatement(node, s, c) {
            if (node.label) {
                const { name } = node.label;
                if (!blockEndLabels.has(name)) {
                    throw new Error(`Label ${name} does not exist.`);
                }
                const blockLabel = blockEndLabels.get(name);
                blockLabel.bodyBlock.isForceBlock = true;
                cg(['CLR_BLOCK', blockLabel.blockNameBody], { isForceBlock: true });
                cg(['ABRUPT_JUMP', blockLabel.updateLabel || blockLabel.startLabel]);
                return;
            }
            const labels = getCurrentLoopLabel();
            if (!labels) {
                throw new Error("Not available labels, cannot use `continue` here.");
            }
            if (labels.isForIn) {
                labels.bodyBlock.isForceBlock = true;
                cg(['CLR_BLOCK', labels.blockNameBody], { isForceBlock: true });
                cg(['CONT_FORIN']);
                return;
            }
            const { startLabel, updateLabel } = labels;
            labels.bodyBlock.isForceBlock = true;
            cg(['CLR_BLOCK', labels.blockNameBody], { isForceBlock: true });
            cg([`ABRUPT_JUMP`, `${updateLabel || startLabel}`]);
        },
        UpdateExpression(node, s, c) {
            const op = node.operator;
            const [newReg, freeReg] = newRegisterController();
            const retReg = s.r0;
            const reg = newReg();
            getValueOfNode(node.argument, reg, s, c);
            cg([`PLUS`, `${reg}`]);
            if (retReg && !node.prefix) {
                cg([`MOV ${retReg} ${reg}`]);
            }
            if (op === '++') {
                cg([`ADD`, `${reg}`, `1`]);
            }
            else if (op === '--') {
                cg([`SUB`, `${reg}`, `1`]);
            }
            if (retReg && node.prefix) {
                cg([`MOV ${retReg} ${reg}`]);
            }
            setValueToNode(node.argument, reg, s, c);
            freeReg();
        },
        ObjectExpression(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const reg = s.r0 || newReg();
            cg([`NEW_OBJ`, `${reg}`]);
            for (const prop of node.properties) {
                s.r0 = reg;
                c(prop, s);
            }
            freeReg();
        },
        ArrayExpression(node, s, c) {
            const [newReg, freeReg] = newRegisterController();
            const reg = s.r0 || newReg();
            cg([`NEW_ARR`, `${reg}`]);
            node.elements.forEach((el, i) => {
                if (!el) {
                    return;
                }
                const valReg = newRegister();
                getValueOfNode(el, valReg, s, c);
                cg([`DEF_DATA`, `${reg}`, `${i}`, `${valReg}`]);
                freeRegister();
            });
            cg([`SET_KEY`, `${reg}`, `'length'`, `${node.elements.length}`]);
            freeReg();
        },
        Property(node, s, c) {
            const objReg = s.r0;
            const [newReg, freeReg] = newRegisterController();
            const valReg = newReg();
            let key;
            if (node.key.type === "Identifier") {
                key = `'${node.key.name}'`;
            }
            else if (node.key.type === "Literal") {
                const keyReg = newReg();
                getValueOfNode(node.key, keyReg, s, c);
                key = keyReg;
            }
            getValueOfNode(node.value, valReg, s, c);
            if (node.kind === 'get' || node.kind === 'set') {
                cg([`DEF_PROP`, `${objReg}`, key, `${valReg}`, `'${node.kind}'`]);
            }
            else {
                cg([`DEF_DATA`, `${objReg}`, key, `${valReg}`]);
            }
            freeReg();
        },
        ReturnStatement(node, s, c) {
            const reg = s.r0 = newRegister();
            if (node.argument) {
                c(node.argument, s);
                cg([`MOV`, `$RET`, `${reg}`]);
            }
            cg(['RET']);
            freeRegister();
        },
        SequenceExpression(node, s, c) {
            const r0 = s.r0;
            node.expressions.forEach((n, i) => {
                if (i === node.expressions.length - 1 && r0) {
                    getValueOfNode(n, r0, s, c);
                }
                else {
                    evaluateDiscarded(n, s, c);
                }
            });
            s.r0 = r0;
        },
        ThisExpression(node, s, c) {
            if (!s.r0) {
                throw new Error('Access `this` without register r0');
            }
            cg([`MOV_THIS`, `${s.r0}`]);
        },
        NewExpression(node, s, c) {
            s.isNewExpression = true;
            this.CallExpression(node, s, c);
        },
        LabeledStatement(node, s, c) {
            const restoreBlockChain = newBlockChain();
            const labelNode = node.label;
            const labelName = labelNode.name;
            const endLabel = newLabelName();
            blockEndLabels.set(labelName, {
                endLabel,
                blockNameStart: restoreBlockChain.blockIndexName,
                startBlock: s.blockChain.getCurrentBlock(),
            });
            if (node.body.type === 'ForStatement' ||
                node.body.type === 'ForInStatement' ||
                node.body.type === 'WhileStatement' ||
                node.body.type === 'DoWhileStatement') {
                s.jsLabel = labelName;
            }
            c(node.body, s);
            blockEndLabels.delete(labelName);
            cg([`LABEL ${endLabel}:`]);
            restoreBlockChain();
        },
        SwitchStatement(node, s, c) {
            const restoreBlockChain = newBlockChain();
            predeclareLexicalDeclarations(node.cases.reduce((all, switchCase) => [...all, ...switchCase.consequent], []), s);
            const [newReg, freeReg] = newRegisterController();
            const discriminantReg = newReg();
            getValueOfNode(node.discriminant, discriminantReg, s, c);
            const switchEndLabel = newLabelName();
            const caseLabels = node.cases.map(() => newLabelName());
            let defaultLabel = null;
            const label = {
                endLabel: switchEndLabel,
                blockNameStart: restoreBlockChain.blockIndexName,
                startBlock: s.blockChain.getCurrentBlock(),
            };
            pushLoopLabels(label);
            node.cases.forEach((cs, i) => {
                if (cs.test) {
                    const testReg = newReg();
                    getValueOfNode(cs.test, testReg, s, c);
                    cg(['JE', discriminantReg, testReg, caseLabels[i]]);
                }
                else {
                    defaultLabel = caseLabels[i];
                }
            });
            cg(['JMP', defaultLabel || switchEndLabel]);
            node.cases.forEach((cs, i) => {
                lg(caseLabels[i]);
                cs.consequent.forEach((n) => c(n, s));
            });
            lg(switchEndLabel);
            popLoopLabels();
            freeReg();
            restoreBlockChain();
        },
        TryStatement(node, s, c) {
            const catchLabel = newLabelName();
            const finalLabel = newLabelName();
            const endLabel = newLabelName();
            const catchTarget = node.handler ? catchLabel : endLabel;
            const finallyTarget = node.finalizer ? finalLabel : endLabel;
            cg([
                'TRY',
                catchTarget,
                finallyTarget,
                endLabel,
                !!node.handler,
                !!node.finalizer,
            ]);
            c(node.block, s);
            cg(['TRY_END']);
            if (node.handler) {
                lg(catchLabel);
                const restoreBlockChain = newBlockChain();
                const handler = node.handler;
                if (handler.param) {
                    if (handler.param.type !== 'Identifier') {
                        throw new Error('cannot process error type ' + handler.param.type);
                    }
                    const errName = handler.param.name;
                    declareVariable(s, errName, 'let');
                    const errReg = newRegister();
                    cg(['GET_ERR', errReg]);
                    cg(['INIT', errName, errReg]);
                    freeRegister();
                }
                c(handler.body, s);
                restoreBlockChain();
                cg(['TRY_END']);
            }
            if (node.finalizer) {
                lg(finalLabel);
                c(node.finalizer, s);
                cg(['FINALLY_END']);
            }
            lg(endLabel);
        },
        ThrowStatement(node, s, c) {
            const reg = newRegister();
            getValueOfNode(node.argument, reg, s, c);
            cg(['THROW', reg]);
            freeRegister();
        },
    });
    state.maxRegister = maxRegister;
};
const getFunctionDecleration = (func) => {
    const name = func.name;
    const params = func.body.params.map((p) => '.' + p.name).join(', ');
    return `func ${name}(${params}) {`;
};
exports.generateAssemblyFromJs = (jsCode) => {
    const ret = codegen.parse(jsCode);
    let allCodes = [];
    const processFunctionAst = (funcBody) => {
        if (funcBody.type !== 'BlockStatement') {
            state.r0 = '$RET';
        }
        parseToCode(funcBody);
        for (let i = 0; i < state.maxRegister; i++) {
            state.codes.push(`REG %r${i}`, 1);
        }
        state.codes.push('}');
        for (const code of state.codes) {
            allCodes.push(code);
        }
        state.codes.clear();
    };
    state = createNewState();
    state.currentStrict = hasUseStrictDirective(ret);
    const globals = getVariablesByFunctionAstBody(ret);
    globals.delete('undefined');
    globals.delete('NaN');
    globals.delete('Infinity');
    state.blockChain = state.blockChain.newBlock(globals);
    state.codes.push('func @@main() {', 0);
    state.codes.push(`META ${state.currentStrict ? 2 : 0}`, 0);
    processFunctionAst(ret);
    let functionCursor = 0;
    while (functionCursor < state.functions.length) {
        state.isGlobal = false;
        state.maxRegister = 0;
        const funcInfo = state.functions[functionCursor++];
        state.currentStrict = funcInfo.strict;
        state.withDepth = funcInfo.withDepth;
        const funcBlockChain = funcInfo.blockChain;
        const params = funcInfo.body.params.reduce((o, param) => {
            o.set(param.name, 2);
            return o;
        }, new Map());
        const locals = getVariablesByFunctionAstBody(funcInfo.body.body);
        for (const name of params.keys()) {
            if (locals.get(name) === 2) {
                locals.delete(name);
            }
        }
        if (funcInfo.kind === 'normal' &&
            !params.has('arguments') &&
            locals.get('arguments') !== 1) {
            locals.set('arguments', 4);
        }
        if (!funcBlockChain.currentFuncBlock) {
            throw new Error('Should has function block chain.');
        }
        const currentFuncBlock = funcBlockChain.currentFuncBlock;
        currentFuncBlock.params = params;
        currentFuncBlock.variables = locals;
        state.codes.push(getFunctionDecleration(funcInfo), 0);
        const flags = (funcInfo.kind === 'arrow' ? 1 : 0) |
            (funcInfo.strict ? 2 : 0) |
            (funcInfo.usesArguments ? 4 : 0);
        state.codes.push(`META ${flags}`, 0);
        state.codes.push(() => {
            const paramClosureDeclarations = [...currentFuncBlock.params.keys()].reduce((o, param) => {
                const paramType = funcBlockChain.getNameType(param);
                if (paramType === 3) {
                    const name = funcBlockChain.getName(param);
                    o.push(`CLS ${name}`);
                    o.push(`MOV ${name} .${param}`);
                }
                return o;
            }, []);
            return paramClosureDeclarations.length > 0 ? paramClosureDeclarations : [];
        });
        state.blockChain = funcBlockChain;
        if (funcInfo.prepare) {
            funcInfo.prepare();
        }
        processFunctionAst(funcInfo.body.body);
    }
    const output = [];
    const appendFormatted = (code) => {
        if (code.trim() === '') {
            return;
        }
        if (code.startsWith('func') || code.startsWith('LABEL') || code.startsWith('}')) {
            output.push(code + '\n');
        }
        else {
            output.push(`    ${code};\n`);
        }
    };
    for (const code of allCodes) {
        if (typeof code === 'string') {
            appendFormatted(code);
        }
        else {
            for (const generated of code()) {
                appendFormatted(generated);
            }
        }
    }
    return output.join("");
};


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
   true ? factory(exports) :
  0;
})(this, (function (exports) { 'use strict';

  // This file was generated. Do not modify manually!
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 78, 5, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 199, 7, 137, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 55, 9, 266, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 233, 0, 3, 0, 8, 1, 6, 0, 475, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];

  // This file was generated. Do not modify manually!
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 7, 25, 39, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 5, 57, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 24, 43, 261, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 33, 24, 3, 24, 45, 74, 6, 0, 67, 12, 65, 1, 2, 0, 15, 4, 10, 7381, 42, 31, 98, 114, 8702, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 208, 30, 2, 2, 2, 1, 2, 6, 3, 4, 10, 1, 225, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4381, 3, 5773, 3, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 8489];

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierChars = "\u200c\u200d\xb7\u0300-\u036f\u0387\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u07fd\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u0897-\u089f\u08ca-\u08e1\u08e3-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u09fe\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0afa-\u0aff\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b55-\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c00-\u0c04\u0c3c\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0cf3\u0d00-\u0d03\u0d3b\u0d3c\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d81-\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0ebc\u0ec8-\u0ece\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1369-\u1371\u1712-\u1715\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u180f-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19d0-\u19da\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1ab0-\u1abd\u1abf-\u1add\u1ae0-\u1aeb\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf4\u1cf7-\u1cf9\u1dc0-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\u30fb\ua620-\ua629\ua66f\ua674-\ua67d\ua69e\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua82c\ua880\ua881\ua8b4-\ua8c5\ua8d0-\ua8d9\ua8e0-\ua8f1\ua8ff-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\ua9e5\ua9f0-\ua9f9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b-\uaa7d\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe2f\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f\uff65";

  // This file was generated. Do not modify manually!
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0560-\u0588\u05d0-\u05ea\u05ef-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u0860-\u086a\u0870-\u0887\u0889-\u088f\u08a0-\u08c9\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u09fc\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0af9\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c5a\u0c5c\u0c5d\u0c60\u0c61\u0c80\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cdc-\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d04-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d54-\u0d56\u0d5f-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e86-\u0e8a\u0e8c-\u0ea3\u0ea5\u0ea7-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f5\u13f8-\u13fd\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u1711\u171f-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1878\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4c\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1c80-\u1c8a\u1c90-\u1cba\u1cbd-\u1cbf\u1ce9-\u1cec\u1cee-\u1cf3\u1cf5\u1cf6\u1cfa\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312f\u3131-\u318e\u31a0-\u31bf\u31f0-\u31ff\u3400-\u4dbf\u4e00-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua7dc\ua7f1-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua8fd\ua8fe\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab69\uab70-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";

  // These are a run-length and offset encoded representation of the
  // >0xffff code points that are a valid part of identifiers. The
  // offset starts at 0x10000, and each pair of numbers represents an
  // offset to the next range, and then a size of the range.

  // Reserved word lists for various dialects of the language

  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };

  // And the keywords

  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";

  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };

  var keywordRelationalOperator = /^in(stanceof)?$/;

  // ## Character categories

  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // This has a complexity linear to the value of the code. The
  // assumption is that looking up astral identifier characters is
  // rare.
  function isInAstralSet(code, set) {
    var pos = 0x10000;
    for (var i = 0; i < set.length; i += 2) {
      pos += set[i];
      if (pos > code) { return false }
      pos += set[i + 1];
      if (pos >= code) { return true }
    }
    return false
  }

  // Test whether a given character code starts an identifier.

  function isIdentifierStart(code, astral) {
    if (code < 65) { return code === 36 }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes)
  }

  // Test whether a given character is part of an identifier.

  function isIdentifierChar(code, astral) {
    if (code < 48) { return code === 36 }
    if (code < 58) { return true }
    if (code < 65) { return false }
    if (code < 91) { return true }
    if (code < 97) { return code === 95 }
    if (code < 123) { return true }
    if (code <= 0xffff) { return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code)) }
    if (astral === false) { return false }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes)
  }

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // The `startsExpr` property is used to check if the token ends a
  // `yield` expression. It is set on all token types that either can
  // directly start an expression (like a quotation mark) or can
  // continue an expression (like the body of a string).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var TokenType = function TokenType(label, conf) {
    if ( conf === void 0 ) conf = {};

    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };

  function binop(name, prec) {
    return new TokenType(name, {beforeExpr: true, binop: prec})
  }
  var beforeExpr = {beforeExpr: true}, startsExpr = {startsExpr: true};

  // Map keyword names to token types.

  var keywords = {};

  // Succinct definitions of keyword token types
  function kw(name, options) {
    if ( options === void 0 ) options = {};

    options.keyword = name;
    return keywords[name] = new TokenType(name, options)
  }

  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),

    // Punctuation token types.
    bracketL: new TokenType("[", {beforeExpr: true, startsExpr: true}),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", {beforeExpr: true, startsExpr: true}),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", {beforeExpr: true, startsExpr: true}),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", {beforeExpr: true, startsExpr: true}),

    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.

    eq: new TokenType("=", {beforeExpr: true, isAssign: true}),
    assign: new TokenType("_=", {beforeExpr: true, isAssign: true}),
    incDec: new TokenType("++/--", {prefix: true, postfix: true, startsExpr: true}),
    prefix: new TokenType("!/~", {beforeExpr: true, prefix: true, startsExpr: true}),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", {beforeExpr: true, binop: 9, prefix: true, startsExpr: true}),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", {beforeExpr: true}),
    coalesce: binop("??", 1),

    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", {isLoop: true, beforeExpr: true}),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", {isLoop: true}),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", {isLoop: true}),
    _with: kw("with"),
    _new: kw("new", {beforeExpr: true, startsExpr: true}),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", {beforeExpr: true, binop: 7}),
    _instanceof: kw("instanceof", {beforeExpr: true, binop: 7}),
    _typeof: kw("typeof", {beforeExpr: true, prefix: true, startsExpr: true}),
    _void: kw("void", {beforeExpr: true, prefix: true, startsExpr: true}),
    _delete: kw("delete", {beforeExpr: true, prefix: true, startsExpr: true})
  };

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");

  function isNewLine(code) {
    return code === 10 || code === 13 || code === 0x2028 || code === 0x2029
  }

  function nextLineBreak(code, from, end) {
    if ( end === void 0 ) end = code.length;

    for (var i = from; i < end; i++) {
      var next = code.charCodeAt(i);
      if (isNewLine(next))
        { return i < end - 1 && next === 13 && code.charCodeAt(i + 1) === 10 ? i + 2 : i + 1 }
    }
    return -1
  }

  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;

  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;

  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;

  var hasOwn = Object.hasOwn || (function (obj, propName) { return (
    hasOwnProperty.call(obj, propName)
  ); });

  var isArray = Array.isArray || (function (obj) { return (
    toString.call(obj) === "[object Array]"
  ); });

  var regexpCache = Object.create(null);

  function wordsRegexp(words) {
    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"))
  }

  function codePointToString(code) {
    // UTF-16 Decoding
    if (code <= 0xFFFF) { return String.fromCharCode(code) }
    code -= 0x10000;
    return String.fromCharCode((code >> 10) + 0xD800, (code & 1023) + 0xDC00)
  }

  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;

  // These are used when `options.locations` is on, for the
  // `startLoc` and `endLoc` properties.

  var Position = function Position(line, col) {
    this.line = line;
    this.column = col;
  };

  Position.prototype.offset = function offset (n) {
    return new Position(this.line, this.column + n)
  };

  var SourceLocation = function SourceLocation(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) { this.source = p.sourceFile; }
  };

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  function getLineInfo(input, offset) {
    for (var line = 1, cur = 0;;) {
      var nextBreak = nextLineBreak(input, cur, offset);
      if (nextBreak < 0) { return new Position(line, offset - cur) }
      ++line;
      cur = nextBreak;
    }
  }

  // A second argument must be given to configure the parser process.
  // These options are recognized (only `ecmaVersion` is required):

  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"`, `"module"` or `"commonjs"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // When set to true, enable strict parsing mode even if `sourceType`
    // is `"script"`.
    strict: false,
    // `onInsertedSemicolon` can be a callback that will be called when
    // a semicolon is automatically inserted. It will be passed the
    // position of the inserted semicolon as an offset, and if
    // `locations` is enabled, it is given the location as a `{line,
    // column}` object as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // Pass an optional `{line, column}` object to use for the start of
    // the parse. This is mostly useful when using `parseExpressionAt`
    // with `locations: true`, to prevent the parser from having to
    // determine the line position at the start position.
    startLocation: null,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    // When this option has an array as value, objects representing the
    // comments are pushed to it.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };

  // Interpret and default an options object

  var warnedAboutEcmaVersion = false;

  function getOptions(opts) {
    var options = {};

    for (var opt in defaultOptions)
      { options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt]; }

    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }

    if (options.allowReserved == null)
      { options.allowReserved = options.ecmaVersion < 5; }

    if (!opts || opts.allowHashBang == null)
      { options.allowHashBang = options.ecmaVersion >= 14; }

    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function (token) { return tokens.push(token); };
    }
    if (isArray(options.onComment))
      { options.onComment = pushComment(options, options.onComment); }

    if (options.sourceType === "commonjs" && options.allowAwaitOutsideFunction)
      { throw new Error("Cannot use allowAwaitOutsideFunction with sourceType: commonjs") }

    return options
  }

  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start: start,
        end: end
      };
      if (options.locations)
        { comment.loc = new SourceLocation(this, startLoc, endLoc); }
      if (options.ranges)
        { comment.range = [start, end]; }
      array.push(comment);
    }
  }

  // Each scope gets a bitset that may contain these flags
  var
      SCOPE_TOP = 1,
      SCOPE_FUNCTION = 2,
      SCOPE_ASYNC = 4,
      SCOPE_GENERATOR = 8,
      SCOPE_ARROW = 16,
      SCOPE_SIMPLE_CATCH = 32,
      SCOPE_SUPER = 64,
      SCOPE_DIRECT_SUPER = 128,
      SCOPE_CLASS_STATIC_BLOCK = 256,
      SCOPE_CLASS_FIELD_INIT = 512,
      SCOPE_SWITCH = 1024,
      SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;

  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0)
  }

  // Used in checkLVal* and declareName to determine the type of a binding
  var
      BIND_NONE = 0, // Not a binding
      BIND_VAR = 1, // Var-style binding
      BIND_LEXICAL = 2, // Let- or const-style binding
      BIND_FUNCTION = 3, // Function declaration
      BIND_SIMPLE_CATCH = 4, // Simple (identifier pattern) catch binding
      BIND_OUTSIDE = 5; // Special case for function names as bound inside the function

  var Parser = function Parser(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") { reserved += " await"; }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);

    // Used to signal to callers of `readWord1` whether the word
    // contained any escape sequences. This is needed because words with
    // escape sequences must not be interpreted as keywords.
    this.containsEsc = false;

    // Set up token state

    // The current position of the tokenizer in the input.
    this.pos = startPos || 0;
    this.curLine = 1;
    if (options.startLocation) {
      this.lineStart = this.pos - options.startLocation.column;
      this.curLine = options.startLocation.line;
    } else if (startPos) {
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      if (this.options.locations)
        { this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length; }
    } else {
      this.lineStart = 0;
    }

    // Properties of the current token:
    // Its type
    this.type = types$1.eof;
    // For tokens that include more information than their type, the value
    this.value = null;
    // Its start and end offset
    this.start = this.end = this.pos;
    // And, if locations are used, the {line, column} object
    // corresponding to those offsets
    this.startLoc = this.endLoc = this.curPosition();

    // Position information for the previous token
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;

    // The context stack is used to superficially track syntactic
    // context to predict whether a regular expression is allowed in a
    // given position.
    this.context = this.initialContext();
    this.exprAllowed = true;

    // Figure out if it's a module code.
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || options.strict === true || this.strictDirective(this.pos);

    // Used to signify the start of a potential arrow function
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;

    // Positions to delayed-check that yield/await does not exist in default parameters.
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    // Labels in scope.
    this.labels = [];
    // Thus-far undefined exports.
    this.undefinedExports = Object.create(null);

    // If enabled, skip leading hashbang line.
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!")
      { this.skipLineComment(2); }

    // Scope tracking for duplicate variable names (see scope.js)
    this.scopeStack = [];
    this.enterScope(
      this.options.sourceType === "commonjs"
        // In commonjs, the top-level scope behaves like a function scope
        ? SCOPE_FUNCTION
        : SCOPE_TOP
    );

    // For RegExp validation
    this.regexpState = null;

    // The stack of private names.
    // Each element has two properties: 'declared' and 'used'.
    // When it exited from the outermost class definition, all used private names must be declared.
    this.privateNameStack = [];
  };

  var prototypeAccessors = { inFunction: { configurable: true },inGenerator: { configurable: true },inAsync: { configurable: true },canAwait: { configurable: true },allowReturn: { configurable: true },allowSuper: { configurable: true },allowDirectSuper: { configurable: true },treatFunctionsAsVar: { configurable: true },allowNewDotTarget: { configurable: true },allowUsing: { configurable: true },inClassStaticBlock: { configurable: true } };

  Parser.prototype.parse = function parse () {
      var this$1$1 = this;

    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.catchStackOverflow(function () { return this$1$1.parseTopLevel(node); })
  };

  prototypeAccessors.inFunction.get = function () { return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0 };

  prototypeAccessors.inGenerator.get = function () { return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0 };

  prototypeAccessors.inAsync.get = function () { return (this.currentVarScope().flags & SCOPE_ASYNC) > 0 };

  prototypeAccessors.canAwait.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var ref = this.scopeStack[i];
        var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) { return false }
      if (flags & SCOPE_FUNCTION) { return (flags & SCOPE_ASYNC) > 0 }
    }
    return (this.inModule && this.options.ecmaVersion >= 13) || this.options.allowAwaitOutsideFunction
  };

  prototypeAccessors.allowReturn.get = function () {
    if (this.inFunction) { return true }
    if (this.options.allowReturnOutsideFunction && this.currentVarScope().flags & SCOPE_TOP) { return true }
    return false
  };

  prototypeAccessors.allowSuper.get = function () {
    var ref = this.currentThisScope();
      var flags = ref.flags;
    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod
  };

  prototypeAccessors.allowDirectSuper.get = function () { return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0 };

  prototypeAccessors.treatFunctionsAsVar.get = function () { return this.treatFunctionsAsVarInScope(this.currentScope()) };

  prototypeAccessors.allowNewDotTarget.get = function () {
    for (var i = this.scopeStack.length - 1; i >= 0; i--) {
      var ref = this.scopeStack[i];
        var flags = ref.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) ||
          ((flags & SCOPE_FUNCTION) && !(flags & SCOPE_ARROW))) { return true }
    }
    return false
  };

  prototypeAccessors.allowUsing.get = function () {
    var ref = this.currentScope();
      var flags = ref.flags;
    if (flags & SCOPE_SWITCH) { return false }
    if (!this.inModule && flags & SCOPE_TOP) { return false }
    return true
  };

  prototypeAccessors.inClassStaticBlock.get = function () {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0
  };

  Parser.extend = function extend () {
      var plugins = [], len = arguments.length;
      while ( len-- ) plugins[ len ] = arguments[ len ];

    var cls = this;
    for (var i = 0; i < plugins.length; i++) { cls = plugins[i](cls); }
    return cls
  };

  Parser.parse = function parse (input, options) {
    return new this(options, input).parse()
  };

  Parser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
  };

  Parser.tokenizer = function tokenizer (input, options) {
    return new this(options, input)
  };

  Object.defineProperties( Parser.prototype, prototypeAccessors );

  var pp$9 = Parser.prototype;

  // ## Parser utilities

  var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) { return false }
    for (;;) {
      // Try to find string literal.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) { return false }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" ||
          (lineBreak.test(spaceAfter[0]) &&
           !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "="))
      }
      start += match[0].length;

      // Skip semicolon, if any.
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";")
        { start++; }
    }
  };

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true
    } else {
      return false
    }
  };

  // Tests whether parsed token is a contextual keyword.

  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc
  };

  // Consumes contextual keyword if possible.

  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) { return false }
    this.next();
    return true
  };

  pp$9.catchStackOverflow = function(f) {
    try {
      return f()
    } catch (e) {
      if (e instanceof Error && (/\bstack\b.*\b(exceeded|overflow)\b/i.test(e.message) || /\btoo much recursion\b/i.test(e.message)))
        { this.raise(this.start, "Not enough stack space to parse input"); }
      else
        { throw e }
    }
  };

  // Asserts that following token is given contextual keyword.

  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) { this.unexpected(); }
  };

  // Test whether a semicolon can be inserted at the current position.

  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof ||
      this.type === types$1.braceR ||
      lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon)
        { this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc); }
      return true
    }
  };

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) { this.unexpected(); }
  };

  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma)
        { this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc); }
      if (!notNext)
        { this.next(); }
      return true
    }
  };

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };

  // Raise an unexpected token error.

  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };

  var DestructuringErrors = function DestructuringErrors() {
    this.shorthandAssign =
    this.trailingComma =
    this.parenthesizedAssign =
    this.parenthesizedBind =
    this.doubleProto =
      -1;
  };

  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) { return }
    if (refDestructuringErrors.trailingComma > -1)
      { this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element"); }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) { this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern"); }
  };

  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) { return false }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) { return shorthandAssign >= 0 || doubleProto >= 0 }
    if (shorthandAssign >= 0)
      { this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns"); }
    if (doubleProto >= 0)
      { this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property"); }
  };

  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos))
      { this.raise(this.yieldPos, "Yield expression cannot be a default value"); }
    if (this.awaitPos)
      { this.raise(this.awaitPos, "Await expression cannot be a default value"); }
  };

  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression")
      { return this.isSimpleAssignTarget(expr.expression) }
    return expr.type === "Identifier" || expr.type === "MemberExpression"
  };

  var pp$8 = Parser.prototype;

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  pp$8.parseTopLevel = function(node) {
    var exports$1 = Object.create(null);
    if (!node.body) { node.body = []; }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports$1);
      node.body.push(stmt);
    }
    if (this.inModule)
      { for (var i = 0, list = Object.keys(this.undefinedExports); i < list.length; i += 1)
        {
          var name = list[i];

          this.raiseRecoverable(this.undefinedExports[name].start, ("Export '" + name + "' is not defined"));
        } }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType === "commonjs" ? "script" : this.options.sourceType;
    return this.finishNode(node, "Program")
  };

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) { return false }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.fullCharCodeAt(next);
    // For ambiguous cases, determine if a LexicalDeclaration (or only a
    // Statement) is allowed here. If context is not empty then only a Statement
    // is allowed. However, `let [` is an explicit negative lookahead for
    // ExpressionStatement, so special-case it first.
    if (nextCh === 91 || nextCh === 92) { return true } // '[', '\'
    if (context) { return false }

    if (nextCh === 123) { return true } // '{'
    if (isIdentifierStart(nextCh)) {
      var start = next;
      do { next += nextCh <= 0xffff ? 1 : 2; }
      while (isIdentifierChar(nextCh = this.fullCharCodeAt(next)))
      if (nextCh === 92) { return true }
      var ident = this.input.slice(start, next);
      if (!keywordRelationalOperator.test(ident)) { return true }
    }
    return false
  };

  // check 'async [no LineTerminator here] function'
  // - 'async /*foo*/ function' is OK.
  // - 'async /*\n*/ function' is invalid.
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) &&
      this.input.slice(next, next + 8) === "function" &&
      (next + 8 === this.input.length ||
       !(isIdentifierChar(after = this.fullCharCodeAt(next + 8)) || after === 92 /* '\' */))
  };

  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using"))
      { return false }

    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;

    if (lineBreak.test(this.input.slice(this.pos, next))) { return false }

    if (isAwaitUsing) {
      var usingEndPos = next + 5 /* using */, after;
      if (this.input.slice(next, usingEndPos) !== "using" ||
        usingEndPos === this.input.length ||
        isIdentifierChar(after = this.fullCharCodeAt(usingEndPos)) ||
        after === 92 /* '\' */
      ) { return false }

      skipWhiteSpace.lastIndex = usingEndPos;
      var skipAfterUsing = skipWhiteSpace.exec(this.input);
      next = usingEndPos + skipAfterUsing[0].length;
      if (skipAfterUsing && lineBreak.test(this.input.slice(usingEndPos, next))) { return false }
    }

    var ch = this.fullCharCodeAt(next);
    if (!isIdentifierStart(ch) && ch !== 92 /* '\' */) { return false }
    var idStart = next;
    do { next += ch <= 0xffff ? 1 : 2; }
    while (isIdentifierChar(ch = this.fullCharCodeAt(next)))
    if (ch === 92) { return true }
    var id = this.input.slice(idStart, next);
    if (keywordRelationalOperator.test(id)) { return false }
    if (isFor && !isAwaitUsing && id === "of") {
      // Look ahead for using declaration with initializer, i.e., `for (using of = ...)`
      skipWhiteSpace.lastIndex = next;
      var skipAfterOf = skipWhiteSpace.exec(this.input);
      next = next + skipAfterOf[0].length;
      if (this.input.charCodeAt(next) !== 61 /* '=' */ ||
        // Check for ==, === and => operators
        (ch = this.input.charCodeAt(next + 1)) === 61 /* '=' */ || ch === 62 /* '>' */) {
        return false
      }
    }
    return true
  };

  pp$8.isAwaitUsing = function(isFor) {
    return this.isUsingKeyword(true, isFor)
  };

  pp$8.isUsing = function(isFor) {
    return this.isUsingKeyword(false, isFor)
  };

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo)`, where looking at the previous token
  // does not help.

  pp$8.parseStatement = function(context, topLevel, exports$1) {
    var starttype = this.type, node = this.startNode(), kind;

    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case types$1._break: case types$1._continue: return this.parseBreakContinueStatement(node, starttype.keyword)
    case types$1._debugger: return this.parseDebuggerStatement(node)
    case types$1._do: return this.parseDoStatement(node)
    case types$1._for: return this.parseForStatement(node)
    case types$1._function:
      // Function as sole body of either an if statement or a labeled statement
      // works, but not when it is part of a labeled statement that is the sole
      // body of an if statement.
      if ((context && (this.strict || context !== "if" && context !== "label")) && this.options.ecmaVersion >= 6) { this.unexpected(); }
      return this.parseFunctionStatement(node, false, !context)
    case types$1._class:
      if (context) { this.unexpected(); }
      return this.parseClass(node, true)
    case types$1._if: return this.parseIfStatement(node)
    case types$1._return: return this.parseReturnStatement(node)
    case types$1._switch: return this.parseSwitchStatement(node)
    case types$1._throw: return this.parseThrowStatement(node)
    case types$1._try: return this.parseTryStatement(node)
    case types$1._const: case types$1._var:
      kind = kind || this.value;
      if (context && kind !== "var") { this.unexpected(); }
      return this.parseVarStatement(node, kind)
    case types$1._while: return this.parseWhileStatement(node)
    case types$1._with: return this.parseWithStatement(node)
    case types$1.braceL: return this.parseBlock(true, node)
    case types$1.semi: return this.parseEmptyStatement(node)
    case types$1._export:
    case types$1._import:
      if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
        skipWhiteSpace.lastIndex = this.pos;
        var skip = skipWhiteSpace.exec(this.input);
        var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
        if (nextCh === 40 || nextCh === 46) // '(' or '.'
          { return this.parseExpressionStatement(node, this.parseExpression()) }
      }

      if (!this.options.allowImportExportEverywhere) {
        if (!topLevel)
          { this.raise(this.start, "'import' and 'export' may only appear at the top level"); }
        if (!this.inModule)
          { this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'"); }
      }
      return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1)

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
    default:
      if (this.isAsyncFunction()) {
        if (context) { this.unexpected(); }
        this.next();
        return this.parseFunctionStatement(node, true, !context)
      }

      var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
      if (usingKind) {
        if (!this.allowUsing) {
          this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script` or in the bare case statement");
        }
        if (context) {
          // Cases like `for (;;) using x = ...;`, `if (true) await using x = ...;`, etc. are not allowed.
          this.raise(this.start, "Using declaration is not allowed in single-statement positions");
        }
        if (usingKind === "await using") {
          if (!this.canAwait) {
            this.raise(this.start, "Await using cannot appear outside of async function");
          }
          this.next();
        }
        this.next();
        this.parseVar(node, false, usingKind);
        this.semicolon();
        return this.finishNode(node, "VariableDeclaration")
      }

      var maybeName = this.value, expr = this.parseExpression();
      if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon))
        { return this.parseLabeledStatement(node, maybeName, expr, context) }
      else { return this.parseExpressionStatement(node, expr) }
    }
  };

  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.label = null; }
    else if (this.type !== types$1.name) { this.unexpected(); }
    else {
      node.label = this.parseIdent();
      this.semicolon();
    }

    // Verify that there is an actual destination to break or
    // continue to.
    var i = 0;
    for (; i < this.labels.length; ++i) {
      var lab = this.labels[i];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) { break }
        if (node.label && isBreak) { break }
      }
    }
    if (i === this.labels.length) { this.raise(node.start, "Unsyntactic " + keyword); }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement")
  };

  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement")
  };

  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6)
      { this.eat(types$1.semi); }
    else
      { this.semicolon(); }
    return this.finishNode(node, "DoWhileStatement")
  };

  // Disambiguating between a `for` and a `for`/`in` or `for`/`of`
  // loop is non-trivial. Basically, we have to parse the init `var`
  // statement or expression, disallowing the `in` operator (see
  // the second parameter to `parseExpression`), and then check
  // whether the next token is `in` or `of`. When there is no init
  // part (semicolon immediately after the opening parenthesis), it
  // is a regular `for` loop.

  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = (this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await")) ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) { this.unexpected(awaitAt); }
      return this.parseFor(node, null)
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      return this.parseForAfterInit(node, init$1, awaitAt)
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;

    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
    if (usingKind) {
      var init$2 = this.startNode();
      this.next();
      if (usingKind === "await using") {
        if (!this.canAwait) {
          this.raise(this.start, "Await using cannot appear outside of async function");
        }
        this.next();
      }
      this.parseVar(init$2, true, usingKind);
      this.finishNode(init$2, "VariableDeclaration");
      return this.parseForAfterInit(node, init$2, awaitAt)
    }
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors;
    var initPos = this.start;
    var init = awaitAt > -1
      ? this.parseExprSubscripts(refDestructuringErrors, "await")
      : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) { // implies `ecmaVersion >= 9` (see declaration of awaitAt)
        if (this.type === types$1._in) { this.unexpected(awaitAt); }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") { this.unexpected(); }
        else if (this.options.ecmaVersion >= 9) { node.await = false; }
      }
      if (startsWithLet && isForOf) { this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'."); }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init)
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  // Helper method to parse for loop after variable initialization
  pp$8.parseForAfterInit = function(node, init, awaitAt) {
    if ((this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of"))) && init.declarations.length === 1) {
      if (this.type === types$1._in) {
        if ((init.kind === "using" || init.kind === "await using") && !init.declarations[0].init) {
          this.raise(this.start, "Using declaration is not allowed in for-in loops");
        }
        if (this.options.ecmaVersion >= 9 && awaitAt > -1) { this.unexpected(awaitAt); }
      } else if (this.options.ecmaVersion >= 9) { node.await = awaitAt > -1; }
      return this.parseForIn(node, init)
    }
    if (awaitAt > -1) { this.unexpected(awaitAt); }
    return this.parseFor(node, init)
  };

  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync)
  };

  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    // allow function declarations in branches, but only in non-strict mode
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement")
  };

  pp$8.parseReturnStatement = function(node) {
    if (!this.allowReturn)
      { this.raise(this.start, "'return' outside of function"); }
    this.next();

    // In `return` (and `break`/`continue`), the keywords with
    // optional arguments, we eagerly look for a semicolon or the
    // possibility to insert one.

    if (this.eat(types$1.semi) || this.insertSemicolon()) { node.argument = null; }
    else { node.argument = this.parseExpression(); this.semicolon(); }
    return this.finishNode(node, "ReturnStatement")
  };

  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(SCOPE_SWITCH);

    // Statements under must be grouped (by label) in SwitchCase
    // nodes. `cur` is used to keep the node that we are currently
    // adding statements to.

    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR;) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) { this.finishNode(cur, "SwitchCase"); }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) { this.raiseRecoverable(this.lastTokStart, "Multiple default clauses"); }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) { this.unexpected(); }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) { this.finishNode(cur, "SwitchCase"); }
    this.next(); // Closing brace
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement")
  };

  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start)))
      { this.raise(this.lastTokEnd, "Illegal newline after throw"); }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement")
  };

  // Reused empty array added for node fields that are always empty.

  var empty$1 = [];

  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);

    return param
  };

  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) { this.unexpected(); }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer)
      { this.raise(node.start, "Missing catch or finally clause"); }
    return this.finishNode(node, "TryStatement")
  };

  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration")
  };

  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement")
  };

  pp$8.parseWithStatement = function(node) {
    if (this.strict) { this.raise(this.start, "'with' in strict mode"); }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement")
  };

  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement")
  };

  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list = this.labels; i$1 < list.length; i$1 += 1)
      {
      var label = list[i$1];

      if (label.name === maybeName)
        { this.raise(expr.start, "Label '" + maybeName + "' is already declared");
    } }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i = this.labels.length - 1; i >= 0; i--) {
      var label$1 = this.labels[i];
      if (label$1.statementStart === node.start) {
        // Update information about previous labels on this node
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else { break }
    }
    this.labels.push({name: maybeName, kind: kind, statementStart: this.start});
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement")
  };

  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement")
  };

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if ( createNewLexicalScope === void 0 ) createNewLexicalScope = true;
    if ( node === void 0 ) node = this.startNode();

    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) { this.enterScope(0); }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) { this.strict = false; }
    this.next();
    if (createNewLexicalScope) { this.exitScope(); }
    return this.finishNode(node, "BlockStatement")
  };

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement")
  };

  // Parse a `for`/`in` and `for`/`of` loop, which are almost
  // same from parser's perspective.

  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();

    if (
      init.type === "VariableDeclaration" &&
      init.declarations[0].init != null &&
      (
        !isForIn ||
        this.options.ecmaVersion < 8 ||
        this.strict ||
        init.kind !== "var" ||
        init.declarations[0].id.type !== "Identifier"
      )
    ) {
      this.raise(
        init.start,
        ((isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer")
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement")
  };

  // Parse a list of variable declarations.

  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (;;) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || (this.options.ecmaVersion >= 6 && this.isContextual("of")))) {
        this.unexpected();
      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
        this.raise(this.lastTokEnd, ("Missing initializer in " + kind + " declaration"));
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) { break }
    }
    return node
  };

  pp$8.parseVarId = function(decl, kind) {
    decl.id = kind === "using" || kind === "await using"
      ? this.parseIdent()
      : this.parseBindingAtom();

    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };

  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;

  // Parse a function declaration or literal (depending on the
  // `statement & FUNC_STATEMENT`).

  // Remove `allowExpressionBody` for 7.0.0, as it is only called with false
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && (statement & FUNC_HANGING_STATEMENT))
        { this.unexpected(); }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    if (statement & FUNC_STATEMENT) {
      node.id = (statement & FUNC_NULLABLE_ID) && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT))
        // If it is a regular function declaration in sloppy mode, then it is
        // subject to Annex B semantics (BIND_FUNCTION). Otherwise, the binding
        // mode depends on properties of the current scope (see
        // treatFunctionsAsVar).
        { this.checkLValSimple(node.id, (this.strict || node.generator || node.async) ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION); }
    }

    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));

    if (!(statement & FUNC_STATEMENT))
      { node.id = this.type === types$1.name ? this.parseIdent() : null; }

    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, (statement & FUNC_STATEMENT) ? "FunctionDeclaration" : "FunctionExpression")
  };

  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };

  // Parse a class declaration or literal (depending on the
  // `isStatement` parameter).

  pp$8.parseClass = function(node, isStatement) {
    this.next();

    // ecma-262 14.6 Class Definitions
    // A class definition is always strict mode code.
    var oldStrict = this.strict;
    this.strict = true;

    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) { this.raiseRecoverable(element.start, "Duplicate constructor in the same class"); }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, ("Identifier '#" + (element.key.name) + "' has already been declared"));
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression")
  };

  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) { return null }

    var ecmaVersion = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;

    if (this.eatContextual("static")) {
      // Parse static init block
      if (ecmaVersion >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }

    // Parse element name
    if (keyName) {
      // 'async', 'get', 'set', or 'static' were not a keyword contextually.
      // The last token is any of those. Make it the element name.
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }

    // Parse element value
    if (ecmaVersion < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      // Couldn't move this check into the 'parseClassMethod' method for backward compatibility.
      if (isConstructor && kind !== "method") { this.raise(node.key.start, "Constructor can't have get/set modifier"); }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }

    return node
  };

  pp$8.isClassElementNameStart = function() {
    return (
      this.type === types$1.name ||
      this.type === types$1.privateId ||
      this.type === types$1.num ||
      this.type === types$1.string ||
      this.type === types$1.bracketL ||
      this.type.keyword
    )
  };

  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };

  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    // Check key and flags
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) { this.raise(key.start, "Constructor can't be a generator"); }
      if (isAsync) { this.raise(key.start, "Constructor can't be an async method"); }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }

    // Parse value
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);

    // Check value
    if (method.kind === "get" && value.params.length !== 0)
      { this.raiseRecoverable(value.start, "getter should have no params"); }
    if (method.kind === "set" && value.params.length !== 1)
      { this.raiseRecoverable(value.start, "setter should have exactly one param"); }
    if (method.kind === "set" && value.params[0].type === "RestElement")
      { this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params"); }

    return this.finishNode(method, "MethodDefinition")
  };

  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }

    if (this.eat(types$1.eq)) {
      // To raise SyntaxError if 'arguments' exists in the initializer.
      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
      field.value = this.parseMaybeAssign();
      this.exitScope();
    } else {
      field.value = null;
    }
    this.semicolon();

    return this.finishNode(field, "PropertyDefinition")
  };

  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];

    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;

    return this.finishNode(node, "StaticBlock")
  };

  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement)
        { this.checkLValSimple(node.id, BIND_LEXICAL, false); }
    } else {
      if (isStatement === true)
        { this.unexpected(); }
      node.id = null;
    }
  };

  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };

  pp$8.enterClassBody = function() {
    var element = {declared: Object.create(null), used: []};
    this.privateNameStack.push(element);
    return element.declared
  };

  pp$8.exitClassBody = function() {
    var ref = this.privateNameStack.pop();
    var declared = ref.declared;
    var used = ref.used;
    if (!this.options.checkPrivateFields) { return }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i = 0; i < used.length; ++i) {
      var id = used[i];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, ("Private field '#" + (id.name) + "' must be declared in an enclosing class"));
        }
      }
    }
  };

  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];

    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }

    // `class { get #a(){}; static set #a(_){} }` is also conflict.
    if (
      curr === "iget" && next === "iset" ||
      curr === "iset" && next === "iget" ||
      curr === "sget" && next === "sset" ||
      curr === "sset" && next === "sget"
    ) {
      privateNameMap[name] = "true";
      return false
    } else if (!curr) {
      privateNameMap[name] = next;
      return false
    } else {
      return true
    }
  }

  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (
      key.type === "Identifier" && key.name === name ||
      key.type === "Literal" && key.value === name
    )
  }

  // Parses module export declaration.

  pp$8.parseExportAllDeclaration = function(node, exports$1) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports$1, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) { this.unexpected(); }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration")
  };

  pp$8.parseExport = function(node, exports$1) {
    this.next();
    // export * from '...'
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports$1)
    }
    if (this.eat(types$1._default)) { // export default ...
      this.checkExport(exports$1, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration")
    }
    // export var|const|let|function|class ...
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration")
        { this.checkVariableExport(exports$1, node.declaration.declarations); }
      else
        { this.checkExport(exports$1, node.declaration.id, node.declaration.id.start); }
      node.specifiers = [];
      node.source = null;
      if (this.options.ecmaVersion >= 16)
        { node.attributes = []; }
    } else { // export { x, y as z } [from '...']
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports$1);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) { this.unexpected(); }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16)
          { node.attributes = this.parseWithClause(); }
      } else {
        for (var i = 0, list = node.specifiers; i < list.length; i += 1) {
          // check for keywords used as local names
          var spec = list[i];

          this.checkUnreserved(spec.local);
          // check if export is defined
          this.checkLocalExport(spec.local);

          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }

        node.source = null;
        if (this.options.ecmaVersion >= 16)
          { node.attributes = []; }
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration")
  };

  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null)
  };

  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) { this.next(); }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync)
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID")
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration
    }
  };

  pp$8.checkExport = function(exports$1, name, pos) {
    if (!exports$1) { return }
    if (typeof name !== "string")
      { name = name.type === "Identifier" ? name.name : name.value; }
    if (hasOwn(exports$1, name))
      { this.raiseRecoverable(pos, "Duplicate export '" + name + "'"); }
    exports$1[name] = true;
  };

  pp$8.checkPatternExport = function(exports$1, pat) {
    var type = pat.type;
    if (type === "Identifier")
      { this.checkExport(exports$1, pat, pat.start); }
    else if (type === "ObjectPattern")
      { for (var i = 0, list = pat.properties; i < list.length; i += 1)
        {
          var prop = list[i];

          this.checkPatternExport(exports$1, prop);
        } }
    else if (type === "ArrayPattern")
      { for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];

          if (elt) { this.checkPatternExport(exports$1, elt); }
      } }
    else if (type === "Property")
      { this.checkPatternExport(exports$1, pat.value); }
    else if (type === "AssignmentPattern")
      { this.checkPatternExport(exports$1, pat.left); }
    else if (type === "RestElement")
      { this.checkPatternExport(exports$1, pat.argument); }
  };

  pp$8.checkVariableExport = function(exports$1, decls) {
    if (!exports$1) { return }
    for (var i = 0, list = decls; i < list.length; i += 1)
      {
      var decl = list[i];

      this.checkPatternExport(exports$1, decl.id);
    }
  };

  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" ||
      this.type.keyword === "const" ||
      this.type.keyword === "class" ||
      this.type.keyword === "function" ||
      this.isLet() ||
      this.isAsyncFunction()
  };

  // Parses a comma-separated list of module exports.

  pp$8.parseExportSpecifier = function(exports$1) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();

    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports$1,
      node.exported,
      node.exported.start
    );

    return this.finishNode(node, "ExportSpecifier")
  };

  pp$8.parseExportSpecifiers = function(exports$1) {
    var nodes = [], first = true;
    // export { x, y as z } [from '...']
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseExportSpecifier(exports$1));
    }
    return nodes
  };

  // Parses import declaration.

  pp$8.parseImport = function(node) {
    this.next();

    // import '...'
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16)
      { node.attributes = this.parseWithClause(); }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration")
  };

  // Parses a comma-separated list of module imports.

  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();

    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);

    return this.finishNode(node, "ImportSpecifier")
  };

  pp$8.parseImportDefaultSpecifier = function() {
    // import defaultObj, { x, y as z } from '...'
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier")
  };

  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier")
  };

  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) { return nodes }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      nodes.push(this.parseImportSpecifier());
    }
    return nodes
  };

  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName))
        { this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'"); }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes
  };

  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute")
  };

  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral
    }
    return this.parseIdent(true)
  };

  // Set `ExpressionStatement#directive` property for directive prologues.
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i = 0; i < statements.length && this.isDirectiveCandidate(statements[i]); ++i) {
      statements[i].directive = statements[i].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return (
      this.options.ecmaVersion >= 5 &&
      statement.type === "ExpressionStatement" &&
      statement.expression.type === "Literal" &&
      typeof statement.expression.value === "string" &&
      // Reject parenthesized strings.
      (this.input[statement.start] === "\"" || this.input[statement.start] === "'")
    )
  };

  var pp$7 = Parser.prototype;

  // Convert existing expression atom to assignable pattern
  // if possible.

  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
      case "Identifier":
        if (this.inAsync && node.name === "await")
          { this.raise(node.start, "Cannot use 'await' as identifier inside an async function"); }
        break

      case "ObjectPattern":
      case "ArrayPattern":
      case "AssignmentPattern":
      case "RestElement":
        break

      case "ObjectExpression":
        node.type = "ObjectPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        for (var i = 0, list = node.properties; i < list.length; i += 1) {
          var prop = list[i];

        this.toAssignable(prop, isBinding);
          // Early error:
          //   AssignmentRestProperty[Yield, Await] :
          //     `...` DestructuringAssignmentTarget[Yield, Await]
          //
          //   It is a Syntax Error if |DestructuringAssignmentTarget| is an |ArrayLiteral| or an |ObjectLiteral|.
          if (
            prop.type === "RestElement" &&
            (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")
          ) {
            this.raise(prop.argument.start, "Unexpected token");
          }
        }
        break

      case "Property":
        // AssignmentProperty has type === "Property"
        if (node.kind !== "init") { this.raise(node.key.start, "Object pattern can't contain getter or setter"); }
        this.toAssignable(node.value, isBinding);
        break

      case "ArrayExpression":
        node.type = "ArrayPattern";
        if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
        this.toAssignableList(node.elements, isBinding);
        break

      case "SpreadElement":
        node.type = "RestElement";
        this.toAssignable(node.argument, isBinding);
        if (node.argument.type === "AssignmentPattern")
          { this.raise(node.argument.start, "Rest elements cannot have a default value"); }
        break

      case "AssignmentExpression":
        if (node.operator !== "=") { this.raise(node.left.end, "Only '=' operator can be used for specifying default value."); }
        node.type = "AssignmentPattern";
        delete node.operator;
        this.toAssignable(node.left, isBinding);
        break

      case "ParenthesizedExpression":
        this.toAssignable(node.expression, isBinding, refDestructuringErrors);
        break

      case "ChainExpression":
        this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
        break

      case "MemberExpression":
        if (!isBinding) { break }

      default:
        this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) { this.checkPatternErrors(refDestructuringErrors, true); }
    return node
  };

  // Convert list of expression atoms to binding list.

  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i = 0; i < end; i++) {
      var elt = exprList[i];
      if (elt) { this.toAssignable(elt, isBinding); }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier")
        { this.unexpected(last.argument.start); }
    }
    return exprList
  };

  // Parses spread element.

  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement")
  };

  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();

    // RestElement inside of a function parameter must be an identifier
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name)
      { this.unexpected(); }

    node.argument = this.parseBindingAtom();

    return this.finishNode(node, "RestElement")
  };

  // Parses lvalue (assignable) atom.

  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
      case types$1.bracketL:
        var node = this.startNode();
        this.next();
        node.elements = this.parseBindingList(types$1.bracketR, true, true);
        return this.finishNode(node, "ArrayPattern")

      case types$1.braceL:
        return this.parseObj(true)
      }
    }
    return this.parseIdent()
  };

  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) { first = false; }
      else { this.expect(types$1.comma); }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) { this.raiseRecoverable(this.start, "Comma is not permitted after the rest element"); }
        this.expect(close);
        break
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts
  };

  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem
  };

  pp$7.parseBindingListItem = function(param) {
    return param
  };

  // Parses assignment pattern around given atom if possible.

  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) { return left }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern")
  };

  // The following three functions all verify that a node is an lvalue —
  // something that can be bound, or assigned to. In order to do so, they perform
  // a variety of checks:
  //
  // - Check that none of the bound/assigned-to identifiers are reserved words.
  // - Record name declarations for bindings in the appropriate scope.
  // - Check duplicate argument names, if checkClashes is set.
  //
  // If a complex binding pattern is encountered (e.g., object and array
  // destructuring), the entire pattern is recursively checked.
  //
  // There are three versions of checkLVal*() appropriate for different
  // circumstances:
  //
  // - checkLValSimple() shall be used if the syntactic construct supports
  //   nothing other than identifiers and member expressions. Parenthesized
  //   expressions are also correctly handled. This is generally appropriate for
  //   constructs for which the spec says
  //
  //   > It is a Syntax Error if AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   It is also appropriate for checking if an identifier is valid and not
  //   defined elsewhere, like import declarations or function/class identifiers.
  //
  //   Examples where this is used include:
  //     a += …;
  //     import a from '…';
  //   where a is the node to be checked.
  //
  // - checkLValPattern() shall be used if the syntactic construct supports
  //   anything checkLValSimple() supports, as well as object and array
  //   destructuring patterns. This is generally appropriate for constructs for
  //   which the spec says
  //
  //   > It is a Syntax Error if [the production] is neither an ObjectLiteral nor
  //   > an ArrayLiteral and AssignmentTargetType of [the production] is not
  //   > simple.
  //
  //   Examples where this is used include:
  //     (a = …);
  //     const a = …;
  //     try { … } catch (a) { … }
  //   where a is the node to be checked.
  //
  // - checkLValInnerPattern() shall be used if the syntactic construct supports
  //   anything checkLValPattern() supports, as well as default assignment
  //   patterns, rest elements, and other constructs that may appear within an
  //   object or array destructuring pattern.
  //
  //   As a special case, function parameters also use checkLValInnerPattern(),
  //   as they also support defaults and rest constructs.
  //
  // These functions deliberately support both assignment and binding constructs,
  // as the logic for both is exceedingly similar. If the node is the target of
  // an assignment, then bindingType should be set to BIND_NONE. Otherwise, it
  // should be set to the appropriate BIND_* constant, like BIND_VAR or
  // BIND_LEXICAL.
  //
  // If the function is called with a non-BIND_NONE bindingType, then
  // additionally a checkClashes object may be specified to allow checking for
  // duplicate argument names. checkClashes is ignored if the provided construct
  // is an assignment (i.e., bindingType is BIND_NONE).

  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    var isBind = bindingType !== BIND_NONE;

    switch (expr.type) {
    case "Identifier":
      if (this.strict && this.reservedWordsStrictBind.test(expr.name))
        { this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode"); }
      if (isBind) {
        if (bindingType === BIND_LEXICAL && expr.name === "let")
          { this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name"); }
        if (checkClashes) {
          if (hasOwn(checkClashes, expr.name))
            { this.raiseRecoverable(expr.start, "Argument name clash"); }
          checkClashes[expr.name] = true;
        }
        if (bindingType !== BIND_OUTSIDE) { this.declareName(expr.name, bindingType, expr.start); }
      }
      break

    case "ChainExpression":
      this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
      break

    case "MemberExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding member expression"); }
      break

    case "ParenthesizedExpression":
      if (isBind) { this.raiseRecoverable(expr.start, "Binding parenthesized expression"); }
      return this.checkLValSimple(expr.expression, bindingType, checkClashes)

    default:
      this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };

  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "ObjectPattern":
      for (var i = 0, list = expr.properties; i < list.length; i += 1) {
        var prop = list[i];

      this.checkLValInnerPattern(prop, bindingType, checkClashes);
      }
      break

    case "ArrayPattern":
      for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
        var elem = list$1[i$1];

      if (elem) { this.checkLValInnerPattern(elem, bindingType, checkClashes); }
      }
      break

    default:
      this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };

  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if ( bindingType === void 0 ) bindingType = BIND_NONE;

    switch (expr.type) {
    case "Property":
      // AssignmentProperty has type === "Property"
      this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
      break

    case "AssignmentPattern":
      this.checkLValPattern(expr.left, bindingType, checkClashes);
      break

    case "RestElement":
      this.checkLValPattern(expr.argument, bindingType, checkClashes);
      break

    default:
      this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };

  // The algorithm used to determine whether a regexp can appear at a
  // given point in the program is loosely based on sweet.js' approach.
  // See https://github.com/mozilla/sweet.js/wiki/design


  var TokContext = function TokContext(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };

  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function (p) { return p.tryReadTemplateToken(); }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };

  var pp$6 = Parser.prototype;

  pp$6.initialContext = function() {
    return [types.b_stat]
  };

  pp$6.curContext = function() {
    return this.context[this.context.length - 1]
  };

  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat)
      { return true }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr))
      { return !parent.isExpr }

    // The check for `tt.name && exprAllowed` detects whether we are
    // after a `yield` or `of` construct. See the `updateContext` for
    // `tt.name`.
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed)
      { return lineBreak.test(this.input.slice(this.lastTokEnd, this.start)) }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow)
      { return true }
    if (prevType === types$1.braceL)
      { return parent === types.b_stat }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name)
      { return false }
    return !this.exprAllowed
  };

  pp$6.inGeneratorContext = function() {
    for (var i = this.context.length - 1; i >= 1; i--) {
      var context = this.context[i];
      if (context.token === "function")
        { return context.generator }
    }
    return false
  };

  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot)
      { this.exprAllowed = false; }
    else if (update = type.updateContext)
      { update.call(this, prevType); }
    else
      { this.exprAllowed = type.beforeExpr; }
  };

  // Used to handle edge cases when token context could not be inferred correctly during tokenization phase

  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };

  // Token-specific context update code

  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };

  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };

  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };

  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };

  types$1.incDec.updateContext = function() {
    // tokExprAllowed stays unchanged
  };

  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else &&
        !(prevType === types$1.semi && this.curContext() !== types.p_stat) &&
        !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) &&
        !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat))
      { this.context.push(types.f_expr); }
    else
      { this.context.push(types.f_stat); }
    this.exprAllowed = false;
  };

  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") { this.context.pop(); }
    this.exprAllowed = true;
  };

  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl)
      { this.context.pop(); }
    else
      { this.context.push(types.q_tmpl); }
    this.exprAllowed = false;
  };

  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr)
        { this.context[index] = types.f_expr_gen; }
      else
        { this.context[index] = types.f_gen; }
    }
    this.exprAllowed = true;
  };

  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed ||
          this.value === "yield" && this.inGeneratorContext())
        { allowed = true; }
    }
    this.exprAllowed = allowed;
  };

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser


  var pp$5 = Parser.prototype;

  // Check if property name clashes with already added.
  // Object/class getters and setters are not allowed to clash —
  // either with each other or with an init property — and in
  // strict mode, init properties are also not allowed to be repeated.

  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement")
      { return }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand))
      { return }
    var key = prop.key;
    var name;
    switch (key.type) {
    case "Identifier": name = key.name; break
    case "Literal": name = String(key.value); break
    default: return
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition)
        { this.raiseRecoverable(key.start, "Redefinition of property"); }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The optional arguments are used to
  // forbid the `in` operator (in for loops initalization expressions)
  // and provide reference for storing '=' operator inside shorthand
  // property assignment in contexts where both object expression
  // and object pattern might appear (so it's possible to raise
  // delayed syntax error at correct position).

  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var this$1$1 = this;

    return this.catchStackOverflow(function () {
      var startPos = this$1$1.start, startLoc = this$1$1.startLoc;
      var expr = this$1$1.parseMaybeAssign(forInit, refDestructuringErrors);
      if (this$1$1.type === types$1.comma) {
        var node = this$1$1.startNodeAt(startPos, startLoc);
        node.expressions = [expr];
        while (this$1$1.eat(types$1.comma)) { node.expressions.push(this$1$1.parseMaybeAssign(forInit, refDestructuringErrors)); }
        return this$1$1.finishNode(node, "SequenceExpression")
      }
      return expr
    })
  };

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) { return this.parseYield(forInit) }
      // The tokenizer will assume an expression is allowed after
      // `yield`, but this isn't that kind of yield
      else { this.exprAllowed = false; }
    }

    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors;
      ownDestructuringErrors = true;
    }

    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) { left = afterLeftParse.call(this, left, startPos, startLoc); }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq)
        { left = this.toAssignable(left, false, refDestructuringErrors); }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start)
        { refDestructuringErrors.shorthandAssign = -1; } // reset because shorthand default was used correctly
      if (this.type === types$1.eq)
        { this.checkLValPattern(left); }
      else
        { this.checkLValSimple(left); }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) { refDestructuringErrors.doubleProto = oldDoubleProto; }
      return this.finishNode(node, "AssignmentExpression")
    } else {
      if (ownDestructuringErrors) { this.checkExpressionErrors(refDestructuringErrors, true); }
    }
    if (oldParenAssign > -1) { refDestructuringErrors.parenthesizedAssign = oldParenAssign; }
    if (oldTrailingComma > -1) { refDestructuringErrors.trailingComma = oldTrailingComma; }
    return left
  };

  // Parse a ternary conditional (`?:`) operator.

  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    if (!(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression")
    }
    return expr
  };

  // Start the precedence parser.

  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit)
  };

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          // Handle the precedence of `tt.coalesce` as equal to the range of logical expressions.
          // In other words, `node.right` shouldn't contain logical expressions in order to check the mixed error.
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if ((logical && this.type === types$1.coalesce) || (coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND))) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit)
      }
    }
    return left
  };

  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") { this.raise(right.start, "Private identifier can only be left side of binary expression"); }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression")
  };

  // Parse unary operators, both prefix and postfix.

  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) { this.checkLValSimple(node.argument); }
      else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument))
        { this.raiseRecoverable(node.start, "Deleting local variable in strict mode"); }
      else if (node.operator === "delete" && isPrivateFieldAccess(node.argument))
        { this.raiseRecoverable(node.start, "Private fields can not be deleted"); }
      else { sawUnary = true; }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) { this.unexpected(); }
      expr = this.parsePrivateIdent();
      // only could be private fields in 'in', such as #x in obj
      if (this.type !== types$1._in) { this.unexpected(); }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) { return expr }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }

    if (!incDec && !(expr.type === "ArrowFunctionExpression" && expr.start === startPos) && this.eat(types$1.starstar)) {
      if (sawUnary)
        { this.unexpected(this.lastTokStart); }
      else
        { return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false) }
    } else {
      return expr
    }
  };

  function isLocalVariableAccess(node) {
    return (
      node.type === "Identifier" ||
      node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression)
    )
  }

  function isPrivateFieldAccess(node) {
    return (
      node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" ||
      node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) ||
      node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression)
    )
  }

  // Parse call, dot, and `[]`-subscript expressions.

  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")")
      { return expr }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) { refDestructuringErrors.parenthesizedAssign = -1; }
      if (refDestructuringErrors.parenthesizedBind >= result.start) { refDestructuringErrors.parenthesizedBind = -1; }
      if (refDestructuringErrors.trailingComma >= result.start) { refDestructuringErrors.trailingComma = -1; }
    }
    return result
  };

  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" &&
        this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 &&
        this.potentialArrowAt === base.start;
    var optionalChained = false;

    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);

      if (element.optional) { optionalChained = true; }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element
      }

      base = element;
    }
  };

  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow)
  };

  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit)
  };

  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) { this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions"); }

    var computed = this.eat(types$1.bracketL);
    if (computed || (optional && this.type !== types$1.parenL && this.type !== types$1.backQuote) || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0)
          { this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function"); }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit)
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({isTagged: true});
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base
  };

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    // If a division operator appears in an expression position, the
    // tokenizer got confused, and we force it to read a regexp instead.
    if (this.type === types$1.slash) { this.readRegexp(); }

    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
    case types$1._super:
      if (!this.allowSuper)
        { this.raise(this.start, "'super' keyword outside a method"); }
      node = this.startNode();
      this.next();
      if (this.type === types$1.parenL && !this.allowDirectSuper)
        { this.raise(node.start, "super() call outside constructor of a subclass"); }
      // The `super` keyword can appear at below:
      // SuperProperty:
      //     super [ Expression ]
      //     super . IdentifierName
      // SuperCall:
      //     super ( Arguments )
      if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL)
        { this.unexpected(); }
      return this.finishNode(node, "Super")

    case types$1._this:
      node = this.startNode();
      this.next();
      return this.finishNode(node, "ThisExpression")

    case types$1.name:
      var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
      var id = this.parseIdent(false);
      if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
        this.overrideContext(types.f_expr);
        return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit)
      }
      if (canBeArrow && !this.canInsertSemicolon()) {
        if (this.eat(types$1.arrow))
          { return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit) }
        if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc &&
            (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
          id = this.parseIdent(false);
          if (this.canInsertSemicolon() || !this.eat(types$1.arrow))
            { this.unexpected(); }
          return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit)
        }
      }
      return id

    case types$1.regexp:
      var value = this.value;
      node = this.parseLiteral(value.value);
      node.regex = {pattern: value.pattern, flags: value.flags};
      return node

    case types$1.num: case types$1.string:
      return this.parseLiteral(this.value)

    case types$1._null: case types$1._true: case types$1._false:
      node = this.startNode();
      node.value = this.type === types$1._null ? null : this.type === types$1._true;
      node.raw = this.type.keyword;
      this.next();
      return this.finishNode(node, "Literal")

    case types$1.parenL:
      var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
      if (refDestructuringErrors) {
        if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr))
          { refDestructuringErrors.parenthesizedAssign = start; }
        if (refDestructuringErrors.parenthesizedBind < 0)
          { refDestructuringErrors.parenthesizedBind = start; }
      }
      return expr

    case types$1.bracketL:
      node = this.startNode();
      this.next();
      node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
      return this.finishNode(node, "ArrayExpression")

    case types$1.braceL:
      this.overrideContext(types.b_expr);
      return this.parseObj(false, refDestructuringErrors)

    case types$1._function:
      node = this.startNode();
      this.next();
      return this.parseFunction(node, 0)

    case types$1._class:
      return this.parseClass(this.startNode(), false)

    case types$1._new:
      return this.parseNew()

    case types$1.backQuote:
      return this.parseTemplate()

    case types$1._import:
      if (this.options.ecmaVersion >= 11) {
        return this.parseExprImport(forNew)
      } else {
        return this.unexpected()
      }

    default:
      return this.parseExprAtomDefault()
    }
  };

  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };

  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();

    // Consume `import` as an identifier for `import.meta`.
    // Because `this.parseIdent(true)` doesn't check escape sequences, it needs the check of `this.containsEsc`.
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword import"); }
    this.next();

    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node)
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node)
    } else {
      this.unexpected();
    }
  };

  pp$5.parseDynamicImport = function(node) {
    this.next(); // skip `(`

    // Parse node.source.
    node.source = this.parseMaybeAssign();

    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      // Verify ending.
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }

    return this.finishNode(node, "ImportExpression")
  };

  pp$5.parseImportMeta = function(node) {
    this.next(); // skip `.`

    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);

    if (node.property.name !== "meta")
      { this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'"); }
    if (containsEsc)
      { this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters"); }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere)
      { this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module"); }

    return this.finishNode(node, "MetaProperty")
  };

  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110)
      { node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, ""); }
    this.next();
    return this.finishNode(node, "Literal")
  };

  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val
  };

  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon()
  };

  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();

      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors, oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      // Do not save awaitIdentPos to allow checking awaits nested in parameters
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);

      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit)
      }

      if (!exprList.length || lastIsComma) { this.unexpected(this.lastTokStart); }
      if (spreadStart) { this.unexpected(spreadStart); }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;

      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }

    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression")
    } else {
      return val
    }
  };

  pp$5.parseParenItem = function(item) {
    return item
  };

  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit)
  };

  // New's precedence is slightly tricky. It must allow its argument to
  // be a `[]` or dot subscript expression, but not a call — at least,
  // not without wrapping it in parentheses. Thus, it uses the noCalls
  // argument to parseSubscripts to prevent it from consuming the
  // argument list.

  var empty = [];

  pp$5.parseNew = function() {
    if (this.containsEsc) { this.raiseRecoverable(this.start, "Escape sequence in keyword new"); }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target")
        { this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'"); }
      if (containsEsc)
        { this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters"); }
      if (!this.allowNewDotTarget)
        { this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block"); }
      return this.finishNode(node, "MetaProperty")
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (node.callee.type === "Super")
      { this.raiseRecoverable(startPos, "Invalid use of 'super'"); }
    if (this.eat(types$1.parenL)) { node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false); }
    else { node.arguments = empty; }
    return this.finishNode(node, "NewExpression")
  };

  // Parse template expression.

  pp$5.parseTemplateElement = function(ref) {
    var isTagged = ref.isTagged;

    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, "\n"),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement")
  };

  pp$5.parseTemplate = function(ref) {
    if ( ref === void 0 ) ref = {};
    var isTagged = ref.isTagged; if ( isTagged === void 0 ) isTagged = false;

    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({isTagged: isTagged});
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) { this.raise(this.pos, "Unterminated template literal"); }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({isTagged: isTagged}));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral")
  };

  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" &&
      (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || (this.options.ecmaVersion >= 9 && this.type === types$1.star)) &&
      !lineBreak.test(this.input.slice(this.lastTokEnd, this.start))
  };

  // Parse an object literal or binding pattern.

  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) { break }
      } else { first = false; }

      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) { this.checkPropClash(prop, propHash, refDestructuringErrors); }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression")
  };

  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement")
      }
      // Parse argument.
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      // To disallow trailing comma via `this.toAssignable()`.
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      // Finish
      return this.finishNode(prop, "SpreadElement")
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern)
        { isGenerator = this.eat(types$1.star); }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property")
  };

  pp$5.parseGetterSetter = function(prop) {
    var kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    prop.kind = kind;
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get")
        { this.raiseRecoverable(start, "getter should have no params"); }
      else
        { this.raiseRecoverable(start, "setter should have exactly one param"); }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement")
        { this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params"); }
    }
  };

  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon)
      { this.unexpected(); }

    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) { this.unexpected(); }
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
      prop.kind = "init";
    } else if (!isPattern && !containsEsc &&
               this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" &&
               (prop.key.name === "get" || prop.key.name === "set") &&
               (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) { this.unexpected(); }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = startPos; }
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0)
          { refDestructuringErrors.shorthandAssign = this.start; }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.kind = "init";
      prop.shorthand = true;
    } else { this.unexpected(); }
  };

  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never")
  };

  // Initialize empty function node.

  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) { node.generator = node.expression = false; }
    if (this.options.ecmaVersion >= 8) { node.async = false; }
  };

  // Parse object or class method.

  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.initFunction(node);
    if (this.options.ecmaVersion >= 6)
      { node.generator = isGenerator; }
    if (this.options.ecmaVersion >= 8)
      { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));

    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression")
  };

  // Parse arrow function expression with given parameters.

  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;

    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) { node.async = !!isAsync; }

    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;

    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);

    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression")
  };

  // Parse function body and check parameters.

  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;

    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        // If this is a strict mode function, verify that argument names
        // are not repeated, and it does not try to bind the words `eval`
        // or `arguments`.
        if (useStrict && nonSimple)
          { this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list"); }
      }
      // Start a new scope with regard to labels and the `inFunction`
      // flag (restore them to their old value afterwards).
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) { this.strict = true; }

      // Add the params to varDeclaredNames to ensure that an error is thrown
      // if a let/const declaration in the function clashes with one of the params.
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      // Ensure the function name isn't a forbidden identifier in strict mode, e.g. 'eval'
      if (this.strict && node.id) { this.checkLValSimple(node.id, BIND_OUTSIDE); }
      node.body = this.parseBlock(false, undefined, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };

  pp$5.isSimpleParamList = function(params) {
    for (var i = 0, list = params; i < list.length; i += 1)
      {
      var param = list[i];

      if (param.type !== "Identifier") { return false
    } }
    return true
  };

  // Checks function params for various disallowed patterns such as using "eval"
  // or "arguments" and duplicate parameters.

  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = Object.create(null);
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) { break }
      } else { first = false; }

      var elt = (void 0);
      if (allowEmpty && this.type === types$1.comma)
        { elt = null; }
      else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0)
          { refDestructuringErrors.trailingComma = this.start; }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts
  };

  pp$5.checkUnreserved = function(ref) {
    var start = ref.start;
    var end = ref.end;
    var name = ref.name;

    if (this.inGenerator && name === "yield")
      { this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator"); }
    if (this.inAsync && name === "await")
      { this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function"); }
    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments")
      { this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer"); }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await"))
      { this.raise(start, ("Cannot use " + name + " in class static initialization block")); }
    if (this.keywords.test(name))
      { this.raise(start, ("Unexpected keyword '" + name + "'")); }
    if (this.options.ecmaVersion < 6 &&
      this.input.slice(start, end).indexOf("\\") !== -1) { return }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await")
        { this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function"); }
      this.raiseRecoverable(start, ("The keyword '" + name + "' is reserved"));
    }
  };

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos)
        { this.awaitIdentPos = node.start; }
    }
    return node
  };

  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;

      // To fix https://github.com/acornjs/acorn/issues/575
      // `class` and `function` keywords push new context into this.context.
      // But there is no chance to pop the context if the keyword is consumed as an identifier such as a property name.
      // If the previous token is a dot, this does not apply because the context-managing code already ignored the keyword
      if ((node.name === "class" || node.name === "function") &&
        (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node
  };

  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");

    // For validating existence
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, ("Private field '#" + (node.name) + "' must be declared in an enclosing class"));
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }

    return node
  };

  // Parses yield expression inside generator.

  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) { this.yieldPos = this.start; }

    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || (this.type !== types$1.star && !this.type.startsExpr)) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression")
  };

  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) { this.awaitPos = this.start; }

    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression")
  };

  var pp$4 = Parser.prototype;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    if (this.sourceFile) {
      message += " in " + this.sourceFile;
    }
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = this.pos;
    throw err
  };

  pp$4.raiseRecoverable = pp$4.raise;

  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart)
    }
  };

  var pp$3 = Parser.prototype;

  var Scope = function Scope(flags) {
    this.flags = flags;
    // A list of var-declared names in the current lexical scope
    this.var = [];
    // A list of lexically-declared names in the current lexical scope
    this.lexical = [];
    // A list of lexically-declared FunctionDeclaration names in the current lexical scope
    this.functions = [];
  };

  // The functions in this module keep track of declared variables in the current scope in order to detect duplicate variable names.

  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };

  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };

  // The spec says:
  // > At the top level of a function, or script, function declarations are
  // > treated like var declarations rather than like lexical declarations.
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return (scope.flags & SCOPE_FUNCTION) || !this.inModule && (scope.flags & SCOPE_TOP)
  };

  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && (scope.flags & SCOPE_TOP))
        { delete this.undefinedExports[name]; }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar)
        { redeclared = scope$2.lexical.indexOf(name) > -1; }
      else
        { redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1; }
      scope$2.functions.push(name);
    } else {
      for (var i = this.scopeStack.length - 1; i >= 0; --i) {
        var scope$3 = this.scopeStack[i];
        if (scope$3.lexical.indexOf(name) > -1 && !((scope$3.flags & SCOPE_SIMPLE_CATCH) && scope$3.lexical[0] === name) ||
            !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break
        }
        scope$3.var.push(name);
        if (this.inModule && (scope$3.flags & SCOPE_TOP))
          { delete this.undefinedExports[name]; }
        if (scope$3.flags & SCOPE_VAR) { break }
      }
    }
    if (redeclared) { this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared")); }
  };

  pp$3.checkLocalExport = function(id) {
    // scope.functions must be empty as Module code is always strict.
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 &&
        this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };

  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1]
  };

  pp$3.currentVarScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) { return scope }
    }
  };

  // Could be useful for `this`, `new.target`, `super()`, `super.property`, and `super[property]`.
  pp$3.currentThisScope = function() {
    for (var i = this.scopeStack.length - 1;; i--) {
      var scope = this.scopeStack[i];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) &&
          !(scope.flags & SCOPE_ARROW)) { return scope }
    }
  };

  var Node = function Node(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations)
      { this.loc = new SourceLocation(parser, loc); }
    if (parser.options.directSourceFile)
      { this.sourceFile = parser.options.directSourceFile; }
    if (parser.options.ranges)
      { this.range = [pos, 0]; }
  };

  // Start an AST node, attaching a start offset.

  var pp$2 = Parser.prototype;

  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc)
  };

  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc)
  };

  // Finish an AST node, adding `type` and `end` properties.

  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations)
      { node.loc.end = loc; }
    if (this.options.ranges)
      { node.range[1] = pos; }
    return node
  }

  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc)
  };

  // Finish node at given position

  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc)
  };

  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) { newNode[prop] = node[prop]; }
    return newNode
  };

  // This file was generated by "bin/generate-unicode-script-values.js". Do not modify manually!
  var scriptValuesAddedInUnicode = "Berf Beria_Erfe Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sidetic Sidt Sunu Sunuwar Tai_Yo Tayo Todhri Todr Tolong_Siki Tols Tulu_Tigalari Tutg Unknown Zzzz";

  // This file contains Unicode properties extracted from the ECMAScript specification.
  // The lists are extracted like so:
  // $$('#table-binary-unicode-properties > figure > table > tbody > tr > td:nth-child(1) code').map(el => el.innerText)

  // #table-binary-unicode-properties
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;

  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };

  // #table-binary-unicode-properties-of-strings
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";

  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };

  // #table-unicode-general-category-values
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";

  // #table-unicode-script-values
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;

  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };

  var data = {};
  function buildUnicodeData(ecmaVersion) {
    var d = data[ecmaVersion] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;

    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }

  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    var ecmaVersion = list[i];

    buildUnicodeData(ecmaVersion);
  }

  var pp$1 = Parser.prototype;

  // Track disjunction structure to determine whether a duplicate
  // capture group name is allowed because it is in a separate branch.
  var BranchID = function BranchID(parent, base) {
    // Parent disjunction branch
    this.parent = parent;
    // Identifies this set of sibling branches
    this.base = base || this;
  };

  BranchID.prototype.separatedFrom = function separatedFrom (alt) {
    // A branch is separate from another branch if they or any of
    // their parents are siblings in a given disjunction
    for (var self = this; self; self = self.parent) {
      for (var other = alt; other; other = other.parent) {
        if (self.base === other.base && self !== other) { return true }
      }
    }
    return false
  };

  BranchID.prototype.sibling = function sibling () {
    return new BranchID(this.parent, this.base)
  };

  var RegExpValidationState = function RegExpValidationState(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = Object.create(null);
    this.backReferenceNames = [];
    this.branchID = null;
  };

  RegExpValidationState.prototype.reset = function reset (start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };

  RegExpValidationState.prototype.raise = function raise (message) {
    this.parser.raiseRecoverable(this.start, ("Invalid regular expression: /" + (this.source) + "/: " + message));
  };

  // If u flag is given, this returns the code point at the index (it combines a surrogate pair).
  // Otherwise, this returns the code unit of the index (can be a part of a surrogate pair).
  RegExpValidationState.prototype.at = function at (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return -1
    }
    var c = s.charCodeAt(i);
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l) {
      return c
    }
    var next = s.charCodeAt(i + 1);
    return next >= 0xDC00 && next <= 0xDFFF ? (c << 10) + next - 0x35FDC00 : c
  };

  RegExpValidationState.prototype.nextIndex = function nextIndex (i, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var s = this.source;
    var l = s.length;
    if (i >= l) {
      return l
    }
    var c = s.charCodeAt(i), next;
    if (!(forceU || this.switchU) || c <= 0xD7FF || c >= 0xE000 || i + 1 >= l ||
        (next = s.charCodeAt(i + 1)) < 0xDC00 || next > 0xDFFF) {
      return i + 1
    }
    return i + 2
  };

  RegExpValidationState.prototype.current = function current (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.pos, forceU)
  };

  RegExpValidationState.prototype.lookahead = function lookahead (forceU) {
      if ( forceU === void 0 ) forceU = false;

    return this.at(this.nextIndex(this.pos, forceU), forceU)
  };

  RegExpValidationState.prototype.advance = function advance (forceU) {
      if ( forceU === void 0 ) forceU = false;

    this.pos = this.nextIndex(this.pos, forceU);
  };

  RegExpValidationState.prototype.eat = function eat (ch, forceU) {
      if ( forceU === void 0 ) forceU = false;

    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true
    }
    return false
  };

  RegExpValidationState.prototype.eatChars = function eatChars (chs, forceU) {
      if ( forceU === void 0 ) forceU = false;

    var pos = this.pos;
    for (var i = 0, list = chs; i < list.length; i += 1) {
      var ch = list[i];

        var current = this.at(pos, forceU);
      if (current === -1 || current !== ch) {
        return false
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true
  };

  /**
   * Validate the flags part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;

    var u = false;
    var v = false;

    for (var i = 0; i < flags.length; i++) {
      var flag = flags.charAt(i);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") { u = true; }
      if (flag === "v") { v = true; }
    }
    if (this.options.ecmaVersion >= 15 && u && v) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };

  function hasProp(obj) {
    for (var _ in obj) { return true }
    return false
  }

  /**
   * Validate the pattern part of a given RegExpLiteral.
   *
   * @param {RegExpValidationState} state The state to validate RegExp.
   * @returns {void}
   */
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);

    // The goal symbol for the parse is |Pattern[~U, ~N]|. If the result of
    // parsing contains a |GroupName|, reparse with the goal symbol
    // |Pattern[~U, +N]| and use this result instead. Throw a *SyntaxError*
    // exception if _P_ did not conform to the grammar, if any elements of _P_
    // were not matched by the parse, or if any Early Error conditions exist.
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Pattern
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;

    this.regexp_disjunction(state);

    if (state.pos !== state.source.length) {
      // Make the same messages as V8.
      if (state.eat(0x29 /* ) */)) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(0x5D /* ] */) || state.eat(0x7D /* } */)) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i = 0, list = state.backReferenceNames; i < list.length; i += 1) {
      var name = list[i];

      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Disjunction
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) { state.branchID = new BranchID(state.branchID, null); }
    this.regexp_alternative(state);
    while (state.eat(0x7C /* | */)) {
      if (trackDisjunction) { state.branchID = state.branchID.sibling(); }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) { state.branchID = state.branchID.parent; }

    // Make the same message as V8.
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(0x7B /* { */)) {
      state.raise("Lone quantifier brackets");
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Alternative
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {}
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Term
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      // Handle `QuantifiableAssertion Quantifier` alternative.
      // `state.lastAssertionIsQuantifiable` is true if the last eaten Assertion
      // is a QuantifiableAssertion.
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        // Make the same message as V8.
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true
    }

    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-Assertion
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;

    // ^, $
    if (state.eat(0x5E /* ^ */) || state.eat(0x24 /* $ */)) {
      return true
    }

    // \b \B
    if (state.eat(0x5C /* \ */)) {
      if (state.eat(0x42 /* B */) || state.eat(0x62 /* b */)) {
        return true
      }
      state.pos = start;
    }

    // Lookahead / Lookbehind
    if (state.eat(0x28 /* ( */) && state.eat(0x3F /* ? */)) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(0x3C /* < */);
      }
      if (state.eat(0x3D /* = */) || state.eat(0x21 /* ! */)) {
        this.regexp_disjunction(state);
        if (!state.eat(0x29 /* ) */)) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true
      }
    }

    state.pos = start;
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Quantifier
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if ( noError === void 0 ) noError = false;

    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(0x3F /* ? */);
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-QuantifierPrefix
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return (
      state.eat(0x2A /* * */) ||
      state.eat(0x2B /* + */) ||
      state.eat(0x3F /* ? */) ||
      this.regexp_eatBracedQuantifier(state, noError)
    )
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(0x7B /* { */)) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(0x2C /* , */) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(0x7D /* } */)) {
          // SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-term
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Atom
  pp$1.regexp_eatAtom = function(state) {
    return (
      this.regexp_eatPatternCharacters(state) ||
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state)
    )
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatAtomEscape(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(0x28 /* ( */)) {
      if (state.eat(0x3F /* ? */)) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(0x2D /* - */);
          if (addModifiers || hasHyphen) {
            for (var i = 0; i < addModifiers.length; i++) {
              var modifier = addModifiers.charAt(i);
              if (addModifiers.indexOf(modifier, i + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 0x3A /* : */) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (
                  removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 ||
                  addModifiers.indexOf(modifier$1) > -1
                ) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(0x3A /* : */)) {
          this.regexp_disjunction(state);
          if (state.eat(0x29 /* ) */)) {
            return true
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(0x28 /* ( */)) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 0x3F /* ? */) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(0x29 /* ) */)) {
        state.numCapturingParens += 1;
        return true
      }
      state.raise("Unterminated group");
    }
    return false
  };
  // RegularExpressionModifiers ::
  //   [empty]
  //   RegularExpressionModifiers RegularExpressionModifier
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers
  };
  // RegularExpressionModifier :: one of
  //   `i` `m` `s`
  function isRegularExpressionModifier(ch) {
    return ch === 0x69 /* i */ || ch === 0x6d /* m */ || ch === 0x73 /* s */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedAtom
  pp$1.regexp_eatExtendedAtom = function(state) {
    return (
      state.eat(0x2E /* . */) ||
      this.regexp_eatReverseSolidusAtomEscape(state) ||
      this.regexp_eatCharacterClass(state) ||
      this.regexp_eatUncapturingGroup(state) ||
      this.regexp_eatCapturingGroup(state) ||
      this.regexp_eatInvalidBracedQuantifier(state) ||
      this.regexp_eatExtendedPatternCharacter(state)
    )
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-InvalidBracedQuantifier
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-SyntaxCharacter
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };
  function isSyntaxCharacter(ch) {
    return (
      ch === 0x24 /* $ */ ||
      ch >= 0x28 /* ( */ && ch <= 0x2B /* + */ ||
      ch === 0x2E /* . */ ||
      ch === 0x3F /* ? */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5E /* ^ */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-PatternCharacter
  // But eat eager.
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ExtendedPatternCharacter
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (
      ch !== -1 &&
      ch !== 0x24 /* $ */ &&
      !(ch >= 0x28 /* ( */ && ch <= 0x2B /* + */) &&
      ch !== 0x2E /* . */ &&
      ch !== 0x3F /* ? */ &&
      ch !== 0x5B /* [ */ &&
      ch !== 0x5E /* ^ */ &&
      ch !== 0x7C /* | */
    ) {
      state.advance();
      return true
    }
    return false
  };

  // GroupSpecifier ::
  //   [empty]
  //   `?` GroupName
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(0x3F /* ? */)) {
      if (!this.regexp_eatGroupName(state)) { state.raise("Invalid group"); }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i = 0, list = known; i < list.length; i += 1) {
            var altID = list[i];

            if (!altID.separatedFrom(state.branchID))
              { state.raise("Duplicate capture group name"); }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };

  // GroupName ::
  //   `<` RegExpIdentifierName `>`
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(0x3C /* < */)) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(0x3E /* > */)) {
        return true
      }
      state.raise("Invalid capture group name");
    }
    return false
  };

  // RegExpIdentifierName ::
  //   RegExpIdentifierStart
  //   RegExpIdentifierName RegExpIdentifierPart
  // Note: this updates `state.lastStringValue` property with the eaten name.
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true
    }
    return false
  };

  // RegExpIdentifierStart ::
  //   UnicodeIDStart
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */
  }

  // RegExpIdentifierPart ::
  //   UnicodeIDContinue
  //   `$`
  //   `_`
  //   `\` RegExpUnicodeEscapeSequence[+U]
  //   <ZWNJ>
  //   <ZWJ>
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);

    if (ch === 0x5C /* \ */ && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true
    }

    state.pos = start;
    return false
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 0x24 /* $ */ || ch === 0x5F /* _ */ || ch === 0x200C /* <ZWNJ> */ || ch === 0x200D /* <ZWJ> */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-AtomEscape
  pp$1.regexp_eatAtomEscape = function(state) {
    if (
      this.regexp_eatBackReference(state) ||
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state) ||
      (state.switchN && this.regexp_eatKGroupName(state))
    ) {
      return true
    }
    if (state.switchU) {
      // Make the same message as V8.
      if (state.current() === 0x63 /* c */) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        // For SyntaxError in https://www.ecma-international.org/ecma-262/8.0/#sec-atomescape
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true
      }
      if (n <= state.numCapturingParens) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(0x6B /* k */)) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true
      }
      state.raise("Invalid named reference");
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-CharacterEscape
  pp$1.regexp_eatCharacterEscape = function(state) {
    return (
      this.regexp_eatControlEscape(state) ||
      this.regexp_eatCControlLetter(state) ||
      this.regexp_eatZero(state) ||
      this.regexp_eatHexEscapeSequence(state) ||
      this.regexp_eatRegExpUnicodeEscapeSequence(state, false) ||
      (!state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state)) ||
      this.regexp_eatIdentityEscape(state)
    )
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(0x63 /* c */)) {
      if (this.regexp_eatControlLetter(state)) {
        return true
      }
      state.pos = start;
    }
    return false
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 0x30 /* 0 */ && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlEscape
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 0x74 /* t */) {
      state.lastIntValue = 0x09; /* \t */
      state.advance();
      return true
    }
    if (ch === 0x6E /* n */) {
      state.lastIntValue = 0x0A; /* \n */
      state.advance();
      return true
    }
    if (ch === 0x76 /* v */) {
      state.lastIntValue = 0x0B; /* \v */
      state.advance();
      return true
    }
    if (ch === 0x66 /* f */) {
      state.lastIntValue = 0x0C; /* \f */
      state.advance();
      return true
    }
    if (ch === 0x72 /* r */) {
      state.lastIntValue = 0x0D; /* \r */
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ControlLetter
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };
  function isControlLetter(ch) {
    return (
      (ch >= 0x41 /* A */ && ch <= 0x5A /* Z */) ||
      (ch >= 0x61 /* a */ && ch <= 0x7A /* z */)
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-RegExpUnicodeEscapeSequence
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if ( forceU === void 0 ) forceU = false;

    var start = state.pos;
    var switchU = forceU || state.switchU;

    if (state.eat(0x75 /* u */)) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 0xD800 && lead <= 0xDBFF) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(0x5C /* \ */) && state.eat(0x75 /* u */) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 0xDC00 && trail <= 0xDFFF) {
              state.lastIntValue = (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
              return true
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true
      }
      if (
        switchU &&
        state.eat(0x7B /* { */) &&
        this.regexp_eatHexDigits(state) &&
        state.eat(0x7D /* } */) &&
        isValidUnicode(state.lastIntValue)
      ) {
        return true
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }

    return false
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 0x10FFFF
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-IdentityEscape
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true
      }
      if (state.eat(0x2F /* / */)) {
        state.lastIntValue = 0x2F; /* / */
        return true
      }
      return false
    }

    var ch = state.current();
    if (ch !== 0x63 /* c */ && (!state.switchN || ch !== 0x6B /* k */)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalEscape
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 0x31 /* 1 */ && ch <= 0x39 /* 9 */) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
        state.advance();
      } while ((ch = state.current()) >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */)
      return true
    }
    return false
  };

  // Return values used by character set parsing methods, needed to
  // forbid negation of sets that can match strings.
  var CharSetNone = 0; // Nothing parsed
  var CharSetOk = 1; // Construct parsed, cannot contain strings
  var CharSetString = 2; // Construct parsed, can contain strings

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClassEscape
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();

    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk
    }

    var negate = false;
    if (
      state.switchU &&
      this.options.ecmaVersion >= 9 &&
      ((negate = ch === 0x50 /* P */) || ch === 0x70 /* p */)
    ) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (
        state.eat(0x7B /* { */) &&
        (result = this.regexp_eatUnicodePropertyValueExpression(state)) &&
        state.eat(0x7D /* } */)
      ) {
        if (negate && result === CharSetString) { state.raise("Invalid property name"); }
        return result
      }
      state.raise("Invalid property name");
    }

    return CharSetNone
  };

  function isCharacterClassEscape(ch) {
    return (
      ch === 0x64 /* d */ ||
      ch === 0x44 /* D */ ||
      ch === 0x73 /* s */ ||
      ch === 0x53 /* S */ ||
      ch === 0x77 /* w */ ||
      ch === 0x57 /* W */
    )
  }

  // UnicodePropertyValueExpression ::
  //   UnicodePropertyName `=` UnicodePropertyValue
  //   LoneUnicodePropertyNameOrValue
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;

    // UnicodePropertyName `=` UnicodePropertyValue
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(0x3D /* = */)) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk
      }
    }
    state.pos = start;

    // LoneUnicodePropertyNameOrValue
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue)
    }
    return CharSetNone
  };

  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name))
      { state.raise("Invalid property name"); }
    if (!state.unicodeProperties.nonBinary[name].test(value))
      { state.raise("Invalid property value"); }
  };

  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) { return CharSetOk }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) { return CharSetString }
    state.raise("Invalid property name");
  };

  // UnicodePropertyName ::
  //   UnicodePropertyNameCharacters
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };

  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 0x5F /* _ */
  }

  // UnicodePropertyValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== ""
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch)
  }

  // LoneUnicodePropertyNameOrValue ::
  //   UnicodePropertyValueCharacters
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state)
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-CharacterClass
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (!state.eat(0x5D /* ] */))
        { state.raise("Unterminated character class"); }
      if (negate && result === CharSetString)
        { state.raise("Negated character class may contain strings"); }
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassContents
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassRanges
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 0x5D /* ] */) { return CharSetOk }
    if (state.switchV) { return this.regexp_classSetExpression(state) }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRanges
  // https://www.ecma-international.org/ecma-262/8.0/#prod-NonemptyClassRangesNoDash
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtom
  // https://www.ecma-international.org/ecma-262/8.0/#prod-ClassAtomNoDash
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;

    if (state.eat(0x5C /* \ */)) {
      if (this.regexp_eatClassEscape(state)) {
        return true
      }
      if (state.switchU) {
        // Make the same message as V8.
        var ch$1 = state.current();
        if (ch$1 === 0x63 /* c */ || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }

    var ch = state.current();
    if (ch !== 0x5D /* ] */) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }

    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassEscape
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;

    if (state.eat(0x62 /* b */)) {
      state.lastIntValue = 0x08; /* <BS> */
      return true
    }

    if (state.switchU && state.eat(0x2D /* - */)) {
      state.lastIntValue = 0x2D; /* - */
      return true
    }

    if (!state.switchU && state.eat(0x63 /* c */)) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true
      }
      state.pos = start;
    }

    return (
      this.regexp_eatCharacterClassEscape(state) ||
      this.regexp_eatCharacterEscape(state)
    )
  };

  // https://tc39.es/ecma262/#prod-ClassSetExpression
  // https://tc39.es/ecma262/#prod-ClassUnion
  // https://tc39.es/ecma262/#prod-ClassIntersection
  // https://tc39.es/ecma262/#prod-ClassSubtraction
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ; else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) { result = CharSetString; }
      // https://tc39.es/ecma262/#prod-ClassIntersection
      var start = state.pos;
      while (state.eatChars([0x26, 0x26] /* && */)) {
        if (
          state.current() !== 0x26 /* & */ &&
          (subResult = this.regexp_eatClassSetOperand(state))
        ) {
          if (subResult !== CharSetString) { result = CharSetOk; }
          continue
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
      // https://tc39.es/ecma262/#prod-ClassSubtraction
      while (state.eatChars([0x2D, 0x2D] /* -- */)) {
        if (this.regexp_eatClassSetOperand(state)) { continue }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) { return result }
    } else {
      state.raise("Invalid character in character class");
    }
    // https://tc39.es/ecma262/#prod-ClassUnion
    for (;;) {
      if (this.regexp_eatClassSetRange(state)) { continue }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) { return result }
      if (subResult === CharSetString) { result = CharSetString; }
    }
  };

  // https://tc39.es/ecma262/#prod-ClassSetRange
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(0x2D /* - */) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true
      }
      state.pos = start;
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetOperand
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) { return CharSetOk }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state)
  };

  // https://tc39.es/ecma262/#prod-NestedClass
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(0x5B /* [ */)) {
      var negate = state.eat(0x5E /* ^ */);
      var result = this.regexp_classContents(state);
      if (state.eat(0x5D /* ] */)) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result
      }
      state.pos = start;
    }
    if (state.eat(0x5C /* \ */)) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunction
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars([0x5C, 0x71] /* \q */)) {
      if (state.eat(0x7B /* { */)) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(0x7D /* } */)) {
          return result
        }
      } else {
        // Make the same message as V8.
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null
  };

  // https://tc39.es/ecma262/#prod-ClassStringDisjunctionContents
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(0x7C /* | */)) {
      if (this.regexp_classString(state) === CharSetString) { result = CharSetString; }
    }
    return result
  };

  // https://tc39.es/ecma262/#prod-ClassString
  // https://tc39.es/ecma262/#prod-NonEmptyClassString
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) { count++; }
    return count === 1 ? CharSetOk : CharSetString
  };

  // https://tc39.es/ecma262/#prod-ClassSetCharacter
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(0x5C /* \ */)) {
      if (
        this.regexp_eatCharacterEscape(state) ||
        this.regexp_eatClassSetReservedPunctuator(state)
      ) {
        return true
      }
      if (state.eat(0x62 /* b */)) {
        state.lastIntValue = 0x08; /* <BS> */
        return true
      }
      state.pos = start;
      return false
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) { return false }
    if (isClassSetSyntaxCharacter(ch)) { return false }
    state.advance();
    state.lastIntValue = ch;
    return true
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedDoublePunctuator
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch >= 0x23 /* # */ && ch <= 0x26 /* & */ ||
      ch >= 0x2A /* * */ && ch <= 0x2C /* , */ ||
      ch === 0x2E /* . */ ||
      ch >= 0x3A /* : */ && ch <= 0x40 /* @ */ ||
      ch === 0x5E /* ^ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetSyntaxCharacter
  function isClassSetSyntaxCharacter(ch) {
    return (
      ch === 0x28 /* ( */ ||
      ch === 0x29 /* ) */ ||
      ch === 0x2D /* - */ ||
      ch === 0x2F /* / */ ||
      ch >= 0x5B /* [ */ && ch <= 0x5D /* ] */ ||
      ch >= 0x7B /* { */ && ch <= 0x7D /* } */
    )
  }

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true
    }
    return false
  };

  // https://tc39.es/ecma262/#prod-ClassSetReservedPunctuator
  function isClassSetReservedPunctuator(ch) {
    return (
      ch === 0x21 /* ! */ ||
      ch === 0x23 /* # */ ||
      ch === 0x25 /* % */ ||
      ch === 0x26 /* & */ ||
      ch === 0x2C /* , */ ||
      ch === 0x2D /* - */ ||
      ch >= 0x3A /* : */ && ch <= 0x3E /* > */ ||
      ch === 0x40 /* @ */ ||
      ch === 0x60 /* ` */ ||
      ch === 0x7E /* ~ */
    )
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-ClassControlLetter
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 0x5F /* _ */) {
      state.lastIntValue = ch % 0x20;
      state.advance();
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(0x78 /* x */)) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-DecimalDigits
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 0x30 /* 0 */);
      state.advance();
    }
    return state.pos !== start
  };
  function isDecimalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigits
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start
  };
  function isHexDigit(ch) {
    return (
      (ch >= 0x30 /* 0 */ && ch <= 0x39 /* 9 */) ||
      (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) ||
      (ch >= 0x61 /* a */ && ch <= 0x66 /* f */)
    )
  }
  function hexToInt(ch) {
    if (ch >= 0x41 /* A */ && ch <= 0x46 /* F */) {
      return 10 + (ch - 0x41 /* A */)
    }
    if (ch >= 0x61 /* a */ && ch <= 0x66 /* f */) {
      return 10 + (ch - 0x61 /* a */)
    }
    return ch - 0x30 /* 0 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-annexB-LegacyOctalEscapeSequence
  // Allows only 0-377(octal) i.e. 0-255(decimal).
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true
    }
    return false
  };

  // https://www.ecma-international.org/ecma-262/8.0/#prod-OctalDigit
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 0x30; /* 0 */
      state.advance();
      return true
    }
    state.lastIntValue = 0;
    return false
  };
  function isOctalDigit(ch) {
    return ch >= 0x30 /* 0 */ && ch <= 0x37 /* 7 */
  }

  // https://www.ecma-international.org/ecma-262/8.0/#prod-Hex4Digits
  // https://www.ecma-international.org/ecma-262/8.0/#prod-HexDigit
  // And HexDigit HexDigit in https://www.ecma-international.org/ecma-262/8.0/#prod-HexEscapeSequence
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i = 0; i < length; ++i) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true
  };

  // Object type used to represent tokens. Note that normally, tokens
  // simply exist as properties on the parser object. This is only
  // used for the onToken callback and the external tokenizer.

  var Token = function Token(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations)
      { this.loc = new SourceLocation(p, p.startLoc, p.endLoc); }
    if (p.options.ranges)
      { this.range = [p.start, p.end]; }
  };

  // ## Tokenizer

  var pp = Parser.prototype;

  // Move to the next token

  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc)
      { this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword); }
    if (this.options.onToken)
      { this.options.onToken(new Token(this)); }

    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };

  pp.getToken = function() {
    this.next();
    return new Token(this)
  };

  // If we're in an ES6 environment, make parsers iterable
  if (typeof Symbol !== "undefined")
    { pp[Symbol.iterator] = function() {
      var this$1$1 = this;

      return {
        next: function () {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          }
        }
      }
    }; }

  // Toggle strict mode. Re-reads the next number or string to please
  // pedantic tests (`"use strict"; 010;` should fail).

  // Read a single token, updating the parser object's token-related
  // properties.

  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) { this.skipSpace(); }

    this.start = this.pos;
    if (this.options.locations) { this.startLoc = this.curPosition(); }
    if (this.pos >= this.input.length) { return this.finishToken(types$1.eof) }

    if (curContext.override) { return curContext.override(this) }
    else { this.readToken(this.fullCharCodeAtPos()); }
  };

  pp.readToken = function(code) {
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92 /* '\' */)
      { return this.readWord() }

    return this.getTokenFromCode(code)
  };

  pp.fullCharCodeAt = function(pos) {
    var code = this.input.charCodeAt(pos);
    if (code <= 0xd7ff || code >= 0xdc00) { return code }
    var next = this.input.charCodeAt(pos + 1);
    return next <= 0xdbff || next >= 0xe000 ? code : (code << 10) + next - 0x35fdc00
  };

  pp.fullCharCodeAtPos = function() {
    return this.fullCharCodeAt(this.pos)
  };

  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) { this.raise(this.pos - 2, "Unterminated comment"); }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = (void 0), pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1;) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment)
      { this.options.onComment(true, this.input.slice(start + 2, end), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment)
      { this.options.onComment(false, this.input.slice(start + startSkip, this.pos), start, this.pos,
                             startLoc, this.curPosition()); }
  };

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
      case 32: case 160: // ' '
        ++this.pos;
        break
      case 13:
        if (this.input.charCodeAt(this.pos + 1) === 10) {
          ++this.pos;
        }
      case 10: case 8232: case 8233:
        ++this.pos;
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        break
      case 47: // '/'
        switch (this.input.charCodeAt(this.pos + 1)) {
        case 42: // '*'
          this.skipBlockComment();
          break
        case 47:
          this.skipLineComment(2);
          break
        default:
          break loop
        }
        break
      default:
        if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
          ++this.pos;
        } else {
          break loop
        }
      }
    }
  };

  // Called at the end of every token. Sets `end`, `val`, and
  // maintains `context` and `exprAllowed`, and skips the space after
  // the token, so that the next one's `start` will point at the
  // right position.

  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) { this.endLoc = this.curPosition(); }
    var prevType = this.type;
    this.type = type;
    this.value = val;

    this.updateContext(prevType);
  };

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) { return this.readNumber(true) }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) { // 46 = dot '.'
      this.pos += 3;
      return this.finishToken(types$1.ellipsis)
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot)
    }
  };

  pp.readToken_slash = function() { // '/'
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) { ++this.pos; return this.readRegexp() }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.slash, 1)
  };

  pp.readToken_mult_modulo_exp = function(code) { // '%*'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;

    // exponentiation operator ** and **=
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }

    if (next === 61) { return this.finishOp(types$1.assign, size + 1) }
    return this.finishOp(tokentype, size)
  };

  pp.readToken_pipe_amp = function(code) { // '|&'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) { return this.finishOp(types$1.assign, 3) }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1)
  };

  pp.readToken_caret = function() { // '^'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.bitwiseXOR, 1)
  };

  pp.readToken_plus_min = function(code) { // '+-'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 &&
          (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        // A `-->` line comment
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken()
      }
      return this.finishOp(types$1.incDec, 2)
    }
    if (next === 61) { return this.finishOp(types$1.assign, 2) }
    return this.finishOp(types$1.plusMin, 1)
  };

  pp.readToken_lt_gt = function(code) { // '<>'
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) { return this.finishOp(types$1.assign, size + 1) }
      return this.finishOp(types$1.bitShift, size)
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 &&
        this.input.charCodeAt(this.pos + 3) === 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken()
    }
    if (next === 61) { size = 2; }
    return this.finishOp(types$1.relational, size)
  };

  pp.readToken_eq_excl = function(code) { // '=!'
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) { return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2) }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) { // '=>'
      this.pos += 2;
      return this.finishToken(types$1.arrow)
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1)
  };

  pp.readToken_question = function() { // '?'
    var ecmaVersion = this.options.ecmaVersion;
    if (ecmaVersion >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) { return this.finishOp(types$1.questionDot, 2) }
      }
      if (next === 63) {
        if (ecmaVersion >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) { return this.finishOp(types$1.assign, 3) }
        }
        return this.finishOp(types$1.coalesce, 2)
      }
    }
    return this.finishOp(types$1.question, 1)
  };

  pp.readToken_numberSign = function() { // '#'
    var ecmaVersion = this.options.ecmaVersion;
    var code = 35; // '#'
    if (ecmaVersion >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92 /* '\' */) {
        return this.finishToken(types$1.privateId, this.readWord1())
      }
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.getTokenFromCode = function(code) {
    switch (code) {
    // The interpretation of a dot depends on whether it is followed
    // by a digit or another two dots.
    case 46: // '.'
      return this.readToken_dot()

    // Punctuation tokens.
    case 40: ++this.pos; return this.finishToken(types$1.parenL)
    case 41: ++this.pos; return this.finishToken(types$1.parenR)
    case 59: ++this.pos; return this.finishToken(types$1.semi)
    case 44: ++this.pos; return this.finishToken(types$1.comma)
    case 91: ++this.pos; return this.finishToken(types$1.bracketL)
    case 93: ++this.pos; return this.finishToken(types$1.bracketR)
    case 123: ++this.pos; return this.finishToken(types$1.braceL)
    case 125: ++this.pos; return this.finishToken(types$1.braceR)
    case 58: ++this.pos; return this.finishToken(types$1.colon)

    case 96: // '`'
      if (this.options.ecmaVersion < 6) { break }
      ++this.pos;
      return this.finishToken(types$1.backQuote)

    case 48: // '0'
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 120 || next === 88) { return this.readRadixNumber(16) } // '0x', '0X' - hex number
      if (this.options.ecmaVersion >= 6) {
        if (next === 111 || next === 79) { return this.readRadixNumber(8) } // '0o', '0O' - octal number
        if (next === 98 || next === 66) { return this.readRadixNumber(2) } // '0b', '0B' - binary number
      }

    // Anything else beginning with a digit is an integer, octal
    // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return this.readNumber(false)

    // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return this.readString(code)

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.
    case 47: // '/'
      return this.readToken_slash()

    case 37: case 42: // '%*'
      return this.readToken_mult_modulo_exp(code)

    case 124: case 38: // '|&'
      return this.readToken_pipe_amp(code)

    case 94: // '^'
      return this.readToken_caret()

    case 43: case 45: // '+-'
      return this.readToken_plus_min(code)

    case 60: case 62: // '<>'
      return this.readToken_lt_gt(code)

    case 61: case 33: // '=!'
      return this.readToken_eq_excl(code)

    case 63: // '?'
      return this.readToken_question()

    case 126: // '~'
      return this.finishOp(types$1.prefix, 1)

    case 35: // '#'
      return this.readToken_numberSign()
    }

    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };

  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str)
  };

  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(start, "Unterminated regular expression"); }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) { this.raise(start, "Unterminated regular expression"); }
      if (!escaped) {
        if (ch === "[") { inClass = true; }
        else if (ch === "]" && inClass) { inClass = false; }
        else if (ch === "/" && !inClass) { break }
        escaped = ch === "\\";
      } else { escaped = false; }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) { this.unexpected(flagsStart); }

    // Validate pattern
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);

    // Create Literal#value property value.
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      // ESTree requires null if it failed to instantiate RegExp object.
      // https://github.com/estree/estree/blob/a27003adf4fd7bfad44de9cef372a2eacd527b1c/es5.md#regexpliteral
    }

    return this.finishToken(types$1.regexp, {pattern: pattern, flags: flags, value: value})
  };

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    // `len` is used for character escape sequences. In that case, disallow separators.
    var allowSeparators = this.options.ecmaVersion >= 12 && len === undefined;

    // `maybeLegacyOctalNumericLiteral` is true if it doesn't have prefix (0x,0o,0b)
    // and isn't fraction part nor exponent part. In that case, if the first digit
    // is zero then disallow separators.
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;

    var start = this.pos, total = 0, lastCode = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = (void 0);

      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals"); }
        if (lastCode === 95) { this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore"); }
        if (i === 0) { this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits"); }
        lastCode = code;
        continue
      }

      if (code >= 97) { val = code - 97 + 10; } // a
      else if (code >= 65) { val = code - 65 + 10; } // A
      else if (code >= 48 && code <= 57) { val = code - 48; } // 0-9
      else { val = Infinity; }
      if (val >= radix) { break }
      lastCode = code;
      total = total * radix + val;
    }

    if (allowSeparators && lastCode === 95) { this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits"); }
    if (this.pos === start || len != null && this.pos - start !== len) { return null }

    return total
  };

  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8)
    }

    // `parseFloat(value)` stops parsing at the first numeric separator then returns a wrong value.
    return parseFloat(str.replace(/_/g, ""))
  }

  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null
    }

    // `BigInt(value)` throws syntax error if the string contains numeric separators.
    return BigInt(str.replace(/_/g, ""))
  }

  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2; // 0x
    var val = this.readInt(radix);
    if (val == null) { this.raise(this.start + 2, "Expected number in radix " + radix); }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
    return this.finishToken(types$1.num, val)
  };

  // Read an integer, octal integer, or floating-point number.

  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, undefined, true) === null) { this.raise(start, "Invalid number"); }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) { this.raise(start, "Invalid number"); }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }
      return this.finishToken(types$1.num, val$1)
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) { octal = false; }
    if (next === 46 && !octal) { // '.'
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) { // 'eE'
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) { ++this.pos; } // '+-'
      if (this.readInt(10) === null) { this.raise(start, "Invalid number"); }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) { this.raise(this.pos, "Identifier directly after number"); }

    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val)
  };

  // Read a string value, interpreting backslash-escapes.

  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;

    if (ch === 123) { // '{'
      if (this.options.ecmaVersion < 6) { this.unexpected(); }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 0x10FFFF) { this.invalidStringToken(codePos, "Code point out of bounds"); }
    } else {
      code = this.readHexChar(4);
    }
    return code
  };

  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated string constant"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) { break }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 0x2028 || ch === 0x2029) {
        if (this.options.ecmaVersion < 10) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) { this.raise(this.start, "Unterminated string constant"); }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out)
  };

  // Reads template string tokens.

  var INVALID_TEMPLATE_ESCAPE_ERROR = {};

  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err
      }
    }

    this.inTemplateElement = false;
  };

  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR
    } else {
      this.raise(position, message);
    }
  };

  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (;;) {
      if (this.pos >= this.input.length) { this.raise(this.start, "Unterminated template"); }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) { // '`', '${'
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL)
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote)
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out)
      }
      if (ch === 92) { // '\'
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
        case 13:
          if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; }
        case 10:
          out += "\n";
          break
        default:
          out += String.fromCharCode(ch);
          break
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };

  // Reads a template token to search for the end, without validating any escape sequences
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
      case "\\":
        ++this.pos;
        break

      case "$":
        if (this.input[this.pos + 1] !== "{") { break }
        // fall through
      case "`":
        return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos))

      case "\r":
        if (this.input[this.pos + 1] === "\n") { ++this.pos; }
        // fall through
      case "\n": case "\u2028": case "\u2029":
        ++this.curLine;
        this.lineStart = this.pos + 1;
        break
      }
    }
    this.raise(this.start, "Unterminated template");
  };

  // Used to read escaped characters

  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
    case 110: return "\n" // 'n' -> '\n'
    case 114: return "\r" // 'r' -> '\r'
    case 120: return String.fromCharCode(this.readHexChar(2)) // 'x'
    case 117: return codePointToString(this.readCodePoint()) // 'u'
    case 116: return "\t" // 't' -> '\t'
    case 98: return "\b" // 'b' -> '\b'
    case 118: return "\u000b" // 'v' -> '\u000b'
    case 102: return "\f" // 'f' -> '\f'
    case 13: if (this.input.charCodeAt(this.pos) === 10) { ++this.pos; } // '\r\n'
    case 10: // ' \n'
      if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
      return ""
    case 56:
    case 57:
      if (this.strict) {
        this.invalidStringToken(
          this.pos - 1,
          "Invalid escape sequence"
        );
      }
      if (inTemplate) {
        var codePos = this.pos - 1;

        this.invalidStringToken(
          codePos,
          "Invalid escape sequence in template string"
        );
      }
    default:
      if (ch >= 48 && ch <= 55) {
        var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
        var octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }
        this.pos += octalStr.length - 1;
        ch = this.input.charCodeAt(this.pos);
        if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
          this.invalidStringToken(
            this.pos - 1 - octalStr.length,
            inTemplate
              ? "Octal literal in template string"
              : "Octal literal in strict mode"
          );
        }
        return String.fromCharCode(octal)
      }
      if (isNewLine(ch)) {
        // Unicode new line characters after \ get removed from output in both
        // template literals and strings
        if (this.options.locations) { this.lineStart = this.pos; ++this.curLine; }
        return ""
      }
      return String.fromCharCode(ch)
    }
  };

  // Used to read character escape sequences ('\x', '\u', '\U').

  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) { this.invalidStringToken(codePos, "Bad character escape sequence"); }
    return n
  };

  // Read an identifier, and return it as a string. Sets `this.containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Incrementally adds only escaped chars, adding other chunks as-is
  // as a micro-optimization.

  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 0xffff ? 1 : 2;
      } else if (ch === 92) { // "\"
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) // "u"
          { this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX"); }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral))
          { this.invalidStringToken(escStart, "Invalid Unicode escape"); }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos)
  };

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word)
  };

  // Acorn is a tiny, fast JavaScript parser written in JavaScript.
  //
  // Acorn was written by Marijn Haverbeke, Ingvar Stepanyan, and
  // various contributors and released under an MIT license.
  //
  // Git repositories for Acorn are available at
  //
  //     http://marijnhaverbeke.nl/git/acorn
  //     https://github.com/acornjs/acorn.git
  //
  // Please use the [github bug tracker][ghbt] to report issues.
  //
  // [ghbt]: https://github.com/acornjs/acorn/issues


  var version = "8.18.0";

  Parser.acorn = {
    Parser: Parser,
    version: version,
    defaultOptions: defaultOptions,
    Position: Position,
    SourceLocation: SourceLocation,
    getLineInfo: getLineInfo,
    Node: Node,
    TokenType: TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext: TokContext,
    tokContexts: types,
    isIdentifierChar: isIdentifierChar,
    isIdentifierStart: isIdentifierStart,
    Token: Token,
    isNewLine: isNewLine,
    lineBreak: lineBreak,
    lineBreakG: lineBreakG,
    nonASCIIwhitespace: nonASCIIwhitespace
  };

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and returns
  // an abstract syntax tree as specified by the [ESTree spec][estree].
  //
  // [estree]: https://github.com/estree/estree

  function parse(input, options) {
    return Parser.parse(input, options)
  }

  // This function tries to parse a single expression at a given
  // offset in a string. Useful for parsing mixed-language formats
  // that embed JavaScript expressions.

  function parseExpressionAt(input, pos, options) {
    return Parser.parseExpressionAt(input, pos, options)
  }

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenizer` export provides an interface to the tokenizer.

  function tokenizer(input, options) {
    return Parser.tokenizer(input, options)
  }

  exports.Node = Node;
  exports.Parser = Parser;
  exports.Position = Position;
  exports.SourceLocation = SourceLocation;
  exports.TokContext = TokContext;
  exports.Token = Token;
  exports.TokenType = TokenType;
  exports.defaultOptions = defaultOptions;
  exports.getLineInfo = getLineInfo;
  exports.isIdentifierChar = isIdentifierChar;
  exports.isIdentifierStart = isIdentifierStart;
  exports.isNewLine = isNewLine;
  exports.keywordTypes = keywords;
  exports.lineBreak = lineBreak;
  exports.lineBreakG = lineBreakG;
  exports.nonASCIIwhitespace = nonASCIIwhitespace;
  exports.parse = parse;
  exports.parseExpressionAt = parseExpressionAt;
  exports.tokContexts = types;
  exports.tokTypes = types$1;
  exports.tokenizer = tokenizer;
  exports.version = version;

}));


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports) {

(function (global, factory) {
   true ? factory(exports) :
  0;
})(this, (function (exports) { 'use strict';

  // AST walker module for ESTree compatible trees

  // A simple walk is one where you simply specify callbacks to be
  // called on specific nodes. The last two arguments are optional. A
  // simple use would be
  //
  //     walk.simple(myTree, {
  //         Expression: function(node) { ... }
  //     });
  //
  // to do something with all expressions. All ESTree node types
  // can be used to identify node types, as well as Expression and
  // Statement, which denote categories of nodes.
  //
  // The base argument can be used to pass a custom (recursive)
  // walker, and state can be used to give this walked an initial
  // state.

  function simple(node, visitors, baseVisitor, state, override) {
    if (!baseVisitor) { baseVisitor = base
    ; }(function c(node, st, override) {
      var type = override || node.type;
      visitNode(baseVisitor, type, node, st, c);
      if (visitors[type]) { visitors[type](node, st); }
    })(node, state, override);
  }

  // An ancestor walk keeps an array of ancestor nodes (including the
  // current node) and passes them to the callback as third parameter
  // (and also as state parameter when no other state is present).
  function ancestor(node, visitors, baseVisitor, state, override) {
    var ancestors = [];
    if (!baseVisitor) { baseVisitor = base
    ; }(function c(node, st, override) {
      var type = override || node.type;
      var isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) { ancestors.push(node); }
      visitNode(baseVisitor, type, node, st, c);
      if (visitors[type]) { visitors[type](node, st || ancestors, ancestors); }
      if (isNew) { ancestors.pop(); }
    })(node, state, override);
  }

  // A recursive walk is one where your functions override the default
  // walkers. They can modify and replace the state parameter that's
  // threaded through the walk, and can opt how and whether to walk
  // their child nodes (by calling their third argument on these
  // nodes).
  function recursive(node, state, funcs, baseVisitor, override) {
    var visitor = funcs ? make(funcs, baseVisitor || undefined) : baseVisitor
    ;(function c(node, st, override) {
      visitor[override || node.type](node, st, c);
    })(node, state, override);
  }

  function makeTest(test) {
    if (typeof test === "string")
      { return function (type) { return type === test; } }
    else if (!test)
      { return function () { return true; } }
    else
      { return test }
  }

  var Found = function Found(node, state) { this.node = node; this.state = state; };

  // A full walk triggers the callback on each node
  function full(node, callback, baseVisitor, state, override) {
    if (!baseVisitor) { baseVisitor = base; }
    var last
    ;(function c(node, st, override) {
      var type = override || node.type;
      visitNode(baseVisitor, type, node, st, c);
      if (last !== node) {
        callback(node, st, type);
        last = node;
      }
    })(node, state, override);
  }

  // An fullAncestor walk is like an ancestor walk, but triggers
  // the callback on each node
  function fullAncestor(node, callback, baseVisitor, state) {
    if (!baseVisitor) { baseVisitor = base; }
    var ancestors = [], last
    ;(function c(node, st, override) {
      var type = override || node.type;
      var isNew = node !== ancestors[ancestors.length - 1];
      if (isNew) { ancestors.push(node); }
      visitNode(baseVisitor, type, node, st, c);
      if (last !== node) {
        callback(node, st || ancestors, ancestors, type);
        last = node;
      }
      if (isNew) { ancestors.pop(); }
    })(node, state);
  }

  // Find a node with a given start, end, and type (all are optional,
  // null can be used as wildcard). Returns a {node, state} object, or
  // undefined when it doesn't find a matching node.
  function findNodeAt(node, start, end, test, baseVisitor, state) {
    if (!baseVisitor) { baseVisitor = base; }
    test = makeTest(test);
    try {
      (function c(node, st, override) {
        var type = override || node.type;
        if ((start == null || node.start <= start) &&
            (end == null || node.end >= end))
          { visitNode(baseVisitor, type, node, st, c); }
        if ((start == null || node.start === start) &&
            (end == null || node.end === end) &&
            test(type, node))
          { throw new Found(node, st) }
      })(node, state);
    } catch (e) {
      if (e instanceof Found) { return e }
      throw e
    }
  }

  // Find the innermost node of a given type that contains the given
  // position. Interface similar to findNodeAt.
  function findNodeAround(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) { baseVisitor = base; }
    try {
      (function c(node, st, override) {
        var type = override || node.type;
        if (node.start > pos || node.end < pos) { return }
        visitNode(baseVisitor, type, node, st, c);
        if (test(type, node)) { throw new Found(node, st) }
      })(node, state);
    } catch (e) {
      if (e instanceof Found) { return e }
      throw e
    }
  }

  // Find the outermost matching node after a given position.
  function findNodeAfter(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) { baseVisitor = base; }
    try {
      (function c(node, st, override) {
        if (node.end < pos) { return }
        var type = override || node.type;
        if (node.start >= pos && test(type, node)) { throw new Found(node, st) }
        visitNode(baseVisitor, type, node, st, c);
      })(node, state);
    } catch (e) {
      if (e instanceof Found) { return e }
      throw e
    }
  }

  // Find the outermost matching node before a given position.
  function findNodeBefore(node, pos, test, baseVisitor, state) {
    test = makeTest(test);
    if (!baseVisitor) { baseVisitor = base; }
    var max
    ;(function c(node, st, override) {
      if (node.start > pos) { return }
      var type = override || node.type;
      if (node.end <= pos && (!max || max.node.end < node.end) && test(type, node))
        { max = new Found(node, st); }
      visitNode(baseVisitor, type, node, st, c);
    })(node, state);
    return max
  }

  // Used to create a custom walker. Will fill in all missing node
  // type properties with the defaults.
  function make(funcs, baseVisitor) {
    var visitor = Object.create(baseVisitor || base);
    for (var type in funcs) { visitor[type] = funcs[type]; }
    return visitor
  }

  function skipThrough(node, st, c) { c(node, st); }
  function ignore(_node, _st, _c) {}

  function visitNode(baseVisitor, type, node, st, c) {
    if (baseVisitor[type] == null) { throw new Error(("No walker function defined for node type " + type)) }
    baseVisitor[type](node, st, c);
  }

  // Node walkers.

  var base = {};

  base.Program = base.BlockStatement = base.StaticBlock = function (node, st, c) {
    for (var i = 0, list = node.body; i < list.length; i += 1)
      {
      var stmt = list[i];

      c(stmt, st, "Statement");
    }
  };
  base.Statement = skipThrough;
  base.EmptyStatement = ignore;
  base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
    function (node, st, c) { return c(node.expression, st, "Expression"); };
  base.IfStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Statement");
    if (node.alternate) { c(node.alternate, st, "Statement"); }
  };
  base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
  base.BreakStatement = base.ContinueStatement = ignore;
  base.WithStatement = function (node, st, c) {
    c(node.object, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.SwitchStatement = function (node, st, c) {
    c(node.discriminant, st, "Expression");
    for (var i = 0, list = node.cases; i < list.length; i += 1) {
      var cs = list[i];

      c(cs, st);
    }
  };
  base.SwitchCase = function (node, st, c) {
    if (node.test) { c(node.test, st, "Expression"); }
    for (var i = 0, list = node.consequent; i < list.length; i += 1)
      {
      var cons = list[i];

      c(cons, st, "Statement");
    }
  };
  base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
    if (node.argument) { c(node.argument, st, "Expression"); }
  };
  base.ThrowStatement = base.SpreadElement =
    function (node, st, c) { return c(node.argument, st, "Expression"); };
  base.TryStatement = function (node, st, c) {
    c(node.block, st, "Statement");
    if (node.handler) { c(node.handler, st); }
    if (node.finalizer) { c(node.finalizer, st, "Statement"); }
  };
  base.CatchClause = function (node, st, c) {
    if (node.param) { c(node.param, st, "Pattern"); }
    c(node.body, st, "Statement");
  };
  base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForStatement = function (node, st, c) {
    if (node.init) { c(node.init, st, "ForInit"); }
    if (node.test) { c(node.test, st, "Expression"); }
    if (node.update) { c(node.update, st, "Expression"); }
    c(node.body, st, "Statement");
  };
  base.ForInStatement = base.ForOfStatement = function (node, st, c) {
    c(node.left, st, "ForInit");
    c(node.right, st, "Expression");
    c(node.body, st, "Statement");
  };
  base.ForInit = function (node, st, c) {
    if (node.type === "VariableDeclaration") { c(node, st); }
    else { c(node, st, "Expression"); }
  };
  base.DebuggerStatement = ignore;

  base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
  base.VariableDeclaration = function (node, st, c) {
    for (var i = 0, list = node.declarations; i < list.length; i += 1)
      {
      var decl = list[i];

      c(decl, st);
    }
  };
  base.VariableDeclarator = function (node, st, c) {
    c(node.id, st, "Pattern");
    if (node.init) { c(node.init, st, "Expression"); }
  };

  base.Function = function (node, st, c) {
    if (node.id) { c(node.id, st, "Pattern"); }
    for (var i = 0, list = node.params; i < list.length; i += 1)
      {
      var param = list[i];

      c(param, st, "Pattern");
    }
    c(node.body, st, node.expression ? "Expression" : "Statement");
  };

  base.Pattern = function (node, st, c) {
    if (node.type === "Identifier")
      { c(node, st, "VariablePattern"); }
    else if (node.type === "MemberExpression")
      { c(node, st, "MemberPattern"); }
    else
      { c(node, st); }
  };
  base.VariablePattern = ignore;
  base.MemberPattern = skipThrough;
  base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
  base.ArrayPattern = function (node, st, c) {
    for (var i = 0, list = node.elements; i < list.length; i += 1) {
      var elt = list[i];

      if (elt) { c(elt, st, "Pattern"); }
    }
  };
  base.ObjectPattern = function (node, st, c) {
    for (var i = 0, list = node.properties; i < list.length; i += 1) {
      var prop = list[i];

      if (prop.type === "Property") {
        if (prop.computed) { c(prop.key, st, "Expression"); }
        c(prop.value, st, "Pattern");
      } else if (prop.type === "RestElement") {
        c(prop.argument, st, "Pattern");
      }
    }
  };

  base.Expression = skipThrough;
  base.ThisExpression = base.Super = base.MetaProperty = ignore;
  base.ArrayExpression = function (node, st, c) {
    for (var i = 0, list = node.elements; i < list.length; i += 1) {
      var elt = list[i];

      if (elt) { c(elt, st, "Expression"); }
    }
  };
  base.ObjectExpression = function (node, st, c) {
    for (var i = 0, list = node.properties; i < list.length; i += 1)
      {
      var prop = list[i];

      c(prop, st);
    }
  };
  base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
  base.SequenceExpression = function (node, st, c) {
    for (var i = 0, list = node.expressions; i < list.length; i += 1)
      {
      var expr = list[i];

      c(expr, st, "Expression");
    }
  };
  base.TemplateLiteral = function (node, st, c) {
    for (var i = 0, list = node.quasis; i < list.length; i += 1)
      {
      var quasi = list[i];

      c(quasi, st);
    }

    for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1)
      {
      var expr = list$1[i$1];

      c(expr, st, "Expression");
    }
  };
  base.TemplateElement = ignore;
  base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
    c(node.argument, st, "Expression");
  };
  base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
    c(node.left, st, "Expression");
    c(node.right, st, "Expression");
  };
  base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
    c(node.left, st, "Pattern");
    c(node.right, st, "Expression");
  };
  base.ConditionalExpression = function (node, st, c) {
    c(node.test, st, "Expression");
    c(node.consequent, st, "Expression");
    c(node.alternate, st, "Expression");
  };
  base.NewExpression = base.CallExpression = function (node, st, c) {
    c(node.callee, st, "Expression");
    if (node.arguments)
      { for (var i = 0, list = node.arguments; i < list.length; i += 1)
        {
          var arg = list[i];

          c(arg, st, "Expression");
        } }
  };
  base.MemberExpression = function (node, st, c) {
    c(node.object, st, "Expression");
    if (node.computed) { c(node.property, st, "Expression"); }
  };
  base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
    if (node.declaration)
      { c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression"); }
    if (node.source) { c(node.source, st, "Expression"); }
    if (node.attributes)
      { for (var i = 0, list = node.attributes; i < list.length; i += 1)
        {
          var attr = list[i];

          c(attr, st);
        } }
  };
  base.ExportAllDeclaration = function (node, st, c) {
    if (node.exported)
      { c(node.exported, st); }
    c(node.source, st, "Expression");
    if (node.attributes)
      { for (var i = 0, list = node.attributes; i < list.length; i += 1)
        {
          var attr = list[i];

          c(attr, st);
        } }
  };
  base.ImportAttribute = function (node, st, c) {
    c(node.value, st, "Expression");
  };
  base.ImportDeclaration = function (node, st, c) {
    for (var i = 0, list = node.specifiers; i < list.length; i += 1)
      {
      var spec = list[i];

      c(spec, st);
    }
    c(node.source, st, "Expression");
    if (node.attributes)
      { for (var i$1 = 0, list$1 = node.attributes; i$1 < list$1.length; i$1 += 1)
        {
          var attr = list$1[i$1];

          c(attr, st);
        } }
  };
  base.ImportExpression = function (node, st, c) {
    c(node.source, st, "Expression");
    if (node.options) { c(node.options, st, "Expression"); }
  };
  base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;

  base.TaggedTemplateExpression = function (node, st, c) {
    c(node.tag, st, "Expression");
    c(node.quasi, st, "Expression");
  };
  base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
  base.Class = function (node, st, c) {
    if (node.id) { c(node.id, st, "Pattern"); }
    if (node.superClass) { c(node.superClass, st, "Expression"); }
    c(node.body, st);
  };
  base.ClassBody = function (node, st, c) {
    for (var i = 0, list = node.body; i < list.length; i += 1)
      {
      var elt = list[i];

      c(elt, st);
    }
  };
  base.MethodDefinition = base.PropertyDefinition = base.Property = function (node, st, c) {
    if (node.computed) { c(node.key, st, "Expression"); }
    if (node.value) { c(node.value, st, "Expression"); }
  };

  exports.ancestor = ancestor;
  exports.base = base;
  exports.findNodeAfter = findNodeAfter;
  exports.findNodeAround = findNodeAround;
  exports.findNodeAt = findNodeAt;
  exports.findNodeBefore = findNodeBefore;
  exports.full = full;
  exports.fullAncestor = fullAncestor;
  exports.make = make;
  exports.recursive = recursive;
  exports.simple = simple;

}));


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CategoriesPriorityQueue = void 0;
class CategoriesPriorityQueue {
    constructor() {
        this.categories = {};
    }
    push(item, priority = 100) {
        const list = this.categories[priority] || [];
        list.push(item);
        this.categories[priority] = list;
    }
    clear() {
        this.categories = {};
    }
    *[Symbol.iterator]() {
        const lists = Object.keys(this.categories)
            .sort((left, right) => Number(left) - Number(right))
            .map((key) => this.categories[Number(key)]);
        for (const list of lists) {
            for (const item of list) {
                yield item;
            }
        }
    }
}
exports.CategoriesPriorityQueue = CategoriesPriorityQueue;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BlockChain = void 0;
class BlockChain {
    constructor(chain, currentFuncBlock, nameCounter = { value: 0 }) {
        this.chain = chain;
        this.currentFuncBlock = currentFuncBlock;
        this.closureCounter = 0;
        this.nameCounter = nameCounter;
        if (this.chain.length === 0) {
            this.closureCounter = 0;
        }
    }
    newBlock(variables) {
        const block = {
            variables: variables || new Map(),
            closures: new Map(),
            isForceBlock: false,
        };
        return new BlockChain([...this.chain, block], this.currentFuncBlock, this.nameCounter);
    }
    newFuncBlock(params) {
        const funcBlock = {
            variables: new Map(),
            closures: new Map(),
            params: params || new Map(),
            blockNameIndex: 0,
            isForceBlock: false,
        };
        return new BlockChain([...this.chain, funcBlock], funcBlock, this.nameCounter);
    }
    accessName(name) {
        let i = this.chain.length;
        if (name.startsWith('@@f')) {
            return false;
        }
        const currentFuncBlock = this.currentFuncBlock;
        let shouldMakeClosure = false;
        const isBlockHasName = (b, n) => {
            if (b.variables.has(n)) {
                return true;
            }
            if (this.isFuncBlock(b) && b.params.has(n)) {
                return true;
            }
            return false;
        };
        while (i-- > 0) {
            const block = this.chain[i];
            if (!shouldMakeClosure) {
                if (isBlockHasName(block, name)) {
                    return false;
                }
                if (this.isFuncBlock(block) && block === currentFuncBlock) {
                    shouldMakeClosure = true;
                }
                continue;
            }
            const makeClosure = (n) => {
                block.closures.set(n, `@c${this.closureCounter++}`);
            };
            if (block.variables.has(name)) {
                block.variables.set(name, 3);
                makeClosure(name);
                return true;
            }
            if (this.isFuncBlock(block) && block.params.has(name)) {
                block.params.set(name, 3);
                makeClosure(name);
                return true;
            }
        }
        return false;
    }
    isFuncBlock(block) {
        return !!block && !!block.params;
    }
    newName(name, kind, isForce = false) {
        const block = this.chain.length === 1
            ? this.chain[0]
            : kind === 'var'
                ? this.currentFuncBlock
                : this.chain[this.chain.length - 1];
        if (kind === 'var' && !isForce && (block === null || block === void 0 ? void 0 : block.variables.has(name))) {
            return;
        }
        if (this.isFuncBlock(block) && block.params.has(name)) {
            if (isForce) {
                block.params.delete(name);
            }
            else {
                block.variables.delete(name);
                return;
            }
        }
        block === null || block === void 0 ? void 0 : block.variables.set(name, 2);
    }
    newGlobal(name, type) {
        const block = this.chain[0];
        if (!block) {
            throw new Error('Root block is not assigned.');
        }
        block.variables.set(name, type);
    }
    getNameType(name) {
        let i = this.chain.length;
        while (i-- > 0) {
            const block = this.chain[i];
            let varType = block.variables.get(name);
            if (!varType && this.isFuncBlock(block)) {
                varType = block.params.get(name);
            }
            if (varType > 0) {
                return varType;
            }
        }
        return -1;
    }
    hasName(name) {
        return this.getNameType(name) > 0;
    }
    hasOwnName(name) {
        const block = this.getCurrentBlock();
        return block.variables.has(name) || (this.isFuncBlock(block) && block.params.has(name));
    }
    getName(name) {
        let i = this.chain.length;
        while (i-- > 0) {
            const block = this.chain[i];
            let varType = block.variables.get(name);
            let isParam = false;
            if (!varType && this.isFuncBlock(block)) {
                varType = block.params.get(name);
                isParam = true;
            }
            if (!varType) {
                continue;
            }
            if (varType === 2) {
                return (isParam ? '.' : '') + name;
            }
            if (varType === 3) {
                if (block.closures.has(name)) {
                    return '@' + name;
                }
                else {
                    throw new Error(`Closure for ${name} is not allocated.`);
                }
            }
        }
        return name;
    }
    getCurrentBlock() {
        return this.chain[this.chain.length - 1];
    }
    newBlockName() {
        if (this.currentFuncBlock) {
            return this.currentFuncBlock.blockNameIndex++;
        }
        else {
            return this.nameCounter.value++;
        }
    }
}
exports.BlockChain = BlockChain;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseAssembler = exports.parseCode = void 0;
exports.parseCode = (cd) => {
    const code = cd.trim();
    let operants = [];
    let i = 0;
    let val = "";
    let isInString = false;
    let oldStringStart = '';
    const codes = [];
    while (i < code.length) {
        const c = code[i++];
        if ((c === '"' || c === "'") && !isInString) {
            oldStringStart = c;
            isInString = true;
            val = c;
            continue;
        }
        if (isInString) {
            if (c === oldStringStart) {
                val += c;
                operants.push(val);
                isInString = false;
                val = '';
            }
            else {
                val += c;
            }
            continue;
        }
        if (c === ';' || c === ':') {
            if (val !== "") {
                operants.push(val);
                val = "";
            }
            if (operants.length > 0) {
                codes.push(operants);
            }
            operants = [];
            continue;
        }
        if (c.match(/\s/)) {
            if (val.length === 0) {
                continue;
            }
            else {
                if (val !== "") {
                    operants.push(val);
                }
                val = "";
                continue;
            }
        }
        val += c;
    }
    if (operants.length > 0) {
        codes.push(operants);
    }
    return codes;
};
exports.parseAssembler = (code, isRawString = false) => {
    code = code.trim();
    let operants = [];
    let i = 0;
    let val = "";
    let isInString = false;
    let oldStringStart = '';
    let codes = [];
    const funcs = [];
    let token = '';
    let tokenizingState = 0;
    let currentFunctionInfo = null;
    const NO_SET_FUNCTION_INFO_ERROR = 'current function info is not set.';
    const isEmpyty = (c) => /\s/.test(c);
    let isEscape = false;
    while (i < code.length) {
        const c = code[i++];
        if (tokenizingState === 0) {
            if (isEmpyty(c)) {
                if (!token) {
                    continue;
                }
                if (token !== 'func') {
                    throw new Error('INIT Unexpected token ' + token);
                }
                token = '';
                tokenizingState = 1;
                currentFunctionInfo = { functionName: '', params: [], instructions: [] };
                codes = currentFunctionInfo.instructions;
            }
            else {
                token += c;
            }
            continue;
        }
        if (tokenizingState === 1) {
            if (isEmpyty(c)) {
                continue;
            }
            if (c === '(') {
                if (!token) {
                    throw new Error('Function should have function name');
                }
                else {
                    if (!currentFunctionInfo) {
                        throw new Error(NO_SET_FUNCTION_INFO_ERROR);
                    }
                    currentFunctionInfo.functionName = token;
                    token = '';
                    tokenizingState = 2;
                }
            }
            else {
                token += c;
            }
            continue;
        }
        if (tokenizingState === 2) {
            if (isEmpyty(c)) {
                continue;
            }
            if (c === ',' || c === ')') {
                if (!currentFunctionInfo) {
                    throw new Error(NO_SET_FUNCTION_INFO_ERROR);
                }
                if (c === ',' && !token) {
                    throw new Error('parameter name should not be empty');
                }
                if (token) {
                    currentFunctionInfo.params.push(token);
                }
                token = '';
                if (c === ')') {
                    tokenizingState = 3;
                }
            }
            else {
                token += c;
            }
            continue;
        }
        if (tokenizingState === 3) {
            if (isEmpyty(c)) {
                continue;
            }
            if (c === '{') {
                tokenizingState = 4;
            }
            else {
                throw new Error("PARAMING_ENCLOSING Unexpected token " + c);
            }
            continue;
        }
        if ((c === '"' || c === "'") && !isInString) {
            oldStringStart = c;
            isInString = true;
            val = c;
            continue;
        }
        if (isInString) {
            if (c === '\\') {
                if (isEscape) {
                    isEscape = false;
                    if (isRawString) {
                        val += c;
                    }
                }
                else {
                    isEscape = true;
                    val += c;
                }
                continue;
            }
            if (c === '"' && isEscape) {
                val = val.substring(0, val.length - (isRawString ? 0 : 1)) + '"';
                isEscape = false;
                continue;
            }
            if (c === oldStringStart) {
                val += c;
                operants.push(val);
                isInString = false;
                val = '';
            }
            else {
                val += c;
            }
            isEscape = false;
            continue;
        }
        if (c === ';' || c === ':') {
            if (val !== "") {
                operants.push(val);
                val = "";
            }
            if (operants.length > 0) {
                codes.push(operants);
            }
            operants = [];
            continue;
        }
        if (c.match(/\s/)) {
            if (val.length === 0) {
                continue;
            }
            else {
                if (val !== "") {
                    operants.push(val);
                }
                val = "";
                continue;
            }
        }
        if (c === '}') {
            if (operants.length > 0) {
                codes.push(operants);
            }
            if (!currentFunctionInfo) {
                throw new Error(NO_SET_FUNCTION_INFO_ERROR);
            }
            funcs.push(currentFunctionInfo);
            tokenizingState = 0;
            currentFunctionInfo = null;
            continue;
        }
        val += c;
    }
    return funcs;
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	let __webpack_exports__ = __webpack_require__(0);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
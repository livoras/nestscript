"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCodeToProgram = void 0;
const vm_1 = require("./vm");
const utils_1 = require("./utils");
const parser_1 = require("./parser");
// tslint:disable-next-line: no-big-function
exports.parseCodeToProgram = (program) => {
    const funcsTable = {};
    const globalSymbols = {};
    const stringTable = [];
    const stringIndex = {};
    const funcs = program
        .trim()
        .match(/func[\s\S]+?\}/g) || [];
    // 1 pass
    const funcsInfo = [];
    let globalSize = 0;
    funcs.forEach((func) => {
        if (!func) {
            return;
        }
        const funcInfo = parseFunction(func);
        funcInfo.index = funcsInfo.length;
        funcsInfo.push(funcInfo);
        funcsTable[funcInfo.name] = funcInfo;
        funcInfo.globals.forEach((g) => {
            globalSymbols[g] = globalSize++;
        });
    });
    // 2 pass
    funcsInfo.forEach((funcInfo) => {
        const symbols = funcInfo.symbols;
        funcInfo.codes.forEach((code) => {
            const op = code[0];
            code[0] = vm_1.I[op];
            if (op === 'CALL') {
                code[1] = {
                    type: 3 /* FUNCTION_INDEX */,
                    value: funcsTable[code[1]].index,
                };
                code[2] = {
                    type: 5 /* ARG_COUNT */,
                    value: +code[2],
                };
            }
            else {
                code.forEach((o, i) => {
                    if (i === 0) {
                        return;
                    }
                    if (['JMP'].includes(op) ||
                        (['JE', 'JNE', 'JG', 'JL', 'JGE', 'JLE'].includes(op) && i === 3)) {
                        code[i] = {
                            type: 7 /* ADDRESS */,
                            value: funcInfo.labels[code[i]],
                        };
                        return;
                    }
                    /** 寄存器 */
                    let regIndex = symbols[o];
                    if (regIndex !== undefined) {
                        code[i] = {
                            type: 0 /* REGISTER */,
                            value: regIndex,
                        };
                        return;
                    }
                    /** 全局 */
                    regIndex = globalSymbols[o];
                    if (regIndex !== undefined) {
                        code[i] = {
                            type: 1 /* GLOBAL */,
                            value: regIndex + 1,
                        };
                        return;
                    }
                    /** 返回类型 */
                    if (o === '$RET') {
                        code[i] = {
                            type: 6 /* RETURN_VALUE */,
                        };
                        return;
                    }
                    /** 字符串 */
                    if (o.match(/^\"[\s\S]+\"$/) || o.match(/^\'[\s\S]+\'$/)) {
                        const str = o.replace(/^[\'\"]|[\'\"]$/g, '');
                        const index = stringIndex[str];
                        code[i] = {
                            type: 4 /* STRING */,
                            value: index === undefined
                                ? stringTable.length
                                : index,
                        };
                        if (index === undefined) {
                            stringIndex[str] = stringTable.length;
                            stringTable.push(str);
                        }
                        return;
                    }
                    /** Number */
                    code[i] = {
                        type: 2 /* NUMBER */,
                        value: +o,
                    };
                });
            }
        });
        console.log('CODES => ', funcInfo.codes);
    });
    const stream = parseToStream(funcsInfo, stringTable, globalSize);
    return Buffer.from(stream);
};
/**
 * header
 * codes (op(1) operantType(1) value(??) oprantType value | ...)
 * functionTable (ip(1) | numArgs(2))
 * stringTable (len(4) str | len(4) str)
 */
// tslint:disable-next-line: no-big-function
const parseToStream = (funcsInfo, strings, globalsSize) => {
    const stringTable = parseStringTableToBuffer(strings);
    let buffer = new ArrayBuffer(0);
    let mainFunctionIndex = 0;
    // tslint:disable-next-line: no-big-function
    funcsInfo.forEach((funcInfo) => {
        funcInfo.ip = buffer.byteLength;
        if (funcInfo.name === 'main') {
            mainFunctionIndex = funcInfo.index;
        }
        funcInfo.bytecodes = new ArrayBuffer(0);
        const appendBuffer = (buf) => {
            buffer = utils_1.concatBuffer(buffer, buf);
            funcInfo.bytecodes = utils_1.concatBuffer(funcInfo.bytecodes, buf);
        };
        const codeAdresses = [];
        const labelBufferIndex = [];
        funcInfo.codes.forEach((code, i) => {
            codeAdresses.push(buffer.byteLength);
            const cmd = code[0];
            const setBuf = new Uint8Array(1);
            setBuf[0] = cmd;
            appendBuffer(setBuf.buffer);
            console.log("===>", cmd);
            code.forEach((o, j) => {
                if (j === 0) {
                    return;
                }
                const operantBuf = new ArrayBuffer(vm_1.operantBytesSize[o.type]);
                const operantTypeBuf = new Uint8Array(1);
                operantTypeBuf[0] = o.type;
                appendBuffer(operantTypeBuf.buffer);
                switch (o.type) {
                    case 0 /* REGISTER */:
                    case 1 /* GLOBAL */:
                    case 5 /* ARG_COUNT */:
                    case 3 /* FUNCTION_INDEX */:
                    case 4 /* STRING */: {
                        const v = new Uint16Array(operantBuf);
                        v[0] = o.value;
                        appendBuffer(operantBuf);
                        break;
                    }
                    case 7 /* ADDRESS */: {
                        labelBufferIndex.push({ codeIndex: o.value, bufferIndex: buffer.byteLength });
                        appendBuffer(operantBuf);
                        break;
                    }
                    case 2 /* NUMBER */: {
                        const v = new Float64Array(operantBuf);
                        v[0] = o.value;
                        appendBuffer(operantBuf);
                        break;
                    }
                    case 6 /* RETURN_VALUE */:
                        break;
                    default:
                        throw new Error("Unknown operant " + o.type);
                }
            });
        });
        // Replace label
        labelBufferIndex.forEach((label) => {
            const buf = new Uint32Array(1);
            const address = codeAdresses[label.codeIndex];
            buf[0] = address;
            const buf2 = new Uint8Array(buf.buffer);
            const funBuf = new Uint8Array(buffer);
            buf2.forEach((b, i) => {
                funBuf.set([b], label.bufferIndex + i);
            });
            // console.log('----REPLACE ~~~~~~', buf)
        });
        // console.log('LABAL s', codeAdresses, labelBufferIndex)
    });
    // console.log('codes length ->', buffer.byteLength)
    /**
     * Header:
     *
     * mainFunctionIndex: 4
     * funcionTableBasicIndex: 4
     * stringTableBasicIndex: 4
     * globalsSize: 4
     */
    const FUNC_SIZE = 4 + 2 + 2; // ip + numArgs + localSize
    const funcionTableBasicIndex = 4 * 4 + buffer.byteLength;
    const stringTableBasicIndex = funcionTableBasicIndex + FUNC_SIZE * funcsInfo.length;
    const headerView = new Uint32Array(4);
    headerView[0] = mainFunctionIndex;
    headerView[1] = funcionTableBasicIndex;
    headerView[2] = stringTableBasicIndex;
    headerView[3] = globalsSize;
    buffer = utils_1.concatBuffer(headerView.buffer, buffer);
    // console.log('---> main', mainFunctionIndex, funcionTableBasicIndex, buffer.byteLength)
    /** Function Table */
    funcsInfo.forEach((funcInfo, i) => {
        const ipBuf = new Uint32Array(1);
        const numArgsAndLocal = new Uint16Array(2);
        ipBuf[0] = funcInfo.ip;
        numArgsAndLocal[0] = funcInfo.numArgs;
        numArgsAndLocal[1] = funcInfo.localSize;
        const funcBuf = utils_1.concatBuffer(ipBuf.buffer, numArgsAndLocal.buffer);
        buffer = utils_1.concatBuffer(buffer, funcBuf);
        // console.log('FUNCTION -> ', funcInfo.ip, funcInfo.localSize)
    });
    // console.log('string table index ->', buffer.byteLength)
    /** append string buffer */
    // console.log(arrayBufferToString(stringTable.buffer), "???")
    buffer = utils_1.concatBuffer(buffer, stringTable.buffer);
    return buffer;
};
const parseStringTableToBuffer = (stringTable) => {
    /** String Table */
    let strBuf = new ArrayBuffer(0);
    const indexes = {};
    stringTable.forEach((str, i) => {
        indexes[i] = strBuf.byteLength;
        const lenBuf = new Uint32Array(1);
        lenBuf[0] = str.length;
        strBuf = utils_1.concatBuffer(strBuf, lenBuf.buffer);
        strBuf = utils_1.concatBuffer(strBuf, utils_1.stringToArrayBuffer(str));
    });
    return {
        buffer: strBuf,
        indexes,
    };
};
const parseFunction = (func) => {
    const caps = func.match(/func\s+(\w[\w\d_]+)\s*?\(([\s\S]*)\)\s*?\{([\s\S]+?)\n\}/);
    const funcName = caps[1];
    const args = caps[2]
        .split(/\s*,\s*/g)
        .filter((s) => !!s);
    const body = parser_1.parseCode(caps[3]);
    const vars = body.filter((stat) => stat[0] === 'VAR');
    const globals = body
        .filter((stat) => stat[0] === 'GLOBAL')
        .map((stat) => stat[1]);
    const codes = body.filter((stat) => stat[0] !== 'VAR' && stat[0] !== 'GLOBAL');
    const symbols = {};
    vars.forEach((v, i) => {
        symbols[v[1]] = i + 1;
    });
    args.forEach((arg, i) => {
        symbols[arg] = -3 - i;
    });
    if (funcName === 'main') {
        codes.push(['EXIT']);
    }
    else if (codes[codes.length - 1][0] !== 'RET') {
        codes.push(['RET']);
    }
    const labels = {};
    const codesWithoutLabel = [];
    codes.forEach((code) => {
        if (code[0] === 'LABEL') {
            labels[code[1]] = codesWithoutLabel.length;
        }
        else {
            codesWithoutLabel.push(code);
        }
    });
    console.log('===>', funcName, codesWithoutLabel, labels);
    return {
        name: funcName,
        numArgs: args.length,
        symbols,
        codes: codesWithoutLabel,
        localSize: vars.length,
        globals,
        labels,
    };
};

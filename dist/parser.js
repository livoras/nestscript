"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCode = void 0;
const testProgram = `
  GLOBAL G1;
  GLOBAL G2;

  VAR R0;
  PUSH 2;
  PUSH 2;
  CALL foo 2;
  PRINT "======================";
  PRINT $RET;
  PRINT "+++++++++++++++++++++++";
  PUSH 'WORLD';
  PUSH "HELLO ";
  PRINT "HELLO WORL";
  CALL tow 2;
LABEL con1:
  MOV R0 $RET;
  PRINT R0;
  PRINT G1;
`;
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
// console.log(parseCode(`PUSH "DIE WORLD"`))
// console.log(parseCode(`PUSH "HELLO WORLD"`))
// console.log(parseCode('MOV R0 1'))
// console.log(parseCode(testProgram))

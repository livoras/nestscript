# nestscript
A script nested in JavaScript, dynamically run code in environment without `eval` and `new Function`.

```javascript
const testProgram = `
func bar(c, b) {
  MOV G2 "1";
  VAR R0;
  MOV R0 b;
  SUB R0 c;
  MOV $RET R0;
  RET;
}

func foo(a, b) {
  MOV G1 "loop";
  VAR R0;
  MOV R0 a;
  ADD R0 b;
  PUSH R0;
  PUSH 3;
  CALL bar 2;
}

func tow(s1, s2) {
  MOV $RET s1;
  ADD $RET s2;
  ADD G1 G2;
  RET;
}

func main() {
  GLOBAL G1;
  GLOBAL G2;

  VAR R0;
  PUSH 2;
  PUSH 2;
  CALL foo 2;

  PRINT $RET;
  PUSH 2;
  PUSH 2;
  CALL tow 2;

  MOV R0 $RET;
  MOV G2 1;
  MOV G1 1;
  JNE G1 G2 l2;

LABEL l3:
  PRINT R0;
  ADD R0 1;
  MOV R0 0;
  PUSH "check time";
  CALL_CTX "console" "time" 1;
  JMP l5;
LABEL l4:
  PRINT R0;
  MOV_CTX G1 "name.age";
  PUSH "LOG SOMETHING ...";
  CALL_CTX "console" "log" 1;
  PUSH "LOG SOMETHING ...2";
  PUSH "LOG SOMETHING ...3";
  CALL_CTX "console" "log" 2;
  PRINT G1;
  ADD R0 1;
LABEL l5:
  JL R0 1 l4;
  PUSH "check time";
  CALL_CTX "console" "timeEnd" 1;
}
`
```

# nestscript
A script nested in JavaScript, dynamically run code in environment without `eval` and `new Function`.

`nestscript` 可以让你在没有 `eval` 和 `new Function` 的环境中运行代码。

它包含了一个简单的汇编器和编译器后端的虚拟机，可以将下面的汇编指令形式的代码编译成二进制代码，并且在虚拟机上进行执行代码。因为该虚拟机是用 JavaScript 编写的，有 JavaScript 的环境都可以执行 `nestscript` 的二进制指令。你可以把它用在 Web 前端、微信小程序等场景。

`nestscript` 目前只包含编译器的后端，理论上可以将任意形式的 JS 、TS 等高级代码变编译成 `nestscript` 的 IR 指令。

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
  JL R0 10000 l4;
  PUSH "check time";
  CALL_CTX "console" "timeEnd" 1;
}
`
```

* * *

## Change Log

### 2020-06-17
* 完成基本的汇编器和虚拟机
* 完成命令行工具 nsc，可以 `nsc compile src dest` 将文本代码 -> 二进制文件，并且用 `nsc run file` 执行。


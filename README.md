# nestscript
A script nested in JavaScript, dynamically runs code in environment without `eval` and `new Function`.

`nestscript` 可以让你在没有 `eval` 和 `new Function` 的环境中运行代码。

它包含了一个简单的汇编器和编译器后端的虚拟机，可以将下面的汇编指令形式的代码编译成二进制代码，并且在虚拟机上进行执行代码。因为该虚拟机是用 JavaScript 编写的，有 JavaScript 的环境都可以执行 `nestscript` 的二进制指令。你可以把它用在 Web 前端、微信小程序等场景。

`nestscript` 目前只包含编译器的后端，理论上可以将任意形式的 JS 、TS 等高级代码变编译成 `nestscript` 的 IR 指令。

斐波那契数列：

```javascript
func fib(a) {
  PUSH "斐波那契数列";
  CALL_CTX "console" "time" 1;
  VAR r0;
  VAR r1;
  VAR r2;
  VAR tmp;
  MOV r1 1;
  MOV r2 1;
  MOV r0 0;
  JL a 3 l2;
  SUB a 2;
  JMP l1;

LABEL l0:
  MOV tmp r2;
  ADD r2 r1;
  MOV r1 tmp;
  ADD r0 1;

LABEL l1:
  PRINT r2;
  JL r0 a l0;
  MOV $RET r2;
  JMP l3;

LABEL l2:
  PRINT "DIRECT";
  MOV $RET 1;

LABEL l3:
  MOV tmp $RET;
  PUSH "斐波那契数列";
  CALL_CTX "console" "timeEnd" 1;
  MOV $RET tmp;
}

func main() {
  PUSH "THE RESULT IS";
  CALL_CTX "console" "log" 1;
  PUSH 5;
  CALL fib 1;
  PRINT $RET;
}
```

* * *

## Change Log

### 2020-06-17
* 完成基本的汇编器和虚拟机
* 完成命令行工具 nsc，可以 `nsc compile src dest` 将文本代码 -> 二进制文件，并且用 `nsc run file` 执行
* 斐波那契数列计算例子

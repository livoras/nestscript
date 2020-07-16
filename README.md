# nestscript
A script nested in JavaScript, dynamically runs code in environment without `eval` and `new Function`.

`nestscript` 可以让你在没有 `eval` 和 `new Function` 的 JavaScript 环境中运行二进制指令文件。

原理上就是把 JavaScript 先编译成 `nestscript` 的 IR 指令，然后把指令编译成二进制的文件。只要在环境中引入使用 JavaScript 编写的 `nestscript` 的虚拟机，都可以执行 `nestscript` 的二进制文件。你可以把它用在 Web 前端、微信小程序等场景。

它包含三部分：

1. **代码生成器**：将 JavaScript 编译成 `nestscript` 中间指令。
2. **汇编器**：将中间指令编译成可运行在 `nestscript` 虚拟机的二进制文件。
3. **虚拟机**：执行汇编器生成的二进制文件。

理论上你可以将任意语言编译成 `nestscript` 指令集，但是目前 `nestscript` 只包含了一个代码生成器，目前支持将 JavaScript 编译成 `nestscript` 指令。

## nestscript 指令集

```
MOV, ADD, SUB, MUL, DIV, MOD,
EXP, NEG, INC, DEC,

LT, GT, EQ, LE, GE, NE,
AND, OR, XOR, NOT, SHL, SHR,

JMP, JE, JNE, JG, JL, JIF, JF,
JGE, JLE, PUSH, POP, CALL, PRINT,
RET, PAUSE, EXIT,

CALL_CTX, CALL_VAR, CALL_REG, MOV_CTX, MOV_PROP,
SET_CTX,
NEW_OBJ, NEW_ARR, SET_KEY,
FUNC, ALLOC,
```

详情请见 [nestscript 指令集手册](https://github.com/livoras/nestscript/blob/master/docs/ir.md)。

例如使用指令编写的，斐波那契数列：

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

## TODO
- [ ] `export`，`import` 模块支持
- [ ] `class` 支持
- [ ] 中间代码优化
- [ ] 文档：
  - [ ] IR 指令手册
  - [ ] 安装文档
  - [ ] 使用手册
  - [ ] 使用 demo
  

* * *

## Change Log
## 2020-07-16
* 逻辑表达式 "&&" 和 "||" 的 codegen 和虚拟机实现
* 完成闭包在虚拟机中的实现

## 2020-07-15
* 完成闭包变量的标记方式：内层函数“污染”外层的方式
* 重构代码生成的方式，使用函数数组延迟代码生成，这样可以在标记完闭包变量以后再进行 codegen
* 设计闭包变量和普通变量的标记方式“@xxx”表示闭包变量，“%xxx”表示普通自动生成的寄存器
* 下一步设计闭包变量在汇编器和虚拟机中的生成和调取机制

## 2020-07-13
* 设计闭包的实现
* 实现 `CALL_REG R0 3` 指令，可以把函数缓存到变量中随后进行调用

## 2020-07-10
* 支持回调函数的 codegen
* 完成基本的 JS -> 汇编的转化和运行
* 循环 codegen
* 三种值的更新和获取
  * Identifier
    * context
    * variables
  * Memeber

## 2020-07-09
* 完成二进制表达式的 codegen
* 完成简单的赋值语句
* 完成对象属性访问的 codegen
* if 语句的 codegen

## 2020-07-03
* 确定使用动态分配 & 释放寄存器方案
* 表达式计算值存储到寄存器方案，寄存器名称外层生成、传入、释放

## 2020-06-22
* 开始使用 acorn 解析 ast，准备把 ast 编译成 IR 指令

## 2020-06-19
* `FUNC R0 sayHi`: 构建 JS 函数封装 `sayHi` 函数并存放到 R0 寄存器，可以用作 JS 的回调参数，见 `example/callback.nes`
* `CALL_VAR R0 "forEach" 1`: 调用寄存器里面存值的某个方法
* `MOV_PROP R0 R1 "length"`: 将 R1 寄存器的值的 "length" 的值放到 R0 寄存器中

## 2020-06-18
* 完成
  * `NEW_ARR R0`: 字面量数组
  * `NEW_OBJ R0`: 字面量对象
  * `SET_KEY R0 "0" "hello"`: 设置某个寄存器里面的 key value 值
  * `CALL_CTX "console" "log" 1`: 调用 ctx 里面的某个函数方法
  * `MOV_CTX R0 "console.log"`: 把 ctx 某个值移动到寄存器

### 2020-06-17
* 完成基本的汇编器和虚拟机
* 完成命令行工具 nsc，可以 `nsc compile src dest` 将文本代码 -> 二进制文件，并且用 `nsc run file` 执行
* 斐波那契数列计算例子
* 编译打包成第三方包

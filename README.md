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
* `CALLBACK R0 sayHi`: 构建 JS 函数封装 `sayHi` 函数并存放到 R0 寄存器，可以用作 JS 的回调参数，见 `example/callback.nes`
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

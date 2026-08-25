# NestScript 中文文档

[English README](README.md)

NestScript 是一个 JavaScript 编译器和寄存器虚拟机，面向没有 `eval`、
`new Function` 或其他动态源码执行能力的运行环境，例如微信小程序、受 CSP
限制的网页和嵌入式 JavaScript 宿主。

## 工作方式

![NestScript 编译与运行架构](docs/architecture.png)

NestScript 只有一条运行时路径：

1. 在可信的构建环境中解析 JavaScript，并降低为内部汇编表示。
2. 将汇编编码为带版本信息的定宽二进制指令流。
3. 在目标环境中由寄存器 VM 执行；目标环境不会重新解析或执行原始源码。

运行时包含定宽指令打包、静态超级指令、数值专用路径、属性缓存、调用缓存和
循环内核。编译器可以放在发布流水线中，客户端只需携带 VM 和字节码。

> [!IMPORTANT]
> NestScript 不是安全沙箱。guest 代码可以调用宿主上下文中暴露的函数，也可以
> 修改暴露的对象。只执行可信字节码，并且只暴露必要的宿主 API。

## 安装

```sh
npm install nestscript
```

包中包含 `nsc` 命令行工具和浏览器 UMD 包 `dist/vm.js`。

## 快速开始

`main.js`：

```js
function greet(name) {
  return 'Hello, ' + name + '!'
}

result = greet('NestScript')
```

编译并运行：

```sh
npx nsc compile main.js main.nsc
npx nsc run main.nsc
```

`main.nsc` 中保存的是字节码，不是 JavaScript 源码。

## JavaScript API

```js
const {
  compileJavaScriptToBytecode,
  createVMFromArrayBuffer,
  createVMFromJavaScript,
} = require('nestscript')

const context = { console, Math }
const bytecode = compileJavaScriptToBytecode('result = 40 + 2')
const vm = createVMFromArrayBuffer(bytecode, context)
vm.run()
console.log(context.result) // 42
```

在受限运行时中，建议在构建阶段调用编译器，只把 `ArrayBuffer` 字节码和 VM
部署到客户端。`context` 是 guest 的全局对象，宿主对象不会自动复制；请避免
直接暴露完整的 `window` 或 `globalThis`。

## 浏览器和小程序

将 `dist/vm.js` 作为 UMD 脚本加载后，API 位于宿主全局对象的 `NestScript`：

```html
<script src="/vendor/nestscript/vm.js"></script>
<script>
  fetch('/programs/main.nsc')
    .then(function (response) { return response.arrayBuffer() })
    .then(function (bytecode) {
      var vm = NestScript.createVMFromArrayBuffer(bytecode, {
        console: console,
        Math: Math,
      })
      vm.run()
    })
</script>
```

微信小程序等平台可以使用各自的网络 API 获取 `ArrayBuffer`，再按同样方式创建
VM。

## 当前语义边界

当前编译器覆盖性能基准使用的核心语法：变量、字面量、算术和比较、分支、循环、
函数与调用、对象和数组、属性读写、全局/上下文访问以及宿主函数调用。

不支持的语法会在编译阶段抛出 `UnsupportedOpcodeError`，不会偷偷交给宿主执行。
ES 模块、class、`eval` 和 `Function` 构造器不在设计范围内；闭包捕获、异常路由和
部分旧式引用操作仍待编译器补齐。新增语法时请同步添加行为测试。

## CLI

| 命令 | 说明 |
| --- | --- |
| `nsc compile <source.js> <output>` | 编译为二进制字节码。 |
| `nsc codegen <source.js> <output.nes>` | 输出内部汇编，便于调试。 |
| `nsc run <bytecode>` | 使用 Node.js 宿主上下文执行字节码。 |

## 开发

```sh
git clone https://github.com/livoras/nestscript.git
cd nestscript
npm install
npm test
npm run build
```

目录说明：

- `src/compiler/`：解析器、源码降低和编译器内部 IR 工具。
- `src/vm.ts`：唯一的定宽寄存器 VM 和字节码序列化器。
- `src/js.ts`：面向源码的便捷 API。
- `src/cli.ts`：Node.js 命令行适配层。
- `dist/vm.js`：生成的浏览器 UMD 包。
- `test/`：运行时和字节码回归测试。

性能测试：

```sh
npm run test:performance
```

## 安全说明

NestScript 不是沙箱。远程分发字节码时应做完整性校验，并严格控制宿主上下文中
暴露的能力。

## 许可证

MIT，见 [LICENSE](LICENSE)。

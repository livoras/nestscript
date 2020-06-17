nsc
===



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nsc.svg)](https://npmjs.org/package/nsc)
[![Downloads/week](https://img.shields.io/npm/dw/nsc.svg)](https://npmjs.org/package/nsc)
[![License](https://img.shields.io/npm/l/nsc.svg)](https://github.com/nestscript/nsc/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nsc
$ nsc COMMAND
running command...
$ nsc (-v|--version|version)
nsc/0.0.0 darwin-x64 node-v10.16.0
$ nsc --help [COMMAND]
USAGE
  $ nsc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nsc hello [FILE]`](#nsc-hello-file)
* [`nsc help [COMMAND]`](#nsc-help-command)

## `nsc hello [FILE]`

describe the command here

```
USAGE
  $ nsc hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ nsc hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/nestscript/nsc/blob/v0.0.0/src/commands/hello.ts)_

## `nsc help [COMMAND]`

display help for nsc

```
USAGE
  $ nsc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_
<!-- commandsstop -->

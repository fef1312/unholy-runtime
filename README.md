# The Unholy Runtime

This must be one of the stupidest projects I have ever done: An interpreter written in an
interpreted language.  Even though the Unholy language is meant to compile to native machine code
eventually, this runtime should prove quite useful for debugging the standard library (when it is
ever written).  It includes a Lexer and a Parser, the latter of which outputs an AST, as well as the
actual interpreter which executed the instructions of that tree.

## Current Status

This is an early alpha version; only a minimal subset of the language is supported.
By the way: the language specs are only a vague phantasy in my head at the moment.

## License

Copyright &copy; 2020 Felix Kopp <sandtler@sandtler.club>

This program is licensed under the 2-Clause BSD license.  See the `LICENSE` file for details.

The core architecture is ~~heavily inspired by~~ stolen from the
[TypeScript Compiler](https://github.com/microsoft/TypeScript), which is licensed under the Apache
License.  Follow the link for details, including the full license text.

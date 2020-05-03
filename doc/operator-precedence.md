# Unholy Operator Precedence

Operators are listed from highest (18) to lowest (1) precedence.

| Precedence | Operator                    | Description                           | Associativity |
|:----------:|:----------------------------|:--------------------------------------|:-------------:|
|     18     | `(...)`                     | Grouping                              |      N/A      |
|     17     | `()`                        | Function call                         | left-to-right |
|     17     | `[]`                        | Array index access                    | left-to-right |
|     17     | `.`                         | Struct/Union/Class member access      | left-to-right |
|     17     | `new …`                     | Class instantiation                   |      N/A      |
|     16     | `… ++`, `… --`              | Postfix increment/decrement           | left-to-right |
|     15     | `++ …`, `-- …`              | Prefix increment/decrement            | right-to-left |
|     15     | `+ …`, `- …`                | Unary plus/minus                      | right-to-left |
|     15     | `! …`, `~ …`                | Logical/bitwise NOT                   | right-to-left |
|     15     | `(type)`                    | Typecast                              | right-to-left |
|     14     | `**`                        | Exponentiation operator               | right-to-left |
|     13     | `*`, `/`, `%`               | Multiplicative operators              | left-to-right |
|     12     | `… + …`, `… - …`            | Additive operators                    | left-to-right |
|     11     | `<<`, `>>`, `<<<`, `>>>`    | Bitwise shift/rotate operators        | left-to-right |
|     10     | `<`, `>`, `<=`, `>=`        | Relational operators                  | left-to-right |
|      9     | `==`, `!=`                  | Relational (in-)eqality operators     | left-to-right |
|      8     | `&`                         | Bitwise AND                           | left-to-right |
|      7     | `^`                         | Bitwise XOR                           | left-to-right |
|      6     | `|`                         | Bitwise OR                            | left-to-right |
|      5     | `&&`                        | Logical AND                           | left-to-right |
|      4     | `||`                        | Logical OR                            | left-to-right |
|      3     | `… ? … : …`                 | Ternary conditional                   | right-to-left |
|      2     | `=`, `+=`, `*=`, `<<=`, …   | Assignment                            | right-to-left |
|      1     | `… , …`                     | Comma                                 | left-to-right |

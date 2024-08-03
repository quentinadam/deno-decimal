# decimal

[![JSR](https://jsr.io/badges/@quentinadam/decimal)](https://jsr.io/@quentinadam/decimal)
[![CI](https://github.com/quentinadam/deno-decimal/actions/workflows/ci.yml/badge.svg)](https://github.com/quentinadam/deno-decimal/actions/workflows/ci.yml)

A library for working with arbitrary precision decimal numbers. Numbers are represented by a mantissa (bigint) and an
exponent (number). Division may fail if the resulting number cannot be represented with a fixed number of decimals (like
1/3).

## Usage

```ts
import Decimal from '@quentinadam/decimal';

const a = Decimal.from(1.2);
const b = Decimal.from('3.4');
const c = a.add(b);

console.log(c.toString()); // prints 4.6
```

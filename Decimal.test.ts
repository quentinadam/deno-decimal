import assert from '@quentinadam/assert';
import Decimal from './Decimal.ts';

function wrap(fn: () => void) {
  try {
    fn();
    return undefined;
  } catch (e) {
    return e;
  }
}

Deno.test('fromBigInt', () => {
  const vectors = [
    { input: 123n, mantissa: 123n, exponent: 0 },
    { input: 120n, mantissa: 12n, exponent: 1 },
    { input: -123n, mantissa: -123n, exponent: 0 },
    { input: -120n, mantissa: -12n, exponent: 1 },
    { input: 0n, mantissa: 0n, exponent: 0 },
  ];
  for (const { input, mantissa, exponent } of vectors) {
    const value = Decimal.fromBigInt(input);
    assert(value.mantissa === mantissa && value.exponent === exponent);
  }
});

Deno.test('fromString', () => {
  const vectors = [
    { input: '123', mantissa: 123n, exponent: 0 },
    { input: '-123', mantissa: -123n, exponent: 0 },
    { input: '120', mantissa: 12n, exponent: 1 },
    { input: '-120', mantissa: -12n, exponent: 1 },
    { input: '0', mantissa: 0n, exponent: 0 },
    { input: '123.0', mantissa: 123n, exponent: 0 },
    { input: '-123.0', mantissa: -123n, exponent: 0 },
    { input: '120.0', mantissa: 12n, exponent: 1 },
    { input: '-120.0', mantissa: -12n, exponent: 1 },
    { input: '0.0', mantissa: 0n, exponent: 0 },
    { input: '123.45', mantissa: 12345n, exponent: -2 },
    { input: '-123.45', mantissa: -12345n, exponent: -2 },
    { input: '123e2', mantissa: 123n, exponent: 2 },
    { input: '-123e2', mantissa: -123n, exponent: 2 },
    { input: '1.23e1', mantissa: 123n, exponent: -1 },
    { input: '-1.23e1', mantissa: -123n, exponent: -1 },
    { input: '123e-2', mantissa: 123n, exponent: -2 },
    { input: '-123e-2', mantissa: -123n, exponent: -2 },
    { input: '1230e-2', mantissa: 123n, exponent: -1 },
    { input: '-1230e-2', mantissa: -123n, exponent: -1 },
    { input: '1.23e-2', mantissa: 123n, exponent: -4 },
    { input: '-1.23e-2', mantissa: -123n, exponent: -4 },
    { input: '123456789.123456789123456789', mantissa: 123456789123456789123456789n, exponent: -18 },
    { input: '-123456789.123456789123456789', mantissa: -123456789123456789123456789n, exponent: -18 },
  ];
  for (const { input, mantissa, exponent } of vectors) {
    const value = Decimal.fromString(input);
    assert(value.mantissa === mantissa && value.exponent === exponent);
  }
});

Deno.test('toString', () => {
  const vectors = [
    { input: Decimal.from(123), output: '123' },
    { input: Decimal.from(12.30), output: '12.3' },
    { input: Decimal.from(0.123), output: '0.123' },
    { input: Decimal.from(0.0123), output: '0.0123' },
    { input: Decimal.from(-123), output: '-123' },
    { input: Decimal.from(-12.30), output: '-12.3' },
    { input: Decimal.from(-0.123), output: '-0.123' },
    { input: Decimal.from(-0.0123), output: '-0.0123' },
    { input: Decimal.from('123456789.123456789123456789'), output: '123456789.123456789123456789' },
    { input: Decimal.from('-123456789.123456789123456789'), output: '-123456789.123456789123456789' },
  ];
  for (const { input, output } of vectors) {
    assert(input.toString() === output);
  }
});

Deno.test('toFixed', () => {
  const vectors = [
    { input: Decimal.from(123), precision: 0, output: '123' },
    { input: Decimal.from(-123), precision: 0, output: '-123' },
    { input: Decimal.from(123), precision: 1, output: '123.0' },
    { input: Decimal.from(-123), precision: 1, output: '-123.0' },
    { input: Decimal.from(123.8), precision: 0, output: '124' },
    { input: Decimal.from(-123.8), precision: 0, output: '-124' },
    { input: Decimal.from(123.45), precision: 1, output: '123.5' },
    { input: Decimal.from(-123.45), precision: 1, output: '-123.5' },
  ];
  for (const { input, precision, output } of vectors) {
    assert(input.toFixed(precision) === output);
  }
});

Deno.test('eq', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(123), output: true },
    { a: Decimal.from(123), b: Decimal.from(456), output: false },
    { a: Decimal.from(-123), b: Decimal.from(-123), output: true },
    { a: Decimal.from(-123), b: Decimal.from(-456), output: false },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.eq(b) === output);
  }
});

Deno.test('add', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(456), output: Decimal.from(579) },
    { a: Decimal.from(1000), b: Decimal.from(456), output: Decimal.from(1456) },
    { a: Decimal.from(1000), b: Decimal.from(45.6), output: Decimal.from(1045.6) },
    { a: Decimal.from(1000), b: Decimal.from(-45.6), output: Decimal.from(954.4) },
    { a: Decimal.from(-1000), b: Decimal.from(-45.6), output: Decimal.from(-1045.6) },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.add(b).eq(output));
  }
});

Deno.test('sub', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(456), output: Decimal.from(-333) },
    { a: Decimal.from(1000), b: Decimal.from(456), output: Decimal.from(544) },
    { a: Decimal.from(1000), b: Decimal.from(45.6), output: Decimal.from(954.4) },
    { a: Decimal.from(1000), b: Decimal.from(-45.6), output: Decimal.from(1045.6) },
    { a: Decimal.from(-1000), b: Decimal.from(-45.6), output: Decimal.from(-954.4) },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.sub(b).eq(output));
  }
});

Deno.test('mul', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(456), output: Decimal.from(56088) },
    { a: Decimal.from(1000), b: Decimal.from(456), output: Decimal.from(456000) },
    { a: Decimal.from(1000), b: Decimal.from(45.6), output: Decimal.from(45600) },
    { a: Decimal.from(1000), b: Decimal.from(-45.6), output: Decimal.from(-45600) },
    { a: Decimal.from(-1000), b: Decimal.from(-45.6), output: Decimal.from(45600) },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.mul(b).eq(output));
  }
});

Deno.test('fromFraction', () => {
  const vectors:
    ({ numerator: bigint; denominator: bigint } & ({ success: true; output: Decimal } | { success: false }))[] = [
      { numerator: 1n, denominator: 2n, success: true, output: Decimal.from(0.5) },
      { numerator: 3n, denominator: 12n, success: true, output: Decimal.from(0.25) },
      { numerator: 1n, denominator: 3n, success: false },
    ];
  for (const vector of vectors) {
    const { numerator, denominator } = vector;
    if (vector.success) {
      assert(Decimal.fromFraction(numerator, denominator).eq(vector.output));
    } else {
      assert(wrap(() => Decimal.fromFraction(numerator, denominator)) instanceof Error);
    }
  }
});

Deno.test('toFraction', () => {
  const vectors: { input: Decimal; numerator: bigint; denominator: bigint }[] = [
    { input: Decimal.from(123), numerator: 123n, denominator: 1n },
    { input: Decimal.from(-123), numerator: -123n, denominator: 1n },
    { input: Decimal.from(1000), numerator: 1000n, denominator: 1n },
    { input: Decimal.from(0), numerator: 0n, denominator: 1n },
    { input: Decimal.from('123456789123456789'), numerator: 123456789123456789n, denominator: 1n },
    { input: Decimal.from('-123456789123456789'), numerator: -123456789123456789n, denominator: 1n },
    { input: Decimal.from(1.23), numerator: 123n, denominator: 100n },
    { input: Decimal.from(-1.23), numerator: -123n, denominator: 100n },
    { input: Decimal.from(0.5), numerator: 1n, denominator: 2n },
    { input: Decimal.from(0.25), numerator: 1n, denominator: 4n },
    { input: Decimal.from(0.125), numerator: 1n, denominator: 8n },
    { input: Decimal.from(123.456), numerator: 15432n, denominator: 125n },
    { input: Decimal.from(-123.456), numerator: -15432n, denominator: 125n },
    { input: Decimal.from('1.23456789123456789'), numerator: 123456789123456789n, denominator: 100000000000000000n },
  ];
  for (const { input, numerator, denominator } of vectors) {
    const fraction = input.toFraction();
    assert(
      fraction.numerator === numerator && fraction.denominator === denominator,
      `Expected: ${input}, (${numerator}, ${denominator}), Got: (${fraction.numerator}, ${fraction.denominator})`,
    );
  }
});

Deno.test('div', () => {
  const vectors: ({ a: Decimal; b: Decimal } & ({ success: true; output: Decimal } | { success: false }))[] = [
    { a: Decimal.from(1000), b: Decimal.from(2), success: true, output: Decimal.from(500) },
    { a: Decimal.from(2), b: Decimal.from(1000), success: true, output: Decimal.from(0.002) },
    { a: Decimal.from(1000), b: Decimal.from(0.2), success: true, output: Decimal.from(5000) },
    { a: Decimal.from(1), b: Decimal.from(8), success: true, output: Decimal.from(0.125) },
    { a: Decimal.from(141), b: Decimal.from(376), success: true, output: Decimal.from(0.375) },
    { a: Decimal.from(1), b: Decimal.from(3), success: false },
    { a: Decimal.from(1000), b: Decimal.from(30), success: false },
  ];
  for (const vector of vectors) {
    const { a, b } = vector;
    if (vector.success) {
      assert(a.div(b).eq(vector.output));
    } else {
      assert(wrap(() => a.div(b)) instanceof Error);
    }
  }
});

Deno.test('inv', () => {
  const vectors: ({ input: Decimal } & ({ success: true; output: Decimal } | { success: false }))[] = [
    { input: Decimal.from(1000), success: true, output: Decimal.from(0.001) },
    { input: Decimal.from(0.2), success: true, output: Decimal.from(5) },
    { input: Decimal.from(1), success: true, output: Decimal.from(1) },
    { input: Decimal.from(0.5), success: true, output: Decimal.from(2) },
    { input: Decimal.from(0.25), success: true, output: Decimal.from(4) },
    { input: Decimal.from(3), success: false },
  ];
  for (const vector of vectors) {
    const { input } = vector;
    if (vector.success) {
      assert(input.inv().eq(vector.output), input.toString());
    } else {
      assert(wrap(() => input.inv()) instanceof Error);
    }
  }
});

Deno.test('mod', () => {
  const vectors = [
    { a: Decimal.from(1000), b: Decimal.from(2), output: Decimal.from(0) },
    { a: Decimal.from(1000), b: Decimal.from(3), output: Decimal.from(1) },
    { a: Decimal.from(1000), b: Decimal.from(0.2), output: Decimal.from(0) },
    { a: Decimal.from(1000), b: Decimal.from(0.3), output: Decimal.from(0.1) },
    { a: Decimal.from(1), b: Decimal.from(8), output: Decimal.from(1) },
    { a: Decimal.from(17.5), b: Decimal.from(3), output: Decimal.from(2.5) },
    { a: Decimal.from(1), b: Decimal.from(3), output: Decimal.from(1) },
    { a: Decimal.from(1000), b: Decimal.from(30), output: Decimal.from(10) },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.mod(b).eq(output));
  }
});

Deno.test('pow', () => {
  const vectors: ({ a: Decimal; b: number } & ({ success: true; output: Decimal } | { success: false }))[] = [
    { a: Decimal.from(2), b: 1, success: true, output: Decimal.from(2) },
    { a: Decimal.from(2), b: 0, success: true, output: Decimal.from(1) },
    { a: Decimal.from(2), b: 2, success: true, output: Decimal.from(4) },
    { a: Decimal.from(2), b: -1, success: true, output: Decimal.from(0.5) },
    { a: Decimal.from(2), b: -2, success: true, output: Decimal.from(0.25) },
    { a: Decimal.from(0.2), b: 1, success: true, output: Decimal.from(0.2) },
    { a: Decimal.from(0.2), b: 0, success: true, output: Decimal.from(1) },
    { a: Decimal.from(0.2), b: 2, success: true, output: Decimal.from(0.04) },
    { a: Decimal.from(0.2), b: -1, success: true, output: Decimal.from(5) },
    { a: Decimal.from(0.2), b: -2, success: true, output: Decimal.from(25) },
    { a: Decimal.from(3), b: 1, success: true, output: Decimal.from(3) },
    { a: Decimal.from(3), b: 0, success: true, output: Decimal.from(1) },
    { a: Decimal.from(3), b: 2, success: true, output: Decimal.from(9) },
    { a: Decimal.from(3), b: -1, success: false },
    { a: Decimal.from(-2), b: 1, success: true, output: Decimal.from(-2) },
    { a: Decimal.from(-2), b: 0, success: true, output: Decimal.from(1) },
    { a: Decimal.from(-2), b: 2, success: true, output: Decimal.from(4) },
    { a: Decimal.from(-2), b: -1, success: true, output: Decimal.from(-0.5) },
    { a: Decimal.from(-2), b: -2, success: true, output: Decimal.from(0.25) },
  ];
  for (const vector of vectors) {
    const { a, b } = vector;
    if (vector.success) {
      assert(a.pow(b).eq(vector.output));
    } else {
      assert(wrap(() => a.pow(b)) instanceof Error);
    }
  }
});

Deno.test('abs', () => {
  const vectors = [
    { input: Decimal.from(123), output: Decimal.from(123) },
    { input: Decimal.from(-123), output: Decimal.from(123) },
    { input: Decimal.from(0), output: Decimal.from(0) },
    { input: Decimal.from(12.3), output: Decimal.from(12.3) },
    { input: Decimal.from(-12.3), output: Decimal.from(12.3) },
  ];
  for (const { input, output } of vectors) {
    assert(input.abs().eq(output));
  }
});

Deno.test('neg', () => {
  const vectors = [
    { input: Decimal.from(123), output: Decimal.from(-123) },
    { input: Decimal.from(-123), output: Decimal.from(123) },
    { input: Decimal.from(0), output: Decimal.from(0) },
    { input: Decimal.from(12.3), output: Decimal.from(-12.3) },
    { input: Decimal.from(-12.3), output: Decimal.from(12.3) },
  ];
  for (const { input, output } of vectors) {
    assert(input.neg().eq(output));
  }
});

Deno.test('floor', () => {
  const vectors = [
    { input: Decimal.from(123), output: Decimal.from(123) },
    { input: Decimal.from(12.3), output: Decimal.from(12) },
    { input: Decimal.from(12.5), output: Decimal.from(12) },
    { input: Decimal.from(12.7), output: Decimal.from(12) },
    { input: Decimal.from(0), output: Decimal.from(0) },
    { input: Decimal.from(-12.3), output: Decimal.from(-13) },
    { input: Decimal.from(-12.5), output: Decimal.from(-13) },
    { input: Decimal.from(-12.7), output: Decimal.from(-13) },
    { input: Decimal.from(-123), output: Decimal.from(-123) },
  ];
  for (const { input, output } of vectors) {
    assert(input.floor().eq(output));
  }
});

Deno.test('ceil', () => {
  const vectors = [
    { input: Decimal.from(123), output: Decimal.from(123) },
    { input: Decimal.from(12.3), output: Decimal.from(13) },
    { input: Decimal.from(12.5), output: Decimal.from(13) },
    { input: Decimal.from(12.7), output: Decimal.from(13) },
    { input: Decimal.from(0), output: Decimal.from(0) },
    { input: Decimal.from(-12.3), output: Decimal.from(-12) },
    { input: Decimal.from(-12.5), output: Decimal.from(-12) },
    { input: Decimal.from(-12.7), output: Decimal.from(-12) },
    { input: Decimal.from(-123), output: Decimal.from(-123) },
  ];
  for (const { input, output } of vectors) {
    assert(input.ceil().eq(output));
  }
});

Deno.test('round', () => {
  const vectors = [
    { input: Decimal.from(123), output: Decimal.from(123) },
    { input: Decimal.from(12.3), output: Decimal.from(12) },
    { input: Decimal.from(12.5), output: Decimal.from(13) },
    { input: Decimal.from(12.7), output: Decimal.from(13) },
    { input: Decimal.from(0), output: Decimal.from(0) },
    { input: Decimal.from(-12.3), output: Decimal.from(-12) },
    { input: Decimal.from(-12.5), output: Decimal.from(-12) },
    { input: Decimal.from(-12.7), output: Decimal.from(-13) },
    { input: Decimal.from(-123), output: Decimal.from(-123) },
  ];
  for (const { input, output } of vectors) {
    assert(input.round().eq(output));
  }
});

Deno.test('magnitude', () => {
  const vectors = [
    { input: Decimal.from(999), output: 2 },
    { input: Decimal.from(123), output: 2 },
    { input: Decimal.from(100), output: 2 },
    { input: Decimal.from(99.9), output: 1 },
    { input: Decimal.from(12.3), output: 1 },
    { input: Decimal.from(10), output: 1 },
    { input: Decimal.from(9.99), output: 0 },
    { input: Decimal.from(1.23), output: 0 },
    { input: Decimal.from(1), output: 0 },
    { input: Decimal.from(0.999), output: -1 },
    { input: Decimal.from(0.123), output: -1 },
    { input: Decimal.from(0.1), output: -1 },
    { input: Decimal.from(0.0999), output: -2 },
    { input: Decimal.from(0.0123), output: -2 },
    { input: Decimal.from(0.01), output: -2 },
  ];
  for (const { input, output } of vectors) {
    assert(input.magnitude() === output, input.toString());
  }
});

Deno.test('toBigInt', () => {
  const vectors: ({ input: Decimal } & ({ success: true; output: bigint } | { success: false }))[] = [
    { input: Decimal.from(123), success: true, output: 123n },
    { input: Decimal.from(-123), success: true, output: -123n },
    { input: Decimal.from(1000), success: true, output: 1000n },
    { input: Decimal.from(0), success: true, output: 0n },
    { input: Decimal.from('123456789123456789'), success: true, output: 123456789123456789n },
    { input: Decimal.from('-123456789123456789'), success: true, output: -123456789123456789n },
    { input: Decimal.from('123e3'), success: true, output: 123000n },
    { input: Decimal.from('-123e3'), success: true, output: -123000n },
    { input: Decimal.from(1.23), success: false },
    { input: Decimal.from(-1.23), success: false },
  ];
  for (const vector of vectors) {
    const { input } = vector;
    if (vector.success) {
      assert(input.toBigInt() === vector.output);
    } else {
      assert(wrap(() => input.toBigInt()) instanceof Error);
    }
  }
});

Deno.test('gt', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(100), output: true },
    { a: Decimal.from(123), b: Decimal.from(123), output: false },
    { a: Decimal.from(100), b: Decimal.from(123), output: false },
    { a: Decimal.from(-100), b: Decimal.from(-123), output: true },
    { a: Decimal.from(-123), b: Decimal.from(-123), output: false },
    { a: Decimal.from(-123), b: Decimal.from(-100), output: false },
    { a: Decimal.from(0), b: Decimal.from(0), output: false },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.gt(b) === output);
  }
});

Deno.test('gte', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(100), output: true },
    { a: Decimal.from(123), b: Decimal.from(123), output: true },
    { a: Decimal.from(100), b: Decimal.from(123), output: false },
    { a: Decimal.from(-100), b: Decimal.from(-123), output: true },
    { a: Decimal.from(-123), b: Decimal.from(-123), output: true },
    { a: Decimal.from(-123), b: Decimal.from(-100), output: false },
    { a: Decimal.from(0), b: Decimal.from(0), output: true },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.gte(b) === output);
  }
});

Deno.test('lt', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(100), output: false },
    { a: Decimal.from(123), b: Decimal.from(123), output: false },
    { a: Decimal.from(100), b: Decimal.from(123), output: true },
    { a: Decimal.from(-100), b: Decimal.from(-123), output: false },
    { a: Decimal.from(-123), b: Decimal.from(-123), output: false },
    { a: Decimal.from(-123), b: Decimal.from(-100), output: true },
    { a: Decimal.from(0), b: Decimal.from(0), output: false },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.lt(b) === output);
  }
});

Deno.test('lte', () => {
  const vectors = [
    { a: Decimal.from(123), b: Decimal.from(100), output: false },
    { a: Decimal.from(123), b: Decimal.from(123), output: true },
    { a: Decimal.from(100), b: Decimal.from(123), output: true },
    { a: Decimal.from(-100), b: Decimal.from(-123), output: false },
    { a: Decimal.from(-123), b: Decimal.from(-123), output: true },
    { a: Decimal.from(-123), b: Decimal.from(-100), output: true },
    { a: Decimal.from(0), b: Decimal.from(0), output: true },
  ];
  for (const { a, b, output } of vectors) {
    assert(a.lte(b) === output);
  }
});

Deno.test('gt0', () => {
  const vectors = [
    { input: Decimal.from(123), output: true },
    { input: Decimal.from(0), output: false },
    { input: Decimal.from(-123), output: false },
  ];
  for (const { input, output } of vectors) {
    assert(input.gt0() === output);
  }
});

Deno.test('gte0', () => {
  const vectors = [
    { input: Decimal.from(123), output: true },
    { input: Decimal.from(0), output: true },
    { input: Decimal.from(-123), output: false },
  ];
  for (const { input, output } of vectors) {
    assert(input.gte0() === output);
  }
});

Deno.test('lt0', () => {
  const vectors = [
    { input: Decimal.from(123), output: false },
    { input: Decimal.from(0), output: false },
    { input: Decimal.from(-123), output: true },
  ];
  for (const { input, output } of vectors) {
    assert(input.lt0() === output);
  }
});

Deno.test('lte0', () => {
  const vectors = [
    { input: Decimal.from(123), output: false },
    { input: Decimal.from(0), output: true },
    { input: Decimal.from(-123), output: true },
  ];
  for (const { input, output } of vectors) {
    assert(input.lte0() === output);
  }
});
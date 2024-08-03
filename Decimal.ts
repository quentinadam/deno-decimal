import assert from '@quentinadam/assert';

function gcd(a: bigint, b: bigint) {
  while (b !== 0n) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export default class Decimal {
  readonly mantissa: bigint;
  readonly exponent: number;

  constructor(mantissa: bigint, exponent = 0) {
    assert(Number.isInteger(exponent), `Exponent must be an integer, got ${exponent}`);
    if (mantissa === 0n) {
      this.mantissa = 0n;
      this.exponent = 0;
    } else {
      while (mantissa % 10n === 0n) {
        mantissa /= 10n;
        exponent += 1;
      }
      this.mantissa = mantissa;
      this.exponent = exponent;
    }
  }

  abs(): Decimal {
    return this.gt0() ? this : this.neg();
  }

  #normalize(value1: Decimal, value2: Decimal) {
    const exponent = Math.min(value1.exponent, value2.exponent);
    return {
      mantissa1: value1.mantissa * 10n ** BigInt(value1.exponent - exponent),
      mantissa2: value2.mantissa * 10n ** BigInt(value2.exponent - exponent),
      exponent,
    };
  }

  add(value: Decimal | number | bigint | string): Decimal {
    value = Decimal.from(value);
    const { mantissa1, mantissa2, exponent } = this.#normalize(this, value);
    return new Decimal(mantissa1 + mantissa2, exponent);
  }

  ceil(): Decimal {
    if (this.exponent >= 0) {
      return this;
    }
    const result = this.mantissa / 10n ** BigInt(-this.exponent);
    return this.gte0() ? new Decimal(result + 1n) : new Decimal(result);
  }

  div(value: Decimal | number | bigint | string): Decimal {
    value = Decimal.from(value);
    const { numerator: numerator1, denominator: denominator1 } = this.toFraction();
    const { numerator: numerator2, denominator: denominator2 } = value.toFraction();
    return Decimal.fromFraction(numerator1 * denominator2, numerator2 * denominator1);
  }

  e(exponent: bigint | number): Decimal {
    return this.mul(new Decimal(10n).pow(exponent));
  }

  eq(value: Decimal | number | bigint | string): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = this.#normalize(this, value);
    return mantissa1 === mantissa2;
  }

  eq0(): boolean {
    return this.mantissa === 0n;
  }

  floor(): Decimal {
    if (this.exponent >= 0) {
      return this;
    }
    const result = this.mantissa / 10n ** BigInt(-this.exponent);
    return this.gte0() ? new Decimal(result) : new Decimal(result - 1n);
  }

  gt(value: Decimal | number | bigint | string): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = this.#normalize(this, value);
    return mantissa1 > mantissa2;
  }

  gt0(): boolean {
    return this.mantissa > 0n;
  }

  gte(value: Decimal | number | bigint | string): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = this.#normalize(this, value);
    return mantissa1 >= mantissa2;
  }

  gte0(): boolean {
    return this.mantissa >= 0n;
  }

  inv(): Decimal {
    return Decimal.one.div(this);
  }

  isInteger(): boolean {
    return this.exponent >= 0;
  }

  lt(value: Decimal | number | bigint | string): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = this.#normalize(this, value);
    return mantissa1 < mantissa2;
  }

  lt0(): boolean {
    return this.mantissa < 0n;
  }

  lte(value: Decimal | number | bigint | string): boolean {
    value = Decimal.from(value);
    const { mantissa1, mantissa2 } = this.#normalize(this, value);
    return mantissa1 <= mantissa2;
  }

  lte0(): boolean {
    return this.mantissa <= 0n;
  }

  magnitude(): number {
    if (this.lt0()) {
      return this.neg().magnitude();
    }
    let mantissa = 1n;
    let exponent = -1;
    while (this.mantissa >= mantissa) {
      mantissa *= 10n;
      exponent += 1;
    }
    return exponent + this.exponent;
  }

  mod(value: Decimal): Decimal {
    const { mantissa1, mantissa2, exponent } = this.#normalize(this, value);
    return new Decimal(mantissa1 % mantissa2, exponent);
  }

  mul(value: Decimal | number | bigint | string): Decimal {
    value = Decimal.from(value);
    return new Decimal(this.mantissa * value.mantissa, this.exponent + value.exponent);
  }

  neg(): Decimal {
    return new Decimal(-this.mantissa, this.exponent);
  }

  neq(value: Decimal | number | bigint | string): boolean {
    return !this.eq(value);
  }

  neq0(): boolean {
    return !this.eq0();
  }

  pow(value: bigint | number): Decimal {
    if (typeof value === 'number') {
      assert(Number.isInteger(value), `Exponent must be an integer, got ${value}`);
      value = BigInt(value);
    }
    if (value === 0n) {
      return Decimal.one;
    } else if (value === 1n) {
      return this;
    } else if (value < 0n) {
      return this.inv().pow(-value);
    } else {
      return new Decimal(this.mantissa ** value, this.exponent * 2);
    }
  }

  round(): Decimal {
    return this.add(new Decimal(5n, -1)).floor();
  }

  sign(): Decimal {
    if (this.gt0()) {
      return Decimal.one;
    }
    if (this.lt0()) {
      return Decimal.minusOne;
    }
    return Decimal.zero;
  }

  compare(other: Decimal | number | bigint | string): number {
    return this.sub(other).sign().toNumber();
  }

  sub(value: Decimal | number | bigint | string): Decimal {
    value = Decimal.from(value);
    const { mantissa1, mantissa2, exponent } = this.#normalize(this, value);
    return new Decimal(mantissa1 - mantissa2, exponent);
  }

  toBigInt(): bigint {
    assert(this.isInteger(), `Decimal ${this} is not an integer`);
    return this.mantissa * 10n ** BigInt(this.exponent);
  }

  toFixed(precision: number): string {
    assert(Number.isInteger(precision) && precision >= 0, `Precision must be a non-negative integer, got ${precision}`);
    if (this.lt0()) {
      return '-' + this.neg().toFixed(precision);
    }
    const value = this.e(precision).round().e(-precision);
    if (value.exponent >= 0) {
      const result = value.mantissa.toString() + '0'.repeat(value.exponent);
      return precision > 0 ? result + '.' + '0'.repeat(precision) : result;
    } else {
      const string = value.mantissa.toString().padStart(-value.exponent + 1, '0');
      return string.slice(0, value.exponent) + '.' + string.slice(value.exponent).padEnd(precision, '0');
    }
  }

  toFraction(): { numerator: bigint; denominator: bigint } {
    if (this.exponent >= 0) {
      return { numerator: this.mantissa * 10n ** BigInt(this.exponent), denominator: 1n };
    } else {
      const numerator = this.mantissa;
      const denominator = 10n ** BigInt(-this.exponent);
      const divisor = gcd(numerator, denominator);
      return { numerator: numerator / divisor, denominator: denominator / divisor };
    }
  }

  toJSON(): string {
    return this.toString();
  }

  toNumber(): number {
    return Number(this.toString());
  }

  toString(): string {
    if (this.lt0()) {
      return '-' + this.neg().toString();
    }
    if (this.exponent >= 0) {
      return this.mantissa.toString() + '0'.repeat(this.exponent);
    } else {
      const string = this.mantissa.toString().padStart(-this.exponent + 1, '0');
      return string.slice(0, this.exponent) + '.' + string.slice(this.exponent);
    }
  }

  [Symbol.for('Deno.customInspect')](): string {
    return this.toString();
  }

  static minusOne: Decimal = new Decimal(-1n);
  static one: Decimal = new Decimal(1n);
  static zero: Decimal = new Decimal(0n);

  static add(...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.add(current);
    }, Decimal.zero);
  }

  static div(base: Decimal | number | bigint | string, ...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.div(current);
    }, Decimal.from(base));
  }

  static from(value: string | number | bigint | Decimal): Decimal {
    if (typeof value === 'string') {
      return this.fromString(value);
    }
    if (typeof value === 'number') {
      return this.fromNumber(value);
    }
    if (typeof value === 'bigint') {
      return this.fromBigInt(value);
    }
    return value;
  }

  static fromFraction(numerator: bigint, denominator: bigint): Decimal {
    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }
    if (numerator < 0n) {
      return this.fromFraction(-numerator, denominator).neg();
    }
    const divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    let value = denominator;
    let factor = 1n;
    let exponent = 0;
    while (value > 1 && (value % 2n === 0n)) {
      value /= 2n;
      factor *= 5n;
      exponent -= 1;
    }
    while (value > 1 && (value % 5n === 0n)) {
      value /= 5n;
      factor *= 2n;
      exponent -= 1;
    }
    assert(value === 1n, `Fraction ${numerator}/${denominator} cannot be represented with a fixed number of decimals`);
    return new Decimal(numerator * factor, exponent);
  }

  static fromBigInt(value: bigint): Decimal {
    return new Decimal(value);
  }

  static fromNumber(value: number): Decimal {
    if (Number.isInteger(value)) {
      return new Decimal(BigInt(value));
    } else {
      return this.fromString(value.toString());
    }
  }

  static fromString(string: string): Decimal {
    if (/^(-?[0-9]+|0x[0-9a-f]+|0o[0-7]+|0b[01]+)$/i.test(string)) {
      return this.fromBigInt(BigInt(string));
    }
    const match = string.match(/^(-?\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i);
    assert(match !== null, `Could not parse Decimal from string ${string}`);
    let exponent = 0;
    if (match[3] !== undefined) {
      exponent = Number(match[3]);
    }
    const mantissa = (() => {
      if (match[2] !== undefined) {
        exponent -= match[2].length;
        return match[1] + match[2];
      } else {
        assert(match[1] !== undefined);
        return match[1];
      }
    })();
    return new Decimal(BigInt(mantissa), exponent);
  }

  static max(first: Decimal | number | bigint | string, ...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((max: Decimal, value) => {
      return max.lt(value) ? this.from(value) : max;
    }, this.from(first));
  }

  static min(first: Decimal | number | bigint | string, ...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((min: Decimal, value) => {
      return min.gt(value) ? this.from(value) : min;
    }, this.from(first));
  }

  static mul(...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.mul(current);
    }, Decimal.one);
  }

  static sub(base: Decimal, ...values: (Decimal | number | bigint | string)[]): Decimal {
    return values.reduce((previous: Decimal, current) => {
      return previous.sub(current);
    }, base);
  }

  static gcd(a: Decimal, b: Decimal): Decimal {
    while (b.neq0()) {
      const t = b;
      b = a.mod(b);
      a = t;
    }
    return a;
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import { calculate } from "../src/calculator.js";

test("calcula las cuatro operaciones elementales", () => {
  assert.equal(calculate(8, 3, "+"), 11);
  assert.equal(calculate(8, 3, "-"), 5);
  assert.equal(calculate(8, 3, "*"), 24);
  assert.equal(calculate(8, 2, "/"), 4);
});

test("rechaza operandos no finitos", () => {
  assert.throws(() => calculate(Number.NaN, 2, "+"), TypeError);
});

test("rechaza una operación desconocida", () => {
  assert.throws(() => calculate(2, 2, "%"), RangeError);
  assert.throws(() => calculate(2, 2, "toString"), RangeError);
});

test("rechaza la división entre cero", () => {
  assert.throws(() => calculate(2, 0, "/"), /dividir entre cero/);
});
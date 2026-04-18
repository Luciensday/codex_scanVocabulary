import test from "node:test";
import assert from "node:assert/strict";

import variants from "../src/data/animal-variants.json" with { type: "json" };

test("animal plan covers MVP scope", () => {
  assert.ok(variants.length >= 15 && variants.length <= 20);

  const animals = new Set(variants.map((variant) => variant.animal));
  assert.ok(animals.size >= 10);

  for (const requiredAnimal of ["Fox", "Dog", "Cat", "Elephant"]) {
    assert.ok(animals.has(requiredAnimal));
  }
});

test("animal variants have unique ids", () => {
  const ids = variants.map((variant) => variant.id);
  assert.equal(new Set(ids).size, ids.length);
});

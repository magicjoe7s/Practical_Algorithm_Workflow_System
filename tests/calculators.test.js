const test = require("node:test");
const assert = require("node:assert/strict");
const {
    calculateBsa,
    calculateFluidRate
} = require("../src/calculators.js");

test("calculates dog BSA with the established coefficient and formatting", () => {
    const result = calculateBsa({ species: "Dog", weight: 12.5 });

    assert.equal(result.bsa.toFixed(3), "0.544");
    assert.equal(result.equation, "BSA = 0.101 x (kg)^(2/3)");
    assert.equal(result.text, "Dog 12.50 kg | BSA = 0.544 m2");
});

test("calculates cat BSA with the established coefficient", () => {
    const result = calculateBsa({ species: "Cat", weight: 5 });

    assert.equal(result.bsa.toFixed(3), "0.292");
    assert.equal(result.equation, "BSA = 0.100 x (kg)^(2/3)");
});

test("rejects BSA weights outside the existing accepted range", () => {
    assert.throws(
        () => calculateBsa({ species: "Dog", weight: 0.09 }),
        /between 0.1 and 100/
    );
    assert.throws(
        () => calculateBsa({ species: "Dog", weight: 100.1 }),
        /between 0.1 and 100/
    );
});

test("calculates a healthy dog fluid rate using the established formula", () => {
    const result = calculateFluidRate({
        health: "Healthy",
        species: "Dog",
        weight: 10
    });

    assert.equal(result.text, "Rate: 31.3 ml/hr\n(75.2 ml/kg/day)");
});

test("calculates a sick dog fluid rate using the established formula", () => {
    const result = calculateFluidRate({
        health: "Sick",
        species: "Dog",
        weight: 10
    });

    assert.equal(result.text, "Rate: 18.3 ml/hr\n(43.8 ml/kg/day)");
});

test("calculates healthy and sick cat fluid-rate ranges", () => {
    assert.equal(
        calculateFluidRate({
            health: "Healthy",
            species: "Cat",
            weight: 5
        }).text,
        "Rate: 6.3 - 14.6 ml/hr\n(30.0 - 70.0 ml/kg/day)"
    );

    assert.equal(
        calculateFluidRate({
            health: "Sick",
            species: "Cat",
            weight: 5
        }).text,
        "Rate: 4.2 - 7.3 ml/hr\n(20.0 - 35.0 ml/kg/day)"
    );
});

test("rejects missing, zero, negative, and non-numeric weights", () => {
    for (const weight of [undefined, 0, -1, NaN, "5"]) {
        assert.throws(
            () => calculateFluidRate({
                health: "Healthy",
                species: "Dog",
                weight
            }),
            /greater than 0/
        );
    }
});

test("rejects unsupported species and health status", () => {
    assert.throws(
        () => calculateFluidRate({
            health: "Healthy",
            species: "Rabbit",
            weight: 2
        }),
        /Species/
    );
    assert.throws(
        () => calculateFluidRate({
            health: "Recovering",
            species: "Dog",
            weight: 2
        }),
        /Health status/
    );
});

const test = require("node:test");
const assert = require("node:assert/strict");
const {
    calculateBsa,
    calculateCaps,
    calculateFelineShockIndex,
    calculateFluidRate,
    calculateGlasgow,
    calculatePsyllium,
    calculatePhs,
    calculateSirs,
    calculateSnakeBite,
    calculateSofa
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

test("calculates Glasgow prognosis bands with established wording", () => {
    assert.deepEqual(
        calculateGlasgow({ motor: 6, brainstem: 6, consciousness: 6 }),
        {
            total: 18,
            prognosis: "GOOD",
            survival: "~90%",
            severity: "normal",
            text: "Glasgow Coma Scale: 18/18\nPrognosis: GOOD (~90%)"
        }
    );
    assert.equal(
        calculateGlasgow({ motor: 3, brainstem: 3, consciousness: 3 }).prognosis,
        "GUARDED"
    );
    assert.equal(
        calculateGlasgow({ motor: 1, brainstem: 1, consciousness: 1 }).prognosis,
        "POOR/GRAVE"
    );
});

test("rejects invalid Glasgow component scores", () => {
    assert.throws(
        () => calculateGlasgow({ motor: 0, brainstem: 6, consciousness: 6 }),
        /1 to 6/
    );
});

test("calculates feline shock index interpretation bands", () => {
    assert.equal(
        calculateFelineShockIndex({
            heartRate: 180,
            systolicBloodPressure: 120
        }).text,
        "Feline Shock Index: 1.50\nNormal (1.47±0.2) (HR:180, SBP:120)"
    );
    assert.equal(
        calculateFelineShockIndex({
            heartRate: 200,
            systolicBloodPressure: 100
        }).severity,
        "critical"
    );
});

test("rejects invalid feline shock index inputs", () => {
    assert.throws(
        () => calculateFelineShockIndex({
            heartRate: 180,
            systolicBloodPressure: 0
        }),
        /blood pressure/
    );
});

test("calculates SOFA totals and preserves summary formatting", () => {
    const result = calculateSofa({
        respiratory: 1,
        coagulation: 2,
        liver: 3,
        cardiovascular: 4,
        cns: 1,
        renal: 2
    });

    assert.equal(result.total, 13);
    assert.equal(
        result.text,
        "SOFA Score: 13/24\n(Resp:1, Coag:2, Liv:3, CV:4, CNS:1, Ren:2)"
    );
});

test("rejects invalid SOFA component scores", () => {
    assert.throws(
        () => calculateSofa({
            respiratory: 5,
            coagulation: 0,
            liver: 0,
            cardiovascular: 0,
            cns: 0,
            renal: 0
        }),
        /0 to 4/
    );
});

test("ports CAPS and sCAPS thresholds from AutoHotkey", () => {
    assert.equal(calculateCaps({mode:"CAPS",sirs:true,coagulationDisorder:true,creatinine:2,ionizedCalcium:4}).total,18);
    assert.equal(calculateCaps({mode:"sCAPS",coagulationDisorder:false,creatinine:1,ionizedCalcium:5,respiratoryRate:24}).total,3);
});
test("ports psyllium dog and cat schedules", () => {
    assert.match(calculatePsyllium({species:"Dog",weight:18}).text,/1–10 tablespoons/);
    assert.match(calculatePsyllium({species:"Cat",weight:4}).text,/2–3 teaspoons/);
});
test("ports pulmonary hypertension interpretation bands", () => {
    assert.equal(calculatePhs([0,0,0,0,0]).label,"Moderate-to-severe pre-capillary PH unlikely");
    assert.equal(calculatePhs([2,2,2,2,2]).total,10);
});
test("ports snakebite totals and high-domain caution", () => {
    const result=calculateSnakeBite([3,0,0,0,0,0]);
    assert.equal(result.label,"Mild");
    assert.equal(result.highDomain,true);
});
test("ports canine and feline SIRS thresholds", () => {
    assert.equal(calculateSirs({species:"Dog",temperature:103,heartRate:150,respiratoryRate:20,wbc:10000,bands:0}).meets,true);
    assert.equal(calculateSirs({species:"Cat",temperature:101,heartRate:180,respiratoryRate:20,wbc:10000,bands:0}).meets,false);
});

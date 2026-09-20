(function (root, factory) {
    const api = factory();

    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }

    root.PAWSCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    function requirePositiveWeight(weight) {
        if (!Number.isFinite(weight) || weight <= 0) {
            throw new RangeError("Weight must be a number greater than 0 kg.");
        }
    }

    function calculateFluidRate({ health, species, weight }) {
        requirePositiveWeight(weight);

        if (health !== "Healthy" && health !== "Sick") {
            throw new RangeError("Health status must be Healthy or Sick.");
        }

        if (species !== "Dog" && species !== "Cat") {
            throw new RangeError("Species must be Dog or Cat.");
        }

        if (species === "Dog") {
            const hourlyRate = health === "Healthy"
                ? (140 * Math.pow(weight, 0.73)) / 24
                : (97 * Math.pow(weight, 0.655)) / 24;
            const dailyRatePerKg = (hourlyRate * 24) / weight;

            return {
                species,
                health,
                weight,
                hourlyRate,
                dailyRatePerKg,
                text: `Rate: ${hourlyRate.toFixed(1)} ml/hr\n(${dailyRatePerKg.toFixed(1)} ml/kg/day)`
            };
        }

        const minimumHourlyRate = health === "Healthy"
            ? (30 * weight) / 24
            : (20 * weight) / 24;
        const maximumHourlyRate = health === "Healthy"
            ? (70 * weight) / 24
            : (35 * weight) / 24;
        const minimumDailyRatePerKg = (minimumHourlyRate * 24) / weight;
        const maximumDailyRatePerKg = (maximumHourlyRate * 24) / weight;

        return {
            species,
            health,
            weight,
            minimumHourlyRate,
            maximumHourlyRate,
            minimumDailyRatePerKg,
            maximumDailyRatePerKg,
            text: `Rate: ${minimumHourlyRate.toFixed(1)} - ${maximumHourlyRate.toFixed(1)} ml/hr\n(${minimumDailyRatePerKg.toFixed(1)} - ${maximumDailyRatePerKg.toFixed(1)} ml/kg/day)`
        };
    }

    function calculateBsa({ species, weight }) {
        requirePositiveWeight(weight);

        if (weight < 0.1 || weight > 100) {
            throw new RangeError("Weight must be between 0.1 and 100 kg.");
        }

        const coefficients = {
            Dog: 0.101,
            Cat: 0.100
        };
        const coefficient = coefficients[species];

        if (!coefficient) {
            throw new RangeError("Species must be Dog or Cat.");
        }

        const bsa = coefficient * Math.pow(weight, 2 / 3);
        const equation = species === "Dog"
            ? "BSA = 0.101 x (kg)^(2/3)"
            : "BSA = 0.100 x (kg)^(2/3)";

        return {
            species,
            weight,
            bsa,
            equation,
            text: `${species} ${weight.toFixed(2)} kg | BSA = ${bsa.toFixed(3)} m2`
        };
    }

    function calculateGlasgow({ motor, brainstem, consciousness }) {
        const scores = [motor, brainstem, consciousness];
        if (scores.some(score => !Number.isInteger(score) || score < 1 || score > 6)) {
            throw new RangeError("Each Glasgow component must be an integer from 1 to 6.");
        }

        const total = motor + brainstem + consciousness;
        const prognosis = total >= 15 ? "GOOD" : (total >= 9 ? "GUARDED" : "POOR/GRAVE");
        const survival = total >= 15 ? "~90%" : (total >= 9 ? "~50%" : "<25-50%");
        const severity = total >= 15 ? "normal" : (total >= 9 ? "warning" : "critical");

        return {
            total,
            prognosis,
            survival,
            severity,
            text: `Glasgow Coma Scale: ${total}/18\nPrognosis: ${prognosis} (${survival})`
        };
    }

    function calculateFelineShockIndex({ heartRate, systolicBloodPressure }) {
        if (!Number.isFinite(heartRate) || heartRate <= 0) {
            throw new RangeError("Heart rate must be a number greater than 0.");
        }
        if (!Number.isFinite(systolicBloodPressure) || systolicBloodPressure <= 0) {
            throw new RangeError("Systolic blood pressure must be a number greater than 0.");
        }

        const index = (heartRate / systolicBloodPressure).toFixed(2);
        const interpretation = index < 1.0
            ? "Low (Bradycardia?)"
            : (index <= 1.6 ? "Normal (1.47±0.2)" : "SHOCK LIKELY (>1.6)");
        const severity = index > 1.6 ? "critical" : "normal";

        return {
            index,
            interpretation,
            severity,
            text: `Feline Shock Index: ${index}\n${interpretation} (HR:${heartRate}, SBP:${systolicBloodPressure})`
        };
    }

    function calculateSofa({ respiratory, coagulation, liver, cardiovascular, cns, renal }) {
        const scores = [respiratory, coagulation, liver, cardiovascular, cns, renal];
        if (scores.some(score => !Number.isInteger(score) || score < 0 || score > 4)) {
            throw new RangeError("Each SOFA component must be an integer from 0 to 4.");
        }

        const total = scores.reduce((sum, score) => sum + score, 0);
        return {
            total,
            text: `SOFA Score: ${total}/24\n(Resp:${respiratory}, Coag:${coagulation}, Liv:${liver}, CV:${cardiovascular}, CNS:${cns}, Ren:${renal})`
        };
    }

    return Object.freeze({
        calculateBsa,
        calculateFelineShockIndex,
        calculateFluidRate,
        calculateGlasgow,
        calculateSofa
    });
});

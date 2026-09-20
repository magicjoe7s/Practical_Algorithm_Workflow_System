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
        const prognosis = total >= 15 ? "Good" : (total >= 9 ? "Guarded" : "Grave");
        const survival = total >= 15 ? ">95%" : (total >= 9 ? "50-95%" : "<50%");
        const severity = total >= 15 ? "normal" : (total >= 9 ? "warning" : "critical");
        const recommendation = total >= 15
            ? "Expected survival >95%. Continue monitoring neurological status every 4-6 hours. Most patients show improvement with supportive care."
            : total >= 9
            ? "Survival probability 50-95%. Intensive supportive care recommended. Monitor closely for deterioration. Consider advanced imaging (CT/MRI) and ICP monitoring if available."
            : "Survival probability <50%. Critical care required. Discuss prognosis with owner. Consider palliative care options. Frequent reassessment recommended.";

        return {
            total, prognosis, survival, severity, recommendation,
            text: `Glasgow Coma Scale: ${total}/18\nPrognosis: ${prognosis} (${survival})\n${recommendation}`
        };
    }

    function calculateShockIndex({ species, heartRate, systolicBloodPressure }) {
        if (!Number.isFinite(heartRate) || heartRate <= 0) throw new RangeError("Heart rate must be a number greater than 0.");
        if (!Number.isFinite(systolicBloodPressure) || systolicBloodPressure <= 0) throw new RangeError("Systolic blood pressure must be a number greater than 0.");
        if (species !== "Cat" && species !== "Dog") throw new RangeError("Species must be Dog or Cat.");
        const index=(heartRate/systolicBloodPressure).toFixed(2),cutoff=species==="Cat"?1.54:1.1;
        const interpretation=Number(index)>cutoff?`SHOCK LIKELY (>${cutoff})`:`Below shock cutoff (≤${cutoff})`;
        return {index,interpretation,severity:Number(index)>cutoff?"critical":"normal",text:`${species} Shock Index: ${index}\n${interpretation} (HR:${heartRate}, SBP:${systolicBloodPressure})`};
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

    function calculateCaps({ mode, sirs, coagulationDisorder, creatinine, ionizedCalcium, respiratoryRate }) {
        if (mode !== "CAPS" && mode !== "sCAPS") throw new RangeError("Mode must be CAPS or sCAPS.");
        if (!Number.isFinite(creatinine) || !Number.isFinite(ionizedCalcium)) throw new RangeError("Enter creatinine and ionized calcium.");
        let total = (coagulationDisorder ? 3 : 0) + (creatinine >= 1.6 ? 4 : 0) + (ionizedCalcium < 4.4 ? 3 : 0);
        if (mode === "CAPS") total += sirs ? 8 : 0;
        else {
            if (!Number.isFinite(respiratoryRate)) throw new RangeError("Enter respiratory rate.");
            total += respiratoryRate >= 24 ? 3 : 0;
        }
        const maxScore = mode === "CAPS" ? 18 : 13;
        const cutoff = mode === "CAPS" ? 11 : 6;
        const sensitivity = mode === "CAPS" ? "89%" : "96%";
        const specificity = mode === "CAPS" ? "90%" : "77%";
        const prognosis = total >= cutoff ? `Higher risk (Score ≥ ${cutoff})` : `Lower risk (Score < ${cutoff})`;
        return {total,maxScore,cutoff,prognosis,text:`**${mode} Score** ${total}/${maxScore} (${prognosis})`,sensitivity,specificity};
    }

    function calculatePsyllium({ species, weight }) {
        requirePositiveWeight(weight);
        const quarter=v=>Math.max(.25,Math.round(v*4)/4);
        const fmt=v=>{const w=Math.floor(v),q=Math.round((v-w)*4),f=["","¼","½","¾"][q];return w?(w+f):f};
        if(species==="Dog"){
            const min=quarter(weight*.5/9),max=quarter(weight*5/9),introMin=quarter(weight*.25/9),introMax=quarter(weight*2.5/9);
            return {text:`**Psyllium:**\n- **Days 1–2:** Give ${fmt(introMin)}–${fmt(introMax)} tablespoons by mouth per day, divided evenly among meals.\n- **Starting day 3:** Give ${fmt(min)}–${fmt(max)} tablespoons by mouth per day, divided evenly among meals.`};
        }
        if(species!=="Cat") throw new RangeError("Species must be Dog or Cat.");
        const doses=weight<3?["¼–½ teaspoon","1 teaspoon"]:weight<=6?["½–1½ teaspoons","2–3 teaspoons"]:["1–2 teaspoons","4 teaspoons"];
        return {text:`**Psyllium:**\n- **Days 1–2:** Give ${doses[0]} by mouth before each meal.\n- **Starting day 3:** Give ${doses[1]} by mouth before each meal.`};
    }

    function calculatePhs(scores) {
        if(!Array.isArray(scores)||scores.length!==5) throw new RangeError("Five parameter scores are required.");
        if(scores.some((v,i)=>!Number.isInteger(v)||v<0||v>2||(i===2&&v===1))) throw new RangeError("Invalid PHS score.");
        const total=scores.reduce((a,b)=>a+b,0);
        const label=total<=2?"Moderate-to-severe pre-capillary PH unlikely":total<=4?"Indeterminate (gray zone)":"Moderate-to-severe pre-capillary PH strongly supported";
        return {total,label,text:`Pulmonary Hypertension Score (PHS; Lyssens 2022): ${total}/10 - ${label}`};
    }

    function calculateSnakeBite(scores) {
        if(!Array.isArray(scores)||scores.length!==6||scores.some(v=>!Number.isInteger(v)||v<0||v>4)) throw new RangeError("Six scores from 0 to 4 are required.");
        const total=scores.reduce((a,b)=>a+b,0), highDomain=scores.some(v=>v>=3);
        const bands=[[0,"No evident envenomation"],[3,"Mild"],[7,"Moderate"],[11,"Severe"],[24,"Very severe / critical"]];
        const label=bands.find(([max])=>total<=max)[1];
        return {total,label,highDomain,text:`Snake Bite Severity Score (SSS): ${total}/24 - ${label}`};
    }

    function calculateSirs({species,temperature,heartRate,respiratoryRate,wbc,bands}) {
        const c=species==="Dog"?{n:2,tL:99,tH:102.6,hL:null,hH:140,rH:30,wL:6000,wH:19000,bH:3}:species==="Cat"?{n:3,tL:100,tH:103.5,hL:140,hH:225,rH:40,wL:5000,wH:19500,bH:5}:null;
        if(!c||[temperature,heartRate,respiratoryRate,wbc,bands].some(v=>!Number.isFinite(v))) throw new RangeError("Complete all SIRS numeric fields.");
        const flags=[temperature<c.tL||temperature>c.tH,(c.hL!==null&&heartRate<c.hL)||heartRate>c.hH,respiratoryRate>c.rH,wbc<c.wL||wbc>c.wH||bands>c.bH];
        const total=flags.filter(Boolean).length, meets=total>=c.n;
        return {total,required:c.n,meets,text:`${species} SIRS: ${total}/4 criteria (${meets?"meets":"does not meet"} ${c.n}/4 threshold)`};
    }

    function evaluateCompass({ grades, temperature, unit = "C" }) {
        if (!Array.isArray(grades) || grades.length !== 6 || grades.some(v => !Number.isInteger(v) || v < 0 || v > 3)) throw new RangeError("Complete all six COMPASS domains.");
        const highest = Math.max(...grades);
        let known = temperature !== null && temperature !== undefined && temperature !== "";
        let critical = false;
        if (known) {
            if (!Number.isFinite(temperature) || !["C","F"].includes(unit)) throw new RangeError("Enter a valid temperature and unit.");
            const c = unit === "C" ? temperature : (temperature - 32) * 5 / 9;
            if (c <= 0 || c >= 60) throw new RangeError("Temperature is outside the supported range.");
            critical = temperature >= (unit === "C" ? 41 : 105.8);
        }
        const labels = ["Ungraded - no listed clinical signs","Mild - Heat stress","Moderate - Heat exhaustion","Severe - Heatstroke"];
        let label = labels[highest];
        if (highest >= 2) label += " | " + (!known ? "temperature modifier unknown" : critical ? "critical temperature subgroup" : "triage temperature below critical threshold");
        let management = highest === 1 ? "On-site active cooling, oral rehydration, rest; monitor for progression." : highest === 2 ? "Rapid cooling, IV fluid therapy and monitoring; hospitalise if the critical temperature criterion is met or the patient is not improving." : highest === 3 ? "Mandatory hospitalisation, aggressive cooling, IV fluids, full multi-organ support and monitoring (coagulation, renal, hepatic and CNS)." : "No grade can be assigned from the selected signs. Temperature alone does not diagnose HRI.";
        if (highest === 2 && known && critical) management = "Moderate signs with critical temperature: escalate rapid effective cooling, IV fluids and diagnostics; hospitalise per the supplied management chart.";
        if (highest === 3 && known && critical) management = "Highest-risk subgroup. " + management;
        return { grade: highest, label, management, text: `VetCompass HRI Grade (2026): ${label}\nInterpretation: ${management}` };
    }

    function evaluateLepto({ illness, clinicopathCount, supportive = [], confirmatory = [], recentVaccine = false }) {
        if (!Number.isInteger(clinicopathCount) || clinicopathCount < 0) throw new RangeError("Invalid clinicopathologic count.");
        const clinicalMet = illness && clinicopathCount >= 2;
        let classification, basis;
        if (clinicalMet && confirmatory.length) { classification="Confirmed"; basis=`compatible systemic illness within 2 weeks, ${clinicopathCount} clinicopathologic abnormalities, and ${confirmatory.join(", ")}`; }
        else if (clinicalMet && supportive.length) { classification="Probable"; basis=`compatible systemic illness within 2 weeks, ${clinicopathCount} clinicopathologic abnormalities, and ${supportive.join(", ")}`; }
        else if (clinicalMet) { classification="Clinical criteria met; not yet Probable or Confirmed"; basis=`compatible systemic illness within 2 weeks and ${clinicopathCount} clinicopathologic abnormalities, but no supportive or confirmatory laboratory criterion selected`; }
        else { classification="Clinical criteria not met"; const m=[]; if(!illness)m.push("compatible systemic illness within the past 2 weeks is not selected"); if(clinicopathCount<2)m.push(`${clinicopathCount}/2 required clinicopathologic abnormalities selected`); basis=m.join("; "); }
        let text=`ACVIM leptospirosis case definition: ${classification} - ${basis}.`;
        if(recentVaccine && supportive.some(x=>/MAT|IgM/i.test(x))) text+=" Caution: recent vaccination can affect IgM or single-MAT interpretation.";
        if(recentVaccine && [...supportive,...confirmatory].some(x=>/PCR|NAAT/i.test(x))) text+=" Vaccination does not explain a positive PCR/NAAT result.";
        return {classification,text};
    }

    function evaluateDuke({ pathology = false, majorCount, minorCount, rejections = [] }) {
        if (![majorCount,minorCount].every(Number.isInteger)) throw new RangeError("Invalid Duke criteria counts.");
        let classification="Rejected",basis="criteria threshold not met";
        if(rejections.length) basis="explicit rejection criteria selected: "+rejections.join("; ");
        else if(pathology){classification="Definite";basis="valvular pathology";}
        else if(majorCount>=2){classification="Definite";basis=`${majorCount} major criteria`;}
        else if(majorCount>=1&&minorCount>=2){classification="Definite";basis=`1 major and ${minorCount} minor criteria`;}
        else if(majorCount>=1&&minorCount>=1){classification="Possible";basis="1 major and 1 minor criterion";}
        else if(minorCount>=3){classification="Possible";basis=`${minorCount} minor criteria`;}
        return {classification,basis,text:`Modified Duke classification: ${classification} - ${basis}.`};
    }

    return Object.freeze({
        calculateBsa,
        calculateCaps,
        calculateFelineShockIndex,
        calculateFluidRate,
        calculateGlasgow,
        calculatePsyllium,
        calculatePhs,
        calculateSirs,
        calculateShockIndex,
        calculateSnakeBite,
        calculateSofa,
        evaluateCompass,
        evaluateDuke,
        evaluateLepto
    });
});

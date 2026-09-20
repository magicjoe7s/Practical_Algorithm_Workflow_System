const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

for (const file of ["index.html", "additional_calculators.html", "veterinary_calculators.html"]) {
    test(`${file} inline JavaScript parses`, () => {
        const html = fs.readFileSync(file, "utf8");
        const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
        for (const [, source] of scripts) {
            assert.doesNotThrow(() => new Function(source));
        }
    });
}

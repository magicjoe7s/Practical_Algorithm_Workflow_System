const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const applicationSources = [
    "index.html",
    "additional_calculators.html",
    "src/calculators.js",
    "src/sepsis.js"
].map(file => ({
    file,
    content: fs.readFileSync(path.join(repositoryRoot, file), "utf8")
}));

const prohibitedPrimitives = [
    { name: "fetch", pattern: /\bfetch\s*\(/ },
    { name: "XMLHttpRequest", pattern: /\bXMLHttpRequest\b/ },
    { name: "WebSocket", pattern: /\bWebSocket\b/ },
    { name: "EventSource", pattern: /\bEventSource\b/ },
    { name: "localStorage", pattern: /\blocalStorage\b/ },
    { name: "sessionStorage", pattern: /\bsessionStorage\b/ },
    { name: "cookies", pattern: /document\.cookie/ }
];

test("application sources contain no network or persistent-storage primitives", () => {
    for (const { file, content } of applicationSources) {
        for (const primitive of prohibitedPrimitives) {
            assert.doesNotMatch(
                content,
                primitive.pattern,
                `${file} unexpectedly uses ${primitive.name}`
            );
        }
    }
});

test("the application has no submitting forms", () => {
    const html = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");
    assert.doesNotMatch(html, /<form\b/i);
    assert.doesNotMatch(html, /\baction\s*=/i);
});

test("the local-only privacy notice remains visible", () => {
    const html = fs.readFileSync(path.join(repositoryRoot, "index.html"), "utf8");
    assert.match(html, /Local-only by design\./);
    assert.match(html, /does not upload, save, or share entered information/);
});

# PAWS — Practical Algorithm & Workflow System

PAWS is a browser-based collection of veterinary clinical calculators, documentation builders, treatment references, and patient-care checklists.

## Current application

The application is implemented as a self-contained HTML document:

- `index.html` is the current entry point.
- `veterinary_calculators.html` is a compatibility redirect to the canonical entry point.
- Most CSS and workflow JavaScript remain embedded in `index.html`; BSA, Fluid Rate, Glasgow, Feline Shock Index, and SOFA calculations now use tested functions in `src/calculators.js`.
- Calculations run locally in the browser.
- There is no backend, account system, database, network API, or persistent browser storage.
- Generated text is only transferred outside the page when a user explicitly copies it to the clipboard.

The current `index.html` exposes these workflow areas:

- Intake and documentation: informed consent, hospitalization plans, and outpatient medication instructions
- Nutrition and fluid support
- Sedation and blood-draw guidance
- Clinical scoring and calculations: BSA, EDD, APPLE, Glasgow, SOFA, ROX, feline shock index, FENa/FECl, ATT, and DOGiBAT
- Treatment contingencies and Rule of 20 monitoring

## Run locally

No build step is required. Open `index.html` in a modern browser.

For consistent browser behavior, especially clipboard permissions, serve the repository from a local HTTP server rather than opening it from a `file://` URL.

## Privacy and access

PAWS currently has no application-level authentication. Anyone who can reach a hosted copy can use it.

User-entered values are read from page controls and retained only in the active browser page's DOM and JavaScript memory. The application does not use cookies, `localStorage`, `sessionStorage`, or HTTP API requests. Reloading the page clears its working state. Copying a result places that text on the operating-system clipboard.

If PAWS later stores patient information or integrates with clinical systems, authentication, authorization, encrypted transport, retention rules, audit logging, and minimum-necessary-data handling must be designed before those features are enabled.

## Clinical safety

PAWS is decision-support software, not a substitute for clinical judgment. Before production use, every formula, threshold, dose, unit, and generated instruction should have:

1. An identified clinical owner.
2. A versioned source or reference.
3. Boundary and regression tests.
4. A visible last-reviewed date.
5. A documented review and release process.

Changes to clinical logic should be isolated from visual refactoring and reviewed by an appropriately qualified clinician.

## Development direction

The proposed improvement sequence is documented in [`docs/IMPROVEMENT_PLAN.md`](docs/IMPROVEMENT_PLAN.md). PAWS will remain private-by-design and local-only: no case sharing, account system, backend, analytics, or patient-data persistence is planned. Current priorities are:

1. Expand automated tests while preserving established outputs.
2. Continue splitting the monolithic page into maintainable modules.
3. Improve validation, accessibility, navigation, and responsive behavior.
4. Keep all exports and clipboard actions explicit and user-initiated.

## Tests

The test suite uses Node.js' built-in test runner and has no third-party runtime dependencies:

```sh
npm test
```

Tests run automatically for pull requests and changes to `main`. Privacy regression tests also prevent accidental addition of browser persistence, form submission, or application network primitives to the runtime sources.

## Contribution approach

Use short-lived branches and pull requests. A pull request that changes a clinical calculation should include:

- The clinical reference and version used
- Examples covering normal, boundary, and invalid inputs
- Unit and rounding expectations
- Reviewer confirmation
- User-facing release notes when output changes

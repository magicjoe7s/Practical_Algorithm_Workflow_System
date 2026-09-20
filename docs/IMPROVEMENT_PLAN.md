# PAWS improvement plan

## Purpose

This plan proposes an incremental path that improves clinical safety, maintainability, usability, privacy, and delivery without silently changing established outputs. PAWS will remain a local-only calculation and workflow tool for colleagues; case sharing, accounts, backend persistence, analytics, and patient-data synchronization are out of scope.

## Baseline assessment

### Strengths

- Zero-install, self-contained deployment
- Fast local calculations with no server dependency
- No automatic transmission or persistence of entered clinical information
- Broad collection of related tools in one interface
- Consistent card, calculator, result, reset, and copy interaction patterns
- Useful generated documentation alongside numeric calculators

### Current risks and constraints

1. **Clinical logic has no executable safety net.** There are no automated tests for formulas, dose units, thresholds, rounding, generated instructions, or boundary values.
2. **Clinical provenance is not visible.** Formulas and recommendations are not consistently tied to a named source, version, reviewer, or review date.
3. **Two large application files have drifted.** `index.html` is approximately 4,660 lines and includes the DOGiBAT workflow; `veterinary_calculators.html` is approximately 4,366 lines and does not. Maintaining both by hand invites inconsistent fixes.
4. **Presentation, content, and behavior are coupled.** CSS, markup, clinical constants, and JavaScript live in the same file, making focused review difficult.
5. **There is no documented release process.** Version and last-updated values are manually embedded in application code.
6. **Input validation is decentralized.** Each calculator handles missing, invalid, and physiologically implausible input differently.
7. **Accessibility is incomplete.** Inline click handlers and card-like `div` controls make keyboard navigation and semantics harder to guarantee; error and result announcements need a consistent live-region pattern.
8. **Privacy is implicit rather than specified.** The local-only design is privacy-friendly, but the UI does not clearly explain what is retained, transmitted, or copied.
9. **There is no automated quality gate.** The repository has no linting, formatting, tests, or continuous integration checks.
10. **A static public deployment provides no access control.** If restricted access becomes a requirement, it must be provided by a trusted hosting/authentication layer rather than client-side hiding.

## Recommended target structure

A lightweight static architecture can preserve the current deployment model:

```text
/
├── index.html
├── src/
│   ├── app.js
│   ├── navigation.js
│   ├── validation.js
│   ├── clipboard.js
│   ├── calculators/
│   │   ├── nutrition-support.js
│   │   ├── fluids.js
│   │   └── ...
│   └── content/
│       ├── medications.js
│       ├── consent.js
│       └── references.js
├── styles/
│   ├── tokens.css
│   ├── components.css
│   └── print.css
├── tests/
│   ├── calculators/
│   └── browser/
├── docs/
│   ├── IMPROVEMENT_PLAN.md
│   ├── CLINICAL_REFERENCES.md
│   └── RELEASE_CHECKLIST.md
└── README.md
```

This does not require a backend. A small bundler is optional; native ES modules are sufficient if the supported hosting environment serves JavaScript with correct MIME types.

## Prioritized roadmap

### Phase 0 — establish safety and ownership

- Keep `index.html` as the only canonical application entry point.
- Keep `veterinary_calculators.html` as a compatibility redirect so existing bookmarks continue to work.
- Expand golden test cases for established calculations without changing their outputs.
- Define supported browsers, intended users, deployment environment, and whether patient-identifying data is permitted.
- Add a visible disclaimer, privacy statement, version, and clinical review date.

**Exit criteria:** high-risk formulas have independent expected-result fixtures and the application has only one implementation source.

### Phase 1 — test before restructuring

- Extract pure calculation functions without changing output.
- Add unit tests for:
  - normal cases
  - zero, negative, missing, and non-numeric inputs
  - minimum and maximum plausible values
  - unit conversion and rounding boundaries
  - threshold transitions
  - species- or mode-specific branches
- Snapshot-test generated documentation text where exact wording matters.
- Add browser smoke tests covering navigation, calculate, reset, and copy behavior.
- Add continuous integration that runs tests and static checks on every pull request.

**Exit criteria:** existing behavior is reproducible and protected before the large-file split.

### Phase 2 — consolidate and modularize

- Remove manual duplication between the two HTML files.
- Move design tokens and component styles into CSS files.
- Move common navigation, validation, rendering, and clipboard behavior into shared modules.
- Put clinical constants and narrative content in reviewable structured data.
- Give each calculator a small public interface such as `init`, `calculate`, `reset`, and `formatResult`.
- Generate version metadata from releases or a single source of truth.

**Exit criteria:** each behavior has one implementation; a clinical reviewer can inspect logic/content without reading unrelated UI code.

### Phase 3 — improve form and accessibility

- Replace clickable `div` cards with semantic links or buttons.
- Associate every control with a visible `label`, description, unit, and validation message.
- Provide clear required/optional indicators and acceptable ranges.
- Use `aria-live` for validation and calculated results.
- Preserve focus when changing tools and return focus predictably after reset.
- Support full keyboard operation and visible focus states.
- Add a tool search/filter and category navigation.
- Provide print-friendly output and consistent copy/download actions.
- Verify small-screen layouts and touch target sizes.
- Respect reduced-motion and high-contrast preferences.

**Exit criteria:** keyboard-only workflows succeed; automated accessibility checks pass; representative mobile layouts remain usable.

### Phase 4 — strengthen clinical interaction design

- Display formulas, units, references, assumptions, and review dates next to results.
- Warn on physiologically implausible values without silently clamping them.
- Show intermediate values when they help users verify a result.
- Distinguish informational guidance from calculations and medication/dosing guidance.
- Add deliberate confirmation for high-risk outputs.
- Standardize terminology, precision, significant figures, and unit formatting.
- Add provenance to copied text so the PAWS version and calculation time can be identified when appropriate.
- Have clinical users test common workflows and error-recovery paths.

**Exit criteria:** users can understand where an answer came from and recognize invalid or high-risk input.

### Phase 5 — preserve the local-only privacy model

- Keep calculations and working state in browser memory.
- Do not add accounts, case sharing, analytics, patient-data storage, or automatic network requests.
- Keep the on-screen statement explaining that entered information is not transmitted or retained.
- Keep exports and clipboard actions user-initiated.
- Do not encode patient values in URLs.
- If audience restriction is ever required, use institutional controls at the hosting layer without adding case storage to PAWS.
- Review every new dependency or integration for unexpected network behavior.

**Exit criteria:** automated checks and manual review confirm that normal PAWS workflows make no application data requests and persist no patient information.

### Phase 6 — delivery and governance

- Use semantic versions and tagged releases.
- Maintain a changelog separating clinical-output changes from UI changes.
- Require automated checks and clinical review for protected areas.
- Add dependency and security scanning if a package toolchain is introduced.
- Publish a release checklist with rollback instructions.
- Document who can approve clinical, technical, and privacy changes.

## Form recommendations

High-value visual and interaction improvements:

1. Add persistent category navigation and search on the home screen.
2. Show units inside or adjacent to inputs, never only in placeholders.
3. Standardize field spacing, help text, error states, and result cards.
4. Use consistent primary, secondary, reset, and destructive button styles.
5. Make warnings visually distinct without relying on color alone.
6. Add compact/comfortable density options if clinicians use the tool on both workstations and tablets.
7. Introduce a focused print layout for records and handoffs.
8. Add a visible “calculated locally” privacy indicator.
9. Show application version and clinical review status in an accessible About panel.
10. Use progressive disclosure so uncommon parameters do not overwhelm routine workflows.

## Function recommendations

High-value behavioral improvements:

1. Central validation with reusable numeric, range, unit, and required-field rules.
2. Pure, separately tested calculation functions.
3. Formula/source/review metadata for every clinical output.
4. Reproducible calculation summaries including inputs and units.
5. Searchable tools and keyboard shortcuts for frequent workflows.
6. Optional user-initiated export to plain text or printable report.
7. Deep links to a tool without encoding patient values in the URL.
8. A safe feature-flag approach for newly reviewed calculators.
9. Telemetry only if explicitly approved, de-identified, disclosed, and genuinely needed.
10. Authenticated persistence only after a formal data/security design.

## Suggested implementation order for the next pull requests

1. Expand the existing test harness to additional calculators
2. Continue calculator-by-calculator extraction with no-output-change tests
3. Add shared validation and rendering utilities
4. Complete the accessibility and navigation pass
5. Improve responsive and print layouts
6. Add privacy regression checks that prohibit storage and network calls
7. Add optional local-only features chosen from colleague feedback

## Non-goals for this baseline pull request

- No clinical formula, dose, threshold, or wording is changed.
- No framework or build system is imposed.
- No patient-data storage, analytics, network request, or authentication mechanism is added.
- No duplicate file is removed until its deployment role is confirmed.

# Test Plan — Onboarding

## Scope
First-run welcome screen rendered before sign-in. Verifies visual fidelity to the
design (`docs/ui-design.pen`, frame `Screens / Onboarding`), the OIDC PKCE
sign-in handoff (L2-013), and that no authenticated session is silently
established before the user explicitly opts in.

## References
- Design: `docs/ui-design.pen` -> `Screens / Onboarding` (Mobile/360, Tablet/768, Desktop/1440)
- Requirements: L2-013 (Registration via PKCE), L2-019 (Frontend load perf), L2-020 (Responsive), L2-021 (Accessibility)
- Tasks: `docs/frontend-tasks/06-oidc-sign-in-flow.md`, `07-oidc-callback-and-token-attach.md`
- Tokens: `Design Tokens` frame in the .pen file

## Preconditions
- App served from the configured base URL.
- Browser local storage and session storage are empty.
- No valid auth cookie / token is present.
- OIDC provider is reachable.

## TC-V — Visual: Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Headline ("Make health a game") font family | `Inter`, weight 500 |
| TC-V-002 | Headline size — mobile | 28 px |
| TC-V-003 | Headline size — tablet | 45 px |
| TC-V-004 | Headline size — desktop | 57 px, line-height 1.1 |
| TC-V-005 | Body description font weight | 400 (normal) |
| TC-V-006 | Body description size — mobile/tablet/desktop | 16 / 18 / 18 px |
| TC-V-007 | Body description line-height | 1.5 |
| TC-V-008 | Primary button label ("Get started") | Inter 14/16 px, weight 500, white |
| TC-V-009 | Secondary button label ("I have an account") | Inter 14/16 px, weight 500, on-surface color |
| TC-V-010 | Brand wordmark ("HealthQuest") visible at desktop only | font 22 px, weight 500 |

## TC-C — Visual: Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Page background | `#F7FBF3` (md-sys-color-surface) |
| TC-C-002 | Hero panel background | `#94F7B4` (primary container) |
| TC-C-003 | Trophy icon color on hero | `#00210F` (on primary container) |
| TC-C-004 | Headline text color | `#191D17` (on surface) |
| TC-C-005 | Primary button background | `#006D3F` (primary) |
| TC-C-006 | Primary button label color | `#FFFFFF` |
| TC-C-007 | Secondary button border | `#C2C9BE` (outline-variant), 1 px |
| TC-C-008 | Active page-dot color | `#006D3F` |
| TC-C-009 | Inactive page-dot color | `#F1F5ED` (surface-container-low) |
| TC-C-010 | Text/background contrast meets WCAG AA | >= 4.5:1 normal text, >= 3:1 large text |

## TC-L — Visual: Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Mobile body padding | 24 px on all sides |
| TC-L-002 | Mobile vertical gap between hero, title, dots, buttons | 24 px |
| TC-L-003 | Tablet body padding | 40 px top/bottom, 80 px left/right |
| TC-L-004 | Tablet content vertical gap | 32 px |
| TC-L-005 | Hero corner radius — mobile/tablet | 28 / 36 px |
| TC-L-006 | Trophy icon size — mobile/tablet/desktop | 120 / 180 / 280 px |
| TC-L-007 | Buttons stacked vertically with 12 px gap on mobile | confirmed via DOM bounding boxes |
| TC-L-008 | Buttons inline with 16 px gap on tablet/desktop | confirmed |
| TC-L-009 | Pill button corner radius | 9999 (full) |
| TC-L-010 | Desktop split — left column ~50% width, right hero ~50% | left contains copy + actions, right contains trophy hero |

## TC-R — Responsive design
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | Viewport 360x780 | Single-column mobile layout, no horizontal scrollbar |
| TC-R-002 | Viewport 375x812 | Same layout as 360 (mobile) |
| TC-R-003 | Viewport 768x1024 | Tablet layout — buttons inline, larger hero |
| TC-R-004 | Viewport 1024x768 | Tablet layout still applies (rail variant for app shell when signed in) |
| TC-R-005 | Viewport 1440x900 | Desktop layout — split hero with brand wordmark visible |
| TC-R-006 | Viewport >= 1920 wide | Content max-width respected (no edge-to-edge stretching) |
| TC-R-007 | Window resize during render | Layout recomputes without flicker |
| TC-R-008 | Page-dot indicator visible at all breakpoints | yes |

## TC-F — Functional
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | Click "Get started" | Browser navigates to OIDC `/authorize` URL (PKCE flow) |
| TC-F-002 | Click "I have an account" | Same OIDC `/authorize` URL with `prompt=login` (or equivalent) |
| TC-F-003 | OIDC state and code_verifier generated | Random per click; state echoed back in callback |
| TC-F-004 | Code verifier stored in `sessionStorage` only | Not in localStorage; cleared after exchange |
| TC-F-005 | After OIDC callback success | App routes to `/home` |
| TC-F-006 | OIDC callback with mismatched `state` | Reject; route to `/onboarding` with toast (L2-013 §3) |
| TC-F-007 | Page loads with no auth tokens leaked to console / network logs | Confirmed via DevTools |
| TC-F-008 | Direct visit to `/onboarding` while authenticated | Redirect to `/home` |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Tab order: Get started -> I have an account -> page-dot? -> Get started | Logical, single-row, no skipped controls |
| TC-B-002 | Visible focus ring on every interactive element | Yes, color contrast >= 3:1 |
| TC-B-003 | Enter on focused button activates it | Yes |
| TC-B-004 | Space on focused button activates it | Yes |
| TC-B-005 | Hover on primary button | Slight elevation / state-layer overlay; cursor pointer |
| TC-B-006 | Click during in-flight redirect (double click "Get started") | Only one OIDC redirect emitted |
| TC-B-007 | Reduced-motion preference honored | No animated dot transitions |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | `<main>` landmark wraps content | Yes |
| TC-A-002 | Headline rendered as `<h1>` | Yes |
| TC-A-003 | Trophy icon has accessible name or `aria-hidden="true"` | Decorative — `aria-hidden` |
| TC-A-004 | Buttons have descriptive accessible names ("Get started", "I have an account") | Yes |
| TC-A-005 | Page-dot indicator exposes `aria-current="step"` on the active dot | Yes |
| TC-A-006 | axe-core scan returns 0 critical / serious violations | Yes |

## TC-D — Data persistence
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | OIDC `code_verifier` written to `sessionStorage` on click | Present until callback exchange |
| TC-D-002 | OIDC `code_verifier` cleared after successful token exchange | Removed from sessionStorage |
| TC-D-003 | No persistent identifiers (PII, tokens) written to localStorage | Confirmed |
| TC-D-004 | Reload before completing OIDC redirect | Code verifier preserved; flow resumable |
| TC-D-005 | After successful sign-in, refresh token (if used) stored only as httpOnly cookie | Confirmed via DevTools |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Cold load LCP on simulated 4G (Lighthouse) | <= 2.5 s (L2-019 §1) |
| TC-P-002 | Initial JS payload split — onboarding chunk does not pull in dashboard code | Confirmed via bundle analyzer |
| TC-P-003 | TBT under interaction | <= 200 ms |

## Exit criteria
All TC-V/C/L/R/F/B/A/D/P cases pass. No console errors, no network 4xx/5xx
on page load, axe-core clean.

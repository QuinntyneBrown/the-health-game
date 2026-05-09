# Test Plan — Home Dashboard

## Scope
The post-sign-in landing screen showing greeting, today's progress, streak
chips, and quick links to the user's most active goals and recent rewards.
Verifies visual fidelity to `Screens / Home Dashboard`, summary data
correctness, and that data shown is restricted to the signed-in user.

## References
- Design: `docs/ui-design.pen` -> `Screens / Home Dashboard` (Mobile/360, Tablet/768, Desktop/1440)
- Requirements: L2-002 (View Goals — ownership scoping), L2-008 (Display streaks), L2-010 (Earn/surface rewards), L2-018 (API perf), L2-020 (Responsive), L2-021 (A11y), L2-027 (RBAC UI gating)
- Tasks: `docs/frontend-tasks/27-dashboard-from-real-api.md`, `docs/frontend-tasks/28-rbac-ui-gating.md`

## Preconditions
- User is authenticated (valid OIDC session).
- Test user has at least 1 goal with logged activity in the current cadence period and at least 1 earned reward (seed via API or fixture).
- Navigation shell (bottom/rail/drawer) is present per viewport (Tasks 01–03).

## TC-V — Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Greeting ("Good morning, {name}") | Inter 32/28/22 (desktop/tablet/mobile), weight 500 |
| TC-V-002 | Section labels ("Today", "Recent rewards", "Live a goal") | Inter 18 px, weight 500 |
| TC-V-003 | Stat numbers (e.g., "12", "3 / 6", "Lvl 8", "87%") | Inter 28–32 px, weight 600 or 500 |
| TC-V-004 | Goal/reward card titles | Inter 14 px, weight 500 |
| TC-V-005 | Card subtitles / metadata | Inter 12–13 px, weight 400 |
| TC-V-006 | Streak label "Trophy" / streak count | Inter 13 px, weight 500–600 |
| TC-V-007 | Bar-chart axis text | Inter 11 px, weight 400 |

## TC-C — Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Page background | `#F1F5ED` (surface-container-low) |
| TC-C-002 | Bar-chart bars | `#006D3F` (primary) |
| TC-C-003 | Streak card background | `#FFDCC4` (streak-container) |
| TC-C-004 | Streak icon/text | `#E76A0C` (streak) |
| TC-C-005 | Reward card background | `#FFD7EE` (reward-container) |
| TC-C-006 | Reward accent | `#9B2680` (reward) |
| TC-C-007 | Success/level cards | `#94F7B4` background, `#00210F` text |
| TC-C-008 | "Add" / "Log activity" primary CTA | `#006D3F` background, white label |
| TC-C-009 | Card outline (when outlined variant) | `#C2C9BE` (outline-variant), 1 px |
| TC-C-010 | Color contrast — all text | WCAG AA 4.5:1 / 3:1 |

## TC-L — Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Page padding — mobile/tablet/desktop | 16 / 24 / 32 px |
| TC-L-002 | Card corner radius | 16 px (xl) |
| TC-L-003 | Card padding | 20 px |
| TC-L-004 | Inter-card gap (within section) | 12–16 px |
| TC-L-005 | Bar-chart bar gap | 4 px |
| TC-L-006 | Section vertical rhythm | 24 px between sections |
| TC-L-007 | Avatar size — header | 32 / 40 / 48 px |
| TC-L-008 | Mobile shows single-column stack | confirmed |
| TC-L-009 | Tablet shows 1–2 columns where space allows | confirmed |
| TC-L-010 | Desktop shows main + side panel grid | confirmed; main bounded by max content width |

## TC-R — Responsive
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | 360 px viewport | Single-column; bottom nav visible |
| TC-R-002 | 768 px viewport | Two columns where appropriate; rail variant |
| TC-R-003 | 1200 px viewport | Drawer variant visible; bottom nav and rail hidden |
| TC-R-004 | 1440 px viewport | Drawer + side panel; main `<main>` `max-width <= 1152 px` |
| TC-R-005 | Resize from 1024 to 1440 | Smooth re-layout, no flicker |
| TC-R-006 | Print stylesheet | Page is readable in print preview (no nav chrome) |

## TC-F — Functional
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | Greeting reflects current time-of-day in user TZ | morning <12, afternoon <17, evening <22, night otherwise |
| TC-F-002 | Greeting uses user's display name | from profile (L2-014) |
| TC-F-003 | Today section sums activity for the current cadence period only | matches API totals |
| TC-F-004 | Streak chip on goal card shows current streak | matches L2-007 computation |
| TC-F-005 | Recent rewards card shows up to 3 most-recent earned rewards | newest first, with date earned |
| TC-F-006 | Click goal card | Navigates to `/goals/{id}` (L2-002 §3) |
| TC-F-007 | Click "Log activity" CTA on goal card | Opens log activity flow for that goal |
| TC-F-008 | Click "New goal" CTA | Navigates to create-goal flow |
| TC-F-009 | Click reward in "Recent rewards" | Navigates to `/rewards/{id}` |
| TC-F-010 | Dashboard shows only this user's data — switching accounts clears prior data | confirmed |
| TC-F-011 | Empty state — no goals yet | Shows onboarding CTA card (mobile/tablet/desktop) |
| TC-F-012 | Empty state — goals but zero activity today | Shows "log your first activity" prompt |
| TC-F-013 | Admin role chip / admin link visible only when user has Admin role (L2-015) | confirmed |
| TC-F-014 | API failure on dashboard load | Shows error state with retry, does not crash |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Tab order: greeting -> today metrics -> goals list -> rewards -> nav | Logical |
| TC-B-002 | Cards have visible focus rings | Yes |
| TC-B-003 | Bar chart has accessible `<svg role="img">` with summary text | Yes |
| TC-B-004 | Hover/focus state on cards | Subtle elevation or state-layer |
| TC-B-005 | Pull-to-refresh (mobile, optional) | Reloads dashboard data |
| TC-B-006 | Reduced-motion preference | No bar entrance animation |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | Greeting rendered as `<h1>` | Yes |
| TC-A-002 | Sections wrapped in `<section aria-labelledby=...>` | Yes |
| TC-A-003 | Bar chart exposes data via accessible name or table summary | Yes |
| TC-A-004 | Icon-only "Add" button has `aria-label="New goal"` | Yes |
| TC-A-005 | Streak chip text is not the sole conveyor of meaning (color + icon + label) | Yes |
| TC-A-006 | axe-core scan | 0 critical / serious |

## TC-D — Data persistence / sync
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | Logging an activity from elsewhere then returning to dashboard | New totals visible after refetch (cache-bust or revalidate) |
| TC-D-002 | Earning a reward | Surfaces on next dashboard load (L2-010 §2) |
| TC-D-003 | Sign out then sign in as different user | Old user's data is purged from in-memory store and cache |
| TC-D-004 | Cadence rollover — daily goal at local midnight | "Today" totals reset (L2-011 §1) |
| TC-D-005 | Network offline | Last cached snapshot shown with offline banner (no stale write attempts) |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Dashboard initial render uses route-level chunk only | yes (L2-019 §2) |
| TC-P-002 | API call to `/dashboard/summary` — p95 server time | <= 300 ms (L2-018 §1) |
| TC-P-003 | TBT under typical interactions | <= 200 ms |

## Exit criteria
All TC-V/C/L/R/F/B/A/D/P cases pass. No PII or tokens leaked in client logs.
RBAC gating verified for both authorized and unauthorized roles.

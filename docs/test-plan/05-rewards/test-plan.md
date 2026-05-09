# Test Plan — Rewards (List, Claim, Create)

## Scope
The Rewards area presents user-defined rewards earned by hitting goal
targets or streak milestones. Verifies visual fidelity to
`Screens / Rewards`, the earn/surface lifecycle (L2-010), and that
previously earned rewards are never silently revoked.

## References
- Design: `docs/ui-design.pen` -> `Screens / Rewards` (Mobile/360, Tablet/768, Desktop/1440)
- Requirements: L2-009 (Define), L2-010 (Earn / surface), L2-018 (API perf), L2-020 (Responsive), L2-021 (A11y)
- Tasks: `24-define-reward.md`, `25-view-rewards-list-and-filter.md`, `26-reward-earned-notification.md`

## Preconditions
- Authenticated user with at least one goal.
- Test fixtures: a reward in each lifecycle state — locked, in-progress, ready-to-claim, earned.

## TC-V — Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Page title "Rewards" | Inter 32 px desktop / 22 px mobile, weight 500 |
| TC-V-002 | Hero "READY TO CLAIM" eyebrow | Inter 11 px, weight 600, letter-spacing 1.5 px, uppercase |
| TC-V-003 | Hero reward title | Inter 36 px desktop, weight 500 |
| TC-V-004 | Hero description | Inter 16 px, weight 400, line-height 1.5 |
| TC-V-005 | Section labels ("In progress", "Locked") | Inter 18 px, weight 500 |
| TC-V-006 | Reward card title | Inter 14 px, weight 500 |
| TC-V-007 | Progress text ("6 of 10") | Inter 13 px, weight 600 |
| TC-V-008 | "New reward" button | Inter 14 px, weight 500, white |

## TC-C — Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Hero background — ready-to-claim | `#FFD7EE` (reward-container) |
| TC-C-002 | Hero icon container | `#9B2680` (reward) bg, white icon |
| TC-C-003 | Hero primary CTA "Claim" | `#9B2680` bg, white label |
| TC-C-004 | Hero secondary CTA | transparent bg, `#C2C9BE` outline |
| TC-C-005 | In-progress card | `#EBEFE7` bg |
| TC-C-006 | Locked card | `#EBEFE7` bg with opacity 0.65 |
| TC-C-007 | Progress bar fill | `#006D3F` |
| TC-C-008 | Progress bar track | `#E5E9E2` |
| TC-C-009 | Earned reward chip | `#94F7B4` bg, `#00210F` label |
| TC-C-010 | Page background | `#F1F5ED` |

## TC-L — Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Hero corner radius | 24 px |
| TC-L-002 | Hero padding | 32 px |
| TC-L-003 | Hero icon size | 120 px square, 9999 corner radius |
| TC-L-004 | Hero shadow | offset y=2, blur 8, color `#00000026` |
| TC-L-005 | Reward grid columns — desktop/tablet/mobile | 3 / 2 / 1 |
| TC-L-006 | Card corner radius | 16 px |
| TC-L-007 | Card padding | 20 px |
| TC-L-008 | Inter-card gap | 16 px |
| TC-L-009 | Page padding desktop / tablet / mobile | 32 / 24 / 16 px |
| TC-L-010 | Top bar height | 80 px |

## TC-R — Responsive
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | 360 px | Single column; hero stacks icon-then-text vertically |
| TC-R-002 | 768 px | Two-column grid; hero side-by-side icon + text |
| TC-R-003 | 1440 px | Three-column grid; bounded by max content width |
| TC-R-004 | Hero CTA buttons stack on mobile | 12 px gap |
| TC-R-005 | Locked cards still legible at smallest viewport | Yes |

## TC-F — Functional: list & claim
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | List shows only the current user's rewards | Yes (ownership scoping) |
| TC-F-002 | Earned rewards visually distinguished from pending | Distinct accent + earned date displayed (L2-010 §2) |
| TC-F-003 | Counts in subtitle accurate ("1 ready · 2 in progress · 3 locked") | Sums match list |
| TC-F-004 | Click "Claim" on ready-to-claim hero | Marks the reward as claimed; appears in earned section with claimed timestamp |
| TC-F-005 | Streak resets after a reward was earned | Earned reward remains earned (L2-010 §3) |
| TC-F-006 | Filter / tabs by state (ready, in-progress, locked, earned) | Counts and grids match |
| TC-F-007 | Click reward card | Navigates to `/rewards/{id}` detail |

## TC-F — Functional: define / edit / delete
| ID | Case | Expected |
|----|------|----------|
| TC-F-101 | Create reward — name + description + qualifying condition (goal + streak threshold) | Persisted, linked to goal (L2-009 §1) |
| TC-F-102 | Create reward without qualifying condition | Validation error (L2-009 §2) |
| TC-F-103 | Attempt to attach reward to a goal not owned by user | Rejected (L2-009 §3) |
| TC-F-104 | Edit reward name / description | Persisted |
| TC-F-105 | Delete reward | Removed; previously earned instances of it preserved as user history |

## TC-F — Functional: earning notification
| ID | Case | Expected |
|----|------|----------|
| TC-F-201 | User's streak reaches threshold mid-session | In-app notification fires (L2-010 §1) |
| TC-F-202 | Threshold reached while user offline | Notification queued; surfaces on next dashboard / rewards visit |
| TC-F-203 | Notification has accessible name and is dismissible | Yes |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Tab order: top bar -> filter tabs -> hero -> grid -> CTA | Logical |
| TC-B-002 | Hero "Claim" button shows loading state | Yes; disabled until done |
| TC-B-003 | Reduced-motion preference | No celebratory animation |
| TC-B-004 | Hover state on cards | Subtle elevation |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | Hero is `<section aria-labelledby>` with title as `<h2>` | Yes |
| TC-A-002 | Earned/in-progress/locked state communicated via text and icon, not color alone | Yes |
| TC-A-003 | Progress bar exposes `role="progressbar"` with `aria-valuenow / valuemax` | Yes |
| TC-A-004 | "Claim" button has descriptive accessible name (`Claim "{reward name}"`) | Yes |
| TC-A-005 | axe-core | 0 critical / serious |

## TC-D — Data persistence
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | Defined reward survives reload | Yes |
| TC-D-002 | Earned reward survives reload | Yes |
| TC-D-003 | Earned reward NOT revoked when streak later breaks | Yes (L2-010 §3) |
| TC-D-004 | Claimed timestamp recorded | Yes; displayed on detail view |
| TC-D-005 | Sign in as different user | Other users' rewards not visible |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Read rewards list (up to 100) — p95 | <= 300 ms |
| TC-P-002 | Claim reward — p95 | <= 500 ms |

## Exit criteria
All cases pass. Earned rewards are immutable on the user's earned-history,
and reward state changes are auditable.

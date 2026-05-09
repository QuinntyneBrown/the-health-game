# Test Plan — Goals (List, Detail, Create)

## Scope
The Goals area covers the filterable goal list, the per-goal detail view
showing streaks and activity history, and the create/edit goal forms.
Verifies visual fidelity to `Screens / Goals`, the L2 ownership model,
cadence semantics, and CRUD behavior.

## References
- Design: `docs/ui-design.pen` -> `Screens / Goals` (Mobile/360, Tablet/768, Desktop/1440)
- Requirements: L2-001 (Create), L2-002 (View), L2-003 (Edit), L2-004 (Delete), L2-007 (Streak compute), L2-008 (Streak display), L2-011 (Cadences), L2-012 (Custom cadence), L2-018 (API perf), L2-020 (Responsive), L2-021 (A11y)
- Tasks: `13-empty-goals-list.md`, `14-create-daily-goal.md`, `15-create-cadence-variants.md`, `16-view-goals-list-with-streaks.md`, `17-view-goal-detail.md`, `18-edit-goal.md`, `19-delete-goal.md`

## Preconditions
- Authenticated user.
- Test fixtures: 0-state user (for empty), and a populated user with goals across all cadences (hourly, daily, weekly, monthly, custom).

## TC-V — Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Page title "Goals" | Inter 32 px desktop / 22 px mobile, weight 500 |
| TC-V-002 | Subtitle ("5 active goals · 4 streaks running") | Inter 13 px, weight 400 |
| TC-V-003 | Filter chip labels | Inter 13 px, weight 500 |
| TC-V-004 | Goal card title | Inter 14 px, weight 500 |
| TC-V-005 | Goal card metadata (cadence, streak, target) | Inter 12 px, weight 400 |
| TC-V-006 | "New goal" button label | Inter 14 px, weight 500, white |
| TC-V-007 | Empty state heading | Inter 22 px, weight 500 |
| TC-V-008 | Form field labels | Inter 13 px, weight 500 |
| TC-V-009 | Form helper text | Inter 12 px, weight 400 |

## TC-C — Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Page background | `#F1F5ED` (surface-container-low) |
| TC-C-002 | Top bar background | `#F7FBF3` (surface) |
| TC-C-003 | Active filter chip | `#D2E8D4` background, `#0C1F13` label |
| TC-C-004 | Inactive filter chip | transparent fill, `#C2C9BE` 1 px outline, `#191D17` label |
| TC-C-005 | Goal card background (default) | `#EBEFE7` (surface-container) |
| TC-C-006 | Highlighted "ready" card | `#94F7B4` (primary container) |
| TC-C-007 | Goal card icon backgrounds rotate through container palette | green / blue / orange / pink containers |
| TC-C-008 | Progress bar fill | `#006D3F` |
| TC-C-009 | Progress bar track | `#E5E9E2` |
| TC-C-010 | Primary "New goal" button | `#006D3F` bg, `#FFFFFF` label |
| TC-C-011 | Destructive "Delete" button | `#BA1A1A` bg in confirm dialog, `#FFFFFF` label |

## TC-L — Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Top bar height — desktop/tablet/mobile | 80 / 80 / 64 px |
| TC-L-002 | Top bar horizontal padding | 32 / 32 / 8 px |
| TC-L-003 | Filter row gap between chips | 8 px |
| TC-L-004 | Filter chip height | 32 px (mobile), 36 px (tablet/desktop) |
| TC-L-005 | Goal card corner radius | 16 px |
| TC-L-006 | Goal card padding | 12 px (mobile), 20 px (tablet/desktop) |
| TC-L-007 | Goal card icon container size | 40 px square, 9999 corner radius |
| TC-L-008 | List inter-row gap (mobile) | 8 px |
| TC-L-009 | Grid columns (desktop) | 3 cards across; gap 16 px |
| TC-L-010 | Floating action button (mobile) | 56 px, bottom-right with 24 px inset |
| TC-L-011 | Detail view — section spacing | 24 px between header / streak / activity history |

## TC-R — Responsive
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | 360 px | Single-column list; FAB visible |
| TC-R-002 | 768 px | Two-column grid; "New goal" pill in top bar |
| TC-R-003 | 1440 px | Three-column grid; max content width <= 1152 px |
| TC-R-004 | Filter row scrolls horizontally on mobile if overflowing | yes, no clipping |
| TC-R-005 | Long goal names truncate at 1 line on cards | ellipsis + accessible full name on hover/focus |
| TC-R-006 | Detail view streaks row stays readable at <576 px | no horizontal scroll (L2-008 §3) |

## TC-F — Functional: list
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | List shows only goals owned by current user | per L2-002 §1 |
| TC-F-002 | Searching filters by name (case-insensitive substring) | Yes |
| TC-F-003 | Filter chip "All" shows count of total goals | matches list size |
| TC-F-004 | Filter chip "Daily" shows count of daily-cadence goals | counts match |
| TC-F-005 | Filter chip "Hourly/Weekly/Monthly" similarly accurate | yes |
| TC-F-006 | Sort: Streak length | descending current streak; tiebreak alphabetical |
| TC-F-007 | Sort: Recently active | descending last-activity timestamp |
| TC-F-008 | Sort: Name | ascending |
| TC-F-009 | Empty state — 0 goals | Shows onboarding card with "Create your first goal" CTA |
| TC-F-010 | Click on a goal card | Navigates to `/goals/{id}` |
| TC-F-011 | Streak chip on card matches L2-007 computation | Yes |

## TC-F — Functional: create / edit
| ID | Case | Expected |
|----|------|----------|
| TC-F-101 | Create goal — required field name empty | Form blocks submit; inline error (L2-001 §2) |
| TC-F-102 | Create goal — non-positive target | Inline error; not persisted (L2-001 §3) |
| TC-F-103 | Create daily goal — happy path | Persisted; appears at top of list within 500 ms |
| TC-F-104 | Create hourly / weekly / monthly | Persisted with correct cadence (L2-011) |
| TC-F-105 | Create custom cadence "every 3 days" | Persisted; period boundaries from start date in 3-day increments (L2-012 §1) |
| TC-F-106 | Custom cadence with N <= 0 | Validation error (L2-012 §2) |
| TC-F-107 | Edit goal — change cadence from daily to weekly | Streak windows recomputed forward; historical entries unchanged (L2-003 §3) |
| TC-F-108 | Edit goal owned by another user via crafted request | 403 / 404 (L2-003 §2) |
| TC-F-109 | Save while offline | Disabled or queued with offline indicator |

## TC-F — Functional: delete
| ID | Case | Expected |
|----|------|----------|
| TC-F-201 | Click delete | Confirmation dialog appears (L2-004 §3) |
| TC-F-202 | Cancel confirmation | Goal preserved |
| TC-F-203 | Confirm delete | Goal + activity entries + linked rewards removed from view (L2-004 §1) |
| TC-F-204 | Attempt to delete via crafted API request not owned | 403 / 404 (L2-004 §2) |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Tab order: search -> filter chips -> sort -> list cards -> FAB | Logical |
| TC-B-002 | Enter activates focused chip / card / button | Yes |
| TC-B-003 | Form fields show focus ring at >=3:1 contrast | Yes |
| TC-B-004 | Submitting form with Enter from any field | Triggers submit |
| TC-B-005 | Optimistic UI on create | Card appears immediately; rolls back on API failure with toast |
| TC-B-006 | Streak count animates only when not in reduced-motion mode | Yes |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | Goal card is a single accessible link/button | Yes (no nested clickable controls) |
| TC-A-002 | Filter chips expose `role="tab"` or `aria-pressed` accurately | Yes |
| TC-A-003 | Form fields have `<label>` associations | Yes |
| TC-A-004 | Validation errors associated via `aria-describedby` | Yes |
| TC-A-005 | Delete confirmation is a focus-trapping `<dialog>` | Yes |
| TC-A-006 | axe-core | 0 critical/serious |

## TC-D — Data persistence
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | Created goal survives reload | Yes (server-persisted) |
| TC-D-002 | Edit survives reload | Yes |
| TC-D-003 | Deleted goal does not reappear after reload | Yes |
| TC-D-004 | Sign out + sign in same user | Same goals visible |
| TC-D-005 | Sign in as different user | Other user's goals not visible |
| TC-D-006 | Cadence rollover at local midnight (daily) | Period totals reset; streak preserved (L2-011 §1) |
| TC-D-007 | Concurrent edit (two tabs) | Last-write-wins or server reports stale-version error; UI reconciles |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Read 100 goals — p95 server time | <= 300 ms (L2-018 §1) |
| TC-P-002 | Create / update — p95 | <= 500 ms (L2-018 §2) |
| TC-P-003 | Goals route lazy-loaded | confirmed via bundle analyzer (L2-019 §2) |

## Exit criteria
All TC-V/C/L/R/F/B/A/D/P cases pass. RBAC verified — non-owners cannot read,
edit, or delete others' goals through any client path.

# Test Plan — Log Activity & Create Goal

## Scope
Two related flows that share visual treatment in the design:
- **Log activity**: bottom sheet on mobile, dialog on tablet/desktop, that
  records a quantity (and optional note) against a chosen goal.
- **Create goal**: full-page form on tablet, dialog on desktop (the desktop
  modal frame in the .pen was removed; tablet form is the canonical
  representation; desktop reuses the tablet form bounded by max content
  width).

## References
- Design: `docs/ui-design.pen` -> `Screens / Log Activity & Create Goal` (Mobile / Quick log sheet, Tablet / Create goal / 768)
- Requirements: L2-001 (Create goal), L2-005 (Log activity), L2-006 (Edit/Delete activity), L2-007 (Streak compute on write), L2-011 / L2-012 (Cadences), L2-016 (Input validation), L2-020 (Responsive), L2-021 (A11y)
- Tasks: `14-create-daily-goal.md`, `15-create-cadence-variants.md`, `20-log-activity-mobile-sheet.md`, `21-log-activity-desktop-dialog.md`, `23-edit-and-delete-activity.md`

## Preconditions
- Authenticated user.
- For log-activity tests: at least one daily goal owned by the user.

## TC-V — Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Sheet/dialog title ("Log activity", "New goal") | Inter 22 px, weight 500 |
| TC-V-002 | Field labels | Inter 13 px, weight 500 |
| TC-V-003 | Input text | Inter 14 px, weight 400 |
| TC-V-004 | Helper text / unit suffix | Inter 12 px, weight 400 |
| TC-V-005 | Submit button label | Inter 14 px, weight 500, white |
| TC-V-006 | Validation error text | Inter 12 px, weight 500, error color |
| TC-V-007 | Section group label ("Cadence", "Reminder") | Inter 13 px, weight 600, letter-spacing 0.5 px |

## TC-C — Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Sheet/dialog surface | `#F7FBF3` (surface) |
| TC-C-002 | Field outline (default) | `#C2C9BE` (outline-variant), 1 px |
| TC-C-003 | Field outline (focused) | `#006D3F` (primary), 2 px |
| TC-C-004 | Field outline (error) | `#BA1A1A` (error), 2 px |
| TC-C-005 | Cadence segmented selected | `#94F7B4` background, `#00210F` label |
| TC-C-006 | Cadence segmented unselected | transparent fill, outline 1 px, `#191D17` label |
| TC-C-007 | Switch on color | `#006D3F` track, `#FFFFFF` thumb |
| TC-C-008 | Submit button | `#006D3F` bg, white label |
| TC-C-009 | Mobile sheet handle | `#C2C9BE`, 4 px tall, 32 px wide |
| TC-C-010 | Backdrop scrim (when modal) | `#0000007A` |

## TC-L — Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Mobile bottom sheet corner radius | 28 px top, 0 bottom |
| TC-L-002 | Mobile sheet padding | 24 px horizontal, 16 px top, 24 px bottom (above safe-area inset) |
| TC-L-003 | Tablet form padding | 32 px |
| TC-L-004 | Field height | 56 px |
| TC-L-005 | Inter-field vertical gap | 16 px |
| TC-L-006 | Section vertical gap | 24 px |
| TC-L-007 | Cadence segmented control height | 40 px; corner radius 9999 |
| TC-L-008 | Submit button height | 48 px (mobile) / 56 px (tablet/desktop) |
| TC-L-009 | Submit button width | full width on mobile / right-aligned on tablet/desktop |
| TC-L-010 | Dialog max width on desktop | 720 px; centered with max content max-width respected |

## TC-R — Responsive
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | 360 px | Bottom sheet slides up from below; takes ~75% of viewport height; drag handle visible |
| TC-R-002 | 768 px | Full-page form layout; nav rail still visible |
| TC-R-003 | 1200 px | Centered dialog with backdrop; form re-uses tablet styling |
| TC-R-004 | Resize from mobile to tablet while open | Component swaps from sheet to dialog without losing form state |
| TC-R-005 | Soft keyboard on mobile | Sheet content scrolls; submit button stays visible above keyboard |
| TC-R-006 | Long content (e.g., notes textarea grows) | Sheet remains scrollable; submit pinned to bottom |

## TC-F — Functional: log activity
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | Log a positive quantity for a daily goal | Persisted; appears in goal's activity history (L2-005 §1) |
| TC-F-002 | Log a quantity of 0 | Allowed (counts as "checked in") OR rejected per design — confirm with spec; current expectation: rejected |
| TC-F-003 | Log a negative quantity | Validation error (L2-001 §3 / L2-016) |
| TC-F-004 | Log activity with future timestamp beyond cadence window | Validation error (L2-005 §2) |
| TC-F-005 | Log activity with optional note (1–500 chars) | Persisted |
| TC-F-006 | Note exceeding 500 chars | Validation error |
| TC-F-007 | Log against a goal owned by another user (crafted request) | 403 / 404 (L2-005 §3) |
| TC-F-008 | After successful log, streak recomputed | L2-007 satisfied; UI reflects new current streak |
| TC-F-009 | Successful submit closes sheet/dialog and shows toast | Yes |
| TC-F-010 | Edit existing activity entry | Persists; recomputes streak (L2-006 §1) |
| TC-F-011 | Delete existing activity entry | Persists; recomputes streak (L2-006 §2) |
| TC-F-012 | Edit/delete another user's entry via crafted request | 403 / 404 (L2-006 §3) |

## TC-F — Functional: create goal
| ID | Case | Expected |
|----|------|----------|
| TC-F-101 | Empty name | Validation error (L2-001 §2) |
| TC-F-102 | Non-positive target | Validation error (L2-001 §3) |
| TC-F-103 | Cadence Daily — happy path | Persisted; appears in list with streak 0 |
| TC-F-104 | Cadence Hourly | Persisted; period rolls at top of next hour (L2-011 §4) |
| TC-F-105 | Cadence Weekly with week-start = Monday | Persisted; rollover at next Monday (L2-011 §2) |
| TC-F-106 | Cadence Monthly | Persisted; rollover on first of next month (L2-011 §3) |
| TC-F-107 | Custom cadence "every 3 days" | Persisted with start date; period boundaries 3-day increments (L2-012 §1) |
| TC-F-108 | Custom cadence N=0 | Validation error (L2-012 §2) |
| TC-F-109 | Submit while unauthenticated (token expired) | 401; client routes to re-auth (L2-013 §4) |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Open log sheet via FAB | Slide-up animation 200 ms; respects reduced-motion |
| TC-B-002 | Backdrop click closes sheet (no unsaved changes) | Yes |
| TC-B-003 | Backdrop click with unsaved changes | Confirmation dialog ("Discard?") |
| TC-B-004 | Esc closes dialog (desktop) | Yes |
| TC-B-005 | Focus moves into first form field on open | Yes |
| TC-B-006 | Focus returns to FAB / trigger on close | Yes |
| TC-B-007 | Tab cycles within dialog (focus trap) | Yes |
| TC-B-008 | Submit button shows loading spinner during in-flight call | Yes; disabled until done |
| TC-B-009 | Double-click submit | Only one create / log POST emitted |
| TC-B-010 | Drag handle on mobile sheet supports swipe-to-dismiss | Yes |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | Sheet exposes `role="dialog"` with `aria-modal="true"` | Yes |
| TC-A-002 | Title programmatically associated via `aria-labelledby` | Yes |
| TC-A-003 | Each input has visible label and matching `<label for>` | Yes |
| TC-A-004 | Inline errors announced via `aria-live="polite"` | Yes |
| TC-A-005 | Submit button announces loading state via `aria-busy` | Yes |
| TC-A-006 | Sheet handle has `aria-label="Drag to close"` (or button alternative) | Yes |
| TC-A-007 | axe-core | 0 critical / serious |

## TC-D — Data persistence
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | Logged activity survives reload | Yes (server-persisted) |
| TC-D-002 | Created goal survives reload | Yes |
| TC-D-003 | Logged note text round-trips exactly (incl. unicode, newlines) | Yes |
| TC-D-004 | Quantity decimal precision preserved (per goal unit definition) | Yes |
| TC-D-005 | Network failure mid-submit | Form remains open with values preserved; retry works |
| TC-D-006 | Concurrent log from another device | Second log succeeds; streak recomputed deterministically |

## TC-S — Security & validation
| ID | Case | Expected |
|----|------|----------|
| TC-S-001 | XSS payload in goal name / note | Escaped on render (L2-016 §3) |
| TC-S-002 | SQL-injection-shaped input | Rejected/escaped; parameterized query (L2-016 §2) |
| TC-S-003 | CSRF token attached to mutating request | Yes (L2-016 §4) |
| TC-S-004 | No tokens or code verifiers logged | Confirmed (L2-013 §3, L2-022) |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Sheet opens within 100 ms of FAB tap | Yes |
| TC-P-002 | Submit p95 server time | <= 500 ms (L2-018 §2) |

## Exit criteria
All cases pass. No data leakage between users. Streak recomputation is
correct and deterministic across edits, deletes, and concurrent writes.

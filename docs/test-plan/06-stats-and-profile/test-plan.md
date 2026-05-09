# Test Plan — Stats & Profile

## Scope
Combined user-progress dashboard (Stats) and account management (Profile).
Verifies visual fidelity to `Screens / Stats & Profile`, accuracy of
aggregate metrics, profile edit/delete behavior, and PII safety.

## References
- Design: `docs/ui-design.pen` -> `Screens / Stats & Profile` (Mobile/360, Tablet/768, Desktop/1440)
- Requirements: L2-007 (Streak compute), L2-014 (Profile / account deletion), L2-015 (RBAC), L2-017 (Secrets / PII), L2-018 (API perf), L2-020 (Responsive), L2-021 (A11y), L2-022 (Logging)
- Tasks: `10-view-profile.md`, `11-edit-profile-name-and-email.md`, `12-delete-account.md`, `30-accessibility-audit.md`

## Preconditions
- Authenticated user.
- Test fixtures: user with at least 30 days of activity history, multiple completed cadence periods, mixed goal types, and at least one earned reward.

## TC-V — Typography
| ID | Case | Expected |
|----|------|----------|
| TC-V-001 | Page title ("Stats", "Profile") | Inter 32 / 22 px (desktop / mobile), weight 500 |
| TC-V-002 | Stat headline numbers (e.g., "87%", "1,240", "Lvl 8") | Inter 32 px, weight 600 |
| TC-V-003 | Stat label | Inter 12 px, weight 500 |
| TC-V-004 | Section headings | Inter 18 px, weight 500 |
| TC-V-005 | Form field labels (email, display name) | Inter 13 px, weight 500 |
| TC-V-006 | Body / paragraph copy | Inter 14 px, weight 400, line-height 1.5 |
| TC-V-007 | Destructive button label ("Delete account") | Inter 14 px, weight 500 |

## TC-C — Color
| ID | Case | Expected |
|----|------|----------|
| TC-C-001 | Page background | `#F1F5ED` |
| TC-C-002 | Stat tile backgrounds (rotation) | success `#94F7B4`, streak `#FFDCC4`, info `#BEEAF6`, reward `#FFD7EE` |
| TC-C-003 | On-tile text colors | matching on-* token (e.g., `#00210F` on `#94F7B4`) |
| TC-C-004 | Activity bar chart bars | `#006D3F` |
| TC-C-005 | Activity bar chart axis labels | `#424940` (on surface variant) |
| TC-C-006 | Profile avatar background | `#94F7B4`; initial in `#00210F` |
| TC-C-007 | Profile primary action ("Save") | `#006D3F` bg, white label |
| TC-C-008 | Destructive ("Delete account") | `#BA1A1A` bg, white label |
| TC-C-009 | Form outline (default / focus / error) | `#C2C9BE` / `#006D3F` 2 px / `#BA1A1A` 2 px |
| TC-C-010 | Color contrast all text | WCAG AA |

## TC-L — Layout & Spacing
| ID | Case | Expected |
|----|------|----------|
| TC-L-001 | Stat tile grid — desktop/tablet/mobile | 5 / 3 / 2 columns |
| TC-L-002 | Stat tile corner radius | 16 px |
| TC-L-003 | Stat tile padding | 16 px |
| TC-L-004 | Bar-chart panel padding | 24 px |
| TC-L-005 | Profile form field height | 56 px |
| TC-L-006 | Profile form column max width | 480 px |
| TC-L-007 | Section vertical rhythm | 24 px |
| TC-L-008 | Avatar size — desktop | 48 px |
| TC-L-009 | Avatar size — mobile | 32 px |
| TC-L-010 | Page padding desktop / tablet / mobile | 32 / 24 / 16 px |

## TC-R — Responsive
| ID | Case | Expected |
|----|------|----------|
| TC-R-001 | 360 px | Stat tiles 2 columns; bar chart full width below |
| TC-R-002 | 768 px | Stat tiles 3 columns |
| TC-R-003 | 1440 px | Stat tiles 5 columns; profile right-rail or below per layout |
| TC-R-004 | Print stylesheet | Renders without nav chrome |
| TC-R-005 | Bar chart axis labels remain readable at 360 px | Yes (no overlap) |

## TC-F — Functional: stats
| ID | Case | Expected |
|----|------|----------|
| TC-F-001 | Active goals count matches API count | Yes |
| TC-F-002 | Total activity count over selected window matches sum of entries | Yes |
| TC-F-003 | Completion % = met-period-count / total-period-count for window | Matches L2-007 logic |
| TC-F-004 | Bar chart x-axis matches selected window (week / month / year) | Yes |
| TC-F-005 | Streak tile matches L2-007 current streak across user's longest active goal | Yes |
| TC-F-006 | Lvl tile derived from cumulative activity (deterministic formula) | Yes |
| TC-F-007 | Switching window selector | Tiles + chart re-fetch and update |
| TC-F-008 | Empty state — no activity | Stats show 0/0/0 with "log your first activity" prompt |

## TC-F — Functional: profile
| ID | Case | Expected |
|----|------|----------|
| TC-F-101 | View profile shows display name, email, avatar, member-since date | Yes |
| TC-F-102 | Edit display name — happy path | Persisted; reflected in dashboard greeting (L2-014 §1) |
| TC-F-103 | Edit email — when provider permits | Persisted; verification email sent if required |
| TC-F-104 | Edit email — when provider forbids | UI displays read-only with explanation |
| TC-F-105 | Cancel edit | Form reverts to last saved values |
| TC-F-106 | Submit empty display name | Validation error |
| TC-F-107 | Submit invalid email | Validation error (RFC 5321 / 5322 reasonable subset) |

## TC-F — Functional: account deletion
| ID | Case | Expected |
|----|------|----------|
| TC-F-201 | Click "Delete account" | Confirmation dialog with explicit warning + typed confirmation ("DELETE") |
| TC-F-202 | Cancel confirmation | No-op |
| TC-F-203 | Confirm deletion | Backend deletes/anonymizes data and revokes sessions (L2-014 §2) |
| TC-F-204 | Subsequent sign-in attempt with deleted account | Rejected (L2-014 §3) |
| TC-F-205 | RBAC: non-admin cannot delete other accounts | 403 (L2-015 §1) |

## TC-B — Behavior
| ID | Case | Expected |
|----|------|----------|
| TC-B-001 | Tab order: window selector -> stat tiles -> chart -> profile fields -> save -> destructive | Logical |
| TC-B-002 | Save button disabled until form is dirty AND valid | Yes |
| TC-B-003 | Save shows loading state during in-flight call | Yes |
| TC-B-004 | Delete dialog focus-traps and restores focus on close | Yes |
| TC-B-005 | Destructive button only enabled after typed confirmation | Yes |
| TC-B-006 | Reduced-motion | Bars do not animate; selector switch is instant |

## TC-A — Accessibility
| ID | Case | Expected |
|----|------|----------|
| TC-A-001 | Page title rendered as `<h1>` | Yes |
| TC-A-002 | Stat tile values have visible label and accessible relationship (label + value grouped) | Yes |
| TC-A-003 | Bar chart has accessible summary (table fallback or `aria-label`) | Yes |
| TC-A-004 | Form fields use `<label for>` and announce errors via `aria-describedby` | Yes |
| TC-A-005 | Destructive action region uses `role="alertdialog"` with focus trap | Yes |
| TC-A-006 | axe-core | 0 critical / serious |

## TC-D — Data persistence & privacy
| ID | Case | Expected |
|----|------|----------|
| TC-D-001 | Profile edit survives reload | Yes |
| TC-D-002 | After account deletion, no API endpoint reveals deleted user's data | Yes (L2-014 §2) |
| TC-D-003 | After account deletion, audit log records the deletion event with correlation ID | Yes (L2-022 §3) |
| TC-D-004 | Email is never logged at any level | Confirmed (L2-017 §3) |
| TC-D-005 | Auth tokens never written to localStorage; refresh tokens (if used) httpOnly cookie only | Confirmed (L2-013 §3) |
| TC-D-006 | Stats accurately reflect cadence rollovers across midnight / month boundaries (L2-011) | Yes |

## TC-P — Performance
| ID | Case | Expected |
|----|------|----------|
| TC-P-001 | Stats summary endpoint p95 | <= 300 ms (L2-018 §1) |
| TC-P-002 | Profile update endpoint p95 | <= 500 ms (L2-018 §2) |
| TC-P-003 | Bar chart renders without layout shift (CLS ~ 0) | Yes |

## Exit criteria
All cases pass. Account deletion is irreversible and verifiable. No PII or
secrets appear in any client log or server log entry inspected during the
run. axe-core clean across all viewports.

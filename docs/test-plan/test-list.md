# Test List

Consolidated list of every test case from `docs/test-plan/`. Each entry has a
`completionDateTime` property that is `null` until the test has been exercised
and made green. The /loop process picks the first test with
`completionDateTime: null` each iteration.

## Tests

| # | Plan | TC ID | Description | Expected | completionDateTime |
|---|------|-------|-------------|----------|--------------------|
| 1 | 01 | TC-V-001 | Headline ("Make health a game") font family | `Inter`, weight 500 | 2026-05-09T17:43:00Z |
| 2 | 01 | TC-V-002 | Headline size — mobile | 28 px | 2026-05-09T17:44:39Z |
| 3 | 01 | TC-V-003 | Headline size — tablet | 45 px | 2026-05-09T17:46:24Z |
| 4 | 01 | TC-V-004 | Headline size — desktop | 57 px, line-height 1.1 | 2026-05-09T17:47:55Z |
| 5 | 01 | TC-V-005 | Body description font weight | 400 (normal) | 2026-05-09T17:49:27Z |
| 6 | 01 | TC-V-006 | Body description size — mobile/tablet/desktop | 16 / 18 / 18 px | 2026-05-09T17:52:38Z |
| 7 | 01 | TC-V-007 | Body description line-height | 1.5 | 2026-05-09T17:53:38Z |
| 8 | 01 | TC-V-008 | Primary button label ("Get started") | Inter 14/16 px, weight 500, white | 2026-05-09T17:56:21Z |
| 9 | 01 | TC-V-009 | Secondary button label ("I have an account") | Inter 14/16 px, weight 500, on-surface color | 2026-05-09T17:58:49Z |
| 10 | 01 | TC-V-010 | Brand wordmark ("HealthQuest") visible at desktop only | font 22 px, weight 500 | 2026-05-09T18:01:35Z |
| 11 | 01 | TC-C-001 | Page background | `#F7FBF3` (md-sys-color-surface) | 2026-05-09T18:03:38Z |
| 12 | 01 | TC-C-002 | Hero panel background | `#94F7B4` (primary container) | 2026-05-09T18:05:57Z |
| 13 | 01 | TC-C-003 | Trophy icon color on hero | `#00210F` (on primary container) | 2026-05-09T18:08:29Z |
| 14 | 01 | TC-C-004 | Headline text color | `#191D17` (on surface) | 2026-05-09T18:10:41Z |
| 15 | 01 | TC-C-005 | Primary button background | `#006D3F` (primary) | 2026-05-09T18:11:42Z |
| 16 | 01 | TC-C-006 | Primary button label color | `#FFFFFF` | 2026-05-09T18:12:51Z |
| 17 | 01 | TC-C-007 | Secondary button border | `#C2C9BE` (outline-variant), 1 px | 2026-05-09T18:13:54Z |
| 18 | 01 | TC-C-008 | Active page-dot color | `#006D3F` | 2026-05-09T18:16:19Z |
| 19 | 01 | TC-C-009 | Inactive page-dot color | `#F1F5ED` (surface-container-low) | 2026-05-09T18:17:22Z |
| 20 | 01 | TC-C-010 | Text/background contrast meets WCAG AA | >= 4.5:1 normal text, >= 3:1 large text | 2026-05-09T18:19:44Z |
| 21 | 01 | TC-L-001 | Mobile body padding | 24 px on all sides | 2026-05-09T18:20:40Z |
| 22 | 01 | TC-L-002 | Mobile vertical gap between hero, title, dots, buttons | 24 px | 2026-05-09T18:22:21Z |
| 23 | 01 | TC-L-003 | Tablet body padding | 40 px top/bottom, 80 px left/right | 2026-05-09T18:24:37Z |
| 24 | 01 | TC-L-004 | Tablet content vertical gap | 32 px | 2026-05-09T18:26:48Z |
| 25 | 01 | TC-L-005 | Hero corner radius — mobile/tablet | 28 / 36 px | 2026-05-09T18:29:13Z |
| 26 | 01 | TC-L-006 | Trophy icon size — mobile/tablet/desktop | 120 / 180 / 280 px | 2026-05-09T18:31:18Z |
| 27 | 01 | TC-L-007 | Buttons stacked vertically with 12 px gap on mobile | confirmed via DOM bounding boxes | 2026-05-09T18:35:06Z |
| 28 | 01 | TC-L-008 | Buttons inline with 16 px gap on tablet/desktop | confirmed | 2026-05-09T18:39:07Z |
| 29 | 01 | TC-L-009 | Pill button corner radius | 9999 (full) | 2026-05-09T18:40:27Z |
| 30 | 01 | TC-L-010 | Desktop split — left column ~50% width, right hero ~50% | left contains copy + actions, right contains trophy hero | 2026-05-09T18:45:25Z |
| 31 | 01 | TC-R-001 | Viewport 360x780 | Single-column mobile layout, no horizontal scrollbar | 2026-05-09T18:46:49Z |
| 32 | 01 | TC-R-002 | Viewport 375x812 | Same layout as 360 (mobile) | 2026-05-09T18:48:12Z |
| 33 | 01 | TC-R-003 | Viewport 768x1024 | Tablet layout — buttons inline, larger hero | 2026-05-09T18:49:19Z |
| 34 | 01 | TC-R-004 | Viewport 1024x768 | Tablet layout still applies (rail variant for app shell when signed in) | 2026-05-09T18:50:40Z |
| 35 | 01 | TC-R-005 | Viewport 1440x900 | Desktop layout — split hero with brand wordmark visible | 2026-05-09T18:51:53Z |
| 36 | 01 | TC-R-006 | Viewport >= 1920 wide | Content max-width respected (no edge-to-edge stretching) | 2026-05-09T18:53:13Z |
| 37 | 01 | TC-R-007 | Window resize during render | Layout recomputes without flicker | 2026-05-09T18:54:28Z |
| 38 | 01 | TC-R-008 | Page-dot indicator visible at all breakpoints | yes | 2026-05-09T18:55:35Z |
| 39 | 01 | TC-F-001 | Click "Get started" | Browser navigates to OIDC `/authorize` URL (PKCE flow) | 2026-05-09T18:58:55Z |
| 40 | 01 | TC-F-002 | Click "I have an account" | Same OIDC `/authorize` URL with `prompt=login` (or equivalent) | 2026-05-09T19:03:48Z |
| 41 | 01 | TC-F-003 | OIDC state and code_verifier generated | Random per click; state echoed back in callback | 2026-05-09T19:05:06Z |
| 42 | 01 | TC-F-004 | Code verifier stored in `sessionStorage` only | Not in localStorage; cleared after exchange | 2026-05-09T19:09:49Z |
| 43 | 01 | TC-F-005 | After OIDC callback success | App routes to `/home` | 2026-05-09T19:13:17Z |
| 44 | 01 | TC-F-006 | OIDC callback with mismatched `state` | Reject; route to `/onboarding` with toast (L2-013 §3) | 2026-05-09T19:15:55Z |
| 45 | 01 | TC-F-007 | Page loads with no auth tokens leaked to console / network logs | Confirmed via DevTools | 2026-05-09T19:17:11Z |
| 46 | 01 | TC-F-008 | Direct visit to `/onboarding` while authenticated | Redirect to `/home` | 2026-05-09T19:22:13Z |
| 47 | 01 | TC-B-001 | Tab order: Get started -> I have an account -> page-dot? -> Get started | Logical, single-row, no skipped controls | 2026-05-09T19:23:43Z |
| 48 | 01 | TC-B-002 | Visible focus ring on every interactive element | Yes, color contrast >= 3:1 | 2026-05-09T19:24:57Z |
| 49 | 01 | TC-B-003 | Enter on focused button activates it | Yes | 2026-05-09T19:26:08Z |
| 50 | 01 | TC-B-004 | Space on focused button activates it | Yes | 2026-05-09T19:27:28Z |
| 51 | 01 | TC-B-005 | Hover on primary button | Slight elevation / state-layer overlay; cursor pointer | 2026-05-09T19:29:09Z |
| 52 | 01 | TC-B-006 | Click during in-flight redirect (double click "Get started") | Only one OIDC redirect emitted | 2026-05-09T19:32:16Z |
| 53 | 01 | TC-B-007 | Reduced-motion preference honored | No animated dot transitions | 2026-05-09T19:35:13Z |
| 54 | 01 | TC-A-001 | `<main>` landmark wraps content | Yes | 2026-05-09T19:42:44Z |
| 55 | 01 | TC-A-002 | Headline rendered as `<h1>` | Yes | 2026-05-09T19:44:07Z |
| 56 | 01 | TC-A-003 | Trophy icon has accessible name or `aria-hidden="true"` | Decorative — `aria-hidden` | 2026-05-09T19:45:19Z |
| 57 | 01 | TC-A-004 | Buttons have descriptive accessible names ("Get started", "I have an account") | Yes | 2026-05-09T19:46:33Z |
| 58 | 01 | TC-A-005 | Page-dot indicator exposes `aria-current="step"` on the active dot | Yes | 2026-05-09T19:47:48Z |
| 59 | 01 | TC-A-006 | axe-core scan returns 0 critical / serious violations | Yes | 2026-05-09T19:49:41Z |
| 60 | 01 | TC-D-001 | OIDC `code_verifier` written to `sessionStorage` on click | Present until callback exchange | 2026-05-09T19:51:05Z |
| 61 | 01 | TC-D-002 | OIDC `code_verifier` cleared after successful token exchange | Removed from sessionStorage | 2026-05-09T19:52:28Z |
| 62 | 01 | TC-D-003 | No persistent identifiers (PII, tokens) written to localStorage | Confirmed | 2026-05-09T19:54:48Z |
| 63 | 01 | TC-D-004 | Reload before completing OIDC redirect | Code verifier preserved; flow resumable | 2026-05-09T19:56:13Z |
| 64 | 01 | TC-D-005 | After successful sign-in, refresh token (if used) stored only as httpOnly cookie | Confirmed via DevTools | 2026-05-09T19:57:38Z |
| 65 | 01 | TC-P-001 | Cold load LCP on simulated 4G (Lighthouse) | <= 2.5 s (L2-019 §1) | 2026-05-09T20:00:46Z |
| 66 | 01 | TC-P-002 | Initial JS payload split — onboarding chunk does not pull in dashboard code | Confirmed via bundle analyzer | 2026-05-09T20:03:17Z |
| 67 | 01 | TC-P-003 | TBT under interaction | <= 200 ms | 2026-05-09T20:04:55Z |
| 68 | 02 | TC-V-001 | Greeting ("Good morning, {name}") | Inter 32/28/22 (desktop/tablet/mobile), weight 500 | 2026-05-09T20:09:26Z |
| 69 | 02 | TC-V-002 | Section labels ("Today", "Recent rewards", "Live a goal") | Inter 18 px, weight 500 | 2026-05-09T20:12:43Z |
| 70 | 02 | TC-V-003 | Stat numbers (e.g., "12", "3 / 6", "Lvl 8", "87%") | Inter 28–32 px, weight 600 or 500 | 2026-05-09T20:14:20Z |
| 71 | 02 | TC-V-004 | Goal/reward card titles | Inter 14 px, weight 500 | 2026-05-09T20:20:44Z |
| 72 | 02 | TC-V-005 | Card subtitles / metadata | Inter 12–13 px, weight 400 | 2026-05-09T20:23:44Z |
| 73 | 02 | TC-V-006 | Streak label "Trophy" / streak count | Inter 13 px, weight 500–600 | 2026-05-09T20:26:44Z |
| 74 | 02 | TC-V-007 | Bar-chart axis text | Inter 11 px, weight 400 | 2026-05-09T20:29:09Z |
| 75 | 02 | TC-C-001 | Page background | `#F1F5ED` (surface-container-low) | 2026-05-09T20:31:16Z |
| 76 | 02 | TC-C-002 | Bar-chart bars | `#006D3F` (primary) | 2026-05-09T20:32:31Z |
| 77 | 02 | TC-C-003 | Streak card background | `#FFDCC4` (streak-container) | 2026-05-09T20:34:27Z |
| 78 | 02 | TC-C-004 | Streak icon/text | `#E76A0C` (streak) | 2026-05-09T20:36:18Z |
| 79 | 02 | TC-C-005 | Reward card background | `#FFD7EE` (reward-container) | 2026-05-09T20:38:08Z |
| 80 | 02 | TC-C-006 | Reward accent | `#9B2680` (reward) | 2026-05-09T20:39:47Z |
| 81 | 02 | TC-C-007 | Success/level cards | `#94F7B4` background, `#00210F` text | 2026-05-09T20:41:32Z |
| 82 | 02 | TC-C-008 | "Add" / "Log activity" primary CTA | `#006D3F` background, white label | 2026-05-09T20:45:41Z |
| 83 | 02 | TC-C-009 | Card outline (when outlined variant) | `#C2C9BE` (outline-variant), 1 px | 2026-05-09T20:48:12Z |
| 84 | 02 | TC-C-010 | Color contrast — all text | WCAG AA 4.5:1 / 3:1 | 2026-05-09T20:52:33Z |
| 85 | 02 | TC-L-001 | Page padding — mobile/tablet/desktop | 16 / 24 / 32 px | 2026-05-09T20:57:18Z |
| 86 | 02 | TC-L-002 | Card corner radius | 16 px (xl) | 2026-05-09T20:59:03Z |
| 87 | 02 | TC-L-003 | Card padding | 20 px | 2026-05-09T21:01:59Z |
| 88 | 02 | TC-L-004 | Inter-card gap (within section) | 12–16 px | 2026-05-09T21:03:20Z |
| 89 | 02 | TC-L-005 | Bar-chart bar gap | 4 px | 2026-05-09T21:04:47Z |
| 90 | 02 | TC-L-006 | Section vertical rhythm | 24 px between sections | 2026-05-09T21:06:05Z |
| 91 | 02 | TC-L-007 | Avatar size — header | 32 / 40 / 48 px | 2026-05-09T21:08:54Z |
| 92 | 02 | TC-L-008 | Mobile shows single-column stack | confirmed | 2026-05-09T21:10:16Z |
| 93 | 02 | TC-L-009 | Tablet shows 1–2 columns where space allows | confirmed | 2026-05-09T21:11:32Z |
| 94 | 02 | TC-L-010 | Desktop shows main + side panel grid | confirmed; main bounded by max content width | 2026-05-09T21:12:52Z |
| 95 | 02 | TC-R-001 | 360 px viewport | Single-column; bottom nav visible | 2026-05-09T21:14:20Z |
| 96 | 02 | TC-R-002 | 768 px viewport | Two columns where appropriate; rail variant | 2026-05-09T21:15:33Z |
| 97 | 02 | TC-R-003 | 1200 px viewport | Drawer variant visible; bottom nav and rail hidden | 2026-05-09T21:16:44Z |
| 98 | 02 | TC-R-004 | 1440 px viewport | Drawer + side panel; main `<main>` `max-width <= 1152 px` | 2026-05-09T21:18:03Z |
| 99 | 02 | TC-R-005 | Resize from 1024 to 1440 | Smooth re-layout, no flicker | 2026-05-09T21:19:19Z |
| 100 | 02 | TC-R-006 | Print stylesheet | Page is readable in print preview (no nav chrome) | 2026-05-09T21:21:23Z |
| 101 | 02 | TC-F-001 | Greeting reflects current time-of-day in user TZ | morning <12, afternoon <17, evening <22, night otherwise | 2026-05-09T21:24:01Z |
| 102 | 02 | TC-F-002 | Greeting uses user's display name | from profile (L2-014) | 2026-05-09T21:27:00Z |
| 103 | 02 | TC-F-003 | Today section sums activity for the current cadence period only | matches API totals | 2026-05-09T21:29:56Z |
| 104 | 02 | TC-F-004 | Streak chip on goal card shows current streak | matches L2-007 computation | 2026-05-09T21:31:20Z |
| 105 | 02 | TC-F-005 | Recent rewards card shows up to 3 most-recent earned rewards | newest first, with date earned | 2026-05-09T21:33:19Z |
| 106 | 02 | TC-F-006 | Click goal card | Navigates to `/goals/{id}` (L2-002 §3) | 2026-05-09T21:36:11Z |
| 107 | 02 | TC-F-007 | Click "Log activity" CTA on goal card | Opens log activity flow for that goal | 2026-05-09T21:38:16Z |
| 108 | 02 | TC-F-008 | Click "New goal" CTA | Navigates to create-goal flow | 2026-05-09T21:41:15Z |
| 109 | 02 | TC-F-009 | Click reward in "Recent rewards" | Navigates to `/rewards/{id}` | 2026-05-09T21:44:30Z |
| 110 | 02 | TC-F-010 | Dashboard shows only this user's data — switching accounts clears prior data | confirmed | 2026-05-09T21:46:29Z |
| 111 | 02 | TC-F-011 | Empty state — no goals yet | Shows onboarding CTA card (mobile/tablet/desktop) | 2026-05-09T21:49:14Z |
| 112 | 02 | TC-F-012 | Empty state — goals but zero activity today | Shows "log your first activity" prompt | 2026-05-09T21:51:41Z |
| 113 | 02 | TC-F-013 | Admin role chip / admin link visible only when user has Admin role (L2-015) | confirmed | 2026-05-09T21:54:50Z |
| 114 | 02 | TC-F-014 | API failure on dashboard load | Shows error state with retry, does not crash | 2026-05-09T21:58:07Z |
| 115 | 02 | TC-B-001 | Tab order: greeting -> today metrics -> goals list -> rewards -> nav | Logical | 2026-05-09T22:00:25Z |
| 116 | 02 | TC-B-002 | Cards have visible focus rings | Yes | 2026-05-09T22:02:46Z |
| 117 | 02 | TC-B-003 | Bar chart has accessible `<svg role="img">` with summary text | Yes | 2026-05-09T22:04:10Z |
| 118 | 02 | TC-B-004 | Hover/focus state on cards | Subtle elevation or state-layer | 2026-05-09T22:06:27Z |
| 119 | 02 | TC-B-005 | Pull-to-refresh (mobile, optional) | Reloads dashboard data | 2026-05-09T22:08:06Z |
| 120 | 02 | TC-B-006 | Reduced-motion preference | No bar entrance animation | 2026-05-09T22:09:51Z |
| 121 | 02 | TC-A-001 | Greeting rendered as `<h1>` | Yes | 2026-05-09T22:11:09Z |
| 122 | 02 | TC-A-002 | Sections wrapped in `<section aria-labelledby=...>` | Yes | 2026-05-09T22:14:45Z |
| 123 | 02 | TC-A-003 | Bar chart exposes data via accessible name or table summary | Yes | 2026-05-09T22:16:55Z |
| 124 | 02 | TC-A-004 | Icon-only "Add" button has `aria-label="New goal"` | Yes | 2026-05-09T22:18:09Z |
| 125 | 02 | TC-A-005 | Streak chip text is not the sole conveyor of meaning (color + icon + label) | Yes | 2026-05-09T22:19:25Z |
| 126 | 02 | TC-A-006 | axe-core scan | 0 critical / serious | 2026-05-09T22:22:30Z |
| 127 | 02 | TC-D-001 | Logging an activity from elsewhere then returning to dashboard | New totals visible after refetch (cache-bust or revalidate) | 2026-05-09T22:23:58Z |
| 128 | 02 | TC-D-002 | Earning a reward | Surfaces on next dashboard load (L2-010 §2) | 2026-05-09T22:26:14Z |
| 129 | 02 | TC-D-003 | Sign out then sign in as different user | Old user's data is purged from in-memory store and cache | 2026-05-09T22:27:42Z |
| 130 | 02 | TC-D-004 | Cadence rollover — daily goal at local midnight | "Today" totals reset (L2-011 §1) | 2026-05-09T22:29:06Z |
| 131 | 02 | TC-D-005 | Network offline | Last cached snapshot shown with offline banner (no stale write attempts) | 2026-05-09T22:32:11Z |
| 132 | 02 | TC-P-001 | Dashboard initial render uses route-level chunk only | yes (L2-019 §2) | 2026-05-09T22:34:29Z |
| 133 | 02 | TC-P-002 | API call to `/dashboard/summary` — p95 server time | <= 300 ms (L2-018 §1) | 2026-05-09T22:36:03Z |
| 134 | 02 | TC-P-003 | TBT under typical interactions | <= 200 ms | 2026-05-09T22:37:48Z |
| 135 | 03 | TC-V-001 | Page title "Goals" | Inter 32 px desktop / 22 px mobile, weight 500 | 2026-05-09T22:40:45Z |
| 136 | 03 | TC-V-002 | Subtitle ("5 active goals · 4 streaks running") | Inter 13 px, weight 400 | 2026-05-09T22:43:02Z |
| 137 | 03 | TC-V-003 | Filter chip labels | Inter 13 px, weight 500 | 2026-05-09T22:45:53Z |
| 138 | 03 | TC-V-004 | Goal card title | Inter 14 px, weight 500 | 2026-05-09T22:47:11Z |
| 139 | 03 | TC-V-005 | Goal card metadata (cadence, streak, target) | Inter 12 px, weight 400 | 2026-05-09T22:52:40Z |
| 140 | 03 | TC-V-006 | "New goal" button label | Inter 14 px, weight 500, white | 2026-05-09T23:05:03Z |
| 141 | 03 | TC-V-007 | Empty state heading | Inter 22 px, weight 500 | 2026-05-09T23:10:35Z |
| 142 | 03 | TC-V-008 | Form field labels | Inter 13 px, weight 500 | 2026-05-09T23:13:55Z |
| 143 | 03 | TC-V-009 | Form helper text | Inter 12 px, weight 400 | 2026-05-09T23:16:41Z |
| 144 | 03 | TC-C-001 | Page background | `#F1F5ED` (surface-container-low) | 2026-05-09T23:19:18Z |
| 145 | 03 | TC-C-002 | Top bar background | `#F7FBF3` (surface) | 2026-05-09T23:22:19Z |
| 146 | 03 | TC-C-003 | Active filter chip | `#D2E8D4` background, `#0C1F13` label | 2026-05-09T23:24:42Z |
| 147 | 03 | TC-C-004 | Inactive filter chip | transparent fill, `#C2C9BE` 1 px outline, `#191D17` label | 2026-05-09T23:26:51Z |
| 148 | 03 | TC-C-005 | Goal card background (default) | `#EBEFE7` (surface-container) | 2026-05-09T23:29:06Z |
| 149 | 03 | TC-C-006 | Highlighted "ready" card | `#94F7B4` (primary container) | 2026-05-09T23:33:07Z |
| 150 | 03 | TC-C-007 | Goal card icon backgrounds rotate through container palette | green / blue / orange / pink containers | 2026-05-09T23:36:24Z |
| 151 | 03 | TC-C-008 | Progress bar fill | `#006D3F` | 2026-05-09T23:38:53Z |
| 152 | 03 | TC-C-009 | Progress bar track | `#E5E9E2` | 2026-05-09T23:41:18Z |
| 153 | 03 | TC-C-010 | Primary "New goal" button | `#006D3F` bg, `#FFFFFF` label | 2026-05-09T23:42:10Z |
| 154 | 03 | TC-C-011 | Destructive "Delete" button | `#BA1A1A` bg in confirm dialog, `#FFFFFF` label | 2026-05-09T23:45:02Z |
| 155 | 03 | TC-L-001 | Top bar height — desktop/tablet/mobile | 80 / 80 / 64 px | 2026-05-09T23:50:34Z |
| 156 | 03 | TC-L-002 | Top bar horizontal padding | 32 / 32 / 8 px | 2026-05-09T23:53:00Z |
| 157 | 03 | TC-L-003 | Filter row gap between chips | 8 px | 2026-05-09T23:56:28Z |
| 158 | 03 | TC-L-004 | Filter chip height | 32 px (mobile), 36 px (tablet/desktop) | 2026-05-10T00:00:40Z |
| 159 | 03 | TC-L-005 | Goal card corner radius | 16 px | 2026-05-10T00:01:42Z |
| 160 | 03 | TC-L-006 | Goal card padding | 12 px (mobile), 20 px (tablet/desktop) | 2026-05-10T00:05:50Z |
| 161 | 03 | TC-L-007 | Goal card icon container size | 40 px square, 9999 corner radius | 2026-05-10T00:09:16Z |
| 162 | 03 | TC-L-008 | List inter-row gap (mobile) | 8 px | 2026-05-10T00:12:47Z |
| 163 | 03 | TC-L-009 | Grid columns (desktop) | 3 cards across; gap 16 px | 2026-05-10T00:13:43Z |
| 164 | 03 | TC-L-010 | Floating action button (mobile) | 56 px, bottom-right with 24 px inset | 2026-05-10T00:18:00Z |
| 165 | 03 | TC-L-011 | Detail view — section spacing | 24 px between header / streak / activity history | 2026-05-10T00:19:09Z |
| 166 | 03 | TC-R-001 | 360 px | Single-column list; FAB visible | 2026-05-10T00:20:07Z |
| 167 | 03 | TC-R-002 | 768 px | Two-column grid; "New goal" pill in top bar | 2026-05-10T00:21:06Z |
| 168 | 03 | TC-R-003 | 1440 px | Three-column grid; max content width <= 1152 px | 2026-05-10T00:25:23Z |
| 169 | 03 | TC-R-004 | Filter row scrolls horizontally on mobile if overflowing | yes, no clipping | 2026-05-10T00:26:24Z |
| 170 | 03 | TC-R-005 | Long goal names truncate at 1 line on cards | ellipsis + accessible full name on hover/focus | 2026-05-10T00:35:28Z |
| 171 | 03 | TC-R-006 | Detail view streaks row stays readable at <576 px | no horizontal scroll (L2-008 §3) | 2026-05-10T00:36:38Z |
| 172 | 03 | TC-F-001 | List shows only goals owned by current user | per L2-002 §1 | 2026-05-10T00:37:42Z |
| 173 | 03 | TC-F-002 | Searching filters by name (case-insensitive substring) | Yes | 2026-05-10T00:42:31Z |
| 174 | 03 | TC-F-003 | Filter chip "All" shows count of total goals | matches list size | 2026-05-10T00:47:17Z |
| 175 | 03 | TC-F-004 | Filter chip "Daily" shows count of daily-cadence goals | counts match | 2026-05-10T00:51:46Z |
| 176 | 03 | TC-F-005 | Filter chip "Hourly/Weekly/Monthly" similarly accurate | yes | 2026-05-10T00:52:55Z |
| 177 | 03 | TC-F-006 | Sort: Streak length | descending current streak; tiebreak alphabetical | 2026-05-10T00:58:03Z |
| 178 | 03 | TC-F-007 | Sort: Recently active | descending last-activity timestamp | 2026-05-10T01:03:43Z |
| 179 | 03 | TC-F-008 | Sort: Name | ascending | 2026-05-10T01:05:02Z |
| 180 | 03 | TC-F-009 | Empty state — 0 goals | Shows onboarding card with "Create your first goal" CTA | 2026-05-10T01:06:08Z |
| 181 | 03 | TC-F-010 | Click on a goal card | Navigates to `/goals/{id}` | 2026-05-10T01:07:19Z |
| 182 | 03 | TC-F-011 | Streak chip on card matches L2-007 computation | Yes | 2026-05-10T01:09:08Z |
| 183 | 03 | TC-F-101 | Create goal — required field name empty | Form blocks submit; inline error (L2-001 §2) | 2026-05-10T01:11:07Z |
| 184 | 03 | TC-F-102 | Create goal — non-positive target | Inline error; not persisted (L2-001 §3) | 2026-05-10T01:12:28Z |
| 185 | 03 | TC-F-103 | Create daily goal — happy path | Persisted; appears at top of list within 500 ms | 2026-05-10T01:19:46Z |
| 186 | 03 | TC-F-104 | Create hourly / weekly / monthly | Persisted with correct cadence (L2-011) | 2026-05-10T01:25:03Z |
| 187 | 03 | TC-F-105 | Create custom cadence "every 3 days" | Persisted; period boundaries from start date in 3-day increments (L2-012 §1) | 2026-05-10T01:26:07Z |
| 188 | 03 | TC-F-106 | Custom cadence with N <= 0 | Validation error (L2-012 §2) | 2026-05-10T01:27:19Z |
| 189 | 03 | TC-F-107 | Edit goal — change cadence from daily to weekly | Streak windows recomputed forward; historical entries unchanged (L2-003 §3) | 2026-05-10T01:28:36Z |
| 190 | 03 | TC-F-108 | Edit goal owned by another user via crafted request | 403 / 404 (L2-003 §2) | null |
| 191 | 03 | TC-F-109 | Save while offline | Disabled or queued with offline indicator | null |
| 192 | 03 | TC-F-201 | Click delete | Confirmation dialog appears (L2-004 §3) | null |
| 193 | 03 | TC-F-202 | Cancel confirmation | Goal preserved | null |
| 194 | 03 | TC-F-203 | Confirm delete | Goal + activity entries + linked rewards removed from view (L2-004 §1) | null |
| 195 | 03 | TC-F-204 | Attempt to delete via crafted API request not owned | 403 / 404 (L2-004 §2) | null |
| 196 | 03 | TC-B-001 | Tab order: search -> filter chips -> sort -> list cards -> FAB | Logical | null |
| 197 | 03 | TC-B-002 | Enter activates focused chip / card / button | Yes | null |
| 198 | 03 | TC-B-003 | Form fields show focus ring at >=3:1 contrast | Yes | null |
| 199 | 03 | TC-B-004 | Submitting form with Enter from any field | Triggers submit | null |
| 200 | 03 | TC-B-005 | Optimistic UI on create | Card appears immediately; rolls back on API failure with toast | null |
| 201 | 03 | TC-B-006 | Streak count animates only when not in reduced-motion mode | Yes | null |
| 202 | 03 | TC-A-001 | Goal card is a single accessible link/button | Yes (no nested clickable controls) | null |
| 203 | 03 | TC-A-002 | Filter chips expose `role="tab"` or `aria-pressed` accurately | Yes | null |
| 204 | 03 | TC-A-003 | Form fields have `<label>` associations | Yes | null |
| 205 | 03 | TC-A-004 | Validation errors associated via `aria-describedby` | Yes | null |
| 206 | 03 | TC-A-005 | Delete confirmation is a focus-trapping `<dialog>` | Yes | null |
| 207 | 03 | TC-A-006 | axe-core | 0 critical/serious | null |
| 208 | 03 | TC-D-001 | Created goal survives reload | Yes (server-persisted) | null |
| 209 | 03 | TC-D-002 | Edit survives reload | Yes | null |
| 210 | 03 | TC-D-003 | Deleted goal does not reappear after reload | Yes | null |
| 211 | 03 | TC-D-004 | Sign out + sign in same user | Same goals visible | null |
| 212 | 03 | TC-D-005 | Sign in as different user | Other user's goals not visible | null |
| 213 | 03 | TC-D-006 | Cadence rollover at local midnight (daily) | Period totals reset; streak preserved (L2-011 §1) | null |
| 214 | 03 | TC-D-007 | Concurrent edit (two tabs) | Last-write-wins or server reports stale-version error; UI reconciles | null |
| 215 | 03 | TC-P-001 | Read 100 goals — p95 server time | <= 300 ms (L2-018 §1) | null |
| 216 | 03 | TC-P-002 | Create / update — p95 | <= 500 ms (L2-018 §2) | null |
| 217 | 03 | TC-P-003 | Goals route lazy-loaded | confirmed via bundle analyzer (L2-019 §2) | null |
| 218 | 04 | TC-V-001 | Sheet/dialog title ("Log activity", "New goal") | Inter 22 px, weight 500 | null |
| 219 | 04 | TC-V-002 | Field labels | Inter 13 px, weight 500 | null |
| 220 | 04 | TC-V-003 | Input text | Inter 14 px, weight 400 | null |
| 221 | 04 | TC-V-004 | Helper text / unit suffix | Inter 12 px, weight 400 | null |
| 222 | 04 | TC-V-005 | Submit button label | Inter 14 px, weight 500, white | null |
| 223 | 04 | TC-V-006 | Validation error text | Inter 12 px, weight 500, error color | null |
| 224 | 04 | TC-V-007 | Section group label ("Cadence", "Reminder") | Inter 13 px, weight 600, letter-spacing 0.5 px | null |
| 225 | 04 | TC-C-001 | Sheet/dialog surface | `#F7FBF3` (surface) | null |
| 226 | 04 | TC-C-002 | Field outline (default) | `#C2C9BE` (outline-variant), 1 px | null |
| 227 | 04 | TC-C-003 | Field outline (focused) | `#006D3F` (primary), 2 px | null |
| 228 | 04 | TC-C-004 | Field outline (error) | `#BA1A1A` (error), 2 px | null |
| 229 | 04 | TC-C-005 | Cadence segmented selected | `#94F7B4` background, `#00210F` label | null |
| 230 | 04 | TC-C-006 | Cadence segmented unselected | transparent fill, outline 1 px, `#191D17` label | null |
| 231 | 04 | TC-C-007 | Switch on color | `#006D3F` track, `#FFFFFF` thumb | null |
| 232 | 04 | TC-C-008 | Submit button | `#006D3F` bg, white label | null |
| 233 | 04 | TC-C-009 | Mobile sheet handle | `#C2C9BE`, 4 px tall, 32 px wide | null |
| 234 | 04 | TC-C-010 | Backdrop scrim (when modal) | `#0000007A` | null |
| 235 | 04 | TC-L-001 | Mobile bottom sheet corner radius | 28 px top, 0 bottom | null |
| 236 | 04 | TC-L-002 | Mobile sheet padding | 24 px horizontal, 16 px top, 24 px bottom (above safe-area inset) | null |
| 237 | 04 | TC-L-003 | Tablet form padding | 32 px | null |
| 238 | 04 | TC-L-004 | Field height | 56 px | null |
| 239 | 04 | TC-L-005 | Inter-field vertical gap | 16 px | null |
| 240 | 04 | TC-L-006 | Section vertical gap | 24 px | null |
| 241 | 04 | TC-L-007 | Cadence segmented control height | 40 px; corner radius 9999 | null |
| 242 | 04 | TC-L-008 | Submit button height | 48 px (mobile) / 56 px (tablet/desktop) | null |
| 243 | 04 | TC-L-009 | Submit button width | full width on mobile / right-aligned on tablet/desktop | null |
| 244 | 04 | TC-L-010 | Dialog max width on desktop | 720 px; centered with max content max-width respected | null |
| 245 | 04 | TC-R-001 | 360 px | Bottom sheet slides up from below; takes ~75% of viewport height; drag handle visible | null |
| 246 | 04 | TC-R-002 | 768 px | Full-page form layout; nav rail still visible | null |
| 247 | 04 | TC-R-003 | 1200 px | Centered dialog with backdrop; form re-uses tablet styling | null |
| 248 | 04 | TC-R-004 | Resize from mobile to tablet while open | Component swaps from sheet to dialog without losing form state | null |
| 249 | 04 | TC-R-005 | Soft keyboard on mobile | Sheet content scrolls; submit button stays visible above keyboard | null |
| 250 | 04 | TC-R-006 | Long content (e.g., notes textarea grows) | Sheet remains scrollable; submit pinned to bottom | null |
| 251 | 04 | TC-F-001 | Log a positive quantity for a daily goal | Persisted; appears in goal's activity history (L2-005 §1) | null |
| 252 | 04 | TC-F-002 | Log a quantity of 0 | Allowed (counts as "checked in") OR rejected per design — confirm with spec; current expectation: rejected | null |
| 253 | 04 | TC-F-003 | Log a negative quantity | Validation error (L2-001 §3 / L2-016) | null |
| 254 | 04 | TC-F-004 | Log activity with future timestamp beyond cadence window | Validation error (L2-005 §2) | null |
| 255 | 04 | TC-F-005 | Log activity with optional note (1–500 chars) | Persisted | null |
| 256 | 04 | TC-F-006 | Note exceeding 500 chars | Validation error | null |
| 257 | 04 | TC-F-007 | Log against a goal owned by another user (crafted request) | 403 / 404 (L2-005 §3) | null |
| 258 | 04 | TC-F-008 | After successful log, streak recomputed | L2-007 satisfied; UI reflects new current streak | null |
| 259 | 04 | TC-F-009 | Successful submit closes sheet/dialog and shows toast | Yes | null |
| 260 | 04 | TC-F-010 | Edit existing activity entry | Persists; recomputes streak (L2-006 §1) | null |
| 261 | 04 | TC-F-011 | Delete existing activity entry | Persists; recomputes streak (L2-006 §2) | null |
| 262 | 04 | TC-F-012 | Edit/delete another user's entry via crafted request | 403 / 404 (L2-006 §3) | null |
| 263 | 04 | TC-F-101 | Empty name | Validation error (L2-001 §2) | null |
| 264 | 04 | TC-F-102 | Non-positive target | Validation error (L2-001 §3) | null |
| 265 | 04 | TC-F-103 | Cadence Daily — happy path | Persisted; appears in list with streak 0 | null |
| 266 | 04 | TC-F-104 | Cadence Hourly | Persisted; period rolls at top of next hour (L2-011 §4) | null |
| 267 | 04 | TC-F-105 | Cadence Weekly with week-start = Monday | Persisted; rollover at next Monday (L2-011 §2) | null |
| 268 | 04 | TC-F-106 | Cadence Monthly | Persisted; rollover on first of next month (L2-011 §3) | null |
| 269 | 04 | TC-F-107 | Custom cadence "every 3 days" | Persisted with start date; period boundaries 3-day increments (L2-012 §1) | null |
| 270 | 04 | TC-F-108 | Custom cadence N=0 | Validation error (L2-012 §2) | null |
| 271 | 04 | TC-F-109 | Submit while unauthenticated (token expired) | 401; client routes to re-auth (L2-013 §4) | null |
| 272 | 04 | TC-B-001 | Open log sheet via FAB | Slide-up animation 200 ms; respects reduced-motion | null |
| 273 | 04 | TC-B-002 | Backdrop click closes sheet (no unsaved changes) | Yes | null |
| 274 | 04 | TC-B-003 | Backdrop click with unsaved changes | Confirmation dialog ("Discard?") | null |
| 275 | 04 | TC-B-004 | Esc closes dialog (desktop) | Yes | null |
| 276 | 04 | TC-B-005 | Focus moves into first form field on open | Yes | null |
| 277 | 04 | TC-B-006 | Focus returns to FAB / trigger on close | Yes | null |
| 278 | 04 | TC-B-007 | Tab cycles within dialog (focus trap) | Yes | null |
| 279 | 04 | TC-B-008 | Submit button shows loading spinner during in-flight call | Yes; disabled until done | null |
| 280 | 04 | TC-B-009 | Double-click submit | Only one create / log POST emitted | null |
| 281 | 04 | TC-B-010 | Drag handle on mobile sheet supports swipe-to-dismiss | Yes | null |
| 282 | 04 | TC-A-001 | Sheet exposes `role="dialog"` with `aria-modal="true"` | Yes | null |
| 283 | 04 | TC-A-002 | Title programmatically associated via `aria-labelledby` | Yes | null |
| 284 | 04 | TC-A-003 | Each input has visible label and matching `<label for>` | Yes | null |
| 285 | 04 | TC-A-004 | Inline errors announced via `aria-live="polite"` | Yes | null |
| 286 | 04 | TC-A-005 | Submit button announces loading state via `aria-busy` | Yes | null |
| 287 | 04 | TC-A-006 | Sheet handle has `aria-label="Drag to close"` (or button alternative) | Yes | null |
| 288 | 04 | TC-A-007 | axe-core | 0 critical / serious | null |
| 289 | 04 | TC-D-001 | Logged activity survives reload | Yes (server-persisted) | null |
| 290 | 04 | TC-D-002 | Created goal survives reload | Yes | null |
| 291 | 04 | TC-D-003 | Logged note text round-trips exactly (incl. unicode, newlines) | Yes | null |
| 292 | 04 | TC-D-004 | Quantity decimal precision preserved (per goal unit definition) | Yes | null |
| 293 | 04 | TC-D-005 | Network failure mid-submit | Form remains open with values preserved; retry works | null |
| 294 | 04 | TC-D-006 | Concurrent log from another device | Second log succeeds; streak recomputed deterministically | null |
| 295 | 04 | TC-S-001 | XSS payload in goal name / note | Escaped on render (L2-016 §3) | null |
| 296 | 04 | TC-S-002 | SQL-injection-shaped input | Rejected/escaped; parameterized query (L2-016 §2) | null |
| 297 | 04 | TC-S-003 | CSRF token attached to mutating request | Yes (L2-016 §4) | null |
| 298 | 04 | TC-S-004 | No tokens or code verifiers logged | Confirmed (L2-013 §3, L2-022) | null |
| 299 | 04 | TC-P-001 | Sheet opens within 100 ms of FAB tap | Yes | null |
| 300 | 04 | TC-P-002 | Submit p95 server time | <= 500 ms (L2-018 §2) | null |
| 301 | 05 | TC-V-001 | Page title "Rewards" | Inter 32 px desktop / 22 px mobile, weight 500 | null |
| 302 | 05 | TC-V-002 | Hero "READY TO CLAIM" eyebrow | Inter 11 px, weight 600, letter-spacing 1.5 px, uppercase | null |
| 303 | 05 | TC-V-003 | Hero reward title | Inter 36 px desktop, weight 500 | null |
| 304 | 05 | TC-V-004 | Hero description | Inter 16 px, weight 400, line-height 1.5 | null |
| 305 | 05 | TC-V-005 | Section labels ("In progress", "Locked") | Inter 18 px, weight 500 | null |
| 306 | 05 | TC-V-006 | Reward card title | Inter 14 px, weight 500 | null |
| 307 | 05 | TC-V-007 | Progress text ("6 of 10") | Inter 13 px, weight 600 | null |
| 308 | 05 | TC-V-008 | "New reward" button | Inter 14 px, weight 500, white | null |
| 309 | 05 | TC-C-001 | Hero background — ready-to-claim | `#FFD7EE` (reward-container) | null |
| 310 | 05 | TC-C-002 | Hero icon container | `#9B2680` (reward) bg, white icon | null |
| 311 | 05 | TC-C-003 | Hero primary CTA "Claim" | `#9B2680` bg, white label | null |
| 312 | 05 | TC-C-004 | Hero secondary CTA | transparent bg, `#C2C9BE` outline | null |
| 313 | 05 | TC-C-005 | In-progress card | `#EBEFE7` bg | null |
| 314 | 05 | TC-C-006 | Locked card | `#EBEFE7` bg with opacity 0.65 | null |
| 315 | 05 | TC-C-007 | Progress bar fill | `#006D3F` | null |
| 316 | 05 | TC-C-008 | Progress bar track | `#E5E9E2` | null |
| 317 | 05 | TC-C-009 | Earned reward chip | `#94F7B4` bg, `#00210F` label | null |
| 318 | 05 | TC-C-010 | Page background | `#F1F5ED` | null |
| 319 | 05 | TC-L-001 | Hero corner radius | 24 px | null |
| 320 | 05 | TC-L-002 | Hero padding | 32 px | null |
| 321 | 05 | TC-L-003 | Hero icon size | 120 px square, 9999 corner radius | null |
| 322 | 05 | TC-L-004 | Hero shadow | offset y=2, blur 8, color `#00000026` | null |
| 323 | 05 | TC-L-005 | Reward grid columns — desktop/tablet/mobile | 3 / 2 / 1 | null |
| 324 | 05 | TC-L-006 | Card corner radius | 16 px | null |
| 325 | 05 | TC-L-007 | Card padding | 20 px | null |
| 326 | 05 | TC-L-008 | Inter-card gap | 16 px | null |
| 327 | 05 | TC-L-009 | Page padding desktop / tablet / mobile | 32 / 24 / 16 px | null |
| 328 | 05 | TC-L-010 | Top bar height | 80 px | null |
| 329 | 05 | TC-R-001 | 360 px | Single column; hero stacks icon-then-text vertically | null |
| 330 | 05 | TC-R-002 | 768 px | Two-column grid; hero side-by-side icon + text | null |
| 331 | 05 | TC-R-003 | 1440 px | Three-column grid; bounded by max content width | null |
| 332 | 05 | TC-R-004 | Hero CTA buttons stack on mobile | 12 px gap | null |
| 333 | 05 | TC-R-005 | Locked cards still legible at smallest viewport | Yes | null |
| 334 | 05 | TC-F-001 | List shows only the current user's rewards | Yes (ownership scoping) | null |
| 335 | 05 | TC-F-002 | Earned rewards visually distinguished from pending | Distinct accent + earned date displayed (L2-010 §2) | null |
| 336 | 05 | TC-F-003 | Counts in subtitle accurate ("1 ready · 2 in progress · 3 locked") | Sums match list | null |
| 337 | 05 | TC-F-004 | Click "Claim" on ready-to-claim hero | Marks the reward as claimed; appears in earned section with claimed timestamp | null |
| 338 | 05 | TC-F-005 | Streak resets after a reward was earned | Earned reward remains earned (L2-010 §3) | null |
| 339 | 05 | TC-F-006 | Filter / tabs by state (ready, in-progress, locked, earned) | Counts and grids match | null |
| 340 | 05 | TC-F-007 | Click reward card | Navigates to `/rewards/{id}` detail | null |
| 341 | 05 | TC-F-101 | Create reward — name + description + qualifying condition (goal + streak threshold) | Persisted, linked to goal (L2-009 §1) | null |
| 342 | 05 | TC-F-102 | Create reward without qualifying condition | Validation error (L2-009 §2) | null |
| 343 | 05 | TC-F-103 | Attempt to attach reward to a goal not owned by user | Rejected (L2-009 §3) | null |
| 344 | 05 | TC-F-104 | Edit reward name / description | Persisted | null |
| 345 | 05 | TC-F-105 | Delete reward | Removed; previously earned instances of it preserved as user history | null |
| 346 | 05 | TC-F-201 | User's streak reaches threshold mid-session | In-app notification fires (L2-010 §1) | null |
| 347 | 05 | TC-F-202 | Threshold reached while user offline | Notification queued; surfaces on next dashboard / rewards visit | null |
| 348 | 05 | TC-F-203 | Notification has accessible name and is dismissible | Yes | null |
| 349 | 05 | TC-B-001 | Tab order: top bar -> filter tabs -> hero -> grid -> CTA | Logical | null |
| 350 | 05 | TC-B-002 | Hero "Claim" button shows loading state | Yes; disabled until done | null |
| 351 | 05 | TC-B-003 | Reduced-motion preference | No celebratory animation | null |
| 352 | 05 | TC-B-004 | Hover state on cards | Subtle elevation | null |
| 353 | 05 | TC-A-001 | Hero is `<section aria-labelledby>` with title as `<h2>` | Yes | null |
| 354 | 05 | TC-A-002 | Earned/in-progress/locked state communicated via text and icon, not color alone | Yes | null |
| 355 | 05 | TC-A-003 | Progress bar exposes `role="progressbar"` with `aria-valuenow / valuemax` | Yes | null |
| 356 | 05 | TC-A-004 | "Claim" button has descriptive accessible name (`Claim "{reward name}"`) | Yes | null |
| 357 | 05 | TC-A-005 | axe-core | 0 critical / serious | null |
| 358 | 05 | TC-D-001 | Defined reward survives reload | Yes | null |
| 359 | 05 | TC-D-002 | Earned reward survives reload | Yes | null |
| 360 | 05 | TC-D-003 | Earned reward NOT revoked when streak later breaks | Yes (L2-010 §3) | null |
| 361 | 05 | TC-D-004 | Claimed timestamp recorded | Yes; displayed on detail view | null |
| 362 | 05 | TC-D-005 | Sign in as different user | Other users' rewards not visible | null |
| 363 | 05 | TC-P-001 | Read rewards list (up to 100) — p95 | <= 300 ms | null |
| 364 | 05 | TC-P-002 | Claim reward — p95 | <= 500 ms | null |
| 365 | 06 | TC-V-001 | Page title ("Stats", "Profile") | Inter 32 / 22 px (desktop / mobile), weight 500 | null |
| 366 | 06 | TC-V-002 | Stat headline numbers (e.g., "87%", "1,240", "Lvl 8") | Inter 32 px, weight 600 | null |
| 367 | 06 | TC-V-003 | Stat label | Inter 12 px, weight 500 | null |
| 368 | 06 | TC-V-004 | Section headings | Inter 18 px, weight 500 | null |
| 369 | 06 | TC-V-005 | Form field labels (email, display name) | Inter 13 px, weight 500 | null |
| 370 | 06 | TC-V-006 | Body / paragraph copy | Inter 14 px, weight 400, line-height 1.5 | null |
| 371 | 06 | TC-V-007 | Destructive button label ("Delete account") | Inter 14 px, weight 500 | null |
| 372 | 06 | TC-C-001 | Page background | `#F1F5ED` | null |
| 373 | 06 | TC-C-002 | Stat tile backgrounds (rotation) | success `#94F7B4`, streak `#FFDCC4`, info `#BEEAF6`, reward `#FFD7EE` | null |
| 374 | 06 | TC-C-003 | On-tile text colors | matching on-* token (e.g., `#00210F` on `#94F7B4`) | null |
| 375 | 06 | TC-C-004 | Activity bar chart bars | `#006D3F` | null |
| 376 | 06 | TC-C-005 | Activity bar chart axis labels | `#424940` (on surface variant) | null |
| 377 | 06 | TC-C-006 | Profile avatar background | `#94F7B4`; initial in `#00210F` | null |
| 378 | 06 | TC-C-007 | Profile primary action ("Save") | `#006D3F` bg, white label | null |
| 379 | 06 | TC-C-008 | Destructive ("Delete account") | `#BA1A1A` bg, white label | null |
| 380 | 06 | TC-C-009 | Form outline (default / focus / error) | `#C2C9BE` / `#006D3F` 2 px / `#BA1A1A` 2 px | null |
| 381 | 06 | TC-C-010 | Color contrast all text | WCAG AA | null |
| 382 | 06 | TC-L-001 | Stat tile grid — desktop/tablet/mobile | 5 / 3 / 2 columns | null |
| 383 | 06 | TC-L-002 | Stat tile corner radius | 16 px | null |
| 384 | 06 | TC-L-003 | Stat tile padding | 16 px | null |
| 385 | 06 | TC-L-004 | Bar-chart panel padding | 24 px | null |
| 386 | 06 | TC-L-005 | Profile form field height | 56 px | null |
| 387 | 06 | TC-L-006 | Profile form column max width | 480 px | null |
| 388 | 06 | TC-L-007 | Section vertical rhythm | 24 px | null |
| 389 | 06 | TC-L-008 | Avatar size — desktop | 48 px | null |
| 390 | 06 | TC-L-009 | Avatar size — mobile | 32 px | null |
| 391 | 06 | TC-L-010 | Page padding desktop / tablet / mobile | 32 / 24 / 16 px | null |
| 392 | 06 | TC-R-001 | 360 px | Stat tiles 2 columns; bar chart full width below | null |
| 393 | 06 | TC-R-002 | 768 px | Stat tiles 3 columns | null |
| 394 | 06 | TC-R-003 | 1440 px | Stat tiles 5 columns; profile right-rail or below per layout | null |
| 395 | 06 | TC-R-004 | Print stylesheet | Renders without nav chrome | null |
| 396 | 06 | TC-R-005 | Bar chart axis labels remain readable at 360 px | Yes (no overlap) | null |
| 397 | 06 | TC-F-001 | Active goals count matches API count | Yes | null |
| 398 | 06 | TC-F-002 | Total activity count over selected window matches sum of entries | Yes | null |
| 399 | 06 | TC-F-003 | Completion % = met-period-count / total-period-count for window | Matches L2-007 logic | null |
| 400 | 06 | TC-F-004 | Bar chart x-axis matches selected window (week / month / year) | Yes | null |
| 401 | 06 | TC-F-005 | Streak tile matches L2-007 current streak across user's longest active goal | Yes | null |
| 402 | 06 | TC-F-006 | Lvl tile derived from cumulative activity (deterministic formula) | Yes | null |
| 403 | 06 | TC-F-007 | Switching window selector | Tiles + chart re-fetch and update | null |
| 404 | 06 | TC-F-008 | Empty state — no activity | Stats show 0/0/0 with "log your first activity" prompt | null |
| 405 | 06 | TC-F-101 | View profile shows display name, email, avatar, member-since date | Yes | null |
| 406 | 06 | TC-F-102 | Edit display name — happy path | Persisted; reflected in dashboard greeting (L2-014 §1) | null |
| 407 | 06 | TC-F-103 | Edit email — when provider permits | Persisted; verification email sent if required | null |
| 408 | 06 | TC-F-104 | Edit email — when provider forbids | UI displays read-only with explanation | null |
| 409 | 06 | TC-F-105 | Cancel edit | Form reverts to last saved values | null |
| 410 | 06 | TC-F-106 | Submit empty display name | Validation error | null |
| 411 | 06 | TC-F-107 | Submit invalid email | Validation error (RFC 5321 / 5322 reasonable subset) | null |
| 412 | 06 | TC-F-201 | Click "Delete account" | Confirmation dialog with explicit warning + typed confirmation ("DELETE") | null |
| 413 | 06 | TC-F-202 | Cancel confirmation | No-op | null |
| 414 | 06 | TC-F-203 | Confirm deletion | Backend deletes/anonymizes data and revokes sessions (L2-014 §2) | null |
| 415 | 06 | TC-F-204 | Subsequent sign-in attempt with deleted account | Rejected (L2-014 §3) | null |
| 416 | 06 | TC-F-205 | RBAC: non-admin cannot delete other accounts | 403 (L2-015 §1) | null |
| 417 | 06 | TC-B-001 | Tab order: window selector -> stat tiles -> chart -> profile fields -> save -> destructive | Logical | null |
| 418 | 06 | TC-B-002 | Save button disabled until form is dirty AND valid | Yes | null |
| 419 | 06 | TC-B-003 | Save shows loading state during in-flight call | Yes | null |
| 420 | 06 | TC-B-004 | Delete dialog focus-traps and restores focus on close | Yes | null |
| 421 | 06 | TC-B-005 | Destructive button only enabled after typed confirmation | Yes | null |
| 422 | 06 | TC-B-006 | Reduced-motion | Bars do not animate; selector switch is instant | null |
| 423 | 06 | TC-A-001 | Page title rendered as `<h1>` | Yes | null |
| 424 | 06 | TC-A-002 | Stat tile values have visible label and accessible relationship (label + value grouped) | Yes | null |
| 425 | 06 | TC-A-003 | Bar chart has accessible summary (table fallback or `aria-label`) | Yes | null |
| 426 | 06 | TC-A-004 | Form fields use `<label for>` and announce errors via `aria-describedby` | Yes | null |
| 427 | 06 | TC-A-005 | Destructive action region uses `role="alertdialog"` with focus trap | Yes | null |
| 428 | 06 | TC-A-006 | axe-core | 0 critical / serious | null |
| 429 | 06 | TC-D-001 | Profile edit survives reload | Yes | null |
| 430 | 06 | TC-D-002 | After account deletion, no API endpoint reveals deleted user's data | Yes (L2-014 §2) | null |
| 431 | 06 | TC-D-003 | After account deletion, audit log records the deletion event with correlation ID | Yes (L2-022 §3) | null |
| 432 | 06 | TC-D-004 | Email is never logged at any level | Confirmed (L2-017 §3) | null |
| 433 | 06 | TC-D-005 | Auth tokens never written to localStorage; refresh tokens (if used) httpOnly cookie only | Confirmed (L2-013 §3) | null |
| 434 | 06 | TC-D-006 | Stats accurately reflect cadence rollovers across midnight / month boundaries (L2-011) | Yes | null |
| 435 | 06 | TC-P-001 | Stats summary endpoint p95 | <= 300 ms (L2-018 §1) | null |
| 436 | 06 | TC-P-002 | Profile update endpoint p95 | <= 500 ms (L2-018 §2) | null |
| 437 | 06 | TC-P-003 | Bar chart renders without layout shift (CLS ~ 0) | Yes | null |
| 438 | 07 | TC-V-001 | Title ("Welcome back.") font family | `Inter`, weight 500 | null |
| 439 | 07 | TC-V-002 | Title size — mobile | 28 px, line-height 1.2 | null |
| 440 | 07 | TC-V-003 | Title size — tablet | 36 px, line-height 1.2 | null |
| 441 | 07 | TC-V-004 | Title size — desktop hero panel | 57 px, line-height 1.1 | null |
| 442 | 07 | TC-V-005 | Subtitle font weight | 400 (normal) | null |
| 443 | 07 | TC-V-006 | Subtitle size — mobile/tablet/desktop | 14 / 16 / 16 px | null |
| 444 | 07 | TC-V-007 | Field label font | Inter 13 px, weight 500 | null |
| 445 | 07 | TC-V-008 | Field input text font | Inter 14 px, weight 400 | null |
| 446 | 07 | TC-V-009 | Helper / error text font | Inter 12 px, weight 500, error color | null |
| 447 | 07 | TC-V-010 | Primary button label ("Sign in") | Inter 14/16 px, weight 500, white | null |
| 448 | 07 | TC-V-011 | OIDC alternative button label | Inter 14/16 px, weight 500, on-surface | null |
| 449 | 07 | TC-V-012 | "or" divider label | Inter 11 px, weight 500, uppercase, letter-spacing 1.5 px | null |
| 450 | 07 | TC-V-013 | Sign-up link ("Get started") | Inter 13 px, weight 500, primary color, underlined | null |
| 451 | 07 | TC-V-014 | Brand wordmark visibility — desktop hero | Visible (Inter 22 px, weight 500) | null |
| 452 | 07 | TC-C-001 | Page background | `#F1F5ED` (surface-container-low) | null |
| 453 | 07 | TC-C-002 | Form card surface | `#F7FBF3` (surface) | null |
| 454 | 07 | TC-C-003 | Form card border | none on mobile, 1 px `#C2C9BE` on tablet+ when outlined | null |
| 455 | 07 | TC-C-004 | Title text color | `#191D17` (on surface) | null |
| 456 | 07 | TC-C-005 | Subtitle text color | `#424940` (on surface variant) | null |
| 457 | 07 | TC-C-006 | Field outline (default) | `#C2C9BE` (outline-variant), 1 px | null |
| 458 | 07 | TC-C-007 | Field outline (focused) | `#006D3F` (primary), 2 px | null |
| 459 | 07 | TC-C-008 | Field outline (error) | `#BA1A1A` (error), 2 px | null |
| 460 | 07 | TC-C-009 | Primary button background | `#006D3F` (primary) | null |
| 461 | 07 | TC-C-010 | Primary button label color | `#FFFFFF` | null |
| 462 | 07 | TC-C-011 | OIDC button border | `#C2C9BE` (outline-variant), 1 px; transparent fill | null |
| 463 | 07 | TC-C-012 | OIDC button label color | `#191D17` (on surface) | null |
| 464 | 07 | TC-C-013 | Inline error banner background | `#FFEDEA` (error container) | null |
| 465 | 07 | TC-C-014 | Inline error banner text | `#410002` (on error container) | null |
| 466 | 07 | TC-C-015 | Desktop hero panel background | `#94F7B4` (primary container) | null |
| 467 | 07 | TC-C-016 | Desktop hero text color | `#00210F` (on primary container) | null |
| 468 | 07 | TC-C-017 | Sign-up link color | `#006D3F` (primary) | null |
| 469 | 07 | TC-C-018 | Text/background contrast meets WCAG AA | >= 4.5:1 normal, >= 3:1 large | null |
| 470 | 07 | TC-L-001 | Mobile body padding | 24 px on all sides | null |
| 471 | 07 | TC-L-002 | Tablet body padding | 40 px top/bottom, 80 px left/right | null |
| 472 | 07 | TC-L-003 | Desktop split — hero ~50% / form ~50% | hero on left, form on right | null |
| 473 | 07 | TC-L-004 | Form card corner radius | 24 px | null |
| 474 | 07 | TC-L-005 | Form card max-width | 440 px (mobile/tablet) / 480 px (desktop) | null |
| 475 | 07 | TC-L-006 | Form card padding | 32 px (mobile) / 40 px (tablet/desktop) | null |
| 476 | 07 | TC-L-007 | Inter-element vertical gap inside card | 20 px | null |
| 477 | 07 | TC-L-008 | Inter-field gap inside form | 16 px | null |
| 478 | 07 | TC-L-009 | Field height | 56 px | null |
| 479 | 07 | TC-L-010 | Submit button height | 48 px (mobile) / 56 px (tablet/desktop), full width | null |
| 480 | 07 | TC-L-011 | Pill button corner radius | 9999 (full) | null |
| 481 | 07 | TC-L-012 | Brand mark size on form panel | 56 px square; centered | null |
| 482 | 07 | TC-L-013 | "or" divider | full-width 1 px line broken by centered "or" label | null |
| 483 | 07 | TC-L-014 | Desktop hero corner radius | 0 on outer edges; matches split panel | null |
| 484 | 07 | TC-R-001 | Viewport 360x780 | Single-column mobile layout, no horizontal scrollbar | null |
| 485 | 07 | TC-R-002 | Viewport 375x812 | Same layout as 360 (mobile) | null |
| 486 | 07 | TC-R-003 | Viewport 768x1024 | Centered card with brand and form fields, no hero panel | null |
| 487 | 07 | TC-R-004 | Viewport 1024x768 | Centered card; rail-variant app shell may apply | null |
| 488 | 07 | TC-R-005 | Viewport 1440x900 | Desktop split layout — hero left, form right | null |
| 489 | 07 | TC-R-006 | Viewport >= 1920 wide | Content max-width respected (no edge-to-edge stretching) | null |
| 490 | 07 | TC-R-007 | Window resize during render | Layout recomputes without flicker; inputs preserve focus and value | null |
| 491 | 07 | TC-R-008 | Soft keyboard on mobile | Card scrolls; submit button stays accessible above the keyboard | null |
| 492 | 07 | TC-F-001 | `/sign-in` route renders the page | brand + "Welcome back." heading visible (L2-036 §1) | 2026-05-09T19:45:30Z |
| 493 | 07 | TC-F-002 | Submit disabled until both fields have non-empty trimmed values | Yes | 2026-05-09T19:46:00Z |
| 494 | 07 | TC-F-003 | Valid credentials POST `/api/auth/sign-in` | Body `{usernameOrEmail, password}` (L2-036 §2) | 2026-05-09T19:46:30Z |
| 495 | 07 | TC-F-004 | Successful sign-in stores access token in `sessionStorage` only | Key `hg.oidc.access-token`; not in localStorage (L2-013 §3, L2-022) | null |
| 496 | 07 | TC-F-005 | Successful sign-in routes to `/home` (or consumed return URL) | Yes | 2026-05-09T19:47:00Z |
| 497 | 07 | TC-F-006 | 401 Unauthorized response | Generic "Invalid username or password." inline; no field-level disclosure (L2-036 §3) | 2026-05-09T20:00:30Z |
| 498 | 07 | TC-F-007 | 401 response clears the password field; preserves username | Yes | 2026-05-09T20:00:30Z |
| 499 | 07 | TC-F-008 | 401 response leaves user on `/sign-in` | URL unchanged | 2026-05-09T20:00:30Z |
| 500 | 07 | TC-F-009 | Click "Continue with Single Sign-On" | Browser navigates to OIDC `/authorize` URL with PKCE (L2-013) | 2026-05-09T20:01:30Z |
| 501 | 07 | TC-F-010 | OIDC alternative generates fresh `state` and `code_challenge` per click | Random per click (L2-013 §2) | null |
| 502 | 07 | TC-F-011 | Authenticated user visiting `/sign-in` directly | Redirects to `/home` (notAuthenticatedGuard) | 2026-05-09T20:02:30Z |
| 503 | 07 | TC-F-012 | Sign-in for a deleted or disabled account | 401; UI shows generic error (L2-036 §8) | null |
| 504 | 07 | TC-F-013 | Lockout — repeated failed attempts beyond threshold | 401; generic error; no leak of lockout state to non-locked users (L2-036 §7) | null |
| 505 | 07 | TC-F-014 | Click "New to HealthQuest? Get started" | Navigates to `/onboarding` | null |
| 506 | 07 | TC-F-015 | Network failure during submit | Submit re-enables; values preserved; non-disclosing error | null |
| 507 | 07 | TC-F-016 | Whitespace-only credentials | Submit remains disabled (trim before evaluating) | null |
| 508 | 07 | TC-F-017 | Username over 254 chars | Client blocks submit; backend rejects as 400 | null |
| 509 | 07 | TC-F-018 | Password over 256 chars | Client blocks submit; backend rejects as 400 | null |
| 510 | 07 | TC-B-001 | Tab order: username -> password -> toggle -> submit -> OIDC -> "Get started" | Logical, no skipped controls | null |
| 511 | 07 | TC-B-002 | Visible focus ring on every interactive element | Yes, contrast >= 3:1 | null |
| 512 | 07 | TC-B-003 | Enter inside any field submits the form | Yes | null |
| 513 | 07 | TC-B-004 | Space on focused button activates it | Yes | null |
| 514 | 07 | TC-B-005 | Hover on primary button | Slight elevation / state-layer overlay; cursor pointer | null |
| 515 | 07 | TC-B-006 | Click during in-flight submit (double click "Sign in") | Only one POST emitted | null |
| 516 | 07 | TC-B-007 | Submit button shows busy state while in-flight | Label "Signing in..."; disabled | null |
| 517 | 07 | TC-B-008 | Password toggle reveals and re-masks the password | Eye icon toggles `type=password` <-> `type=text` | null |
| 518 | 07 | TC-B-009 | Reduced-motion preference honored | No animated transitions on submit / state change | null |
| 519 | 07 | TC-B-010 | Browser autofill populates fields and re-evaluates submit-disabled | Submit becomes enabled | null |
| 520 | 07 | TC-B-011 | Pasting credentials with leading/trailing whitespace | Whitespace is trimmed before submit | null |
| 521 | 07 | TC-A-001 | Page rendered inside the app-shell `<main>`; no nested `<main>` | Exactly one `<main>` | 2026-05-09T19:45:30Z |
| 522 | 07 | TC-A-002 | Title rendered as `<h1>` | Yes | null |
| 523 | 07 | TC-A-003 | Brand mark has accessible name or `aria-hidden="true"` | Decorative — `aria-hidden` | null |
| 524 | 07 | TC-A-004 | Each input has a programmatically associated `<label for>` | Yes | null |
| 525 | 07 | TC-A-005 | Password field exposes `type=password` and is announced as masked | Yes | 2026-05-09T19:45:45Z |
| 526 | 07 | TC-A-006 | Validation errors associated via `aria-describedby` and `aria-live="polite"` | Yes | null |
| 527 | 07 | TC-A-007 | Inline 401 error has `role="alert"` and `aria-live="assertive"` | Yes | null |
| 528 | 07 | TC-A-008 | Buttons have descriptive accessible names | "Sign in", "Continue with Single Sign-On", "Get started" | null |
| 529 | 07 | TC-A-009 | Password toggle has accessible name | "Show password" / "Hide password" | null |
| 530 | 07 | TC-A-010 | axe-core scan returns 0 critical / serious violations | Yes | null |
| 531 | 07 | TC-D-001 | Successful sign-in writes access token to `sessionStorage` only | Key `hg.oidc.access-token`; not in localStorage | null |
| 532 | 07 | TC-D-002 | Reload after sign-in keeps the user authenticated | Token persists for the tab session | null |
| 533 | 07 | TC-D-003 | Closing the tab clears the access token | `sessionStorage` is per-tab; new tab is unauthenticated | null |
| 534 | 07 | TC-D-004 | Sign-out clears the token from `sessionStorage` | Yes | null |
| 535 | 07 | TC-D-005 | Failed sign-in does not write any auth artifact | `sessionStorage` and `localStorage` unchanged | 2026-05-09T20:03:30Z |
| 536 | 07 | TC-D-006 | Refresh token (if used) only stored as httpOnly cookie | Confirmed (L2-013 §3) | null |
| 537 | 07 | TC-S-001 | Submitted password is never logged at any level | No `password` value in console / network / server logs (L2-017 §3, L2-036 §4) | 2026-05-09T20:03:30Z |
| 538 | 07 | TC-S-002 | Issued JWT is never logged at any level | No bearer/JWT in console or server logs (L2-022) | 2026-05-09T20:03:30Z |
| 539 | 07 | TC-S-003 | Sign-in request sent over HTTPS in non-dev environments | Confirmed (L2-036 §5) | null |
| 540 | 07 | TC-S-004 | Backend never reveals whether username or password was wrong | 401 with generic message; constant-time-ish response (L2-036 §3) | null |
| 541 | 07 | TC-S-005 | XSS payload in username field | Escaped on render; nothing executes (L2-016 §3) | null |
| 542 | 07 | TC-S-006 | CSRF protection on `POST /api/auth/sign-in` (cookie-bearing) | Yes (L2-016 §4) | null |
| 543 | 07 | TC-S-007 | Repeated failed attempts trigger lockout / throttle | Configured threshold; security event logged at Information+ without password (L2-036 §7) | null |
| 544 | 07 | TC-S-008 | Sign-in attempt for deleted / disabled account | 401 regardless of credential correctness (L2-036 §8) | null |
| 545 | 07 | TC-P-001 | Cold load LCP on simulated 4G | <= 2.5 s (L2-019 §1) | null |
| 546 | 07 | TC-P-002 | Sign-in route lazy-loaded — no dashboard / goals code in chunk | Confirmed via bundle analyzer (L2-019 §2) | null |
| 547 | 07 | TC-P-003 | Submit p95 server time | <= 500 ms (L2-018 §2) | null |
| 548 | 07 | TC-P-004 | TBT under interaction | <= 200 ms | null |

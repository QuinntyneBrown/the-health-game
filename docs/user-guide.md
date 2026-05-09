# The Health Game — User Guide

A complete, step-by-step walkthrough of every feature in The Health Game (also
called HealthQuest in the app shell). This guide is written for end users. It
covers signing in, navigating the app, defining goals, logging activity,
tracking streaks, defining and earning rewards, and managing your profile.

## Table of Contents

- [About the App](#about-the-app)
- [Layout and Navigation](#layout-and-navigation)
- [Signing In and Signing Out](#signing-in-and-signing-out)
- [Home / Dashboard](#home--dashboard)
- [Goals](#goals)
  - [Viewing Your Goals](#viewing-your-goals)
  - [Filtering Goals by Cadence](#filtering-goals-by-cadence)
  - [Creating a Goal](#creating-a-goal)
  - [Cadence Options](#cadence-options)
  - [Opening a Goal](#opening-a-goal)
  - [Editing a Goal](#editing-a-goal)
  - [Deleting a Goal](#deleting-a-goal)
- [Activities](#activities)
  - [Logging an Activity](#logging-an-activity)
  - [Viewing Activity History](#viewing-activity-history)
  - [Editing an Activity Entry](#editing-an-activity-entry)
  - [Deleting an Activity Entry](#deleting-an-activity-entry)
- [Streaks](#streaks)
- [Rewards](#rewards)
  - [Viewing Your Rewards](#viewing-your-rewards)
  - [Filtering Rewards by Status](#filtering-rewards-by-status)
  - [Creating a Reward](#creating-a-reward)
  - [Earning a Reward](#earning-a-reward)
- [Profile](#profile)
  - [Viewing Your Profile](#viewing-your-profile)
  - [Editing Your Profile](#editing-your-profile)
  - [Signing Out](#signing-out-from-the-profile)
  - [Deleting Your Account](#deleting-your-account)
- [Roles and Permissions](#roles-and-permissions)
- [Accessibility](#accessibility)
- [Troubleshooting](#troubleshooting)

---

## About the App

The Health Game helps you build healthy habits by:

1. Defining personal **goals** with a target value and a cadence (e.g. drink 8
   glasses of water per day, walk 30 minutes weekly).
2. **Logging activity** against those goals as you do them.
3. Building **streaks** by hitting your target consistently, cadence after
   cadence.
4. Defining **rewards** that unlock when you hit a goal target or reach a
   streak milestone.

The app is a mobile-first, responsive web application. It works on phones,
tablets, and desktop browsers.

---

## Layout and Navigation

The app shell is the same on every screen:

- **Top bar** — application brand ("HealthQuest") and a "Skip to main content"
  link for keyboard users.
- **Main content area** — the current page (Home, Goals, Rewards, Profile,
  etc.).
- **Navigation bar** — the four primary destinations. Its position adapts to
  your screen size:
  - **Phone (bottom bar)** — fixed at the bottom of the screen.
  - **Tablet (rail)** — vertical rail down the left edge.
  - **Desktop (drawer)** — full navigation drawer.

Primary destinations:

| Icon                 | Label    | Route       |
| -------------------- | -------- | ----------- |
| `home`               | Home     | `/`         |
| `flag`               | Goals    | `/goals`    |
| `workspace_premium`  | Rewards  | `/rewards`  |
| `person`             | Profile  | `/profile`  |

To navigate:

1. Tap or click any item in the navigation bar.
2. The route updates and the active item is highlighted.
3. The browser back/forward buttons work as expected.

---

## Signing In and Signing Out

The app uses authenticated, user-scoped data. You must sign in to see goals,
activities, rewards, or your profile.

### Signing in

1. Open the app at its root URL (for local development:
   `http://localhost:4200`).
2. If you are not signed in, the app routes you to your identity provider's
   sign-in page (OIDC PKCE flow).
3. Enter your credentials with your identity provider.
4. The provider redirects back to `/auth/callback?code=…&state=…`.
5. The app exchanges the code for tokens and routes you to the page you
   originally requested (or to the Home dashboard if you came in fresh).

While signing in, the page title shows **"Signing you in"**.

### Signing out

You can sign out two ways:

- **From the Profile page** — tap **Sign out**.
- **By visiting `/auth/signed-out`** — the signed-out page confirms the action.

After signing out, protected routes (everything except `/auth/callback` and
`/auth/signed-out`) bounce you back to your identity provider.

---

## Home / Dashboard

The Home page is the landing screen after sign-in. It is at the root route
`/`.

What you see, top to bottom:

1. **Page header**
   - Eyebrow line showing today's date label.
   - Greeting headline (e.g. "Good morning, Quinntyne").
   - Description: "Build streaks with goals, activity, and personal rewards."
   - **New goal** action button (icon `add`) on the right.

2. **Progress summary metrics** — a row of metric cards. Each card shows a
   label, a value, optional support text, an icon, a tone, and a progress bar
   when relevant. The metrics summarize the day at a glance.

3. **Today's goals** section — a list of goal cards for goals that are due
   today. Each card shows:
   - Title and description
   - Cadence label (Daily, Weekly, etc.)
   - Progress label and progress value
   - Current and longest streak labels
   - Linked reward name (if any)
   - **Log** action button to log activity directly from the card.

4. **Rewards** section — a preview list of reward cards. Each card shows the
   reward name, description, status label (Earned / Pending), and the earned
   date if applicable. This section loads when it scrolls into view (lazy).

To create a goal directly from Home, tap **New goal** in the page header.

---

## Goals

Goals live at `/goals`. Use them to define the habits you want to build.

### Viewing Your Goals

1. Open the navigation bar and select **Goals**.
2. If you have no goals yet, you see an empty state titled **"No goals yet"**
   with a **Create goal** button. Tap it to create your first goal.
3. If you have goals, you see a filter bar at the top and a list of goal cards
   below.

Each goal card shows:

- Goal name and description
- Cadence label (e.g. Daily, Weekly, Monthly, Custom)
- Progress label and progress bar for the current cadence window
- Current streak label (number of consecutive cadence windows hit)
- Longest streak label (best run to date)
- Linked reward name, if a reward is tied to the goal
- **Open** action to view the goal detail

### Filtering Goals by Cadence

The filter bar above the goal list is a segmented control. Tap a segment to
filter the list. Filtering is purely a view; it does not delete or hide the
goals from elsewhere.

### Creating a Goal

1. From **/goals**, tap the **Create goal** action (or use **New goal** from
   the Home page header).
2. The Create goal form opens. Fill in:
   - **Name** (required) — short label for the goal.
   - **Target** (number, required) — the target value for one cadence window.
   - **Unit** — what the target value is measured in (e.g. "glasses",
     "minutes", "reps").
   - **Cadence** — how often the goal repeats (see [Cadence Options](#cadence-options)).
   - **Week start** (only when cadence = Weekly) — the day each weekly window
     starts (Sunday through Saturday).
   - **Every / Unit** (only when cadence = Custom) — a custom interval like
     "Every 3 days" or "Every 12 hours".
3. Tap **Create goal** to save. The button is disabled while the form has
   errors.
4. Tap **Cancel** to go back without saving.

### Cadence Options

| Cadence  | Window                                                 |
| -------- | ------------------------------------------------------ |
| Hourly   | One window per hour.                                   |
| Daily    | One window per day.                                    |
| Weekly   | One window per week, starting on the day you choose.   |
| Monthly  | One window per calendar month.                         |
| Custom   | One window every N hours or N days, where you set N.   |

### Opening a Goal

From the goal list, tap **Open** on any goal card. The goal detail page
opens. It shows:

- **Page header** — cadence label as eyebrow, goal name as title, description.
- **Streak summary** — two cards: **Current streak** and **Longest streak**,
  each showing a number of days.
- **Meta** — the target (value + unit), cadence label, and the linked reward
  if any.
- **Edit** and **Delete** buttons.
- **Activity history** — list of past activity entries for this goal,
  sorted newest first. Each entry shows quantity (with unit), notes, the time
  it was logged, and **Edit** / **Delete** icon buttons.
- **Log** floating action button (FAB) at the bottom right. Tap it to log a
  new activity entry against this goal.

### Editing a Goal

1. Open the goal detail page for the goal you want to change.
2. Tap **Edit**.
3. The goal form opens prefilled with the current values.
4. Change any field. If you change the cadence on an existing goal, a hint
   appears: *"Streak windows recompute from now; existing entries kept."*
   Existing activity entries are preserved, but streaks are recalculated using
   the new cadence going forward.
5. Tap **Save changes** to apply, or **Cancel** to discard.

### Deleting a Goal

1. Open the goal detail page.
2. Tap **Delete**.
3. A confirmation dialog appears: *"This permanently deletes [goal name]."*
4. Tap **Delete** to confirm, or **Cancel** to keep the goal.

Deleting a goal removes the goal and all of its activity history. Any rewards
that referenced the goal are no longer earnable from it.

---

## Activities

An **activity entry** is a single recording of something you did toward a
goal — for example, "drank 2 glasses of water" or "walked for 25 minutes."

### Logging an Activity

You can log activity from several places:

- **Goal detail page** — tap the **Log** floating action button at the bottom
  right.
- **Home dashboard** — tap **Log** on a goal card under "Today's goals."

The container that opens depends on your screen size:

- **Phone** — a **bottom sheet** slides up from the bottom of the screen.
- **Tablet / desktop** — a **dialog** opens centered on the screen.

Both contain the same fields:

1. **Quantity (in the goal's unit)** — required, must be greater than zero.
2. **Notes (optional)** — short free-text note.

Steps:

1. Open the log container from a goal card or the goal detail page.
2. Type the quantity (numbers only).
3. Optionally add a note.
4. Tap **Log** to save. The button is disabled if the quantity is missing or
   zero.
5. If logging this activity earns one or more rewards, a snackbar appears at
   the bottom of the screen with a message like *"Reward earned: [name]"*
   and a **View** action.
6. Tap **Cancel** to dismiss without saving.

After saving, the goal's progress, current streak, and longest streak update
automatically.

### Viewing Activity History

1. Open a goal detail page.
2. Scroll to the **Activity history** section.
3. Entries are listed newest first, each with:
   - Title (quantity + unit, derived from the goal)
   - Notes (if any)
   - Meta (timestamp / cadence-window label)
   - **Edit** (pencil icon) and **Delete** (trash icon) buttons.

If a goal has no entries yet, the section shows: *"No activity yet — Tap Log
to record your first entry."*

### Editing an Activity Entry

1. From a goal detail page, find the entry in **Activity history**.
2. Tap the **Edit** (pencil) icon next to it.
3. The Edit activity dialog opens, prefilled with the current quantity and
   notes.
4. Change the quantity and/or notes.
5. Tap **Save**, or **Cancel** to discard.

After saving, streaks and progress recompute.

### Deleting an Activity Entry

1. From a goal detail page, find the entry in **Activity history**.
2. Tap the **Delete** (trash) icon next to it.
3. A confirmation dialog appears: *"This permanently removes the activity
   entry. Streaks will recompute."*
4. Tap **Delete** to confirm, or **Cancel** to keep the entry.

---

## Streaks

A **streak** is the number of consecutive cadence windows in which you met or
exceeded the goal's target.

- The **current streak** is the number of consecutive recent windows hit, up
  to and including the most recent completed window.
- The **longest streak** is the best run you've ever had on this goal.

Both values are visible on:

- The goal card (in the goal list and on Home).
- The goal detail page, in the streak summary cards.

Streaks update automatically when you log, edit, or delete activity, and when
you change a goal's cadence.

---

## Rewards

Rewards live at `/rewards`. A reward is tied to one goal and unlocks when a
condition is met.

### Viewing Your Rewards

1. Open the navigation bar and select **Rewards**.
2. If you have no rewards yet, you see an empty state titled **"No rewards
   yet"** with a **Create reward** button.
3. If you have rewards, you see a status filter at the top and a list of
   reward cards.

Each reward card shows:

- Reward name and description
- Status label — **Earned** or **Pending**
- Earned-on date (only when the reward is earned)

### Filtering Rewards by Status

Use the segmented filter at the top of the list to view:

- **All** — every reward you've defined.
- **Earned** — rewards you've already unlocked.
- **Pending** — rewards still waiting for their condition to be met.

### Creating a Reward

1. From **/rewards**, tap **Create reward** (or the action in the empty state).
2. The Define reward form opens. Fill in:
   - **Name** (required).
   - **Description** (optional).
   - **Goal** — pick which goal this reward is tied to. The first goal in the
     list is preselected. You must have at least one goal to create a reward.
   - **Condition** — choose one:
     - **Goal target met** — earned the first time you hit the goal's target
       in any cadence window.
     - **Streak milestone** — earned when your current streak on this goal
       reaches a certain number of days.
   - **Streak days** (only when condition = Streak milestone) — required, must
     be at least 1.
3. Tap **Create reward** to save (the button is disabled until the form is
   valid), or **Cancel** to discard.

### Earning a Reward

You don't earn rewards manually. They unlock automatically when you log an
activity that satisfies the condition:

- A **Goal target met** reward unlocks when an activity log makes you hit the
  goal target for the current cadence window.
- A **Streak milestone** reward unlocks when an activity log advances your
  current streak to the configured number of days.

When a reward unlocks during activity logging, a snackbar at the bottom of the
screen confirms it. The reward then shows as **Earned** on the Rewards page
and on the linked goal card.

---

## Profile

Your profile lives at `/profile`.

### Viewing Your Profile

1. Open the navigation bar and select **Profile**.
2. The page shows:
   - **Avatar** — your picture if you have one, otherwise the first letter of
     your display name.
   - **Display name** and **email**.
   - **Roles** — small pills showing each role you have (e.g. `user`,
     `admin`).
   - Action buttons: **Edit profile**, **Sign out**, **Delete account**.

### Editing Your Profile

1. From **/profile**, tap **Edit profile**.
2. The form replaces the action buttons. Fields:
   - **Display name** (required).
   - **Email** (required, must be a valid email).
3. Tap **Save** to apply changes (the button is disabled until both fields
   are valid). Tap **Cancel** to discard.

### Signing Out from the Profile

1. From **/profile**, tap **Sign out**.
2. The app clears your session and routes you to the signed-out page.

### Deleting Your Account

1. From **/profile**, tap **Delete account**.
2. The Delete account dialog appears with a warning that the action
   permanently deletes your account and all associated data.
3. To confirm, type your **email address** exactly as it appears in the
   dialog. The **Delete** button stays disabled until the typed email matches.
4. Tap **Delete** to permanently delete your account, or **Cancel** to keep
   it.

> Deleting your account cannot be undone.

---

## Roles and Permissions

The app supports role-based access control through a structural directive
named `*hgIfRole`. Some UI elements are visible only to users with specific
roles. If you have an `admin` role, for example, you may see additional
admin-only sections that other users do not.

You can see your roles on the Profile page.

---

## Accessibility

The app is built with accessibility in mind:

- **Skip link** — at the top of every page, a "Skip to main content" link
  jumps focus past the navigation. It becomes visible when focused with the
  Tab key.
- **Landmarks** — header, main content, and navigation are clearly marked.
- **Heading IDs** — page sections use stable heading IDs so screen readers
  can announce them clearly.
- **Aria labels** — segmented filters, metric cards, and icon-only buttons
  include accessible labels.
- **Keyboard navigation** — every action button, filter, and form field is
  reachable and operable from the keyboard.

---

## Troubleshooting

**I'm stuck on a "Signing you in" page.**
Your identity provider didn't return a code or state, or the exchange failed.
Reload the page or sign in again. If it keeps happening, contact your
administrator.

**My streak didn't go up after I logged activity.**
Streaks count cadence *windows* hit, not individual entries. You must meet the
goal's full target within the current cadence window before the streak
advances.

**I changed my goal's cadence and my streak reset.**
This is expected. The goal detail form warns: *"Streak windows recompute from
now; existing entries kept."* The history is preserved, but streaks are
recalculated against the new cadence going forward.

**I deleted an activity entry and my streak dropped.**
Streaks recompute on every change to activity history. If removing an entry
means a window no longer met its target, the streak shortens.

**I can't create a reward.**
You need at least one goal first. Create a goal under **/goals** and try
again.

**My reward shows as Pending after I hit my target.**
The reward only unlocks when an activity log satisfies the condition — for
streak-milestone rewards, that means reaching the configured streak length.
Make sure you've logged enough qualifying entries.

**The "Delete" button in the Delete account dialog stays disabled.**
You must type your full email exactly as it is shown in the dialog,
including capitalization. The match is exact.

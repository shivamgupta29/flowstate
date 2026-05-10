# FlowState Data Flow

This document explains where data lives, how it moves through the app, and where to make common changes.

## Folder Map

- `src/App.tsx`: lightweight route selection only.
- `src/hooks/useFlowState.ts`: app state, derived scheduling data, persistence effects, navigation, and user actions.
- `src/features/dashboard/`: dashboard page, queue columns, task cards, scheduler panel, and movement event display.
- `src/features/tasks/`: create task page, task form, task detail/edit page, completed-task page, and not-found page.
- `src/features/analytics/`: analytics page.
- `src/components/`: shared presentational UI such as brand mark, page header, metric card, empty state, validation message, and compact bars.
- `src/config/`: shared display metadata and form defaults.
- `src/lib/`: pure domain logic for scheduling, analytics, storage, task mutations, validation, backup import/export, and seed data.
- `src/types.ts`: shared data types.

## Runtime Data Flow

1. React starts at `src/main.tsx` and renders `App`.
2. `App` calls `useFlowState`.
3. `useFlowState` loads tasks and schedule events from localStorage using `storage.ts`.
4. The hook passes tasks into `scheduleTasks`.
5. `scheduleTasks` returns normalized tasks, queue groups, and movement events.
6. The hook persists scheduled tasks and appends new movement events.
7. `App` chooses which page to render based on the current path.
8. Pages receive data and callbacks from the hook as props.
9. UI components render props only; they do not call storage or scheduler code directly.

## User Action Flow

When a user creates, edits, deletes, completes, defers, restores, imports, exports, or resets data:

1. A feature page or component calls a callback prop.
2. The callback points to an action exposed by `useFlowState`.
3. The hook updates local React state.
4. React re-renders and `scheduleTasks` recalculates queues.
5. Persistence effects write the new task list and event list to localStorage.
6. The visible dashboard, task pages, and analytics update from derived state.

## Pure Logic Modules

- `scheduler.ts`: queue assignment and movement events.
- `taskActions.ts`: edit, delete, and restore transformations.
- `taskValidation.ts`: create/edit form validation.
- `analytics.ts`: counts and queue/movement summaries.
- `backup.ts`: JSON backup export/import parsing.
- `storage.ts`: localStorage read/write and event deduping.

These files should stay independent from React components. If a behavior can be expressed as a pure transformation, put it in `src/lib/` and add a focused test.

## Where To Make Common Changes

- Add or change scheduling rules: `src/lib/scheduler.ts`.
- Change queue names, descriptions, icons, or display labels: `src/config/queues.ts`.
- Change task creation/edit defaults: `src/config/taskForm.ts`.
- Change task card layout: `src/features/dashboard/TaskCard.tsx`.
- Change dashboard layout: `src/features/dashboard/DashboardPage.tsx`.
- Change create/edit validation: `src/lib/taskValidation.ts`.
- Change localStorage or backup behavior: `src/lib/storage.ts` and `src/lib/backup.ts`.
- Add a new page: create a feature page and add a route branch in `src/App.tsx`.

## Testing

Run the full check after structural or logic changes:

```bash
npm run test
npm run build
```

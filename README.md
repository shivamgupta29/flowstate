# FlowState

FlowState is a React and Tailwind CSS productivity dashboard inspired by Multi-Level Feedback Queue scheduling.

## Architecture

FlowState is a frontend-only Vite app. The route shell lives in `src/App.tsx`, while app state and data orchestration live in `src/hooks/useFlowState.ts`.

The core data flow is:

1. UI pages call actions from `useFlowState`.
2. The hook updates task or schedule-event state.
3. `src/lib/scheduler.ts` recalculates queue placement.
4. Tasks and movement history persist to localStorage through `src/lib/storage.ts`.
5. Feature components render the derived queues, analytics, and task views.

Most business logic is kept in pure modules under `src/lib/` so it can be tested without rendering React.

See [docs/data-flow.md](docs/data-flow.md) for the full folder map and data-flow guide.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run test
npm run build
```

## Vercel

Use the default static Vite deployment settings:

- Build command: `npm run build`
- Output directory: `dist`

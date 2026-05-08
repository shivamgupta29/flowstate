# FlowState Project Guide

## Project Overview

FlowState is a smart productivity and task management web application inspired by Multi-Level Feedback Queue (MLFQ) scheduling from operating systems.

Traditional to-do apps usually treat tasks as static list items. FlowState instead treats tasks as schedulable work units whose priority changes over time based on urgency, user behavior, completion patterns, and inactivity.

The goal is to translate a low-level CPU scheduling concept into a practical human productivity system that helps users focus on the right work at the right time.

## Core Concept

FlowState organizes tasks into multiple priority queues, similar to how an operating system schedules processes.

Expected queues include:

- Focus Queue: highest-priority tasks that need immediate attention.
- Active Queue: important tasks that are relevant but not urgent enough for focus mode.
- Backlog Queue: lower-priority tasks that should remain visible but should not interrupt higher-priority work.

Tasks are not fixed in one queue. Their position changes dynamically as the scheduling engine reacts to user behavior and task metadata.

## Scheduling Behavior

The scheduling engine should model MLFQ-inspired behavior:

- Deadline promotion: tasks with approaching deadlines move into higher-priority queues.
- Inactivity demotion: tasks repeatedly ignored or deferred can move into lower-priority queues.
- Aging boost: long-starved tasks eventually receive a priority boost so they are not forgotten.
- Behavioral adaptation: completion, delay, and interaction patterns influence future task placement.
- Fairness: the system should avoid letting low-priority tasks disappear forever.

The engine should feel explainable. Users should be able to understand why a task moved between queues.

## Product Experience

The application should provide an interactive dashboard centered on queue-based task flow.

Important product surfaces include:

- Queue visualizations showing Focus, Active, and Backlog tasks.
- Task movement history showing promotions, demotions, and aging boosts.
- Productivity analytics based on completion patterns and queue behavior.
- Intelligent scheduling insights that explain what the user should focus on next.
- Task controls for creating, editing, completing, deferring, and prioritizing tasks.

The interface should feel like a usable productivity tool, not a marketing page. Prioritize clarity, fast scanning, and efficient task management.

## Technical Direction

The project is expected to use:

- React for the frontend.
- Tailwind CSS for styling.
- A modular scheduling engine separated from presentation components.
- Clear state management for tasks, queues, scheduling events, and analytics.

Keep scheduling logic testable and independent from UI components wherever possible. UI components should render scheduling state rather than contain the scheduling rules directly.

## Engineering Principles

- Prefer modular code with clear boundaries between UI, state, and scheduling logic.
- Keep scheduling rules deterministic where practical so behavior is debuggable.
- Represent task movement with explicit events instead of silently mutating priority.
- Preserve enough metadata to explain why a task is in its current queue.
- Design for future extensions such as user-configurable queues, custom rules, recurring tasks, or persistence.

## Tone And Identity

FlowState turns systems thinking into a human productivity workflow. The project stands out by applying CPU scheduling ideas to task management, using concepts like dynamic prioritization, behavioral modeling, scheduling fairness, and adaptive system design.

Humanity spent decades designing sophisticated CPU schedulers only for people to still procrastinate opening their assignment PDFs. FlowState at least tries to intervene before collapse.

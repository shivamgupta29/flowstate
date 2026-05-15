import { beforeEach, describe, expect, it } from 'vitest';
import type { ScheduleEvent } from '../types';
import {
  appendScheduleEvents,
  clearTasks,
  loadTasks,
  loadScheduleEvents,
  saveScheduleEvents,
} from './storage';

const firstEvent: ScheduleEvent = {
  taskId: 'task-1',
  previousQueue: 'backlog',
  nextQueue: 'active',
  reason: 'Aging boost',
  timestamp: '2026-05-08T12:00:00.000Z',
};

const secondEvent: ScheduleEvent = {
  taskId: 'task-1',
  previousQueue: 'active',
  nextQueue: 'focus',
  reason: 'Deadline promotion',
  timestamp: '2026-05-08T13:00:00.000Z',
};

describe('schedule event storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists schedule events in localStorage', () => {
    saveScheduleEvents([firstEvent]);

    expect(loadScheduleEvents()).toEqual([firstEvent]);
  });

  it('loads no tasks on first run', () => {
    expect(loadTasks()).toEqual([]);
  });

  it('does not append duplicate unchanged movement events', () => {
    const duplicateEvent = {
      ...firstEvent,
      timestamp: '2026-05-08T12:05:00.000Z',
    };

    const result = appendScheduleEvents([firstEvent], [duplicateEvent]);

    expect(result).toEqual([firstEvent]);
  });

  it('keeps meaningful new movement events first', () => {
    const result = appendScheduleEvents([firstEvent], [secondEvent]);

    expect(result).toEqual([secondEvent, firstEvent]);
  });

  it('clears schedule events with stored tasks', () => {
    saveScheduleEvents([firstEvent]);

    clearTasks();

    expect(loadScheduleEvents()).toEqual([]);
  });
});

import type { Task } from '../types';
import { seedTasks } from './seedTasks';

const STORAGE_KEY = 'flowstate.tasks.v1';

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') {
    return seedTasks;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return seedTasks;
  }

  try {
    const parsed = JSON.parse(storedValue) as Task[];
    return Array.isArray(parsed) ? parsed : seedTasks;
  } catch {
    return seedTasks;
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function clearTasks(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

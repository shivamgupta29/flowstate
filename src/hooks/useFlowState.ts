import { useEffect, useMemo, useState } from 'react';
import { calculateAnalytics } from '../lib/analytics';
import { createBackupPayload, parseBackupPayload } from '../lib/backup';
import { scheduleTasks } from '../lib/scheduler';
import { seedTasks } from '../lib/seedTasks';
import {
  appendScheduleEvents,
  clearTasks,
  loadScheduleEvents,
  loadTasks,
  saveScheduleEvents,
  saveTasks,
} from '../lib/storage';
import {
  deleteTaskAndEvents,
  restoreTask,
  updateTaskDetails,
  type TaskEditValues,
} from '../lib/taskActions';
import type { ScheduleEvent, Task } from '../types';

export function useFlowState() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>(() =>
    loadScheduleEvents(),
  );
  const [path, setPath] = useState(() => window.location.pathname);
  const [backupMessage, setBackupMessage] = useState<string | undefined>();

  const scheduled = useMemo(() => scheduleTasks(tasks), [tasks]);
  const openTasks = scheduled.tasks.filter((task) => task.status === 'open');
  const completedCount = scheduled.tasks.length - openTasks.length;
  const totalEffort = openTasks.reduce(
    (total, task) => total + task.estimatedEffortMinutes,
    0,
  );
  const completedTasks = scheduled.tasks.filter(
    (task) => task.status === 'completed',
  );
  const analytics = useMemo(
    () => calculateAnalytics(scheduled.tasks, scheduleEvents),
    [scheduled.tasks, scheduleEvents],
  );

  useEffect(() => {
    saveTasks(scheduled.tasks);
  }, [scheduled.tasks]);

  useEffect(() => {
    if (scheduled.events.length === 0) {
      return;
    }

    setScheduleEvents((currentEvents) =>
      appendScheduleEvents(currentEvents, scheduled.events),
    );
  }, [scheduled.events]);

  useEffect(() => {
    saveScheduleEvents(scheduleEvents);
  }, [scheduleEvents]);

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  }

  function createTask(form: TaskEditValues) {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      deadline: new Date(form.deadline).toISOString(),
      urgency: form.urgency,
      estimatedEffortMinutes: form.estimatedEffortMinutes,
      status: 'open',
      queue: form.urgency === 'high' ? 'active' : 'backlog',
      createdAt: timestamp,
      updatedAt: timestamp,
      ignoredCount: 0,
      lastInteractionAt: timestamp,
      movementReason: 'Stable priority',
    };

    setTasks((currentTasks) => [...currentTasks, task]);
    navigate('/');
  }

  function updateTask(taskId: string, update: (task: Task) => Task) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? update(task) : task)),
    );
  }

  function completeTask(taskId: string) {
    updateTask(taskId, (task) => ({
      ...task,
      status: 'completed',
      updatedAt: new Date().toISOString(),
      lastInteractionAt: new Date().toISOString(),
    }));
  }

  function deferTask(taskId: string) {
    updateTask(taskId, (task) => ({
      ...task,
      ignoredCount: task.ignoredCount + 1,
      updatedAt: new Date().toISOString(),
      lastInteractionAt: new Date().toISOString(),
    }));
  }

  function editTask(taskId: string, values: TaskEditValues) {
    setTasks((currentTasks) =>
      updateTaskDetails(currentTasks, taskId, values),
    );
    navigate(`/tasks/${encodeURIComponent(taskId)}`);
  }

  function deleteTask(taskId: string) {
    const result = deleteTaskAndEvents(tasks, scheduleEvents, taskId);
    setTasks(result.tasks);
    setScheduleEvents(result.events);
    navigate('/');
  }

  function restoreCompletedTask(taskId: string) {
    setTasks((currentTasks) => restoreTask(currentTasks, taskId));
  }

  function resetTasks() {
    clearTasks();
    setTasks(seedTasks);
    setScheduleEvents([]);
    setBackupMessage(undefined);
  }

  function exportData() {
    const payload = createBackupPayload(scheduled.tasks, scheduleEvents);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `flowstate-backup-${payload.exportedAt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Backup exported.');
  }

  function importData(rawValue: string) {
    const result = parseBackupPayload(rawValue);

    if (!result.ok) {
      setBackupMessage(result.error);
      return;
    }

    setTasks(result.data.tasks);
    setScheduleEvents(result.data.scheduleEvents);
    setBackupMessage('Backup imported.');
  }

  return {
    analytics,
    backupMessage,
    completedCount,
    completedTasks,
    openTasks,
    path,
    scheduleEvents,
    scheduled,
    totalEffort,
    actions: {
      completeTask,
      createTask,
      deferTask,
      deleteTask,
      editTask,
      exportData,
      importData,
      navigate,
      resetTasks,
      restoreCompletedTask,
    },
  };
}

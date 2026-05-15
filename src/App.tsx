import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CompletedPage } from './features/tasks/CompletedPage';
import { NewTaskPage } from './features/tasks/NewTaskPage';
import { NotFoundPage } from './features/tasks/NotFoundPage';
import { TaskDetailPage } from './features/tasks/TaskDetailPage';
import { useFlowState } from './hooks/useFlowState';

export function App() {
  const flow = useFlowState();
  const { actions } = flow;

  if (flow.path === '/tasks/new') {
    return (
      <NewTaskPage
        onCreate={actions.createTask}
        onBack={() => actions.navigate('/')}
      />
    );
  }

  if (flow.path === '/completed') {
    return (
      <CompletedPage
        completedTasks={flow.completedTasks}
        onBack={() => actions.navigate('/')}
        onOpenTask={(taskId) =>
          actions.navigate(`/tasks/${encodeURIComponent(taskId)}`)
        }
        onRestore={actions.restoreCompletedTask}
      />
    );
  }

  if (flow.path === '/analytics') {
    return (
      <AnalyticsPage
        analytics={flow.analytics}
        onBack={() => actions.navigate('/')}
      />
    );
  }

  const taskRouteMatch = flow.path.match(/^\/tasks\/([^/]+)$/);

  if (taskRouteMatch) {
    const taskId = decodeURIComponent(taskRouteMatch[1]);
    const task = flow.scheduled.tasks.find(
      (currentTask) => currentTask.id === taskId,
    );

    if (!task) {
      return <NotFoundPage onBack={() => actions.navigate('/')} />;
    }

    return (
      <TaskDetailPage
        task={task}
        events={flow.scheduleEvents.filter((event) => event.taskId === task.id)}
        onBack={() => actions.navigate('/')}
        onSave={(values) => actions.editTask(task.id, values)}
        onComplete={() => actions.completeTask(task.id)}
        onRestore={() => actions.restoreCompletedTask(task.id)}
        onDelete={() => actions.deleteTask(task.id)}
        onMove={(queue) => actions.moveTask(task.id, queue)}
        onSnooze={(snoozedUntil) =>
          actions.snoozeTaskUntil(task.id, snoozedUntil)
        }
      />
    );
  }

  return (
    <DashboardPage
      scheduled={flow.scheduled}
      scheduleEvents={flow.scheduleEvents}
      visibleQueues={flow.visibleQueues}
      openTasks={flow.openTasks}
      completedCount={flow.completedCount}
      totalEffort={flow.totalEffort}
      reminders={flow.reminders}
      search={flow.search}
      filter={flow.filter}
      sort={flow.sort}
      backupMessage={flow.backupMessage}
      onCreateTask={() => actions.navigate('/tasks/new')}
      onCompleted={() => actions.navigate('/completed')}
      onAnalytics={() => actions.navigate('/analytics')}
      onOpenTask={(taskId) =>
        actions.navigate(`/tasks/${encodeURIComponent(taskId)}`)
      }
      onComplete={actions.completeTask}
      onDefer={actions.deferTask}
      onClear={actions.clearAllData}
      onLoadDemo={actions.loadDemoData}
      onExport={actions.exportData}
      onImport={actions.importData}
      onSearchChange={actions.setSearch}
      onFilterChange={actions.setFilter}
      onSortChange={actions.setSort}
    />
  );
}

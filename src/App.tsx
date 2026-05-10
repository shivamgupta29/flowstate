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
      />
    );
  }

  return (
    <DashboardPage
      scheduled={flow.scheduled}
      scheduleEvents={flow.scheduleEvents}
      openTasks={flow.openTasks}
      completedCount={flow.completedCount}
      totalEffort={flow.totalEffort}
      backupMessage={flow.backupMessage}
      onCreateTask={() => actions.navigate('/tasks/new')}
      onCompleted={() => actions.navigate('/completed')}
      onAnalytics={() => actions.navigate('/analytics')}
      onOpenTask={(taskId) =>
        actions.navigate(`/tasks/${encodeURIComponent(taskId)}`)
      }
      onComplete={actions.completeTask}
      onDefer={actions.deferTask}
      onReset={actions.resetTasks}
      onExport={actions.exportData}
      onImport={actions.importData}
    />
  );
}

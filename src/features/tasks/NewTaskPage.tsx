import { ArrowLeft } from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
import type { TaskEditValues } from '../../lib/taskActions';
import { TaskForm } from './TaskForm';

export function NewTaskPage({
  onCreate,
  onBack,
}: {
  onCreate: (form: TaskEditValues) => void;
  onBack: () => void;
}) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </button>
          <BrandMark />
          <h1 className="text-2xl font-semibold tracking-normal text-ink mt-2">
            Add work to FlowState.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            FlowState uses this data to place the task in the right queue by understanding about the task.
          </p>
        </header>

        <TaskForm onCreate={onCreate} />
      </section>
    </main>
  );
}

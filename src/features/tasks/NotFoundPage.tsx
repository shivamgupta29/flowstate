import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';

export function NotFoundPage({ onBack }: { onBack: () => void }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <PageHeader title="Task not found" onBack={onBack} />
        <EmptyState message="This task no longer exists or was removed from local storage." />
      </section>
    </main>
  );
}

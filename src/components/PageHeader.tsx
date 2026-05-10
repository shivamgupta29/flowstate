import { ArrowLeft } from 'lucide-react';
import { BrandMark } from './BrandMark';

export function PageHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
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
      <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink">
        {title}
      </h1>
    </header>
  );
}

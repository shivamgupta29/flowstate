import { formatQueueName } from '../../config/queues';
import { formatEventTime } from '../../utils/date';
import type { ScheduleEvent } from '../../types';

export function MovementEventItem({
  event,
  taskTitle,
}: {
  event: ScheduleEvent;
  taskTitle: string;
}) {
  return (
    <article className="rounded-md bg-slate-50 p-3">
      <p className="text-sm font-semibold leading-6 text-ink">{taskTitle}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        Moved from {formatQueueName(event.previousQueue)} to{' '}
        {formatQueueName(event.nextQueue)}
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-active">
          {event.reason}
        </span>
        <time className="text-xs text-slate-400" dateTime={event.timestamp}>
          {formatEventTime(event.timestamp)}
        </time>
      </div>
    </article>
  );
}

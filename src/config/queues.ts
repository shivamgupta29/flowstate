import { Activity, Archive, Flame } from 'lucide-react';
import type { QueueName } from '../types';

export const queueNames: QueueName[] = ['focus', 'active', 'backlog'];

export const queueMeta: Record<
  QueueName,
  {
    title: string;
    description: string;
    icon: typeof Flame;
    accent: string;
  }
> = {
  focus: {
    title: 'Focus Queue',
    description: 'Deadline pressure and high-priority work.',
    icon: Flame,
    accent: 'border-focus/60 bg-focus/10 text-focus',
  },
  active: {
    title: 'Active Queue',
    description: 'Relevant tasks that should stay in rotation.',
    icon: Activity,
    accent: 'border-active/60 bg-active/10 text-active',
  },
  backlog: {
    title: 'Backlog Queue',
    description: 'Lower-pressure work that still needs visibility.',
    icon: Archive,
    accent: 'border-backlog/60 bg-backlog/10 text-backlog',
  },
};

export function formatQueueName(queueName: QueueName): string {
  return queueMeta[queueName].title.replace(' Queue', '');
}

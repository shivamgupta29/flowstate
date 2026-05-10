import { describe, expect, it } from 'vitest';
import { validateTaskValues } from './taskValidation';

const now = new Date('2026-05-10T12:00:00.000Z');

const validValues = {
  title: 'Prepare notes',
  deadline: '2026-05-11T12:00:00.000Z',
  urgency: 'medium' as const,
  estimatedEffortMinutes: 45,
};

describe('validateTaskValues', () => {
  it('fails when title is empty', () => {
    const result = validateTaskValues({ ...validValues, title: ' ' }, now);

    expect(result.errors.title).toBe('Task title is required.');
  });

  it('fails when deadline is missing', () => {
    const result = validateTaskValues({ ...validValues, deadline: '' }, now);

    expect(result.errors.deadline).toBe('Deadline is required.');
  });

  it('fails when deadline is in the past', () => {
    const result = validateTaskValues(
      { ...validValues, deadline: '2026-05-09T12:00:00.000Z' },
      now,
    );

    expect(result.errors.deadline).toBe('Deadline must be in the future.');
  });

  it('fails when effort is invalid', () => {
    const result = validateTaskValues(
      { ...validValues, estimatedEffortMinutes: 0 },
      now,
    );

    expect(result.errors.estimatedEffortMinutes).toBe(
      'Effort must be at least 15 minutes.',
    );
  });

  it('passes valid values', () => {
    const result = validateTaskValues(validValues, now);

    expect(result).toEqual({
      isValid: true,
      errors: {},
    });
  });
});

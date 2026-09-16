import { CopilotQuery } from '@sitesync/types';

export function validateCopilotQuery(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: CopilotQuery;
} {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Copilot query payload must be an object'] };
  }

  const q = input as Record<string, unknown>;

  if (!q.projectId || typeof q.projectId !== 'string' || q.projectId.trim().length === 0) {
    errors.push('projectId is required');
  }

  if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
    errors.push('question is required and cannot be empty');
  } else if (q.question.trim().length > 2000) {
    errors.push('question exceeds maximum length of 2000 characters');
  }

  const userId = typeof q.userId === 'string' && q.userId.trim().length > 0 ? q.userId.trim() : 'system-user';
  const conversationId = typeof q.conversationId === 'string' && q.conversationId.trim().length > 0
    ? q.conversationId.trim()
    : undefined;

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: (q.projectId as string).trim(),
      userId,
      question: (q.question as string).trim(),
      conversationId,
    },
  };
}

'use client';

import { Check, Clock, Archive } from 'lucide-react';
import { useActionState } from 'react';
import { moveThreadToDone, moveThreadToTrash } from '@/lib/db/actions';

interface ThreadActionsProps {
  threadId: number;
}

export function ThreadActions({ threadId }: ThreadActionsProps) {
  const initialState = {
    error: null,
    success: false,
  };

  let [doneState, doneAction, donePending] = useActionState(
    moveThreadToDone,
    initialState
  );
  let [trashState, trashAction, trashPending] = useActionState(
    moveThreadToTrash,
    initialState
  );

  return (
    <div className="flex items-center space-x-1">
      <form action={doneAction}>
        <input type="hidden" name="threadId" value={threadId} />
        <button
          type="submit"
          disabled={donePending}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
        >
          <Check size={14} className="text-gray-600" />
        </button>
      </form>
      <button
        disabled
        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-not-allowed"
      >
        <Clock size={14} className="text-gray-400" />
      </button>
      <form action={trashAction}>
        <input type="hidden" name="threadId" value={threadId} />
        <button
          type="submit"
          disabled={trashPending}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
        >
          <Archive size={14} className="text-gray-600" />
        </button>
      </form>
    </div>
  );
}

'use client';

import { Check, Clock, Archive } from 'lucide-react';
import { useActionState } from 'react';
import { moveThreadToDone, moveThreadToTrash } from '@/lib/db/actions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  return (
    <TooltipProvider>
      <div className="flex items-center space-x-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <form action={doneAction}>
              <input type="hidden" name="threadId" value={threadId} />
              <button
                type="submit"
                disabled={donePending || isProduction}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={14} className="text-gray-600" />
              </button>
            </form>
          </TooltipTrigger>
          {isProduction && (
            <TooltipContent>
              <p>Marking as done is disabled in production</p>
            </TooltipContent>
          )}
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-not-allowed"
            >
              <Clock size={14} className="text-gray-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>This feature is not yet implemented</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <form action={trashAction}>
              <input type="hidden" name="threadId" value={threadId} />
              <button
                type="submit"
                disabled={trashPending || isProduction}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Archive size={14} className="text-gray-600" />
              </button>
            </form>
          </TooltipTrigger>
          {isProduction && (
            <TooltipContent>
              <p>Moving to trash is disabled in production</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

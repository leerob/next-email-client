'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { moveThreadToDone, moveThreadToTrash } from '@/lib/db/actions';
import { cn } from '@/lib/utils';
import { Archive, Check, Clock } from 'lucide-react';
import { useActionState } from 'react';

interface ThreadActionsProps {
  threadId: number;
}

export function ThreadActions({ threadId }: ThreadActionsProps) {
  const initialState = {
    error: null,
    success: false,
  };

  const [doneState, doneAction, donePending] = useActionState(
    moveThreadToDone,
    initialState,
  );
  const [trashState, trashAction, trashPending] = useActionState(
    moveThreadToTrash,
    initialState,
  );

  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  const buttonClasses = cn(
    'h-6 w-6 cursor-pointer rounded-full transition-colors hover:bg-gray-200',
    'flex items-center justify-center',
    'disabled:cursor-not-allowed disabled:opacity-50',
  );

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
                className={buttonClasses}
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
            <button disabled className={buttonClasses}>
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
                className={buttonClasses}
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

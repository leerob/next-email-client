'use client';

import { SendIcon } from '@/app/icons/send';
import { EmailBody } from './email-body';
import { EmailInputCombobox, UserEmail } from '@/app/components/email-combobox';
import { State, sendEmail } from '@/app/db/actions';
import { useFormState } from 'react-dom';

export function Compose({ userEmails }: { userEmails: UserEmail[] }) {
  let initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useFormState(sendEmail, initialState);
  return (
    <form className="col-span-5 flex flex-col w-12/20" action={dispatch}>
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 p-2 sticky top-0 h-[60px]">
        <button
          className="flex ml-auto hover:bg-gray-200 dark:hover:bg-gray-800 rounded px-3 py-2"
          type="submit"
        >
          <SendIcon />
        </button>
      </div>
      <div className="p-1 space-y-1 flex-grow overflow-y-auto text-sm">
        <div className="relative flex flex-col justify-center space-y-2">
          <EmailInputCombobox state={state} userEmails={userEmails} />
        </div>
        <hr className="border-t border-gray-200 dark:border-gray-800" />
        <div className="relative flex flex-col space-y-2">
          <label className="absolute left-3 top-4 text-gray-500 dark:text-gray-400">
            From: Me
          </label>
          <p className="pl-20 border-none bg-white dark:bg-gray-950 text-black dark:text-white px-3 py-2 focus:outline-none">
            your@email.com
          </p>
        </div>
        <hr className="border-t border-gray-200 dark:border-gray-800" />
        <div className="relative flex flex-col space-y-2">
          {state.errors?.subject ? (
            <div
              id="email-error"
              aria-live="polite"
              className="my-2 pl-3 text-sm text-red-500"
            >
              {state.errors.subject.map((error: string) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>
        <hr className="border-t border-gray-200 dark:border-gray-800" />
        <EmailBody state={state} />
      </div>
    </form>
  );
}

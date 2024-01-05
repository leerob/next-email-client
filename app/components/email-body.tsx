'use client';

import { State } from '../db/actions';

export function EmailBody({ state }: { state: State }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div>
      <textarea
        name="body"
        rows={20}
        className="border-none bg-white dark:bg-gray-950 text-black dark:text-white px-3 py-2 focus:outline-none w-full mt-2"
        required
        onKeyDown={handleKeyDown}
      />
      {state.errors?.body ? (
        <div
          id="email-error"
          aria-live="polite"
          className="my-2 pl-3 text-sm text-red-500"
        >
          {state.errors.body.map((error: string) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

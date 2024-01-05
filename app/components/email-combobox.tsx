'use client';

import {
  Button,
  ComboBox,
  Input,
  ListBoxItem,
  Label,
  ListBox,
  Popover,
} from 'react-aria-components';
import type { ListBoxItemProps } from 'react-aria-components';
import { formatEmailString } from '@/app/db/utils';
import { State } from '../db/actions';

export type UserEmail = {
  first_name: string;
  last_name: string;
  email: string;
};

/**
 * Shoutout to the React Spectrum team
 * https://react-spectrum.adobe.com/react-aria/ComboBox.html
 */
export function EmailInputCombobox({
  userEmails,
  state,
}: {
  userEmails: UserEmail[];
  state: State;
}) {
  return (
    <div className="relative flex flex-col justify-center space-y-2">
      <ComboBox allowsCustomValue>
        <Label className="group absolute left-3 top-2 text-gray-500 dark:text-gray-400">
          To:{' '}
        </Label>
        <div className="w-full flex">
          <Input
            name="email"
            type="email"
            required
            className="pl-10 border-none bg-white dark:bg-gray-950 text-black dark:text-white px-3 py-2 focus:outline-none w-full h-9"
          />
          <Button className="w-10">+</Button>
        </div>
        {state.errors?.email ? (
          <div
            id="email-error"
            aria-live="polite"
            className="my-2 pl-3 text-sm text-red-500"
          >
            {state.errors.email.map((error: string) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}

        <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-gray-50 dark:bg-gray-950">
          <ListBox className="p-1" items={userEmails}>
            {(e) => (
              <CustomItem key={e.email} textValue={e.email}>
                <span className="truncate">
                  {formatEmailString(e, { includeFullEmail: true })}
                </span>
              </CustomItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}

function CustomItem(props: ListBoxItemProps & { children: React.ReactNode }) {
  return (
    <ListBoxItem
      {...props}
      className="group flex items-center gap-2 cursor-default select-none py-2 pl-2 pr-4 outline-none rounded text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 focus:bg-gray-900 dark:focus:bg-gray-50 focus:text-white dark:focus:text-black text-sm"
    >
      <span className="flex-1 flex items-center gap-3 truncate font-normal group-selected:font-medium">
        {props.children}
      </span>
    </ListBoxItem>
  );
}

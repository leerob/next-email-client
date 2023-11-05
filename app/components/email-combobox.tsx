'use client';

import {
  Button,
  ComboBox,
  Input,
  Item,
  Label,
  ListBox,
  Popover,
} from 'react-aria-components';
import type { ItemProps } from 'react-aria-components';
import { formatEmailString } from '@/app/db/utils';

type UserEmail = {
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
}: {
  userEmails: UserEmail[];
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

        <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-gray-50 dark:bg-gray-950">
          <ListBox className="p-1" items={userEmails}>
            {(e) => (
              <ListBoxItem key={e.email} textValue={e.email}>
                <span className="truncate">
                  {formatEmailString(e, { includeFullEmail: true })}
                </span>
              </ListBoxItem>
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}

function ListBoxItem(props: ItemProps & { children: React.ReactNode }) {
  return (
    <Item
      {...props}
      className="group flex items-center gap-2 cursor-default select-none py-2 pl-2 pr-4 outline-none rounded text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-950 focus:bg-gray-900 dark:focus:bg-gray-50 focus:text-white dark:focus:text-black text-sm"
    >
      <span className="flex-1 flex items-center gap-3 truncate font-normal group-selected:font-medium">
        {props.children}
      </span>
    </Item>
  );
}

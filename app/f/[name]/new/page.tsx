import { ChevronDown, Paperclip, Trash2 } from 'lucide-react';
import { EmailBody } from './email-body';
import { LeftSidebar } from '@/app/components/left-sidebar';

export default function ComposePage() {
  return (
    <div className="flex-grow h-full flex">
      <LeftSidebar />

      {/* Compose View */}
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-semibold mb-6">New Message</h1>
        <form className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              To
            </span>
            <input
              type="text"
              className="w-full pl-12 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              Subject
            </span>
            <input
              type="text"
              className="w-full pl-20 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder=""
            />
          </div>
          <EmailBody />
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Send
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Send later
              </button>
              <button
                type="button"
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                Remind me
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <Paperclip size={20} />
              </button>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

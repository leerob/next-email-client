'use client';

export function EmailBody() {
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
        placeholder="Tip: Hit Shift ⏎ to send"
        className="w-full h-[calc(100vh-300px)] resize-none border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

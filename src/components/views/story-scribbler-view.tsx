'use client';

import { Book } from 'lucide-react';

export default function StoryScribblerView() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="flex items-center gap-3">
        <Book className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold font-headline">StoryScribbler</h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-md text-center">
        StoryScribbler features coming soon. This tool will help you write and organize your stories.
      </p>
      <div className="mt-8 p-6 border-2 border-dashed rounded-lg max-w-lg">
        <h2 className="text-xl font-semibold mb-3">Planned Features:</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Story outlining and structure</li>
          <li>Chapter management</li>
          <li>Character development tools</li>
          <li>Plot tracking</li>
          <li>Writing prompts and exercises</li>
        </ul>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const notes = [
  {
    id: 1,
    title: 'Plot Idea: Twist Ending',
    content: 'What if the protagonist, Jane, has been imagining Leo all along? He is a manifestation of her creative side that she suppressed to become a lawyer.',
    category: 'Plot',
    color: 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800/50',
  },
  {
    id: 2,
    title: 'Character Backstory: Leo',
    content: 'Leo comes from a family of famous architects, but he rebelled to pursue his passion for art. This creates a conflict when his family disapproves of his relationship with Jane.',
    category: 'Character',
    color: 'bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800/50',
  },
  {
    id: 3,
    title: 'Dialogue Snippet',
    content: 'Jane: "You see art in everything."\nLeo: "And you see arguments in everything. Maybe that\'s why we fit."',
    category: 'Dialogue',
    color: 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800/50',
  },
  {
    id: 4,
    title: 'Location Research: Coffee Shop',
    content: 'Need to find a coffee shop with a specific aesthetic: a mix of modern industrial and cozy, with large windows. Maybe a real location in Brooklyn?',
    category: 'Research',
    color: 'bg-purple-100 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800/50',
  },
    {
    id: 5,
    title: 'Theme: Art vs. Commerce',
    content: 'Explore the central theme through Jane and Leo\'s careers. She is all about logic and commerce, he is about passion and art. Their relationship forces them to confront their own choices.',
    category: 'Theme',
    color: 'bg-pink-100 border-pink-200 dark:bg-pink-900/30 dark:border-pink-800/50',
  },
  {
    id: 6,
    title: 'Scene Idea: The Argument',
    content: 'A major argument erupts when Jane\'s boss offers Leo a lucrative but soulless corporate art commission. It brings their core conflict to a head.',
    category: 'Scene',
    color: 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800/50',
  },
];

export default function NotesView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Notes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notes.map((note) => (
          <Card key={note.id} className={cn('flex flex-col shadow-sm hover:shadow-lg transition-shadow', note.color)}>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex justify-between items-center">
                <span>{note.title}</span>
                <Badge variant="secondary">{note.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

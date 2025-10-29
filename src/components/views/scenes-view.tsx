import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clapperboard, Clock, GripVertical, Plus, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const scenes = [
  {
    number: 1,
    setting: 'INT. COFFEE SHOP - DAY',
    description: 'Jane and Leo meet for the first time.',
    time: 1.5,
  },
  {
    number: 2,
    setting: 'EXT. PARK - DAY',
    description: 'Leo sketches Jane from a distance.',
    time: 2,
  },
  {
    number: 3,
    setting: 'INT. JANE\'S OFFICE - NIGHT',
    description: 'Jane is working late, distracted by thoughts of Leo.',
    time: 1,
  },
  {
    number: 4,
    setting: 'INT. ART GALLERY - EVENING',
    description: 'Jane coincidentally attends Leo\'s first art show.',
    time: 3.5,
  },
  {
    number: 5,
    setting: 'EXT. CITY STREET - NIGHT',
    description: 'Jane and Leo walk home together after the show, talking.',
    time: 4,
  },
];

export default function ScenesView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Scenes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Scene
        </Button>
      </div>

      <div className="space-y-4">
        {scenes.map((scene) => (
          <Card key={scene.number} className="flex items-center p-2 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-4 flex-1">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab flex-shrink-0" />
              <div className="flex items-center gap-2 sm:gap-4 flex-1">
                <Clapperboard className="h-8 w-8 text-primary hidden sm:block" />
                <div className="flex-1">
                  <p className="font-bold">Scene {scene.number}: {scene.setting}</p>
                  <p className="text-sm text-muted-foreground sm:hidden mt-1">{scene.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 sm:hidden">
                    <Clock className="h-4 w-4" />
                    <span>{scene.time} min</span>
                  </div>
                   <p className="text-sm text-muted-foreground hidden sm:block">{scene.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{scene.time} min</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 sm:ml-4 flex-shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
    </div>
  );
}

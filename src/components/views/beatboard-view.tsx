'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clapperboard, Plus, LayoutGrid } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { useCurrentScript } from '@/context/current-script-context';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

// Re-using the Scene interface from scenes-view
export interface Scene {
  id: string;
  sceneNumber: number;
  setting: string;
  description: string;
  time: number;
}

export default function BeatboardView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { currentScriptId } = useCurrentScript();

  const scenesCollection = useMemoFirebase(
    () => (user && firestore && currentScriptId ? collection(firestore, 'users', user.uid, 'scripts', currentScriptId, 'scenes') : null),
    [firestore, user, currentScriptId]
  );
  
  const scenesQuery = useMemoFirebase(
    () => (scenesCollection ? query(scenesCollection, orderBy('sceneNumber', 'asc')) : null),
    [scenesCollection]
  );

  const { data: scenes, isLoading: areScenesLoading } = useCollection<Scene>(scenesQuery);

  if (areScenesLoading) {
    return (
       <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
             <Card key={i} className="h-56">
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className='space-y-1'>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <LayoutGrid />
                Beatboard
            </h1>
            <p className="text-muted-foreground">Visualize your story's structure with scene cards.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Scene
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {scenes && scenes.map((scene) => (
          <Card key={scene.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-56">
            <CardHeader>
                <CardTitle className='font-headline text-lg flex items-start justify-between gap-2'>
                    <span className="truncate">Scene {scene.sceneNumber}: {scene.setting}</span>
                    <span className="text-sm font-medium text-muted-foreground flex-shrink-0">{scene.time}'</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                 <p className="text-sm text-muted-foreground line-clamp-4">{scene.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
       {!areScenesLoading && scenes && scenes.length === 0 && (
         <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg col-span-full">
            <Clapperboard className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">No Scenes Found</h3>
            <p className="mt-1 text-sm">Add a scene to get started with your beatboard.</p>
         </div>
      )}
    </div>
  );
}

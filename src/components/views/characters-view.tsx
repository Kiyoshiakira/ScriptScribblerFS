'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles, User, FileText } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getAiCharacterProfile } from '@/app/actions';
import { Skeleton } from '../ui/skeleton';

const characters = [
  {
    name: 'Jane',
    description: 'A sharp, ambitious lawyer.',
    imageId: 'character1',
    scenes: 5,
  },
  {
    name: 'Leo',
    description: 'A free-spirited artist.',
    imageId: 'character2',
    scenes: 4,
  },
  {
    name: 'Barista',
    description: 'An easily flustered coffee shop employee.',
    imageId: 'character3',
    scenes: 1,
  },
  {
    name: 'Mr. Henderson',
    description: "Jane's demanding boss.",
    imageId: 'character4',
    scenes: 1,
  },
  {
    name: 'Chloe',
    description: "Leo's supportive artist friend.",
    imageId: 'character5',
    scenes: 2,
  },
];

const getImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

function AddCharacterDialog() {
  const [description, setDescription] = useState('');
  const [generatedProfile, setGeneratedProfile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description) {
      toast({
        variant: 'destructive',
        title: 'Description needed',
        description: 'Please enter a brief character description to generate a profile.',
      });
      return;
    }
    setIsLoading(true);
    setGeneratedProfile('');
    const result = await getAiCharacterProfile({ characterDescription: description });
    setIsLoading(false);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      setGeneratedProfile(result.data.characterProfile);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Character
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Character</DialogTitle>
          <DialogDescription>
            Create a new character profile. Use the AI generator for a detailed starting point.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" placeholder="Character's Name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <div className="col-span-3 space-y-2">
              <Textarea
                id="description"
                placeholder="e.g., A grizzled detective haunted by his past."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              <Button size="sm" variant="outline" onClick={handleGenerate} disabled={isLoading}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate with AI'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="profile" className="text-right pt-2">
              Profile
            </Label>
            {isLoading ? (
                <div className='space-y-2 col-span-3'>
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ) : (
                <Textarea
                id="profile"
                className="col-span-3 min-h-[200px]"
                placeholder="Full character profile will appear here..."
                value={generatedProfile}
                onChange={e => setGeneratedProfile(e.target.value)}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Character</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CharactersView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Characters</h1>
        <AddCharacterDialog />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {characters.map((character) => {
          const image = getImage(character.imageId);
          return (
            <Card key={character.name} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={`Portrait of ${character.name}`}
                    width={200}
                    height={300}
                    className="w-full h-48 object-cover"
                    data-ai-hint={image.imageHint}
                  />
                )}
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="font-headline text-lg">{character.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{character.description}</p>
              </CardContent>
              <CardFooter className="p-4 bg-muted/50 flex justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                </div>
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-medium">{character.scenes} Scenes</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

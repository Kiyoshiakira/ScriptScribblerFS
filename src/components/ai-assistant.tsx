'use client';
import { useState } from 'react';
import { getAiSuggestions } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Sparkles } from 'lucide-react';

interface AiAssistantProps {
  scriptContent: string;
}

export default function AiAssistant({ scriptContent }: AiAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    const result = await getAiSuggestions({ screenplay: scriptContent });
    setIsLoading(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    } else if (result.data) {
      setSuggestions(result.data.suggestions);
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>AI Assistant</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <Button onClick={handleGetSuggestions} disabled={isLoading}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isLoading ? 'Thinking...' : 'Suggest Improvements'}
        </Button>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">Suggestions</p>
          <ScrollArea className="h-[calc(100vh-22rem)] rounded-md border p-4">
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-4/5" />
              </div>
            )}
            {!isLoading && suggestions.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                Click the button to get AI-powered suggestions for your scene.
              </div>
            )}
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex gap-3">
                  <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

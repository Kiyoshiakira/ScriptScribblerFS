'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PlayCircle, Wifi, Users } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';

interface CollabSessionStarterProps {
  onStartSession: (sessionType: 'persistent' | 'live') => void;
}

export default function CollabSessionStarter({ onStartSession }: CollabSessionStarterProps) {
  const [sessionType, setSessionType] = useState<'persistent' | 'live'>('persistent');

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
      <h3 className="text-lg font-semibold font-headline mb-4">Start a Collaboration Session</h3>
      
      <RadioGroup
        defaultValue="persistent"
        className="grid grid-cols-2 gap-4 mb-6"
        onValueChange={(value: 'persistent' | 'live') => setSessionType(value)}
      >
        <Label htmlFor="persistent-session" className="cursor-pointer">
          <Card className={cn(
            "p-4 border-2 transition-colors",
            sessionType === 'persistent' ? 'border-primary' : 'border-border'
          )}>
            <CardContent className="p-0 flex flex-col items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              <p className="font-semibold">Persistent</p>
              <p className="text-xs text-muted-foreground">
                Changes and chats are saved. Work anytime.
              </p>
            </CardContent>
          </Card>
          <RadioGroupItem value="persistent" id="persistent-session" className="sr-only" />
        </Label>

        <Label htmlFor="live-session" className="cursor-pointer">
          <Card className={cn(
            "p-4 border-2 transition-colors",
            sessionType === 'live' ? 'border-primary' : 'border-border'
          )}>
            <CardContent className="p-0 flex flex-col items-center gap-2">
              <Wifi className="w-8 h-8 text-accent" />
              <p className="font-semibold">Live</p>
              <p className="text-xs text-muted-foreground">
                For real-time sessions. Data is not saved.
              </p>
            </CardContent>
          </Card>
          <RadioGroupItem value="live" id="live-session" className="sr-only" />
        </Label>
      </RadioGroup>

      <Button size="lg" className="w-full" onClick={() => onStartSession(sessionType)}>
        <PlayCircle className="mr-2 h-5 w-5" />
        Start Session
      </Button>
    </div>
  );
}

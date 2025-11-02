'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettings, type AiModel } from '@/context/settings-context';
import { Skeleton } from './ui/skeleton';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_MODELS: { value: AiModel; label: string; description: string }[] = [
  {
    value: 'gemini-1.5-flash-latest',
    label: 'Gemini 1.5 Flash',
    description: 'Fast and cost-effective for most tasks.',
  },
  {
    value: 'gemini-1.5-pro-latest',
    label: 'Gemini 1.5 Pro',
    description: 'Highest-quality model for complex reasoning.',
  },
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, setAiModel, isSettingsLoading } = useSettings();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Settings</DialogTitle>
          <DialogDescription>
            Customize your ScriptScribbler experience.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ai-model-select">AI Model</Label>
            {isSettingsLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={settings.aiModel}
                onValueChange={(value: AiModel) => setAiModel(value)}
              >
                <SelectTrigger id="ai-model-select">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              The AI model used for generation, analysis, and other AI features.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

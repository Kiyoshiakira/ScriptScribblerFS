'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-suggest-scene-improvements.ts';
import '@/ai/flows/ai-deep-analysis.ts';
import '@/ai/flows/ai-agent-orchestrator.ts';
import '@/ai/flows/ai-proofread-script.ts';
import '@/ai/flows/ai-generate-character-profile.ts';
import '@/ai/flows/ai-generate-note.ts';
import '@/ai/flows/ai-generate-logline.ts';
import '@/ai/flows/ai-reformat-script.ts';
import '@/ai/flows/ai-diagnose-app-health.ts';

    

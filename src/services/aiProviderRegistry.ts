/**
 * AI Provider Registry
 * 
 * Manages registration and selection of AI providers.
 * Provides a central point for accessing configured AI providers.
 * 
 * ## Gemini 3.0 Compatibility
 * 
 * This registry has been updated to use Gemini 3.0 models by default.
 * Model selection can be overridden via environment variables.
 */

import { AiProvider, AiProviderConfig } from './aiProvider';
import { GoogleAiProvider } from './googleAiProvider';
import { DEFAULT_GEMINI_MODEL, getGeminiModel } from '@/ai/model-config';

/**
 * Available provider types
 */
export type ProviderType = 'google-ai' | 'openai' | 'local';

/**
 * Provider registry entry
 */
interface ProviderEntry {
  type: ProviderType;
  factory: (config: AiProviderConfig) => AiProvider;
  displayName: string;
  description: string;
  requiresApiKey: boolean;
}

/**
 * Singleton registry for AI providers
 */
class AiProviderRegistry {
  private providers: Map<ProviderType, ProviderEntry> = new Map();
  private activeProvider: AiProvider | null = null;

  constructor() {
    // Register built-in providers
    this.registerProvider({
      type: 'google-ai',
      factory: (config) => new GoogleAiProvider(config),
      displayName: 'Google AI (Gemini)',
      description: 'Google\'s Gemini AI models',
      requiresApiKey: true,
    });

    // Placeholder for OpenAI (can be implemented later)
    this.registerProvider({
      type: 'openai',
      factory: (config) => {
        throw new Error('OpenAI provider not yet implemented');
      },
      displayName: 'OpenAI',
      description: 'OpenAI GPT models (coming soon)',
      requiresApiKey: true,
    });

    // Placeholder for local models (can be implemented later)
    this.registerProvider({
      type: 'local',
      factory: (config) => {
        throw new Error('Local model provider not yet implemented');
      },
      displayName: 'Local Model',
      description: 'Self-hosted AI models (coming soon)',
      requiresApiKey: false,
    });
  }

  /**
   * Register a new provider type
   */
  private registerProvider(entry: ProviderEntry): void {
    this.providers.set(entry.type, entry);
  }

  /**
   * Get list of available provider types
   */
  getAvailableProviders(): ProviderEntry[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider entry by type
   */
  getProviderEntry(type: ProviderType): ProviderEntry | undefined {
    return this.providers.get(type);
  }

  /**
   * Create and configure a provider instance
   */
  createProvider(type: ProviderType, config: AiProviderConfig): AiProvider {
    const entry = this.providers.get(type);
    if (!entry) {
      throw new Error(`Unknown provider type: ${type}`);
    }

    return entry.factory(config);
  }

  /**
   * Set the active provider
   */
  setActiveProvider(provider: AiProvider): void {
    this.activeProvider = provider;
  }

  /**
   * Get the active provider
   */
  getActiveProvider(): AiProvider | null {
    return this.activeProvider;
  }

  /**
   * Clear the active provider
   */
  clearActiveProvider(): void {
    this.activeProvider = null;
  }
}

/**
 * Singleton instance of the registry
 */
export const providerRegistry = new AiProviderRegistry();

/**
 * Helper to initialize provider from environment/settings
 * 
 * Uses the centralized model configuration from ai/model-config.ts
 */
export function initializeProviderFromEnv(): AiProvider | null {
  // Check for Google AI configuration
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim()) {
    const provider = providerRegistry.createProvider('google-ai', {
      name: 'google-ai',
      apiKey: geminiKey,
      model: getGeminiModel(), // Use centralized model config
      temperature: 0.7,
      maxTokens: 1024,
    });

    // Set usage limit based on environment (default: 100)
    const usageLimit = parseInt(process.env.AI_USAGE_LIMIT || '100', 10);
    provider.setUsageLimit(usageLimit);

    providerRegistry.setActiveProvider(provider);
    return provider;
  }

  return null;
}

/**
 * Helper to get or initialize the active provider
 */
export function getActiveProvider(): AiProvider | null {
  let provider = providerRegistry.getActiveProvider();
  
  if (!provider) {
    provider = initializeProviderFromEnv();
  }

  return provider;
}

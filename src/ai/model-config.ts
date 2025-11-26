/**
 * Centralized Gemini AI Model Configuration
 * 
 * This file provides a single source of truth for Gemini model configuration.
 * All AI flows should import model settings from here to ensure consistency
 * and make upgrades easier.
 * 
 * ## Gemini 3.0 Compatibility
 * 
 * This codebase has been upgraded to use Gemini 3.0 models. Key changes:
 * - Default model: gemini-3.0-pro (previously gemini-2.5-flash)
 * - System instructions are passed via the `system` parameter in definePrompt,
 *   NOT in `config.systemInstruction` which causes "Unknown name" errors
 * - All generation config parameters are validated against Gemini 3.0 OpenAPI spec
 * 
 * ## Fallback Configuration
 * 
 * If you need to use an older model version for compatibility reasons,
 * set the GEMINI_MODEL_OVERRIDE environment variable.
 * 
 * @module ai/model-config
 */

import { googleAI } from '@genkit-ai/google-genai';

/**
 * The default Gemini model to use across all AI flows.
 * 
 * Gemini 3.0 Pro offers improved reasoning, instruction following,
 * and multimodal capabilities compared to previous versions.
 * 
 * For experimental features or faster inference, you can use:
 * - 'gemini-3.0-flash' for faster responses with slightly reduced quality
 * - 'gemini-3.0-pro-exp' for experimental features
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.0-pro';

/**
 * Fallback model for compatibility or when 3.0 is unavailable.
 * Can be activated via GEMINI_MODEL_OVERRIDE environment variable.
 */
export const FALLBACK_GEMINI_MODEL = 'gemini-2.0-flash-exp';

/**
 * Get the configured Gemini model, respecting environment overrides.
 * 
 * @returns The model identifier string to use
 */
export function getGeminiModel(): string {
  // Allow runtime override via environment variable
  const override = process.env.GEMINI_MODEL_OVERRIDE;
  if (override && override.trim()) {
    console.log(`[AI Config] Using model override: ${override}`);
    return override.trim();
  }
  return DEFAULT_GEMINI_MODEL;
}

/**
 * Get a Genkit-compatible model reference for use in definePrompt.
 * 
 * @returns A googleAI.model() reference configured with the default model
 */
export function getDefaultModel() {
  return googleAI.model(getGeminiModel());
}

/**
 * Default generation configuration for balanced output.
 * 
 * These settings work well for most screenwriting tasks.
 * Adjust temperature and maxOutputTokens as needed for specific flows.
 */
export const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 1024,
} as const;

/**
 * Generation config for creative writing tasks.
 * Higher temperature for more varied, creative outputs.
 */
export const CREATIVE_GENERATION_CONFIG = {
  temperature: 0.9,
  maxOutputTokens: 2048,
} as const;

/**
 * Generation config for editing and proofreading tasks.
 * Lower temperature for more consistent, accurate outputs.
 */
export const PRECISE_GENERATION_CONFIG = {
  temperature: 0.3,
  maxOutputTokens: 1024,
} as const;

/**
 * Generation config for analysis and diagnostic tasks.
 * Very low temperature for deterministic, factual outputs.
 */
export const ANALYTICAL_GENERATION_CONFIG = {
  temperature: 0.1,
  maxOutputTokens: 1024,
} as const;

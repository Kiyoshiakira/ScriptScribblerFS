/**
 * @fileoverview A parser to convert raw screenplay text into a structured document model.
 */

import { ScriptBlock, ScriptBlockType, ScriptDocument } from './editor-types';

// Regular expressions to identify different screenplay elements.
const Patterns = {
  // Scene headings: INT. or EXT., followed by a location and time of day.
  // Handles variations like I/E. and INT./EXT.
  sceneHeading: /^(INT|EXT|I\/E|INT\.\/EXT)\. .*/i,
  // Transitions: e.g., FADE IN:, CUT TO:, DISSOLVE TO.
  transition: /(FADE (IN|OUT):|CUT TO:|DISSOLVE TO:|SMASH CUT TO:)$/i,
  // Character names: Typically all caps, not followed by dialogue on the same line.
  character: /^[A-Z][A-Z0-9 \t]+(?:\(V\.O\.\)|\(O\.S\.\))?$/,
  // Parentheticals: Enclosed in parentheses on their own line.
  parenthetical: /^\(.*\)$/,
};

/**
 * A simple unique ID generator for blocks. In a real app, a library like nanoid would be better.
 */
const generateId = () => `block_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Parses a raw screenplay string into a structured ScriptDocument.
 *
 * @param rawScript The full text content of the screenplay.
 * @returns A ScriptDocument object representing the structured screenplay.
 */
export function parseScreenplay(rawScript: string): ScriptDocument {
  if (!rawScript || typeof rawScript !== 'string') {
    return { blocks: [] };
  }

  const lines = rawScript.split('\n');
  const blocks: ScriptBlock[] = [];
  let previousBlockType: ScriptBlockType | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Empty lines are ignored for classification but can influence context (e.g., separating action lines).
    if (trimmedLine === '') {
      // Reset context so the next line is likely action unless it matches a specific pattern.
      if (previousBlockType !== ScriptBlockType.ACTION) {
        previousBlockType = null;
      }
      continue;
    }

    let currentBlockType: ScriptBlockType | null = null;

    if (Patterns.sceneHeading.test(trimmedLine)) {
      currentBlockType = ScriptBlockType.SCENE_HEADING;
    } else if (Patterns.transition.test(trimmedLine)) {
      currentBlockType = ScriptBlockType.TRANSITION;
    } else if (Patterns.parenthetical.test(trimmedLine) && previousBlockType === ScriptBlockType.CHARACTER) {
      // A parenthetical must follow a character.
      currentBlockType = ScriptBlockType.PARENTHETICAL;
    } else if (Patterns.character.test(trimmedLine)) {
      currentBlockType = ScriptBlockType.CHARACTER;
    } else if (previousBlockType === ScriptBlockType.CHARACTER || previousBlockType === ScriptBlockType.PARENTHETICAL) {
      // Anything after a character or parenthetical is dialogue.
      currentBlockType = ScriptBlockType.DIALOGUE;
    } else {
      // If no other pattern matches, it's an action line.
      currentBlockType = ScriptBlockType.ACTION;
    }

    // Merge consecutive action lines into a single block.
    if (currentBlockType === ScriptBlockType.ACTION && previousBlockType === ScriptBlockType.ACTION) {
        const lastBlock = blocks[blocks.length - 1];
        if (lastBlock) {
            lastBlock.text += '\n' + trimmedLine;
            continue; // Skip creating a new block
        }
    }


    blocks.push({
      id: generateId(),
      type: currentBlockType,
      text: trimmedLine,
    });

    previousBlockType = currentBlockType;
  }

  return { blocks };
}

/**
 * Serializes a ScriptDocument back into a raw screenplay string.
 *
 * @param scriptDoc The structured ScriptDocument.
 * @returns A raw string representation of the screenplay.
 */
export function serializeScript(scriptDoc: ScriptDocument): string {
    if (!scriptDoc || !scriptDoc.blocks) {
        return '';
    }

    // Simple serialization for now, just joining text with appropriate newlines.
    // A more advanced serializer would handle margins and formatting.
    return scriptDoc.blocks.map(block => block.text).join('\n\n');
}

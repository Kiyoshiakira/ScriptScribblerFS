/**
 * @jest-environment jsdom
 */

import { parseScreenplay } from '../screenplay-parser';
import { ScriptBlockType } from '../editor-types';

describe('parseScreenplay', () => {
  it('should parse a simple screenplay with basic elements', () => {
    const rawScript = `INT. COFFEE SHOP - DAY

JOHN enters the coffee shop.

JOHN
I need a coffee.`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks).toHaveLength(4);
    expect(result.blocks[0].type).toBe(ScriptBlockType.SCENE_HEADING);
    expect(result.blocks[0].content).toBe('INT. COFFEE SHOP - DAY');
    expect(result.blocks[1].type).toBe(ScriptBlockType.ACTION);
    expect(result.blocks[2].type).toBe(ScriptBlockType.CHARACTER);
    expect(result.blocks[3].type).toBe(ScriptBlockType.DIALOGUE);
  });

  it('should handle scene headings correctly', () => {
    const rawScript = `INT. OFFICE - DAY
EXT. PARK - NIGHT
I/E. CAR - EVENING`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks).toHaveLength(3);
    result.blocks.forEach(block => {
      expect(block.type).toBe(ScriptBlockType.SCENE_HEADING);
    });
  });

  it('should identify character names', () => {
    const rawScript = `SARAH
Hello world.

JOHN (V.O.)
From the distance.`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks[0].type).toBe(ScriptBlockType.CHARACTER);
    expect(result.blocks[0].content).toBe('SARAH');
    expect(result.blocks[2].type).toBe(ScriptBlockType.CHARACTER);
    expect(result.blocks[2].content).toBe('JOHN (V.O.)');
  });

  it('should parse dialogue with parentheticals', () => {
    const rawScript = `JANE
(whispering)
This is a secret.`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks).toHaveLength(3);
    expect(result.blocks[0].type).toBe(ScriptBlockType.CHARACTER);
    expect(result.blocks[1].type).toBe(ScriptBlockType.PARENTHETICAL);
    expect(result.blocks[1].content).toBe('(whispering)');
    expect(result.blocks[2].type).toBe(ScriptBlockType.DIALOGUE);
  });

  it('should handle transitions', () => {
    const rawScript = `INT. ROOM - DAY

Action happens.

CUT TO:

EXT. GARDEN - DAY`;

    const result = parseScreenplay(rawScript);

    const transitionBlock = result.blocks.find(b => b.type === ScriptBlockType.TRANSITION);
    expect(transitionBlock).toBeDefined();
    expect(transitionBlock?.content).toBe('CUT TO:');
  });

  it('should parse centered text', () => {
    const rawScript = `> THE END <`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe(ScriptBlockType.CENTERED);
  });

  it('should handle empty lines', () => {
    const rawScript = `INT. ROOM - DAY


Action line.`;

    const result = parseScreenplay(rawScript);

    // Empty lines should be filtered out or preserved as spacing
    const nonEmptyBlocks = result.blocks.filter(b => b.content.trim() !== '');
    expect(nonEmptyBlocks.length).toBeGreaterThan(0);
  });

  it('should parse a complete scene', () => {
    const rawScript = `INT. LIVING ROOM - NIGHT

MARY sits on the couch reading a book. The room is dimly lit.

MARY
(to herself)
This chapter is fascinating.

The phone RINGS. Mary looks up.

MARY (CONT'D)
Who could that be?`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks.length).toBeGreaterThan(0);
    
    // Check for scene heading
    const sceneHeadings = result.blocks.filter(b => b.type === ScriptBlockType.SCENE_HEADING);
    expect(sceneHeadings.length).toBe(1);
    
    // Check for character blocks
    const characters = result.blocks.filter(b => b.type === ScriptBlockType.CHARACTER);
    expect(characters.length).toBeGreaterThanOrEqual(1);
    
    // Check for dialogue
    const dialogue = result.blocks.filter(b => b.type === ScriptBlockType.DIALOGUE);
    expect(dialogue.length).toBeGreaterThanOrEqual(1);
    
    // Check for action
    const action = result.blocks.filter(b => b.type === ScriptBlockType.ACTION);
    expect(action.length).toBeGreaterThanOrEqual(1);
  });

  it('should generate unique IDs for blocks', () => {
    const rawScript = `INT. ROOM - DAY
Action.
CHARACTER
Dialogue.`;

    const result = parseScreenplay(rawScript);

    const ids = result.blocks.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should handle forced scene headings with period prefix', () => {
    const rawScript = `.A forced scene heading`;

    const result = parseScreenplay(rawScript);

    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0].type).toBe(ScriptBlockType.SCENE_HEADING);
  });
});

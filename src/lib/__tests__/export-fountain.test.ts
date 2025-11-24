/**
 * @jest-environment jsdom
 */

import { exportToFountain } from '../export-fountain';
import { ScriptDocument, ScriptBlockType } from '../editor-types';

describe('exportToFountain', () => {
  it('should export a simple screenplay to Fountain format', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'INT. COFFEE SHOP - DAY',
          metadata: {},
        },
        {
          id: '2',
          type: ScriptBlockType.ACTION,
          content: 'JOHN enters the coffee shop.',
          metadata: {},
        },
        {
          id: '3',
          type: ScriptBlockType.CHARACTER,
          content: 'JOHN',
          metadata: {},
        },
        {
          id: '4',
          type: ScriptBlockType.DIALOGUE,
          content: 'I need a coffee.',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toContain('INT. COFFEE SHOP - DAY');
    expect(fountain).toContain('JOHN enters the coffee shop.');
    expect(fountain).toContain('JOHN');
    expect(fountain).toContain('I need a coffee.');
  });

  it('should handle empty script', () => {
    const scriptDoc: ScriptDocument = {
      id: 'empty-script',
      blocks: [],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toBe('');
  });

  it('should format scene headings correctly', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'EXT. PARK - NIGHT',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toContain('EXT. PARK - NIGHT');
  });

  it('should format character names in uppercase', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.CHARACTER,
          content: 'sarah',
          metadata: {},
        },
        {
          id: '2',
          type: ScriptBlockType.DIALOGUE,
          content: 'Hello world.',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toContain('SARAH');
    expect(fountain).toContain('Hello world.');
  });

  it('should handle parentheticals in dialogue', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.CHARACTER,
          content: 'JANE',
          metadata: {},
        },
        {
          id: '2',
          type: ScriptBlockType.PARENTHETICAL,
          content: '(whispering)',
          metadata: {},
        },
        {
          id: '3',
          type: ScriptBlockType.DIALOGUE,
          content: 'This is a secret.',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toContain('JANE');
    expect(fountain).toContain('(whispering)');
    expect(fountain).toContain('This is a secret.');
  });

  it('should add proper spacing between scenes', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'INT. OFFICE - DAY',
          metadata: {},
        },
        {
          id: '2',
          type: ScriptBlockType.ACTION,
          content: 'Work happens.',
          metadata: {},
        },
        {
          id: '3',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'EXT. STREET - NIGHT',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    // Should have proper line breaks between scenes
    expect(fountain).toMatch(/INT\. OFFICE - DAY[\s\S]*Work happens\.[\s\S]*EXT\. STREET - NIGHT/);
  });

  it('should handle transitions', () => {
    const scriptDoc: ScriptDocument = {
      id: 'test-script',
      blocks: [
        {
          id: '1',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'INT. ROOM - DAY',
          metadata: {},
        },
        {
          id: '2',
          type: ScriptBlockType.TRANSITION,
          content: 'CUT TO:',
          metadata: {},
        },
        {
          id: '3',
          type: ScriptBlockType.SCENE_HEADING,
          content: 'EXT. GARDEN - DAY',
          metadata: {},
        },
      ],
    };

    const fountain = exportToFountain(scriptDoc);

    expect(fountain).toContain('CUT TO:');
  });
});

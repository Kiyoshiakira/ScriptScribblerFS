
'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ScriptBlock, ScriptBlockType } from '@/lib/editor-types';
import { Button } from './ui/button';
import { Scissors } from 'lucide-react';
import { useScript } from '@/context/script-context';

interface ScriptBlockProps {
  block: ScriptBlock;
  onChange: (blockId: string, newText: string) => void;
  isHighlighted: boolean;
}

// These styles are inspired by standard screenplay formatting.
const getBlockStyles = (type: ScriptBlockType): string => {
  switch (type) {
    case ScriptBlockType.SCENE_HEADING:
      return 'font-bold uppercase mt-6 mb-2';
    case ScriptBlockType.ACTION:
      return 'my-2';
    case ScriptBlockType.CHARACTER:
      return 'text-center uppercase mt-4 mb-1 w-full';
    case ScriptBlockType.PARENTHETICAL:
      return 'text-center text-sm my-1 w-7/12 mx-auto';
    case ScriptBlockType.DIALOGUE:
      return 'my-1 w-9/12 md:w-7/12 mx-auto';
    case ScriptBlockType.TRANSITION:
      return 'text-right uppercase mt-4 mb-2 w-full';
    default:
      return 'my-2';
  }
};

const ScriptBlockComponent: React.FC<ScriptBlockProps> = ({ block, onChange, isHighlighted }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const { splitScene, insertBlockAfter, cycleBlockType } = useScript();

  // This effect ensures that if the block's text is updated from an external
  // source (like a find-and-replace), the DOM is updated to match.
  useEffect(() => {
    const element = elementRef.current;
    if (element && element.innerText !== block.text) {
      element.innerText = block.text;
    }
  }, [block.text]);

  // This effect scrolls the highlighted block into view.
  useEffect(() => {
    const element = elementRef.current;
    if (element && isHighlighted) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);


  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    if (newText !== block.text) {
      onChange(block.id, newText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const currentElement = e.currentTarget;

      if(range && currentElement.innerText.length === range.endOffset) {
        // Cursor is at the end of the line, normal behavior
        insertBlockAfter(block.id);
      } else if (range) {
        // Cursor is in the middle, split the block
        const textBeforeCursor = currentElement.innerText.substring(0, range.startOffset);
        const textAfterCursor = currentElement.innerText.substring(range.startOffset);
        onChange(block.id, textBeforeCursor);
        insertBlockAfter(block.id, textAfterCursor);
      }
    }

    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      cycleBlockType(block.id);
    }
  };

  const isSceneHeading = block.type === ScriptBlockType.SCENE_HEADING;

  return (
    <div className={cn('relative group', getBlockStyles(block.type))}>
        <div
            ref={elementRef}
            contentEditable
            suppressContentEditableWarning={true}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
                'w-full outline-none p-0.5 rounded-sm transition-colors whitespace-pre-wrap',
                isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800' : 'focus:bg-muted/50'
            )}
            data-block-id={block.id}
            data-block-type={block.type}
            dangerouslySetInnerHTML={{ __html: block.text }}
        />
        {isSceneHeading && (
             <Button
                variant="ghost"
                size="icon"
                className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => splitScene(block.id)}
                aria-label="Split scene"
            >
                <Scissors className="h-4 w-4" />
            </Button>
        )}
    </div>
  );
};

export default ScriptBlockComponent;

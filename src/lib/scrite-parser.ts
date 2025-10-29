import JSZip from 'jszip';

export type NoteCategory = 'Plot' | 'Character' | 'Dialogue' | 'Research' | 'Theme' | 'Scene' | 'General';

export interface ParsedNote {
  id?: string;
  title: string;
  content: string;
  category: NoteCategory;
  imageUrl?: string;
}

export interface ParsedCharacter {
    id?: string;
    name: string;
    description: string;
    scenes: number;
    profile?: string;
    imageUrl?: string;
}

export interface ParsedScriteFile {
  script: string;
  characters: ParsedCharacter[];
  notes: ParsedNote[];
  scenes: { number: number; setting: string; description: string; time: number }[];
}

// A helper to safely get an array from a JSON object property
const getAsArray = (obj: any) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return [obj];
};

// A helper to parse Quill Delta format to plain text
const parseQuillDelta = (delta: any): string => {
    if (!delta || !delta.ops) return '';
    return delta.ops.map((op: any) => op.insert || '').join('');
};


export const parseScriteFile = async (fileData: ArrayBuffer): Promise<ParsedScriteFile> => {
  const zip = await JSZip.loadAsync(fileData);
  
  const headerFile = zip.file('_header.json');
  if (!headerFile) {
    const fileList = Object.keys(zip.files).join(', ');
    throw new Error(`Invalid .scrite file: _header.json not found. Files in archive: [${fileList}]`);
  }
  
  const headerData = await headerFile.async('string');
  const jsonObj = JSON.parse(headerData);

  const structure = jsonObj.structure;
  if (!structure) {
    throw new Error('Invalid Scrite JSON structure: <structure> tag not found.');
  }

  // 1. Parse Script Content
  let scriptContent = '';
  const scenesFromStructure = getAsArray(structure.elements);

  scenesFromStructure.forEach((sceneContainer: any) => {
    if (sceneContainer.scene?.elements) {
      const sceneElements = getAsArray(sceneContainer.scene.elements);
      const heading = sceneContainer.scene.heading;
      if (heading) {
        scriptContent += `${heading.locationType.toUpperCase()} ${heading.location.toUpperCase()} - ${heading.moment.toUpperCase()}\n\n`;
      }
      sceneElements.forEach((element: any) => {
        let text = element.text || '';
        text = text.replace(/<[^>]*>?/gm, ''); // Strip any HTML tags if present

        switch(element.type) {
            case 'Action':
                scriptContent += text + '\n\n';
                break;
            case 'Character':
                scriptContent += `\t${text.toUpperCase()}\n`;
                break;

            case 'Parenthetical':
                scriptContent += `\t${text}\n`;
                break;
            case 'Dialogue':
                 scriptContent += `\t\t${text}\n\n`;
                break;
             case 'Transition':
                scriptContent += `\t\t\t\t\t\t${text.toUpperCase()}\n\n`;
                break;
            default:
                scriptContent += text + '\n';
        }
      });
    }
  });

  // 2. Parse Characters
  const characters: ParsedCharacter[] = [];
  const characterList = getAsArray(structure.characters);
  
  characterList.forEach((char: any) => {
    const description = char.summary ? parseQuillDelta(char.summary) : (char.designation || '');
    characters.push({
      name: char.name || 'Unnamed',
      description: description.split('\n')[0], 
      scenes: 0, 
      profile: description, 
    });
  });

  // 3. Parse Notes
  const notes: ParsedNote[] = [];
  const notesList = getAsArray(jsonObj.screenplay?.notes?.['#data']);
  
  if (notesList) {
    notesList.forEach((note: any, index: number) => {
      if(note.type === 'TextNoteType' && note.content){
         notes.push({
            title: note.title || 'Untitled Note',
            content: parseQuillDelta(note.content),
            category: 'General', 
        });
      }
    });
  }
  
  const scenes: ParsedScriteFile['scenes'] = [];
  
  return {
    script: scriptContent.trim(),
    characters,
    notes,
    scenes,
  };
};

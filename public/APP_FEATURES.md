# Welcome to ScriptScribbler!

ScriptScribbler is your AI-powered screenwriting partner, designed to help you bring your stories to life. Our goal is to blend a powerful, clean writing environment with intelligent tools that assist you at every step of the creative process.

## Application Architecture

ScriptScribbler is a **single-page application** with a **tabbed sidebar interface**. Navigate between different aspects of your screenplay using the tabs in the left sidebar:

- **Dashboard Tab**: Your script management hub
- **Editor Tab**: Full-featured screenplay editor
- **Logline Tab**: Craft compelling story summaries
- **Scenes Tab**: Organize and manage your scenes
- **Characters Tab**: Create and track character profiles
- **Notes Tab**: Keep all your ideas in one place

**Profile Management**: Access your profile settings by clicking the avatar in the top-right corner (not in the sidebar).

## Core Features

### 📝 Full-Featured Script Editor (Editor Tab)
A professional editor that understands screenplay formatting. Just type, and let the editor handle the structure.
- **Automatic Formatting**: Intelligently formats scene headings, actions, characters, dialogue, and transitions.
- **Tab to Cycle**: Quickly cycle through element types with the `Tab` key.
- **Script Statistics**: Keep track of your script's word count and estimated run time right from the sidebar.

### 🤖 AI Assistant & Tools (Available in Editor Tab)
Our integrated AI is here to help you brainstorm, analyze, and refine your script.

- **AI Chat**: Have a conversation with your AI assistant. Ask it to make changes to your script, generate character ideas, or answer questions about your story.
- **Suggest Improvements**: Get quick, actionable suggestions on how to improve a scene or a sequence.
- **Deep Analysis**: Receive a comprehensive breakdown of your script's plot, characters, and dialogue, with constructive feedback for each.
- **Proofread Script**: Let the AI scan your script for formatting errors, spelling mistakes, and continuity issues.
- **Generate Logline**: Instantly create a compelling, one-sentence summary of your entire screenplay.
- **Generate Characters & Notes**: Use AI to quickly generate detailed character profiles or brainstorm ideas for your notes.

### 🗂️ Project Organization (Via Sidebar Tabs)
Keep all your story elements in one place, neatly organized and easy to access.

- **Dashboard Tab**: Manage all your screenplay projects from a central hub.
- **Scenes Tab**: See an overview of all your scenes. Reorder and manage your script's structure.
- **Characters Tab**: Maintain a list of all your characters, complete with AI-generated profiles and portraits.
- **Notes Tab**: A digital corkboard for all your ideas, research, and inspiration. Categorize notes by plot, character, theme, and more.

**Profile & Settings**: Access via the avatar menu in the top-right corner for account management, profile editing, and app settings.

### 📥 Import & Export
- **Scrite Import**: Easily import your existing projects from `.scrite` files, including the script, characters, scenes, and notes.
- **Flexible Export**: Export your work to various formats, including PDF, Final Draft, and Fountain (coming soon).

### 🌐 Public Sharing (Separate Routes)
Share your work with others outside the main application:
- **Public Script Views**: Share scripts via dedicated URLs at `/user/{userId}/script/{scriptId}`
- **Public Profile**: Showcase your portfolio at `/user/{userId}`

We're constantly working on new features to make ScriptScribbler the best tool for screenwriters. Happy writing!

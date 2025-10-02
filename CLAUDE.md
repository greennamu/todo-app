# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple To Do list application implemented as a single HTML file with embedded CSS and JavaScript. The project is a standalone client-side web application written in Korean.

## Architecture

- **Single File Application**: The entire application is contained in `main.html`
- **Vanilla JavaScript**: No frameworks or build tools - uses pure HTML, CSS, and JavaScript
- **Client-Side Only**: No backend dependencies or server-side components
- **Korean Language Interface**: All UI text and comments are in Korean

## Key Components

- **HTML Structure**: Basic form with input field and task list (`main.html:48-52`)
- **CSS Styling**: Embedded styles for layout and appearance (`main.html:7-46`)
- **JavaScript Logic**: Task management functionality (`main.html:54-77`)
  - `addTask()` function handles task creation (`main.html:61-76`)
  - Event listeners for add button and delete buttons

## Development

Since this is a simple HTML file with no build process:

- **Testing**: Open `main.html` directly in a web browser
- **No Build Step**: Changes can be made directly to the file
- **No Dependencies**: No package.json or node_modules required

## File Structure

```
main.html - Complete To Do application (HTML + CSS + JavaScript)
```

The application provides:
- Task input field with "새 작업 입력" placeholder
- Add button ("추가") to create new tasks
- Delete buttons ("삭제") for each task
- Simple list-based task display
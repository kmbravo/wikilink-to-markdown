# WikiLink to Markdown Converter

[中文](README-ZH.md)


### Introduction
The WikiLink to Markdown Converter is a plugin for note-taking applications that allows users to convert WikiLinks to standard Markdown links within their notes. This plugin aims to improve compatibility and portability of notes by transforming application-specific link formats into universally recognized Markdown syntax.

### Features
- Converts WikiLinks to Markdown links
- Supports both internal and external links
- Handles image links
- Provides a user-friendly interface with confirmation dialogs
- Supports multiple languages (currently English and Chinese)

### Supported Link Conversions
1. Internal links: `[[Page Name]]` → `[Page Name](Page%20Name.md)`
2. Internal links with aliases: `[[Page Name|Alias]]` → `[Alias](Page%20Name.md)`
3. External links: `[[https://example.com]]` → `[https://example.com](https://example.com)`
4. External links with aliases: `[[https://example.com|Example]]` → `[Example](https://example.com)`
5. Image links: `![[image.jpg]]` → `![image](image.jpg)`
6. Image links with alt text: `![[image.jpg|Alt Text]]` → `![Alt Text](image.jpg)`

### Usage
1. Install the plugin in your vault.
2. Open the note you want to convert.
3. Click the ribbon icon (link symbol) in the left sidebar.
4. Confirm the conversion in the popup dialog.
5. Review the changes and confirm to apply them.

### Settings
You can change the plugin's language in the settings tab:
1. Go to Settings → Community Plugins
2. Find "WikiLink to Markdown Converter" in the list
3. Click on the gear icon to open the plugin settings
4. Choose your preferred language from the dropdown menu

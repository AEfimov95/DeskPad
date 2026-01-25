[![ru](https://img.shields.io/badge/README-ru-red.svg)](https://github.com/AEfimov95/deskpad/blob/main/README.ru.md)
 
# DeskPad

A simple desktop app for quick access to files, links, and templates.  
Built with **Tauri + Vue 3**.

## Features

- Copy to clipboard (HTML / plain text)
- Open links
- Launch files and applications
- Global hotkeys support
- Drag & Drop support
- Local data storage

## Interface

<p align="center">
    <img src="./screenshots/create.png" width="30%" />
    <img src="./screenshots/pads.png" width="30%" /> 
</p>

## Installation

### Windows

- Download the latest version from the [Releases](https://github.com/AEfimov95/deskpad/releases)
- Install to any location
- Run the executable

## Privacy

- No data collection
- Everything is stored locally

## Development

### Requirements

- Node 20+
- Rust (stable)
- Tauri 2

### Run in development mode

```
npm install
npm run tauri dev
```

### Build

```
npm run tauri build
```

## Tech Stack

- Tauri 2
- Vue 3
- Pinia
- Naive UI
- SQLite

## License

MIT

[![en](https://img.shields.io/badge/README-en-green.svg)](https://github.com/AEfimov95/deskpad/blob/main/README.md)

# DeskPad

Простое приложение для быстрого доступа к файлам, ссылкам и шаблонам.  
Разработано на **Tauri + Vue 3**.

## Возможности

- Копирование в буфер обмена (html/plain)
- Открытие ссылок
- Открытие файлов
- Поддержка глобальных горячих клавиш
- Поддержка Drag & drop
- Локальное хранение данных

## Интерфейс

<p align="center">
    <img src="./screenshots/create.png" width="32%" />
    <img src="./screenshots/pads.png" width="32%" /> 
</p>

## Установка

### Windows

- Скачать последнюю версию из [раздела релизов](https://github.com/AEfimov95/deskpad/releases)
- Установить в удобное место
- Запустить исполняемый файл

## Приватность

- Не собирает и не отправляет данные
- Локальное хранение

## Разработка

### Требования

- Node 20+
- Rust stable
- Tauri 2

### Запуск в режиме разработки

```
npm install
npm run tauri dev
```

### Сборка приложения

```
npm run tauri build
```

## Стек

- Tauri 2
- Vue 3
- Pinia
- Naive UI
- SQLite

## Лицензия

MIT

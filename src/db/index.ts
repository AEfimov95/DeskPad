import Database from '@tauri-apps/plugin-sql'

export const db = await Database.load('sqlite:deskpad.db')

export async function initDb() {
  await db.execute('PRAGMA foreign_keys = ON')
}

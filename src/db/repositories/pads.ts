import { db } from '@/db'
import { PadPayload, Pad } from '@/shared/interfaces/models'

export async function getPadsList(categoryId: string) {
  const rows = await db.select<Pad[]>(
    `
        SELECT *
        FROM pads
        WHERE category_id = $1
        ORDER BY position;
    `,
    [categoryId]
  )
  return rows
}

export async function getPadById(id: string) {
  const rows = await db.select<Pad[]>(
    `
        SELECT *
        FROM pads
        WHERE id = $1
    `,
    [id]
  )
  return rows[0]
}

export async function createPad(data: PadPayload) {
  await db.execute(
    `
        INSERT INTO pads(category_id, name, description, color, icon, icon_size, type, clipboard_json, clipboard_text, target, hotkey, position) VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT COALESCE(MAX(position), -1) + 1 FROM pads WHERE category_id = $1))
    `,
    [
      data.categoryId,
      data.name ?? null,
      data.description ?? null,
      data.color ?? null,
      data.icon ?? null,
      data.icon_size,
      data.type,
      data.clipboard_json ?? null,
      data.clipboard_text ?? null,
      data.target ?? null,
      data.hotkey ?? null,
    ]
  )
}

export async function updatePad(id: string, data: PadPayload) {
  await db.execute(
    `
        UPDATE pads
        SET name = COALESCE($1, name),
            description  = COALESCE($2, description),
            color  = COALESCE($3, color),
            icon = COALESCE($4, icon),
            icon_size = COALESCE($5, icon_size),
            type = COALESCE($6, type),
            clipboard_json = $7,
            clipboard_text = $8,
            target = $9,
            hotkey = $10,
            updated_at = unixepoch()
        WHERE id = $11
    `,
    [
      data.name ?? null,
      data.description ?? null,
      data.color ?? null,
      data.icon ?? null,
      data.icon_size,
      data.type,
      data.clipboard_json ?? null,
      data.clipboard_text ?? null,
      data.target ?? null,
      data.hotkey ?? null,
      id,
    ]
  )
}

export async function deletePad(id: string) {
  await db.execute(
    `
        DELETE FROM pads
        WHERE id = $1
    `,
    [id]
  )
}
export async function movePad(categoryId: string, padId: string, from: number, to: number) {
  if (from === to) return

  await db.execute('BEGIN')
  try {
    await db.execute(
      `
        UPDATE pads
        SET position = -1, updated_at = unixepoch()
        WHERE id = $1 AND category_id = $2
      `,
      [padId, categoryId]
    )

    if (from < to) {
      await db.execute(
        `
          UPDATE pads
          SET position = position - 1, updated_at = unixepoch()
          WHERE category_id = $1
            AND position > $2 AND position <= $3
        `,
        [categoryId, from, to]
      )
    } else {
      await db.execute(
        `
          UPDATE pads
          SET position = position + 1, updated_at = unixepoch()
          WHERE category_id = $1
            AND position >= $2 AND position < $3
        `,
        [categoryId, to, from]
      )
    }

    await db.execute(
      `
        UPDATE pads
        SET position = $1, updated_at = unixepoch()
        WHERE id = $2 AND category_id = $3
      `,
      [to, padId, categoryId]
    )

    await db.execute('COMMIT')
  } catch (e) {
    await db.execute('ROLLBACK')
    throw e
  }
}

export async function getHotkeyPadsList() {
  const rows = await db.select<Pad[]>(
    `
        SELECT *
        FROM pads
        WHERE hotkey IS NOT NULL
    `
  )
  return rows
}

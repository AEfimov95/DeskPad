import { db } from '@/db'
import { Category, CategoryPayload, ExportCategory, PadType } from '@/shared/interfaces/models'

export async function getCategoriesList() {
  const rows = await db.select<Category[]>(
    `
        SELECT *
        FROM categories
        ORDER BY position;
    `
  )
  return rows
}

export async function getCategoryById(id: string) {
  const rows = await db.select<Category[]>(
    `
        SELECT *
        FROM categories
        WHERE id = $1
    `,
    [id]
  )
  return rows[0]
}

export async function createCategory(data: CategoryPayload) {
  await db.execute(
    `
        INSERT INTO categories(name, icon, position) VALUES
        ($1, $2, (SELECT COALESCE(MAX(position), -1) + 1 FROM categories))
    `,
    [data.name, data.icon ?? null]
  )
}

export async function updateCategory(id: string, data: CategoryPayload) {
  await db.execute(
    `
        UPDATE categories
        SET name = COALESCE($1, name),
            icon  = COALESCE($2, icon),
            updated_at = unixepoch()
        WHERE id = $3
    `,
    [data.name ?? null, data.icon ?? null, id]
  )
}

export async function deleteCategory(id: string) {
  await db.execute(
    `
        DELETE FROM categories
        WHERE id = $1
    `,
    [id]
  )
}
export async function moveCategory(categoryId: string, from: number, to: number) {
  if (from === to) return
  await db.execute('BEGIN')
  try {
    await db.execute(
      `
        UPDATE categories
        SET position = -1, updated_at = unixepoch()
        WHERE id = $1
      `,
      [categoryId]
    )

    if (from < to) {
      await db.execute(
        `
          UPDATE categories
          SET position = position - 1, updated_at = unixepoch()
          WHERE position > $1 AND position <= $2
        `,
        [from, to]
      )
    } else {
      await db.execute(
        `
          UPDATE categories
          SET position = position + 1, updated_at = unixepoch()
          WHERE position >= $1 AND position < $2
        `,
        [to, from]
      )
    }

    await db.execute(
      `
        UPDATE categories
        SET position = $1, updated_at = unixepoch()
        WHERE id = $2
      `,
      [to, categoryId]
    )

    await db.execute('COMMIT')
  } catch (e) {
    await db.execute('ROLLBACK')
    throw e
  }
}

export async function importCategory(data: ExportCategory) {
  let categoryId: string | null = null
  try {
    const rows = await db.select<{ id: string }[]>(
      `
      INSERT INTO categories(name, icon, position)
      VALUES ($1, $2, (SELECT COALESCE(MAX(position), -1) + 1 FROM categories))
      RETURNING id
      `,
      [data.name, data.icon ?? null]
    )
    categoryId = rows[0]?.id
    if (!categoryId) throw new Error('Import failed')
    let pos = 0
    for (const pad of data.pads) {
      if (pad.type === PadType.App) continue
      const name = pad.name
      const description = pad.description
      const color = pad.color
      const icon = pad.icon
      const iconSize = pad.icon_size ?? 'small'

      let clipboardJson: string | null = null
      let clipboardText: string | null = null
      let target: string | null = null

      if (pad.type === PadType.Clipboard) {
        clipboardJson = pad.clipboard_json ?? null
        clipboardText = pad.clipboard_text ?? null
        target = null
      }

      if (pad.type === PadType.URL) {
        target = pad.target ?? null
        clipboardJson = null
        clipboardText = null
      }

      await db.execute(
        `
        INSERT INTO pads(
          category_id, name, description, color, icon, icon_size,
          type, clipboard_json, clipboard_text, target, hotkey, position
        )
        VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, NULL,
          $11
        )
        `,
        [
          categoryId,
          name,
          description,
          color,
          icon,
          iconSize,
          pad.type,
          clipboardJson,
          clipboardText,
          target,
          pos,
        ]
      )
      pos++
    }
  } catch (e) {
    if (categoryId) await deleteCategory(categoryId)
    throw e
  }
}

import { db } from '@/db'
import { Category, CategoryPayload } from '@/shared/interfaces/models'

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
          WHERE position > $2 AND position <= $3
        `,
        [categoryId, from, to]
      )
    } else {
      await db.execute(
        `
          UPDATE categories
          SET position = position + 1, updated_at = unixepoch()
          WHERE position >= $2 AND position < $3
        `,
        [categoryId, to, from]
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

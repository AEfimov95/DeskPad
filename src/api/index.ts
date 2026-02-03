import {
  createCategory,
  deleteCategory,
  getCategoriesList,
  getCategoryById,
  moveCategory,
  updateCategory,
} from '@/db/repositories/categories'
import {
  createPad,
  deletePad,
  getHotkeyPadsList,
  getPadById,
  getPadsList,
  movePad,
  updatePad,
} from '@/db/repositories/pads'
import {
  type Category,
  type CategoryPayload,
  type PadPayload,
  type Pad,
  PadType,
} from '@/shared/interfaces/models'

export const api = {
  categories: {
    async list(): Promise<Category[]> {
      const res = await getCategoriesList()
      return res
    },

    async get(id: string): Promise<Category | null> {
      const res = await getCategoryById(id)
      return res
    },

    async create(input: CategoryPayload) {
      await createCategory(input)
    },

    async update(id: string, patch: CategoryPayload): Promise<void> {
      await updateCategory(id, patch)
    },

    async remove(categoryId: string): Promise<void> {
      await deleteCategory(categoryId)
    },

    async move(categoryId: string, from: number, to: number) {
      await moveCategory(categoryId, from, to)
    },
  },

  pads: {
    async listByCategory(categoryId: string): Promise<Pad[]> {
      return getPadsList(categoryId)
    },

    async get(id: string): Promise<Pad | null> {
      return getPadById(id)
    },

    async create(input: PadPayload) {
      const payload: PadPayload = {
        categoryId: input.categoryId,
        name: input.name || ' ',
        description: input.description || '',
        color: input.color,
        type: input.type,
        icon: input.icon,
        icon_size: input.icon_size || 'small',
        target: input.target,
        clipboard_json: JSON.stringify(input.clipboard_json.ops),
        clipboard_text: input.clipboard_text,
        hotkey: input.hotkey,
      }

      if (input.type === PadType.Clipboard) {
        payload.target = null
      }

      if (input.type === PadType.App || input.type === PadType.URL) {
        payload.clipboard_json = null
        payload.clipboard_text = null
      }

      await createPad(payload)
    },

    async update(id: string, patch: PadPayload): Promise<void> {
      const payload: PadPayload = {
        categoryId: patch.categoryId,
        name: patch.name || ' ',
        description: patch.description || '',
        color: patch.color || '#18A058',
        type: patch.type,
        icon: patch.icon,
        icon_size: patch.icon_size || 'small',
        target: patch.target,
        clipboard_json: JSON.stringify(patch.clipboard_json.ops),
        clipboard_text: patch.clipboard_text,
        hotkey: patch.hotkey,
      }

      if (patch.type === PadType.Clipboard) {
        payload.target = null
      }

      if (patch.type === PadType.App || patch.type === PadType.URL) {
        payload.clipboard_json = null
        payload.clipboard_text = null
      }

      await updatePad(id, payload)
    },

    async remove(id: string): Promise<void> {
      await deletePad(id)
    },

    async move(categoryId: string, padId: string, from: number, to: number) {
      await movePad(categoryId, padId, from, to)
    },

    async listWithHotkey() {
      return await getHotkeyPadsList()
    },
  },
}

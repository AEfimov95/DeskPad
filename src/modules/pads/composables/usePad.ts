import { i18n } from '@/i18n'
import { Pad, PadType } from '@/shared/interfaces/models'
import { notify } from '@/shared/services/notify'
import { writeHtml } from '@tauri-apps/plugin-clipboard-manager'
import { openPath, openUrl } from '@tauri-apps/plugin-opener'
import { Op } from 'quill'
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'

export function usePad() {
  function deltaToText(ops: Op[]): string {
    return ops
      .filter((op) => typeof op.insert === 'string')
      .map((op) => op.insert)
      .join('')
      .replace(/\u00A0/g, ' ')
      .trimEnd()
  }

  function deltaToHtml(ops: Op[]): string {
    return new QuillDeltaToHtmlConverter(ops).convert()
  }

  async function onPad(pad: Pad) {
    if (pad.type === PadType.Clipboard && pad.clipboard_json) {
      const plain = deltaToText(JSON.parse(pad.clipboard_json))
      const html = deltaToHtml(JSON.parse(pad.clipboard_json))
      await writeHtml(html, plain)

      notify.success(i18n.global.t('message.copied'))
    }
    if (pad.type === PadType.URL && pad.target) {
      openUrl(pad.target)
    }
    if (pad.type === PadType.App && pad.target) {
      openPath(pad.target)
    }
  }

  return {
    onPad,
  }
}

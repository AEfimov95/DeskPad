import type { MessageApi } from 'naive-ui'

let message: MessageApi

export const notify = {
  init: (api: MessageApi) => (message = api),
  success: (text: string) => message?.success(text),
  error: (text: string) => message?.error(text),
}

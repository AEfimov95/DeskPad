import { invoke } from '@tauri-apps/api/core'

export async function loadAppIcon(path: string) {
  return await invoke<string | null>('get_system_icon_base64', {
    path,
    size: 32,
  })
}

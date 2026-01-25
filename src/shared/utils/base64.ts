import { useBase64 } from '@vueuse/core'

export async function getBase64File(file: File | null): Promise<string | null> {
  if (file) return await useBase64(file).promise.value
  else return null
}

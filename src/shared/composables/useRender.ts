import { NAvatar, NIcon } from 'naive-ui'
import { Size } from 'naive-ui/es/avatar/src/interface'
import { Component, h } from 'vue'

export function useRender() {
  function renderIcon(icon: Component) {
    return () => h(NIcon, null, { default: () => h(icon) })
  }
  function renderAvatar(avatar: string, size?: Size) {
    return () =>
      h(NAvatar, {
        src: avatar,
        round: true,
        size: size ?? undefined,
        style: {
          backgroundColor: 'inherit',
        },
      })
  }
  return { renderIcon, renderAvatar }
}

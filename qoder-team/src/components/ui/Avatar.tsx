import type { ColorVariant } from '../../types'

interface Props {
  name: string
  color: ColorVariant
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, color, size = 'md' }: Props) {
  const cls = `avatar avatar-${color}${size === 'sm' ? ' avatar-sm' : size === 'lg' ? ' avatar-lg' : ''}`
  return <div className={cls}>{name[0]}</div>
}

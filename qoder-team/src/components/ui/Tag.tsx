import type { ReactNode } from 'react'
import type { TagVariant } from '../../types'

interface Props {
  children: ReactNode
  variant: TagVariant
}

export function Tag({ children, variant }: Props) {
  return <span className={`tag tag-${variant}`}>{children}</span>
}

import React from 'react'

interface Props {
  name: string
  className?: string
  children?: React.ReactNode
  isLoading?: boolean
}

export function Button(
  props: Props & Partial<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>>,
) {
  const { name, className, children, isLoading, ...rest } = props
  return (
    <button className={'btn fa-3x ' + className} disabled={isLoading} {...rest}>
      {isLoading ? <i style={{ marginRight: 5 }} className={'fas fa-spinner fa-spin'}></i> : null}
      <span>{name}</span>
      {children}
    </button>
  )
}

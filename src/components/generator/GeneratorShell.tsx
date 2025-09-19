import React, { type ReactNode } from 'react'

interface GeneratorShellProps {
  children: ReactNode
  className?: string
}

export function GeneratorShell({ children, className = '' }: GeneratorShellProps) {
    return (
      <div
        data-role="generator"
        className={`cv-container ${className}`}
      >
        {children}
      </div>
    )
  }
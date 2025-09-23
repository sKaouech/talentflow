import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
  xl: 'h-12 w-12 text-lg',
}

export function Avatar({ className, size = 'md', ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <img
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}

export function AvatarFallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600',
        className
      )}
      {...props}
    />
  )
}

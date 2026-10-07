import { cn } from '@/lib/utils'

// Five bars of different heights: a voice waveform
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn('flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground', className)}>
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden="true">
        <rect x="1.5" y="8" width="2" height="4" rx="1" />
        <rect x="5.5" y="5" width="2" height="10" rx="1" />
        <rect x="9" y="2" width="2" height="16" rx="1" />
        <rect x="12.5" y="5" width="2" height="10" rx="1" />
        <rect x="16.5" y="8" width="2" height="4" rx="1" />
      </svg>
    </span>
  )
}

export function Logo({ nameClassName }: { nameClassName?: string }) {
  return (
    <span className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
      <LogoMark />
      <span className={nameClassName}>Voiceflow</span>
    </span>
  )
}

import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

type Props = {
  src: string
  /** Length we already know. Browser-made WebM recordings report no duration until fully played */
  durationMs: number
  label?: string
}

export function AudioPlayer({ src, durationMs, label = 'Recording' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(durationMs / 1000)

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false)
          setTime(0)
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
      />
      <Button
        type="button"
        size="icon-lg"
        className="shrink-0 rounded-full"
        onClick={toggle}
        aria-label={playing ? `Pause ${label.toLowerCase()}` : `Play ${label.toLowerCase()}`}
      >
        {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
      </Button>
      <Slider
        value={[Math.min(time, duration)]}
        max={duration}
        step={0.1}
        onValueChange={([value]) => {
          if (audioRef.current) audioRef.current.currentTime = value
          setTime(value)
        }}
        aria-label={`Seek ${label.toLowerCase()}`}
      />
      <span className="w-20 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
        {clock(time)} / {clock(duration)}
      </span>
    </div>
  )
}

import { useEffect, useRef } from 'react'

const BAR_WIDTH = 3
const GAP = 3
const SAMPLE_EVERY_MS = 55

/**
 * Scrolling waveform of the live microphone level, newest sound on the right.
 * With no analyser it draws a flat baseline, so the stage keeps its size when idle.
 */
export function LevelMeter({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const ratio = window.devicePixelRatio || 1
    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.scale(ratio, ratio)

    const count = Math.floor(width / (BAR_WIDTH + GAP))
    const levels = new Array<number>(count).fill(0)
    const samples = analyser ? new Uint8Array(analyser.fftSize) : null
    let frame = 0
    let lastSample = 0

    function draw(now: number) {
      if (analyser && samples && now - lastSample >= SAMPLE_EVERY_MS) {
        lastSample = now
        analyser.getByteTimeDomainData(samples)
        let sum = 0
        for (const value of samples) sum += ((value - 128) / 128) ** 2
        // RMS, lifted a little so quiet speech still moves the bars
        levels.push(Math.min(1, Math.sqrt(sum / samples.length) * 3.2))
        levels.shift()
      }

      ctx!.clearRect(0, 0, width, height)
      ctx!.fillStyle = getComputedStyle(canvas!).color
      levels.forEach((level, i) => {
        const barHeight = Math.max(3, level * height)
        ctx!.beginPath()
        ctx!.roundRect(i * (BAR_WIDTH + GAP), (height - barHeight) / 2, BAR_WIDTH, barHeight, BAR_WIDTH / 2)
        ctx!.fill()
      })
      if (analyser) frame = requestAnimationFrame(draw)
    }
    draw(performance.now())
    return () => cancelAnimationFrame(frame)
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className={analyser ? 'h-16 w-full text-primary' : 'h-16 w-full text-muted-foreground/40'}
      aria-hidden="true"
    />
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'

export const MAX_SECONDS = 30
const MIN_MS = 1000
// WebM/Opus where supported (Chrome, Firefox), MP4/AAC otherwise (Safari)
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']

export type Recording = { blob: Blob; mimeType: string; durationMs: number; url: string }

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [recording, setRecording] = useState<Recording | null>(null)
  const [error, setError] = useState('')
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<number>(0)

  const discard = useCallback(() => {
    setRecording((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  const closeAnalyser = useCallback(() => {
    void audioContextRef.current?.close()
    audioContextRef.current = null
    setAnalyser(null)
  }, [])

  const stop = useCallback(() => {
    window.clearInterval(timerRef.current)
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  const start = useCallback(async () => {
    setError('')
    discard()
    if (typeof MediaRecorder === 'undefined') {
      setError('This browser does not support audio recording.')
      return
    }
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError('Microphone access was blocked. Allow it in your browser settings and try again.')
      return
    }

    const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type)) ?? ''
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    const startedAt = Date.now()

    // A live level feed for the waveform. Safari still ships the prefixed AudioContext
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      const context = new AudioContextClass()
      const node = context.createAnalyser()
      node.fftSize = 512
      context.createMediaStreamSource(stream).connect(node)
      audioContextRef.current = context
      setAnalyser(node)
    }

    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop())
      closeAnalyser()
      setIsRecording(false)
      const durationMs = Math.min(Date.now() - startedAt, MAX_SECONDS * 1000)
      if (durationMs < MIN_MS) {
        setError('That was too short. Record at least 1 second.')
        return
      }
      const type = recorder.mimeType || mimeType || 'audio/mp4'
      const blob = new Blob(chunks, { type })
      setRecording({ blob, mimeType: type, durationMs, url: URL.createObjectURL(blob) })
    }

    recorderRef.current = recorder
    recorder.start()
    setSeconds(0)
    setIsRecording(true)
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setSeconds(elapsed)
      if (elapsed >= MAX_SECONDS) stop()
    }, 250)
  }, [closeAnalyser, discard, stop])

  // Release the microphone if the page is left mid-recording
  useEffect(() => () => {
    window.clearInterval(timerRef.current)
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null
      recorderRef.current.stream.getTracks().forEach((track) => track.stop())
      recorderRef.current.stop()
    }
    void audioContextRef.current?.close()
  }, [])

  return { isRecording, seconds, recording, error, analyser, start, stop, discard }
}

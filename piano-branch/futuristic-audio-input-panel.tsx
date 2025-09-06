"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Mic, 
  Square, 
  Upload, 
  X, 
  Loader2, 
  Play, 
  Pause, 
  Share2, 
  BarChart3, 
  Save, 
  Music,
  Clock,
  FileAudio,
  Activity,
  Download,
  Link2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Sparkles,
  Radio,
  Waves
} from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadAudioToBlob, uploadRecordingToBlob, generateShareLink } from "@/lib/blob-storage"
import { ProcessingAnimation } from "./processing-animation"

interface AudioInputPanelProps {
  onChange?: (audioData: AudioData) => void
  onShare?: (audioData: AudioData) => void
  onAnalyze?: (audioData: AudioData) => void
  onSave?: (audioData: AudioData) => void
}

interface AudioData {
  file: File
  url: string
  duration: number
  size: string
  id: string
  name: string
  uploadedAt: Date
  type: 'recording' | 'upload'
  storageUrl?: string
}

interface AudioInfo {
  file: File
  url: string
  duration: number
  size: string
}

// Simple Button Component
const SimpleButton = ({
  isPressed,
  isRecording,
  onClick,
  className,
  children,
  disabled = false,
  tooltip,
  variant = "primary"
}: {
  isPressed: boolean
  isRecording: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
  disabled?: boolean
  tooltip?: string
  variant?: "primary" | "secondary" | "danger"
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-stone-800 text-stone-100 hover:bg-stone-700 border-stone-800"
      case "secondary":
        return "bg-stone-50 text-stone-800 hover:bg-stone-100 border-stone-300"
      case "danger":
        return "bg-stone-900 text-stone-100 hover:bg-stone-800 border-stone-900"
      default:
        return "bg-stone-800 text-stone-100 hover:bg-stone-700 border-stone-800"
    }
  }

  const ButtonComponent = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative transition-all duration-200 transform flex items-center justify-center font-medium",
        "w-16 h-16 rounded-lg border shadow-sm",
        "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-stone-400",
        getVariantStyles(),
        isPressed || isRecording ? "scale-95" : "",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className,
      )}
    >
      <div className="relative z-10 transition-all duration-200">
        {children}
      </div>
    </button>
  )

  return tooltip ? (
    <Tooltip>
      <TooltipTrigger asChild>{ButtonComponent}</TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  ) : ButtonComponent
}

// Piano Key Visualizer Component
const PianoVisualizer = ({
  isRecording,
  audioLevel = 0,
  frequencyData
}: {
  isRecording: boolean
  audioLevel?: number
  frequencyData?: Uint8Array
}) => {
  const [activeKeys, setActiveKeys] = useState<number[]>([])

  useEffect(() => {
    if (!isRecording) {
      setActiveKeys([])
      return
    }

    const interval = setInterval(() => {
      // Generate active keys based on audio level - more responsive
      const numActiveKeys = Math.floor(audioLevel * 16) // Up to 16 keys can be active
      const newActiveKeys: number[] = []
      
      for (let i = 0; i < numActiveKeys; i++) {
        // Random key activation based on audio level
        const randomKey = Math.floor(Math.random() * 21) // 21 total keys (white + black)
        if (Math.random() < audioLevel * 1.5) { // Higher chance with higher audio level
          newActiveKeys.push(randomKey)
        }
      }
      
      setActiveKeys(newActiveKeys)
    }, 80) // Faster updates for more responsive feel

    return () => clearInterval(interval)
  }, [isRecording, audioLevel])

  // Define 15 white keys and 10 black keys
  const whiteKeys = Array.from({ length: 15 }, (_, i) => i)
  const blackKeyPositions = [0.5, 1.5, 3.5, 4.5, 5.5, 7.5, 8.5, 10.5, 11.5, 12.5] // Positions between white keys

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      {/* Audio level display at the top */}
      <div className="text-center mb-3">
        <p className="text-xs text-stone-600 mb-1 font-medium tracking-wide">
          {isRecording ? 'RECORDING - PIANO KEYS' : 'PIANO KEYS'}
        </p>
        <p className="text-xl font-mono font-bold text-stone-800">
          LEVEL {Math.round(audioLevel * 100)}%
        </p>
      </div>

      {/* Piano keyboard */}
      <div className="relative h-16 bg-stone-100 rounded-lg border-2 border-stone-200 overflow-hidden shadow-sm">
        {/* White keys */}
        <div className="flex h-full">
          {whiteKeys.map((keyIndex) => {
            const isActive = activeKeys.includes(keyIndex)
            return (
              <div
                key={`white-${keyIndex}`}
                className={`flex-1 border-r border-stone-300 transition-all duration-100 ${
                  isActive && isRecording
                    ? 'bg-stone-700 transform scale-95 shadow-inner' 
                    : 'bg-white hover:bg-stone-50'
                }`}
              />
            )
          })}
        </div>
        
        {/* Black keys */}
        <div className="absolute inset-0 pointer-events-none">
          {blackKeyPositions.map((position, index) => {
            const keyIndex = 15 + index // Black keys start after white keys
            const isActive = activeKeys.includes(keyIndex)
            return (
              <div
                key={`black-${index}`}
                className={`absolute top-0 w-6 h-10 rounded-b transition-all duration-100 ${
                  isActive && isRecording
                    ? 'bg-white shadow-lg transform scale-110' 
                    : 'bg-black'
                }`}
                style={{ left: `${(position / 15) * 100}%` }}
              />
            )
          })}
        </div>
        
        {/* Recording pulse indicator */}
        {isRecording && (
          <div className="absolute top-1 right-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  )
}

export function FuturisticAudioInputPanel({ onChange, onShare, onAnalyze, onSave }: AudioInputPanelProps) {
  const [uploadedAudio, setUploadedAudio] = useState<AudioInfo | null>(null)
  const [recordedAudio, setRecordedAudio] = useState<AudioInfo | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recordError, setRecordError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [mediaSupported, setMediaSupported] = useState(true)
  const [pressedKey, setPressedKey] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [processingStage, setProcessingStage] = useState<'uploading' | 'analyzing' | 'processing' | 'complete'>('uploading')
  const [processingProgress, setProcessingProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMediaSupported(false)
    }
  }, [])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateAudioFile = async (file: File): Promise<{ isValid: boolean; error?: string; duration?: number }> => {
    if (!file.type.includes("audio/mpeg") && !file.name.toLowerCase().endsWith('.mp3')) {
      return { isValid: false, error: "Only MP3 files are allowed" }
    }

    if (file.size > 25 * 1024 * 1024) {
      return { isValid: false, error: "File size must be less than 25MB" }
    }

    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(file)

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url)
        if (audio.duration > 30) {
          resolve({ isValid: false, error: "Audio duration must be 30 seconds or less" })
        } else {
          resolve({ isValid: true, duration: audio.duration })
        }
      }

      audio.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ isValid: false, error: "Invalid MP3 file or corrupted audio" })
      }

      audio.src = url
    })
  }

  const uploadToObjectStorage = async (file: File): Promise<string> => {
    try {
      setProcessingStage('uploading')
      setProcessingProgress(0)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      const result = await uploadAudioToBlob(file)
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return result.url
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  const uploadRecordingToStorage = async (audioBlob: Blob, filename: string): Promise<string> => {
    try {
      setProcessingStage('processing')
      setProcessingProgress(0)
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => Math.min(prev + 15, 85))
      }, 150)
      
      const result = await uploadRecordingToBlob(audioBlob, filename)
      
      clearInterval(progressInterval)
      setProcessingProgress(100)
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return result.url
    } catch (error) {
      console.error('Recording upload failed:', error)
      throw error
    }
  }

  const createAudioData = (audioInfo: AudioInfo, type: 'recording' | 'upload', storageUrl?: string): AudioData => {
    return {
      ...audioInfo,
      id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: audioInfo.file.name,
      uploadedAt: new Date(),
      type,
      storageUrl
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setUploadError(null)
      setIsValidating(true)
      setIsProcessing(true)

      try {
        const validation = await validateAudioFile(file)

        if (!validation.isValid) {
          setUploadError(validation.error || "Invalid file")
          return
        }

        const url = URL.createObjectURL(file)
        const audioInfo: AudioInfo = {
          file,
          url,
          duration: validation.duration || 0,
          size: formatFileSize(file.size),
        }

        // Upload to object storage
        const storageUrl = await uploadToObjectStorage(file)
        
        setUploadedAudio(audioInfo)
        
        const audioData = createAudioData(audioInfo, 'upload', storageUrl)
        onChange?.(audioData)
      } catch (error) {
        setUploadError("Error processing file")
      } finally {
        setIsValidating(false)
        setIsProcessing(false)
      }
    },
    [onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
    },
    multiple: false,
  })

  const startRecording = async () => {
    if (!mediaSupported) {
      setRecordError("Media recording is not supported in this browser")
      return
    }

    try {
      setRecordError(null)
      setPressedKey("record")

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      audioChunksRef.current = []

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      analyserRef.current.fftSize = 2048
      analyserRef.current.smoothingTimeConstant = 0.8
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
      const timeDomainArray = new Uint8Array(analyserRef.current.fftSize)

      const updateAudioAnalysis = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray)
          analyserRef.current.getByteTimeDomainData(timeDomainArray)

          let sum = 0
          for (let i = 0; i < timeDomainArray.length; i++) {
            const sample = (timeDomainArray[i] - 128) / 128
            sum += sample * sample
          }
          const rms = Math.sqrt(sum / timeDomainArray.length)
          setAudioLevel(rms)

          setFrequencyData(new Uint8Array(dataArray))

          animationFrameRef.current = requestAnimationFrame(updateAudioAnalysis)
        }
      }
      updateAudioAnalysis()

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const filename = `crescend-recording-${Date.now()}.webm`
        
        try {
          // Upload to object storage
          const storageUrl = await uploadRecordingToStorage(audioBlob, filename)
          
          const file = new File([audioBlob], filename, { type: "audio/webm" })
          const url = URL.createObjectURL(audioBlob)

          const audioInfo: AudioInfo = {
            file,
            url,
            duration: recordingTime,
            size: formatFileSize(audioBlob.size),
          }

          setRecordedAudio(audioInfo)
          
          const audioData = createAudioData(audioInfo, 'recording', storageUrl)
          onChange?.(audioData)
        } catch (error) {
          console.error('Failed to save recording:', error)
          setRecordError('Failed to save recording. Please try again.')
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
        setFrequencyData(null)
        setPressedKey(null)
        setIsProcessing(false)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= 30) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

      setTimeout(() => setPressedKey(null), 200)
    } catch (error) {
      setRecordError("Failed to access microphone. Please check permissions.")
      setPressedKey(null)
    }
  }

  const stopRecording = () => {
    setPressedKey("stop")

    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setAudioLevel(0)

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }

    setTimeout(() => setPressedKey(null), 200)
  }

  const togglePlayback = (audioInfo: AudioInfo) => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio()
    }

    const audio = audioElementRef.current

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      setPressedKey(null)
    } else {
      setPressedKey("play")
      audio.src = audioInfo.url
      audio.play()
      setIsPlaying(true)

      audio.onended = () => {
        setIsPlaying(false)
        setPressedKey(null)
      }

      setTimeout(() => setPressedKey(null), 200)
    }
  }

  const handleSave = async (audioInfo: AudioInfo, type: 'recording' | 'upload') => {
    setIsSaving(true)
    try {
      const storageUrl = await uploadToObjectStorage(audioInfo.file)
      const audioData = createAudioData(audioInfo, type, storageUrl)
      await onSave?.(audioData)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = async (audioInfo: AudioInfo, type: 'recording' | 'upload') => {
    setIsSharing(true)
    try {
      const audioData = createAudioData(audioInfo, type)
      
      // Generate actual shareable URL using stored audio
      let shareUrl: string
      if (audioData.storageUrl) {
        shareUrl = generateShareLink(audioData.storageUrl, audioData.id)
      } else {
        // Fallback for legacy data
        shareUrl = `https://crescendai.com/shared/${audioData.id}`
      }
      
      setShareUrl(shareUrl)
      
      await navigator.clipboard.writeText(shareUrl)
      await onShare?.(audioData)
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleAnalyze = async (audioInfo: AudioInfo, type: 'recording' | 'upload') => {
    setIsAnalyzing(true)
    setIsProcessing(true)
    setProcessingStage('analyzing')
    setProcessingProgress(0)
    
    try {
      const audioData = createAudioData(audioInfo, type)
      
      // Simulate AI analysis with realistic progress
      const stages = [
        { message: "Extracting frequency domain features", duration: 800 },
        { message: "Analyzing harmonic content", duration: 1000 },
        { message: "Detecting rhythmic patterns", duration: 700 },
        { message: "Evaluating musical expression", duration: 900 },
        { message: "Generating performance insights", duration: 600 }
      ]
      
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        setProcessingProgress((i / stages.length) * 100)
        await new Promise(resolve => setTimeout(resolve, stage.duration))
      }
      
      setProcessingProgress(100)
      setProcessingStage('complete')
      
      // Brief delay to show completion
      await new Promise(resolve => setTimeout(resolve, 800))
      
      await onAnalyze?.(audioData)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const removeUploadedAudio = () => {
    if (uploadedAudio?.url) {
      URL.revokeObjectURL(uploadedAudio.url)
    }
    setUploadedAudio(null)
    setUploadError(null)
  }

  const removeRecordedAudio = () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url)
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
    }
    setRecordedAudio(null)
    setRecordError(null)
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl shadow-sm border border-gray-300">
            <TabsTrigger 
              value="upload" 
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-black font-medium transition-all duration-300 text-gray-600"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload MP3
            </TabsTrigger>
            <TabsTrigger 
              value="record" 
              className="data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm font-medium transition-all duration-300 text-gray-600"
            >
              <Mic className="h-4 w-4 mr-2" />
              Record Audio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8 mt-8">
            {!uploadedAudio ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 group relative overflow-hidden",
                  "bg-white",
                  isDragActive
                    ? "border-black bg-gray-50 scale-[1.01]"
                    : "border-gray-400 hover:border-gray-600 hover:bg-gray-50",
                )}
              >
                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center space-y-6">
                  {isValidating ? (
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className={cn(
                      "p-6 rounded-full transition-all duration-300 relative",
                      isDragActive ? "bg-gray-200 scale-110" : "bg-gray-100 group-hover:bg-gray-200 group-hover:scale-105"
                    )}>
                      <Upload className="h-12 w-12 text-black" />
                    </div>
                  )}
                  <div className="space-y-3 text-center">
                    <h3 className="text-xl font-semibold text-black">
                      {isValidating
                        ? "Analyzing your audio file..."
                        : isDragActive
                          ? "Drop your MP3 file here"
                          : "Upload your piano performance"}
                    </h3>
                    <p className="text-gray-600 text-base max-w-md">
                      Professional audio analysis for piano recordings
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                      <span className="flex items-center space-x-2">
                        <FileAudio className="h-4 w-4 text-black" />
                        <span>MP3 only</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-black" />
                        <span>Max 30s</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Music className="h-4 w-4 text-black" />
                        <span>Piano optimized</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-white border border-gray-300 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <FileAudio className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h4 className="text-black font-semibold">{uploadedAudio.file.name}</h4>
                        <p className="text-gray-600 text-sm">{uploadedAudio.size} • {formatDuration(uploadedAudio.duration)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeUploadedAudio}
                      className="text-gray-600 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* PRIMARY: Large Analyze Button */}
                  <div className="mb-4">
                    <Button 
                      variant="default" 
                      size="lg" 
                      onClick={() => handleAnalyze(uploadedAudio, 'upload')}
                      disabled={isAnalyzing}
                      className="w-full bg-stone-800 hover:bg-stone-700 text-white font-medium py-3"
                    >
                      {isAnalyzing ? 'Processing Audio...' : 'Analyze Audio'}
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => togglePlayback(uploadedAudio)}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSave(uploadedAudio, 'upload')}
                      disabled={isSaving}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Save
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare(uploadedAudio, 'upload')}
                      disabled={isSharing}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isSharing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Share2 className="h-4 w-4 mr-1" />}
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {uploadError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="record" className="space-y-8 mt-8">
            {!mediaSupported ? (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Media recording is not supported in this browser or requires HTTPS.
                </AlertDescription>
              </Alert>
            ) : !recordedAudio ? (
              <div className="flex flex-col items-center space-y-6 py-8">
                <PianoVisualizer
                  isRecording={isRecording}
                  audioLevel={audioLevel}
                  frequencyData={frequencyData || undefined}
                />

                <div className="space-y-6">
                  {/* Simple Control Panel */}
                  <div className="flex items-center justify-center space-x-6 p-6 bg-stone-50 rounded-lg border border-stone-200">
                    <SimpleButton
                      isPressed={pressedKey === "record"}
                      isRecording={isRecording}
                      onClick={startRecording}
                      disabled={isRecording}
                      tooltip="Start Recording"
                      variant="primary"
                    >
                      <Mic className="h-6 w-6" />
                    </SimpleButton>

                    <SimpleButton
                      isPressed={pressedKey === "stop"}
                      isRecording={false}
                      onClick={stopRecording}
                      disabled={!isRecording}
                      tooltip="Stop Recording"
                      variant="danger"
                    >
                      <Square className="h-5 w-5" />
                    </SimpleButton>

                    {recordedAudio && (
                      <SimpleButton
                        isPressed={pressedKey === "play"}
                        isRecording={false}
                        onClick={() => togglePlayback(recordedAudio)}
                        tooltip={isPlaying ? "Pause Playback" : "Play Recording"}
                        variant="secondary"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </SimpleButton>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <Music className="h-6 w-6 text-black" />
                    <p className="text-4xl font-mono font-bold text-black tracking-wider">
                      {formatDuration(recordingTime)}
                    </p>
                    <div className={cn(
                      "w-3 h-3 rounded-full transition-all duration-500",
                      isRecording ? "bg-black animate-pulse" : "bg-gray-400"
                    )} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-black">
                      {isRecording ? "Recording your performance..." : "Ready to record"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isRecording ? "Capturing audio in high quality" : "Click the microphone to begin"}
                    </p>
                    <div className="flex items-center justify-center space-x-3 text-sm text-gray-500">
                      <Music className="h-4 w-4 text-black" />
                      <span>Maximum 30 seconds • Studio quality • Piano optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-white border border-gray-300 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-xl">
                        <Mic className="h-6 w-6 text-black" />
                      </div>
                      <div>
                        <h4 className="text-black font-semibold">{recordedAudio.file.name}</h4>
                        <p className="text-gray-600 text-sm">{recordedAudio.size} • {formatDuration(recordedAudio.duration)}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={removeRecordedAudio}
                      className="text-gray-600 hover:text-black"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* PRIMARY: Large Analyze Button */}
                  <div className="mb-4">
                    <Button 
                      variant="default" 
                      size="lg" 
                      onClick={() => handleAnalyze(recordedAudio, 'recording')}
                      disabled={isAnalyzing}
                      className="w-full bg-stone-800 hover:bg-stone-700 text-white font-medium py-3"
                    >
                      {isAnalyzing ? 'Processing Audio...' : 'Analyze Audio'}
                    </Button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => togglePlayback(recordedAudio)}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSave(recordedAudio, 'recording')}
                      disabled={isSaving}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                      Save
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleShare(recordedAudio, 'recording')}
                      disabled={isSharing}
                      className="border-gray-300 text-black hover:bg-gray-50"
                    >
                      {isSharing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Share2 className="h-4 w-4 mr-1" />}
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {recordError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{recordError}</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        {/* Share URL Display */}
        {shareUrl && (
          <Card className="mt-6 bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Link generated and copied!</span>
              </div>
              <div className="flex items-center space-x-3 mt-2">
                <Link2 className="h-4 w-4 text-green-600" />
                <code className="flex-1 p-2 bg-white border border-green-200 rounded text-sm text-gray-800">
                  {shareUrl}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Animation Overlay */}
        <ProcessingAnimation
          isVisible={isProcessing && (isValidating || isAnalyzing || isSaving)}
          stage={processingStage}
          progress={processingProgress}
          onComplete={() => setIsProcessing(false)}
        />
      </div>
    </TooltipProvider>
  )
}

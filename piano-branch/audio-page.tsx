"use client"

import { FuturisticAudioInputPanel } from "@/components/futuristic-audio-input-panel"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Zap, Share2, BarChart3, Users, Clock } from "lucide-react"

interface AudioData {
  file: File
  url: string
  duration: number
  size: string
  id: string
  name: string
  uploadedAt: Date
  type: 'recording' | 'upload'
}

export default function AudioStudioPage() {
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [sharedUrl, setSharedUrl] = useState<string | null>(null)

  const handleAudioChange = (audioData: AudioData) => {
    console.log("Audio file selected:", audioData)
    setCurrentAudio(audioData)
  }

  const handleShare = async (audioData: AudioData) => {
    console.log("Sharing audio:", audioData.name)
    setSharedUrl(`https://crescendai.com/shared/${audioData.id}`)
  }

  const handleAnalyze = async (audioData: AudioData) => {
    console.log("Analyzing audio:", audioData.name)
    setAnalysisResult("Performance analysis complete! Your recording shows good timing and expression.")
  }

  const handleSave = async (audioData: AudioData) => {
    console.log("Saving audio:", audioData.name)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-stone-800 rounded-lg shadow-sm">
              <Music className="h-8 w-8 text-stone-100" />
            </div>
            <h1 className="text-4xl font-semibold text-stone-800">
              Piano Studio
            </h1>
          </div>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Record and analyze your piano performances with professional-grade audio tools
          </p>
        </div>

        {/* Main Audio Input Panel */}
        <div className="flex justify-center">
          <FuturisticAudioInputPanel 
            onChange={handleAudioChange}
            onShare={handleShare}
            onAnalyze={handleAnalyze}
            onSave={handleSave}
          />
        </div>

        {/* Current Audio Info */}
        {currentAudio && (
          <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Music className="h-5 w-5 text-stone-600" />
              <span className="font-medium text-stone-800">Current Recording</span>
              <span className="inline-flex items-center rounded-full bg-stone-100 text-stone-700 px-2.5 py-0.5 text-xs font-medium">
                {currentAudio.type}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-stone-600">
              <div>
                <p>File: <span className="font-medium text-stone-800">{currentAudio.name}</span></p>
                <p>Duration: <span className="font-medium text-stone-800">{Math.round(currentAudio.duration)}s</span></p>
              </div>
              <div>
                <p>Size: <span className="font-medium text-stone-800">{currentAudio.size}</span></p>
                <p>Created: <span className="font-medium text-stone-800">{currentAudio.uploadedAt.toLocaleString()}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-amber-50 rounded-lg border border-amber-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="h-5 w-5 text-amber-700" />
              <span className="font-medium text-amber-900">Performance Analysis</span>
            </div>
            <p className="text-amber-800">{analysisResult}</p>
          </div>
        )}

        {/* Share URL */}
        {sharedUrl && (
          <div className="bg-stone-50 rounded-lg border border-stone-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Share2 className="h-5 w-5 text-stone-600" />
              <span className="font-medium text-stone-800">Share Link</span>
            </div>
            <div className="flex items-center space-x-3">
              <code className="flex-1 p-2 bg-white border border-stone-200 rounded text-sm text-stone-700">{sharedUrl}</code>
              <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-2.5 py-0.5 text-xs font-medium">Copied!</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

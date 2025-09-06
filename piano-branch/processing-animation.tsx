"use client"

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProcessingAnimationProps {
  isVisible: boolean
  stage: 'uploading' | 'analyzing' | 'processing' | 'complete'
  progress?: number
  message?: string
  onComplete?: () => void
}

export function ProcessingAnimation({ 
  isVisible, 
  stage, 
  progress = 0, 
  message, 
  onComplete 
}: ProcessingAnimationProps) {
  const [activeKeys, setActiveKeys] = useState<number[]>([])
  const [dots, setDots] = useState('')

  // Animated dots for loading text
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.')
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  // Piano key animation
  useEffect(() => {
    if (!isVisible) return

    const animateKeys = () => {
      // Generate random piano key presses based on the stage
      const numKeys = stage === 'analyzing' ? 4 : 2
      const newActiveKeys = Array.from({ length: numKeys }, () => 
        Math.floor(Math.random() * 21) // 21 keys total
      )
      setActiveKeys(newActiveKeys)
    }

    // Start with immediate animation
    animateKeys()
    
    // Continue animating keys
    const interval = setInterval(animateKeys, 300)

    return () => clearInterval(interval)
  }, [isVisible, stage])

  const getStageInfo = () => {
    switch (stage) {
      case 'uploading':
        return {
          title: 'Uploading Audio',
          subtitle: 'Securing your audio file',
          color: 'text-stone-700'
        }
      case 'analyzing':
        return {
          title: 'Analyzing Performance',
          subtitle: 'Processing your piano recording',
          color: 'text-stone-700'
        }
      case 'processing':
        return {
          title: 'Processing Audio',
          subtitle: 'Extracting musical features',
          color: 'text-stone-700'
        }
      case 'complete':
        return {
          title: 'Analysis Complete',
          subtitle: 'Your audio has been processed',
          color: 'text-stone-700'
        }
      default:
        return {
          title: 'Initializing',
          subtitle: 'Preparing analysis',
          color: 'text-stone-700'
        }
    }
  }

  if (!isVisible) return null

  const stageInfo = getStageInfo()

  // Piano keyboard layout
  const whiteKeys = Array.from({ length: 14 }, (_, i) => i)
  const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7, 7.7, 8.7, 10.7, 11.7, 12.7]

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-stone-50/95 backdrop-blur-lg transition-all duration-500",
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="relative max-w-lg mx-auto p-8">
        
        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-stone-200 shadow-xl p-8 text-center">
          
          {/* Piano Keyboard Animation */}
          <div className="mb-8">
            <div className="relative w-80 h-20 mx-auto bg-stone-100 rounded-lg border border-stone-200 overflow-hidden shadow-inner">
              
              {/* White Keys */}
              <div className="flex h-full">
                {whiteKeys.map((keyIndex) => {
                  const isActive = activeKeys.includes(keyIndex)
                  return (
                    <div
                      key={`white-${keyIndex}`}
                      className={`flex-1 border-r border-stone-300 transition-all duration-200 ${
                        isActive 
                          ? 'bg-stone-400 transform scale-y-95 shadow-inner' 
                          : 'bg-white'
                      }`}
                    />
                  )
                })}
              </div>
              
              {/* Black Keys */}
              <div className="absolute inset-0 pointer-events-none">
                {blackKeyPositions.map((position, index) => {
                  const keyIndex = 14 + index // Black keys start after white keys
                  const isActive = activeKeys.includes(keyIndex)
                  return (
                    <div
                      key={`black-${index}`}
                      className={`absolute top-0 w-4 h-12 rounded-b transition-all duration-200 ${
                        isActive 
                          ? 'bg-stone-600 transform scale-110 shadow-lg' 
                          : 'bg-stone-800'
                      }`}
                      style={{ left: `${(position / 14) * 100}%` }}
                    />
                  )
                })}
              </div>

              {/* Subtle music notes floating */}
              <div className="absolute inset-0 pointer-events-none">
                {stage === 'analyzing' && activeKeys.length > 0 && (
                  <>
                    <div className="absolute top-2 left-8 text-stone-400 text-xs animate-bounce" style={{ animationDelay: '0ms' }}>♪</div>
                    <div className="absolute top-3 right-12 text-stone-400 text-xs animate-bounce" style={{ animationDelay: '200ms' }}>♫</div>
                    <div className="absolute top-1 left-20 text-stone-400 text-xs animate-bounce" style={{ animationDelay: '400ms' }}>♪</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Stage Information */}
          <div className="mb-6">
            <h2 className={cn("text-2xl font-semibold mb-2", stageInfo.color)}>
              {stageInfo.title}{dots}
            </h2>
            <p className="text-stone-500 text-sm">
              {message || stageInfo.subtitle}
            </p>
          </div>

          {/* Progress Bar */}
          {progress > 0 && (
            <div className="w-full max-w-sm mx-auto mb-4">
              <div className="flex justify-between text-xs text-stone-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-stone-400 to-stone-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Breathing animation for the card */}
          <div className={cn(
            "absolute inset-0 rounded-3xl border-2 transition-all duration-1000",
            stage === 'analyzing' 
              ? "border-stone-300 animate-pulse" 
              : "border-transparent"
          )} />

        </div>

        {/* Subtle corner indicators */}
        <div className="absolute top-4 left-4 w-3 h-3 border-l-2 border-t-2 border-stone-300 rounded-tl opacity-50" />
        <div className="absolute top-4 right-4 w-3 h-3 border-r-2 border-t-2 border-stone-300 rounded-tr opacity-50" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-l-2 border-b-2 border-stone-300 rounded-bl opacity-50" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-r-2 border-b-2 border-stone-300 rounded-br opacity-50" />
      </div>
    </div>
  )
}

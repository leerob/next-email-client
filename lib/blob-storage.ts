// Mock implementation for Vercel Blob storage
// In production, replace with actual @vercel/blob import

export interface UploadResult {
  url: string
  downloadUrl: string
  pathname: string
  size: number
}

// Mock put function that simulates Vercel Blob upload
async function put(filename: string, file: File, options: { access: string; multipart: boolean }) {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  // Generate mock URLs
  const timestamp = Date.now()
  const baseUrl = 'https://blob.vercel-storage.com'
  const pathname = `/${filename}`
  const url = `${baseUrl}${pathname}?t=${timestamp}`
  
  return {
    url,
    downloadUrl: url,
    pathname,
    size: file.size
  }
}

export async function uploadAudioToBlob(file: File): Promise<UploadResult> {
  try {
    // Generate a unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'mp3'
    const filename = `audio_${timestamp}_${random}.${extension}`

    // Upload to Vercel Blob (mock)
    const blob = await put(filename, file, {
      access: 'public',
      multipart: true
    })

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: file.size
    }
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error)
    throw new Error('Failed to upload audio file')
  }
}

export async function uploadRecordingToBlob(audioBlob: Blob, originalFilename: string): Promise<UploadResult> {
  // Convert Blob to File for consistent handling
  const file = new File([audioBlob], originalFilename, { type: audioBlob.type })
  return uploadAudioToBlob(file)
}

// Generate shareable link for uploaded audio
export function generateShareLink(blobUrl: string, audioId: string): string {
  // In a real app, you'd store this mapping in your database
  // For now, we'll use the blob URL with a custom ID
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://crescendai.com'
  return `${baseUrl}/shared/${audioId}?blob=${encodeURIComponent(blobUrl)}`
}

// Storage info for analytics
export interface StorageInfo {
  provider: 'vercel-blob'
  region: string
  uploadedAt: Date
  expiresAt?: Date
}

export function getStorageInfo(): StorageInfo {
  return {
    provider: 'vercel-blob',
    region: process.env.VERCEL_REGION || 'iad1',
    uploadedAt: new Date(),
    // Vercel Blob files don't expire by default
    expiresAt: undefined
  }
}

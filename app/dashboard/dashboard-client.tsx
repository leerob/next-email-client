// app/dashboard/dashboard-client.tsx
"use client"

import React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Sidebar from "@/components/sidebar"
import { createRecordingAction } from '@/lib/db/actions';

interface Recording {
  id: number
  name: string
  state: 'queued' | 'processing' | 'processed'
  createdAt: string
  organizationName: string
  organizationSlug: string
  hasResult: boolean
  createdBy: {
    firstName: string | null
    lastName: string | null
    username: string
  }
}

interface Organization {
  id: number
  name: string
  slug: string
  role: 'admin' | 'member'
  isPersonal: boolean
  memberCount: number
  recordingCount: number
}

interface DashboardClientProps {
  user: {
    name: string
    email: string
    image: string | null
  }
  organizations: Organization[]
  recordings: Recording[]
}

export default function DashboardClient({ user, organizations, recordings }: DashboardClientProps) {
  const { toast } = useToast()

  const handleCreateRecording = async (name: string, organizationId: number) => {
    const formData = new FormData()
    formData.append("name", name)
    formData.append("organizationId", organizationId.toString())

    const result = await createRecordingAction(null, formData)
    if (result?.error) {
      throw new Error(result.error)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Shared Sidebar Component */}
      <Sidebar
        user={user}
        organizations={organizations}
        recordings={recordings}
        onCreateRecording={handleCreateRecording}
      />

      {/* Main Content Area */}
      <div className="flex-1 bg-white">
        <div className="h-full flex flex-col">
          {/* Stats Header */}
          <div className="border-b p-6">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600">Total Organizations</p>
                <p className="text-2xl font-bold">{organizations.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Recordings</p>
                <p className="text-2xl font-bold">{recordings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold">
                  {recordings.filter(r => r.state === 'processed').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {recordings.filter(r => r.state === 'processing' || r.state === 'queued').length}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-6">
            {recordings.length === 0 ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black mb-4">Welcome to CrescendAI</h2>
                <p className="text-gray-600 mb-6">Create your first recording to get started</p>
                <Button
                  onClick={() => {
                    toast({
                      title: "Tip",
                      description: "Use the 'New Recording' button in the sidebar to create a recording",
                    })
                  }}
                  style={{ backgroundColor: "#C3F73A", color: "#01172F" }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-black mb-4">Welcome to CrescendAI</h2>
                <p className="text-gray-600">Select a recording from the sidebar or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

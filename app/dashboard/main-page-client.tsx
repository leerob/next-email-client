// app/dashboard/main-page-client.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { format } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Building2, LogOut, Plus, Mic, Clock, CheckCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRecordingAction } from '@/lib/db/actions';

interface Recording {
  id: number
  name: string
  state: 'queued' | 'processing' | 'processed'
  createdAt: string | Date
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
  createdAt?: string | Date
  joinedAt?: string | Date
}

interface MainPageClientProps {
  user: {
    name: string | null
    email: string
    image: string | null
  }
  organizations: Organization[]
  recordings: Recording[]
}

export default function MainPageClient({ user, organizations, recordings }: MainPageClientProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNewRecording, setShowNewRecording] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?.id || null)
  const [recordingName, setRecordingName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Group recordings by month
  const groupedRecordings = recordings.reduce(
    (acc, recording) => {
      const month = format(new Date(recording.createdAt), "MMMM yyyy")
      if (!acc[month]) {
        acc[month] = []
      }
      acc[month].push(recording)
      return acc
    },
    {} as Record<string, typeof recordings>,
  )

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  const handleOrganizations = () => {
    router.push("/organizations")
    setShowProfileMenu(false)
  }

  const handleCreateRecording = async () => {
    if (!recordingName.trim() || !selectedOrg) return

    setIsCreating(true)
    const formData = new FormData()
    formData.append("name", recordingName)
    formData.append("organizationId", selectedOrg.toString())

    try {
      const result = await createRecordingAction(null, formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Recording created",
          description: "Your new recording has been created and queued for processing.",
        })
        setShowNewRecording(false)
        setRecordingName("")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create recording. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const getStateIcon = (state: Recording['state']) => {
    switch (state) {
      case 'queued':
        return <Clock className="h-3 w-3" />
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin" />
      case 'processed':
        return <CheckCircle className="h-3 w-3" />
    }
  }

  const getStateColor = (state: Recording['state']) => {
    switch (state) {
      case 'queued':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'processed':
        return 'bg-green-100 text-green-800'
    }
  }

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-80 flex flex-col" style={{ backgroundColor: "#01172F" }}>
        {/* Header */}
        <div className="p-6 border-b border-opacity-20" style={{ borderColor: "#B4D2E7" }}>
          <h1 className="text-2xl font-bold text-white">CrescendAI</h1>
        </div>

        {/* New Recording Button */}
        <div className="p-4">
          <Dialog open={showNewRecording} onOpenChange={setShowNewRecording}>
            <DialogTrigger asChild>
              <Button
                className="w-full justify-start gap-2"
                style={{ backgroundColor: "#C3F73A", color: "#01172F" }}
              >
                <Plus className="h-4 w-4" />
                New Recording
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Recording</DialogTitle>
                <DialogDescription>
                  Start a new recording session for your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Recording Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Team Meeting Q1 2024"
                    value={recordingName}
                    onChange={(e) => setRecordingName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org">Organization</Label>
                  <select
                    id="org"
                    className="w-full rounded-md border border-gray-300 p-2"
                    value={selectedOrg || ''}
                    onChange={(e) => setSelectedOrg(parseInt(e.target.value))}
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} {org.isPersonal && "(Personal)"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowNewRecording(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRecording}
                    disabled={!recordingName.trim() || !selectedOrg || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Create Recording
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Recordings List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recordings</h2>

          {Object.keys(groupedRecordings).length === 0 ? (
            <p className="text-gray-400 text-sm">No recordings yet. Create your first recording!</p>
          ) : (
            Object.entries(groupedRecordings).map(([month, monthRecordings]) => (
              <div key={month} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300 mb-3">{month}</h3>
                {monthRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-opacity-15"
                    style={
                      {
                        backgroundColor: "transparent",
                        "--hover-bg": "#B4D2E7",
                      } as React.CSSProperties
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(180, 210, 231, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                    onClick={() => router.push(`/recordings/${recording.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm leading-relaxed truncate">
                          {recording.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {recording.organizationName}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {format(new Date(recording.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-2 flex items-center gap-1 ${getStateColor(recording.state)}`}
                      >
                        {getStateIcon(recording.state)}
                        {recording.state}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-opacity-20 relative" style={{ borderColor: "#B4D2E7" }}>
          <div
            className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(180, 210, 231, 0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent"
            }}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image || undefined} alt="Profile" />
              <AvatarFallback style={{ backgroundColor: "#C3F73A", color: "#01172F" }}>
                {getUserInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{user.name || user.email.split('@')[0]}</p>
              <p className="text-gray-300 text-xs truncate">{user.email}</p>
            </div>
          </div>

          {/* Profile Menu Popup */}
          {showProfileMenu && (
            <Card
              className="absolute bottom-full left-4 right-4 mb-2 p-2 shadow-lg border"
              style={{ backgroundColor: "white" }}
            >
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm gap-2"
                  onClick={handleOrganizations}
                >
                  <Building2 className="h-4 w-4" />
                  Organizations
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

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
                  onClick={() => setShowNewRecording(true)}
                  style={{ backgroundColor: "#C3F73A", color: "#01172F" }}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Recording
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

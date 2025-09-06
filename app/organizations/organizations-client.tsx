// app/organizations/organizations-client.tsx
"use client"

import { useState } from "react"
import { Building2, MoreVertical, Users, UserPlus, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { createOrganizationAction, inviteMemberAction } from '@/lib/db/actions';

interface Organization {
  id: number
  name: string
  slug: string
  description: string
  memberCount: number
  role: "admin" | "member"
  isPersonal: boolean
  recordingCount: number
  createdAt: string
}

interface Recording {
  id: number
  name: string
  state: "queued" | "processing" | "processed"
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

interface OrganizationsClientProps {
  user: {
    name: string
    email: string
    image: string | null
  }
  organizations: Organization[]
  recordings: Recording[]
}

export default function OrganizationsClient({ user, organizations, recordings }: OrganizationsClientProps) {
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState<number | null>(null)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgSlug, setNewOrgSlug] = useState("")
  const [newOrgDescription, setNewOrgDescription] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [isCreating, setIsCreating] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim() || !newOrgSlug.trim()) return

    setIsCreating(true)
    const formData = new FormData()
    formData.append("name", newOrgName)
    formData.append("slug", newOrgSlug)
    formData.append("description", newOrgDescription)

    try {
      const result = await createOrganizationAction(null, formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Organization created",
          description: "Your new organization has been created successfully.",
        })
        setShowCreateOrg(false)
        setNewOrgName("")
        setNewOrgSlug("")
        setNewOrgDescription("")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleInviteMember = async (orgId: number) => {
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    const formData = new FormData()
    formData.append("organizationId", orgId.toString())
    formData.append("email", inviteEmail)
    formData.append("role", inviteRole)

    try {
      const result = await inviteMemberAction(null, formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Member invited",
          description: `${inviteEmail} has been invited to the organization.`,
        })
        setShowInviteMember(null)
        setInviteEmail("")
        setInviteRole("member")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsInviting(false)
    }
  }

  const handleDeleteOrganization = async (orgId: number, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return
    }

    // For now, we'll just show a message since delete isn't implemented
    toast({
      title: "Not implemented",
      description: "Organization deletion is not yet implemented.",
    })
  }

  const handleViewMembers = (orgSlug: string) => {
    router.push(`/organizations/${orgSlug}/members`)
  }

  // Sidebar organizations data
  const sidebarOrganizations = organizations.map(org => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    role: org.role,
    isPersonal: org.isPersonal,
    memberCount: org.memberCount,
    recordingCount: org.recordingCount,
  }))

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar
        user={user}
        organizations={sidebarOrganizations}
        recordings={recordings}
      />

      {/* Main Content Area */}
      <div className="flex-1 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-[#0471A6]" />
                  <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                </div>
                <p className="text-gray-600 mt-2">Manage your organizations and team members</p>
              </div>

              {/* Create Organization Button */}
              <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
                <DialogTrigger asChild>
                  <Button style={{ backgroundColor: "#C3F73A", color: "#01172F" }} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Organization
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Organization</DialogTitle>
                    <DialogDescription>
                      Set up a new organization to collaborate with your team.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name">Organization Name</Label>
                      <Input
                        id="org-name"
                        placeholder="e.g., Acme Corporation"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-slug">URL Slug</Label>
                      <Input
                        id="org-slug"
                        placeholder="e.g., acme-corp"
                        value={newOrgSlug}
                        onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      />
                      <p className="text-xs text-gray-500">Lowercase letters, numbers, and dashes only</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="org-description">Description (Optional)</Label>
                      <Textarea
                        id="org-description"
                        placeholder="Brief description of your organization"
                        value={newOrgDescription}
                        onChange={(e) => setNewOrgDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowCreateOrg(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateOrganization}
                              disabled={!newOrgName.trim() || !newOrgSlug.trim() || isCreating}>
                        {isCreating ? "Creating..." : "Create Organization"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Organizations Grid */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.filter(org => !org.isPersonal).map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#0471A6]/10 rounded-lg">
                        <Building2 className="h-6 w-6 text-[#0471A6]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{org.name}</h3>
                        <Badge
                          variant={org.role === "admin" ? "default" : "secondary"}
                          className={org.role === "admin" ? "bg-[#C3F73A] text-black hover:bg-[#C3F73A]/80" : ""}
                        >
                          {org.role === "admin" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewMembers(org.slug)} className="cursor-pointer">
                          <Users className="h-4 w-4 mr-2" />
                          View Members
                        </DropdownMenuItem>
                        {org.role === "admin" && (
                          <>
                            <DropdownMenuItem onClick={() => setShowInviteMember(org.id)} className="cursor-pointer">
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite Member
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteOrganization(org.id, org.name)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {org.description || "No description provided"}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{org.memberCount} members</span>
                    </div>
                    <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {organizations.filter(org => !org.isPersonal).length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-600">Create your first organization to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteMember !== null} onOpenChange={() => setShowInviteMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a new member to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                className="w-full rounded-md border border-gray-300 p-2"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowInviteMember(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => showInviteMember && handleInviteMember(showInviteMember)}
                disabled={!inviteEmail.trim() || isInviting}
              >
                {isInviting ? "Inviting..." : "Send Invitation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

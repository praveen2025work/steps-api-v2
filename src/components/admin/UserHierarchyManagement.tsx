import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { UserHierarchyAccessForm } from './UserHierarchyAccessForm'

// Mock data types
interface User {
  id: string
  username: string
  fullName: string
  email: string
  isActive: boolean
}

interface Application {
  id: string
  name: string
  description: string
}

interface HierarchyLevel {
  id: string
  name: string
  level: number
}

interface UserHierarchyAccess {
  id: string
  userId: string
  applicationId: string
  hierarchyLevelId: string
  hierarchyValues: string[]
  isReadOnly: boolean
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

// Mock data
const mockUsers: User[] = [
  { id: 'user-001', username: 'jdoe', fullName: 'John Doe', email: 'john.doe@example.com', isActive: true },
  { id: 'user-002', username: 'asmith', fullName: 'Alice Smith', email: 'alice.smith@example.com', isActive: true },
  { id: 'user-003', username: 'bjohnson', fullName: 'Bob Johnson', email: 'bob.johnson@example.com', isActive: true },
  { id: 'user-004', username: 'cwilliams', fullName: 'Carol Williams', email: 'carol.williams@example.com', isActive: false },
  { id: 'user-005', username: 'dthomas', fullName: 'David Thomas', email: 'david.thomas@example.com', isActive: true },
]

const mockApplications: Application[] = [
  { id: 'app-001', name: 'Risk Management', description: 'Risk assessment and management application' },
  { id: 'app-002', name: 'Trading Platform', description: 'Trading and order management system' },
  { id: 'app-003', name: 'Compliance System', description: 'Regulatory compliance tracking system' },
  { id: 'app-004', name: 'Financial Reporting', description: 'Financial reporting and analytics' },
]

const mockHierarchyLevels: HierarchyLevel[] = [
  { id: 'level-001', name: 'Region', level: 1 },
  { id: 'level-002', name: 'Country', level: 2 },
  { id: 'level-003', name: 'Business Unit', level: 3 },
  { id: 'level-004', name: 'Department', level: 4 },
  { id: 'level-005', name: 'Team', level: 5 },
]

const mockUserHierarchyAccess: UserHierarchyAccess[] = [
  { 
    id: 'access-001', 
    userId: 'user-001', 
    applicationId: 'app-001', 
    hierarchyLevelId: 'level-002', 
    hierarchyValues: ['USA', 'Canada', 'Mexico'], 
    isReadOnly: false,
    createdBy: 'admin',
    createdAt: '2025-05-01 10:30:00',
  },
  { 
    id: 'access-002', 
    userId: 'user-001', 
    applicationId: 'app-002', 
    hierarchyLevelId: 'level-003', 
    hierarchyValues: ['Equities', 'Fixed Income'], 
    isReadOnly: true,
    createdBy: 'admin',
    createdAt: '2025-05-02 14:15:00',
  },
  { 
    id: 'access-003', 
    userId: 'user-002', 
    applicationId: 'app-001', 
    hierarchyLevelId: 'level-001', 
    hierarchyValues: ['EMEA', 'APAC'], 
    isReadOnly: false,
    createdBy: 'admin',
    createdAt: '2025-05-03 09:45:00',
  },
  { 
    id: 'access-004', 
    userId: 'user-003', 
    applicationId: 'app-003', 
    hierarchyLevelId: 'level-004', 
    hierarchyValues: ['Compliance', 'Legal'], 
    isReadOnly: true,
    createdBy: 'admin',
    createdAt: '2025-05-04 11:20:00',
  },
]

export function UserHierarchyManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [hierarchyLevels, setHierarchyLevels] = useState<HierarchyLevel[]>([])
  const [userHierarchyAccess, setUserHierarchyAccess] = useState<UserHierarchyAccess[]>([])
  
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAccessId, setEditingAccessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load mock data
  useEffect(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers)
      setApplications(mockApplications)
      setHierarchyLevels(mockHierarchyLevels)
      setUserHierarchyAccess(mockUserHierarchyAccess)
      setLoading(false)
    }, 500)
  }, [])

  // Filter access records based on selected user, application, and search query
  const filteredAccess = userHierarchyAccess.filter(access => {
    const matchesUser = !selectedUser || access.userId === selectedUser
    const matchesApplication = !selectedApplication || access.applicationId === selectedApplication
    
    if (!searchQuery) return matchesUser && matchesApplication
    
    const user = users.find(u => u.id === access.userId)
    const application = applications.find(a => a.id === access.applicationId)
    const hierarchyLevel = hierarchyLevels.find(h => h.id === access.hierarchyLevelId)
    
    const searchLower = searchQuery.toLowerCase()
    
    return (
      matchesUser && 
      matchesApplication && 
      (
        (user && (
          user.username.toLowerCase().includes(searchLower) ||
          user.fullName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        )) ||
        (application && application.name.toLowerCase().includes(searchLower)) ||
        (hierarchyLevel && hierarchyLevel.name.toLowerCase().includes(searchLower)) ||
        access.hierarchyValues.some(v => v.toLowerCase().includes(searchLower))
      )
    )
  })

  const handleAddAccess = () => {
    setEditingAccessId(null)
    setIsFormOpen(true)
  }

  const handleEditAccess = (accessId: string) => {
    setEditingAccessId(accessId)
    setIsFormOpen(true)
  }

  const handleDeleteAccess = (accessId: string) => {
    // In a real application, this would call an API to delete the access
    setUserHierarchyAccess(prev => prev.filter(access => access.id !== accessId))
  }

  const handleFormSubmit = (formData: any) => {
    if (editingAccessId) {
      // Update existing access
      setUserHierarchyAccess(prev => 
        prev.map(access => 
          access.id === editingAccessId 
            ? { 
                ...access, 
                ...formData,
                updatedBy: 'current-user',
                updatedAt: new Date().toLocaleString()
              } 
            : access
        )
      )
    } else {
      // Add new access
      const newAccess: UserHierarchyAccess = {
        id: `access-${Date.now()}`,
        ...formData,
        createdBy: 'current-user',
        createdAt: new Date().toLocaleString()
      }
      setUserHierarchyAccess(prev => [...prev, newAccess])
    }
    
    setIsFormOpen(false)
    setEditingAccessId(null)
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingAccessId(null)
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.fullName : 'Unknown User'
  }

  const getApplicationName = (appId: string) => {
    const app = applications.find(a => a.id === appId)
    return app ? app.name : 'Unknown Application'
  }

  const getHierarchyLevelName = (levelId: string) => {
    const level = hierarchyLevels.find(l => l.id === levelId)
    return level ? level.name : 'Unknown Level'
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading user hierarchy data...</div>
  }

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <UserHierarchyAccessForm 
          users={users}
          applications={applications}
          hierarchyLevels={hierarchyLevels}
          editingAccess={editingAccessId ? userHierarchyAccess.find(a => a.id === editingAccessId) : null}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Filter Hierarchy Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Select value={selectedUser || 'all-users'} onValueChange={value => setSelectedUser(value === 'all-users' ? null : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select User" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">All Users</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName} ({user.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedApplication || 'all-apps'} onValueChange={value => setSelectedApplication(value === 'all-apps' ? null : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Application" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-apps">All Applications</SelectItem>
                      {applications.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">User Hierarchy Access</h2>
            <Button onClick={handleAddAccess}>
              <Plus className="h-4 w-4 mr-2" />
              Add Access
            </Button>
          </div>
          
          {filteredAccess.length === 0 ? (
            <div className="bg-muted p-8 rounded-lg text-center">
              <p className="text-muted-foreground">No hierarchy access records found matching your criteria.</p>
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Hierarchy Level</TableHead>
                      <TableHead>Values</TableHead>
                      <TableHead>Access Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccess.map(access => (
                      <TableRow key={access.id}>
                        <TableCell>{getUserName(access.userId)}</TableCell>
                        <TableCell>{getApplicationName(access.applicationId)}</TableCell>
                        <TableCell>{getHierarchyLevelName(access.hierarchyLevelId)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {access.hierarchyValues.map((value, index) => (
                              <Badge key={index} variant="outline">{value}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {access.isReadOnly ? (
                            <Badge variant="secondary">Read Only</Badge>
                          ) : (
                            <Badge variant="default">Read/Write</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {access.createdAt}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditAccess(access.id)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteAccess(access.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
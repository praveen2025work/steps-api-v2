import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

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

interface UserHierarchyAccessFormProps {
  users: User[]
  applications: Application[]
  hierarchyLevels: HierarchyLevel[]
  editingAccess: UserHierarchyAccess | null
  onSubmit: (formData: any) => void
  onCancel: () => void
}

// Mock hierarchy values based on level
const getMockHierarchyValues = (levelId: string): string[] => {
  const valuesByLevel: Record<string, string[]> = {
    'level-001': ['EMEA', 'APAC', 'Americas', 'Global'],
    'level-002': ['USA', 'UK', 'Germany', 'Japan', 'China', 'Canada', 'Australia', 'France', 'Mexico', 'Brazil'],
    'level-003': ['Equities', 'Fixed Income', 'FX', 'Commodities', 'Derivatives', 'Retail Banking', 'Corporate Banking'],
    'level-004': ['Trading', 'Risk', 'Compliance', 'Operations', 'IT', 'Finance', 'Legal', 'HR'],
    'level-005': ['Front Office', 'Middle Office', 'Back Office', 'Development', 'Support', 'Analytics']
  }
  
  return valuesByLevel[levelId] || []
}

export function UserHierarchyAccessForm({ 
  users, 
  applications, 
  hierarchyLevels, 
  editingAccess, 
  onSubmit, 
  onCancel 
}: UserHierarchyAccessFormProps) {
  const [userId, setUserId] = useState(editingAccess?.userId || '')
  const [applicationId, setApplicationId] = useState(editingAccess?.applicationId || '')
  const [hierarchyLevelId, setHierarchyLevelId] = useState(editingAccess?.hierarchyLevelId || '')
  const [selectedValues, setSelectedValues] = useState<string[]>(editingAccess?.hierarchyValues || [])
  const [isReadOnly, setIsReadOnly] = useState(editingAccess?.isReadOnly || false)
  const [availableValues, setAvailableValues] = useState<string[]>([])
  const [newValueInput, setNewValueInput] = useState('')
  
  // Load available hierarchy values when level changes
  useEffect(() => {
    if (hierarchyLevelId) {
      setAvailableValues(getMockHierarchyValues(hierarchyLevelId))
    } else {
      setAvailableValues([])
    }
  }, [hierarchyLevelId])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!userId || !applicationId || !hierarchyLevelId || selectedValues.length === 0) {
      // In a real app, show validation errors
      alert('Please fill in all required fields and select at least one hierarchy value')
      return
    }
    
    onSubmit({
      userId,
      applicationId,
      hierarchyLevelId,
      hierarchyValues: selectedValues,
      isReadOnly
    })
  }
  
  const handleValueToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter(v => v !== value))
    } else {
      setSelectedValues([...selectedValues, value])
    }
  }
  
  const handleAddCustomValue = () => {
    if (newValueInput && !availableValues.includes(newValueInput) && !selectedValues.includes(newValueInput)) {
      setSelectedValues([...selectedValues, newValueInput])
      setNewValueInput('')
    }
  }
  
  const handleRemoveValue = (value: string) => {
    setSelectedValues(selectedValues.filter(v => v !== value))
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAccess ? 'Edit Hierarchy Access' : 'Add Hierarchy Access'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select 
                value={userId} 
                onValueChange={setUserId}
                disabled={!!editingAccess} // Disable changing user when editing
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select User" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.isActive).map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="application">Application</Label>
              <Select 
                value={applicationId} 
                onValueChange={setApplicationId}
                disabled={!!editingAccess} // Disable changing application when editing
              >
                <SelectTrigger id="application">
                  <SelectValue placeholder="Select Application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map(app => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hierarchyLevel">Hierarchy Level</Label>
            <Select value={hierarchyLevelId} onValueChange={setHierarchyLevelId}>
              <SelectTrigger id="hierarchyLevel">
                <SelectValue placeholder="Select Hierarchy Level" />
              </SelectTrigger>
              <SelectContent>
                {hierarchyLevels.map(level => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.name} (Level {level.level})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="hierarchyValues">Hierarchy Values</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="readOnly" className="text-sm">Read Only</Label>
                <Switch 
                  id="readOnly" 
                  checked={isReadOnly} 
                  onCheckedChange={setIsReadOnly} 
                />
              </div>
            </div>
            
            {hierarchyLevelId && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableValues.map(value => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`value-${value}`} 
                        checked={selectedValues.includes(value)}
                        onCheckedChange={() => handleValueToggle(value)}
                      />
                      <Label htmlFor={`value-${value}`} className="text-sm">
                        {value}
                      </Label>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add custom value"
                    value={newValueInput}
                    onChange={e => setNewValueInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddCustomValue}
                    disabled={!newValueInput}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </>
            )}
            
            {selectedValues.length > 0 && (
              <div className="border rounded-md p-3">
                <Label className="text-sm mb-2 block">Selected Values:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedValues.map(value => (
                    <Badge key={value} variant="secondary" className="flex items-center gap-1">
                      {value}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveValue(value)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {editingAccess ? 'Update Access' : 'Add Access'}
        </Button>
      </CardFooter>
    </Card>
  )
}
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings, Plus, X, Save } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface MonasteryConfig {
  id: string
  name: string
  confirmation_days_config: {
    reminder_days: number[]
    require_monastery_approval: boolean
  }
}

interface ConfirmationSettingsProps {
  monasteryConfig: MonasteryConfig
  onConfigUpdated: (updatedConfig: MonasteryConfig) => void
}

export function ConfirmationSettings({ monasteryConfig, onConfigUpdated }: ConfirmationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Local state for editing
  const [reminderDays, setReminderDays] = useState<number[]>(
    monasteryConfig.confirmation_days_config.reminder_days
  )
  const [requireApproval, setRequireApproval] = useState(
    monasteryConfig.confirmation_days_config.require_monastery_approval
  )
  const [newDay, setNewDay] = useState('')

  const resetForm = () => {
    setReminderDays(monasteryConfig.confirmation_days_config.reminder_days)
    setRequireApproval(monasteryConfig.confirmation_days_config.require_monastery_approval)
    setNewDay('')
    setError(null)
  }

  const addReminderDay = () => {
    const day = parseInt(newDay)
    if (day && day > 0 && day <= 30 && !reminderDays.includes(day)) {
      setReminderDays([...reminderDays, day].sort((a, b) => b - a))
      setNewDay('')
    }
  }

  const removeReminderDay = (dayToRemove: number) => {
    setReminderDays(reminderDays.filter(day => day !== dayToRemove))
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)

      if (reminderDays.length === 0) {
        setError('At least one reminder day is required')
        return
      }

      const updatedConfig = {
        reminder_days: reminderDays,
        require_monastery_approval: requireApproval
      }

      const { error } = await supabase
        .from('monasteries')
        .update({
          confirmation_days_config: updatedConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', monasteryConfig.id)

      if (error) throw error

      // Update the parent component
      onConfigUpdated({
        ...monasteryConfig,
        confirmation_days_config: updatedConfig
      })

      setIsOpen(false)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Confirmation Settings
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmation Settings</DialogTitle>
          <DialogDescription>
            Configure when to receive reminders for upcoming donations at {monasteryConfig.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Monastery Approval Setting */}
          <div className="space-y-2">
            <Label htmlFor="require-approval">Monastery Approval Process</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="require-approval"
                checked={requireApproval}
                onCheckedChange={setRequireApproval}
              />
              <Label htmlFor="require-approval" className="text-sm text-muted-foreground">
                Require monastery approval before donors can proceed
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              When enabled, all donations must be approved by a monastery representative before proceeding.
            </p>
          </div>

          {/* Reminder Days Setting */}
          <div className="space-y-3">
            <Label>Reminder Days</Label>
            <p className="text-sm text-muted-foreground">
              Set how many days before a donation you want to receive confirmation reminders.
            </p>
            
            {/* Current reminder days */}
            <div className="flex flex-wrap gap-2">
              {reminderDays.map((day) => (
                <Badge key={day} variant="secondary" className="flex items-center gap-1">
                  {day} {day === 1 ? 'day' : 'days'}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removeReminderDay(day)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {reminderDays.length === 0 && (
                <p className="text-sm text-muted-foreground italic">No reminder days set</p>
              )}
            </div>

            {/* Add new reminder day */}
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="30"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                placeholder="Days before"
                className="w-32"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={addReminderDay}
                disabled={!newDay || parseInt(newDay) <= 0 || parseInt(newDay) > 30}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Add days between 1-30. Common values are 5 days and 1 day before the donation.
            </p>
          </div>

          {/* Preview */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="mt-2 space-y-1 text-sm">
              {requireApproval && (
                <p>✓ Monastery approval required for all donations</p>
              )}
              {reminderDays.length > 0 ? (
                <p>✓ Confirmation reminders: {reminderDays.join(', ')} {reminderDays.length === 1 ? 'day' : 'days'} before donation</p>
              ) : (
                <p className="text-muted-foreground">⚠ No reminder days configured</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={loading || reminderDays.length === 0}
          >
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

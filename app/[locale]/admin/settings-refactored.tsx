/**
 * Refactored Admin Settings Page
 * 
 * Modernized version using the new AuthGuard and layout components.
 * This demonstrates how to use the refactored patterns in a real page.
 */

'use client'

import { useState } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { PageLayout, MainContent } from '@/components/layout/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database,
  Shield,
  Bell,
  Users,
  Building,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  maxUsersPerMonastery: number
  maxSlotsPerDay: number
  autoApproveMonasteries: boolean
  requireEmailVerification: boolean
  enableNotifications: boolean
  maintenanceMode: boolean
  allowPublicRegistration: boolean
  defaultUserType: 'donor' | 'monastery_admin'
}

export default function Settings() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Dhaana',
    siteDescription: 'Platform for connecting donors with monasteries',
    contactEmail: 'contact@dhaana.org',
    supportEmail: 'support@dhaana.org',
    maxUsersPerMonastery: 5,
    maxSlotsPerDay: 10,
    autoApproveMonasteries: false,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    allowPublicRegistration: true,
    defaultUserType: 'donor'
  })
  
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const handleInputChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsDirty(false)
      toast.success('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings({
      siteName: 'Dhaana',
      siteDescription: 'Platform for connecting donors with monasteries',
      contactEmail: 'contact@dhaana.org',
      supportEmail: 'support@dhaana.org',
      maxUsersPerMonastery: 5,
      maxSlotsPerDay: 10,
      autoApproveMonasteries: false,
      requireEmailVerification: true,
      enableNotifications: true,
      maintenanceMode: false,
      allowPublicRegistration: true,
      defaultUserType: 'donor'
    })
    setIsDirty(true)
  }

  return (
    <AuthGuard requiredRole="super_admin">
      <PageLayout>
        <MainContent>
          <SettingsHeader 
            isDirty={isDirty} 
            loading={loading} 
            onSave={saveSettings} 
            onReset={resetSettings} 
          />
          
          <div className="space-y-6">
            <GeneralSettings settings={settings} onChange={handleInputChange} />
            <UserManagementSettings settings={settings} onChange={handleInputChange} />
            <MonasterySettings settings={settings} onChange={handleInputChange} />
            <NotificationSettings settings={settings} onChange={handleInputChange} />
            <SecuritySettings settings={settings} onChange={handleInputChange} />
            <DangerZone />
          </div>
        </MainContent>
      </PageLayout>
    </AuthGuard>
  )
}

/**
 * Settings page header component
 */
function SettingsHeader({ 
  isDirty, 
  loading, 
  onSave, 
  onReset 
}: {
  isDirty: boolean
  loading: boolean
  onSave: () => void
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure platform settings and preferences
        </p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onReset}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button 
          onClick={onSave} 
          disabled={!isDirty || loading}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}

/**
 * General settings section
 */
function GeneralSettings({ settings, onChange }: {
  settings: SystemSettings
  onChange: (field: keyof SystemSettings, value: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2" />
          General Settings
        </CardTitle>
        <CardDescription>Basic platform configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => onChange('siteName', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => onChange('contactEmail', e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="siteDescription">Site Description</Label>
          <Textarea
            id="siteDescription"
            value={settings.siteDescription}
            onChange={(e) => onChange('siteDescription', e.target.value)}
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="supportEmail">Support Email</Label>
          <Input
            id="supportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={(e) => onChange('supportEmail', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * User management settings section
 */
function UserManagementSettings({ settings, onChange }: {
  settings: SystemSettings
  onChange: (field: keyof SystemSettings, value: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          User Management
        </CardTitle>
        <CardDescription>Configure user registration and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Allow Public Registration</Label>
            <p className="text-sm text-muted-foreground">
              Allow new users to register without invitation
            </p>
          </div>
          <Switch
            checked={settings.allowPublicRegistration}
            onCheckedChange={(checked: boolean) => onChange('allowPublicRegistration', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Email Verification</Label>
            <p className="text-sm text-muted-foreground">
              Users must verify their email before accessing the platform
            </p>
          </div>
          <Switch
            checked={settings.requireEmailVerification}
            onCheckedChange={(checked: boolean) => onChange('requireEmailVerification', checked)}
          />
        </div>

        <div>
          <Label>Default User Type</Label>
          <Select 
            value={settings.defaultUserType} 
            onValueChange={(value) => onChange('defaultUserType', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="monastery_admin">Monastery Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Monastery settings section
 */
function MonasterySettings({ settings, onChange }: {
  settings: SystemSettings
  onChange: (field: keyof SystemSettings, value: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Monastery Management
        </CardTitle>
        <CardDescription>Configure monastery-related settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Auto-Approve Monasteries</Label>
            <p className="text-sm text-muted-foreground">
              Automatically approve new monastery registrations
            </p>
          </div>
          <Switch
            checked={settings.autoApproveMonasteries}
            onCheckedChange={(checked: boolean) => onChange('autoApproveMonasteries', checked)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="maxUsersPerMonastery">Max Users per Monastery</Label>
            <Input
              id="maxUsersPerMonastery"
              type="number"
              min="1"
              max="50"
              value={settings.maxUsersPerMonastery}
              onChange={(e) => onChange('maxUsersPerMonastery', parseInt(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="maxSlotsPerDay">Max Slots per Day</Label>
            <Input
              id="maxSlotsPerDay"
              type="number"
              min="1"
              max="24"
              value={settings.maxSlotsPerDay}
              onChange={(e) => onChange('maxSlotsPerDay', parseInt(e.target.value))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Notification settings section
 */
function NotificationSettings({ settings, onChange }: {
  settings: SystemSettings
  onChange: (field: keyof SystemSettings, value: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </CardTitle>
        <CardDescription>Configure system notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send email notifications for important events
            </p>
          </div>
          <Switch
            checked={settings.enableNotifications}
            onCheckedChange={(checked: boolean) => onChange('enableNotifications', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Security settings section
 */
function SecuritySettings({ settings, onChange }: {
  settings: SystemSettings
  onChange: (field: keyof SystemSettings, value: any) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Security & Maintenance
        </CardTitle>
        <CardDescription>System security and maintenance options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Maintenance Mode</Label>
            <p className="text-sm text-muted-foreground">
              Put the site in maintenance mode for all non-admin users
            </p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onCheckedChange={(checked: boolean) => onChange('maintenanceMode', checked)}
          />
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold mb-4">System Actions</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" onClick={() => toast.success('Cache cleared successfully')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" onClick={() => toast.success('Data export initiated. You will receive an email when complete.')}>
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Danger zone section
 */
function DangerZone() {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                Reset All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete all
                  data including users, monasteries, and bookings.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">
                  Yes, reset all data
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
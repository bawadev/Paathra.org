'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  DollarSign, 
  MapPin, 
  Search, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { GoogleMapsUsageTracker } from '@/lib/google-maps-service'
import { LocationService } from '@/lib/location-services'

interface UsageStats {
  mapLoads: number
  geocodes: number
  autocompletes: number
  estimatedCost: number
}

export function MapsUsageDashboard() {
  const [usage, setUsage] = useState<UsageStats>({
    mapLoads: 0,
    geocodes: 0,
    autocompletes: 0,
    estimatedCost: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  const loadUsageData = () => {
    setIsLoading(true)
    try {
      const monthlyUsage = GoogleMapsUsageTracker.getMonthlyUsage()
      const estimatedCost = GoogleMapsUsageTracker.estimateMonthlyCost()
      
      setUsage({
        mapLoads: monthlyUsage.mapLoads,
        geocodes: monthlyUsage.geocodes,
        autocompletes: monthlyUsage.autocompletes,
        estimatedCost
      })
    } catch (error) {
      console.error('Error loading usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsageData()
  }, [])

  const clearUsageData = () => {
    try {
      localStorage.removeItem('dhaana_gmaps_usage')
      LocationService.clearCache()
      loadUsageData()
    } catch (error) {
      console.error('Error clearing usage data:', error)
    }
  }

  const getCostColor = (cost: number) => {
    if (cost < 50) return 'text-green-600'
    if (cost < 200) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCostBadgeVariant = (cost: number) => {
    if (cost < 50) return 'default'
    if (cost < 200) return 'secondary'
    return 'destructive'
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  // Monthly limits for cost estimation
  const MONTHLY_LIMITS = {
    mapLoads: 28000, // $200 worth at $7/1K
    geocodes: 40000, // $200 worth at $5/1K
    autocompletes: 12000 // $200 worth at $17/1K
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Maps Usage Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading usage data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maps Usage Dashboard</h2>
          <p className="text-gray-600">Monitor your Google Maps API usage and costs</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadUsageData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={clearUsageData}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Data
          </Button>
        </div>
      </div>

      {/* Cost Alert */}
      {usage.estimatedCost > 100 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your estimated monthly cost is ${usage.estimatedCost.toFixed(2)}. 
            Consider optimizing usage or switching to OpenStreetMap for some operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCostColor(usage.estimatedCost)}`}>
              ${usage.estimatedCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Map Loads</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.mapLoads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${((usage.mapLoads / 1000) * 7).toFixed(2)} cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geocoding</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.geocodes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${((usage.geocodes / 1000) * 5).toFixed(2)} cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Autocomplete</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage.autocompletes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${((usage.autocompletes / 1000) * 17).toFixed(2)} cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Limits</CardTitle>
          <CardDescription>
            Track your usage against recommended monthly limits to control costs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Map Loads</span>
              <Badge variant={usage.mapLoads > MONTHLY_LIMITS.mapLoads * 0.8 ? 'destructive' : 'default'}>
                {usage.mapLoads.toLocaleString()} / {MONTHLY_LIMITS.mapLoads.toLocaleString()}
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(usage.mapLoads, MONTHLY_LIMITS.mapLoads)} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Geocoding Requests</span>
              <Badge variant={usage.geocodes > MONTHLY_LIMITS.geocodes * 0.8 ? 'destructive' : 'default'}>
                {usage.geocodes.toLocaleString()} / {MONTHLY_LIMITS.geocodes.toLocaleString()}
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(usage.geocodes, MONTHLY_LIMITS.geocodes)} 
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Autocomplete Requests</span>
              <Badge variant={usage.autocompletes > MONTHLY_LIMITS.autocompletes * 0.8 ? 'destructive' : 'default'}>
                {usage.autocompletes.toLocaleString()} / {MONTHLY_LIMITS.autocompletes.toLocaleString()}
              </Badge>
            </div>
            <Progress 
              value={getUsagePercentage(usage.autocompletes, MONTHLY_LIMITS.autocompletes)} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Optimization Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Tips</CardTitle>
          <CardDescription>
            Ways to reduce your Google Maps API costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Use OpenStreetMap by default:</strong> Only switch to Google Maps when users need precision mode
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Enable caching:</strong> Our system caches geocoding results for 30 days to reduce API calls
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Use Radar for autocomplete:</strong> Radar's autocomplete is ~94% cheaper than Google's
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Implement usage limits:</strong> Set daily/monthly limits to prevent unexpected costs
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MascotIcon } from "@/components/mascot-icon"
import { Moon, Sun, User, Lock, LogOut, Trash2, HelpCircle, Download, MessageCircle } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function SettingsPage() {
  const [theme, setTheme] = useState("light")
  const [mascotEnabled, setMascotEnabled] = useState(true)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [mascotSize, setMascotSize] = useState(50)

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/" // Redirect to home or login page
  }

  // Placeholder handlers
  const handleChangePassword = () => alert("Change password functionality coming soon.")
  const handleExportData = () => alert("Export data functionality coming soon.")
  const handleDeleteAccount = () => alert("Delete account functionality coming soon.")

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your Mindzi experience</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6 grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">A</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" defaultValue="Alex Johnson" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue="alex@example.com" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Subscription</h3>
                  <p className="text-sm text-muted-foreground">You're currently on the Pro plan</p>
                </div>
                <Badge>Pro</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Learning Style</h3>
                  <p className="text-sm text-muted-foreground">How do you prefer to learn?</p>
                </div>
                <Select defaultValue="visual">
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="auditory">Auditory</SelectItem>
                    <SelectItem value="reading">Reading/Writing</SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Change Password</h3>
                    <p className="text-sm text-muted-foreground">Update your password</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangePassword}>Change</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Export Data</h3>
                    <p className="text-sm text-muted-foreground">Download all your data</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData}>Export</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out from all devices</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
              </div>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                </div>
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount}>Delete</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how and when Mindzi notifies you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                </div>
                <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>
              {notificationsEnabled && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="font-medium">Notification Types</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="study-reminders" className="flex-1">
                          Study Reminders
                        </Label>
                        <Switch id="study-reminders" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="deadline-alerts" className="flex-1">
                          Deadline Alerts
                        </Label>
                        <Switch id="deadline-alerts" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="achievement-updates" className="flex-1">
                          Achievement Updates
                        </Label>
                        <Switch id="achievement-updates" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tips-suggestions" className="flex-1">
                          Tips & Suggestions
                        </Label>
                        <Switch id="tips-suggestions" defaultChecked />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notification Sounds</h3>
                        <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                      </div>
                      <Switch checked={soundsEnabled} onCheckedChange={setSoundsEnabled} />
                    </div>
                    {soundsEnabled && (
                      <div className="grid gap-2">
                        <Label htmlFor="notification-sound">Sound Theme</Label>
                        <Select defaultValue="gentle">
                          <SelectTrigger id="notification-sound">
                            <SelectValue placeholder="Select sound theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gentle">Gentle</SelectItem>
                            <SelectItem value="focus">Focus</SelectItem>
                            <SelectItem value="nature">Nature</SelectItem>
                            <SelectItem value="minimal">Minimal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="quiet-hours">Quiet Hours</Label>
                      <Switch id="quiet-hours" defaultChecked />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-start">Start Time</Label>
                        <Input type="time" id="quiet-start" defaultValue="22:00" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quiet-end">End Time</Label>
                        <Input type="time" id="quiet-end" defaultValue="07:00" />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Voice Recognition</h3>
                  <p className="text-sm text-muted-foreground">Enable voice input for chat and commands</p>
                </div>
                <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-medium">Data Collection</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="learning-data" className="flex-1">
                      Learning Data
                      <span className="block text-xs text-muted-foreground">
                        Store your learning progress and habits
                      </span>
                    </Label>
                    <Switch id="learning-data" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="usage-analytics" className="flex-1">
                      Usage Analytics
                      <span className="block text-xs text-muted-foreground">
                        Help improve Mindzi with anonymous usage data
                      </span>
                    </Label>
                    <Switch id="usage-analytics" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="personalization" className="flex-1">
                      Personalization
                      <span className="block text-xs text-muted-foreground">
                        Allow AI to personalize your experience
                      </span>
                    </Label>
                    <Switch id="personalization" defaultChecked />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Data Retention</h3>
                <p className="text-sm text-muted-foreground">Choose how long to keep your study data</p>
                <Select defaultValue="1-year">
                  <SelectTrigger>
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-months">3 months</SelectItem>
                    <SelectItem value="6-months">6 months</SelectItem>
                    <SelectItem value="1-year">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Chat History</h3>
                    <p className="text-sm text-muted-foreground">Manage your conversations with Mindzi</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Clear History
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Default</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>Get help with using Mindzi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Help Center</h3>
                    <p className="text-sm text-muted-foreground">Browse tutorials and FAQs</p>
                  </div>
                </div>
                <Button variant="outline">Visit</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Contact Support</h3>
                    <p className="text-sm text-muted-foreground">Get help from our team</p>
                  </div>
                </div>
                <Button variant="outline">Contact</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Privacy Policy</h3>
                    <p className="text-sm text-muted-foreground">Read our privacy policy</p>
                  </div>
                </div>
                <Button variant="outline">View</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

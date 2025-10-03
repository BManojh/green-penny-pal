import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, Download } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-500/10">
          <SettingsIcon className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your Green Penny Pal experience</p>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Activity Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to log your daily eco-activities
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Achievement Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate when you unlock new achievements
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Progress Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive weekly summaries of your eco-impact
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Community Challenge Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Stay updated on community challenges and events
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">AI Suggestion Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when AI generates new personalized suggestions
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-3">
                <Label>Reminder Time</Label>
                <Select defaultValue="19">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9:00 AM</SelectItem>
                    <SelectItem value="12">12:00 PM</SelectItem>
                    <SelectItem value="18">6:00 PM</SelectItem>
                    <SelectItem value="19">7:00 PM</SelectItem>
                    <SelectItem value="20">8:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-foreground">Privacy & Sharing</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other community members
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Share Activity Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow your activities to contribute to community statistics
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Leaderboard Participation</Label>
                  <p className="text-sm text-muted-foreground">
                    Appear in community leaderboards and rankings
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Location-based Features</Label>
                  <p className="text-sm text-muted-foreground">
                    Use location data for local recommendations and challenges
                  </p>
                </div>
                <Switch />
              </div>

              <div className="space-y-3">
                <Label>Data Retention</Label>
                <Select defaultValue="forever">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2years">2 Years</SelectItem>
                    <SelectItem value="5years">5 Years</SelectItem>
                    <SelectItem value="forever">Keep Forever</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How long to keep your activity data
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-foreground">Appearance & Display</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>

              <div className="space-y-3">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी</SelectItem>
                    <SelectItem value="mr">मराठी</SelectItem>
                    <SelectItem value="ta">தமிழ்</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Currency</Label>
                <Select defaultValue="inr">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">₹ Indian Rupee</SelectItem>
                    <SelectItem value="usd">$ US Dollar</SelectItem>
                    <SelectItem value="eur">€ Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Date Format</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Export Your Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your activity data, achievements, and progress reports
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export as CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export as JSON
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Data Backup</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically backup your data to cloud storage
                </p>
                <div className="flex items-center gap-3">
                  <Switch />
                  <Label>Enable automatic backups</Label>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Account Actions</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your account data and preferences
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Reset Preferences
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-foreground mb-2">Storage Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Activities Data</span>
                    <span>2.3 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Images & Media</span>
                    <span>0.8 MB</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total Used</span>
                    <span>3.1 MB / 100 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { User, Camera, Shield, Bell, Globe } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.email?.split('@')[0] || "",
    email: user?.email || "",
    bio: "Passionate about sustainable living and reducing my carbon footprint.",
    location: "Mumbai, India",
    joinedDate: "October 2024"
  });

  if (!user) return null;

  const userStats = {
    level: 6,
    title: "Eco Warrior",
    totalActivities: 156,
    co2Saved: 89.5,
    moneySaved: 15420,
    achievements: 12,
    streak: 23
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
          <User className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account and view your eco-journey</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">
                    {profileData.fullName.charAt(0) || user.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profileData.fullName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">{profileData.email}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary">🌿 Level {userStats.level}</Badge>
                  <Badge variant="outline">{userStats.title}</Badge>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="flex items-center justify-center gap-2">
                  <Globe className="h-4 w-4" />
                  {profileData.location}
                </p>
                <p className="mt-1">Joined {profileData.joinedDate}</p>
              </div>

              <p className="text-sm text-muted-foreground italic">
                "{profileData.bio}"
              </p>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-4 mt-4">
            <h3 className="font-semibold text-foreground mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{userStats.totalActivities}</div>
                <div className="text-xs text-muted-foreground">Activities</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">{userStats.co2Saved}kg</div>
                <div className="text-xs text-muted-foreground">CO₂ Saved</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">₹{userStats.moneySaved.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Money Saved</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">{userStats.achievements}</div>
                <div className="text-xs text-muted-foreground">Achievements</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList>
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 mt-6">
                    <Button>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-foreground">Privacy Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">Who can see your profile information</p>
                    </div>
                    <Badge variant="secondary">Public</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Activity Sharing</h4>
                      <p className="text-sm text-muted-foreground">Share your activities with the community</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Leaderboard Participation</h4>
                      <p className="text-sm text-muted-foreground">Appear in community leaderboards</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="mt-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Daily Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get reminded to log your daily activities</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Achievement Notifications</h4>
                      <p className="text-sm text-muted-foreground">Get notified when you unlock achievements</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Weekly Reports</h4>
                      <p className="text-sm text-muted-foreground">Receive weekly progress summaries</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Community Updates</h4>
                      <p className="text-sm text-muted-foreground">Updates about challenges and community events</p>
                    </div>
                    <Badge variant="secondary">Enabled</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
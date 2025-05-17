import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Type, Eye, Monitor, Save } from 'lucide-react';

const UserSettings = () => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [autoSave, setAutoSave] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [emailDigest, setEmailDigest] = useState<string>("daily");
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    const savedHighContrast = localStorage.getItem('highContrast');
    const savedReducedMotion = localStorage.getItem('reducedMotion');
    const savedAutoSave = localStorage.getItem('autoSave');
    const savedNotifications = localStorage.getItem('notificationsEnabled');
    const savedEmailDigest = localStorage.getItem('emailDigest');
    
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
    if (savedAutoSave) setAutoSave(savedAutoSave === 'true');
    if (savedNotifications) setNotificationsEnabled(savedNotifications === 'true');
    if (savedEmailDigest) setEmailDigest(savedEmailDigest);
    
    // Apply font size to root element
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, []);
  
  // Apply font size changes in real-time
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);
  
  // Save other settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('highContrast', highContrast.toString());
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);
  
  useEffect(() => {
    localStorage.setItem('reducedMotion', reducedMotion.toString());
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }, [reducedMotion]);
  
  useEffect(() => {
    localStorage.setItem('autoSave', autoSave.toString());
  }, [autoSave]);
  
  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
  }, [notificationsEnabled]);
  
  useEffect(() => {
    localStorage.setItem('emailDigest', emailDigest);
  }, [emailDigest]);
  
  // Save all settings
  const saveSettings = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize.toString());
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('reducedMotion', reducedMotion.toString());
    localStorage.setItem('autoSave', autoSave.toString());
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    localStorage.setItem('emailDigest', emailDigest);
    
    // Show a success message (you could use a toast here)
    alert('Settings saved successfully');
  };
  
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="appearance">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Eye className="h-4 w-4 mr-2" />
            Accessibility
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Monitor className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                  Choose your preferred theme for the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {['light', 'dark', 'banking-blue', 'regulatory-green', 'blue', 'dark-blue'].map((themeOption) => (
                    <div 
                      key={themeOption}
                      className={`
                        cursor-pointer rounded-lg p-4 border-2 transition-all
                        ${theme === themeOption ? 'border-primary' : 'border-border'}
                      `}
                      onClick={() => setTheme(themeOption as any)}
                    >
                      <div className={`h-12 rounded-md mb-2 bg-${themeOption === 'light' ? 'background' : themeOption === 'dark' ? 'slate-800' : themeOption}`}></div>
                      <p className="text-sm font-medium capitalize">{themeOption.replace('-', ' ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Text Size</CardTitle>
                <CardDescription>
                  Adjust the size of text throughout the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">A</span>
                    <Slider 
                      value={[fontSize]} 
                      min={75} 
                      max={150} 
                      step={5}
                      onValueChange={(value) => setFontSize(value[0])}
                      className="w-[70%]"
                    />
                    <span className="text-lg">A</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Current size: {fontSize}%
                  </p>
                  <div className="p-4 border rounded-md">
                    <p className="mb-2">Preview:</p>
                    <p>This is how text will appear throughout the application.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>
                Configure settings to improve your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">High Contrast Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Increase contrast for better readability
                  </p>
                </div>
                <Switch 
                  id="high-contrast" 
                  checked={highContrast} 
                  onCheckedChange={setHighContrast} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduced Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations throughout the interface
                  </p>
                </div>
                <Switch 
                  id="reduced-motion" 
                  checked={reducedMotion} 
                  onCheckedChange={setReducedMotion} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure general system behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">Auto-save Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save changes as you work
                  </p>
                </div>
                <Switch 
                  id="auto-save" 
                  checked={autoSave} 
                  onCheckedChange={setAutoSave} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Browser Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notificationsEnabled} 
                  onCheckedChange={setNotificationsEnabled} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-digest">Email Digest Frequency</Label>
                <Select value={emailDigest} onValueChange={setEmailDigest}>
                  <SelectTrigger id="email-digest">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default UserSettings;
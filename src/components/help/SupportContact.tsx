import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SupportContact() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Support request submitted:', formData);
    setFormSubmitted(true);
    // In a real app, you would send this data to your backend
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      category: '',
      subject: '',
      message: '',
      priority: 'medium'
    });
    setFormSubmitted(false);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="contact-form">
        <TabsList>
          <TabsTrigger value="contact-form">Contact Form</TabsTrigger>
          <TabsTrigger value="live-chat">Live Chat</TabsTrigger>
          <TabsTrigger value="contact-info">Contact Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact-form">
          {formSubmitted ? (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <CardTitle>Request Submitted</CardTitle>
                </div>
                <CardDescription>
                  Thank you for contacting support. We'll get back to you shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Confirmation</AlertTitle>
                  <AlertDescription>
                    Your support request has been received. A confirmation email has been sent to {formData.email}.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Request details:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-medium">Subject:</div>
                    <div>{formData.subject}</div>
                    <div className="font-medium">Category:</div>
                    <div>{formData.category}</div>
                    <div className="font-medium">Priority:</div>
                    <div>{formData.priority}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={resetForm}>Submit Another Request</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Fill out the form below to get help from our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Your name" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Your email" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('category', value)}
                        value={formData.category}
                      >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="account">Account Management</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        onValueChange={(value) => handleSelectChange('priority', value)}
                        defaultValue="medium"
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="Brief description of your issue" 
                      required 
                      value={formData.subject}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Detailed description of your issue or question" 
                      rows={5} 
                      required 
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="attachments">Attachments (optional)</Label>
                    <Input id="attachments" type="file" multiple />
                    <p className="text-xs text-muted-foreground">
                      You can upload screenshots or documents to help us understand your issue better.
                      Maximum 5 files, 10MB each.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit">Submit Support Request</Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="live-chat">
          <Card>
            <CardHeader>
              <CardTitle>Live Chat Support</CardTitle>
              <CardDescription>
                Chat with our support team in real-time during business hours.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a Live Chat Session</h3>
              <p className="text-center text-muted-foreground mb-6">
                Our support agents are available Monday to Friday, 9am to 5pm EST.
                Current wait time: ~5 minutes.
              </p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                  <span>12 agents online</span>
                </div>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Available now</span>
                </div>
              </div>
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact-info">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Alternative ways to reach our support team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-lg mb-1">Phone Support</h3>
                    <p className="text-muted-foreground mb-2">For urgent issues</p>
                    <p className="font-medium">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri, 9am-5pm EST
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-lg mb-1">Email Support</h3>
                    <p className="text-muted-foreground mb-2">24/7 response</p>
                    <p className="font-medium">support@example.com</p>
                    <p className="text-sm text-muted-foreground">
                      Response within 24 hours
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium text-lg mb-1">Community Forum</h3>
                    <p className="text-muted-foreground mb-2">Get help from the community</p>
                    <Button variant="link" className="p-0">
                      Visit Forum
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Active community of users
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="font-medium text-lg mb-4">Support Hours</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Monday - Friday:</div>
                  <div>9:00 AM - 5:00 PM EST</div>
                  <div className="font-medium">Saturday:</div>
                  <div>10:00 AM - 2:00 PM EST</div>
                  <div className="font-medium">Sunday:</div>
                  <div>Closed</div>
                  <div className="font-medium">Holidays:</div>
                  <div>Limited Support</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
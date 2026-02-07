import { useState } from 'react';
import { 
  Bell,
  Mail,
  MessageSquare,
  Clock,
  Check,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const notificationTemplates = [
  {
    id: 'confirmation',
    name: 'Appointment Confirmed',
    description: 'Sent immediately when a booking is confirmed',
    channels: ['email', 'whatsapp'],
    enabled: true,
    template: 'Hi {customer_name}! Your appointment for {service} at {business_name} is confirmed for {date} at {time}. See you soon!',
  },
  {
    id: 'reminder_24h',
    name: 'Reminder (24h before)',
    description: 'Sent 24 hours before the appointment',
    channels: ['whatsapp'],
    enabled: true,
    template: 'Reminder: You have an appointment tomorrow at {time} for {service} at {business_name}. Reply YES to confirm or call us to reschedule.',
  },
  {
    id: 'reminder_2h',
    name: 'Reminder (2h before)',
    description: 'Sent 2 hours before the appointment',
    channels: ['whatsapp'],
    enabled: false,
    template: 'Your appointment is in 2 hours! We\'re looking forward to seeing you at {business_name}.',
  },
  {
    id: 'feedback',
    name: 'Post-service Feedback',
    description: 'Sent after the appointment is completed',
    channels: ['email'],
    enabled: true,
    template: 'Hi {customer_name}! Thank you for visiting {business_name}. We\'d love to hear your feedback. Rate your experience: {feedback_link}',
  },
  {
    id: 'no_show',
    name: 'No-show Follow-up',
    description: 'Sent if customer misses their appointment',
    channels: ['email', 'whatsapp'],
    enabled: true,
    template: 'Hi {customer_name}, we missed you today! Would you like to reschedule your {service} appointment? Book again: {booking_link}',
  },
];

export default function NotificationsSettingsPage() {
  const [templates, setTemplates] = useState(notificationTemplates);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const toggleTemplate = (id: string) => {
    setTemplates(prev => 
      prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t)
    );
  };

  const channelIcons = {
    email: Mail,
    whatsapp: MessageSquare,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="mt-1 text-muted-foreground">
              Configure automated messages for your customers
            </p>
          </div>
          
          <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Messages Sent (This Month)</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                1,234
                <Badge variant="secondary" className="text-success bg-success/10">
                  +12%
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Delivery Rate</CardDescription>
              <CardTitle className="text-3xl">98.5%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Response Rate</CardDescription>
              <CardTitle className="text-3xl">67%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Templates
            </CardTitle>
            <CardDescription>
              Customize the messages sent to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "rounded-lg border border-border p-4 transition-smooth",
                    !template.enabled && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium">{template.name}</h3>
                        <div className="flex gap-1">
                          {template.channels.map((channel) => {
                            const Icon = channelIcons[channel as keyof typeof channelIcons];
                            return (
                              <Badge 
                                key={channel} 
                                variant="secondary" 
                                className="text-xs gap-1"
                              >
                                <Icon className="h-3 w-3" />
                                {channel}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      
                      <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="italic text-muted-foreground">
                          "{template.template}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Template</DialogTitle>
                            <DialogDescription>
                              Customize the message for "{template.name}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="template" className="mb-2 block">
                              Message Template
                            </Label>
                            <Textarea
                              id="template"
                              defaultValue={template.template}
                              rows={4}
                              className="font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-2">
                              Available variables: {'{customer_name}'}, {'{service}'}, {'{date}'}, {'{time}'}, {'{business_name}'}
                            </p>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-gradient-primary">Save Changes</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Switch
                        checked={template.enabled}
                        onCheckedChange={() => toggleTemplate(template.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Channel Settings */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-success" />
                WhatsApp Integration
              </CardTitle>
              <CardDescription>
                Connect your WhatsApp Business account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-success/20 bg-success/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                    <Check className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">+55 11 99999-0000</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure your email sender settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Configured</p>
                    <p className="text-sm text-muted-foreground">noreply@belezatotal.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

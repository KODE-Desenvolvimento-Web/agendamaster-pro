import { useState } from 'react';
import { 
  Palette,
  Upload,
  Check,
  Eye
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const colorPresets = [
  { name: 'Electric Blue', value: '#0070F3' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Rose', value: '#E11D48' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Cyan', value: '#06B6D4' },
];

export default function BrandingSettingsPage() {
  const [primaryColor, setPrimaryColor] = useState('#0070F3');
  const [businessName, setBusinessName] = useState('Beleza Total Salon');
  const [logo, setLogo] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Branding</h1>
            <p className="mt-1 text-muted-foreground">
              Customize your booking page appearance
            </p>
          </div>
          
          <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
            <Eye className="mr-2 h-4 w-4" />
            Preview Booking Page
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Logo
              </CardTitle>
              <CardDescription>
                Upload your business logo for the booking page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
              >
                {logo ? (
                  <div className="flex flex-col items-center gap-4">
                    <img src={logo} alt="Logo" className="h-20 object-contain" />
                    <Button variant="outline" size="sm">Change Logo</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Upload Logo</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG or SVG. Max 2MB.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Name */}
          <Card>
            <CardHeader>
              <CardTitle>Business Name</CardTitle>
              <CardDescription>
                This name will appear on your booking page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Display Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">Booking URL</Label>
                  <div className="flex items-center gap-0">
                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 border-input text-sm text-muted-foreground">
                      agendamaster.pro/book/
                    </span>
                    <Input
                      id="slug"
                      defaultValue="beleza-total"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Color */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Brand Color
              </CardTitle>
              <CardDescription>
                Choose your primary brand color for buttons and accents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setPrimaryColor(color.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-smooth",
                        primaryColor === color.value
                          ? "border-primary ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div 
                        className="h-5 w-5 rounded-full"
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm font-medium">{color.name}</span>
                      {primaryColor === color.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="customColor">Custom Color (HEX)</Label>
                    <div className="flex gap-2">
                      <div 
                        className="h-10 w-10 rounded-md border border-input shrink-0"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input
                        id="customColor"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#0070F3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-6 rounded-lg border border-border bg-muted/30">
                <h4 className="font-medium mb-4">Preview</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Book Now
                  </button>
                  <button
                    className="px-6 py-2 rounded-lg border-2 font-medium"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Learn More
                  </button>
                  <div 
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Badge
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-gradient-primary shadow-glow">
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

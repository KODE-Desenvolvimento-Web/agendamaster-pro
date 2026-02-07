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
  { name: 'Azul Elétrico', value: '#0070F3' },
  { name: 'Roxo', value: '#7C3AED' },
  { name: 'Rosa', value: '#E11D48' },
  { name: 'Laranja', value: '#F97316' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Ciano', value: '#06B6D4' },
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
            <h1 className="text-3xl font-bold tracking-tight">Identidade Visual</h1>
            <p className="mt-1 text-muted-foreground">
              Personalize a aparência da sua página de agendamento
            </p>
          </div>
          
          <Button className="bg-gradient-primary shadow-glow hover:shadow-lg transition-smooth">
            <Eye className="mr-2 h-4 w-4" />
            Visualizar Página
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
                Envie o logo do seu negócio para a página de agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-smooth cursor-pointer"
              >
                {logo ? (
                  <div className="flex flex-col items-center gap-4">
                    <img src={logo} alt="Logo" className="h-20 object-contain" />
                    <Button variant="outline" size="sm">Alterar Logo</Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Enviar Logo</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG ou SVG. Máx 2MB.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Name */}
          <Card>
            <CardHeader>
              <CardTitle>Nome do Negócio</CardTitle>
              <CardDescription>
                Este nome aparecerá na sua página de agendamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Nome de Exibição</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Nome do Seu Negócio"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">URL de Agendamento</Label>
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
                Cor da Marca
              </CardTitle>
              <CardDescription>
                Escolha sua cor principal para botões e destaques
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
                    <Label htmlFor="customColor">Cor Personalizada (HEX)</Label>
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
                <h4 className="font-medium mb-4">Pré-visualização</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Agendar Agora
                  </button>
                  <button
                    className="px-6 py-2 rounded-lg border-2 font-medium"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Saiba Mais
                  </button>
                  <div 
                    className="px-3 py-1 rounded-full text-white text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Destaque
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancelar</Button>
          <Button className="bg-gradient-primary shadow-glow">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

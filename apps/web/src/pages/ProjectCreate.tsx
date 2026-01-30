import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  brandName: z.string().min(1, 'Brand name is required').max(100),
  brandDescription: z.string().optional(),
  amazonTrackingId: z.string().min(1, 'Amazon tracking ID is required'),
  amazonMarketplace: z.string().default('amazon.com'),
  brandColors: z.object({
    primary: z.string().default('#2563eb'),
    secondary: z.string().default('#1e40af'),
    accent: z.string().default('#f59e0b'),
  }),
  template: z.string().default('modern'),
  languages: z.array(z.string()).default(['en']),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

const steps = [
  { id: 1, title: 'Basic Info', description: 'Project and brand details' },
  { id: 2, title: 'Amazon Settings', description: 'Affiliate configuration' },
  { id: 3, title: 'Appearance', description: 'Colors and template' },
];

const marketplaces = [
  { value: 'amazon.com', label: 'Amazon US (amazon.com)' },
  { value: 'amazon.co.uk', label: 'Amazon UK (amazon.co.uk)' },
  { value: 'amazon.de', label: 'Amazon Germany (amazon.de)' },
  { value: 'amazon.fr', label: 'Amazon France (amazon.fr)' },
  { value: 'amazon.es', label: 'Amazon Spain (amazon.es)' },
  { value: 'amazon.it', label: 'Amazon Italy (amazon.it)' },
  { value: 'amazon.ca', label: 'Amazon Canada (amazon.ca)' },
  { value: 'amazon.com.au', label: 'Amazon Australia (amazon.com.au)' },
];

const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean, minimalist design' },
  { id: 'classic', name: 'Classic', description: 'Traditional layout with sidebar' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean single page' },
  { id: 'landing', name: 'Landing Page', description: 'High-converting landing page' },
];

export function ProjectCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      brandName: '',
      brandDescription: '',
      amazonTrackingId: '',
      amazonMarketplace: 'amazon.com',
      brandColors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#f59e0b',
      },
      template: 'modern',
      languages: ['en'],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectForm) => api.post<{ id: string }>('/projects', data),
    onSuccess: (data) => {
      toast({ title: 'Project created successfully' });
      navigate(`/projects/${data.id}`);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create project', description: error.message, variant: 'destructive' });
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof CreateProjectForm)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ['name', 'brandName'];
        break;
      case 2:
        fieldsToValidate = ['amazonTrackingId', 'amazonMarketplace'];
        break;
      case 3:
        fieldsToValidate = ['template'];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        createMutation.mutate(form.getValues());
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Button variant="ghost" onClick={() => navigate('/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">Set up a new affiliate site project</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                currentStep > step.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : currentStep === step.id
                    ? 'border-primary text-primary'
                    : 'border-muted text-muted-foreground'
              }`}
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="mx-4 h-0.5 w-12 bg-muted sm:w-24" />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Kitchen Gadgets Pro"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  placeholder="e.g., KitchenPro"
                  {...form.register('brandName')}
                />
                {form.formState.errors.brandName && (
                  <p className="text-sm text-destructive">{form.formState.errors.brandName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandDescription">Brand Description (Optional)</Label>
                <Input
                  id="brandDescription"
                  placeholder="Your one-stop shop for kitchen essentials"
                  {...form.register('brandDescription')}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="amazonTrackingId">Amazon Tracking ID</Label>
                <Input
                  id="amazonTrackingId"
                  placeholder="e.g., kitchenpro-20"
                  {...form.register('amazonTrackingId')}
                />
                {form.formState.errors.amazonTrackingId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.amazonTrackingId.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Your Amazon Associates tracking ID for affiliate links
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="marketplace">Amazon Marketplace</Label>
                <select
                  id="marketplace"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...form.register('amazonMarketplace')}
                >
                  {marketplaces.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label>Template</Label>
                <div className="grid grid-cols-2 gap-4">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        form.watch('template') === t.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => form.setValue('template', t.id)}
                    >
                      <p className="font-medium">{t.name}</p>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brand Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Primary</Label>
                    <Input
                      type="color"
                      className="h-10 w-full cursor-pointer"
                      {...form.register('brandColors.primary')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary</Label>
                    <Input
                      type="color"
                      className="h-10 w-full cursor-pointer"
                      {...form.register('brandColors.secondary')}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Accent</Label>
                    <Input
                      type="color"
                      className="h-10 w-full cursor-pointer"
                      {...form.register('brandColors.accent')}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={createMutation.isPending}>
          {currentStep === 3 ? (
            createMutation.isPending ? (
              'Creating...'
            ) : (
              <>
                Create Project
                <Check className="ml-2 h-4 w-4" />
              </>
            )
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

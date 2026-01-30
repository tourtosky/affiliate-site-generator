import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Key, Palette, HardDrive, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface Settings {
  openaiApiKey: string | null;
  geminiApiKey: string | null;
  defaultTextProvider: string;
  defaultImageProvider: string;
  outputDirectory: string;
  keepVersions: number;
  theme: string;
}

const settingsSchema = z.object({
  openaiApiKey: z.string().optional(),
  geminiApiKey: z.string().optional(),
  defaultTextProvider: z.enum(['openai', 'gemini']),
  defaultImageProvider: z.enum(['dalle', 'imagen']),
  outputDirectory: z.string().min(1),
  keepVersions: z.number().min(1).max(100),
  theme: z.enum(['light', 'dark', 'system']),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export function Settings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.get<Settings>('/settings'),
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: settings
      ? {
          openaiApiKey: settings.openaiApiKey || '',
          geminiApiKey: settings.geminiApiKey || '',
          defaultTextProvider: settings.defaultTextProvider as 'openai' | 'gemini',
          defaultImageProvider: settings.defaultImageProvider as 'dalle' | 'imagen',
          outputDirectory: settings.outputDirectory,
          keepVersions: settings.keepVersions,
          theme: settings.theme as 'light' | 'dark' | 'system',
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SettingsForm>) => api.put('/settings', data),
    onSuccess: () => {
      toast({ title: 'Settings saved' });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to save settings', description: error.message, variant: 'destructive' });
    },
  });

  const testApiMutation = useMutation({
    mutationFn: ({ provider, apiKey }: { provider: string; apiKey: string }) =>
      api.post<{ valid: boolean; message: string }>('/settings/test-api', { provider, apiKey }),
    onSuccess: (data) => {
      toast({
        title: data.valid ? 'API key is valid' : 'API key is invalid',
        description: data.message,
        variant: data.valid ? 'default' : 'destructive',
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to test API key', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: SettingsForm) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your application settings</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>Configure your AI provider API keys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  {...form.register('openaiApiKey')}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    testApiMutation.mutate({
                      provider: 'openai',
                      apiKey: form.getValues('openaiApiKey') || '',
                    })
                  }
                  disabled={testApiMutation.isPending}
                >
                  {testApiMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Used for GPT-4 text and DALL-E images</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="geminiApiKey"
                  type="password"
                  placeholder="AI..."
                  {...form.register('geminiApiKey')}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    testApiMutation.mutate({
                      provider: 'gemini',
                      apiKey: form.getValues('geminiApiKey') || '',
                    })
                  }
                  disabled={testApiMutation.isPending}
                >
                  {testApiMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Used for Gemini text and Imagen images</p>
            </div>
          </CardContent>
        </Card>

        {/* Default Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Default Providers
            </CardTitle>
            <CardDescription>Choose which AI providers to use by default</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Text Generation</Label>
              <div className="flex gap-4">
                {['openai', 'gemini'].map((provider) => (
                  <label
                    key={provider}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${
                      form.watch('defaultTextProvider') === provider
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      value={provider}
                      {...form.register('defaultTextProvider')}
                      className="sr-only"
                    />
                    <span className="capitalize">{provider}</span>
                    {form.watch('defaultTextProvider') === provider && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image Generation</Label>
              <div className="flex gap-4">
                {['dalle', 'imagen'].map((provider) => (
                  <label
                    key={provider}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${
                      form.watch('defaultImageProvider') === provider
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    <input
                      type="radio"
                      value={provider}
                      {...form.register('defaultImageProvider')}
                      className="sr-only"
                    />
                    <span className="capitalize">{provider === 'dalle' ? 'DALL-E' : 'Imagen'}</span>
                    {form.watch('defaultImageProvider') === provider && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage
            </CardTitle>
            <CardDescription>Configure output and version settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="outputDirectory">Output Directory</Label>
              <Input id="outputDirectory" {...form.register('outputDirectory')} />
              <p className="text-xs text-muted-foreground">Where generated sites are stored</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keepVersions">Versions to Keep</Label>
              <Input
                id="keepVersions"
                type="number"
                min={1}
                max={100}
                {...form.register('keepVersions', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Number of previous versions to keep per project
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Settings,
  Package,
  MousePointer,
  Download,
  Play,
  Eye,
  Globe,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  History,
  Clock,
  FileText,
  ExternalLink,
  Pencil,
  Upload,
  Image,
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface GenerationStatus {
  id: string;
  version: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

interface HtaccessConfig {
  enableGzip?: boolean;
  enableCaching?: boolean;
  forceHttps?: boolean;
  wwwRedirect?: 'to-www' | 'to-non-www' | 'none';
  customRules?: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandDescription?: string;
  amazonTrackingId: string;
  amazonMarketplace: string;
  status: string;
  template: string;
  generationCount: number;
  lastGeneratedAt?: string;
  htaccessConfig?: HtaccessConfig;
  logoUrl?: string;
  faviconUrl?: string;
  products: Array<{ id: string; asin: string; title?: string }>;
  ctas: Array<{ id: string; name: string; label: string; placement: string }>;
  domains: Array<{ id: string; domain: string; isPrimary: boolean }>;
  generations: Array<{
    id: string;
    version: number;
    status: string;
    createdAt: string;
    pagesGenerated?: number;
    generationTimeMs?: number;
  }>;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Settings, path: '' },
  { id: 'products', label: 'Products', icon: Package, path: '/products' },
  { id: 'ctas', label: 'CTAs', icon: MousePointer, path: '/ctas' },
  { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
];

interface AIStatus {
  openai: boolean;
  gemini: boolean;
  anyConfigured: boolean;
  defaultProvider: 'openai' | 'gemini' | null;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });

  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status', id],
    queryFn: () => api.get<AIStatus>(`/projects/${id}/generate/ai-status`),
    enabled: !!id,
  });

  // Poll for generation status when generating
  useEffect(() => {
    if (!isGenerating || !id) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await api.get<GenerationStatus>(`/projects/${id}/generate/status`);
        setGenerationStatus(status);

        if (status.status === 'completed') {
          setIsGenerating(false);
          toast({ title: 'Generation completed!' });
          queryClient.invalidateQueries({ queryKey: ['project', id] });
        } else if (status.status === 'failed') {
          setIsGenerating(false);
          toast({ title: 'Generation failed', variant: 'destructive' });
        }
      } catch {
        // Ignore polling errors
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [isGenerating, id, queryClient]);

  const generateMutation = useMutation({
    mutationFn: (options: { useAI: boolean }) =>
      api.post<{ generationId: string; version: number }>(`/projects/${id}/generate`, options),
    onSuccess: (data) => {
      setShowGenerateDialog(false);
      setIsGenerating(true);
      setGenerationStatus({
        id: data.generationId,
        version: data.version,
        status: 'pending',
        progress: 0,
      });
    },
    onError: (error: Error) => {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    },
  });

  const handleGenerate = () => {
    generateMutation.mutate({ useAI });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold">Project not found</h2>
        <Button asChild className="mt-4">
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const currentTab = tabs.find(
    (t) => location.pathname === `/projects/${id}${t.path}` ||
           (t.path === '' && location.pathname === `/projects/${id}`)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.brandName}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              project.status === 'active'
                ? 'bg-green-100 text-green-700'
                : project.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {project.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/editor`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Layout
          </Button>
          <Button
            variant="outline"
            disabled={project.generationCount === 0}
            onClick={() => window.open(`/api/projects/${project.id}/preview`, '_blank')}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button
            variant="outline"
            disabled={project.generationCount === 0}
            asChild
          >
            <a href={`/api/projects/${project.id}/download/latest`} download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          {/* Generate Options Dialog */}
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button disabled={generateMutation.isPending || isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Site</DialogTitle>
                <DialogDescription>
                  Configure generation options for your affiliate site.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {/* AI Toggle */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
                  <Checkbox
                    id="use-ai"
                    checked={useAI}
                    onCheckedChange={(checked) => setUseAI(!!checked)}
                    disabled={!aiStatus?.anyConfigured}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="use-ai"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Generate content with AI
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {aiStatus?.anyConfigured
                        ? `Use ${aiStatus.defaultProvider === 'openai' ? 'OpenAI GPT-4' : 'Google Gemini'} to generate compelling headlines, product descriptions, testimonials, and more.`
                        : 'Configure API keys in Settings to enable AI content generation.'}
                    </p>
                    {aiStatus?.anyConfigured && (
                      <p className="text-xs text-muted-foreground">
                        Providers available: {[aiStatus.openai && 'OpenAI', aiStatus.gemini && 'Gemini'].filter(Boolean).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                  {useAI ? (
                    <p>AI will generate: hero text, features, product descriptions, testimonials, and SEO meta tags.</p>
                  ) : (
                    <p>Using default placeholder content. Enable AI for unique, conversion-optimized copy.</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Generation Progress Dialog */}
          <Dialog open={isGenerating} onOpenChange={(open) => !open && generationStatus?.status !== 'processing' && setIsGenerating(false)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {generationStatus?.status === 'completed' ? 'Generation Complete!' :
                   generationStatus?.status === 'failed' ? 'Generation Failed' :
                   'Generating Site...'}
                </DialogTitle>
                <DialogDescription>
                  {generationStatus?.status === 'completed'
                    ? `Version ${generationStatus.version} has been generated successfully.`
                    : generationStatus?.status === 'failed'
                    ? 'An error occurred during generation.'
                    : `Building version ${generationStatus?.version || '...'}. ${useAI ? 'AI is generating content...' : 'This may take a moment.'}`}
                </DialogDescription>
              </DialogHeader>
              <div className="py-6">
                {generationStatus?.status === 'completed' ? (
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <p className="text-sm text-muted-foreground">Your site is ready to preview or download.</p>
                  </div>
                ) : generationStatus?.status === 'failed' ? (
                  <div className="flex flex-col items-center gap-4">
                    <XCircle className="h-16 w-16 text-red-500" />
                    <p className="text-sm text-muted-foreground">Please try again or check the logs.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Progress value={generationStatus?.progress || 0} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {generationStatus?.status === 'pending' ? 'Starting...' : 'Processing...'}
                      </span>
                      <span>{generationStatus?.progress || 0}%</span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                {generationStatus?.status === 'completed' && (
                  <Button onClick={() => setIsGenerating(false)}>
                    Done
                  </Button>
                )}
                {generationStatus?.status === 'failed' && (
                  <Button variant="outline" onClick={() => setIsGenerating(false)}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={`/projects/${id}${tab.path}`}
              className={cn(
                'flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors',
                currentTab?.id === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <Routes>
        <Route index element={<ProjectOverview project={project} />} />
        <Route path="products" element={<ProjectProducts project={project} />} />
        <Route path="ctas" element={<ProjectCTAs project={project} />} />
        <Route path="domains" element={<ProjectDomains project={project} />} />
      </Routes>
    </div>
  );
}

interface VersionDetails {
  id: string;
  version: number;
  status: string;
  createdAt: string;
  pagesGenerated: number;
  imagesGenerated: number;
  totalFiles: number;
  generationTimeMs: number;
  settingsSnapshot: {
    project: {
      name: string;
      brandName: string;
      brandDescription: string;
      template: string;
      amazonTrackingId: string;
      amazonMarketplace: string;
      products: Array<{ asin: string; title?: string }>;
      ctas: Array<{ name: string; label: string; placement: string }>;
      domains: Array<{ domain: string; isPrimary: boolean }>;
    };
    generatedAt: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
}

function ProjectOverview({ project }: { project: Project }) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [versionDetails, setVersionDetails] = useState<VersionDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const queryClient = useQueryClient();

  // Upload handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`/api/projects/${project.id}/upload/logo`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      toast({ title: 'Logo uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    } catch {
      toast({ title: 'Failed to upload logo', variant: 'destructive' });
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    const formData = new FormData();
    formData.append('favicon', file);

    try {
      const response = await fetch(`/api/projects/${project.id}/upload/favicon`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      toast({ title: 'Favicon uploaded successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    } catch {
      toast({ title: 'Failed to upload favicon', variant: 'destructive' });
    } finally {
      setIsUploadingFavicon(false);
      e.target.value = '';
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/upload/logo`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      toast({ title: 'Logo deleted' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    } catch {
      toast({ title: 'Failed to delete logo', variant: 'destructive' });
    }
  };

  const handleDeleteFavicon = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}/upload/favicon`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Delete failed');
      toast({ title: 'Favicon deleted' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    } catch {
      toast({ title: 'Failed to delete favicon', variant: 'destructive' });
    }
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: project.name,
    brandName: project.brandName,
    brandDescription: project.brandDescription || '',
    template: project.template,
    amazonTrackingId: project.amazonTrackingId,
    amazonMarketplace: project.amazonMarketplace,
    htaccessConfig: {
      enableGzip: project.htaccessConfig?.enableGzip ?? true,
      enableCaching: project.htaccessConfig?.enableCaching ?? true,
      forceHttps: project.htaccessConfig?.forceHttps ?? true,
      wwwRedirect: project.htaccessConfig?.wwwRedirect ?? 'none' as const,
      customRules: project.htaccessConfig?.customRules || '',
    },
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get<Template[]>('/templates'),
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: typeof editForm) => api.put(`/projects/${project.id}`, data),
    onSuccess: () => {
      toast({ title: 'Project updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to update project', description: error.message, variant: 'destructive' });
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProjectMutation.mutate(editForm);
  };

  // Reset form when dialog opens
  const openEditDialog = () => {
    setEditForm({
      name: project.name,
      brandName: project.brandName,
      brandDescription: project.brandDescription || '',
      template: project.template,
      amazonTrackingId: project.amazonTrackingId,
      amazonMarketplace: project.amazonMarketplace,
      htaccessConfig: {
        enableGzip: project.htaccessConfig?.enableGzip ?? true,
        enableCaching: project.htaccessConfig?.enableCaching ?? true,
        forceHttps: project.htaccessConfig?.forceHttps ?? true,
        wwwRedirect: project.htaccessConfig?.wwwRedirect ?? 'none',
        customRules: project.htaccessConfig?.customRules || '',
      },
    });
    setIsEditDialogOpen(true);
  };

  const loadVersionDetails = async (version: number) => {
    setSelectedVersion(version);
    setIsLoadingDetails(true);
    try {
      const details = await api.get<VersionDetails>(`/projects/${project.id}/history/${version}`);
      setVersionDetails(details);
    } catch (error) {
      console.error('Failed to load version details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={openEditDialog}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Template</p>
              <p className="font-medium capitalize">{project.template}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Marketplace</p>
              <p className="font-medium">{project.amazonMarketplace}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tracking ID</p>
              <p className="font-medium">{project.amazonTrackingId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Generations</p>
              <p className="font-medium">{project.generationCount}</p>
            </div>
          </div>
          {project.brandDescription && (
            <div>
              <p className="text-muted-foreground text-sm">Description</p>
              <p className="text-sm">{project.brandDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project settings. Changes will apply to the next generation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  disabled={updateProjectMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-brandName">Brand Name</Label>
                <Input
                  id="edit-brandName"
                  value={editForm.brandName}
                  onChange={(e) => setEditForm({ ...editForm, brandName: e.target.value })}
                  disabled={updateProjectMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-brandDescription">Brand Description</Label>
                <Input
                  id="edit-brandDescription"
                  value={editForm.brandDescription}
                  onChange={(e) => setEditForm({ ...editForm, brandDescription: e.target.value })}
                  placeholder="A brief description of your brand..."
                  disabled={updateProjectMutation.isPending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-template">Template</Label>
                <Select
                  value={editForm.template}
                  onValueChange={(value) => setEditForm({ ...editForm, template: value })}
                  disabled={updateProjectMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changing the template will affect the next generation.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-trackingId">Amazon Tracking ID</Label>
                  <Input
                    id="edit-trackingId"
                    value={editForm.amazonTrackingId}
                    onChange={(e) => setEditForm({ ...editForm, amazonTrackingId: e.target.value })}
                    disabled={updateProjectMutation.isPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-marketplace">Marketplace</Label>
                  <Select
                    value={editForm.amazonMarketplace}
                    onValueChange={(value) => setEditForm({ ...editForm, amazonMarketplace: value })}
                    disabled={updateProjectMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon.com">amazon.com (US)</SelectItem>
                      <SelectItem value="amazon.co.uk">amazon.co.uk (UK)</SelectItem>
                      <SelectItem value="amazon.de">amazon.de (Germany)</SelectItem>
                      <SelectItem value="amazon.fr">amazon.fr (France)</SelectItem>
                      <SelectItem value="amazon.es">amazon.es (Spain)</SelectItem>
                      <SelectItem value="amazon.it">amazon.it (Italy)</SelectItem>
                      <SelectItem value="amazon.ca">amazon.ca (Canada)</SelectItem>
                      <SelectItem value="amazon.com.au">amazon.com.au (Australia)</SelectItem>
                      <SelectItem value="amazon.co.jp">amazon.co.jp (Japan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* .htaccess Settings */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-3">.htaccess Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-forceHttps"
                      checked={editForm.htaccessConfig.forceHttps}
                      onCheckedChange={(checked) =>
                        setEditForm({
                          ...editForm,
                          htaccessConfig: { ...editForm.htaccessConfig, forceHttps: !!checked },
                        })
                      }
                      disabled={updateProjectMutation.isPending}
                    />
                    <Label htmlFor="edit-forceHttps" className="font-normal">
                      Force HTTPS redirect
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-enableGzip"
                      checked={editForm.htaccessConfig.enableGzip}
                      onCheckedChange={(checked) =>
                        setEditForm({
                          ...editForm,
                          htaccessConfig: { ...editForm.htaccessConfig, enableGzip: !!checked },
                        })
                      }
                      disabled={updateProjectMutation.isPending}
                    />
                    <Label htmlFor="edit-enableGzip" className="font-normal">
                      Enable Gzip compression
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-enableCaching"
                      checked={editForm.htaccessConfig.enableCaching}
                      onCheckedChange={(checked) =>
                        setEditForm({
                          ...editForm,
                          htaccessConfig: { ...editForm.htaccessConfig, enableCaching: !!checked },
                        })
                      }
                      disabled={updateProjectMutation.isPending}
                    />
                    <Label htmlFor="edit-enableCaching" className="font-normal">
                      Enable browser caching
                    </Label>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-wwwRedirect">WWW Redirect</Label>
                    <Select
                      value={editForm.htaccessConfig.wwwRedirect}
                      onValueChange={(value: 'to-www' | 'to-non-www' | 'none') =>
                        setEditForm({
                          ...editForm,
                          htaccessConfig: { ...editForm.htaccessConfig, wwwRedirect: value },
                        })
                      }
                      disabled={updateProjectMutation.isPending}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No redirect</SelectItem>
                        <SelectItem value="to-www">Redirect to www</SelectItem>
                        <SelectItem value="to-non-www">Redirect to non-www</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Branding Assets in Edit Dialog */}
              <div className="border-t pt-4 mt-2">
                <h4 className="font-semibold mb-3">Branding Assets</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="border rounded-lg p-3">
                      {project.logoUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={project.logoUrl} alt="Logo" className="h-10 w-auto max-w-[100px] object-contain" />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteLogo}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          <span>{isUploadingLogo ? 'Uploading...' : 'Upload logo'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                            className="hidden"
                            onChange={handleLogoUpload}
                            disabled={isUploadingLogo}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border rounded-lg p-3">
                      {project.faviconUrl ? (
                        <div className="flex items-center gap-3">
                          <img src={project.faviconUrl} alt="Favicon" className="h-6 w-6 object-contain" />
                          <span className="text-sm text-muted-foreground">Uploaded</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteFavicon}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                          <Upload className="h-4 w-4" />
                          <span>{isUploadingFavicon ? 'Uploading...' : 'Upload favicon'}</span>
                          <input
                            type="file"
                            accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                            className="hidden"
                            onChange={handleFaviconUpload}
                            disabled={isUploadingFavicon}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateProjectMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProjectMutation.isPending}>
                {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{project.products.length}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.ctas.length}</p>
              <p className="text-sm text-muted-foreground">CTAs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{project.domains.length}</p>
              <p className="text-sm text-muted-foreground">Domains</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding Assets */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            <div>
              <CardTitle>Branding Assets</CardTitle>
              <CardDescription>Upload logo and favicon for your site</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label>Logo</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {project.logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={project.logoUrl}
                      alt="Logo"
                      className="h-16 w-auto max-w-[200px] object-contain"
                    />
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploadingLogo ? 'Uploading...' : 'Click to upload logo'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, SVG, WebP (max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploadingLogo}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <Label>Favicon</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {project.faviconUrl ? (
                  <div className="flex items-center gap-4">
                    <img
                      src={project.faviconUrl}
                      alt="Favicon"
                      className="h-8 w-8 object-contain"
                    />
                    <span className="text-sm text-muted-foreground">Favicon uploaded</span>
                    <div className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteFavicon}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 cursor-pointer py-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {isUploadingFavicon ? 'Uploading...' : 'Click to upload favicon'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ICO, PNG, SVG (max 5MB)
                    </span>
                    <input
                      type="file"
                      accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
                      className="hidden"
                      onChange={handleFaviconUpload}
                      disabled={isUploadingFavicon}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <div>
              <CardTitle>Version History</CardTitle>
              <CardDescription>View and compare generation snapshots</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {project.generations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No generations yet. Click "Generate" to create your first site.
            </p>
          ) : (
            <div className="space-y-2">
              {project.generations.slice(0, 10).map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      v{gen.version}
                    </div>
                    <div>
                      <p className="font-medium">Version {gen.version}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(gen.createdAt).toLocaleString()}
                        {gen.generationTimeMs && (
                          <span className="ml-2">({(gen.generationTimeMs / 1000).toFixed(1)}s)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        gen.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : gen.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {gen.status}
                    </span>
                    {gen.status === 'completed' && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadVersionDetails(gen.version)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Version {selectedVersion} Details</DialogTitle>
                              <DialogDescription>
                                Settings snapshot from this generation
                              </DialogDescription>
                            </DialogHeader>
                            {isLoadingDetails ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                              </div>
                            ) : versionDetails ? (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Generated At</p>
                                    <p className="font-medium">
                                      {new Date(versionDetails.settingsSnapshot.generatedAt).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Generation Time</p>
                                    <p className="font-medium">
                                      {(versionDetails.generationTimeMs / 1000).toFixed(2)}s
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Pages Generated</p>
                                    <p className="font-medium">{versionDetails.pagesGenerated}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Total Files</p>
                                    <p className="font-medium">{versionDetails.totalFiles}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Project Settings</h4>
                                  <div className="rounded-lg border p-3 space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-muted-foreground">Brand:</span>{' '}
                                        {versionDetails.settingsSnapshot.project.brandName}
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Template:</span>{' '}
                                        {versionDetails.settingsSnapshot.project.template}
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Marketplace:</span>{' '}
                                        {versionDetails.settingsSnapshot.project.amazonMarketplace}
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Tracking ID:</span>{' '}
                                        {versionDetails.settingsSnapshot.project.amazonTrackingId}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Products ({versionDetails.settingsSnapshot.project.products?.length || 0})
                                  </h4>
                                  <div className="rounded-lg border divide-y">
                                    {versionDetails.settingsSnapshot.project.products?.map((p, i) => (
                                      <div key={i} className="p-2 text-sm">
                                        <span className="font-medium">{p.title || p.asin}</span>
                                        <span className="text-muted-foreground ml-2">({p.asin})</span>
                                      </div>
                                    )) || (
                                      <p className="p-2 text-sm text-muted-foreground">No products</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    CTAs ({versionDetails.settingsSnapshot.project.ctas?.length || 0})
                                  </h4>
                                  <div className="rounded-lg border divide-y">
                                    {versionDetails.settingsSnapshot.project.ctas?.map((c, i) => (
                                      <div key={i} className="p-2 text-sm flex justify-between">
                                        <span className="font-medium">{c.label}</span>
                                        <span className="text-muted-foreground">{c.placement}</span>
                                      </div>
                                    )) || (
                                      <p className="p-2 text-sm text-muted-foreground">No CTAs</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Domains ({versionDetails.settingsSnapshot.project.domains?.length || 0})
                                  </h4>
                                  <div className="rounded-lg border divide-y">
                                    {versionDetails.settingsSnapshot.project.domains?.map((d, i) => (
                                      <div key={i} className="p-2 text-sm flex justify-between">
                                        <span className="font-medium">{d.domain}</span>
                                        {d.isPrimary && (
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            Primary
                                          </span>
                                        )}
                                      </div>
                                    )) || (
                                      <p className="p-2 text-sm text-muted-foreground">No domains</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-center text-muted-foreground py-4">
                                Failed to load version details
                              </p>
                            )}
                            <DialogFooter>
                              <Button variant="outline" asChild>
                                <a
                                  href={`/api/projects/${project.id}/download/${selectedVersion}`}
                                  download
                                >
                                  <Download className="mr-2 h-4 w-4" />
                                  Download v{selectedVersion}
                                </a>
                              </Button>
                              <Button
                                onClick={() =>
                                  window.open(`/api/projects/${project.id}/preview/${selectedVersion}`, '_blank')
                                }
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Preview v{selectedVersion}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/api/projects/${project.id}/download/${gen.version}`} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectProducts({ project }: { project: Project }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [asin, setAsin] = useState('');
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: (data: { asin: string }) => api.post(`/projects/${project.id}/products`, data),
    onSuccess: () => {
      toast({ title: 'Product added successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setIsAddDialogOpen(false);
      setAsin('');
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add product', description: error.message, variant: 'destructive' });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/projects/${project.id}/products/${productId}`),
    onSuccess: () => {
      toast({ title: 'Product removed' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove product', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim()) return;
    addProductMutation.mutate({ asin: asin.trim() });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Amazon products for this site</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddProduct}>
                <DialogHeader>
                  <DialogTitle>Add Product</DialogTitle>
                  <DialogDescription>
                    Enter the Amazon ASIN to add a product to this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="asin">ASIN</Label>
                    <Input
                      id="asin"
                      placeholder="e.g., B09V3KXJPB"
                      value={asin}
                      onChange={(e) => setAsin(e.target.value)}
                      disabled={addProductMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      The ASIN can be found in the Amazon product URL or product details.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={addProductMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addProductMutation.isPending || !asin.trim()}>
                    {addProductMutation.isPending ? 'Adding...' : 'Add Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {project.products.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No products added yet. Add Amazon products by their ASIN.
          </p>
        ) : (
          <div className="space-y-2">
            {project.products.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{product.title || product.asin}</p>
                  <p className="text-xs text-muted-foreground">ASIN: {product.asin}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProductMutation.mutate(product.id)}
                  disabled={deleteProductMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CTA_PLACEMENTS = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'hero-secondary', label: 'Hero Secondary' },
  { value: 'product-card', label: 'Product Card' },
  { value: 'product-page', label: 'Product Page' },
  { value: 'comparison-table', label: 'Comparison Table' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'sticky-bar', label: 'Sticky Bar' },
  { value: 'exit-popup', label: 'Exit Popup' },
  { value: 'inline-content', label: 'Inline Content' },
  { value: 'footer', label: 'Footer' },
  { value: 'navigation', label: 'Navigation' },
] as const;

function ProjectCTAs({ project }: { project: Project }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [placement, setPlacement] = useState<string>('');
  const queryClient = useQueryClient();

  const addCTAMutation = useMutation({
    mutationFn: (data: { name: string; label: string; placement: string }) =>
      api.post(`/projects/${project.id}/ctas`, data),
    onSuccess: () => {
      toast({ title: 'CTA added successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setIsAddDialogOpen(false);
      setName('');
      setLabel('');
      setPlacement('');
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add CTA', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCTAMutation = useMutation({
    mutationFn: (ctaId: string) => api.delete(`/projects/${project.id}/ctas/${ctaId}`),
    onSuccess: () => {
      toast({ title: 'CTA removed' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove CTA', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddCTA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !label.trim() || !placement) return;
    addCTAMutation.mutate({ name: name.trim(), label: label.trim(), placement });
  };

  const isFormValid = name.trim() && label.trim() && placement;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Call-to-Actions</CardTitle>
            <CardDescription>Affiliate link buttons and CTAs</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add CTA</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddCTA}>
                <DialogHeader>
                  <DialogTitle>Add CTA</DialogTitle>
                  <DialogDescription>
                    Create a new call-to-action button for your affiliate links.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cta-name">Name</Label>
                    <Input
                      id="cta-name"
                      placeholder="e.g., main-buy-button"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={addCTAMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Internal name for identifying this CTA.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cta-label">Button Label</Label>
                    <Input
                      id="cta-label"
                      placeholder="e.g., Buy on Amazon"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      disabled={addCTAMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      The text displayed on the button.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cta-placement">Placement</Label>
                    <Select value={placement} onValueChange={setPlacement} disabled={addCTAMutation.isPending}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CTA_PLACEMENTS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Where this CTA will appear on the site.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={addCTAMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addCTAMutation.isPending || !isFormValid}>
                    {addCTAMutation.isPending ? 'Adding...' : 'Add CTA'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {project.ctas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No CTAs configured. Add CTAs to place affiliate links on your site.
          </p>
        ) : (
          <div className="space-y-2">
            {project.ctas.map((cta) => (
              <div key={cta.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{cta.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {cta.name} · {CTA_PLACEMENTS.find((p) => p.value === cta.placement)?.label || cta.placement}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCTAMutation.mutate(cta.id)}
                  disabled={deleteCTAMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectDomains({ project }: { project: Project }) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const queryClient = useQueryClient();

  const addDomainMutation = useMutation({
    mutationFn: (data: { domain: string }) => api.post(`/projects/${project.id}/domains`, data),
    onSuccess: () => {
      toast({ title: 'Domain added successfully' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      setIsAddDialogOpen(false);
      setDomain('');
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to add domain', description: error.message, variant: 'destructive' });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: (domainId: string) => api.delete(`/projects/${project.id}/domains/${domainId}`),
    onSuccess: () => {
      toast({ title: 'Domain removed' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to remove domain', description: error.message, variant: 'destructive' });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (domainId: string) => api.post(`/projects/${project.id}/domains/${domainId}/set-primary`),
    onSuccess: () => {
      toast({ title: 'Primary domain updated' });
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to set primary domain', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    addDomainMutation.mutate({ domain: domain.trim() });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Domains</CardTitle>
            <CardDescription>Domain names for this project</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Domain</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAddDomain}>
                <DialogHeader>
                  <DialogTitle>Add Domain</DialogTitle>
                  <DialogDescription>
                    Add a domain name for this project.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="domain">Domain Name</Label>
                    <Input
                      id="domain"
                      placeholder="e.g., example.com"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      disabled={addDomainMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the domain without http:// or https://
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={addDomainMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addDomainMutation.isPending || !domain.trim()}>
                    {addDomainMutation.isPending ? 'Adding...' : 'Add Domain'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {project.domains.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No domains configured. Add domains for deployment and SSL.
          </p>
        ) : (
          <div className="space-y-2">
            {project.domains.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{d.domain}</p>
                  {d.isPrimary && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      Primary
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!d.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryMutation.mutate(d.id)}
                      disabled={setPrimaryMutation.isPending}
                    >
                      Set Primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteDomainMutation.mutate(d.id)}
                    disabled={deleteDomainMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

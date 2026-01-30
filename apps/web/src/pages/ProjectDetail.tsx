import { useParams, Link, Routes, Route, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  products: Array<{ id: string; asin: string; title?: string }>;
  ctas: Array<{ id: string; name: string; label: string }>;
  domains: Array<{ id: string; domain: string; isPrimary: boolean }>;
  generations: Array<{ id: string; version: number; status: string; createdAt: string }>;
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: Settings, path: '' },
  { id: 'products', label: 'Products', icon: Package, path: '/products' },
  { id: 'ctas', label: 'CTAs', icon: MousePointer, path: '/ctas' },
  { id: 'domains', label: 'Domains', icon: Globe, path: '/domains' },
];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.post(`/projects/${id}/generate`),
    onSuccess: () => {
      toast({ title: 'Generation started' });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (error: Error) => {
      toast({ title: 'Generation failed', description: error.message, variant: 'destructive' });
    },
  });

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
          <Button variant="outline" disabled={project.generationCount === 0}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" disabled={project.generationCount === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
            <Play className="mr-2 h-4 w-4" />
            {generateMutation.isPending ? 'Generating...' : 'Generate'}
          </Button>
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

function ProjectOverview({ project }: { project: Project }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
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
        </CardContent>
      </Card>

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

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>History of site generations</CardDescription>
        </CardHeader>
        <CardContent>
          {project.generations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No generations yet. Click "Generate" to create your first site.
            </p>
          ) : (
            <div className="space-y-2">
              {project.generations.slice(0, 5).map((gen) => (
                <div
                  key={gen.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">Version {gen.version}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(gen.createdAt).toLocaleString()}
                    </p>
                  </div>
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Amazon products for this site</CardDescription>
          </div>
          <Button>Add Product</Button>
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
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectCTAs({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Call-to-Actions</CardTitle>
            <CardDescription>Affiliate link buttons and CTAs</CardDescription>
          </div>
          <Button>Add CTA</Button>
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
                  <p className="text-xs text-muted-foreground">{cta.name}</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProjectDomains({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Domains</CardTitle>
            <CardDescription>Domain names for this project</CardDescription>
          </div>
          <Button>Add Domain</Button>
        </div>
      </CardHeader>
      <CardContent>
        {project.domains.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No domains configured. Add domains for deployment and SSL.
          </p>
        ) : (
          <div className="space-y-2">
            {project.domains.map((domain) => (
              <div key={domain.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{domain.domain}</p>
                  {domain.isPrimary && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                      Primary
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm">Configure</Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

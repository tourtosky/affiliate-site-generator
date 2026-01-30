import { useQuery } from '@tanstack/react-query';
import { Cloud, Server, Globe, Shield, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface Provider {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestResult: string | null;
}

export function Infrastructure() {
  const { data: hostingProviders } = useQuery({
    queryKey: ['infrastructure', 'hosting'],
    queryFn: () => api.get<Provider[]>('/infrastructure/hosting'),
  });

  const { data: cdnProviders } = useQuery({
    queryKey: ['infrastructure', 'cdn'],
    queryFn: () => api.get<Provider[]>('/infrastructure/cdn'),
  });

  const { data: registrars } = useQuery({
    queryKey: ['infrastructure', 'registrars'],
    queryFn: () => api.get<Provider[]>('/infrastructure/registrars'),
  });

  const getStatusIcon = (result: string | null) => {
    if (!result) return <Clock className="h-4 w-4 text-muted-foreground" />;
    if (result === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infrastructure</h1>
        <p className="text-muted-foreground">
          Manage hosting, CDN, and domain providers (Future Feature)
        </p>
      </div>

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Infrastructure management is prepared for future implementation. Configure your providers
          here and they will be available for automated deployment and DNS management.
        </p>
      </div>

      {/* Hosting Providers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              <div>
                <CardTitle>Hosting Providers</CardTitle>
                <CardDescription>SFTP, cPanel, Vercel, Netlify, S3</CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!hostingProviders || hostingProviders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hosting providers configured. Add a provider to enable deployments.
            </p>
          ) : (
            <div className="space-y-2">
              {hostingProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(provider.lastTestResult)}
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground uppercase">{provider.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CDN Providers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              <div>
                <CardTitle>CDN Providers</CardTitle>
                <CardDescription>Cloudflare, BunnyCDN, Fastly</CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!cdnProviders || cdnProviders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No CDN providers configured. Add a CDN for caching and SSL.
            </p>
          ) : (
            <div className="space-y-2">
              {cdnProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(provider.lastTestResult)}
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground uppercase">{provider.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Registrars */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <div>
                <CardTitle>Domain Registrars</CardTitle>
                <CardDescription>Cloudflare, Namecheap, GoDaddy</CardDescription>
              </div>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!registrars || registrars.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No domain registrars configured. Add a registrar for domain management.
            </p>
          ) : (
            <div className="space-y-2">
              {registrars.map((registrar) => (
                <div
                  key={registrar.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(registrar.lastTestResult)}
                    <div>
                      <p className="font-medium">{registrar.name}</p>
                      <p className="text-sm text-muted-foreground uppercase">{registrar.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common infrastructure tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              <Globe className="mr-2 h-4 w-4" />
              Check Domain Availability
            </Button>
            <Button variant="outline" disabled>
              <Server className="mr-2 h-4 w-4" />
              Deploy Project
            </Button>
            <Button variant="outline" disabled>
              <Cloud className="mr-2 h-4 w-4" />
              Purge CDN Cache
            </Button>
            <Button variant="outline" disabled>
              <Shield className="mr-2 h-4 w-4" />
              Check SSL Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Palette, Layout, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  features: string[];
  pages: string[];
}

interface Block {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  ctaSlots: string[];
}

export function Templates() {
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get<Template[]>('/templates'),
  });

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['blocks'],
    queryFn: () => api.get<Block[]>('/templates/blocks/all'),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates & Blocks</h1>
        <p className="text-muted-foreground">Browse available templates and content blocks</p>
      </div>

      {/* Templates */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Layout className="h-5 w-5" />
          Site Templates
        </h2>
        {templatesLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {templates?.map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Layout className="h-12 w-12 text-primary/40" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Pages</p>
                    <p className="text-xs">{template.pages.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Blocks */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <Palette className="h-5 w-5" />
          Content Blocks
        </h2>
        {blocksLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {['hero', 'products', 'reviews', 'content', 'cta', 'navigation', 'footer'].map((category) => {
              const categoryBlocks = blocks?.filter((b) => b.category === category) || [];
              if (categoryBlocks.length === 0) return null;

              return (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    {category}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {categoryBlocks.map((block) => (
                      <Card key={block.id} className="overflow-hidden">
                        <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <Palette className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">{block.name}</CardTitle>
                          <CardDescription className="text-xs">{block.description}</CardDescription>
                        </CardHeader>
                        {block.ctaSlots.length > 0 && (
                          <CardContent className="px-4 pb-4 pt-0">
                            <p className="text-xs text-muted-foreground">
                              CTA Slots: {block.ctaSlots.join(', ')}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

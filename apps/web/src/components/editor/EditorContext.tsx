import { createContext, useContext, type ReactNode } from 'react';

// Project data for block previews
export interface ProjectContext {
  brandName: string;
  brandDescription: string | null;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logoUrl: string | null;
  products: Array<{
    id: string;
    asin: string;
    title: string | null;
    customTitle: string | null;
    customDescription: string | null;
    imageUrl: string | null;
    generatedTitle: string | null;
    generatedDescription: string | null;
  }>;
  ctas: Array<{
    id: string;
    name: string;
    label: string;
    style: string;
    linkType: string;
  }>;
}

const defaultContext: ProjectContext = {
  brandName: 'Your Brand',
  brandDescription: null,
  brandColors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#f59e0b',
  },
  logoUrl: null,
  products: [],
  ctas: [],
};

const EditorContextValue = createContext<ProjectContext>(defaultContext);

export function EditorProvider({
  children,
  project,
}: {
  children: ReactNode;
  project: ProjectContext | null;
}) {
  return (
    <EditorContextValue.Provider value={project || defaultContext}>
      {children}
    </EditorContextValue.Provider>
  );
}

export function useProjectContext() {
  return useContext(EditorContextValue);
}

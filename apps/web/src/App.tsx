import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { ProjectCreate } from '@/pages/ProjectCreate';
import { Settings } from '@/pages/Settings';
import { Templates } from '@/pages/Templates';
import { Infrastructure } from '@/pages/Infrastructure';
import { BlockEditor } from '@/pages/BlockEditor';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/new" element={<ProjectCreate />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/*" element={<ProjectDetail />} />
          <Route path="projects/:id/editor" element={<BlockEditor />} />
          <Route path="templates" element={<Templates />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

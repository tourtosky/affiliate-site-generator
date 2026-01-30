import { useProjectContext } from '../EditorContext';

interface ContentTextBlockProps {
  properties: {
    heading?: string;
    body?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function ContentTextBlock({ properties }: ContentTextBlockProps) {
  const project = useProjectContext();
  const { heading, body, alignment = 'left' } = properties;

  const alignClass = alignment === 'center' ? 'text-center' : alignment === 'right' ? 'text-right' : 'text-left';

  return (
    <div className={`bg-white border rounded-lg p-6 ${alignClass}`}>
      {heading && (
        <h3 className="text-xl font-bold mb-3" style={{ color: project.brandColors.primary }}>
          {heading}
        </h3>
      )}
      <p className="text-gray-600">
        {body || `Discover why ${project.brandName} products stand out from the competition.`}
      </p>
    </div>
  );
}

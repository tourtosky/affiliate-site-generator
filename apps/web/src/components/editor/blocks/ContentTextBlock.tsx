interface ContentTextBlockProps {
  properties: {
    heading?: string;
    body?: string;
    alignment?: 'left' | 'center' | 'right';
  };
}

export function ContentTextBlock({ properties }: ContentTextBlockProps) {
  const { heading, body, alignment = 'left' } = properties;

  return (
    <div className={`bg-white border rounded-lg p-6 text-${alignment}`}>
      {heading && <h3 className="text-xl font-bold mb-3">{heading}</h3>}
      <p className="text-gray-600">
        {body || 'Content text goes here. Add your paragraph content using the properties panel.'}
      </p>
    </div>
  );
}

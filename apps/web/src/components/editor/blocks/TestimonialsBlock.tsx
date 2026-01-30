import { useProjectContext } from '../EditorContext';

interface TestimonialsBlockProps {
  properties: {
    title?: string;
    subtitle?: string;
  };
}

const defaultTestimonials = [
  {
    text: "I absolutely love my products! The quality is outstanding, and they never disappoint. Highly recommend to anyone looking for reliable items.",
    name: 'Sarah L.',
    title: 'Verified Buyer',
    initial: 'S',
  },
  {
    text: "The Premium Water Bottle has changed how I stay hydrated. It's stylish and keeps my drinks cold for hours!",
    name: 'Mike D.',
    title: 'Happy Customer',
    initial: 'M',
  },
  {
    text: "This kitchen tool is a game-changer! It simplifies my cooking and makes cleanup a breeze. I can't imagine my kitchen without it now.",
    name: 'Jessica T.',
    title: 'Satisfied User',
    initial: 'J',
  },
];

export function TestimonialsBlock({ properties }: TestimonialsBlockProps) {
  const project = useProjectContext();
  const {
    title = 'What Our Customers Say',
    subtitle = 'Real feedback from satisfied users.',
  } = properties;

  return (
    <div className="bg-gray-900 rounded-lg p-8 text-white">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl font-extrabold mb-2">{title}</h2>
        <p className="text-white/60">{subtitle}</p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-3 gap-6">
        {defaultTestimonials.map((testimonial, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <p className="text-white/90 italic mb-4 text-sm leading-relaxed">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: project.brandColors.primary }}
              >
                {testimonial.initial}
              </div>
              <div>
                <div className="font-semibold text-sm">{testimonial.name}</div>
                <div className="text-white/50 text-xs">{testimonial.title}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

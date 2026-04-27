'use client';

const GOOGLE_FORM_URL = 'https://forms.gle/rtYVKGKu8iF4dXM7A';

export default function ContactForm() {
  if (!GOOGLE_FORM_URL) {
    return (
      <p className="text-neutral-500 text-sm">Contact form coming soon.</p>
    );
  }

  return (
    <a
      href={GOOGLE_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary/90 transition-colors text-sm"
    >
      Get in touch →
    </a>
  );
}

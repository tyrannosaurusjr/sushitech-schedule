import SessionDetailClient from './SessionDetailClient';
import type { Metadata } from 'next';

// Generate metadata for SEO
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const sessionsPath = path.join(process.cwd(), 'public/data/sessions.json');
    const sessionsData = fs.readFileSync(sessionsPath, 'utf8');
    const sessions = JSON.parse(sessionsData);

    const sessionId = parseInt(params.id);
    const session = sessions.find((s: any) => s.id === sessionId);

    if (!session) {
      return {
        title: 'Session Not Found | SusHi Tech Tokyo 2026',
        description: 'The requested session could not be found.'
      };
    }

    return {
      title: `${session.title.en} | SusHi Tech Tokyo 2026`,
      description: session.overview.en ? session.overview.en.substring(0, 160) + '...' : '',
      openGraph: {
        title: session.title.en,
        description: session.overview.en ? session.overview.en.substring(0, 160) + '...' : '',
        type: 'article',
      },
    };
  } catch {
    return {
      title: 'Session | SusHi Tech Tokyo 2026',
      description: 'SusHi Tech Tokyo 2026 session details'
    };
  }
}

// Generate static params for all sessions
export async function generateStaticParams() {
  try {
    const fs = await import('fs');
    const path = await import('path');

    const sessionsPath = path.join(process.cwd(), 'public/data/sessions.json');
    const sessionsData = fs.readFileSync(sessionsPath, 'utf8');
    const sessions = JSON.parse(sessionsData);

    return sessions.map((session: any) => ({
      id: session.id.toString(),
    }));
  } catch {
    return [];
  }
}

export default function SessionDetailPage() {
  return <SessionDetailClient />;
}
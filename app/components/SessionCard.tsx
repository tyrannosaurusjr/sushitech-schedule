'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Session } from '../types';
import { useLanguage } from './LanguageProvider';
import { getStageFloor } from '../utils/time';
import { useFavorites } from '../hooks/useFavorites';

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const floor = getStageFloor(session.stage);
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sessionUrl = `${window.location.origin}/session/${session.id}`;
    const shareData = {
      title: t(session.title),
      text: `${t(session.title)} — ${session.time} at ${session.stage} • SusHi Tech 2026`,
      url: sessionUrl
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(sessionUrl);
      }
    } else {
      copyToClipboard(sessionUrl);
    }
  };

  const copyToClipboard = (url: string) => {
    const shareText = `${t(session.title)} — ${session.time} at ${session.stage} • SusHi Tech 2026\n${url}`;
    const flash = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };

    navigator.clipboard.writeText(shareText).then(flash).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      flash();
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-medium text-primary">{session.time}</span>
          <span className="text-neutral-400">•</span>
          <span className="bg-neutral-100 px-2 py-1 rounded text-neutral-700">
            {session.stage} {floor && `• ${floor}`}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleShare}
            className={`p-1 rounded transition-colors ${copied ? 'text-green-500' : 'text-neutral-400 hover:text-neutral-600'}`}
            title={copied ? 'Copied!' : 'Share session'}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(session.id);
            }}
            className={`p-1 rounded ${
              isFavorite(session.id)
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-neutral-400 hover:text-yellow-500'
            }`}
            title="Add to My Sessions"
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite(session.id) ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      <Link href={`/session/${session.id}`} className="block group">
        <h3 className="font-black text-lg mb-3 group-hover:text-primary transition-colors">
          {t(session.title)}
        </h3>

        {session.speakers.length > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex -space-x-1">
              {session.speakers.slice(0, 4).map((speaker) => (
                <img
                  key={speaker.id}
                  src={speaker.image || '/placeholder-avatar.svg'}
                  alt={t(speaker.name)}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-avatar.svg';
                  }}
                />
              ))}
              {session.speakers.length > 4 && (
                <div className="w-8 h-8 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center text-xs font-medium">
                  +{session.speakers.length - 4}
                </div>
              )}
            </div>
            <div className="text-sm text-neutral-600">
              {session.speakers.slice(0, 2).map((speaker, idx) => (
                <span key={speaker.id}>
                  {idx > 0 && ', '}
                  {t(speaker.name)}
                </span>
              ))}
              {session.speakers.length > 2 && ' +' + (session.speakers.length - 2)}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <span className="bg-primary/10 text-primary px-2 py-1 text-xs font-medium rounded">
            {t(session.category)}
          </span>
          {session.themes.en && (
            <span className="bg-neutral-100 text-neutral-700 px-2 py-1 text-xs rounded">
              {t(session.themes)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}
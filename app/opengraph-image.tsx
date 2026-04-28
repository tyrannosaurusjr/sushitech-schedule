import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#1c1917',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: '#8b1a1a',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 64px 96px',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 18,
              color: '#78716c',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            SusHi Tech Tokyo 2026
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: 80,
                fontWeight: 800,
                color: '#fafaf7',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
              }}
            >
              Conference Schedule
            </div>
            <div
              style={{
                fontSize: 30,
                color: '#a8a29e',
                fontWeight: 400,
                lineHeight: 1.4,
              }}
            >
              Every session, every speaker, every stage
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div
              style={{
                fontSize: 18,
                color: '#57534e',
                fontWeight: 500,
              }}
            >
              Apr 27–29 · Tokyo Big Sight
            </div>
            <div style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#8b1a1a' }} />
            <div style={{ fontSize: 18, color: '#57534e', fontWeight: 500 }}>
              mkultraman.com
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

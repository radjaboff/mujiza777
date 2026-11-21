import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, #36663E 0%, #244B2B 70%, #1A3820 100%)',
          borderRadius: '50%',
          border: '4px solid #D4AF37',
        }}
      >
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: '#FFFFFF',
            fontStyle: 'italic',
            letterSpacing: '-1px',
            fontFamily: 'sans-serif',
            marginTop: 4,
          }}
        >
          777
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '2px',
            marginTop: 4,
            fontFamily: 'serif',
          }}
        >
          MO'JIZA
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#D4AF37',
            letterSpacing: '3px',
            marginTop: 2,
            fontFamily: 'sans-serif',
          }}
        >
          shirinliklari
        </span>
      </div>
    ),
    { ...size }
  );
}

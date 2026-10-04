import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#12110f',
                    color: '#e8a90c',
                    fontSize: 22,
                    borderRadius: 6,
                }}
            >
                V
            </div>
        ),
        size,
    );
}

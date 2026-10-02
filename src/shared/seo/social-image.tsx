import { ImageResponse } from 'next/og';
import { SITE } from '../config/site';

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

export const renderSocialImage = () =>
    new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#484b6a',
                    color: '#fafafa',
                }}
            >
                <div style={{ fontSize: 120, fontWeight: 700 }}>{SITE.name}</div>
                <div style={{ fontSize: 44, marginTop: 24, color: '#d2d3db' }}>
                    Free sign editor and tools for Valheim players
                </div>
            </div>
        ),
        SOCIAL_IMAGE_SIZE,
    );

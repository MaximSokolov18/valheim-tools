'use client';

import { useEffect, useRef } from 'react';
import { cn } from '../../../../shared/lib';
import { mountFjordScene, type FjordSceneOptions } from './mount-fjord-scene';

const LAYER_IMAGES = {
    far: '/images/scene/layer-far.webp',
    mid: '/images/scene/layer-mid.webp',
    near: '/images/scene/layer-near.webp',
    ship: '/images/scene/longship.webp',
} as const;

type SceneLayout = Omit<FjordSceneOptions, keyof typeof LAYER_IMAGES | 'track'>;

/**
 * Decorative painted fjord behind the home hero: parallax mountain layers, a
 * longship that follows the cursor, rippling water and a sun/moon that trade
 * places when the theme changes. The pointer is tracked on the parent element,
 * so the scene reacts while the hero copy stays clickable on top of it.
 * Without WebGL (or before the layers load) a static painting shows instead.
 */
export function FjordScene({ className, ...layout }: SceneLayout & { className?: string }) {
    const hostRef = useRef<HTMLDivElement>(null);
    const { shipX, shipW, waterline, horizon, wash, cycleSeconds } = layout;

    useEffect(() => {
        const host = hostRef.current;
        const track = host?.parentElement;
        if (!host || !track) return;
        const scene = mountFjordScene(host, {
            ...LAYER_IMAGES,
            track,
            shipX,
            shipW,
            waterline,
            horizon,
            wash,
            cycleSeconds,
        });
        return () => scene?.destroy();
    }, [shipX, shipW, waterline, horizon, wash, cycleSeconds]);

    return (
        <div ref={hostRef} aria-hidden="true" className={cn('group pointer-events-none overflow-hidden', className)}>
            <div
                className={cn(
                    'absolute inset-0 bg-cover bg-center transition-opacity duration-700 group-data-[live=true]:opacity-0',
                    "bg-[url('/images/scene/fjord-day.webp')] dark:bg-[url('/images/scene/fjord-night.webp')]",
                    'mask-[linear-gradient(to_right,transparent_30%,black_62%)] max-md:mask-[linear-gradient(to_bottom,transparent,black_18%,black_85%,transparent)]',
                )}
            />
        </div>
    );
}

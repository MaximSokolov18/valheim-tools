'use client';

import { useEffect, useRef } from 'react';
import { preload } from 'react-dom';
import { cn } from '../../../../shared/lib';
import { IMAGES } from '../../../../shared/config/images';
import { mountFjordScene, type FjordSceneOptions } from './mount-fjord-scene';

const LAYER_IMAGES = IMAGES.scene;

type SceneLayout = Omit<FjordSceneOptions, keyof typeof LAYER_IMAGES | 'track'>;

/**
 * Decorative painted fjord behind the home hero: parallax mountain layers, a
 * longship that follows the cursor, rippling water and a sun/moon that trade
 * places when the theme changes. The pointer is tracked on the parent element,
 * so the scene reacts while the hero copy stays clickable on top of it.
 * The live scene fades in over plain paper once its layers have loaded; the
 * static painting is shown only when WebGL is unavailable, so the page never
 * flashes one picture and then swaps it for another.
 */
export function FjordScene({ className, ...layout }: SceneLayout & { className?: string }) {
    const hostRef = useRef<HTMLDivElement>(null);
    // Start fetching the layers with the HTML instead of after hydration, so the scene fades in sooner.
    Object.values(LAYER_IMAGES).forEach((src) => preload(src, { as: 'image' }));
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
        if (!scene) host.dataset.fallback = 'true';
        return () => {
            scene?.destroy();
            delete host.dataset.fallback;
        };
    }, [shipX, shipW, waterline, horizon, wash, cycleSeconds]);

    return (
        <div ref={hostRef} aria-hidden="true" className={cn('group pointer-events-none overflow-hidden', className)}>
            <div
                className={cn(
                    'absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-700 group-data-[fallback=true]:opacity-100',
                    "bg-[url('/images/scene/fjord-day.webp')] dark:bg-[url('/images/scene/fjord-night.webp')]",
                    'mask-[linear-gradient(to_right,transparent_30%,black_62%)] max-md:mask-[linear-gradient(to_bottom,transparent,black_18%,black_85%,transparent)]',
                )}
            />
        </div>
    );
}

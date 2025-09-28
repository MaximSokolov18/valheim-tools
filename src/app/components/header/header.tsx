'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList
} from '@/components/ui/navigation-menu';
import menuUnderline from '@/assets/tab-underline.png';
import {NAVIGATION_ITEMS, TABS} from './constants';

import './header.css';
import clsx from 'clsx';

export const Header = () => {
    const pathname = usePathname();

    return (
        <header className="flex w-full justify-between items-stretch px-20 h-20">
            <Link href={TABS.HOME} className="flex items-center flex-1">
                <h1 className="text-red-700 text-4xl whitespace-nowrap">Valheim Tools</h1>
            </Link>
            <NavigationMenu className="text-4xl font-bold flex items-center justify-center flex-1" viewport={false}>
                <NavigationMenuList>
                    {NAVIGATION_ITEMS.map(({label, href}) => {
                        const isActive = pathname === href;
                        return (
                            <NavigationMenuItem key={href}>
                                <NavigationMenuLink href={href}>
                                    {label}
                                </NavigationMenuLink>
                                {isActive ? (<div className="h-0 overflow-visible"><Image
                                    src={menuUnderline}
                                    alt="Menu underline decoration"
                                    className={clsx("tab-active mt-1 h-2 w-full my-1 pr-1")}
                                /></div>) : null}
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center justify-end flex-1">Switcher</div>
        </header>
    );
};

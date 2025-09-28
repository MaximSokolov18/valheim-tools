import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import {cn} from "@/lib/utils";

function NavigationMenu({
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}) {
  return (
    <NavigationMenuPrimitive.Root {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      className={cn("flex gap-24", className)}
      {...props} />
  );
}

function NavigationMenuItem({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item {...props} />
  );
}

function NavigationMenuTrigger({
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger {...props}>
      {children}
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content {...props} />
  );
}

function NavigationMenuViewport({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div>
      <NavigationMenuPrimitive.Viewport {...props} />
    </div>
  );
}

function NavigationMenuLink({
  href,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link> & {
  href?: string;
}) {
  return (
    <NavigationMenuPrimitive.Link
      href={href}
      {...props}
    />
  );
}

function NavigationMenuIndicator({
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator {...props}>
      <div />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
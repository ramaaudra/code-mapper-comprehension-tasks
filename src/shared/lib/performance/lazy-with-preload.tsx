import { lazy } from 'react'

import type { ComponentType, LazyExoticComponent } from 'react'

type ComponentModule<TProps> = {
  default: ComponentType<TProps>
}

export type PreloadableLazyComponent<TProps> = LazyExoticComponent<
  ComponentType<TProps>
> & {
  preload: () => Promise<ComponentModule<TProps>>
}

export function lazyWithPreload<TProps>(
  factory: () => Promise<ComponentModule<TProps>>
): PreloadableLazyComponent<TProps> {
  let cachedPromise: Promise<ComponentModule<TProps>> | null = null

  const load = () => {
    if (!cachedPromise) {
      cachedPromise = factory()
    }

    return cachedPromise
  }

  const LazyComponent = lazy(load) as PreloadableLazyComponent<TProps>
  LazyComponent.preload = load

  return LazyComponent
}

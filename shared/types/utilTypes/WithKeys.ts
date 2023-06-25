export type WithKeys<K extends keyof T, T extends Partial<Record<K, unknown>>> = T;

// import { clsx, type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';

// import config from './config';

// /** Enables type branding to distinguish similarly-shaped types */
// export type Brand<K, T> = K & { __type: T };

// /** Makes field K of type T required */
// export type WithExisting<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };

// /**
//  * A generic type for strongly typing custom events with their targets
//  * @template T - The type of the event target (extends EventTarget)
//  * @template D - The type of the detail payload for the custom event
//  */
// export type TypedEvent<T extends EventTarget, D = unknown> = CustomEvent<D> & {
//   target: T;
// };

// export type TupleToUnion<T extends readonly unknown[]> = T[number];

// export const error = (name: string) =>
//   class extends Error {
//     constructor(message: string) {
//       super(message);
//       this.name = name;
//     }
//   };

// export const AssertError = error('AssertError');
// export const UnreachableError = error('Unreachable');

// export function assert<T>(val: T | null | undefined, msg = `Expected ${val} to be truthy`): asserts val is T {
//   if (!val) throw new AssertError(msg);
// }

// export function unreachable(): never {
//   throw new UnreachableError('Unreachable code reached');
// }

// export const wait = (n = 1000) => new Promise((resolve) => setTimeout(resolve, Math.max(0, n)));

// export function diffDate(toDate: Date, fromDate = new Date()) {
//   return Math.max(0, toDate.getTime() - fromDate.getTime());
// }

// export function random(min = 0, max = 1, b = 0): number {
//   const bias = clamp(0, 1, b);

//   const value = Math.pow(Math.random(), 1 - bias) * (max - min) + min;

//   return max > 1 ? Math.floor(value) : value;
// }

// export function clamp(num: number, min = 0, max = 1) {
//   return Math.min(max, Math.max(min, num));
// }

// export function rangeAry(length: number) {
//   return Array.from({ length }, (_, i) => i);
// }

// /** Truncate number without rounding */
// export function toFixed(num: number, fixed: number) {
//   const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
//   return num.toString().match(re)![0];
// }

// /** Format large numbers with K/M/B/T suffix */
// export function formatCompact(num: number, decimals = 1, minAmount = 10_000): string {
//   if (num < minAmount) return decimals === 0 ? Math.floor(num).toString() : toFixed(num, decimals);
//   const units = ['', 'K', 'M', 'B', 'T'];
//   const order = Math.min(Math.floor(Math.log10(Math.abs(num)) / 3), units.length - 1);
//   const scaled = num / Math.pow(10, order * 3);
//   return toFixed(scaled, decimals) + units[order];
// }

// export function formatStopwatchTime(toDate: Date): [string, string, string, string] {
//   const diff = diffDate(toDate);

//   const days = Math.floor(diff / (3600000 * 24));
//   const hours = Math.floor((diff % (3600000 * 24)) / 3600000);
//   const minutes = Math.floor((diff % 3600000) / 60000);
//   const seconds = Math.floor((diff % 60000) / 1000);

//   return [
//     days.toString().padStart(2, '0'),
//     hours.toString().padStart(2, '0'),
//     minutes.toString().padStart(2, '0'),
//     seconds.toString().padStart(2, '0'),
//   ];
// }

// export function getPlatform(): 'ios' | 'android' | 'browser' {
//   const userAgent = navigator.userAgent.toLowerCase();
//   if (/android/i.test(userAgent)) return 'android';
//   if (/iphone|ipad|ipod/i.test(userAgent) && /webkit/i.test(userAgent)) return 'ios';
//   return 'browser';
// }

// export function isMobile() {
//   const platform = getPlatform();
//   return platform === 'ios' || platform === 'android';
// }

// export function getMobileWallet() {
//   if (!isMobile()) return null;
//   const userAgent = navigator.userAgent.toLowerCase();
//   if ('SolflareApp' in globalThis) return 'solflare';
//   if (/phantom/i.test(userAgent)) return 'phantom';
//   if (/metamask/i.test(userAgent)) return 'metamask';
//   return null;
// }

// export const narrowScreenQuery = window.matchMedia('(max-width: 640px)');

// export function bigIntToBufferLE(value: bigint): Uint8Array {
//   const buffer = new Uint8Array(8);
//   for (let i = 0; i < 8; i++) {
//     buffer[i] = Number((value >> (BigInt(i) * 8n)) & 0xffn);
//   }
//   return buffer;
// }

// export function compareBytes(a: Uint8Array, b: Uint8Array): number {
//   for (let i = 0; i < Math.min(a.length, b.length); i++) {
//     const aVal = a[i];
//     const bVal = b[i];
//     if (aVal === undefined || bVal === undefined) continue;
//     if (aVal < bVal) return -1;
//     if (aVal > bVal) return 1;
//   }
//   return a.length - b.length;
// }

// type Fetch = typeof fetch;
// export function createJsonApiClient(fetch: Fetch) {
//   const jsonType = 'application/json';
//   return async <T = unknown>(...params: Parameters<Fetch>): Promise<T> => {
//     const [url, init, ...p] = params;
//     if (init && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method ?? '')) {
//       const headers = new Headers(init.headers);
//       headers.set('Content-Type', jsonType);
//       headers.set('accept', jsonType);
//       init.headers = headers;
//     }
//     const res = await fetch(url, init, ...p);
//     assert(
//       res.headers.get('content-type')?.includes(jsonType),
//       `Expected '${jsonType}' content type, got '${res.headers.get('content-type')}' instead`,
//     );
//     if (!res.ok) {
//       const body = await res.json();
//       const message = body.message ?? '';
//       throw new Error(`Request to ${res.url} failed with ${res.status}${message ? ': ' + message : ''}`);
//     }
//     return await res.json();
//   };
// }

// /** Wraps fetch-like client with retrying logic with exponential back off */
// export function createRetryingFetch<F extends (...args: any[]) => Promise<any>>(
//   fetch: F,
//   maxRetries = 5,
//   baseTimeout = 1000,
// ): F {
//   let error: Error | undefined;

//   return (async (...params: Parameters<F>) => {
//     for (let i = 0; i < maxRetries; ++i) {
//       try {
//         return fetch(...params);
//       } catch (err: any) {
//         error = err;
//         const waitFor = baseTimeout * Math.pow(2, i);
//         console.warn(`Encountered error ${err.message}, waiting for ${waitFor}ms before retrying...`, err);
//         await wait(waitFor);
//       }
//     }
//     console.error(`Could not send request after ${maxRetries} attempts`, ...params);
//     throw error;
//   }) as F;
// }

// export const jsonApiClient = createJsonApiClient(fetch);
// export const retryingApiClient = createRetryingFetch(jsonApiClient, 2, 1000);

// export type SVGDataURL =
//   | `data:image/svg+xml;base64,${string}`
//   | `data:image/svg+xml;charset=utf-8,${string}`
//   | `data:image/svg+xml,${string}`;
// /** Decodes SVG from data URL and inlines it */
// export function inlineSvgFromDataUrl(
//   dataUrl: SVGDataURL,
//   className?: string,
//   preserveColor = false,
//   title?: string,
// ): string {
//   let svgText: string;

//   if (dataUrl.startsWith('data:image/svg+xml;base64,')) {
//     const base64Data = dataUrl.replace('data:image/svg+xml;base64,', '');
//     svgText = atob(base64Data);
//   } else if (dataUrl.startsWith('data:image/svg+xml;charset=utf-8,')) {
//     const urlEncodedData = dataUrl.replace('data:image/svg+xml;charset=utf-8,', '');
//     svgText = decodeURIComponent(urlEncodedData);
//   } else if (dataUrl.startsWith('data:image/svg+xml,')) {
//     const urlEncodedData = dataUrl.replace('data:image/svg+xml,', '');
//     svgText = decodeURIComponent(urlEncodedData);
//   } else {
//     svgText = dataUrl;
//   }

//   // Remove XML declaration if present
//   let cleanSvg = svgText.replace(/<\?xml[^>]*\?>/g, '').trim();

//   // Remove hardcoded fill attributes from paths to allow CSS styling
//   if (!preserveColor) {
//     cleanSvg = cleanSvg.replace(/fill="[^"]*"/g, '');
//   }

//   if (className || title) {
//     cleanSvg = cleanSvg.replace(/<svg([^>]*)>/, (_, attributes) => {
//       let newAttributes = attributes;
//       if (className) {
//         newAttributes += ` class="${className}"`;
//       }
//       if (title) {
//         newAttributes += ` aria-label="${title}"`;
//       }
//       return `<svg${newAttributes}>`;
//     });
//   }

//   return cleanSvg;
// }

// type FeatureFlagKeys = Extract<keyof typeof config, `FEATURE_${string}`>;
// type FeatureFlag = FeatureFlagKeys extends `FEATURE_${infer Name}` ? Name : never;

// /**
//  * Check whether feature flag is enabled.
//  * @param flag {string} flag name in ENV_VAR_CASE without FEATURE_ prefix
//  *
//  * @example
//  * // will check FEATURE_CLAIM env var
//  * const canClaim = isFlagEnabled("CLAIM")
//  */
// export function isFlagEnabled(flag: FeatureFlag): boolean {
//   const flagEnvName = `FEATURE_${flag}` as FeatureFlagKeys;
//   if (!(flagEnvName in config)) {
//     console.warn(`Undefined flag ${flagEnvName}`);
//     return false;
//   } else {
//     return !!config[flagEnvName];
//   }
// }

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs));
// }

// export function formatRelative(date: Date, currentTime: Date = new Date()): string {
//   const diffMs = date.getTime() - currentTime.getTime();
//   const absDiff = Math.abs(diffMs);
//   const sign = diffMs >= 0 ? 1 : -1;
//   const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

//   const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
//   if (days > 0) return rtf.format(sign * days, 'day');

//   const hours = Math.floor(absDiff / (1000 * 60 * 60));
//   if (hours > 0) return rtf.format(sign * hours, 'hour');

//   const minutes = Math.floor(absDiff / (1000 * 60));
//   return rtf.format(sign * minutes, 'minute');
// }

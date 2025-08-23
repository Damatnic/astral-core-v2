/**
 * Common type definitions used throughout the application
 * These replace generic 'any' types with more specific, type-safe alternatives
 */

// For objects with string keys and unknown values (replaces Record<string, any>)
export type AnyObject = Record<string, unknown>;

// For JSON-serializable data
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

// For event properties and analytics data
export type EventProperties = {
  [key: string]: string | number | boolean | undefined | null | Date;
};

// For form data
export type FormData = {
  [key: string]: string | number | boolean | File | FileList | undefined;
};

// For API responses
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  message?: string;
}

// For error objects
export interface ErrorWithMessage {
  message: string;
  code?: string;
  stack?: string;
  [key: string]: unknown;
}

// For DOM event handlers
export type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void;
export type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type ClickEventHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void;
export type KeyboardEventHandler<T = Element> = (event: React.KeyboardEvent<T>) => void;

// For component props with children
export interface PropsWithChildren {
  children?: React.ReactNode;
}

// For async functions
export type AsyncFunction<T = void, Args extends unknown[] = []> = (...args: Args) => Promise<T>;

// For callback functions
export type VoidCallback = () => void;
export type Callback<T = void> = (value: T) => void;

// For styled components and CSS properties
export type CSSProperties = React.CSSProperties;

// For refs
export type RefObject<T> = React.RefObject<T>;
export type MutableRefObject<T> = React.MutableRefObject<T>;

// Type guard to check if a value is an error
export function isError(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ErrorWithMessage).message === 'string'
  );
}

// Type guard for checking if value is defined
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

// Type guard for checking if value is an object
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
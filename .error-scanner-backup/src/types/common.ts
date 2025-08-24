/**
 * Common type definitions used throughout the application
 * These replace generic 'any' types with more specific, type-safe alternatives
 */

// For objects with string keys and unknown values (replaces Record<string, any>)
type AnyObject = Record<string, unknown>;

// For JSON-serializable data
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

// For event properties and analytics data
type EventProperties = {
  [key: string]: string | number | boolean | undefined | null | Date
  };

// For form data
type FormData = {
  [key: string]: string | number | boolean | File | FileList | undefined
  };

// For API responses
interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number
  message?: string

// For error objects
interface ErrorWithMessage {
  message: string
  code?: string
  stack?: string
  [key: string]: unknown

// For DOM event handlers
type EventHandler<T = Element> = (event: React.SyntheticEvent<T>) => void
type ChangeEventHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void
type ClickEventHandler<T = HTMLButtonElement> = (event: React.MouseEvent<T>) => void
type KeyboardEventHandler<T = Element> = (event: React.KeyboardEvent<T>) => void
// For component props with children
interface PropsWithChildren { children?: React.ReactNode }

// For async functions
type AsyncFunction<T = void, Args extends unknown[] = []> = (...args: Args) => Promise<T>
// For callback functions
type VoidCallback = () => void
type Callback<T = void> = (value: T) => void
// For styled components and CSS properties
type CSSProperties = React.CSSProperties
// For refs
type RefObject<T> = React.RefObject<T>
type MutableRefObject<T> = React.MutableRefObject<T>
// Type guard to check if a value is an error;

 isError(error: unknown): error is ErrorWithMessage { return (;
$2of error === 'object' &&
    error !== null &&
    'message' in error &&;
$2of (error as ErrorWithMessage).message === 'string'
  ) }

// Type guard for checking if value is defined
function isDefined<T>(value: T | undefined | null): value is T { return value !== undefined && value !== null }

// Type guard for checking if value is an object
function isObject(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) }
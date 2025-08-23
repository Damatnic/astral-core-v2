/// <reference types="@testing-library/jest-dom" />

// Ensure Jest DOM matchers are available in test files
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value: string | string[]): R;
      toBeVisible(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(className: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeEmptyDOMElement(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toHaveFocus(): R;
      toHaveStyle(css: string | object): R;
    }
  }
}

export {};

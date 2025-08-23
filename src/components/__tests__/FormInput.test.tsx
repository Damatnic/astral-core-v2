import React from 'react';
import { render, screen, waitFor, fireEvent } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { FormInput } from '../FormInput';
import { createMockFormInputProps, mockUseFormAnimations } from '../../test-utils';

// Create a shared mock instance
const mockAnimations = mockUseFormAnimations();

// Mock the useFormAnimations hook
jest.mock('../../hooks/useAnimations', () => ({
  useFormAnimations: () => mockAnimations
}));

describe('FormInput', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up user event with real timers
    user = userEvent.setup({ delay: null });
  });

  describe('Rendering', () => {
    it('should render input with label', () => {
      const props = createMockFormInputProps({ label: 'Test Label' });
      render(<FormInput {...props} />);
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render input without label', () => {
      const props = createMockFormInputProps({ label: undefined });
      render(<FormInput {...props} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText('Test Input')).not.toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      const placeholder = 'Enter your name';
      const props = createMockFormInputProps({ placeholder });
      render(<FormInput {...props} />);
      
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });

    it('should render with current value', () => {
      const value = 'Current input value';
      const props = createMockFormInputProps({ value });
      render(<FormInput {...props} />);
      
      expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    });

    it('should render floating label correctly', () => {
      const props = createMockFormInputProps({
        label: 'Floating Label',
        floatingLabel: true
      });
      const { container } = render(<FormInput {...props} />);
      
      expect(container.querySelector('.floating-label')).toBeInTheDocument();
      expect(screen.getByLabelText('Floating Label')).toBeInTheDocument();
    });

    it('should render help text when provided', () => {
      const helpText = 'This is helpful information';
      const props = createMockFormInputProps({ helpText });
      render(<FormInput {...props} />);
      
      expect(screen.getByText(helpText)).toBeInTheDocument();
    });

    it('should render character count when enabled', () => {
      const props = createMockFormInputProps({
        showCharacterCount: true,
        maxLength: 100,
        value: 'Test'
      });
      render(<FormInput {...props} />);
      
      expect(screen.getByText('4/100 characters')).toBeInTheDocument();
      expect(screen.getByText('96 remaining')).toBeInTheDocument();
    });

    it('should render required indicator', () => {
      const props = createMockFormInputProps({ required: true, label: 'Required Field' });
      const { container } = render(<FormInput {...props} />);
      
      const label = container.querySelector('.form-label.required');
      expect(label).toBeInTheDocument();
    });
  });

  describe('Input Types', () => {
    const inputTypes = ['text', 'email', 'password', 'tel', 'url', 'number'] as const;
    
    inputTypes.forEach(type => {
      it(`should render with correct type attribute: ${type}`, () => {
        const props = createMockFormInputProps({ type });
        render(<FormInput {...props} />);
        
        const input = type === 'password' ? screen.getByLabelText('Test Input') :
                      type === 'number' ? screen.getByRole('spinbutton') :
                      screen.getByRole('textbox');
        expect(input).toHaveAttribute('type', type);
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when user types', async () => {
      const mockOnChange = jest.fn();
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        const handleChange = (newValue: string) => {
          mockOnChange(newValue);
          setValue(newValue);
        };
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={handleChange}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      
      // Simulate typing each character
      fireEvent.change(input, { target: { value: 'H' } });
      fireEvent.change(input, { target: { value: 'He' } });
      fireEvent.change(input, { target: { value: 'Hel' } });
      fireEvent.change(input, { target: { value: 'Hell' } });
      fireEvent.change(input, { target: { value: 'Hello' } });
      
      // Check that onChange was called for each character with accumulated value
      expect(mockOnChange).toHaveBeenCalledTimes(5);
      expect(mockOnChange).toHaveBeenNthCalledWith(1, 'H');
      expect(mockOnChange).toHaveBeenNthCalledWith(2, 'He');
      expect(mockOnChange).toHaveBeenNthCalledWith(3, 'Hel');
      expect(mockOnChange).toHaveBeenNthCalledWith(4, 'Hell');
      expect(mockOnChange).toHaveBeenNthCalledWith(5, 'Hello');
    });

    it('should call onBlur when input loses focus', async () => {
      const mockOnBlur = jest.fn();
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            onBlur={mockOnBlur}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should handle rapid typing', async () => {
      const mockOnChange = jest.fn();
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        const handleChange = (newValue: string) => {
          mockOnChange(newValue);
          setValue(newValue);
        };
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={handleChange}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      
      // Simulate rapid typing
      const text = 'RapidTyping';
      let accumulated = '';
      for (const char of text) {
        accumulated += char;
        fireEvent.change(input, { target: { value: accumulated } });
      }
      
      expect(mockOnChange).toHaveBeenCalledTimes(11); // One call per character
      expect(mockOnChange).toHaveBeenLastCalledWith('RapidTyping');
    });
  });

  describe('Validation', () => {
    it('should show required field error when empty and required', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            required={true}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input); // Trigger blur
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'This field is required'
        );
      });
    });

    it('should show minimum length error', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('Hi');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            minLength={5}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Minimum 5 characters required'
        );
      });
    });

    it('should show maximum length error', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('TooLongValue');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            maxLength={5}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Maximum 5 characters allowed'
        );
      });
    });

    it('should validate email format', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('invalid-email');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            type="email"
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Please enter a valid email address'
        );
      });
    });

    it('should validate against pattern', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('123-45-678');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            pattern="^\\d{3}-\\d{2}-\\d{4}$"
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Please enter a valid format'
        );
      });
    });

    it('should validate custom rules', async () => {
      const validationRules = [{
        test: (value: string) => value.includes('test'),
        message: 'Value must contain "test"'
      }];
      
      const TestWrapper = () => {
        const [value, setValue] = React.useState('invalid value');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            validationRules={validationRules}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Value must contain "test"'
        );
      });
    });

    it('should show success state for valid input', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('Valid input');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            required={true}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldSuccess).toHaveBeenCalledWith('test-input');
      });
    });

    it('should validate in real-time when enabled', async () => {
      const props = createMockFormInputProps({
        realTimeValidation: true,
        required: true,
        value: 'Valid'
      });
      render(<FormInput {...props} />);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldSuccess).toHaveBeenCalledWith(props.id);
      });
    });

    it('should not validate until touched when realTimeValidation is false', () => {
      const props = createMockFormInputProps({
        realTimeValidation: false,
        required: true,
        value: '' // Empty required field
      });
      render(<FormInput {...props} />);
      
      // Should not show error immediately
      expect(mockAnimations.showFieldError).not.toHaveBeenCalled();
    });
  });

  describe('Character Count', () => {
    it('should show character count when enabled', () => {
      const props = createMockFormInputProps({
        showCharacterCount: true,
        maxLength: 100,
        value: 'Hello world'
      });
      render(<FormInput {...props} />);
      
      expect(screen.getByText('11/100 characters')).toBeInTheDocument();
      expect(screen.getByText('89 remaining')).toBeInTheDocument();
    });

    it('should apply near-limit class when approaching limit', () => {
      const props = createMockFormInputProps({
        showCharacterCount: true,
        maxLength: 10,
        value: '123456789' // 9 characters, 90% of limit (>80%)
      });
      const { container } = render(<FormInput {...props} />);
      
      const characterCount = container.querySelector('.form-character-count');
      expect(characterCount).toHaveClass('near-limit');
    });

    it('should apply over-limit class when exceeding limit', () => {
      const props = createMockFormInputProps({
        showCharacterCount: true,
        maxLength: 5,
        value: '123456' // 6 characters, over limit
      });
      const { container } = render(<FormInput {...props} />);
      
      const characterCount = container.querySelector('.form-character-count');
      expect(characterCount).toHaveClass('over-limit');
    });

    it('should not show character count when disabled', () => {
      const props = createMockFormInputProps({
        showCharacterCount: false,
        maxLength: 100,
        value: 'Hello world'
      });
      render(<FormInput {...props} />);
      
      expect(screen.queryByText('11/100 characters')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      const props = createMockFormInputProps({
        id: 'test-input',
        label: 'Test Label',
        helpText: 'Help text',
        required: true
      });
      render(<FormInput {...props} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should associate label with input', () => {
      const props = createMockFormInputProps({
        id: 'test-input',
        label: 'Test Label'
      });
      render(<FormInput {...props} />);
      
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should mark input as invalid when validation fails', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            required={true}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should include all relevant IDs in aria-describedby', () => {
      const props = createMockFormInputProps({
        id: 'test-input',
        helpText: 'Help text',
        showCharacterCount: true,
        maxLength: 100,
        'aria-describedby': 'external-description'
      });
      render(<FormInput {...props} />);
      
      const input = screen.getByRole('textbox');
      const describedBy = input.getAttribute('aria-describedby');
      
      expect(describedBy).toContain('external-description');
      expect(describedBy).toContain('test-input-help');
      expect(describedBy).toContain('test-input-counter');
    });
  });

  describe('States and Classes', () => {
    it('should apply form-group classes correctly', () => {
      const props = createMockFormInputProps({
        floatingLabel: true,
        value: 'Has value',
        label: 'Test Label',
        className: 'custom-class'
      });
      const { container } = render(<FormInput {...props} />);
      
      const formGroup = container.querySelector('.form-group');
      expect(formGroup).toHaveClass(
        'form-group',
        'floating-label',
        'has-value',
        'has-label',
        'custom-class'
      );
    });

    it('should show success validation icon', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('Valid value');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            required={true}
          />
        );
      };
      
      const { container } = render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        const successIcon = container.querySelector('.success-checkmark');
        expect(successIcon).toBeInTheDocument();
      });
    });

    it('should show error validation icon', async () => {
      const TestWrapper = () => {
        const [value, setValue] = React.useState('');
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            required={true}
          />
        );
      };
      
      const { container } = render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        const errorIcon = container.querySelector('.error-icon');
        expect(errorIcon).toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('should render disabled input', () => {
      const props = createMockFormInputProps({ disabled: true });
      render(<FormInput {...props} />);
      
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('should not trigger validation when disabled', async () => {
      const props = createMockFormInputProps({
        disabled: true,
        required: true,
        value: ''
      });
      render(<FormInput {...props} />);
      
      const input = screen.getByRole('textbox');
      // Disabled inputs won't receive focus/click events
      expect(input).toBeDisabled();
      
      expect(mockAnimations.showFieldError).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty validation rules array', () => {
      const props = createMockFormInputProps({ validationRules: [] });
      render(<FormInput {...props} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle undefined validation rules', () => {
      const props = createMockFormInputProps({ validationRules: undefined });
      render(<FormInput {...props} />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle maxLength without showCharacterCount', () => {
      const props = createMockFormInputProps({
        maxLength: 10,
        showCharacterCount: false,
        value: 'test'
      });
      render(<FormInput {...props} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
      expect(screen.queryByText('4/10 characters')).not.toBeInTheDocument();
    });

    it('should handle floating label with empty placeholder', () => {
      const props = createMockFormInputProps({
        floatingLabel: true,
        placeholder: undefined,
        label: 'Floating Label'
      });
      render(<FormInput {...props} />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', ' '); // Space for floating label
    });

    it('should handle rapid value changes', async () => {
      const props = createMockFormInputProps({ realTimeValidation: true });
      const { rerender } = render(<FormInput {...props} />);
      
      // Rapidly change values
      rerender(<FormInput {...props} value="a" />);
      rerender(<FormInput {...props} value="ab" />);
      rerender(<FormInput {...props} value="abc" />);
      rerender(<FormInput {...props} value="" />);
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should handle complex validation rules', async () => {
      const complexRules = [
        {
          test: (value: string) => value.length >= 3,
          message: 'Minimum 3 characters'
        },
        {
          test: (value: string) => /[A-Z]/.test(value),
          message: 'Must contain uppercase letter'
        },
        {
          test: (value: string) => /\d/.test(value),
          message: 'Must contain number'
        }
      ];
      
      const TestWrapper = () => {
        const [value, setValue] = React.useState('ab'); // Fails first rule
        
        return (
          <FormInput
            id="test-input"
            label="Test Input"
            value={value}
            onChange={setValue}
            validationRules={complexRules}
          />
        );
      };
      
      render(<TestWrapper />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(mockAnimations.showFieldError).toHaveBeenCalledWith(
          'test-input',
          'Minimum 3 characters'
        );
      });
    });
  });
});

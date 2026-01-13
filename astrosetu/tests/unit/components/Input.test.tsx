/**
 * Unit Tests for Input Component
 * Tests: rendering, user input, validation, accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Input className="custom-input" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('custom-input');
    });

    it('renders with value', () => {
      render(<Input defaultValue="Test value" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test value');
    });
  });

  describe('User Input', () => {
    it('accepts text input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Hello World');
      expect(input.value).toBe('Hello World');
    });

    it('calls onChange when value changes', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('handles controlled input', () => {
      const { rerender } = render(<Input value="initial" onChange={vi.fn()} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('initial');
      rerender(<Input value="updated" onChange={vi.fn()} />);
      expect(input.value).toBe('updated');
    });
  });

  describe('Input Types', () => {
    it('renders text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // HTML input defaults to type="text" even if attribute is not explicitly set
      // Check that it's a textbox (which means type="text" or no type specified)
      expect(input).toBeInTheDocument();
      // If type is not set, HTML defaults to "text", so we can check it's not another type
      const type = input.getAttribute('type');
      expect(type === null || type === 'text').toBe(true);
    });

    it('renders email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('renders number input', () => {
      render(<Input type="number" />);
      const input = document.querySelector('input[type="number"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('supports aria-label', () => {
      render(<Input aria-label="Username input" />);
      const input = screen.getByLabelText('Username input');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="help-text" />
          <span id="help-text">Help text</span>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('supports aria-required', () => {
      render(<Input aria-required="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('has focus styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('focus:border-saffron-500');
      expect(input.className).toContain('focus:ring-2');
    });
  });

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input.className).toContain('disabled:bg-slate-100');
      expect(input.className).toContain('disabled:cursor-not-allowed');
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'test');
      expect(input.value).toBe('');
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = vi.fn();
      render(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML input attributes', () => {
      render(<Input data-testid="test-input" maxLength={10} />);
      const input = screen.getByTestId('test-input');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('forwards id attribute', () => {
      render(<Input id="my-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'my-input');
    });

    it('forwards name attribute', () => {
      render(<Input name="username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
    });
  });

  describe('Validation', () => {
    it('supports required attribute', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('supports pattern attribute', () => {
      render(<Input pattern="[0-9]+" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]+');
    });

    it('supports minLength attribute', () => {
      render(<Input minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('supports maxLength attribute', () => {
      render(<Input maxLength={100} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '100');
    });
  });
});


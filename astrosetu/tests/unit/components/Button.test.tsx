/**
 * Unit Tests for Button Component
 * Tests: rendering, variants, interactions, accessibility
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(<Button className="custom-class">Test</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders primary variant by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('from-saffron-600');
    });

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-white');
    });

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-white/80');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles multiple clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has role="button" by default', () => {
      render(<Button>Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('respects custom role prop', () => {
      render(<Button role="link">Link Button</Button>);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });

    it('has aria-disabled when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('does not have aria-disabled when enabled', () => {
      render(<Button>Enabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'false');
    });

    it('has focus styles', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:outline-none');
      expect(button.className).toContain('focus:ring-2');
    });
  });

  describe('Button Types', () => {
    it('defaults to type="button"', () => {
      render(<Button>Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('respects type="submit"', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('respects type="reset"', () => {
      render(<Button type="reset">Reset</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'reset');
    });
  });

  describe('Disabled State', () => {
    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:cursor-not-allowed');
    });

    it('is not clickable when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards HTML button attributes', () => {
      render(<Button data-testid="test-button" aria-label="Test button">Test</Button>);
      const button = screen.getByTestId('test-button');
      expect(button).toHaveAttribute('aria-label', 'Test button');
    });

    it('forwards id attribute', () => {
      render(<Button id="my-button">Test</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('id', 'my-button');
    });
  });
});


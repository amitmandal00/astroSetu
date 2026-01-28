import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import * as indianCities from '@/lib/indianCities';
import { useState } from "react";

// Mock the indianCities module
vi.mock('@/lib/indianCities', () => ({
  searchLocalCities: vi.fn(),
  resolvePlaceCoordinates: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('AutocompleteInput Component', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(indianCities.searchLocalCities).mockReturnValue([]);
  });

  afterEach(() => {
    // Safety: ensure fake timers never leak to other tests (prevents suite-wide timeouts).
    vi.useRealTimers();
  });

  function renderControlled(props?: Partial<React.ComponentProps<typeof AutocompleteInput>>) {
    function Wrapper() {
      const [value, setValue] = useState(props?.value ?? "");
      return (
        <AutocompleteInput
          value={value}
          onChange={(v) => {
            setValue(v);
            mockOnChange(v);
          }}
          onSelect={(p) => {
            mockOnSelect(p);
          }}
          {...props}
        />
      );
    }
    return render(<Wrapper />);
  }

  it('should render input with placeholder', () => {
    render(
      <AutocompleteInput
        value=""
        onChange={mockOnChange}
        placeholder="Enter city name"
      />
    );

    const input = screen.getByPlaceholderText('Enter city name');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when typing', async () => {
    renderControlled();

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Delhi' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('Delhi');
    });
  });

  it('should not show suggestions for input less than 2 characters', async () => {
    vi.mocked(indianCities.searchLocalCities).mockReturnValue([]);

    render(
      <AutocompleteInput
        value="D"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.queryByText(/Delhi/i);
      expect(suggestions).not.toBeInTheDocument();
    });
  });

  it('should show local suggestions when available', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
      {
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        latitude: 19.0760,
        longitude: 72.8777,
        displayName: 'Mumbai, Maharashtra, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    render(
      <AutocompleteInput
        value="Del"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });
  });

  it('should call onSelect when suggestion is clicked', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    render(
      <AutocompleteInput
        value="Del"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestion = screen.getByText('Delhi');
      expect(suggestion).toBeInTheDocument();
    });

    const suggestion = screen.getByText('Delhi');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Delhi',
          state: 'Delhi',
          country: 'India',
        })
      );
    });
  });

  it('should handle keyboard navigation (ArrowDown)', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
      {
        name: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        latitude: 19.0760,
        longitude: 72.8777,
        displayName: 'Mumbai, Maharashtra, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    render(
      <AutocompleteInput
        value="Del"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Check that first suggestion is highlighted
    const firstSuggestion = screen.getByText('Delhi').closest('button');
    expect(firstSuggestion).toHaveClass('bg-saffron-50');
  });

  it('should handle Enter key to select suggestion', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    render(
      <AutocompleteInput
        value="Del"
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalled();
    });
  });

  it('should handle Escape key to close suggestions', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    render(
      <AutocompleteInput
        value="Del"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
    });
  });

  it('should debounce API calls', async () => {
    vi.useFakeTimers();

    vi.mocked(indianCities.searchLocalCities).mockReturnValue([]);
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    renderControlled({ debounceMs: 300 });

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Del' } });

    // Debounce should not run before 300ms
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(indianCities.searchLocalCities).not.toHaveBeenCalled();

    // At 300ms, the debounced lookup runs
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(indianCities.searchLocalCities).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should prioritize Indian cities when prioritizeIndia is true', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
      {
        name: 'New York',
        state: 'New York',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        displayName: 'New York, New York, USA',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    renderControlled({ value: "Del", prioritizeIndia: true, debounceMs: 1 });

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      const suggestions = screen.getAllByRole('button');
      // Delhi (India) should appear before New York (USA)
      expect(suggestions[0]).toHaveTextContent('Delhi');
    });
  });

  it('should handle API failure gracefully', async () => {
    vi.mocked(indianCities.searchLocalCities).mockReturnValue([]);
    vi.mocked(global.fetch).mockRejectedValue(new Error('API Error'));

    renderControlled({ value: "UnknownCity", debounceMs: 1 });

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      // Should not crash, just show no suggestions
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  it('should hide suggestions when clicking outside', async () => {
    const mockCities = [
      {
        name: 'Delhi',
        state: 'Delhi',
        country: 'India',
        latitude: 28.6139,
        longitude: 77.2090,
        displayName: 'Delhi, Delhi, India',
      },
    ];

    vi.mocked(indianCities.searchLocalCities).mockReturnValue(mockCities);

    function Wrapper() {
      const [value, setValue] = useState("Del");
      return (
        <div>
          <AutocompleteInput value={value} debounceMs={1} onChange={(v) => { setValue(v); mockOnChange(v); }} />
          <div data-testid="outside">Outside</div>
        </div>
      );
    }
    render(<Wrapper />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Delhi')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
    });
  });
});


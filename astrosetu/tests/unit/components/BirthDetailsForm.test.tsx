import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BirthDetailsForm } from '@/components/forms/BirthDetailsForm';

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

// Mock fetch for reverse geocoding
global.fetch = vi.fn();

describe('BirthDetailsForm Component', () => {
  const mockOnChange = vi.fn();
  const defaultData = {
    name: '',
    gender: 'Male' as const,
    day: '',
    month: '',
    year: '',
    hours: '',
    minutes: '',
    seconds: '',
    place: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;
  });

  it('should render all form fields', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('DD')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YYYY')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('HH')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('SS')).toBeInTheDocument();
  });

  it('should call onChange when name is entered', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const nameInput = screen.getByPlaceholderText(/enter name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultData,
      name: 'John Doe',
    });
  });

  it('should call onChange when gender is selected', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const femaleButton = screen.getByText('Female');
    fireEvent.click(femaleButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultData,
      gender: 'Female',
    });
  });

  it('should call onChange when date fields are entered', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const dayInput = screen.getByPlaceholderText('DD');
    fireEvent.change(dayInput, { target: { value: '15' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultData,
      day: '15',
    });
  });

  it('should call onChange when time fields are entered', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const hoursInput = screen.getByPlaceholderText('HH');
    fireEvent.change(hoursInput, { target: { value: '10' } });

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultData,
      hours: '10',
    });
  });

  it('should fill current time when NOW button is clicked', () => {
    const mockDate = new Date('2024-01-15T10:30:45');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const nowButton = screen.getByText('⏰ NOW');
    fireEvent.click(nowButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultData,
      day: '15',
      month: '1',
      year: '2024',
      hours: '10',
      minutes: '30',
      seconds: '45',
    });

    vi.useRealTimers();
  });

  it('should handle current location when geolocation is available', async () => {
    const mockPosition = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
      },
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        address: {
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
        },
      }),
    } as Response);

    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const locationButton = screen.getByText('📍 Location');
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          place: expect.stringContaining('Delhi'),
        })
      );
    });
  });

  it('should show alert when geolocation is not supported', () => {
    // @ts-ignore
    delete global.navigator.geolocation;

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const locationButton = screen.getByText('📍 Location');
    fireEvent.click(locationButton);

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Geolocation is not supported')
    );

    alertSpy.mockRestore();
  });

  it('should handle geolocation error gracefully', async () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      message: 'User denied geolocation',
    };

    mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
      error(mockError);
    });

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    const locationButton = screen.getByText('📍 Location');
    fireEvent.click(locationButton);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        expect.stringContaining('Location access denied')
      );
    });

    alertSpy.mockRestore();
  });

  it('should render with custom title', () => {
    render(
      <BirthDetailsForm
        title="Enter Birth Details"
        data={defaultData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Enter Birth Details')).toBeInTheDocument();
  });

  it('should hide quick actions when showQuickActions is false', () => {
    render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
        showQuickActions={false}
      />
    );

    expect(screen.queryByText('📍 Location')).not.toBeInTheDocument();
    expect(screen.queryByText('⏰ NOW')).not.toBeInTheDocument();
  });

  it('should render in compact mode', () => {
    const { container } = render(
      <BirthDetailsForm
        data={defaultData}
        onChange={mockOnChange}
        compact={true}
      />
    );

    // Check for compact spacing class
    const form = container.querySelector('.space-y-3');
    expect(form).toBeInTheDocument();
  });

  it('should display selected gender correctly', () => {
    render(
      <BirthDetailsForm
        data={{ ...defaultData, gender: 'Female' }}
        onChange={mockOnChange}
      />
    );

    const femaleButton = screen.getByText('Female');
    expect(femaleButton).toHaveClass('bg-gradient-to-r');
  });
});


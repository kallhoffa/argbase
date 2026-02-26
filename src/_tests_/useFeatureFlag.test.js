import { renderHook, waitFor } from '@testing-library/react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { fetchFeatureFlags } from '../firestore-utils/remote-config';

vi.mock('../firestore-utils/remote-config');

describe('useFeatureFlag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.__FEATURE_FLAGS__;
    delete window.__FLAG_TEST_MODE__;
  });

  test('returns default value when flag is not set', async () => {
    fetchFeatureFlags.mockResolvedValue({});
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBeNull();
  });

  test('returns flag value from remote config', async () => {
    fetchFeatureFlags.mockResolvedValue({ 
      navigation_banner: 'beta' 
    });
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBe('beta');
  });

  test('returns control variant by default', async () => {
    fetchFeatureFlags.mockResolvedValue({ 
      navigation_banner: 'control' 
    });
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBe('control');
  });

  test('returns next variant', async () => {
    fetchFeatureFlags.mockResolvedValue({ 
      navigation_banner: 'next' 
    });
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBe('next');
  });

  test('uses cached flags on subsequent calls', async () => {
    window.__FEATURE_FLAGS__ = { navigation_banner: 'beta' };
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBe('beta');
    expect(fetchFeatureFlags).not.toHaveBeenCalled();
  });

  test('uses test override when set', async () => {
    window.__FLAG_TEST_MODE__ = { navigation_banner: 'beta' };
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBe('beta');
  });

  test('handles fetch error gracefully', async () => {
    fetchFeatureFlags.mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => useFeatureFlag('navigation_banner'));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.flagValue).toBeNull();
  });
});

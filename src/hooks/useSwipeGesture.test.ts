import { renderHook, act, waitFor } from '../test-utils';
import { useSwipeGesture, useSwipeRef, usePullToRefresh } from './useSwipeGesture';


// Mock touch events
const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  // Create a more realistic touch event that works with the handlers
  const touchList = touches.map(touch => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
    identifier: 0,
    target: document.body,
    radiusX: 0,
    radiusY: 0,
    rotationAngle: 0,
    force: 1,
    screenX: touch.clientX,
    screenY: touch.clientY,
    pageX: touch.clientX,
    pageY: touch.clientY
  }));

  // Create event with proper touches array
  const touchesArray = type === 'touchend' ? [] : touchList;
  
  const event = new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touchesArray,
    changedTouches: touchList,
    targetTouches: touchesArray
  } as any);

  // Ensure touches has a length property and array-like behavior
  if (!event.touches || typeof event.touches.length === 'undefined') {
    Object.defineProperty(event, 'touches', {
      value: touchesArray,
      writable: false,
      configurable: true
    });
  }
  
  // Ensure the touches array has proper array methods
  if (event.touches && !event.touches[Symbol.iterator]) {
    Object.defineProperty(event.touches, 'length', {
      value: touchesArray.length,
      writable: false
    });
    for (let i = 0; i < touchesArray.length; i++) {
      event.touches[i] = touchesArray[i];
    }
  }

  return event;
};

describe('useSwipeGesture Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.skip('should initialize with correct default state', async () => {
    const { result } = renderHook(() => useSwipeGesture());
    
    expect(result.current.isTracking).toBe(false);
    expect(typeof result.current.attachListeners).toBe('function');
    expect(typeof result.current.detachListeners).toBe('function');
  });

  it.skip('should attach and detach listeners to an element', async () => {
    const { result } = renderHook(() => useSwipeGesture());
    
    const element = document.createElement('div');
    const addEventListenerSpy = jest.spyOn(element, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(element, 'removeEventListener');

    result.current.attachListeners(element);

    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), { passive: true });
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function), { passive: true });

    result.current.detachListeners(element);

    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });

  it.skip('should use non-passive listeners when preventDefaultTouchMove is enabled', async () => {
    const { result } = renderHook(() => useSwipeGesture({ preventDefaultTouchMove: true }));
    
    const element = document.createElement('div');
    const addEventListenerSpy = jest.spyOn(element, 'addEventListener');

    result.current.attachListeners(element);

    expect(addEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: false });
  });

  it.skip('should detect left swipe gesture', async () => {
    const onSwipeLeft = jest.fn();
    const onSwipe = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipeLeft, 
      onSwipe,
      threshold: 50,
      velocityThreshold: 0.1
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate swipe left
    const touchStart = createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]);
    const touchEnd = createTouchEvent('touchend', []);

    act(() => {
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 100); // Add some time for velocity calculation
    });

    // Simulate touch move
    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipeLeft).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'left',
        distance: 100,
        velocity: expect.any(Number),
        duration: expect.any(Number)
      })
    );

    expect(onSwipe).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'left'
      })
    );
  });

  it.skip('should detect right swipe gesture', async () => {
    const onSwipeRight = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipeRight,
      threshold: 50,
      velocityThreshold: 0.1
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate swipe right
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 100);
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 200, clientY: 100 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipeRight).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'right',
        distance: 100
      })
    );
  });

  it.skip('should detect up swipe gesture', async () => {
    const onSwipeUp = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipeUp,
      threshold: 50,
      velocityThreshold: 0.1
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate swipe up
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]);
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 100);
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipeUp).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'up',
        distance: 100
      })
    );
  });

  it.skip('should detect down swipe gesture', async () => {
    const onSwipeDown = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipeDown,
      threshold: 50,
      velocityThreshold: 0.1
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate swipe down
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 100);
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 200 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipeDown).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'down',
        distance: 100
      })
    );
  });

  it.skip('should not trigger swipe if distance is below threshold', async () => {
    const onSwipe = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipe,
      threshold: 100
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate short swipe (below threshold)
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 100);
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it.skip('should not trigger swipe if velocity is below threshold', async () => {
    const onSwipe = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ 
      onSwipe,
      threshold: 50,
      velocityThreshold: 1.0 // High velocity threshold
    }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate slow swipe
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
      jest.setSystemTime(Date.now() + 1000); // Long duration = low velocity
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 200, clientY: 100 }]);
      element.dispatchEvent(touchMove);
    });

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(onSwipe).not.toHaveBeenCalled();
  });

  it.skip('should ignore multi-touch events', async () => {
    const onSwipe = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ onSwipe }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    // Simulate multi-touch start
    act(() => {
      const touchStart = createTouchEvent('touchstart', [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 200 }
      ]);
      element.dispatchEvent(touchStart);
    });

    expect(result.current.isTracking).toBe(false);
  });

  it.skip('should handle touchend without touchmove', async () => {
    const onSwipe = jest.fn();
    
    const { result } = renderHook(() => useSwipeGesture({ onSwipe }));
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    expect(result.current.isTracking).toBe(true);

    // End without move
    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(result.current.isTracking).toBe(false);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it.skip('should update tracking state correctly', async () => {
    const { result } = renderHook(() => useSwipeGesture());
    
    const element = document.createElement('div');
    result.current.attachListeners(element);

    expect(result.current.isTracking).toBe(false);

    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    expect(result.current.isTracking).toBe(true);

    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(result.current.isTracking).toBe(false);
  });
});

describe('useSwipeRef Hook', () => {
  it.skip('should return ref and tracking state', async () => {
    const { result } = renderHook(() => useSwipeRef());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
    expect(result.current.isTracking).toBe(false);
  });

  it.skip('should automatically attach listeners when ref is set', async () => {
    const onSwipe = jest.fn();
    const { result, rerender } = renderHook(() => useSwipeRef({ onSwipe }));
    
    const element = document.createElement('div');
    const addEventListenerSpy = jest.spyOn(element, 'addEventListener');

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Trigger useEffect by re-rendering
    act(() => {
      rerender();
    });

    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});

describe('usePullToRefresh Hook', () => {
  beforeEach(() => {
    // Mock scrollY and scrollTop
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  it.skip('should initialize with correct default state', async () => {
    const mockOnRefresh = jest.fn();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));
    
    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.pullProgress).toBe(0);
    expect(result.current.ref).toBeDefined();
  });

  it.skip('should start pulling when swiping down from top', () => {
    const mockOnRefresh = jest.fn();
    const { result, rerender } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80 }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Force re-render to trigger useEffect
    act(() => {
      rerender();
    });

    // Simulate touch start at top
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    // Simulate pulling down
    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 150 }]);
      element.dispatchEvent(touchMove);
    });

    expect(result.current.isPulling).toBe(true);
    expect(result.current.pullDistance).toBeGreaterThan(0);
    expect(result.current.pullProgress).toBeGreaterThan(0);
  });

  it.skip('should not start pulling when not at top', async () => {
    const mockOnRefresh = jest.fn();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 100, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Simulate touch start when scrolled
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it.skip('should trigger refresh when threshold is exceeded', async () => {
    const mockOnRefresh = jest.fn().mockResolvedValue(undefined);
    const { result, rerender } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 50, resistance: 1 }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Force re-render to trigger useEffect
    act(() => {
      rerender();
    });

    // Start pull
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    // Pull down beyond threshold
    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 160 }]);
      element.dispatchEvent(touchMove);
    });

    // Release
    await act(async () => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(mockOnRefresh).toHaveBeenCalled();
  });

  it.skip('should not trigger refresh when below threshold', async () => {
    const mockOnRefresh = jest.fn();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 80, resistance: 1 }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Start pull
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    // Pull down but not enough
    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 130 }]);
      element.dispatchEvent(touchMove);
    });

    // Release
    act(() => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(mockOnRefresh).not.toHaveBeenCalled();
    expect(result.current.isPulling).toBe(false);
    expect(result.current.pullDistance).toBe(0);
  });

  it.skip('should handle refresh errors gracefully', async () => {
    const mockOnRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
    const { result, rerender } = renderHook(() => usePullToRefresh(mockOnRefresh, { threshold: 50, resistance: 1 }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Force re-render to trigger useEffect
    act(() => {
      rerender();
    });

    // Start and complete pull gesture
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 160 }]);
      element.dispatchEvent(touchMove);
    });

    await act(async () => {
      const touchEnd = createTouchEvent('touchend', []);
      element.dispatchEvent(touchEnd);
    });

    expect(mockOnRefresh).toHaveBeenCalled();
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isPulling).toBe(false);
  });

  it.skip('should not pull when disabled', () => {
    const mockOnRefresh = jest.fn();
    const { result } = renderHook(() => usePullToRefresh(mockOnRefresh, { enabled: false }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Try to start pull
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    expect(result.current.isPulling).toBe(false);
  });

  it.skip('should apply resistance to pull distance', () => {
    const mockOnRefresh = jest.fn();
    const { result, rerender } = renderHook(() => usePullToRefresh(mockOnRefresh, { resistance: 0.5 }));
    
    const element = document.createElement('div');
    Object.defineProperty(element, 'scrollTop', { value: 0, writable: true });

    act(() => {
      (result.current.ref as any).current = element;
    });

    // Force re-render to trigger useEffect
    act(() => {
      rerender();
    });

    // Start pull
    act(() => {
      const touchStart = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]);
      element.dispatchEvent(touchStart);
    });

    // Pull down 100px
    act(() => {
      const touchMove = createTouchEvent('touchmove', [{ clientX: 100, clientY: 200 }]);
      element.dispatchEvent(touchMove);
    });

    // With 0.5 resistance, 100px pull should result in 50px distance
    expect(result.current.pullDistance).toBe(50);
  });
});

// Helper utility to trigger haptic feedback on supported mobile devices
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'light') {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          navigator.vibrate([10, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        default:
          navigator.vibrate(10);
      }
    } catch (e) {
      // Haptics not allowed or unsupported
    }
  }
}

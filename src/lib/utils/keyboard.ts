/**
 * Utility functions for keyboard shortcuts and OS detection
 */

/**
 * Detects if the user is on macOS
 */
export function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return /Mac|iPod|iPhone|iPad/.test(window.navigator.userAgent);
}

/**
 * Gets the appropriate modifier key symbol based on OS
 */
export function getModifierKey(): string {
  return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Gets the modifier key for display (Command or Control)
 */
export function getModifierKeyName(): string {
  return isMac() ? 'Cmd' : 'Ctrl';
}

/**
 * Checks if the modifier key is pressed in an event
 */
export function isModifierKey(event: KeyboardEvent | MouseEvent): boolean {
  return isMac() ? event.metaKey : event.ctrlKey;
}

/**
 * Gets keyboard shortcut display text
 */
export function getShortcutText(keys: string[]): string {
  const modifier = getModifierKey();
  return keys.map(key => key === 'mod' ? modifier : key).join('+');
}

export interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    description: string
    category: 'navigation' | 'actions' | 'compose' | 'selection'
    action?: () => void
}

export const SHORTCUTS: KeyboardShortcut[] = [
    // Navigation
    { key: 'j', description: 'Move to next email', category: 'navigation' },
    { key: 'k', description: 'Move to previous email', category: 'navigation' },
    { key: 'g', shift: true, description: 'Go to Inbox', category: 'navigation' },
    { key: 's', shift: true, description: 'Go to Sent', category: 'navigation' },
    { key: 'd', shift: true, description: 'Go to Drafts', category: 'navigation' },
    { key: 'Escape', description: 'Go back / Close modal', category: 'navigation' },
    
    // Actions
    { key: 'r', description: 'Reply', category: 'actions' },
    { key: 'a', description: 'Reply All', category: 'actions' },
    { key: 'f', description: 'Forward', category: 'actions' },
    { key: 'e', description: 'Archive', category: 'actions' },
    { key: '#', shift: true, description: 'Delete', category: 'actions' },
    { key: 's', description: 'Star/Unstar', category: 'actions' },
    { key: 'm', description: 'Mark as read/unread', category: 'actions' },
    { key: '.', description: 'Refresh', category: 'actions' },
    
    // Compose
    { key: 'c', description: 'Compose new email', category: 'compose' },
    { key: 'Enter', ctrl: true, description: 'Send email', category: 'compose' },
    { key: 's', ctrl: true, description: 'Save draft', category: 'compose' },
    
    // Selection
    { key: 'x', description: 'Select/Deselect email', category: 'selection' },
    { key: 'a', ctrl: true, description: 'Select all', category: 'selection' },
    { key: 'a', ctrl: true, shift: true, description: 'Deselect all', category: 'selection' },
]

export const SHORTCUT_CATEGORIES = {
    navigation: { label: 'Navigation', order: 1 },
    actions: { label: 'Actions', order: 2 },
    compose: { label: 'Compose', order: 3 },
    selection: { label: 'Selection', order: 4 },
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.shift) parts.push('Shift')
    
    let key = shortcut.key
    if (key === ' ') key = 'Space'
    if (key === 'ArrowUp') key = '↑'
    if (key === 'ArrowDown') key = '↓'
    if (key === 'Escape') key = 'Esc'
    if (key === '#') key = '#'
    
    parts.push(key.toUpperCase())
    
    return parts.join(' + ')
}

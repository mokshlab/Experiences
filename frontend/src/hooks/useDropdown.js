/**
 * Custom hook for managing dropdown state
 */

import { useState, useEffect, useRef } from 'react'

/**
 * Hook for handling dropdown open/close with click outside detection
 * @returns {Object} Dropdown state and handlers
 */
export function useDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  /**
   * Toggle dropdown open/close
   */
  const toggle = () => setIsOpen(prev => !prev)

  /**
   * Open dropdown
   */
  const open = () => setIsOpen(true)

  /**
   * Close dropdown
   */
  const close = () => setIsOpen(false)

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return {
    isOpen,
    toggle,
    open,
    close,
    dropdownRef
  }
}

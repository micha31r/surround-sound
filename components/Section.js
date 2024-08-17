import React from "react"
import { twMerge } from "tailwind-merge"

/**
 * A flex wrapper component with predefined padding
 * @param {object} props - Component props
 * @param {string} props.className - Tailwind CSS classes
 * @param {string} props.classNameInner - Tailwind CSS classes for inner div
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} React component
 */
export default function Section ({ className, classNameInner, children }) {
  return (
    <div className={twMerge("w-screen flex px-4", className)}>
      <div className={twMerge("max-w-sm w-full flex flex-col mx-auto", classNameInner)}>{children}</div>
    </div>
  )
}
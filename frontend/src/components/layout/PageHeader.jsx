import React from 'react'

export default function PageHeader({ icon, title, subtitle, className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center">
          <div className="text-white w-6 h-6 flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

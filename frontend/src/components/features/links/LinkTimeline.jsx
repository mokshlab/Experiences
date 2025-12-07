'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiEdit2, FiPlus, FiX, FiCalendar, FiArrowLeft, FiTrash2 } from 'react-icons/fi'
import { CATEGORIES } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/common'

export default function LinkTimeline({ link, availableExperiences: initialAvailable }) {
  const router = useRouter()
  const [experiences, setExperiences] = useState(link.experienceLinks)
  const [availableExperiences, setAvailableExperiences] = useState(initialAvailable)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addingExpId, setAddingExpId] = useState(null)
  const [removingExpId, setRemovingExpId] = useState(null)
  const toast = useToast()

  const handleAddExperience = async (experienceId) => {
    setAddingExpId(experienceId)

    try {
      const experienceLink = await apiClient.links.addExperience(link.id, experienceId)
      setExperiences([...experiences, experienceLink])
      setAvailableExperiences(availableExperiences.filter(e => e.id !== experienceId))
      setShowAddModal(false)
      toast.success('Experience connected')
    } catch (error) {
      console.error('Error adding experience:', error)
      toast.error(error.message || 'Failed to add experience')
    } finally {
      setAddingExpId(null)
    }
  }

  const handleRemoveExperience = async (experienceId) => {
    setRemovingExpId(experienceId)

    try {
      await apiClient.links.removeExperience(link.id, experienceId)
      const removedExp = experiences.find(ec => ec.experience.id === experienceId)
      setExperiences(experiences.filter(ec => ec.experience.id !== experienceId))
      if (removedExp) {
        setAvailableExperiences([...availableExperiences, {
          id: removedExp.experience.id,
          title: removedExp.experience.title,
          date: removedExp.experience.date,
          category: removedExp.experience.category
        }])
      }
      toast.success('Experience disconnected')
    } catch (error) {
      console.error('Error removing experience:', error)
      toast.error(error.message || 'Failed to remove experience')
    } finally {
      setRemovingExpId(null)
    }
  }

  // Sort experiences by date for timeline
  const sortedExperiences = [...experiences].sort((a, b) => 
    new Date(a.experience.date) - new Date(b.experience.date)
  )

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8 relative">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Link
            href="/links"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs sm:text-sm">Neural Pathways</span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-xs sm:text-sm text-purple-400 truncate">{link.name}</span>
        </div>

        {/* Title Section */}
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6 lg:p-8 overflow-hidden">
          {/* Animated background glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-3xl"
            style={{ 
              background: `radial-gradient(circle at 30% 50%, ${link.color}, transparent 70%)`
            }}
          />
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="relative">
                <div
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl"
                  style={{ backgroundColor: `${link.color}30`, boxShadow: `0 0 30px ${link.color}50` }}
                >
                  🧠
                </div>
                <div
                  className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl animate-ping"
                  style={{ backgroundColor: link.color, opacity: 0.2 }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent truncate">
                    {link.name}
                  </h1>
                  <Link
                    href={`/links/${link.id}/edit`}
                    className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all transform hover:scale-110 flex-shrink-0"
                    title="Edit neural pathway"
                  >
                    <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </div>
                
                {link.description && (
                  <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">{link.description}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <span className="text-xl relative z-10">⚡</span>
                <span className="relative z-10">Connect Experience</span>
              </button>

              {/* Stats */}
              <div className="flex items-center gap-2 sm:gap-3 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 rounded-xl">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full animate-pulse flex-shrink-0" 
                    style={{ backgroundColor: link.color, boxShadow: `0 0 10px ${link.color}` }}
                  />
                  <span className="text-xs sm:text-sm text-gray-300">
                    <span className="font-bold text-white">{experiences.length}</span> neurons connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {sortedExperiences.length === 0 ? (
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center border border-white/10 overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-1/3 w-40 h-40 bg-pink-500 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
          
          <div className="relative z-10">
            <span className="text-5xl sm:text-7xl block mb-4 sm:mb-6 animate-bounce">🧠</span>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
              No Neurons Connected Yet
            </h2>
            <p className="text-gray-300 mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed max-w-md mx-auto px-4">
              Start building your neural pathway by connecting experiences. 
              Watch your memory timeline come to life!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-2xl hover:scale-105 text-base sm:text-lg"
            >
              <span className="text-lg sm:text-xl">⚡</span>
              Connect First Experience
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line - Neural Pathway */}
          <div
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1 rounded-full"
            style={{ backgroundColor: link.color, opacity: 0.3 }}
          />
          {/* Pulsing effect on timeline */}
          <div
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 sm:w-1 rounded-full animate-pulse"
            style={{ 
              background: `linear-gradient(to bottom, ${link.color}00, ${link.color}, ${link.color}00)`,
              opacity: 0.2 
            }}
          />

          {/* Timeline Items */}
          <div className="space-y-6 sm:space-y-8">
            {sortedExperiences.map((ec, index) => {
              const category = CATEGORIES.find(c => c.value === ec.experience.category)
              const date = new Date(ec.experience.date)

              return (
                <div key={ec.experience.id} className="relative pl-20 sm:pl-24 lg:pl-28 animate-fadeIn">
                  {/* Timeline Dot - Neuron */}
                  <div className="absolute left-[18px] sm:left-6 w-4 h-4 sm:w-5 sm:h-5">
                    <div
                      className="absolute inset-0 rounded-full border-2 sm:border-4 border-slate-900"
                      style={{ backgroundColor: link.color }}
                    />
                    {/* Synaptic pulse */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ backgroundColor: link.color, opacity: 0.4 }}
                    />
                  </div>

                  {/* Date Badge */}
                  <div className="absolute left-0 top-0 flex flex-col items-center" style={{ width: '4rem' }}>
                    <div 
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-2 py-1.5 text-center shadow-lg"
                      style={{ borderColor: `${link.color}40` }}
                    >
                      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: link.color }}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-lg sm:text-2xl font-bold text-white leading-none my-0.5">
                        {date.getDate()}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 font-semibold">
                        {date.getFullYear()}
                      </div>
                    </div>
                  </div>

                  {/* Experience Card */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group">
                    <div
                      className="h-0.5 sm:h-1"
                      style={{ backgroundColor: link.color }}
                    />
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Category Badge - Compact & Vibrant */}
                          <div className="inline-flex items-center gap-1.5 mb-2.5 group/category">
                            {/* Icon with vibrant glow */}
                            <div 
                              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center relative"
                              style={{ 
                                backgroundColor: category?.color,
                                boxShadow: `0 0 15px ${category?.color}60, 0 0 30px ${category?.color}30`
                              }}
                            >
                              <span className="text-white text-xs sm:text-sm">
                                {category?.icon ? <category.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : '📝'}
                              </span>
                            </div>
                            
                            {/* Compact label with bright background */}
                            <span 
                              className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white shadow-lg"
                              style={{ 
                                backgroundColor: category?.color,
                                boxShadow: `0 2px 8px ${category?.color}40`
                              }}
                            >
                              {category?.label || ec.experience.category}
                            </span>
                          </div>
                          
                          <Link
                            href={`/experiences/${ec.experience.id}`}
                            className="text-lg sm:text-xl font-semibold text-white group-hover:text-purple-400 transition-colors block break-words"
                          >
                            {ec.experience.title}
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemoveExperience(ec.experience.id)}
                          disabled={removingExpId === ec.experience.id}
                          className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all disabled:opacity-50 flex-shrink-0"
                          title="Disconnect neuron"
                        >
                          {removingExpId === ec.experience.id ? (
                            <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>
                      </div>

                      {ec.experience.content && (
                        <p className="text-gray-400 line-clamp-3 text-sm sm:text-base">
                          {ec.experience.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Connect Experience
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {availableExperiences.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl block mb-4">🧠</span>
                  <p className="text-gray-400 mb-4">
                    All your experiences are already connected to this neural pathway!
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all"
                  >
                    <FiPlus className="w-5 h-5" />
                    Create New Experience
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableExperiences.map((exp) => {
                    const category = CATEGORIES.find(c => c.value === exp.category)
                    const date = new Date(exp.date)

                    return (
                      <button
                        key={exp.id}
                        onClick={() => handleAddExperience(exp.id)}
                        disabled={addingExpId === exp.id}
                        className="w-full bg-white/5 hover:bg-white/10 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {category?.icon ? <category.icon /> : '📝'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold truncate">
                              {exp.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {date.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          {addingExpId === exp.id ? (
                            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiPlus className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                      </button>
                    )
                  })}

                  {/* Create New Experience CTA */}
                  <div className="pt-6 mt-6 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-4">
                        Not found the experience you're looking for?
                      </p>
                      <Link
                        href="/experiences/new"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                      >
                        <FiPlus className="w-5 h-5" />
                        Create New Experience
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

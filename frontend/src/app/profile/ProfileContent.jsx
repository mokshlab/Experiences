"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/common'
import { 
  FiUser, FiMail, FiLogOut, FiActivity, FiLink, FiStar, FiZap, FiHeart, FiCalendar, FiEdit2, FiSave, FiX, FiLock, FiGlobe, FiEyeOff, FiAlertTriangle, FiTrash2
} from 'react-icons/fi'

export default function ProfileContent({ user, experiencesCount, linksCount }) {
  const { logout } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(user.name || '')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isPublicProfile, setIsPublicProfile] = useState(user?.isPublic || false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const getAchievementLevel = () => {
    const total = experiencesCount + linksCount
    if (total >= 100) return { level: 'Legend', emoji: '🏆', color: 'from-yellow-400 to-orange-500' }
    if (total >= 50) return { level: 'Master', emoji: '⭐', color: 'from-purple-500 to-pink-500' }
    if (total >= 20) return { level: 'Explorer', emoji: '🌟', color: 'from-blue-500 to-purple-500' }
    if (total >= 5) return { level: 'Discoverer', emoji: '✨', color: 'from-green-500 to-blue-500' }
    return { level: 'Beginner', emoji: '🌱', color: 'from-pink-500 to-purple-500' }
  }

  const getMotivationalMessage = () => {
    if (experiencesCount === 0) return "Start capturing your journey today!"
    if (experiencesCount < 5) return "You're building something beautiful!"
    if (experiencesCount < 20) return "Your story is taking shape!"
    if (experiencesCount < 50) return "Amazing progress on your journey!"
    return "You're a true memory keeper!"
  }

  const achievement = getAchievementLevel()
  const nextMilestone = experiencesCount < 5 ? 5 : experiencesCount < 20 ? 20 : experiencesCount < 50 ? 50 : 100
  const progressToNext = ((experiencesCount / nextMilestone) * 100).toFixed(0)

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      toast.error('Name cannot be empty')
      return
    }
    
    setIsSaving(true)
    try {
      await apiClient.user.updateProfile({ name: editedName })
      toast.success('Name updated successfully!')
      setIsEditingName(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update name: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEditName = () => {
    setEditedName(user.name || '')
    setIsEditingName(false)
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all password fields')
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    
    setIsSaving(true)
    try {
      await apiClient.user.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      toast.success('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangingPassword(false)
    } catch (error) {
      toast.error('Failed to change password: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const handleTogglePublicProfile = async () => {
    const newValue = !isPublicProfile
    setIsPublicProfile(newValue)
    
    try {
      await apiClient.user.updateProfile({ isPublic: newValue })
      toast.success(newValue ? 'Profile is now public' : 'Profile is now private')
      // Refresh the page to get updated user data from server
      router.refresh()
    } catch (error) {
      // Revert on error
      setIsPublicProfile(!newValue)
      toast.error('Failed to update profile visibility: ' + error.message)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm account deletion')
      return
    }
    
    setIsDeleting(true)
    try {
      await apiClient.user.deleteAccount({ password: deletePassword })
      toast.info('Your account has been permanently deleted.')
      await logout()
    } catch (error) {
      toast.error('Failed to delete account: ' + error.message)
    } finally {
      setIsDeleting(false)
      setDeletePassword('')
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hey {user.name?.split(' ')[0] || 'Explorer'}!
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {getMotivationalMessage()}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
            {/* Animated gradient header */}
            <div className="h-40 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              <div className="absolute inset-0 bg-black/5"></div>
              {/* Floating particles effect */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-white/40 dark:bg-slate-700/40 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-3 h-3 bg-white/30 dark:bg-slate-700/30 rounded-full animate-pulse delay-100"></div>
              <div className="absolute bottom-6 right-6 w-2 h-2 bg-white/40 dark:bg-slate-700/40 rounded-full animate-pulse delay-200"></div>
            </div>

            {/* Profile Content */}
            <div className="relative px-6 pb-6">
              {/* Avatar with ring effect */}
              <div className="relative -mt-20 mb-6 group">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-purple-600 p-1 shadow-2xl animate-gradient-slow">
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <FiUser className="w-14 h-14 text-white" />
                    </div>
                  </div>
                </div>
                {/* Achievement badge */}
                <div className={`absolute -bottom-2 -right-2 bg-gradient-to-br ${achievement.color} rounded-full p-2.5 shadow-lg border-4 border-white dark:border-zinc-900 animate-pulse`}>
                  <div className="text-xl leading-none">{achievement.emoji}</div>
                </div>
              </div>

              {/* Journey Stats */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800/30">
                    <FiZap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                      Level: {achievement.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiCalendar className="w-4 h-4" />
                    <span>Since {new Date(user.createdAt || Date.now()).getFullYear()}</span>
                  </div>
                </div>
                {/* Next milestone progress */}
                {experiencesCount < 100 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Next milestone: {nextMilestone} experiences</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{progressToNext}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progressToNext}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                {/* Celebration banner for milestones */}
                {(experiencesCount === 5 || experiencesCount === 20 || experiencesCount === 50 || experiencesCount === 100) && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700/50 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎉</span>
                      <div>
                        <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                          Milestone Achieved!
                        </p>
                        <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                          You've captured {experiencesCount} experiences. Keep going!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Editable Name Field */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Full name
                      </div>
                      {isEditingName ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="w-full text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-zinc-900 px-2 py-1 rounded border border-purple-300 dark:border-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          disabled={isSaving}
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name || 'Explorer'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isEditingName ? (
                        <>
                          <button
                            onClick={handleUpdateName}
                            disabled={isSaving}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors disabled:opacity-50"
                            title="Save"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancelEditName}
                            disabled={isSaving}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingName(true)}
                          className="p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                          title="Edit name"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Email (non-editable) */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Account email
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.email}
                    </div>
                  </div>
                </div>
                
                {/* Public Profile Toggle */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-200 dark:border-indigo-800/30">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isPublicProfile 
                          ? 'from-green-500 to-emerald-500' 
                          : 'from-gray-500 to-slate-500'
                      }`}>
                        {isPublicProfile ? (
                          <FiGlobe className="w-5 h-5 text-white" />
                        ) : (
                          <FiEyeOff className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Profile visibility
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {isPublicProfile ? 'Public profile' : 'Private profile'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {isPublicProfile 
                            ? 'Your experiences are visible on Explore' 
                            : 'Only you can see your experiences'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleTogglePublicProfile}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isPublicProfile ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      role="switch"
                      aria-checked={isPublicProfile}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          isPublicProfile ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Password Change Section */}
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700">
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="w-full flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                        <FiLock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Security
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Change password
                        </div>
                      </div>
                      <FiEdit2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiLock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">Change Password</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                          }}
                          className="p-1 rounded text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="password"
                        placeholder="Current password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isSaving}
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isSaving}
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={isSaving}
                      />
                      <button
                        onClick={handleChangePassword}
                        disabled={isSaving}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Action CTA */}
              {experiencesCount < 3 && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/30">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Ready to capture your first moments?
                  </p>
                  <button
                    onClick={() => router.push('/experiences/new')}
                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    Create Your First Experience
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          {/* Metrics */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 shadow-lg">
              <div className="mb-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Impact
                </h3>
                <span className="sr-only">Rocket animation</span>
                <span aria-hidden="true" className="rocket-fly w-6 h-6">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                    <path d="M12 2c0 0-1 2-3 4s-4 3-4 3 1 3 3 5 5 3 5 3 1-3 3-5 4-3 4-3-2-2-4-3S12 2 12 2z" fill="currentColor" className="text-pink-500 dark:text-pink-400"/>
                    <path d="M7 17c1 1 3 1 4 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600 dark:text-purple-400"/>
                    <g className="rocket-flame">
                      <path d="M5 20c1-1 2-1 3 0s2 1 3 0" fill="currentColor" className="text-orange-400"/>
                    </g>
                  </svg>
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Every moment counts
              </p>
            </div>
            <div className="space-y-3.5">
              {/* Experiences Card */}
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100/80 via-purple-50/50 to-purple-100/60 dark:from-purple-900/30 dark:via-purple-900/20 dark:to-purple-900/25 px-5 py-4 border border-purple-200/40 dark:border-purple-800/30 shadow-sm hover:shadow-md hover:border-purple-300/60 dark:hover:border-purple-700/50 transition-all duration-300 cursor-pointer group text-left"
              >
                {/* Background decorative circle */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-200/30 dark:bg-purple-700/20 group-hover:bg-purple-300/40 dark:group-hover:bg-purple-600/30 transition-colors duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <FiActivity className="w-7 h-7 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-5xl font-bold text-purple-600 dark:text-purple-400 leading-none">
                      {experiencesCount}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-purple-700 dark:text-purple-300 mb-0.5 group-hover:text-purple-800 dark:group-hover:text-purple-200 transition-colors">
                      Experiences
                    </h4>
                    <p className="text-sm text-purple-600/80 dark:text-purple-400/80 mb-3">
                      Life moments captured
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-purple-200/50 dark:bg-purple-900/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (experiencesCount / 50) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </button>
              
              {/* Memory Links Card */}
              <button
                onClick={() => router.push('/links')}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100/80 via-pink-50/50 to-pink-100/60 dark:from-pink-900/30 dark:via-pink-900/20 dark:to-pink-900/25 px-5 py-4 border border-pink-200/40 dark:border-pink-800/30 shadow-sm hover:shadow-md hover:border-pink-300/60 dark:hover:border-pink-700/50 transition-all duration-300 cursor-pointer group text-left"
              >
                {/* Background decorative circle */}
                <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-pink-200/30 dark:bg-pink-700/20 group-hover:bg-pink-300/40 dark:group-hover:bg-pink-600/30 transition-colors duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <FiLink className="w-7 h-7 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-5xl font-bold text-pink-600 dark:text-pink-400 leading-none">
                      {linksCount}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-pink-700 dark:text-pink-300 mb-0.5 group-hover:text-pink-800 dark:group-hover:text-pink-200 transition-colors">
                      Memory Links
                    </h4>
                    <p className="text-sm text-pink-600/80 dark:text-pink-400/80 mb-3">
                      Connections made
                    </p>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-pink-200/50 dark:bg-pink-900/40 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, (linksCount / 20) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Session Management */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              Your progress is automatically saved. You can safely close this tab anytime.
            </p>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
            >
              {isLoggingOut ? (
                <>
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Ending session...</span>
                </>
              ) : (
                <>
                  <FiLogOut className="w-3 h-3" />
                  <span>End Session</span>
                </>
              )}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <FiAlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
                Danger Zone
              </h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white transition-all border-2 border-red-200 dark:border-red-900/50 hover:bg-red-600 dark:hover:bg-red-600 hover:border-red-600"
            >
              <FiTrash2 className="w-3 h-3" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-red-200 dark:border-red-900/50 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Delete Account?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This action is permanent
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-900 dark:text-red-200 font-medium mb-2">
                ⚠️ You will permanently lose:
              </p>
              <ul className="text-sm text-red-800 dark:text-red-300 space-y-1 ml-4">
                <li>• {experiencesCount} experience{experiencesCount !== 1 ? 's' : ''}</li>
                <li>• {linksCount} memory link{linksCount !== 1 ? 's' : ''}</li>
                <li>• All reflections and comments</li>
                <li>• Your account and profile data</li>
              </ul>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter your password to confirm:
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                disabled={isDeleting}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !deletePassword.trim()}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete Forever'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

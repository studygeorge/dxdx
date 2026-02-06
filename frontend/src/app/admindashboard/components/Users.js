'use client'
import { useState, useEffect, useRef } from 'react'

const API_BASE_URL = 'https://dxcapital-ai.com'

const SALESPEOPLE = ['Фортунатус', 'Мохаммед', 'Эльвира']
const REFERRAL_SOURCES = ['Cетевики', 'Реклама, блогеры', 'Самостоятельно']

export default function Users({ isMobile }) {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [kycPhotoData, setKycPhotoData] = useState(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [kycVideoData, setKycVideoData] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)

  const [assigningUserId, setAssigningUserId] = useState(null)
  const [assigningSourceUserId, setAssigningSourceUserId] = useState(null)
  const dropdownRef = useRef(null)
  const sourceDropdownRef = useRef(null)

  const [filterKYC, setFilterKYC] = useState('all')
  const [filterInvestments, setFilterInvestments] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')

  const [editingNotes, setEditingNotes] = useState(false)
  const [notesData, setNotesData] = useState({
    calendarNote: '',
    adminComment: '',
    adminTask: '',
    taskDate: ''
  })
  const [savingNotes, setSavingNotes] = useState(false)

  const getKYCStatusLabel = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрено'
      case 'PENDING':
        return 'Ожидает'
      case 'REJECTED':
        return 'Отклонено'
      case 'NOT_SUBMITTED':
        return 'Не отправлено'
      default:
        return 'Неизвестно'
    }
  }

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'rgba(45, 212, 191, 0.15)',
          border: 'rgba(45, 212, 191, 0.3)',
          text: '#2dd4bf'
        }
      case 'PENDING':
        return {
          bg: 'rgba(234, 179, 8, 0.15)',
          border: 'rgba(234, 179, 8, 0.3)',
          text: '#eab308'
        }
      case 'REJECTED':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.3)',
          text: '#ef4444'
        }
      case 'NOT_SUBMITTED':
        return {
          bg: 'rgba(156, 163, 175, 0.15)',
          border: 'rgba(156, 163, 175, 0.3)',
          text: '#9ca3af'
        }
      default:
        return {
          bg: 'rgba(156, 163, 175, 0.15)',
          border: 'rgba(156, 163, 175, 0.3)',
          text: '#9ca3af'
        }
    }
  }

  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null
    const parts = dateString.split('.')
    if (parts.length !== 3) return null
    const [day, month, year] = parts
    return new Date(`${year}-${month}-${day}`)
  }

  const fetchUsers = async (page = 1, search = '', kycFilter = 'all', investmentFilter = 'all', sort = 'createdAt') => {
    setUsersLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (search) {
        params.append('search', search)
      }

      if (kycFilter !== 'all') {
        params.append('kycStatus', kycFilter)
      }

      if (investmentFilter !== 'all') {
        params.append('hasInvestments', investmentFilter)
      }

      if (sort) {
        params.append('sortBy', sort)
      }

      console.log('Fetching users with params:', params.toString())

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Users fetched:', data.data.users.length)
        setUsers(data.data.users)
        setPagination(data.data.pagination)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  const fetchUserDetails = async (userId) => {
    setUserDetailsLoading(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User details:', data.data)
        setSelectedUser(data.data)
        
        setNotesData({
          calendarNote: data.data.user.calendarNote || '',
          adminComment: data.data.user.adminComment || '',
          adminTask: data.data.user.adminTask || '',
          taskDate: data.data.user.taskDate ? formatDateForInput(data.data.user.taskDate) : ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error)
    } finally {
      setUserDetailsLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedUser) return
    
    setSavingNotes(true)
    const token = localStorage.getItem('admin_access_token')

    try {
      const taskDateObj = parseDateFromInput(notesData.taskDate)
      
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/${selectedUser.user.id}/update-notes`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            calendarNote: notesData.calendarNote || null,
            adminComment: notesData.adminComment || null,
            adminTask: notesData.adminTask || null,
            taskDate: taskDateObj ? taskDateObj.toISOString() : null
          })
        }
      )

      if (response.ok) {
        setEditingNotes(false)
        fetchUserDetails(selectedUser.user.id)
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error || 'Failed to save notes'}`)
      }
    } catch (error) {
      console.error('Error saving notes:', error)
      alert('Ошибка сохранения заметок')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleAssignSalesperson = async (userId, salesperson) => {
    try {
      const token = localStorage.getItem('admin_access_token')
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/${userId}/assign-salesperson`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ salesperson: salesperson || null })
        }
      )

      if (response.ok) {
        fetchUsers(currentPage, searchQuery, filterKYC, filterInvestments, sortBy)
        if (selectedUser && selectedUser.user.id === userId) {
          fetchUserDetails(userId)
        }
        setAssigningUserId(null)
      }
    } catch (error) {
      console.error('Ошибка назначения продажника:', error)
    }
  }

  const handleAssignReferralSource = async (userId, source) => {
    try {
      const token = localStorage.getItem('admin_access_token')
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/${userId}/update-referral-source`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ referralSource: source || null })
        }
      )

      if (response.ok) {
        fetchUsers(currentPage, searchQuery, filterKYC, filterInvestments, sortBy)
        if (selectedUser && selectedUser.user.id === userId) {
          fetchUserDetails(userId)
        }
        setAssigningSourceUserId(null)
      }
    } catch (error) {
      console.error('Ошибка установки источника привлечения:', error)
    }
  }

  const loadKYCPhoto = async (photoUrl) => {
    setPhotoLoading(true)
    setIsPhotoModalOpen(true)
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })

    const token = localStorage.getItem('admin_access_token')
    const filename = photoUrl.split('/').pop()
    
    console.log('Loading KYC photo:', {
      originalUrl: photoUrl,
      filename: filename,
      token: token ? 'present' : 'missing'
    })

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/kyc/photo/${filename}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      )

      console.log('KYC photo response:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      })

      if (response.ok) {
        const blob = await response.blob()
        const dataUrl = URL.createObjectURL(blob)
        setKycPhotoData(dataUrl)
        console.log('KYC photo loaded successfully')
      } else {
        const errorText = await response.text()
        console.error('Failed to load KYC photo:', {
          status: response.status,
          error: errorText
        })
        alert(`Не удалось загрузить фото. Код ошибки: ${response.status}`)
        setIsPhotoModalOpen(false)
      }
    } catch (error) {
      console.error('Error loading KYC photo:', error)
      alert('Ошибка загрузки фото: ' + error.message)
      setIsPhotoModalOpen(false)
    } finally {
      setPhotoLoading(false)
    }
  }

  const loadKYCVideo = async (videoUrl) => {
    setVideoLoading(true)
    setIsVideoModalOpen(true)

    const token = localStorage.getItem('admin_access_token')
    const filename = videoUrl.split('/').pop()
    
    console.log('Loading KYC video:', {
      originalUrl: videoUrl,
      filename: filename
    })

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/kyc/video/${filename}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      )

      console.log('Video response:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      })

      if (response.ok) {
        const blob = await response.blob()
        console.log('Video blob:', {
          size: blob.size,
          type: blob.type
        })
        
        const dataUrl = URL.createObjectURL(blob)
        setKycVideoData(dataUrl)
        console.log('KYC video loaded successfully:', dataUrl)
      } else {
        const errorText = await response.text()
        console.error('Failed to load KYC video:', {
          status: response.status,
          error: errorText
        })
        alert(`Не удалось загрузить видео. Код ошибки: ${response.status}`)
        setIsVideoModalOpen(false)
      }
    } catch (error) {
      console.error('Error loading KYC video:', error)
      alert('Ошибка загрузки видео: ' + error.message)
      setIsVideoModalOpen(false)
    } finally {
      setVideoLoading(false)
    }
  }

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false)
    if (kycPhotoData) {
      URL.revokeObjectURL(kycPhotoData)
    }
    setKycPhotoData(null)
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  const closeVideoModal = () => {
    setIsVideoModalOpen(false)
    if (kycVideoData) {
      URL.revokeObjectURL(kycVideoData)
    }
    setKycVideoData(null)
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoomLevel(prev => Math.max(0.5, Math.min(5, prev + delta)))
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const copyImageToClipboard = async () => {
    if (!kycPhotoData) return

    try {
      const response = await fetch(kycPhotoData)
      const blob = await response.blob()
      
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ])
      
      alert('Изображение скопировано в буфер обмена')
    } catch (error) {
      console.error('Error copying image:', error)
      alert('Не удалось скопировать изображение')
    }
  }

  const downloadImage = () => {
    if (!kycPhotoData) return

    const link = document.createElement('a')
    link.href = kycPhotoData
    link.download = `kyc_document_${selectedUser.user.id}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadVideo = () => {
    if (!kycVideoData) return

    const link = document.createElement('a')
    link.href = kycVideoData
    link.download = `kyc_video_${selectedUser.user.id}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleApproveKYC = async (userId) => {
    if (!confirm('Одобрить KYC для этого пользователя?\n\nБудут одобрены ОБА документа: фото и видео.')) return

    const token = localStorage.getItem('admin_access_token')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/kyc/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        fetchUserDetails(userId)
        closePhotoModal()
        closeVideoModal()
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error || 'Failed to approve KYC'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Ошибка одобрения KYC')
    }
  }

  const handleRejectKYC = async (userId) => {
    const reason = prompt('Укажите причину отклонения:\n(Пользователь сможет повторно пройти KYC)')
    if (!reason) return

    const token = localStorage.getItem('admin_access_token')
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/kyc/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })
      
      if (response.ok) {
        fetchUserDetails(userId)
        closePhotoModal()
        closeVideoModal()
      } else {
        const error = await response.json()
        alert(`Ошибка: ${error.error || 'Failed to reject KYC'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Ошибка отклонения KYC')
    }
  }

  useEffect(() => {
    fetchUsers(1, searchQuery, filterKYC, filterInvestments, sortBy)
  }, [])

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, filterKYC, filterInvestments, sortBy)
  }, [filterKYC, filterInvestments, sortBy])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, zoomLevel])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAssigningUserId(null)
      }
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target)) {
        setAssigningSourceUserId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchUsers(1, searchQuery, filterKYC, filterInvestments, sortBy)
  }

  const handleUserClick = (userId) => {
    fetchUserDetails(userId)
  }

  const closeUserDetails = () => {
    setSelectedUser(null)
    setEditingNotes(false)
    setNotesData({
      calendarNote: '',
      adminComment: '',
      adminTask: '',
      taskDate: ''
    })
  }

  const KYCPhotoModal = () => {
    if (!isPhotoModalOpen) return null

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePhotoModal()
        }}
      >
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10000
        }}>
          <button onClick={handleZoomOut} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>-</button>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', minWidth: '60px', textAlign: 'center' }}>{Math.round(zoomLevel * 100)}%</div>
          <button onClick={handleZoomIn} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '8px', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>+</button>
          <button onClick={handleResetZoom} style={{ padding: '8px 16px', background: 'rgba(45, 212, 191, 0.2)', border: '1px solid rgba(45, 212, 191, 0.5)', borderRadius: '8px', color: '#2dd4bf', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>Сбросить</button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.3)', margin: '0 8px' }} />
          <button onClick={copyImageToClipboard} disabled={!kycPhotoData} style={{ padding: '8px 16px', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid rgba(234, 179, 8, 0.5)', borderRadius: '8px', color: '#eab308', fontSize: '13px', fontWeight: '600', cursor: kycPhotoData ? 'pointer' : 'not-allowed', opacity: kycPhotoData ? 1 : 0.5 }}>Копировать</button>
          <button onClick={downloadImage} disabled={!kycPhotoData} style={{ padding: '8px 16px', background: 'rgba(45, 212, 191, 0.2)', border: '1px solid rgba(45, 212, 191, 0.5)', borderRadius: '8px', color: '#2dd4bf', fontSize: '13px', fontWeight: '600', cursor: kycPhotoData ? 'pointer' : 'not-allowed', opacity: kycPhotoData ? 1 : 0.5 }}>Скачать</button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.3)', margin: '0 8px' }} />
          <button onClick={closePhotoModal} style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Закрыть</button>
        </div>

        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }} onWheel={handleWheel}>
          {photoLoading ? (
            <div style={{ color: '#2dd4bf', fontSize: '18px', fontWeight: '600' }}>Загрузка изображения...</div>
          ) : kycPhotoData ? (
            <img ref={imageRef} src={kycPhotoData} alt="KYC Document" onMouseDown={handleMouseDown} style={{ maxWidth: zoomLevel === 1 ? '90%' : 'none', maxHeight: zoomLevel === 1 ? '90%' : 'none', width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto', height: 'auto', transform: `translate(${position.x}px, ${position.y}px)`, transition: isDragging ? 'none' : 'transform 0.1s ease-out', userSelect: 'none', pointerEvents: 'auto' }} draggable={false} />
          ) : (
            <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: '600' }}>Не удалось загрузить изображение</div>
          )}
        </div>
      </div>
    )
  }

  const KYCVideoModal = () => {
    if (!isVideoModalOpen) return null

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeVideoModal()
        }}
      >
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '16px',
          padding: '12px 20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10001,
          pointerEvents: 'auto'
        }}>
          <button 
            onClick={downloadVideo} 
            disabled={!kycVideoData} 
            style={{ 
              padding: '8px 16px', 
              background: 'rgba(45, 212, 191, 0.2)', 
              border: '1px solid rgba(45, 212, 191, 0.5)', 
              borderRadius: '8px', 
              color: '#2dd4bf', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: kycVideoData ? 'pointer' : 'not-allowed', 
              opacity: kycVideoData ? 1 : 0.5 
            }}
          >
            Скачать видео
          </button>
          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.3)', margin: '0 8px' }} />
          <button 
            onClick={closeVideoModal} 
            style={{ 
              padding: '8px 16px', 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.5)', 
              borderRadius: '8px', 
              color: '#ef4444', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            Закрыть
          </button>
        </div>

        <div 
          style={{ 
            width: '100%', 
            maxWidth: '900px', 
            height: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            pointerEvents: 'auto',
            zIndex: 10000
          }}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {videoLoading ? (
            <div style={{ color: '#2dd4bf', fontSize: '18px', fontWeight: '600' }}>
              Загрузка видео...
            </div>
          ) : kycVideoData ? (
            <video
              src={kycVideoData}
              controls
              playsInline
              preload="metadata"
              style={{
                width: '100%',
                maxHeight: '80vh',
                borderRadius: '12px',
                boxShadow: '0 0 40px rgba(45, 212, 191, 0.3)',
                outline: 'none'
              }}
              onError={(e) => {
                console.error('Video playback error:', e)
                alert('Ошибка воспроизведения видео. Попробуйте скачать файл.')
              }}
            />
          ) : (
            <div style={{ color: '#ef4444', fontSize: '18px', fontWeight: '600' }}>
              Не удалось загрузить видео
            </div>
          )}
        </div>

        {kycVideoData && !videoLoading && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            padding: '12px 24px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '13px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 10000
          }}>
            Используйте встроенные элементы управления видео для воспроизведения
          </div>
        )}
      </div>
    )
  }

  if (selectedUser) {
    return (
      <div>
        <KYCPhotoModal />
        <KYCVideoModal />

        <button
          onClick={closeUserDetails}
          style={{
            marginBottom: '24px',
            padding: '12px 24px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#2dd4bf',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Назад к списку пользователей
        </button>

        {userDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#2dd4bf' }}>
            Загрузка данных пользователя...
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                Информация о пользователе
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Email</div>
                  <div style={{ color: 'white', fontSize: '16px' }}>{selectedUser.user.email}</div>
                </div>
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Имя</div>
                  <div style={{ color: 'white', fontSize: '16px' }}>
                    {selectedUser.user.firstName} {selectedUser.user.lastName}
                  </div>
                </div>

                {selectedUser.user.phoneNumber && (
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>
                      Номер телефона
                    </div>
                    <div style={{ color: 'white', fontSize: '16px' }}>
                      {selectedUser.user.phoneNumber}
                    </div>
                  </div>
                )}

                {selectedUser.user.telegramUsername && (
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>
                       Telegram
                    </div>
                    <a 
                      href={`https://t.me/${selectedUser.user.telegramUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#2dd4bf',
                        fontSize: '16px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#14b8a6'
                        e.target.style.textDecoration = 'underline'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#2dd4bf'
                        e.target.style.textDecoration = 'none'
                      }}
                    >
                      @{selectedUser.user.telegramUsername}
                    </a>
                  </div>
                )}

                {selectedUser.user.telegramId && (
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>
                      Telegram ID
                    </div>
                    <div style={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px',
                      fontFamily: 'monospace'
                    }}>
                      {selectedUser.user.telegramId}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>
                    Откуда пришел клиент
                  </div>
                  <div style={{ position: 'relative' }} ref={assigningSourceUserId === selectedUser.user.id ? sourceDropdownRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setAssigningSourceUserId(assigningSourceUserId === selectedUser.user.id ? null : selectedUser.user.id)
                      }}
                      style={{
                        padding: '8px 16px',
                        background: selectedUser.user.referralSource ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: selectedUser.user.referralSource ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: selectedUser.user.referralSource ? '#2dd4bf' : 'rgba(255, 255, 255, 0.6)',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedUser.user.referralSource || 'Установить источник'}
                    </button>
                    {assigningSourceUserId === selectedUser.user.id && (
                      <div style={{
                        position: 'absolute',
                        zIndex: 100,
                        marginTop: '4px',
                        width: '220px',
                        background: 'rgba(30, 30, 30, 0.98)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                      }}>
                        {selectedUser.user.referralSource && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignReferralSource(selectedUser.user.id, null)
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 14px',
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            Снять источник
                          </button>
                        )}
                        {REFERRAL_SOURCES.map((source) => (
                          <button
                            key={source}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignReferralSource(selectedUser.user.id, source)
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '10px 14px',
                              background: selectedUser.user.referralSource === source ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                              border: 'none',
                              color: selectedUser.user.referralSource === source ? '#2dd4bf' : 'rgba(255, 255, 255, 0.8)',
                              fontSize: '13px',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedUser.user.referralSource !== source) {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedUser.user.referralSource !== source) {
                                e.target.style.background = 'transparent'
                              }
                            }}
                          >
                            {source}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Реферальный код</div>
                  <div style={{ color: '#2dd4bf', fontSize: '16px', fontFamily: 'monospace' }}>
                    {selectedUser.user.referralCode}
                  </div>
                </div>
                
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>
                    Сумма инвестиций
                  </div>
                  <div style={{ color: '#2dd4bf', fontSize: '20px', fontWeight: '600' }}>
                    ${selectedUser.user.totalInvested?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Активные инвестиции</div>
                  <div style={{ color: 'white', fontSize: '16px' }}>{selectedUser.user.activeInvestments}</div>
                </div>
                
                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Статус KYC</div>
                  {(() => {
                    const colors = getKYCStatusColor(selectedUser.user.kycStatus || 'NOT_SUBMITTED')
                    return (
                      <span style={{
                        padding: '4px 12px',
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        color: colors.text,
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getKYCStatusLabel(selectedUser.user.kycStatus || 'NOT_SUBMITTED')}
                      </span>
                    )
                  })()}
                </div>

                <div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Статус аккаунта</div>
                  <span style={{
                    padding: '4px 12px',
                    background: selectedUser.user.isActive ? 'rgba(45, 212, 191, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: selectedUser.user.isActive ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: selectedUser.user.isActive ? '#2dd4bf' : '#ef4444',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {selectedUser.user.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600' }}>
                  Заметки администратора
                </h3>
                {!editingNotes ? (
                  <button
                    onClick={() => setEditingNotes(true)}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(45, 212, 191, 0.15)',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      borderRadius: '8px',
                      color: '#2dd4bf',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(45, 212, 191, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(45, 212, 191, 0.15)'
                    }}
                  >
                    Редактировать
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      style={{
                        padding: '10px 20px',
                        background: 'rgba(45, 212, 191, 0.15)',
                        border: '1px solid rgba(45, 212, 191, 0.3)',
                        borderRadius: '8px',
                        color: '#2dd4bf',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: savingNotes ? 'not-allowed' : 'pointer',
                        opacity: savingNotes ? 0.6 : 1,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!savingNotes) e.target.style.background = 'rgba(45, 212, 191, 0.25)'
                      }}
                      onMouseLeave={(e) => {
                        if (!savingNotes) e.target.style.background = 'rgba(45, 212, 191, 0.15)'
                      }}
                    >
                      {savingNotes ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingNotes(false)
                        setNotesData({
                          calendarNote: selectedUser.user.calendarNote || '',
                          adminComment: selectedUser.user.adminComment || '',
                          adminTask: selectedUser.user.adminTask || '',
                          taskDate: selectedUser.user.taskDate ? formatDateForInput(selectedUser.user.taskDate) : ''
                        })
                      }}
                      style={{
                        padding: '10px 20px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.25)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    Заметка календаря
                  </div>
                  {editingNotes ? (
                    <textarea
                      value={notesData.calendarNote}
                      onChange={(e) => setNotesData({ ...notesData, calendarNote: e.target.value })}
                      placeholder="Добавить заметку..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '150px',
                        fontFamily: 'inherit'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      flex: 1,
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px', 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px',
                      lineHeight: '1.6',
                      minHeight: '150px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedUser.user.calendarNote || <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Нет заметки</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    Комментарий администратора
                  </div>
                  {editingNotes ? (
                    <textarea
                      value={notesData.adminComment}
                      onChange={(e) => setNotesData({ ...notesData, adminComment: e.target.value })}
                      placeholder="Добавить комментарий..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '150px',
                        fontFamily: 'inherit'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      flex: 1,
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px', 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px',
                      lineHeight: '1.6',
                      minHeight: '150px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedUser.user.adminComment || <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Нет комментария</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    Задача
                  </div>
                  {editingNotes ? (
                    <textarea
                      value={notesData.adminTask}
                      onChange={(e) => setNotesData({ ...notesData, adminTask: e.target.value })}
                      placeholder="Добавить задачу..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '150px',
                        fontFamily: 'inherit'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      flex: 1,
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px', 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px',
                      lineHeight: '1.6',
                      minHeight: '150px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedUser.user.adminTask || <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Нет задачи</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                    Дата задачи (ДД.ММ.ГГГГ)
                  </div>
                  {editingNotes ? (
                    <input
                      type="text"
                      value={notesData.taskDate}
                      onChange={(e) => setNotesData({ ...notesData, taskDate: e.target.value })}
                      placeholder="01.01.2025"
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px', 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '14px'
                    }}>
                      {selectedUser.user.taskDate ? formatDateForInput(selectedUser.user.taskDate) : <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Дата не указана</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedUser.user.kycStatus && selectedUser.user.kycStatus !== 'NOT_SUBMITTED' && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  KYC Верификация
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Статус</div>
                    {(() => {
                      const colors = getKYCStatusColor(selectedUser.user.kycStatus)
                      return (
                        <span style={{
                          padding: '6px 14px',
                          background: colors.bg,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '8px',
                          color: colors.text,
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getKYCStatusLabel(selectedUser.user.kycStatus)}
                        </span>
                      )
                    })()}
                  </div>
                  
                  {selectedUser.user.kycSubmittedAt && (
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Отправлено</div>
                      <div style={{ color: 'white', fontSize: '14px' }}>
                        {new Date(selectedUser.user.kycSubmittedAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  )}

                  {selectedUser.user.kycProcessedAt && (
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '4px' }}>Обработано</div>
                      <div style={{ color: 'white', fontSize: '14px' }}>
                        {new Date(selectedUser.user.kycProcessedAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {selectedUser.user.kycPhotoUrl && (
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '8px' }}>Фото документа</div>
                      <div
                        onClick={() => loadKYCPhoto(selectedUser.user.kycPhotoUrl)}
                        style={{
                          width: '100%',
                          height: '180px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '2px dashed rgba(45, 212, 191, 0.3)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(45, 212, 191, 0.6)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border = '2px dashed rgba(45, 212, 191, 0.3)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <div style={{ textAlign: 'center', color: '#2dd4bf', fontSize: '14px', fontWeight: '600' }}>
                          <div style={{ fontSize: '40px', marginBottom: '8px' }}>Просмотр</div>
                          <div>Нажмите для просмотра</div>
                          {selectedUser.user.kycPhotoTakenAt && (
                            <div style={{ fontSize: '11px', color: 'rgba(45, 212, 191, 0.6)', marginTop: '4px' }}>
                              {new Date(selectedUser.user.kycPhotoTakenAt).toLocaleString('ru-RU')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.user.kycVideoUrl && (
                    <div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '8px' }}>Видео верификация</div>
                      <div
                        onClick={() => loadKYCVideo(selectedUser.user.kycVideoUrl)}
                        style={{
                          width: '100%',
                          height: '180px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '2px dashed rgba(234, 179, 8, 0.3)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.border = '2px solid rgba(234, 179, 8, 0.6)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.border = '2px dashed rgba(234, 179, 8, 0.3)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <div style={{ textAlign: 'center', color: '#eab308', fontSize: '14px', fontWeight: '600' }}>
                          <div style={{ fontSize: '40px', marginBottom: '8px' }}>Воспроизведение</div>
                          <div>Нажмите для просмотра</div>
                          {selectedUser.user.kycVideoTakenAt && (
                            <div style={{ fontSize: '11px', color: 'rgba(234, 179, 8, 0.6)', marginTop: '4px' }}>
                              {new Date(selectedUser.user.kycVideoTakenAt).toLocaleString('ru-RU')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedUser.user.kycRejectionReason && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ color: '#ef4444', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                      Причина отклонения
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                      {selectedUser.user.kycRejectionReason}
                    </div>
                  </div>
                )}

                {selectedUser.user.kycStatus === 'PENDING' && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleApproveKYC(selectedUser.user.id)}
                      style={{
                        padding: '12px 24px',
                        background: 'rgba(45, 212, 191, 0.15)',
                        border: '1px solid rgba(45, 212, 191, 0.3)',
                        borderRadius: '12px',
                        color: '#2dd4bf',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(45, 212, 191, 0.25)'
                        e.target.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(45, 212, 191, 0.15)'
                        e.target.style.transform = 'translateY(0)'
                      }}
                    >
                      Одобрить KYC
                    </button>
                    
                    <button
                      onClick={() => handleRejectKYC(selectedUser.user.id)}
                      style={{
                        padding: '12px 24px',
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '12px',
                        color: '#ef4444',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.25)'
                        e.target.style.transform = 'translateY(-2px)'
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.15)'
                        e.target.style.transform = 'translateY(0)'
                      }}
                    >
                      Отклонить KYC
                    </button>
                  </div>
                )}
              </div>
            )}

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                Инвестиции ({selectedUser.investments.length})
              </h3>
              {selectedUser.investments.length === 0 ? (
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '40px' }}>
                  Пока нет инвестиций
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedUser.investments.map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
                            ${Number(inv.amount).toFixed(2)}
                          </div>
                          <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '13px' }}>
                            {inv.package.name} - {inv.package.duration} дней
                          </div>
                        </div>
                        <span style={{
                          padding: '4px 12px',
                          background: inv.status === 'ACTIVE' ? 'rgba(45, 212, 191, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                          border: inv.status === 'ACTIVE' ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(156, 163, 175, 0.3)',
                          borderRadius: '6px',
                          color: inv.status === 'ACTIVE' ? '#2dd4bf' : '#9ca3af',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {inv.status === 'ACTIVE' ? 'Активна' : inv.status}
                        </span>
                      </div>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                        Ежедневный доход: ${Number(inv.dailyReturn).toFixed(2)} - Создано: {new Date(inv.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                Реферальная статистика
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{
                  background: 'rgba(45, 212, 191, 0.1)',
                  border: '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#2dd4bf', fontSize: '32px', fontWeight: '600' }}>
                    {selectedUser.referrals.totalReferrals}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Всего рефералов</div>
                </div>
                <div style={{
                  background: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#eab308', fontSize: '32px', fontWeight: '600' }}>
                    ${(() => {
                      // Функция расчета процента
                      const calculatePercent = (num) => {
                        if (num >= 10) return 0.07
                        if (num >= 6) return 0.06
                        if (num >= 4) return 0.05
                        if (num >= 2) return 0.04
                        return 0.03
                      }
                      
                      // Пересчитываем Level 1
                      const groupedLevel1 = new Map()
                      selectedUser.referrals.level1.forEach(ref => {
                        if (!groupedLevel1.has(ref.id)) {
                          groupedLevel1.set(ref.id, {
                            totalInvested: 0,
                            joinedAt: ref.joinedAt
                          })
                        }
                        const user = groupedLevel1.get(ref.id)
                        user.totalInvested += Number(ref.totalInvested || 0)
                      })
                      
                      const sortedLevel1 = Array.from(groupedLevel1.values()).sort((a, b) => 
                        new Date(a.joinedAt) - new Date(b.joinedAt)
                      )
                      
                      let totalLevel1 = 0
                      sortedLevel1.forEach((user, index) => {
                        const percent = calculatePercent(index + 1)
                        totalLevel1 += user.totalInvested * percent
                      })
                      
                      // Пересчитываем Level 2
                      const groupedLevel2 = new Map()
                      selectedUser.referrals.level2.forEach(ref => {
                        if (!groupedLevel2.has(ref.id)) {
                          groupedLevel2.set(ref.id, { totalInvested: 0 })
                        }
                        groupedLevel2.get(ref.id).totalInvested += Number(ref.totalInvested || 0)
                      })
                      
                      let totalLevel2 = 0
                      groupedLevel2.forEach(user => {
                        totalLevel2 += user.totalInvested * 0.03
                      })
                      
                      return (totalLevel1 + totalLevel2).toFixed(2)
                    })()}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>Всего заработано</div>
                </div>
              </div>


              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ color: '#2dd4bf', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Уровень 1 ({(() => {
                    const uniqueUsers = new Map()
                    selectedUser.referrals.level1.forEach(ref => {
                      uniqueUsers.set(ref.id, ref)
                    })
                    return uniqueUsers.size
                  })()} рефералов)
                </h4>

                {selectedUser.referrals.level1.length === 0 ? (
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '20px' }}>
                    Нет рефералов 1 уровня
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      // Группируем инвестиции по пользователям
                      const groupedByUser = new Map()
                      
                      selectedUser.referrals.level1.forEach(ref => {
                        if (!groupedByUser.has(ref.id)) {
                          groupedByUser.set(ref.id, {
                            id: ref.id,
                            email: ref.email,
                            name: ref.name,
                            joinedAt: ref.joinedAt,
                            totalInvested: 0,
                            commission: 0,
                            investmentCount: 0,
                            hasWithdrawn: false,
                            lastWithdrawnAt: null
                          })
                        }
                        const user = groupedByUser.get(ref.id)
                        user.totalInvested += Number(ref.totalInvested || 0)
                        user.commission += Number(ref.commission || 0)
                        user.investmentCount += 1
                        if (ref.bonusWithdrawn) {
                          user.hasWithdrawn = true
                          if (ref.withdrawnAt && (!user.lastWithdrawnAt || new Date(ref.withdrawnAt) > new Date(user.lastWithdrawnAt))) {
                            user.lastWithdrawnAt = ref.withdrawnAt
                          }
                        }
                      })
                      
                      // Сортируем пользователей по дате регистрации
                      const sortedUsers = Array.from(groupedByUser.values()).sort((a, b) => 
                        new Date(a.joinedAt) - new Date(b.joinedAt)
                      )
                      
                      // Функция расчета процента
                      const calculatePercent = (num) => {
                        if (num >= 10) return 0.07
                        if (num >= 6) return 0.06
                        if (num >= 4) return 0.05
                        if (num >= 2) return 0.04
                        return 0.03
                      }
                      
                      // Цвет процента
                      const getPercentColor = (percent) => {
                        if (percent >= 0.07) return '#4CAF50'
                        if (percent >= 0.06) return '#8BC34A'
                        if (percent >= 0.05) return '#FFC107'
                        if (percent >= 0.04) return '#FF9800'
                        return '#FF5722'
                      }
                      
                      return sortedUsers.map((user, userIndex) => {
                        const referralNumber = userIndex + 1
                        const individualPercent = calculatePercent(referralNumber)
                        const percentColor = getPercentColor(individualPercent)
                        
                        // Пересчитываем комиссию с правильным процентом
                        const recalculatedCommission = user.totalInvested * individualPercent
                        
                        return (
                          <div
                            key={user.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          >
                            {/* Шапка с номером и процентом */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: `${percentColor}15`,
                                border: `1px solid ${percentColor}40`
                              }}>
                                <span style={{
                                  fontSize: '11px',
                                  color: 'rgba(255,255,255,0.6)',
                                  fontWeight: '500'
                                }}>
                                  Реферал №{referralNumber}
                                </span>
                                <span style={{
                                  fontSize: '13px',
                                  color: percentColor,
                                  fontWeight: '700'
                                }}>
                                  {(individualPercent * 100).toFixed(0)}%
                                </span>
                              </div>
                              
                              {/* Количество инвестиций */}
                              {user.investmentCount > 1 && (
                                <div style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(45, 212, 191, 0.1)',
                                  border: '1px solid rgba(45, 212, 191, 0.3)',
                                  fontSize: '11px',
                                  color: '#2dd4bf',
                                  fontWeight: '600'
                                }}>
                                  📊 {user.investmentCount} инвестиций
                                </div>
                              )}
                              
                              {/* Статус вывода */}
                              {user.hasWithdrawn && (
                                <div style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(45, 212, 191, 0.15)',
                                  border: '1px solid rgba(45, 212, 191, 0.3)',
                                  fontSize: '11px',
                                  color: '#2dd4bf',
                                  fontWeight: '600'
                                }}>
                                  ✓ Есть выводы
                                </div>
                              )}
                            </div>
                            
                            {/* Основная информация */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                  {user.email}
                                </div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '2px' }}>
                                  {user.name} - Присоединился: {new Date(user.joinedAt).toLocaleDateString('ru-RU')}
                                </div>
                                {user.lastWithdrawnAt && (
                                  <div style={{ color: '#2dd4bf', fontSize: '11px', marginTop: '4px' }}>
                                    Последний вывод: {new Date(user.lastWithdrawnAt).toLocaleDateString('ru-RU')}
                                  </div>
                                )}
                              </div>
                              
                              {/* Финансовая информация */}
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                                  ${user.totalInvested.toFixed(2)}
                                </div>
                                {user.investmentCount > 1 && (
                                  <div style={{ color: 'rgba(45, 212, 191, 0.6)', fontSize: '11px', marginBottom: '4px' }}>
                                    по ${(user.totalInvested / user.investmentCount).toFixed(2)} × {user.investmentCount}
                                  </div>
                                )}
                                <div style={{ color: '#eab308', fontSize: '12px', marginBottom: '2px' }}>
                                  Комиссия: ${recalculatedCommission.toFixed(2)}
                                </div>
                                {user.investmentCount > 1 && (
                                  <div style={{ color: 'rgba(234, 179, 8, 0.6)', fontSize: '11px' }}>
                                    по ${(recalculatedCommission / user.investmentCount).toFixed(2)} × {user.investmentCount}
                                  </div>
                                )}
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginTop: '4px' }}>
                                  Ставка: {(individualPercent * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ color: '#2dd4bf', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  Уровень 2 ({(() => {
                    const uniqueUsers = new Map()
                    selectedUser.referrals.level2.forEach(ref => {
                      uniqueUsers.set(ref.id, ref)
                    })
                    return uniqueUsers.size
                  })()} рефералов)
                </h4>
                {selectedUser.referrals.level2.length === 0 ? (
                  <div style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: '20px' }}>
                    Нет рефералов 2 уровня
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      // Группируем инвестиции по пользователям
                      const groupedByUser = new Map()
                      
                      selectedUser.referrals.level2.forEach(ref => {
                        if (!groupedByUser.has(ref.id)) {
                          groupedByUser.set(ref.id, {
                            id: ref.id,
                            email: ref.email,
                            name: ref.name,
                            joinedAt: ref.joinedAt,
                            totalInvested: 0,
                            commission: 0,
                            investmentCount: 0,
                            hasWithdrawn: false,
                            lastWithdrawnAt: null
                          })
                        }
                        const user = groupedByUser.get(ref.id)
                        user.totalInvested += Number(ref.totalInvested || 0)
                        user.commission += Number(ref.commission || 0)
                        user.investmentCount += 1
                        if (ref.bonusWithdrawn) {
                          user.hasWithdrawn = true
                          if (ref.withdrawnAt && (!user.lastWithdrawnAt || new Date(ref.withdrawnAt) > new Date(user.lastWithdrawnAt))) {
                            user.lastWithdrawnAt = ref.withdrawnAt
                          }
                        }
                      })
                      
                      const sortedUsers = Array.from(groupedByUser.values()).sort((a, b) => 
                        new Date(a.joinedAt) - new Date(b.joinedAt)
                      )
                      
                      const individualPercent = 0.03
                      
                      return sortedUsers.map((user) => {
                        // Пересчитываем комиссию с правильным процентом
                        const recalculatedCommission = user.totalInvested * individualPercent
                        
                        return (
                          <div
                            key={user.id}
                            style={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          >
                            {/* Шапка */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '12px',
                              flexWrap: 'wrap'
                            }}>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: 'rgba(255, 87, 34, 0.15)',
                                border: '1px solid rgba(255, 87, 34, 0.4)'
                              }}>
                                <span style={{
                                  fontSize: '11px',
                                  color: 'rgba(255,255,255,0.6)',
                                  fontWeight: '500'
                                }}>
                                  Уровень 2
                                </span>
                                <span style={{
                                  fontSize: '13px',
                                  color: '#FF5722',
                                  fontWeight: '700'
                                }}>
                                  3%
                                </span>
                              </div>
                              
                              {/* Количество инвестиций */}
                              {user.investmentCount > 1 && (
                                <div style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(45, 212, 191, 0.1)',
                                  border: '1px solid rgba(45, 212, 191, 0.3)',
                                  fontSize: '11px',
                                  color: '#2dd4bf',
                                  fontWeight: '600'
                                }}>
                                  📊 {user.investmentCount} инвестиций
                                </div>
                              )}
                              
                              {/* Статус вывода */}
                              {user.hasWithdrawn && (
                                <div style={{
                                  padding: '4px 10px',
                                  borderRadius: '8px',
                                  background: 'rgba(45, 212, 191, 0.15)',
                                  border: '1px solid rgba(45, 212, 191, 0.3)',
                                  fontSize: '11px',
                                  color: '#2dd4bf',
                                  fontWeight: '600'
                                }}>
                                  ✓ Есть выводы
                                </div>
                              )}
                            </div>
                            
                            {/* Основная информация */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                  {user.email}
                                </div>
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', marginBottom: '2px' }}>
                                  {user.name} - Присоединился: {new Date(user.joinedAt).toLocaleDateString('ru-RU')}
                                </div>
                                {user.lastWithdrawnAt && (
                                  <div style={{ color: '#2dd4bf', fontSize: '11px', marginTop: '4px' }}>
                                    Последний вывод: {new Date(user.lastWithdrawnAt).toLocaleDateString('ru-RU')}
                                  </div>
                                )}
                              </div>
                              
                              {/* Финансовая информация */}
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ color: '#2dd4bf', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                                  ${user.totalInvested.toFixed(2)}
                                </div>
                                {user.investmentCount > 1 && (
                                  <div style={{ color: 'rgba(45, 212, 191, 0.6)', fontSize: '11px', marginBottom: '4px' }}>
                                    по ${(user.totalInvested / user.investmentCount).toFixed(2)} × {user.investmentCount}
                                  </div>
                                )}
                                <div style={{ color: '#eab308', fontSize: '12px', marginBottom: '2px' }}>
                                  Комиссия: ${recalculatedCommission.toFixed(2)}
                                </div>
                                {user.investmentCount > 1 && (
                                  <div style={{ color: 'rgba(234, 179, 8, 0.6)', fontSize: '11px' }}>
                                    по ${(recalculatedCommission / user.investmentCount).toFixed(2)} × {user.investmentCount}
                                  </div>
                                )}
                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginTop: '4px' }}>
                                  Ставка: 3%
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Поиск по email, имени пользователя или имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '14px 20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '14px 32px',
              background: 'rgba(45, 212, 191, 0.15)',
              border: '1px solid rgba(45, 212, 191, 0.3)',
              borderRadius: '12px',
              color: '#2dd4bf',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Поиск
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
              Фильтр KYC
            </label>
            <select
              value={filterKYC}
              onChange={(e) => setFilterKYC(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Все статусы</option>
              <option value="NOT_SUBMITTED">Не отправлено</option>
              <option value="PENDING">Ожидает</option>
              <option value="APPROVED">Одобрено</option>
              <option value="REJECTED">Отклонено</option>
            </select>
          </div>

          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
              Фильтр инвестиций
            </label>
            <select
              value={filterInvestments}
              onChange={(e) => setFilterInvestments(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Все пользователи</option>
              <option value="false">Без инвестиций</option>
              <option value="true">С инвестициями</option>
            </select>
          </div>

          <div>
            <label style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>
              Сортировка
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="createdAt">Дата регистрации</option>
              <option value="totalInvested">Сумма инвестиций (по убыванию)</option>
            </select>
          </div>
        </div>
      </form>

      {usersLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#2dd4bf' }}>
          Загрузка пользователей...
        </div>
      ) : (
        <>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            {isMobile ? (
              <div style={{ padding: '16px' }}>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ color: 'white', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {user.email || user.username || 'Нет email'}
                    </div>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '4px' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    {user.telegramUsername && (
                      <div style={{ color: '#2dd4bf', fontSize: '13px', marginBottom: '4px' }}>
                         @{user.telegramUsername}
                      </div>
                    )}
                    <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px', marginBottom: '8px' }}>
                      Инвестиции: {user._count.investments} - Сумма: ${user.totalInvested?.toFixed(2) || '0.00'}
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      {(() => {
                        const colors = getKYCStatusColor(user.kycStatus || 'NOT_SUBMITTED')
                        return (
                          <span style={{
                            padding: '4px 10px',
                            background: colors.bg,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '6px',
                            color: colors.text,
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-block'
                          }}>
                            {getKYCStatusLabel(user.kycStatus || 'NOT_SUBMITTED')}
                          </span>
                        )
                      })()}
                    </div>
                    
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '4px' }}>Продажник</div>
                      <div style={{ position: 'relative' }} ref={assigningUserId === user.id ? dropdownRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAssigningUserId(assigningUserId === user.id ? null : user.id)
                          }}
                          style={{
                            padding: '6px 12px',
                            background: user.assignedSalesperson ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: user.assignedSalesperson ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: user.assignedSalesperson ? '#2dd4bf' : 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {user.assignedSalesperson || 'Назначить'}
                        </button>
                        {assigningUserId === user.id && (
                          <div style={{
                            position: 'absolute',
                            zIndex: 100,
                            marginTop: '4px',
                            width: '160px',
                            background: 'rgba(30, 30, 30, 0.98)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                          }}>
                            {user.assignedSalesperson && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAssignSalesperson(user.id, null)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                Снять
                              </button>
                            )}
                            {SALESPEOPLE.map((salesperson) => (
                              <button
                                key={salesperson}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAssignSalesperson(user.id, salesperson)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 14px',
                                  background: user.assignedSalesperson === salesperson ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                  border: 'none',
                                  color: user.assignedSalesperson === salesperson ? '#2dd4bf' : 'rgba(255, 255, 255, 0.8)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (user.assignedSalesperson !== salesperson) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (user.assignedSalesperson !== salesperson) {
                                    e.target.style.background = 'transparent'
                                  }
                                }}
                              >
                                {salesperson}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '4px' }}>Откуда пришел</div>
                      <div style={{ position: 'relative' }} ref={assigningSourceUserId === user.id ? sourceDropdownRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setAssigningSourceUserId(assigningSourceUserId === user.id ? null : user.id)
                          }}
                          style={{
                            padding: '6px 12px',
                            background: user.referralSource ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: user.referralSource ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px',
                            color: user.referralSource ? '#2dd4bf' : 'rgba(255, 255, 255, 0.6)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {user.referralSource || 'Установить'}
                        </button>
                        {assigningSourceUserId === user.id && (
                          <div style={{
                            position: 'absolute',
                            zIndex: 100,
                            marginTop: '4px',
                            width: '200px',
                            background: 'rgba(30, 30, 30, 0.98)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                          }}>
                            {user.referralSource && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAssignReferralSource(user.id, null)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 14px',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                Снять источник
                              </button>
                            )}
                            {REFERRAL_SOURCES.map((source) => (
                              <button
                                key={source}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAssignReferralSource(user.id, source)
                                }}
                                style={{
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '10px 14px',
                                  background: user.referralSource === source ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                  border: 'none',
                                  color: user.referralSource === source ? '#2dd4bf' : 'rgba(255, 255, 255, 0.8)',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  if (user.referralSource !== source) {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (user.referralSource !== source) {
                                    e.target.style.background = 'transparent'
                                  }
                                }}
                              >
                                {source}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Имя</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Telegram</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Сумма инвестиций</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Кол-во инвестиций</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Продажник</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Откуда пришел</th>
                      <th style={{ padding: '16px 20px', textAlign: 'left', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Статус KYC</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr 
                        key={user.id}
                        style={{
                          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                          background: index % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)'
                        }}
                      >
                        <td style={{ padding: '16px 20px', color: 'white', fontSize: '14px' }}>
                          {user.email || user.username || '-'}
                        </td>
                        <td style={{ padding: '16px 20px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '-'}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {user.telegramUsername ? (
                            <a 
                              href={`https://t.me/${user.telegramUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                color: '#2dd4bf',
                                fontSize: '14px',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.color = '#14b8a6'
                                e.target.style.textDecoration = 'underline'
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.color = '#2dd4bf'
                                e.target.style.textDecoration = 'none'
                              }}
                            >
                              @{user.telegramUsername}
                            </a>
                          ) : (
                            <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '14px' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#2dd4bf', fontSize: '15px', fontWeight: '600', textAlign: 'center' }}>
                          ${user.totalInvested?.toFixed(2) || '0.00'}
                        </td>
                        <td style={{ padding: '16px 20px', color: '#2dd4bf', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                          {user._count.investments}
                        </td>
                        <td style={{ padding: '16px 20px', position: 'relative' }}>
                          <div style={{ position: 'relative' }} ref={assigningUserId === user.id ? dropdownRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAssigningUserId(assigningUserId === user.id ? null : user.id)
                              }}
                              style={{
                                padding: '6px 14px',
                                background: user.assignedSalesperson ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                border: user.assignedSalesperson ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: user.assignedSalesperson ? '#2dd4bf' : 'rgba(255, 255, 255, 0.6)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {user.assignedSalesperson || 'Назначить'}
                            </button>
                            {assigningUserId === user.id && (
                              <div style={{
                                position: 'absolute',
                                zIndex: 100,
                                marginTop: '4px',
                                width: '180px',
                                background: 'rgba(30, 30, 30, 0.98)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                              }}>
                                {user.assignedSalesperson && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAssignSalesperson(user.id, null)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '10px 14px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ef4444',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                  >
                                    Снять
                                  </button>
                                )}
                                {SALESPEOPLE.map((salesperson) => (
                                  <button
                                    key={salesperson}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAssignSalesperson(user.id, salesperson)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '10px 14px',
                                      background: user.assignedSalesperson === salesperson ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                      border: 'none',
                                      color: user.assignedSalesperson === salesperson ? '#2dd4bf' : 'rgba(255, 255, 255, 0.8)',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (user.assignedSalesperson !== salesperson) {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (user.assignedSalesperson !== salesperson) {
                                        e.target.style.background = 'transparent'
                                      }
                                    }}
                                  >
                                    {salesperson}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', position: 'relative' }}>
                          <div style={{ position: 'relative' }} ref={assigningSourceUserId === user.id ? sourceDropdownRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setAssigningSourceUserId(assigningSourceUserId === user.id ? null : user.id)
                              }}
                              style={{
                                padding: '6px 14px',
                                background: user.referralSource ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                border: user.referralSource ? '1px solid rgba(45, 212, 191, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: user.referralSource ? '#2dd4bf' : 'rgba(255, 255, 255, 0.6)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {user.referralSource || 'Установить'}
                            </button>
                            {assigningSourceUserId === user.id && (
                              <div style={{
                                position: 'absolute',
                                zIndex: 100,
                                marginTop: '4px',
                                width: '200px',
                                background: 'rgba(30, 30, 30, 0.98)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                              }}>
                                {user.referralSource && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAssignReferralSource(user.id, null)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '10px 14px',
                                      background: 'transparent',
                                      border: 'none',
                                      color: '#ef4444',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                  >
                                    Снять источник
                                  </button>
                                )}
                                {REFERRAL_SOURCES.map((source) => (
                                  <button
                                    key={source}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAssignReferralSource(user.id, source)
                                    }}
                                    style={{
                                      width: '100%',
                                      textAlign: 'left',
                                      padding: '10px 14px',
                                      background: user.referralSource === source ? 'rgba(45, 212, 191, 0.15)' : 'transparent',
                                      border: 'none',
                                      color: user.referralSource === source ? '#2dd4bf' : 'rgba(255, 255, 255, 0.8)',
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (user.referralSource !== source) {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (user.referralSource !== source) {
                                        e.target.style.background = 'transparent'
                                      }
                                    }}
                                  >
                                    {source}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {(() => {
                            const colors = getKYCStatusColor(user.kycStatus || 'NOT_SUBMITTED')
                            return (
                              <span style={{
                                padding: '4px 12px',
                                background: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                color: colors.text,
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                {getKYCStatusLabel(user.kycStatus || 'NOT_SUBMITTED')}
                              </span>
                            )
                          })()}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleUserClick(user.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'rgba(45, 212, 191, 0.15)',
                              border: '1px solid rgba(45, 212, 191, 0.3)',
                              borderRadius: '8px',
                              color: '#2dd4bf',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Подробнее
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination && (
            <div style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Показаны {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total} пользователей
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => fetchUsers(currentPage - 1, searchQuery, filterKYC, filterInvestments, sortBy)}
                  style={{
                    padding: '10px 20px',
                    background: pagination.hasPrev ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: pagination.hasPrev ? '#2dd4bf' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
                  }}
                >
                  Назад
                </button>

                <button
                  disabled={!pagination.hasNext}
                  onClick={() => fetchUsers(currentPage + 1, searchQuery, filterKYC, filterInvestments, sortBy)}
                  style={{
                    padding: '10px 20px',
                    background: pagination.hasNext ? 'rgba(45, 212, 191, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: pagination.hasNext ? '#2dd4bf' : 'rgba(255, 255, 255, 0.3)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                  }}
                >
                  Далее
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
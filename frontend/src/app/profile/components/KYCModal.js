'use client'
import { useState, useEffect } from 'react'
import CameraCapture from './CameraCapture'

const API_BASE_URL = 'https://dxcapital-ai.com'

// Функция детекции поддерживаемого MIME-типа для видео
const getSupportedVideoMimeType = () => {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm',
    'video/mp4;codecs=h264,aac',
    'video/mp4',
    'video/quicktime'
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('✅ Supported video MIME type:', type)
      return type
    }
  }

  console.warn('⚠️ No supported video MIME type found, using default')
  return 'video/mp4'
}

const getFileExtension = (mimeType) => {
  if (mimeType.includes('webm')) return 'webm'
  if (mimeType.includes('quicktime')) return 'mov'
  return 'mp4'
}

export default function KYCModal({ 
  isOpen, 
  onClose, 
  isMobile, 
  language = 'en',
  onKYCSubmitted 
}) {
  const [kycStatus, setKycStatus] = useState('NOT_SUBMITTED')
  const [kycPhotoUrl, setKycPhotoUrl] = useState(null)
  const [kycVideoUrl, setKycVideoUrl] = useState(null)
  const [kycRejectionReason, setKycRejectionReason] = useState(null)
  
  const [showCamera, setShowCamera] = useState(false)
  const [captureMode, setCaptureMode] = useState(null)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [capturedVideo, setCapturedVideo] = useState(null)
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'ID Verification',
      notSubmitted: 'Not Verified',
      pending: 'Under Review',
      approved: 'Verified',
      rejected: 'Rejected',
      
      step1: 'Document Photo',
      step2: 'Video Selfie',
      
      takePhoto: 'Take Photo',
      recordVideo: 'Record Video',
      retake: 'Retake',
      
      uploading: 'Uploading...',
      close: 'Close',
      
      photoReq: 'Clear photo, all corners visible',
      videoReq: '3-30 sec, show document clearly',
      
      statusPending: 'Under review (up to 30 min)',
      statusApproved: 'Verified! All features unlocked',
      statusRejected: 'Please resubmit',
      reason: 'Reason',
      
      loading: 'Loading...',
      photoUploaded: 'Photo uploaded',
      videoUploaded: 'Video uploaded, reviewing...',
      startOver: 'Start Over'
    },
    ru: {
      title: 'Верификация',
      notSubmitted: 'Не верифицирован',
      pending: 'На проверке',
      approved: 'Верифицирован',
      rejected: 'Отклонено',
      
      step1: 'Фото документа',
      step2: 'Видео селфи',
      
      takePhoto: 'Сделать фото',
      recordVideo: 'Записать видео',
      retake: 'Переснять',
      
      uploading: 'Загрузка...',
      close: 'Закрыть',
      
      photoReq: 'Четкое фото, все углы видны',
      videoReq: '3-30 сек, покажите документ',
      
      statusPending: 'На проверке (до 30 мин)',
      statusApproved: 'Верифицирован! Все функции доступны',
      statusRejected: 'Пожалуйста, отправьте заново',
      reason: 'Причина',
      
      loading: 'Загрузка...',
      photoUploaded: 'Фото загружено',
      videoUploaded: 'Видео загружено, проверяем...',
      startOver: 'Начать заново'
    }
  }

  const t = translations[language]

  useEffect(() => {
    if (isOpen) {
      fetchKYCStatus()
    }
  }, [isOpen])

  const fetchKYCStatus = async () => {
    setLoading(true)
    const token = localStorage.getItem('access_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        const data = result.data || result

        setKycStatus(data.kycStatus || 'NOT_SUBMITTED')
        setKycPhotoUrl(data.kycPhotoUrl || null)
        setKycVideoUrl(data.kycVideoUrl || null)
        setKycRejectionReason(data.kycRejectionReason || null)
      }
    } catch (error) {
      console.error('❌ Failed to fetch KYC status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Обработчик захвата фото с АВТОЗАГРУЗКОЙ
  const handlePhotoCapture = async (photoBlob, metadata) => {
    console.log('📸 Photo captured:', photoBlob.size, 'bytes')
    setCapturedPhoto({ blob: photoBlob, metadata })
    setShowCamera(false)
    setCaptureMode(null)
    setError('')
    
    // АВТОЗАГРУЗКА фото
    await uploadPhoto(photoBlob, metadata)
  }

  // Обработчик захвата видео с АВТОЗАГРУЗКОЙ
  const handleVideoCapture = async (videoBlob, metadata) => {
    console.log('🎥 Video captured:', videoBlob.size, 'bytes')
    setCapturedVideo({ blob: videoBlob, metadata })
    setShowCamera(false)
    setCaptureMode(null)
    setError('')
    
    // АВТОЗАГРУЗКА видео
    await uploadVideo(videoBlob, metadata)
  }

  // Загрузка фото
  const uploadPhoto = async (photoBlob, metadata) => {
    setUploading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    
    const photoFile = new File([photoBlob], 'kyc_photo.jpg', { type: 'image/jpeg' })
    formData.append('file', photoFile)
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/submit-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(t.photoUploaded)
        setKycPhotoUrl(data.data?.kycPhotoUrl)
        
        setTimeout(() => {
          setSuccess('')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
        setCapturedPhoto(null)
      }
    } catch (error) {
      console.error('❌ Photo upload error:', error)
      setError('Upload failed')
      setCapturedPhoto(null)
    } finally {
      setUploading(false)
    }
  }

  // Загрузка видео
  const uploadVideo = async (videoBlob, metadata) => {
    setUploading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    
    const supportedMimeType = getSupportedVideoMimeType()
    const fileExtension = getFileExtension(supportedMimeType)
    
    const videoFile = new File(
      [videoBlob], 
      `kyc_video.${fileExtension}`, 
      { type: supportedMimeType }
    )
    
    formData.append('file', videoFile)
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/submit-video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setSuccess(t.videoUploaded)
        
        const newStatus = data.data?.kycStatus || 'PENDING'
        setKycStatus(newStatus)
        setKycVideoUrl(data.data?.kycVideoUrl)
        
        if (onKYCSubmitted) {
          onKYCSubmitted(newStatus)
        }

        setTimeout(() => {
          fetchKYCStatus()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Upload failed')
        setCapturedVideo(null)
      }
    } catch (error) {
      console.error('❌ Video upload error:', error)
      setError('Upload failed')
      setCapturedVideo(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFiles = async () => {
    if (!confirm(t.startOver + '?')) return

    const token = localStorage.getItem('access_token')

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/kyc/delete-files`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        setCapturedPhoto(null)
        setCapturedVideo(null)
        setKycPhotoUrl(null)
        setKycVideoUrl(null)
        setKycStatus('NOT_SUBMITTED')
        setSuccess('Deleted')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (error) {
      console.error('❌ Delete files error:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return '#22c55e'
      case 'PENDING':
        return '#eab308'
      case 'REJECTED':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED':
        return t.approved
      case 'PENDING':
        return t.pending
      case 'REJECTED':
        return t.rejected
      default:
        return t.notSubmitted
    }
  }

  const getStatusMessage = (status) => {
    switch (status) {
      case 'APPROVED':
        return t.statusApproved
      case 'PENDING':
        return t.statusPending
      case 'REJECTED':
        return t.statusRejected
      default:
        return null
    }
  }

  if (!isOpen) return null

  // Показываем камеру если активен режим съёмки
  if (showCamera && captureMode) {
    return (
      <CameraCapture
        mode={captureMode}
        onPhotoCapture={handlePhotoCapture}
        onVideoCapture={handleVideoCapture}
        onClose={() => {
          setShowCamera(false)
          setCaptureMode(null)
        }}
        language={language}
        isMobile={isMobile}
      />
    )
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: isMobile ? '16px' : '20px'
      }}
      onClick={kycStatus === 'APPROVED' ? onClose : null}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(45, 212, 191, 0.2)',
          borderRadius: isMobile ? '20px' : '24px',
          padding: isMobile ? '20px' : '24px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 0 40px rgba(45, 212, 191, 0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🎫</span>
            {t.title}
          </h2>

          <button
            onClick={onClose}
            disabled={kycStatus === 'PENDING'}
            style={{
              background: 'none',
              border: 'none',
              color: kycStatus === 'PENDING' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '24px',
              cursor: kycStatus === 'PENDING' ? 'not-allowed' : 'pointer',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'all 0.3s'
            }}
          >
            ×
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#2dd4bf',
            fontSize: '14px'
          }}>
            {t.loading}
          </div>
        ) : (
          <>
            {/* Compact Status */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: `${getStatusColor(kycStatus)}15`,
              border: `1px solid ${getStatusColor(kycStatus)}40`,
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(kycStatus)
              }} />
              <span style={{
                color: getStatusColor(kycStatus),
                fontSize: '13px',
                fontWeight: '600',
                flex: 1
              }}>
                {getStatusText(kycStatus)}
              </span>
            </div>

            {getStatusMessage(kycStatus) && (
              <div style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '16px',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                lineHeight: '1.5'
              }}>
                {getStatusMessage(kycStatus)}
              </div>
            )}

            {kycStatus === 'REJECTED' && kycRejectionReason && (
              <div style={{
                marginBottom: '16px',
                padding: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px'
              }}>
                <div style={{
                  fontSize: '11px',
                  color: '#ef4444',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {t.reason}:
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {kycRejectionReason}
                </div>
              </div>
            )}

            {/* Compact Steps */}
            {kycStatus !== 'APPROVED' && kycStatus !== 'PENDING' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Step 1: Photo */}
                <div style={{
                  background: kycPhotoUrl ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${kycPhotoUrl ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {kycPhotoUrl ? '✅' : '📸'}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      flex: 1
                    }}>
                      {t.step1}
                    </span>
                    {!kycPhotoUrl && (
                      <button
                        onClick={() => {
                          setCaptureMode('photo')
                          setShowCamera(true)
                        }}
                        disabled={uploading}
                        style={{
                          padding: '6px 12px',
                          background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#000000',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: uploading ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {capturedPhoto ? t.retake : t.takePhoto}
                      </button>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.5'
                  }}>
                    {t.photoReq}
                  </div>
                </div>

                {/* Step 2: Video */}
                <div style={{
                  background: kycVideoUrl ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${kycVideoUrl ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '12px',
                  padding: '12px',
                  opacity: kycPhotoUrl ? 1 : 0.5
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '18px' }}>
                      {kycVideoUrl ? '✅' : '🎥'}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      flex: 1
                    }}>
                      {t.step2}
                    </span>
                    {!kycVideoUrl && (
                      <button
                        onClick={() => {
                          if (!kycPhotoUrl) return
                          setCaptureMode('video')
                          setShowCamera(true)
                        }}
                        disabled={!kycPhotoUrl || uploading}
                        style={{
                          padding: '6px 12px',
                          background: !kycPhotoUrl 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          color: !kycPhotoUrl ? 'rgba(255, 255, 255, 0.3)' : '#000000',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: (!kycPhotoUrl || uploading) ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {capturedVideo ? t.retake : t.recordVideo}
                      </button>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    lineHeight: '1.5'
                  }}>
                    {t.videoReq}
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '10px',
                marginTop: '12px',
                color: '#ef4444',
                fontSize: '12px'
              }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '10px',
                padding: '10px',
                marginTop: '12px',
                color: '#22c55e',
                fontSize: '12px'
              }}>
                {success}
              </div>
            )}

            {uploading && (
              <div style={{
                marginTop: '12px',
                textAlign: 'center',
                color: '#2dd4bf',
                fontSize: '13px',
                padding: '10px',
                background: 'rgba(45, 212, 191, 0.1)',
                borderRadius: '10px'
              }}>
                {t.uploading}
              </div>
            )}

            {/* Delete Button for REJECTED */}
            {kycStatus === 'REJECTED' && (
              <button
                onClick={handleDeleteFiles}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  color: '#ef4444',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '12px'
                }}
              >
                {t.startOver}
              </button>
            )}

            {/* Close Button for APPROVED */}
            {kycStatus === 'APPROVED' && (
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginTop: '16px'
                }}
              >
                {t.close}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

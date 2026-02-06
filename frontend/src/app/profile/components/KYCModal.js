'use client'
import { useState, useEffect } from 'react'
import CameraCapture from './CameraCapture'

const API_BASE_URL = 'https://dxcapital-ai.com'

// 🆕 Функция детекции поддерживаемого MIME-типа для видео
const getSupportedVideoMimeType = () => {
  const types = [
    'video/webm;codecs=vp8,opus',  // Android Chrome
    'video/webm;codecs=vp9,opus',  // Android Chrome (newer)
    'video/webm',                  // Android Chrome (fallback)
    'video/mp4;codecs=h264,aac',   // iOS Safari
    'video/mp4',                   // iOS Safari (fallback)
    'video/quicktime'              // iOS Safari (alternative)
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      console.log('✅ Supported video MIME type:', type)
      return type
    }
  }

  console.warn('⚠️ No supported video MIME type found, using default')
  return 'video/mp4' // Fallback
}

// 🆕 Получение расширения файла из MIME-типа
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
  
  // 🆕 Camera states
  const [showCamera, setShowCamera] = useState(false)
  const [captureMode, setCaptureMode] = useState(null) // 'photo' | 'video'
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [capturedVideo, setCapturedVideo] = useState(null)
  
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const translations = {
    en: {
      title: 'KYC Verification',
      subtitle: 'Identity Document Verification Required',
      description: 'Complete identity verification in 2 steps: 1) Take a photo of your document, 2) Record a short verification video',
      notSubmitted: 'Not Submitted',
      pending: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      
      // 🆕 Step indicators
      step1Title: 'Step 1: Document Photo',
      step2Title: 'Step 2: Video Verification',
      stepCompleted: 'Completed',
      stepPending: 'Pending',
      
      // 🆕 Camera buttons
      takePhoto: 'Take Photo',
      recordVideo: 'Record Video',
      retakePhoto: 'Retake Photo',
      retakeVideo: 'Retake Video',
      
      uploadPhoto: 'Upload Photo',
      uploadVideo: 'Submit Video',
      uploading: 'Uploading...',
      
      close: 'Close',
      deleteFiles: 'Start Over',
      
      requirements: 'Requirements:',
      photoReq1: 'Clear, readable document photo',
      photoReq2: 'All corners visible',
      videoReq1: 'Record yourself with the document',
      videoReq2: 'Duration: 3-30 seconds',
      videoReq3: 'Good lighting and clear voice',
      
      statusPending: 'Your documents are being reviewed. This usually takes up to 30 minutes.',
      statusApproved: 'Your identity has been verified! You can now access all features.',
      statusRejected: 'Your documents were rejected. Please submit new photo and video.',
      rejectionReason: 'Rejection reason:',
      
      errorNoPhoto: 'Please take a photo first',
      errorNoVideo: 'Please record a video first',
      errorUpload: 'Upload failed. Please try again.',
      successPhotoUpload: 'Photo uploaded successfully! Now record a video.',
      successVideoUpload: 'Video uploaded successfully! Your documents are under review.',
      loading: 'Loading...',
      currentStatus: 'Current Status',
      
      photoTaken: 'Photo captured',
      videoRecorded: 'Video recorded',
      deleteConfirm: 'Delete all files and start over?'
    },
    ru: {
      title: 'KYC Верификация',
      subtitle: 'Требуется подтверждение личности',
      description: 'Пройдите верификацию в 2 шага: 1) Сделайте фото документа, 2) Запишите короткое видео для подтверждения',
      notSubmitted: 'Не отправлено',
      pending: 'На проверке',
      approved: 'Одобрено',
      rejected: 'Отклонено',
      
      step1Title: 'Шаг 1: Фото документа',
      step2Title: 'Шаг 2: Видео-верификация',
      stepCompleted: 'Выполнено',
      stepPending: 'Ожидание',
      
      takePhoto: 'Сделать фото',
      recordVideo: 'Записать видео',
      retakePhoto: 'Переснять фото',
      retakeVideo: 'Переснять видео',
      
      uploadPhoto: 'Загрузить фото',
      uploadVideo: 'Отправить видео',
      uploading: 'Загрузка...',
      
      close: 'Закрыть',
      deleteFiles: 'Начать заново',
      
      requirements: 'Требования:',
      photoReq1: 'Четкое, читаемое фото документа',
      photoReq2: 'Все углы документа видны',
      videoReq1: 'Запишите себя с документом',
      videoReq2: 'Длительность: 3-30 секунд',
      videoReq3: 'Хорошее освещение и четкая речь',
      
      statusPending: 'Ваши документы проверяются. Обычно это занимает до 30 минут.',
      statusApproved: 'Ваша личность подтверждена! Теперь вам доступны все функции.',
      statusRejected: 'Ваши документы были отклонены. Пожалуйста, загрузите новое фото и видео.',
      rejectionReason: 'Причина отклонения:',
      
      errorNoPhoto: 'Пожалуйста, сначала сделайте фото',
      errorNoVideo: 'Пожалуйста, запишите видео',
      errorUpload: 'Ошибка загрузки. Попробуйте снова.',
      successPhotoUpload: 'Фото загружено успешно! Теперь запишите видео.',
      successVideoUpload: 'Видео загружено успешно! Ваши документы на проверке.',
      loading: 'Загрузка...',
      currentStatus: 'Текущий статус',
      
      photoTaken: 'Фото сделано',
      videoRecorded: 'Видео записано',
      deleteConfirm: 'Удалить все файлы и начать заново?'
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
      setError('Authentication required')
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
        
        console.log('✅ KYC Status loaded:', {
          status: data.kycStatus,
          hasPhoto: !!data.kycPhotoUrl,
          hasVideo: !!data.kycVideoUrl
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load KYC status')
      }
    } catch (error) {
      console.error('❌ Failed to fetch KYC status:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 🆕 Обработчик захвата фото
  const handlePhotoCapture = (photoBlob, metadata) => {
    console.log('📸 Photo captured:', photoBlob.size, 'bytes')
    setCapturedPhoto({ blob: photoBlob, metadata })
    setShowCamera(false)
    setCaptureMode(null)
    setError('')
  }

  // 🆕 Обработчик захвата видео
  const handleVideoCapture = (videoBlob, metadata) => {
    console.log('🎥 Video captured:', videoBlob.size, 'bytes')
    setCapturedVideo({ blob: videoBlob, metadata })
    setShowCamera(false)
    setCaptureMode(null)
    setError('')
  }

  // 🆕 Загрузка фото
  const handleUploadPhoto = async () => {
    if (!capturedPhoto) {
      setError(t.errorNoPhoto)
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    
    // Создаём файл из blob
    const photoFile = new File([capturedPhoto.blob], 'kyc_photo.jpg', { type: 'image/jpeg' })
    formData.append('file', photoFile)
    
    // 🆕 Добавляем метаданные
    if (capturedPhoto.metadata) {
      formData.append('metadata', JSON.stringify(capturedPhoto.metadata))
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
        console.log('✅ Photo uploaded:', data)
        
        setSuccess(t.successPhotoUpload)
        setKycPhotoUrl(data.data?.kycPhotoUrl)
        setCapturedPhoto(null)
        
        // Автоматически переходим к записи видео
        setTimeout(() => {
          setSuccess('')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || t.errorUpload)
      }
    } catch (error) {
      console.error('❌ Photo upload error:', error)
      setError(t.errorUpload)
    } finally {
      setUploading(false)
    }
  }

  // 🆕 Загрузка видео (ИСПРАВЛЕНО)
  const handleUploadVideo = async () => {
    if (!capturedVideo) {
      setError(t.errorNoVideo)
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('access_token')
    const formData = new FormData()
    
    // 🔧 ИСПРАВЛЕНО: Детекция поддерживаемого MIME-типа
    const supportedMimeType = getSupportedVideoMimeType()
    const fileExtension = getFileExtension(supportedMimeType)
    
    console.log('📹 Creating video file:', {
      mimeType: supportedMimeType,
      extension: fileExtension,
      blobSize: capturedVideo.blob.size
    })
    
    // Создаём файл с правильным MIME-типом и расширением
    const videoFile = new File(
      [capturedVideo.blob], 
      `kyc_video.${fileExtension}`, 
      { type: supportedMimeType }
    )
    
    formData.append('file', videoFile)
    
    // 🆕 Добавляем метаданные
    if (capturedVideo.metadata) {
      formData.append('metadata', JSON.stringify(capturedVideo.metadata))
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
        console.log('✅ Video uploaded:', data)
        
        setSuccess(t.successVideoUpload)
        
        const newStatus = data.data?.kycStatus || 'PENDING'
        setKycStatus(newStatus)
        setKycVideoUrl(data.data?.kycVideoUrl)
        setCapturedVideo(null)
        
        if (onKYCSubmitted) {
          onKYCSubmitted(newStatus)
        }

        setTimeout(() => {
          fetchKYCStatus()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || t.errorUpload)
      }
    } catch (error) {
      console.error('❌ Video upload error:', error)
      setError(t.errorUpload)
    } finally {
      setUploading(false)
    }
  }

  // 🆕 Удаление файлов и начало заново
  const handleDeleteFiles = async () => {
    if (!confirm(t.deleteConfirm)) return

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
        setSuccess('Files deleted. You can start over.')
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
        return '#eab308'
      default:
        return 'rgba(255, 255, 255, 0.5)'
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

  // 🆕 Показываем камеру если активен режим съёмки
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
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={kycStatus === 'APPROVED' ? onClose : null}
    >
      <div 
        style={{
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '32px',
          padding: isMobile ? '28px 20px' : '36px 32px',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              fontSize: isMobile ? '22px' : '26px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              letterSpacing: '-0.8px'
            }}>
              {t.title}
            </h2>
            <div style={{
              fontSize: isMobile ? '13px' : '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              marginBottom: '12px'
            }}>
              {t.subtitle}
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={kycStatus === 'PENDING'}
            style={{
              background: 'none',
              border: 'none',
              color: kycStatus === 'PENDING' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)',
              fontSize: '24px',
              cursor: kycStatus === 'PENDING' ? 'not-allowed' : 'pointer',
              width: '32px',
              height: '32px',
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
            padding: '60px 20px',
            color: '#2dd4bf',
            fontSize: isMobile ? '14px' : '15px'
          }}>
            {t.loading}
          </div>
        ) : (
          <>
            {/* Current Status */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${getStatusColor(kycStatus)}40`,
              borderRadius: '16px',
              padding: isMobile ? '16px' : '20px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? '12px' : '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px'
              }}>
                {t.currentStatus}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: `${getStatusColor(kycStatus)}20`,
                border: `1px solid ${getStatusColor(kycStatus)}40`,
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: getStatusColor(kycStatus)
                }} />
                <span style={{
                  color: getStatusColor(kycStatus),
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600'
                }}>
                  {getStatusText(kycStatus)}
                </span>
              </div>

              {getStatusMessage(kycStatus) && (
                <div style={{
                  marginTop: '12px',
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6'
                }}>
                  {getStatusMessage(kycStatus)}
                </div>
              )}

              {kycStatus === 'REJECTED' && kycRejectionReason && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  textAlign: 'left'
                }}>
                  <div style={{
                    fontSize: isMobile ? '11px' : '12px',
                    color: '#ef4444',
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {t.rejectionReason}
                  </div>
                  <div style={{
                    fontSize: isMobile ? '12px' : '13px',
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}>
                    {kycRejectionReason}
                  </div>
                </div>
              )}
            </div>

            {/* 🆕 KYC Process Steps */}
            {kycStatus !== 'APPROVED' && kycStatus !== 'PENDING' && (
              <>
                <div style={{
                  fontSize: isMobile ? '12px' : '13px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: '1.6',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  {t.description}
                </div>

                {/* Step 1: Photo */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '20px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      color: '#ffffff',
                      margin: 0
                    }}>
                      {t.step1Title}
                    </h3>
                    {(kycPhotoUrl || capturedPhoto) && (
                      <span style={{
                        fontSize: '11px',
                        color: '#22c55e',
                        background: 'rgba(34, 197, 94, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}>
                        {t.stepCompleted}
                      </span>
                    )}
                  </div>

                  {capturedPhoto && (
                    <div style={{
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      <img
                        src={URL.createObjectURL(capturedPhoto.blob)}
                        alt="Captured"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '12px'
                        }}
                      />
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#22c55e'
                      }}>
                        {t.photoTaken}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <button
                      onClick={() => {
                        setCaptureMode('photo')
                        setShowCamera(true)
                      }}
                      disabled={uploading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: capturedPhoto 
                          ? 'rgba(45, 212, 191, 0.15)' 
                          : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: capturedPhoto ? '#2dd4bf' : '#000000',
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {capturedPhoto ? t.retakePhoto : t.takePhoto}
                    </button>
                    
                    {capturedPhoto && !kycPhotoUrl && (
                      <button
                        onClick={handleUploadPhoto}
                        disabled={uploading}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: uploading
                            ? 'rgba(45, 212, 191, 0.3)'
                            : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: uploading ? 'rgba(0, 0, 0, 0.5)' : '#000000',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {uploading ? t.uploading : t.uploadPhoto}
                      </button>
                    )}
                  </div>

                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.8'
                  }}>
                    <li>{t.photoReq1}</li>
                    <li>{t.photoReq2}</li>
                  </ul>
                </div>

                {/* Step 2: Video */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: isMobile ? '16px' : '20px',
                  marginBottom: '20px',
                  opacity: kycPhotoUrl ? 1 : 0.5
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <h3 style={{
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: '600',
                      color: '#ffffff',
                      margin: 0
                    }}>
                      {t.step2Title}
                    </h3>
                    {kycVideoUrl && (
                      <span style={{
                        fontSize: '11px',
                        color: '#22c55e',
                        background: 'rgba(34, 197, 94, 0.15)',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}>
                        {t.stepCompleted}
                      </span>
                    )}
                  </div>

                  {capturedVideo && (
                    <div style={{
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}>
                      <video
                        src={URL.createObjectURL(capturedVideo.blob)}
                        controls
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: '12px'
                        }}
                      />
                      <div style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: '#22c55e'
                      }}>
                        {t.videoRecorded}
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <button
                      onClick={() => {
                        if (!kycPhotoUrl) {
                          setError(t.errorNoPhoto)
                          return
                        }
                        setCaptureMode('video')
                        setShowCamera(true)
                      }}
                      disabled={!kycPhotoUrl || uploading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        background: !kycPhotoUrl 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : (capturedVideo 
                              ? 'rgba(45, 212, 191, 0.15)' 
                              : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'),
                        border: 'none',
                        borderRadius: '12px',
                        color: !kycPhotoUrl 
                          ? 'rgba(255, 255, 255, 0.3)' 
                          : (capturedVideo ? '#2dd4bf' : '#000000'),
                        fontSize: isMobile ? '13px' : '14px',
                        fontWeight: '600',
                        cursor: (!kycPhotoUrl || uploading) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {capturedVideo ? t.retakeVideo : t.recordVideo}
                    </button>
                    
                    {capturedVideo && !kycVideoUrl && (
                      <button
                        onClick={handleUploadVideo}
                        disabled={uploading}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: uploading
                            ? 'rgba(45, 212, 191, 0.3)'
                            : 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                          border: 'none',
                          borderRadius: '12px',
                          color: uploading ? 'rgba(0, 0, 0, 0.5)' : '#000000',
                          fontSize: isMobile ? '13px' : '14px',
                          fontWeight: '600',
                          cursor: uploading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {uploading ? t.uploading : t.uploadVideo}
                      </button>
                    )}
                  </div>

                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: isMobile ? '11px' : '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.8'
                  }}>
                    <li>{t.videoReq1}</li>
                    <li>{t.videoReq2}</li>
                    <li>{t.videoReq3}</li>
                  </ul>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: '#ef4444',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    color: '#22c55e',
                    fontSize: isMobile ? '12px' : '13px'
                  }}>
                    {success}
                  </div>
                )}

                {/* Delete Files Button */}
                {(kycPhotoUrl || kycVideoUrl || capturedPhoto || capturedVideo) && kycStatus === 'REJECTED' && (
                  <button
                    onClick={handleDeleteFiles}
                    style={{
                      width: '100%',
                      padding: isMobile ? '12px' : '14px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '16px',
                      color: '#ef4444',
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      marginTop: '12px'
                    }}
                  >
                    {t.deleteFiles}
                  </button>
                )}
              </>
            )}

            {/* Close button for APPROVED status */}
            {kycStatus === 'APPROVED' && (
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: isMobile ? '14px' : '16px',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#000000',
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  marginTop: '20px'
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

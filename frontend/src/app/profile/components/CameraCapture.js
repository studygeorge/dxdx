'use client'
import { useState, useRef, useEffect } from 'react'

export default function CameraCapture({
  mode, // 'photo' | 'video'
  onPhotoCapture,
  onVideoCapture,
  onClose,
  language = 'en',
  isMobile = false
}) {
  const videoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const recordingStartTimeRef = useRef(0)
  
  const [stream, setStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState('')
  const [cameraReady, setCameraReady] = useState(false)
  const [supportedMimeType, setSupportedMimeType] = useState('')

  // ✅ Скрываем мобильное меню когда камера открыта
  useEffect(() => {
    if (isMobile) {
      // Находим нижнее меню и скрываем его
      const bottomNav = document.querySelector('[class*="NavigationMobile"]') 
        || document.querySelector('nav[class*="fixed bottom"]')
        || document.querySelector('nav[class*="mobile"]')
        || document.querySelector('.mobile-navigation')
      
      if (bottomNav) {
        bottomNav.style.display = 'none'
      }

      // Возвращаем меню обратно при закрытии камеры
      return () => {
        if (bottomNav) {
          bottomNav.style.display = ''
        }
      }
    }
  }, [isMobile])

  const translations = {
    en: {
      photoTitle: 'Take Document Photo',
      videoTitle: 'Record Verification Video',
      capturePhoto: 'Capture',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      cancel: 'Cancel',
      cameraError: 'Camera access denied or unavailable',
      videoTooLong: 'Maximum video length is 30 seconds',
      instructions: 'Position your document clearly in frame',
      videoInstructions: 'Hold your document and speak clearly',
      recording: 'Recording...',
      processing: 'Processing video...'
    },
    ru: {
      photoTitle: 'Сфотографировать документ',
      videoTitle: 'Записать видео-верификацию',
      capturePhoto: 'Снять',
      startRecording: 'Начать запись',
      stopRecording: 'Остановить запись',
      cancel: 'Отмена',
      cameraError: 'Доступ к камере запрещен или недоступен',
      videoTooLong: 'Максимальная длительность видео 30 секунд',
      instructions: 'Расположите документ четко в кадре',
      videoInstructions: 'Держите документ и говорите четко',
      recording: 'Идёт запись...',
      processing: 'Обработка видео...'
    }
  }

  const t = translations[language]

  // 🔧 ИСПРАВЛЕНО: Функция детекции поддерживаемого MIME-типа
  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4;codecs=avc1',
      'video/mp4'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return 'video/webm' // Fallback
  }

  useEffect(() => {
    initCamera()
    
    // Детектируем поддерживаемый MIME-тип при монтировании
    if (mode === 'video') {
      const mimeType = getSupportedMimeType()
      setSupportedMimeType(mimeType)
    }

    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    let interval
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= 30) {
            handleStopRecording()
            return 30
          }
          return newTime
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  const initCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError(t.cameraError)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  const handleCapturePhoto = () => {
    if (!videoRef.current || !cameraReady) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoRef.current, 0, 0)

    canvas.toBlob((blob) => {
      if (blob) {
        const metadata = {
          resolution: `${canvas.width}x${canvas.height}`,
          deviceInfo: navigator.userAgent,
          timestamp: new Date().toISOString(),
          browser: getBrowserInfo(),
          os: getOSInfo()
        }
        
        stopCamera()
        onPhotoCapture(blob, metadata)
      }
    }, 'image/jpeg', 0.95)
  }

  const handleStartRecording = () => {
    if (!stream || isRecording) return

    try {
      // 🔧 ИСПРАВЛЕНО: Используем предварительно детектированный MIME-тип
      const mimeType = supportedMimeType || getSupportedMimeType()

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.error('❌ MIME type not supported:', mimeType)
        setError(`Video recording not supported on this device`)
        return
      }

      const options = {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000
      }


      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      recordingStartTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        
        if (chunksRef.current.length === 0) {
          console.error('❌ No video data recorded')
          setError('No video data recorded. Please try again.')
          setIsRecording(false)
          return
        }

        const actualDuration = (Date.now() - recordingStartTimeRef.current) / 1000

        const blob = new Blob(chunksRef.current, { type: mimeType })
        
        if (blob.size === 0) {
          console.error('❌ Video blob is empty')
          setError('Video recording failed. Please try again.')
          setIsRecording(false)
          return
        }

        const metadata = {
          duration: actualDuration,
          resolution: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
          fileSize: blob.size,
          deviceInfo: navigator.userAgent,
          timestamp: new Date().toISOString(),
          browser: getBrowserInfo(),
          os: getOSInfo(),
          mimeType: mimeType
        }


        stopCamera()
        onVideoCapture(blob, metadata)
      }

      mediaRecorder.onerror = (e) => {
        console.error('❌ MediaRecorder error:', e)
        setError('Recording error occurred')
        setIsRecording(false)
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setError('')
    } catch (err) {
      console.error('❌ Recording error:', err)
      setError('Failed to start recording: ' + err.message)
    }
  }

  const handleStopRecording = () => {
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
          setIsRecording(false)
        } else {
        }
      } catch (err) {
        console.error('❌ Error stopping recording:', err)
        setError('Failed to stop recording')
        setIsRecording(false)
      }
    } else {
    }
  }

  const getBrowserInfo = () => {
    const ua = navigator.userAgent
    if (ua.indexOf('Chrome') > -1) return 'Chrome'
    if (ua.indexOf('Safari') > -1) return 'Safari'
    if (ua.indexOf('Firefox') > -1) return 'Firefox'
    if (ua.indexOf('Edge') > -1) return 'Edge'
    return 'Unknown'
  }

  const getOSInfo = () => {
    const ua = navigator.userAgent
    if (ua.indexOf('Win') > -1) return 'Windows'
    if (ua.indexOf('Mac') > -1) return 'MacOS'
    if (ua.indexOf('Linux') > -1) return 'Linux'
    if (ua.indexOf('Android') > -1) return 'Android'
    if (ua.indexOf('iOS') > -1) return 'iOS'
    return 'Unknown'
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#000000',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.9)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{
          color: '#ffffff',
          fontSize: isMobile ? '18px' : '22px',
          fontWeight: '600',
          margin: 0
        }}>
          {mode === 'photo' ? t.photoTitle : t.videoTitle}
        </h2>
        <button
          onClick={() => {
            stopCamera()
            onClose()
          }}
          disabled={isRecording}
          style={{
            background: isRecording ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: isRecording ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
            fontSize: '24px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            cursor: isRecording ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Video Preview */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#000000'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Recording Indicator */}
        {isRecording && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ffffff',
              animation: 'pulse 1s infinite'
            }} />
            {t.recording} {recordingTime}s / 30s
          </div>
        )}

        {/* Instructions */}
        {!isRecording && cameraReady && (
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '140px' : '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '16px',
            fontSize: '13px',
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            {mode === 'photo' ? t.instructions : t.videoInstructions}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '16px',
            fontSize: '13px',
            maxWidth: '80%',
            textAlign: 'center',
            zIndex: 10
          }}>
            {error}
          </div>
        )}

        {/* ✅ КНОПКИ СПРАВА ПО ЦЕНТРУ НА МОБИЛЬНЫХ */}
        <div style={{
          position: 'absolute',
          right: isMobile ? '20px' : '50%',
          top: isMobile ? '50%' : 'auto',
          bottom: isMobile ? 'auto' : '20px',
          transform: isMobile ? 'translateY(-50%)' : 'translateX(50%)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 20,
          width: isMobile ? 'auto' : '90%',
          maxWidth: isMobile ? 'none' : '400px'
        }}>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            disabled={isRecording}
            style={{
              padding: '14px 24px',
              background: isRecording ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              color: isRecording ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              backdropFilter: 'blur(10px)',
              minWidth: isMobile ? '80px' : 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {t.cancel}
          </button>

          {mode === 'photo' && (
            <button
              onClick={handleCapturePhoto}
              disabled={!cameraReady}
              style={{
                padding: '14px 32px',
                background: cameraReady
                  ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                  : 'rgba(45, 212, 191, 0.3)',
                border: 'none',
                borderRadius: '16px',
                color: cameraReady ? '#000000' : 'rgba(0, 0, 0, 0.5)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: cameraReady ? 'pointer' : 'not-allowed',
                boxShadow: cameraReady ? '0 4px 20px rgba(45, 212, 191, 0.4)' : 'none',
                minWidth: isMobile ? '80px' : 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {t.capturePhoto}
            </button>
          )}

          {mode === 'video' && !isRecording && (
            <button
              onClick={handleStartRecording}
              disabled={!cameraReady || !supportedMimeType}
              style={{
                padding: '14px 32px',
                background: (cameraReady && supportedMimeType)
                  ? 'linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)'
                  : 'rgba(45, 212, 191, 0.3)',
                border: 'none',
                borderRadius: '16px',
                color: (cameraReady && supportedMimeType) ? '#000000' : 'rgba(0, 0, 0, 0.5)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (cameraReady && supportedMimeType) ? 'pointer' : 'not-allowed',
                boxShadow: (cameraReady && supportedMimeType) ? '0 4px 20px rgba(45, 212, 191, 0.4)' : 'none',
                minWidth: isMobile ? '80px' : 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {t.startRecording}
            </button>
          )}

          {mode === 'video' && isRecording && (
            <button
              onClick={handleStopRecording}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                border: 'none',
                borderRadius: '16px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)',
                minWidth: isMobile ? '80px' : 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              {t.stopRecording}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>
    </div>
  )
}

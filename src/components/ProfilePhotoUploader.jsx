'use client';

import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Camera, X, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Restrict image size to save database memory (300x300)
  const size = 300; 
  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );

  // Return base64 string, compressed as JPEG 80%
  return canvas.toDataURL('image/jpeg', 0.8);
};

const ProfilePhotoUploader = ({ currentPhoto, onPhotoUpdate }) => {
  const { showToast } = useToast();
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setIsUploading(true);
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onPhotoUpdate(croppedImageBase64);
      setImageSrc(null); // close modal
    } catch (e) {
      console.error(e);
      showToast('Failed to crop image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div 
        style={{
          width: 120, height: 120, borderRadius: '50%', background: 'var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          border: '4px solid white', boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer', position: 'relative', overflow: 'hidden'
        }}
        onClick={() => inputRef.current?.click()}
        title={'upload_photo' || 'Upload Photo'}
      >
        {currentPhoto ? (
          <img src={currentPhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Camera size={40} style={{ color: '#94A3B8' }} />
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)',
          padding: '0.2rem', textAlign: 'center', color: 'white', fontSize: '0.7rem'
        }}>
          Edit
        </div>
      </div>
      
      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />

      {imageSrc && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: 500, height: 400, background: '#333', borderRadius: '1rem', overflow: 'hidden' }}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', width: '90%', maxWidth: 500, alignItems: 'center' }}>
            <span style={{ color: 'white', fontSize: '0.9rem' }}>Zoom:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setImageSrc(null)}
              className="btn"
              style={{ background: '#475569', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={isUploading}
            >
              <X size={18} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={isUploading}
            >
              <Check size={18} /> {isUploading ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhotoUploader;

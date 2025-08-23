import React, { useState, useRef } from 'react';
import { ApiClient } from '../utils/ApiClient';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppInput';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { useNotification } from '../contexts/NotificationContext';
import { isError } from '../types/common';

type UploadStatus = 'idle' | 'uploading' | 'error' | 'success';

interface UploadVideoViewProps {
  onUploadComplete: () => void;
  userToken: string | null;
}

export const UploadVideoView: React.FC<UploadVideoViewProps> = ({ onUploadComplete, userToken }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useNotification();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File is too large. Please select a video under 50MB.');
        return;
      }
      setError(null);
      setStatus('idle');
      setVideoFile(file);

      if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePost = async () => {
    if (!videoFile || !userToken) {
      setError('Please select a video file to upload.');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description for your video.');
      return;
    }
    
    setError(null);
    setStatus('uploading');
    try {
        await ApiClient.videos.uploadVideo(videoFile, description, userToken);

        setStatus('success');
        addToast('Video posted successfully!', 'success');
        onUploadComplete();
    } catch (err) {
      setStatus('error');
      const errorMessage = isError(err) ? err.message : 'An unexpected error occurred during upload.';
      setError(errorMessage);
      setStatus('idle');
    }
  };
  
  const isUploading = status === 'uploading';

  return (
    <div className="upload-video-view">
        <ViewHeader 
            title="Upload a Video"
            subtitle="Share a moment of positivity or a helpful tip with the community."
        >
             <AppButton variant="secondary" onClick={onUploadComplete}>Back to Feed</AppButton>
        </ViewHeader>
        <Card>
            <div className="form-group">
                <label 
                    htmlFor="video-upload-input" 
                    className="file-input-label"
                >
                    {videoFile ? `Selected: ${videoFile.name}` : 'Click to Select a Video'}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        id="video-upload-input" 
                        accept="video/*" 
                        onChange={handleFileChange} 
                    />
                </label>
            </div>

            {previewUrl && (
                <div className="form-group">
                    <video 
                        src={previewUrl} 
                        className="upload-preview-video" 
                        controls 
                        loop
                    />
                </div>
            )}
            
            <AppTextArea 
                label="Description"
                id="video-description"
                placeholder="Describe your video, add some encouraging words, or include relevant hashtags..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
            />

            {error && <p className="api-error">{error}</p>}
            
            <div className="form-actions">
                <AppButton
                    variant="primary"
                    onClick={handlePost}
                    isLoading={isUploading}
                    disabled={isUploading || !videoFile}
                >
                    Post Video
                </AppButton>
            </div>
        </Card>
    </div>
  );
};

export default UploadVideoView;
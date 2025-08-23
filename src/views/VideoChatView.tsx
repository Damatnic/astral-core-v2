import React, { useState, useEffect, useRef } from 'react';
import { Dilemma } from '../types';
import { MicOnIcon, MicOffIcon, VideoOnIcon, VideoOffIcon, HangUpIcon  } from '../components/icons.dynamic';
import { AppButton } from '../components/AppButton';

export const VideoChatView: React.FC<{
  dilemma: Dilemma;
  onClose: () => void;
}> = ({ onClose }) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setupPeerConnection(stream);
      } catch (error) {
        console.error('Error accessing media devices.', error);
        alert('Could not access camera and microphone. Please check permissions.');
        onClose();
      }
    };

    const setupPeerConnection = (stream: MediaStream) => {
      // In a real app, you would get STUN/TURN server URLs from a service
      const servers = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      };
      const pc = new RTCPeerConnection(servers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.onicecandidate = event => {
        if (event.candidate) {
          // In a real app, send this candidate to the other peer via a signaling server (e.g., WebSocket)
          // Send ICE candidate to peer
        }
      };

      pc.ontrack = event => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // --- Signaling Simulation ---
      // This part would be handled by a signaling server in a real application.
      // 1. Helper creates an offer.
      // 2. Helper sends the offer to the seeker.
      // 3. Seeker receives the offer, sets remote description, creates an answer.
      // 4. Seeker sends the answer back to the helper.
      // 5. Helper receives the answer, sets remote description.
      // This simulation just shows the basic flow.
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => {
          // Offer created and set as local description
          // In a real app, you would send pc.localDescription to the other peer.
        });
    };

    startMedia();

    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [onClose]);

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMicMuted(!track.enabled);
      });
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
    }
  };

  return (
    <div className="video-chat-view">
      <div className="remote-video-container">
        <video ref={remoteVideoRef} autoPlay playsInline></video>
      </div>
      <div className="local-video-container">
        <video ref={localVideoRef} autoPlay playsInline muted></video>
      </div>
      <div className="video-chat-controls">
        <AppButton onClick={toggleMic} className="video-control-btn">
          {isMicMuted ? <MicOffIcon /> : <MicOnIcon />}
        </AppButton>
        <AppButton onClick={toggleCamera} className="video-control-btn">
          {isCameraOff ? <VideoOffIcon /> : <VideoOnIcon />}
        </AppButton>
        <AppButton variant="danger" onClick={onClose} className="video-control-btn hang-up">
          <HangUpIcon />
        </AppButton>
      </div>
    </div>
  );
};

export default VideoChatView;
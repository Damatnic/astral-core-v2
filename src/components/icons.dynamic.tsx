// Dynamic Icon Loading System
// This system provides true tree-shaking by loading icons only when needed
import React, { Suspense, lazy, memo } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Base Icon Component
export const Icon: React.FC<IconProps & { path: string }> = memo(({ path, className, size = 24, style }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d={path} />
  </svg>
));

Icon.displayName = 'Icon';

// Icon factory for creating icon components
const createIcon = (path: string, displayName: string) => {
  const IconComponent = memo((props: IconProps) => <Icon path={path} {...props} />);
  IconComponent.displayName = displayName;
  return IconComponent;
};

// Lazy loading for rarely used icons
const createLazyIcon = (importFn: () => Promise<{ default: string }>, displayName: string) => {
  const LazyIcon = lazy(async () => {
    const { default: path } = await importFn();
    return { default: (props: IconProps) => <Icon path={path} {...props} /> };
  });
  
  const WrappedIcon = memo((props: IconProps) => (
    <Suspense fallback={<div style={{ width: props.size || 24, height: props.size || 24 }} />}>
      <LazyIcon {...props} />
    </Suspense>
  ));
  
  WrappedIcon.displayName = displayName;
  return WrappedIcon;
};

// Frequently used icons - loaded immediately
export const HeartIcon = createIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', 'HeartIcon');
export const CloseIcon = createIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z', 'CloseIcon');
export const BackIcon = createIcon('M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z', 'BackIcon');
export const SendIcon = createIcon('M24 2l-4 14.5-7.5-3.5L8 20l-6-8 14.5-4L24 2z', 'SendIcon');
export const CheckIcon = createIcon('M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z', 'CheckIcon');
export const AlertIcon = createIcon('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', 'AlertIcon');
export const PhoneIcon = createIcon('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', 'PhoneIcon');

// Crisis-specific icons
export const Clock = createIcon('M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z', 'Clock');
export const ClockIcon = Clock; // Alias for compatibility
export const X = createIcon('M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z', 'X');
export const XCircleIcon = createIcon('M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z', 'XCircleIcon');
export const CheckCircleIcon = createIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', 'CheckCircleIcon');
export const AlertCircleIcon = createIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z', 'AlertCircleIcon');
export const ActivityIcon = createIcon('M22 12h-4l-3 9L9 3l-3 9H2', 'ActivityIcon');
export const LinkIcon = createIcon('M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71', 'LinkIcon');
export const Phone = createIcon('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z', 'Phone');
export const MessageCircle = createIcon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z', 'MessageCircle');
export const ExternalLink = createIcon('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L18 3', 'ExternalLink');
export const AlertTriangle = createIcon('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', 'AlertTriangle');

// Helper and user interface icons
export const LogoutIcon = createIcon('M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z', 'LogoutIcon');
export const CertifiedIcon = createIcon('M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z', 'CertifiedIcon');
export const PostsIcon = createIcon('M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z', 'PostsIcon');
export const GuidelinesIcon = createIcon('M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z', 'GuidelinesIcon');
export const LegalIcon = createIcon('M12 3l1.09 3.26L16 9l-2.91 2.74L14.18 15 12 13.27 9.82 15l1.09-3.26L8 9l2.91-2.74L12 3z', 'LegalIcon');
export const HelperIcon = createIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', 'HelperIcon');
export const MyPostsIcon = createIcon('M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z', 'MyPostsIcon');
export const QuietSpaceIcon = createIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', 'QuietSpaceIcon');
export const LockIcon = createIcon('M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z', 'LockIcon');
export const SearchIcon = createIcon('M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z', 'SearchIcon');
export const BellIcon = createIcon('M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z', 'BellIcon');
export const ThumbsUpIcon = createIcon('M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z', 'ThumbsUpIcon');
export const KudosIcon = createIcon('M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', 'KudosIcon');
export const AchievementsIcon = createIcon('M5 16L3 5l5.5 4L12 4l3.5 5L21 5l-2 11H5zm2.7-2h8.6l.9-5.4-2.1 1.7L12 8l-3.1 2.3-2.1-1.7L7.7 14z', 'AchievementsIcon');

// Video and media icons
export const MessageCircleIcon = createIcon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z', 'MessageCircleIcon');
export const StarIcon = createIcon('M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z', 'StarIcon');
export const PlayIcon = createIcon('M8 5v14l11-7z', 'PlayIcon');
export const PauseIcon = createIcon('M6 19h4V5H6v14zm8-14v14h4V5h-4z', 'PauseIcon');
export const MicOnIcon = createIcon('M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z', 'MicOnIcon');
export const MicOffIcon = createIcon('M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z', 'MicOffIcon');
export const VideoOnIcon = createIcon('M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z', 'VideoOnIcon');
export const VideoOffIcon = createIcon('M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82l-2-2H16c.55 0 1 .45 1 1v.5l4-4v11l-2.61-2.61L21 6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2zM15 16H5V8h1.73l8 8H15z', 'VideoOffIcon');
export const HangUpIcon = createIcon('M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.68.28-.53 0-.96-.43-.96-.96V9.72C2.21 6.27 6.82 3.5 12 3.5s9.79 2.77 10.46 6.22v5.17c0 .53-.43.96-.96.96-.25 0-.5-.09-.68-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z', 'HangUpIcon');
export const VolumeIcon = createIcon('M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z', 'VolumeIcon');
export const CommentIcon = createIcon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z', 'CommentIcon');
export const PlusIcon = createIcon('M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z', 'PlusIcon');
export const MusicIcon = createIcon('M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z', 'MusicIcon');

// Navigation icons
export const MenuIcon = createIcon('M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z', 'MenuIcon');
export const UsersIcon = createIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', 'UsersIcon');
export const SettingsIcon = createIcon('M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z', 'SettingsIcon');

// Communication icons
export const ChatIcon = createIcon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z', 'ChatIcon');
export const VideoIcon = createIcon('M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z', 'VideoIcon');
export const ShareIcon = createIcon('M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z', 'ShareIcon');

// AI and wellness icons
export const AICompanionIcon = createIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.41 14.59L12 13.17l-3.41 3.42-1.41-1.41L10.59 12 7.17 8.59l1.41-1.41L12 10.83l3.41-3.42 1.41 1.41L13.41 12l3.42 3.41-1.42 1.18z', 'AICompanionIcon');
export const SparkleIcon = createIcon('M9 11H7v3h2v-3zm4 0h-2v3h2v-3zm4 0h-2v3h2v-3zm-4-1V7h-2v3h2zm4 0V7h-2v3h2zm-8 0V7H7v3h2z', 'SparkleIcon');
export const WellnessIcon = createIcon('M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', 'WellnessIcon');

// Crisis and safety icons  
export const CrisisIcon = createIcon('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', 'CrisisIcon');
export const SafetyPlanIcon = createIcon('M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z', 'SafetyPlanIcon');
export const ShieldIcon = createIcon('M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z', 'ShieldIcon');
export const TrendingUpIcon = createIcon('M2 12l2-2v5h4l2-2V8l3 3v4h3l2-2V8l2 2', 'TrendingUpIcon');
export const RefreshIcon = createIcon('M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z', 'RefreshIcon');
export const DownloadIcon = createIcon('M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z', 'DownloadIcon');
export const UploadIcon = createIcon('M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z', 'UploadIcon');

// Missing icons
export const SunIcon = createIcon('M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z', 'SunIcon');
export const MoonIcon = createIcon('M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z', 'MoonIcon');
export const SmileIcon = createIcon('M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm4 0c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zm1.5-4.5H8.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h7c.28 0 .5.22.5.5s-.22.5-.5.5z', 'SmileIcon');
export const CloudIcon = createIcon('M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z', 'CloudIcon');
export const TagIcon = createIcon('M7.5 5.6L10 7 8.6 4.5C8.2 3.9 7.5 3.9 7.1 4.5L5.5 7l2.5-1.4zm4.5 5.9L8.6 12l2.4-2.4c.6-.6.6-1.5 0-2.1-.6-.6-1.5-.6-2.1 0L6.5 10 9 7.6l3.4 3.4z', 'TagIcon');
export const UserIcon = createIcon('M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z', 'UserIcon');
export const HomeIcon = createIcon('M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z', 'HomeIcon');
export const HistoryIcon = createIcon('M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z', 'HistoryIcon');
export const TrashIcon = createIcon('M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z', 'TrashIcon');
export const FilterIcon = createIcon('M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z', 'FilterIcon');
export const ChevronRightIcon = createIcon('M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z', 'ChevronRightIcon');
export const WarningIcon = createIcon('M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z', 'WarningIcon');
export const MoreIcon = createIcon('M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z', 'MoreIcon');
export const MessageIcon = createIcon('M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z', 'MessageIcon');
export const CalendarIcon = createIcon('M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z', 'CalendarIcon');

// Less frequently used icons - lazy loaded
export const BookIcon = createLazyIcon(() => import('./icon-paths/book'), 'BookIcon');
export const BookmarkIcon = createLazyIcon(() => import('./icon-paths/bookmark'), 'BookmarkIcon');
export const ClipboardCheckIcon = createLazyIcon(() => import('./icon-paths/clipboard-check'), 'ClipboardCheckIcon');
export const CopyIcon = createLazyIcon(() => import('./icon-paths/copy'), 'CopyIcon');
export const DashboardIcon = createLazyIcon(() => import('./icon-paths/dashboard'), 'DashboardIcon');
export const FeedIcon = createLazyIcon(() => import('./icon-paths/feed'), 'FeedIcon');
export const GoogleIcon = createLazyIcon(() => import('./icon-paths/google'), 'GoogleIcon');
export const AppleIcon = createLazyIcon(() => import('./icon-paths/apple'), 'AppleIcon');

// Custom hook for dynamic icon loading
export const useIcon = (iconName: string): React.ComponentType<IconProps> | null => {
  return React.useMemo(() => {
    const iconMap: Record<string, React.ComponentType<IconProps>> = {
      HeartIcon,
      CloseIcon,
      BackIcon,
      SendIcon,
      CheckIcon,
      AlertIcon,
      PhoneIcon,
      MenuIcon,
      UsersIcon,
      SettingsIcon,
      ChatIcon,
      VideoIcon,
      ShareIcon,
      AICompanionIcon,
      SparkleIcon,
      WellnessIcon,
      CrisisIcon,
      SafetyPlanIcon,
      ShieldIcon,
      // Crisis-specific icons
      Clock,
      X,
      Phone,
      MessageCircle,
      ExternalLink,
      AlertTriangle,
      // Helper and user interface icons
      LogoutIcon,
      CertifiedIcon,
      PostsIcon,
      GuidelinesIcon,
      LegalIcon,
      HelperIcon,
      MyPostsIcon,
      QuietSpaceIcon,
      LockIcon,
      SearchIcon,
      ThumbsUpIcon,
      KudosIcon,
      AchievementsIcon,
      // Video and media icons
      MessageCircleIcon,
      StarIcon,
      PlayIcon,
      PauseIcon,
      MicOnIcon,
      MicOffIcon,
      VideoOnIcon,
      VideoOffIcon,
      HangUpIcon,
      VolumeIcon,
      CommentIcon,
      PlusIcon,
      MusicIcon,
      // Additional icons
      SunIcon,
      TagIcon,
      UserIcon,
      HomeIcon,
      TrendingUpIcon,
      RefreshIcon,
      DownloadIcon,
      UploadIcon,
    };
    
    return iconMap[iconName] || null;
  }, [iconName]);
};

export type { IconProps };
export default Icon;

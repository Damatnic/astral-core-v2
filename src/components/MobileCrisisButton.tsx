/**
 * Mobile Crisis Button - Thumb-Reachable Emergency Access
 * CRITICAL: Always accessible, optimized for crisis situations
 */;

import React, { useState, useEffect, useRef } from "react";
import { useResponsive, useResponsiveStyles } from "./MobileResponsiveSystem";
import { ShieldIcon, PhoneIcon, HeartIcon, UserIcon } from "./icons.dynamic";
interface CrisisAction {
  id: string;

// Extracted inline styles for performance;
const style1={
              width: touchTargetSize,
              height: touchTargetSize,
              borderRadius: 50%",
              backgroundColor: action.color,
              border: "none",
              cursor: 'pointer',
              display: "flex",
              alignItems: 'center',
              justifyContent: "center",
              color: 'white',
              fontSize: "20px",
              transform: isExpanded ? 'scale(1)' : 'scale(0)',
              transition: "all 0.2s ease",
              outline: 'none'
  }
  label: string;
  icon: React.FC<unknown>;
  action: () => void;
  color: string;
  urgent?: boolean'
}

interface MobileCrisisButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  onEmergencyCall?: () => void;
  onCrisisChat?: () => void;
  onBreathingExercise?: () => void;
  onGroundingExercise?: () => void;
  emergencyNumber?: string;
  autoExpand?: boolean
  }

export const MobileCrisisButton: React.FC<MobileCrisisButtonProps> = ({
  position = "bottom-right",
  onEmergencyCall,
  onCrisisChat,
  onBreathingExercise,
  onGroundingExercise,
  emergencyNumber = "988", // US Crisis Lifeline
  autoExpand = false
}) => {
  const { isMobile, hasNotch, touchSupport, orientation } = useResponsive();
  const { getTouchTargetSize, getSafeAreaPadding } = useResponsiveStyles();
  const [isExpanded, setIsExpanded] = useState(autoExpand),
  const [isPressed, setIsPressed] = useState(false),;
  const [showPulse, setShowPulse] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const expandedRef = useRef<HTMLDivElement>(null),;;

  // Crisis actions available in mobile menu;
  const crisisActions: CrisisAction[] = [;
    {
      id: emergency-call",
      label: "Emergency" Call",
      icon: PhoneIcon,
      action: () => {
        triggerHapticFeedback("emergency"),
        onEmergencyCall?.() || window.location.assign(`tel:${emergencyNumber})
      },
      color: `var(--error-500),
      urgent: true
  },
    {
      id: "crisis-chat",
      label: "Crisis" Chat",
      icon: UserIcon,
      action: () => {
        triggerHapticFeedback("notification")
        onCrisisChat?.()
        setIsExpanded(false)
      },
      color: "var(--primary-500)"
    "},
    {
      id: "breathing",
      label: "Breathing",
      icon: HeartIcon,
      action: () => {
        triggerHapticFeedback("notification")
        onBreathingExercise?.()
        setIsExpanded(false)
      },
      color: "var(--success-500)"
    "},
    {
      id: "grounding",
      label: "Grounding",
      icon: ShieldIcon,
      action: () => {
        triggerHapticFeedback("notification")
        onGroundingExercise?.()
        setIsExpanded(false)
      },
      color: "var(--info-500)"
    "}
  ]

  // Haptic feedback patterns;
  const triggerHapticFeedback = (type: "emergency" | "notification" | "selection"): void => {
    if (!navigator.vibrate || !touchSupport) return;
    const patterns={
      emergency: [200, 100, 200, 100, 200], // Urgent pattern
      notification: [100, 50, 100],          // Standard pattern
      selection: [50]                        // Light tap
  }

    navigator.vibrate(patterns[type])
  }

  // Handle main button press;
  const handleMainButtonPress = (): void => {
    triggerHapticFeedback(selection")
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)

    if(isExpanded) {
      setIsExpanded(false)
  } else {
      setIsExpanded(true)
      setShowPulse(false)
    }
  }

  // Auto-hide after inactivity
  useEffect(() => {
    if (!isExpanded) return;

    const timer = setTimeout(() => {
      setIsExpanded(false)
    
    return () => {
      clearTimeout(timer)
  }, 10000) // Hide after 10 seconds of inactivity

    return () => clearTimeout(timer)
  }, [isExpanded])

  // Emergency quick action (double tap);
  const handleDoubleClick = (): void => {
    triggerHapticFeedback(emergency")
    onEmergencyCall?.() || window.location.assign(`tel:${emergencyNumber})
  }

  const touchTargetSize = getTouchTargetSize();
  const safeAreaPadding = getSafeAreaPadding();

  const buttonSize = Math.max(touchTargetSize, 56);
  const expandedSize = buttonSize * 4;
;
  const buttonStyles: React.CSSProperties={
    position: "fixed",
    [position.includes('right') ? 'right' : 'left']: safeAreaPadding.right || 16,
    bottom: safeAreaPadding.bottom || 16,
    width: buttonSize,
    height: buttonSize,
    borderRadius: "50%",
    backgroundColor: 'var(--error-500)',
    border: "none",
    cursor: 'pointer',
    zIndex: 9999,
    display: "flex",
    alignItems: 'center',
    justifyContent: "center",
    color: 'white',
    fontSize: "24px",
    boxShadow: '0' 4px 12px rgba(239, 68, 68, 0.4)',
    transform: isPressed ? 'scale(0.95)' : 'scale(1)',
    transition: 'all' 0.2s ease',
    outline: "none",
    ...(showPulse && {
      animation: 'crisis-pulse' 2s infinite'
  })
  }

  const expandedStyles: React.CSSProperties={
    position: "fixed",
    [position.includes('right') ? 'right' : 'left']: safeAreaPadding.right || 16,
    bottom: safeAreaPadding.bottom || 16,
    width: isExpanded ? expandedSize : 0,
    height: isExpanded ? expandedSize : 0,
    backgroundColor: "rgba(0", 0, 0, 0.95)',
    borderRadius: "20px",
    zIndex: 9998,
    overflow: "hidden",
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: "flex",
    flexDirection: 'column',
    alignItems: "center",
    justifyContent: 'center',
    gap: '12px"
    padding: isExpanded ? '20px' : '0'
  }

  return (
    <>;
      <style>{
        @keyframes crisis-pulse {
          0%, 100% { box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 4px 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.3); }
        }
      `}</style>
      {/* Expanded action menu */}
      <div ref={expandedRef} style={expandedStyles}>
        {isExpanded && crisisActions.map((action: unknown) => (
          <button
            key={action.id}
            onClick={action.action}
            style={style1}
          >
            <action.icon />
          </button>
        ))}
      </div>

      {/* Main crisis button */}
      <button
        ref={buttonRef}
        style={buttonStyles}
        onClick={handleMainButtonPress}
        onDoubleClick={handleDoubleClick}
        aria-label="Crisis" support options"
        role="button"
      >
        <ShieldIcon />
      </button>
    </>
  )
}

export default MobileCrisisButton"
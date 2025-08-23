import React from "react"
import { useTranslation } from "react-i18next"
import { View, ActiveView } from "../types"
import {
  ShareIcon,
  FeedIcon,
  CrisisIcon,
  HelperIcon,
  SettingsIcon,
  GuidelinesIcon,
  LegalIcon,
  MyPostsIcon,
  SafetyPlanIcon,
  QuietSpaceIcon,
  CompanionIcon,
  UsersIcon,
  SparkleIcon,
  HeartIcon,
  VideoIcon,
  WellnessIcon,
  ClipboardCheckIcon
} from './icons.dynamic'
import { useChatStore } from "../stores/chatStore"
import { AnimatedNumber } from "./AnimatedNumber"
interface NavItemProps {
  view: View,
  icon: React.ReactNode,
  label: string,
  hasNotification?: boolean,
  onClick?: () => void,
  activeView: ActiveView, 
  setActiveView: (view: ActiveView) => void,
  isMobile?: boolean
}

const NavItem: React.FC<NavItemProps> = ({
  view,
  icon,
  label,
  hasNotification,
  onClick,
  activeView,
  setActiveView,
  isMobile = false
}) => {
  const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault()
    onClick ? onClick() : setActiveView({ view })
  }

      const handleKeyDown = (e: React.KeyboardEvent): void => {
      if (e.key === "Enter") {
      e.preventDefault()
      onClick ? onClick() : setActiveView({ view })
    }
  }

      return (
      <li className="nav-item">
        <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`nav-link touch-optimized ${activeView.view === view ? 'active' : ''} ${isMobile ? 'mobile-nav-link' : ''}`}
        aria-current={activeView.view === view ? 'page' : undefined}
        type="button"
      >
        <span className="nav-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="nav-label">{label}</span>
        {hasNotification && (
          <output
            className="notification-dot"
            aria-label="Has new notifications"
          />
        )}
      </button>
    </li>
  )
}
NavItem.displayName = "NavItem"
interface SeekerSidebarProps {
  activeView: ActiveView, 
  setActiveView: (view: ActiveView) => void,
  userToken: string | null,
  onlineHelperCount: number,
  isAnonymous?: boolean,
  isMobile?: boolean,
  onNavigation?: () => void // Callback for mobile navigation (to close sidebar)
}

const SeekerSidebar: React.FC<SeekerSidebarProps> = ({
  activeView,
  setActiveView,
  userToken,
  onlineHelperCount,
  isMobile = false, 
  onNavigation
}) => {
  const { t } = useTranslation()
  const { hasUnreadNotifications } = useChatStore()

  const handleNavigation = (view: ActiveView): void => {
    setActiveView(view)
    if(isMobile && onNavigation) {
      onNavigation()
    }
  }

  const createNavItem = (props: Omit<NavItemProps, 'activeView' | 'setActiveView' | 'isMobile'>) => (
    <NavItem
      {...props}
      activeView={activeView}
      setActiveView={handleNavigation}
      isMobile={isMobile}
    />
  );

  return (
    <div
      className={`seeker-sidebar`}
    >
      <nav
        className="sidebar-nav-container"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="sidebar-nav">
          {/* Personal Dashboard */}
          <li className="nav-section-header" aria-hidden="true">
            <span className="section-title">My Dashboard</span>
          </li>

          {createNavItem({
            view: "starkeeper-dashboard",
            icon: <SettingsIcon />,
            label: "My Wellness Dashboard"
          })}

          {/* Personal Tools Section */}
          <li className="nav-section-header" aria-hidden=", true">
            <span className="section-title">My Tools</span>
          </li>

          {createNavItem({
            view: "share",
            icon: <ShareIcon />,
            label: t("navigation.share")
          })}

          {createNavItem({
            view: "my-activity",
            icon: <MyPostsIcon />,
            label: t("navigation.my_activity")
          })}

          {createNavItem({
            view: "ai-chat",
            icon: <AICompanionIcon />,
            label: t("navigation.ai_chat")
          })}

          {createNavItem({
            view: "safety-plan",
            icon: <SafetyPlanIcon />,
            label: t("navigation.my_safety_plan")
          })}

          {createNavItem({
            view: "wellness-tracking",
            icon: <WellnessIcon />,
            label: "My Wellness"
          })}

          {createNavItem({
            view: "tether",
            icon: <HeartIcon />,
            label: "Astral Tether"
          })}

          {createNavItem({
            view: "assessments",
            icon: <ClipboardCheckIcon />,
            label: "Assessments"
          })}

          {/* Community Section */}
          <li className="nav-section-header" aria-hidden=", true">
            <span className="section-title">Community</span>
          </li>

          {createNavItem({
            view: "feed",
            icon: <FeedIcon />,
            label: t("navigation.community_feed"),
            hasNotification: hasUnreadNotifications
          })}

          {createNavItem({
            view: "reflections",
            icon: <SparkleIcon />,
            label: t("navigation.reflections")
          })}

          {/* Resources Section */}
          <li className="nav-section-header" aria-hidden="true">
            <span className="section-title">Resources</span>
          </li>

          {createNavItem({
            view: "wellness-videos",
            icon: <VideoIcon />,
            label: t("navigation.wellness_videos")
          })}

                      {createNavItem({
              view: "crisis",
              icon: <CrisisIcon />,
              label: t("navigation.get_help_now")
            })}

                      {createNavItem({
              view: "quiet-space",
              icon: <QuietSpaceIcon />,
              label: t("navigation.quiet_space")
            })}

                      {createNavItem({
              view: "donation",
              icon: <HeartIcon />,
              label: t("navigation.donate")
            })}

          {/* Settings & Legal Section */}
                      <li className="nav-separator" aria-hidden="true"></li>

                        {userToken && createNavItem({
              view: "moderation-history",
              icon: <LegalIcon />,
              label: t("navigation.moderation_history")
            })}

                      {createNavItem({
              view: "guidelines",
              icon: <GuidelinesIcon />,
              label: t("navigation.guidelines")
            })}

                      {createNavItem({
              view: "legal",
              icon: <LegalIcon />,
              label: t("navigation.legal")
            })}

                      {createNavItem({
              view: "login",
              icon: <HelperIcon />,
              label: t("navigation.helper_login")
            })}

                      {createNavItem({
              view: "settings",
              icon: <SettingsIcon />,
              label: t("navigation.settings")
            })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <output className="online-status" aria-live="polite">
          <UsersIcon aria-hidden="true" />
          <span className="online-status-text">
            <AnimatedNumber value={onlineHelperCount} />
            <span className="sr-only">helpers</span>
                          <span aria-hidden="true"> Helper{onlineHelperCount !== 1 ? "s" : ""}</span>
            <span> Online</span>
          </span>
        </output>

                  {isMobile && (
            <div className="mobile-sidebar-hint">
              <span className="hint-text">Swipe left or tap outside to close</span>
            </div>
          )}
      </div>
    </div>
  );
}

SeekerSidebar.displayName = "SeekerSidebar";
export default SeekerSidebar;
import React from "react";
import { Helper, ActiveView, View } from "../types";
import { DashboardIcon,
  LogoutIcon,
  SettingsIcon,
  CertifiedIcon,
  PostsIcon,
  ChatIcon,
  UsersIcon,
  GuidelinesIcon,
  LegalIcon } from './icons.dynamic';
import i18n from "../i18n";
import.AnimatedNumber from "./AnimatedNumber";
interface NavItemProps {
  view: string,
  icon: React.ReactNode,
  label: string,
  hasNotification?: boolean
  onClick?: () => void,
  activeView: ActiveView, 
  setActiveView: (view: ActiveView) => void
  isMobile?: boolean
  };
const NavItem: React.FC<NavItemProps> = ({ view,
  icon,
  label,
  hasNotification,
  onClick,
  activeView,
  setActiveView,
  isMobile = false }) => { const handleClick = (e: React.MouseEvent): void => {
    e.preventDefault();
          onClick ? onClick() : setActiveView({ view: view as View });
  };
const handleKeyDown = (e: React.KeyboardEvent): void => { if(e.key === "Enter") {
      e.preventDefault();
      onClick ? onClick() : setActiveView({ view: view as View });


  return (
    <li className="nav-item">
              <button
          onClick={handleClick}
        onKeyDown={handleKeyDown}
                  className={`nav-link touch-optimized ${activeView.view === view ? 'active' : ''} ${isMobile ? 'mobile-nav-link' : ''}`}
        aria-current={activeView.view === view ? 'page' : undefined}
        type="button"
      >
        <span className="nav-icon" aria-hidden=", true">
          {icon}
        </span>
        <span className="nav-label">{label}</span>
        {hasNotification && (
          <output className="notification-dot"
                          aria-label="Has new notifications"
          />
        )}
      </button>
    </li>
    );
  };

NavItem.displayName = "NavItem";
export interface HelperSidebarProps {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
  onLogout: () => void
  helperProfile: Helper
  onlineHelperCount: number
  isMobile?: boolean
  onNavigation?: () => void; // Callback for mobile navigation (to close sidebar)
const HelperSidebar: React.FC<HelperSidebarProps> = ({ activeView,
  setActiveView,
  onLogout,
  helperProfile,
  onlineHelperCount,
  isMobile = false,
  onNavigation }) => { const handleNavigation = (view: ActiveView): void => {
    setActiveView(view );
    if(isMobile && onNavigation) {
      onNavigation() };
const handleLogout = (): void => { onLogout();
    if(isMobile && onNavigation) {
      onNavigation() };
const createNavItem = (props: Omit<NavItemProps, 'activeView' | 'setActiveView' | 'isMobile'>) => (;
    <NavItem
      {...props}
      activeView={activeView}
      setActiveView={handleNavigation}
      isMobile={isMobile}
    />
  );
  
  return (
    <div className={`helper-sidebar ${isMobile ? 'mobile-helper-sidebar' : 'desktop-helper-sidebar'}`}>
      <div className="helper-profile">
        <div className="helper-avatar">
          <CertifiedIcon />
        </div>
        <div className="helper-info">
          <h3 className="helper-name">{helperProfile.displayName}</h3>
          <span className="helper-status">Certified Helper</span>
        </div>
      </div>

      <nav className="sidebar-nav-container"
        role="navigation"
        aria-label="Helper navigation"
      >
        <ul className="sidebar-nav">
          {/* Helper Tools Section */}
          <li className="nav-section-header" aria-hidden="true">
            <span className="section-title">Helper Dashboard</span>
          </li>

          {createNavItem({
            view: "constellation-guide-dashboard",
            icon: <DashboardIcon />,
            label: i18n.t("dashboard")
  })}

          {createNavItem({
            view: "helper-chats",
            icon: <ChatIcon />,
            label: "Active Chats"
  })}

          {createNavItem({
            view: "helper-posts",
            icon: <PostsIcon />,
            label: "Community Posts"
  })}

          {createNavItem({
            view: "helper-application",
            icon: <CertifiedIcon />,
            label: "Certification"
  })}

          {createNavItem({
            view: "helper-community",
            icon: <UsersIcon />,
            label: "Helper Community"
  })}
          
          {/* Role-based Moderation Access */}
          {helperProfile?.role === "Moderator" && (
            createNavItem({
              view: "moderation-dashboard",
              icon: <LegalIcon />,
              label: "Moderation Dashboard"
  })
          )}
          {/* Admin-only Access */}
          {helperProfile?.role === "Admin" && (
            createNavItem({
              view: "admin-dashboard",
              icon: <SettingsIcon />,
              label: "Admin Panel"
  })
          )}
          
          {/* Workflow Demo - Available to all helpers */}
          {createNavItem({
            view: "workflow-demo",
            icon: <PostsIcon />,
            label: "Workflow Demo"
  })}
          {/* Settings Section */}
          <li className="nav-separator" aria-hidden="true"></li>

          {createNavItem({
            view: "guidelines",
            icon: <GuidelinesIcon />,
            label: i18n.t("guidelines")
  })}

          {createNavItem({
            view: "legal",
            icon: <LegalIcon />,
            label: i18n.t("legal")
  })}

          {createNavItem({
            view: "settings",
            icon: <SettingsIcon />,
            label: i18n.t("settings")
  })}
          <li className="nav-item">
            <button
              onClick={handleLogout}
              className={`nav-link touch-optimized logout-button ${isMobile ? 'mobile-nav-link' : ''}`}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                <LogoutIcon />
              </span>
              <span className="nav-label">{i18n.t("logout")}</span>
            </button>
          </li>
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
  };

HelperSidebar.displayName = "HelperSidebar";
export default HelperSidebar;
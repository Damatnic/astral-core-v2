export const formatTimeAgo = (timestamp: string | Date | null | undefined): string => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const past = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    // Handle invalid dates
    if (isNaN(past.getTime())) return 'Invalid date';
    
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (seconds < 60) return `${Math.floor(seconds)}s ago`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${Math.floor(minutes)}m ago`;
    const hours = minutes / 60;
    if (hours < 24) return `${Math.floor(hours)}h ago`;
    const days = hours / 24;
    if (days < 30) return `${Math.floor(days)}d ago`;
    const months = days / 30;
    if (months < 12) return `${Math.floor(months)}mo ago`;
    const years = days / 365;
    return `${Math.floor(years)}y ago`;
};

export const formatChatTimestamp = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date(Date.now()); // Use Date.now() for better testability
    
    const isToday = messageDate.getDate() === now.getDate() &&
                    messageDate.getMonth() === now.getMonth() &&
                    messageDate.getFullYear() === now.getFullYear();

    if (isToday) {
        return messageDate.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: '2-digit' });
    }
    
    // Check for yesterday
    const yesterday = new Date(Date.now());
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = messageDate.getDate() === yesterday.getDate() &&
                        messageDate.getMonth() === yesterday.getMonth() &&
                        messageDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
        return `Yesterday at ${messageDate.toLocaleTimeString(navigator.language, { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return messageDate.toLocaleDateString(navigator.language, { year: 'numeric', month: 'short', day: 'numeric' });
};

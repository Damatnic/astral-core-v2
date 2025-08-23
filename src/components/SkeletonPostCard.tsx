export const SkeletonPostCard = () => (
    <li className="post-card skeleton">
        <div className="post-header">
            <div className="post-user-info">
                <div className="avatar"></div>
                <div className="username-skeleton"></div>
            </div>
            <div className="post-meta">
                <div className="category-skeleton"></div>
            </div>
        </div>
        <div className="content-skeleton line-1"></div>
        <div className="content-skeleton line-2"></div>
        <div className="content-skeleton line-3"></div>
    </li>
);

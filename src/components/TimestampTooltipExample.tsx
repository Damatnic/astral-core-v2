import React from 'react';
import TimestampTooltip from './TimestampTooltip';
import './TimestampTooltipExample.css';

/**
 * Example component demonstrating TimestampTooltip usage
 * Shows various configurations and use cases
 */
export const TimestampTooltipExample: React.FC = () => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="timestamp-tooltip-examples">
      <h3>Timestamp Tooltip Examples</h3>
      
      <div className="example-section">
        <h4>Basic Usage</h4>
        <p>
          Post created{' '}
          <TimestampTooltip timestamp={oneHourAgo}>
            1 hour ago
          </TimestampTooltip>
        </p>
      </div>

      <div className="example-section">
        <h4>Format Variations</h4>
        <div className="example-grid">
          <div className="example-item">
            <span className="example-label">Relative Format:</span>
            <TimestampTooltip 
              timestamp={yesterday} 
              format="relative"
            />
          </div>
          
          <div className="example-item">
            <span className="example-label">Absolute Format:</span>
            <TimestampTooltip 
              timestamp={yesterday} 
              format="absolute"
            />
          </div>
          
          <div className="example-item">
            <span className="example-label">Both Formats:</span>
            <TimestampTooltip 
              timestamp={yesterday} 
              format="both"
            />
          </div>
        </div>
      </div>

      <div className="example-section">
        <h4>Position Options</h4>
        <div className="position-demo">
          <div className="position-item">
            <TimestampTooltip 
              timestamp={lastWeek} 
              position="top"
            >
              Top Position
            </TimestampTooltip>
          </div>
          
          <div className="position-item">
            <TimestampTooltip 
              timestamp={lastWeek} 
              position="bottom"
            >
              Bottom Position
            </TimestampTooltip>
          </div>
          
          <div className="position-item">
            <TimestampTooltip 
              timestamp={lastWeek} 
              position="left"
            >
              Left Position
            </TimestampTooltip>
          </div>
          
          <div className="position-item">
            <TimestampTooltip 
              timestamp={lastWeek} 
              position="right"
            >
              Right Position
            </TimestampTooltip>
          </div>
          
          <div className="position-item">
            <TimestampTooltip 
              timestamp={lastWeek} 
              position="auto"
            >
              Auto Position
            </TimestampTooltip>
          </div>
        </div>
      </div>

      <div className="example-section">
        <h4>Mobile Optimizations</h4>
        <div className="mobile-demo">
          <div className="mobile-item">
            <span className="example-label">Instant on Mobile:</span>
            <TimestampTooltip 
              timestamp={lastMonth} 
              instantOnMobile={true}
              showOnTouch={true}
            >
              Tap for instant tooltip
            </TimestampTooltip>
          </div>
          
          <div className="mobile-item">
            <span className="example-label">Long Press:</span>
            <TimestampTooltip 
              timestamp={lastMonth} 
              instantOnMobile={false}
              showOnTouch={true}
            >
              Long press for tooltip
            </TimestampTooltip>
          </div>
        </div>
      </div>

      <div className="example-section">
        <h4>Custom Formatting</h4>
        <div className="custom-demo">
          <TimestampTooltip 
            timestamp={lastMonth}
            dateFormat={{
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }}
          >
            Custom detailed format
          </TimestampTooltip>
        </div>
      </div>

      <div className="example-section">
        <h4>Live Updates</h4>
        <div className="live-demo">
          <TimestampTooltip 
            timestamp={now}
            liveUpdate={true}
            updateInterval={1000} // Update every second
          >
            Live updating timestamp
          </TimestampTooltip>
        </div>
      </div>

      <div className="example-section">
        <h4>Truncated Text</h4>
        <div className="truncation-demo">
          <TimestampTooltip 
            timestamp={lastWeek}
            maxLength={10}
          >
            This is a very long timestamp text that will be truncated
          </TimestampTooltip>
        </div>
      </div>

      <div className="example-section">
        <h4>Custom Labels</h4>
        <div className="custom-labels-demo">
          <TimestampTooltip 
            timestamp={oneHourAgo}
            relativeLabels={{
              now: 'right now',
              seconds: 'sec ago',
              minute: '1 min ago',
              minutes: 'min ago',
              hour: '1 hr ago',
              hours: 'hrs ago',
              day: '1 day ago',
              days: 'days ago',
              week: '1 week ago',
              weeks: 'weeks ago',
              month: '1 month ago',
              months: 'months ago',
              year: '1 year ago',
              years: 'years ago'
            }}
          >
            Custom labels
          </TimestampTooltip>
        </div>
      </div>

      <div className="example-section">
        <h4>In Real Context</h4>
        <div className="real-context-demo">
          <div className="post-card">
            <div className="post-header">
              <div className="post-author">John Doe</div>
              <div className="post-timestamp">
                <TimestampTooltip 
                  timestamp={yesterday}
                  format="both"
                  position="auto"
                >
                  yesterday
                </TimestampTooltip>
              </div>
            </div>
            <div className="post-content">
              This is an example post showing how timestamp tooltips work in a real context.
            </div>
            <div className="post-actions">
              <button>Like</button>
              <button>Comment</button>
              <button>Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimestampTooltipExample;

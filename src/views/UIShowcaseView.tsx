import React, { useState } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppTextArea } from '../components/AppInput';
import LoadingSpinner from '../components/LoadingSpinner';

export const UIShowcaseView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const handleButtonClick = () => {
    // Button click handler
  };

  return (
    <div className="ui-showcase">
      <style>{`
        .ui-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
        }
        
        .showcase-section {
          margin-bottom: 3rem;
        }
        
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .component-demo {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .button-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }
        
        .size-demo {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .toast-demo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 1rem;
        }
        
        .color-palette {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .color-swatch {
          padding: 1rem;
          border-radius: var(--border-radius-md);
          color: white;
          text-align: center;
          font-weight: 500;
        }
        
        .shadow-demo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }
        
        .shadow-box {
          height: 80px;
          background: var(--surface-primary);
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .animation-demo {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .animated-box {
          width: 100px;
          height: 100px;
          background: var(--accent-primary);
          border-radius: var(--border-radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 500;
          cursor: pointer;
        }
        
        .bounce { animation: bounce 1s infinite; }
        .pulse { animation: pulse 2s infinite; }
        .shake { animation: shake 0.5s infinite; }
        .fade-in { animation: fadeIn 1s ease-in; }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Card enhanced variant="glass" className="showcase-section">
        <h1>Astral Core Enhanced UI System</h1>
        <p>A comprehensive showcase of our enhanced design system featuring modern components, animations, and accessibility features.</p>
      </Card>

      {/* Card Variants */}
      <div className="showcase-section">
        <h2>Card Variants</h2>
        <div className="showcase-grid">
          <Card variant="default">
            <h3>Default Card</h3>
            <p>Standard card styling with clean borders and subtle shadows.</p>
          </Card>
          
          <Card enhanced variant="default">
            <h3>Enhanced Default</h3>
            <p>Enhanced version with improved spacing and modern styling.</p>
          </Card>
          
          <Card enhanced variant="interactive">
            <h3>Interactive Card</h3>
            <p>Hover effects and enhanced interactivity for better user engagement.</p>
          </Card>
          
          <Card enhanced variant="glass">
            <h3>Glass Card</h3>
            <p>Modern glassmorphism effect with backdrop blur and transparency.</p>
          </Card>
          
          <Card enhanced variant="elevated">
            <h3>Elevated Card</h3>
            <p>Enhanced shadows and elevation for important content sections.</p>
          </Card>
        </div>
      </div>

      {/* Button Variants */}
      <div className="showcase-section">
        <h2>Button Variants & Sizes</h2>
        <Card enhanced variant="interactive">
          <h3>Button Variants</h3>
          <div className="button-grid">
            <AppButton variant="primary" onClick={handleButtonClick}>Primary</AppButton>
            <AppButton variant="secondary" onClick={handleButtonClick}>Secondary</AppButton>
            <AppButton variant="ghost" onClick={handleButtonClick}>Ghost</AppButton>
            <AppButton variant="danger" onClick={handleButtonClick}>Danger</AppButton>
          </div>
          
          <h3>Enhanced Buttons</h3>
          <div className="button-grid">
            <AppButton enhanced variant="primary" onClick={handleButtonClick}>Enhanced Primary</AppButton>
            <AppButton enhanced variant="secondary" onClick={handleButtonClick}>Enhanced Secondary</AppButton>
            <AppButton enhanced variant="ghost" onClick={handleButtonClick}>Enhanced Ghost</AppButton>
            <AppButton enhanced variant="danger" onClick={handleButtonClick}>Enhanced Danger</AppButton>
          </div>
          
          <h3>Button Sizes</h3>
          <div className="size-demo">
            <AppButton enhanced size="sm" onClick={handleButtonClick}>Small</AppButton>
            <AppButton enhanced size="md" onClick={handleButtonClick}>Medium</AppButton>
            <AppButton enhanced size="lg" onClick={handleButtonClick}>Large</AppButton>
          </div>
          
          <h3>Button States</h3>
          <div className="size-demo">
            <AppButton enhanced isLoading={isLoading} onClick={handleLoadingDemo}>
              {isLoading ? 'Loading...' : 'Trigger Loading'}
            </AppButton>
            <AppButton enhanced disabled onClick={handleButtonClick}>Disabled</AppButton>
          </div>
        </Card>
      </div>

      {/* Form Components */}
      <div className="showcase-section">
        <h2>Form Components</h2>
        <div className="showcase-grid">
          <Card enhanced variant="glass">
            <h3>Standard Forms</h3>
            <div className="component-demo">
              <AppInput
                label="Standard Input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter some text..."
              />
              <AppTextArea
                label="Standard Textarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder="Enter a longer message..."
                rows={3}
              />
            </div>
          </Card>
          
          <Card enhanced variant="elevated">
            <h3>Enhanced Forms</h3>
            <div className="component-demo">
              <AppInput
                enhanced
                label="Enhanced Input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Modern floating label input..."
                helpText="This input has enhanced styling with floating labels"
              />
              <AppTextArea
                enhanced
                label="Enhanced Textarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder="Enhanced textarea with modern styling..."
                rows={3}
                helpText="Enhanced textarea with better visual feedback"
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Loading States */}
      <div className="showcase-section">
        <h2>Loading Components</h2>
        <div className="showcase-grid">
          <Card enhanced variant="interactive">
            <h3>Standard Loading</h3>
            <LoadingSpinner />
          </Card>
        </div>
      </div>

      {/* Design Tokens */}
      <div className="showcase-section">
        <h2>Design System Tokens</h2>
        
        <Card enhanced variant="glass">
          <h3>Color Palette</h3>
          <div className="color-palette">
            <div className="color-swatch" style={{ backgroundColor: 'var(--accent-primary)' }}>
              Primary
            </div>
            <div className="color-swatch" style={{ backgroundColor: 'var(--accent-secondary)' }}>
              Secondary
            </div>
            <div className="color-swatch" style={{ backgroundColor: 'var(--accent-success)' }}>
              Success
            </div>
            <div className="color-swatch" style={{ backgroundColor: 'var(--accent-warning)' }}>
              Warning
            </div>
            <div className="color-swatch" style={{ backgroundColor: 'var(--accent-danger)' }}>
              Danger
            </div>
          </div>
        </Card>
        
        <Card enhanced variant="elevated">
          <h3>Enhanced Shadows</h3>
          <div className="shadow-demo">
            <div className="shadow-box" style={{ boxShadow: 'var(--shadow-sm)' }}>
              Small
            </div>
            <div className="shadow-box" style={{ boxShadow: 'var(--shadow-md)' }}>
              Medium
            </div>
            <div className="shadow-box" style={{ boxShadow: 'var(--shadow-lg)' }}>
              Large
            </div>
            <div className="shadow-box" style={{ boxShadow: 'var(--shadow-xl)' }}>
              Extra Large
            </div>
            <div className="shadow-box" style={{ boxShadow: 'var(--shadow-glass)' }}>
              Glass
            </div>
          </div>
        </Card>
        
        <Card enhanced variant="interactive">
          <h3>Animation System</h3>
          <p>Enhanced animations with reduced motion support:</p>
          <div className="animation-demo">
            <div className="animated-box bounce">Bounce</div>
            <div className="animated-box pulse">Pulse</div>
            <div className="animated-box shake">Shake</div>
            <div className="animated-box fade-in">Fade In</div>
          </div>
        </Card>
      </div>

      <Card enhanced variant="glass">
        <h2>Implementation Guide</h2>
        <p>To use enhanced components throughout the application:</p>
        <ul>
          <li>Add the <code>enhanced</code> prop to any component</li>
          <li>Use <code>variant</code> props for different styling options</li>
          <li>Leverage <code>size</code> props for responsive design</li>
          <li>All enhancements maintain backward compatibility</li>
          <li>Enhanced components include improved accessibility features</li>
          <li>Animation system respects user's reduced motion preferences</li>
        </ul>
      </Card>
    </div>
  );
};

export default UIShowcaseView;

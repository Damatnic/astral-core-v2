import React, { useState } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import LoadingSpinner from '../components/LoadingSpinner';

export const UIShowcaseView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('components');

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  const buttonVariants = ['primary', 'secondary', 'danger', 'success'];
  const buttonSizes = ['small', 'medium', 'large'];

  return (
    <div className="ui-showcase">
      <div className="showcase-header">
        <h1>UI Component Showcase</h1>
        <p>Explore and test all available UI components</p>
      </div>

      <div className="showcase-tabs">
        <button 
          className={`tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button 
          className={`tab ${activeTab === 'forms' ? 'active' : ''}`}
          onClick={() => setActiveTab('forms')}
        >
          Forms
        </button>
      </div>

      <div className="showcase-content">
        {activeTab === 'components' && (
          <div className="components-showcase">
            <Card title="Buttons" className="showcase-section">
              <div className="component-group">
                <h3>Button Variants</h3>
                <div className="button-grid">
                  {buttonVariants.map(variant => (
                    <AppButton
                      key={variant}
                      variant={variant as any}
                      onClick={() => console.log(`Clicked ${variant}`)}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </AppButton>
                  ))}
                </div>
              </div>

              <div className="component-group">
                <h3>Button Sizes</h3>
                <div className="button-grid">
                  {buttonSizes.map(size => (
                    <AppButton
                      key={size}
                      size={size as any}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </AppButton>
                  ))}
                </div>
              </div>

              <div className="component-group">
                <h3>Button States</h3>
                <div className="button-grid">
                  <AppButton disabled>Disabled</AppButton>
                  <AppButton loading>Loading</AppButton>
                  <AppButton onClick={handleLoadingDemo}>
                    Trigger Loading Demo
                  </AppButton>
                </div>
              </div>
            </Card>

            <Card title="Loading States" className="showcase-section">
              <div className="loading-examples">
                {isLoading ? (
                  <div className="loading-demo">
                    <LoadingSpinner />
                    <p>Loading demo active...</p>
                  </div>
                ) : (
                  <p>Click "Trigger Loading Demo" to see the loading spinner.</p>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'forms' && (
          <div className="forms-showcase">
            <Card title="Form Components" className="showcase-section">
              <div className="form-examples">
                <div className="input-group">
                  <h3>Text Inputs</h3>
                  <AppInput
                    label="Basic Input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter some text..."
                  />
                  
                  <AppInput
                    label="Email Input"
                    type="email"
                    placeholder="user@example.com"
                  />
                  
                  <AppInput
                    label="Disabled Input"
                    disabled
                    value="This input is disabled"
                  />
                  
                  <AppInput
                    label="Input with Error"
                    error="This field is required"
                    placeholder="Required field"
                  />
                </div>

                <div className="form-actions">
                  <AppButton variant="secondary">Reset Form</AppButton>
                  <AppButton>Submit Form</AppButton>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="showcase-footer">
        <p>This showcase demonstrates the available UI components and their various states.</p>
      </div>
    </div>
  );
};

export default UIShowcaseView;

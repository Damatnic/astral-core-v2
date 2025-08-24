import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppInput, AppTextArea } from '../components/AppInput';
import { ViewHeader } from '../components/ViewHeader';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { 
  UserIcon, 
  CameraIcon, 
  StarIcon, 
  CheckIcon, 
  InfoIcon,
  UploadIcon,
  ClockIcon,
  GlobeIcon
} from '../components/icons.dynamic';

interface HelperProfile {
  id?: string;
  userId: string;
  personalInfo: {
    displayName: string;
    bio: string;
    profileImage?: File | string;
    location: {
      city: string;
      state: string;
      country: string;
    };
  };
  experience: {
    yearsOfExperience: number;
    previousRoles: string;
    education: string;
    certifications: string[];
    specializations: string[];
  };
  availability: {
    hoursPerWeek: number;
    timeZone: string;
    preferredSchedule: string[];
    responseTime: string;
  };
  preferences: {
    ageGroups: string[];
    supportTypes: string[];
    languages: string[];
    communicationMethods: string[];
  };
  verification: {
    backgroundCheck: boolean;
    references: boolean;
    training: boolean;
  };
  settings: {
    isPublic: boolean;
    allowDirectContact: boolean;
    showRealName: boolean;
    shareLocation: boolean;
  };
  status: 'draft' | 'pending' | 'approved' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

const CreateHelperProfileView: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [profile, setProfile] = useState<HelperProfile>({
    userId: user?.id || '',
    personalInfo: {
      displayName: '',
      bio: '',
      location: {
        city: '',
        state: '',
        country: 'United States'
      }
    },
    experience: {
      yearsOfExperience: 0,
      previousRoles: '',
      education: '',
      certifications: [],
      specializations: []
    },
    availability: {
      hoursPerWeek: 0,
      timeZone: 'EST',
      preferredSchedule: [],
      responseTime: 'Within 24 hours'
    },
    preferences: {
      ageGroups: [],
      supportTypes: [],
      languages: ['English'],
      communicationMethods: []
    },
    verification: {
      backgroundCheck: false,
      references: false,
      training: false
    },
    settings: {
      isPublic: true,
      allowDirectContact: true,
      showRealName: false,
      shareLocation: false
    },
    status: 'draft'
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  const steps = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Basic information about yourself'
    },
    {
      id: 'experience',
      title: 'Experience & Qualifications',
      description: 'Your background and expertise'
    },
    {
      id: 'availability',
      title: 'Availability',
      description: 'When and how you can help'
    },
    {
      id: 'preferences',
      title: 'Support Preferences',
      description: 'Who and how you prefer to help'
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Complete verification requirements'
    },
    {
      id: 'settings',
      title: 'Privacy & Settings',
      description: 'Control your profile visibility'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your profile before publishing'
    }
  ];

  const specializationOptions = [
    'Anxiety & Stress', 'Depression', 'PTSD & Trauma', 'Addiction Recovery',
    'Grief & Loss', 'Relationship Issues', 'Teen Mental Health', 'Family Support',
    'LGBTQ+ Issues', 'Veterans Support', 'Crisis Intervention', 'Eating Disorders',
    'Bipolar Disorder', 'OCD', 'Social Anxiety', 'Panic Disorders'
  ];

  const ageGroupOptions = [
    'Children (5-12)', 'Teenagers (13-17)', 'Young Adults (18-25)',
    'Adults (26-64)', 'Seniors (65+)'
  ];

  const supportTypeOptions = [
    'One-on-One Support', 'Group Support', 'Crisis Support', 'Peer Mentoring',
    'Educational Support', 'Referral Services', 'Follow-up Care'
  ];

  const communicationMethodOptions = [
    'Text Chat', 'Voice Calls', 'Video Calls', 'Email', 'In-Person (Local)'
  ];

  const scheduleOptions = [
    'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
    'Weekend Mornings', 'Weekend Afternoons', 'Weekend Evenings',
    'Late Night (11PM-6AM)'
  ];

  useEffect(() => {
    loadExistingProfile();
  }, [user]);

  const loadExistingProfile = async () => {
    if (!user) return;
    
    try {
      // Check if user already has a helper profile
      const existingProfile = localStorage.getItem(`helper-profile-${user.id}`);
      if (existingProfile) {
        const parsed = JSON.parse(existingProfile);
        setProfile(parsed);
        setHasExistingProfile(true);
        
        if (parsed.personalInfo.profileImage && typeof parsed.personalInfo.profileImage === 'string') {
          setProfileImagePreview(parsed.personalInfo.profileImage);
        }
        
        if (parsed.status === 'approved') {
          showNotification('info', 'You already have an approved helper profile!');
        }
      }
    } catch (error) {
      console.error('Error loading existing profile:', error);
    }
  };

  const updateProfile = (section: keyof HelperProfile, data: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleArrayToggle = (section: keyof HelperProfile, field: string, value: string) => {
    setProfile(prev => {
      const currentSection = prev[section] as any;
      const currentArray = currentSection[field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item: string) => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: newArray
        }
      };
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('warning', 'Image size must be less than 5MB');
        return;
      }

      updateProfile('personalInfo', { profileImage: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 0: // Personal Info
        return !!(
          profile.personalInfo.displayName &&
          profile.personalInfo.bio &&
          profile.personalInfo.location.city &&
          profile.personalInfo.location.state
        );
      
      case 1: // Experience
        return !!(
          profile.experience.education &&
          profile.experience.specializations.length > 0
        );
      
      case 2: // Availability
        return !!(
          profile.availability.hoursPerWeek > 0 &&
          profile.availability.preferredSchedule.length > 0
        );
      
      case 3: // Preferences
        return !!(
          profile.preferences.ageGroups.length > 0 &&
          profile.preferences.supportTypes.length > 0 &&
          profile.preferences.communicationMethods.length > 0
        );
      
      case 4: // Verification
        return profile.verification.training; // At minimum, training must be completed
      
      case 5: // Settings
        return true; // Settings are optional
      
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      showNotification('warning', 'Please complete all required fields before continuing');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const saveDraft = async () => {
    try {
      setIsLoading(true);
      
      const updatedProfile = {
        ...profile,
        updatedAt: new Date()
      };
      
      localStorage.setItem(`helper-profile-${user?.id}`, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      
      showNotification('success', 'Draft saved successfully');
      
    } catch (error) {
      console.error('Error saving draft:', error);
      showNotification('error', 'Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const submitProfile = async () => {
    if (!validateCurrentStep()) {
      showNotification('warning', 'Please complete all required sections');
      return;
    }

    try {
      setIsLoading(true);
      
      const submittedProfile = {
        ...profile,
        status: 'pending' as const,
        createdAt: profile.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      localStorage.setItem(`helper-profile-${user?.id}`, JSON.stringify(submittedProfile));
      setProfile(submittedProfile);
      
      showNotification('success', 'Helper profile submitted for review! You will be notified once approved.');
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      showNotification('error', 'Failed to submit profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercentage = (): number => {
    const totalSteps = steps.length - 1; // Exclude review step
    let completedSteps = 0;
    
    for (let i = 0; i < totalSteps; i++) {
      const originalStep = currentStep;
      setCurrentStep(i);
      if (validateCurrentStep()) completedSteps++;
      setCurrentStep(originalStep);
    }
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  if (profile.status === 'approved') {
    return (
      <div className="create-helper-profile-view">
        <ViewHeader
          title="Helper Profile"
          subtitle="Your helper profile is active"
        />

        <Card className="profile-status-card">
          <div className="status-success">
            <CheckIcon className="status-icon" />
            <h3>Profile Approved!</h3>
            <p>Your helper profile has been approved and is now active. You can start helping others in the community.</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">Active</span>
                <span className="stat-label">Status</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{profile.experience.specializations.length}</span>
                <span className="stat-label">Specializations</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{profile.availability.hoursPerWeek}</span>
                <span className="stat-label">Hours/Week</span>
              </div>
            </div>

            <div className="profile-actions">
              <AppButton variant="primary">
                View Public Profile
              </AppButton>
              <AppButton variant="secondary">
                Edit Profile
              </AppButton>
              <AppButton variant="secondary">
                View Helper Dashboard
              </AppButton>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (profile.status === 'pending') {
    return (
      <div className="create-helper-profile-view">
        <ViewHeader
          title="Helper Profile"
          subtitle="Your profile is under review"
        />

        <Card className="profile-status-card">
          <div className="status-pending">
            <ClockIcon className="status-icon" />
            <h3>Profile Under Review</h3>
            <p>Thank you for submitting your helper profile! Our team is reviewing your application and will notify you within 3-5 business days.</p>
            
            <div className="review-checklist">
              <h4>What we're reviewing:</h4>
              <ul>
                <li className={profile.verification.training ? 'completed' : ''}>
                  Training completion
                </li>
                <li className={profile.verification.references ? 'completed' : ''}>
                  References verification
                </li>
                <li className={profile.verification.backgroundCheck ? 'completed' : ''}>
                  Background check (if provided)
                </li>
                <li>Profile content and specializations</li>
              </ul>
            </div>

            <AppButton variant="secondary" onClick={saveDraft}>
              Edit Profile
            </AppButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="create-helper-profile-view">
      <ViewHeader
        title={hasExistingProfile ? "Edit Helper Profile" : "Become a Helper"}
        subtitle="Create your profile to start helping others in the community"
      />

      {/* Progress Indicator */}
      <Card className="progress-card">
        <div className="progress-header">
          <h3>Profile Setup Progress</h3>
          <span className="progress-percentage">{getCompletionPercentage()}% Complete</span>
        </div>
        
        <div className="progress-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id} 
              className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">
                {index < currentStep ? <CheckIcon /> : index + 1}
              </div>
              <div className="step-info">
                <span className="step-title">{step.title}</span>
                <span className="step-description">{step.description}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="profile-form">
        {currentStep === 0 && (
          <div className="form-section">
            <h3>Personal Information</h3>
            
            <div className="profile-image-section">
              <div className="image-upload">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile" className="profile-preview" />
                ) : (
                  <div className="image-placeholder">
                    <UserIcon />
                  </div>
                )}
                <label className="upload-button">
                  <CameraIcon />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <p className="image-help">Upload a professional photo (optional). Max 5MB.</p>
            </div>

            <div className="form-grid">
              <AppInput
                label="Display Name *"
                value={profile.personalInfo.displayName}
                onChange={(e) => updateProfile('personalInfo', { displayName: e.target.value })}
                placeholder="How you'd like to be known to users"
                required
              />
            </div>

            <AppTextArea
              label="Bio *"
              value={profile.personalInfo.bio}
              onChange={(e) => updateProfile('personalInfo', { bio: e.target.value })}
              placeholder="Tell users about yourself, your approach to helping, and what makes you a good helper..."
              rows={4}
              required
            />

            <h4>Location</h4>
            <div className="form-grid">
              <AppInput
                label="City *"
                value={profile.personalInfo.location.city}
                onChange={(e) => updateProfile('personalInfo', { 
                  location: { ...profile.personalInfo.location, city: e.target.value }
                })}
                required
              />
              <AppInput
                label="State *"
                value={profile.personalInfo.location.state}
                onChange={(e) => updateProfile('personalInfo', { 
                  location: { ...profile.personalInfo.location, state: e.target.value }
                })}
                required
              />
              <select
                value={profile.personalInfo.location.country}
                onChange={(e) => updateProfile('personalInfo', { 
                  location: { ...profile.personalInfo.location, country: e.target.value }
                })}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="form-section">
            <h3>Experience & Qualifications</h3>
            
            <div className="form-grid">
              <AppInput
                label="Years of Experience"
                type="number"
                value={profile.experience.yearsOfExperience.toString()}
                onChange={(e) => updateProfile('experience', { yearsOfExperience: parseInt(e.target.value) || 0 })}
                min="0"
                max="50"
              />
            </div>

            <AppTextArea
              label="Previous Roles & Experience"
              value={profile.experience.previousRoles}
              onChange={(e) => updateProfile('experience', { previousRoles: e.target.value })}
              placeholder="Describe any relevant work experience, volunteer work, or personal experiences..."
              rows={3}
            />

            <AppTextArea
              label="Education & Training *"
              value={profile.experience.education}
              onChange={(e) => updateProfile('experience', { education: e.target.value })}
              placeholder="Your educational background, relevant courses, certifications, or training..."
              rows={3}
              required
            />

            <div className="specializations-section">
              <h4>Specializations * (Select at least one)</h4>
              <div className="checkbox-grid">
                {specializationOptions.map(spec => (
                  <label key={spec} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.experience.specializations.includes(spec)}
                      onChange={() => handleArrayToggle('experience', 'specializations', spec)}
                    />
                    {spec}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="form-section">
            <h3>Availability</h3>
            
            <div className="form-grid">
              <AppInput
                label="Hours per week you can commit *"
                type="number"
                value={profile.availability.hoursPerWeek.toString()}
                onChange={(e) => updateProfile('availability', { hoursPerWeek: parseInt(e.target.value) || 0 })}
                min="1"
                max="40"
                required
              />
              
              <select
                value={profile.availability.timeZone}
                onChange={(e) => updateProfile('availability', { timeZone: e.target.value })}
              >
                <option value="EST">Eastern Time (EST)</option>
                <option value="CST">Central Time (CST)</option>
                <option value="MST">Mountain Time (MST)</option>
                <option value="PST">Pacific Time (PST)</option>
                <option value="UTC">UTC</option>
              </select>

              <select
                value={profile.availability.responseTime}
                onChange={(e) => updateProfile('availability', { responseTime: e.target.value })}
              >
                <option value="Within 1 hour">Within 1 hour</option>
                <option value="Within 4 hours">Within 4 hours</option>
                <option value="Within 24 hours">Within 24 hours</option>
                <option value="Within 2 days">Within 2 days</option>
                <option value="Within a week">Within a week</option>
              </select>
            </div>

            <div className="schedule-section">
              <h4>Preferred Schedule * (Select all that apply)</h4>
              <div className="checkbox-grid">
                {scheduleOptions.map(schedule => (
                  <label key={schedule} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.availability.preferredSchedule.includes(schedule)}
                      onChange={() => handleArrayToggle('availability', 'preferredSchedule', schedule)}
                    />
                    {schedule}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="form-section">
            <h3>Support Preferences</h3>
            
            <div className="preferences-section">
              <h4>Age Groups * (Select all you're comfortable supporting)</h4>
              <div className="checkbox-grid">
                {ageGroupOptions.map(age => (
                  <label key={age} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.preferences.ageGroups.includes(age)}
                      onChange={() => handleArrayToggle('preferences', 'ageGroups', age)}
                    />
                    {age}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h4>Types of Support * (Select all you can provide)</h4>
              <div className="checkbox-grid">
                {supportTypeOptions.map(type => (
                  <label key={type} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.preferences.supportTypes.includes(type)}
                      onChange={() => handleArrayToggle('preferences', 'supportTypes', type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h4>Communication Methods * (Select all you're comfortable with)</h4>
              <div className="checkbox-grid">
                {communicationMethodOptions.map(method => (
                  <label key={method} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.preferences.communicationMethods.includes(method)}
                      onChange={() => handleArrayToggle('preferences', 'communicationMethods', method)}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div className="languages-section">
                <h4>Languages</h4>
                <AppInput
                  placeholder="Add languages you speak"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const lang = e.currentTarget.value.trim();
                      if (!profile.preferences.languages.includes(lang)) {
                        updateProfile('preferences', {
                          languages: [...profile.preferences.languages, lang]
                        });
                      }
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <div className="language-tags">
                  {profile.preferences.languages.map(lang => (
                    <span key={lang} className="language-tag">
                      {lang}
                      <button
                        onClick={() => updateProfile('preferences', {
                          languages: profile.preferences.languages.filter(l => l !== lang)
                        })}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="form-section">
            <h3>Verification</h3>
            <p className="section-description">
              Complete these verification steps to build trust with the community and ensure safety.
            </p>
            
            <div className="verification-items">
              <div className="verification-item">
                <div className="verification-header">
                  <h4>Helper Training *</h4>
                  <span className={`verification-status ${profile.verification.training ? 'completed' : 'pending'}`}>
                    {profile.verification.training ? 'Completed' : 'Required'}
                  </span>
                </div>
                <p>Complete our helper training program to learn best practices and safety guidelines.</p>
                <div className="verification-actions">
                  {!profile.verification.training ? (
                    <AppButton 
                      variant="primary"
                      onClick={() => {
                        // Simulate training completion
                        updateProfile('verification', { training: true });
                        showNotification('success', 'Training completed!');
                      }}
                    >
                      Start Training
                    </AppButton>
                  ) : (
                    <span className="completed-indicator">
                      <CheckIcon /> Training Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="verification-item">
                <div className="verification-header">
                  <h4>References</h4>
                  <span className={`verification-status ${profile.verification.references ? 'completed' : 'optional'}`}>
                    {profile.verification.references ? 'Provided' : 'Optional'}
                  </span>
                </div>
                <p>Provide references who can speak to your character and ability to help others.</p>
                <div className="verification-actions">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.verification.references}
                      onChange={(e) => updateProfile('verification', { references: e.target.checked })}
                    />
                    I have provided references
                  </label>
                </div>
              </div>

              <div className="verification-item">
                <div className="verification-header">
                  <h4>Background Check</h4>
                  <span className={`verification-status ${profile.verification.backgroundCheck ? 'completed' : 'optional'}`}>
                    {profile.verification.backgroundCheck ? 'Completed' : 'Optional'}
                  </span>
                </div>
                <p>Complete a background check for additional trust and verification (recommended for crisis support).</p>
                <div className="verification-actions">
                  <label className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={profile.verification.backgroundCheck}
                      onChange={(e) => updateProfile('verification', { backgroundCheck: e.target.checked })}
                    />
                    I have completed a background check
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="form-section">
            <h3>Privacy & Settings</h3>
            
            <div className="settings-grid">
              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={profile.settings.isPublic}
                    onChange={(e) => updateProfile('settings', { isPublic: e.target.checked })}
                  />
                  <div className="setting-info">
                    <h4>Make profile public</h4>
                    <p>Allow users to find and contact you directly</p>
                  </div>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={profile.settings.allowDirectContact}
                    onChange={(e) => updateProfile('settings', { allowDirectContact: e.target.checked })}
                  />
                  <div className="setting-info">
                    <h4>Allow direct contact</h4>
                    <p>Users can message you directly without matching</p>
                  </div>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={profile.settings.showRealName}
                    onChange={(e) => updateProfile('settings', { showRealName: e.target.checked })}
                  />
                  <div className="setting-info">
                    <h4>Show real name</h4>
                    <p>Display your real name instead of display name</p>
                  </div>
                </label>
              </div>

              <div className="setting-item">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={profile.settings.shareLocation}
                    onChange={(e) => updateProfile('settings', { shareLocation: e.target.checked })}
                  />
                  <div className="setting-info">
                    <h4>Share location</h4>
                    <p>Show your city and state to help users find local support</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="form-section">
            <h3>Review & Submit</h3>
            <p>Please review your helper profile before submitting for approval.</p>
            
            <div className="profile-summary">
              <div className="summary-section">
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {profile.personalInfo.displayName}</p>
                <p><strong>Location:</strong> {profile.personalInfo.location.city}, {profile.personalInfo.location.state}</p>
                <p><strong>Bio:</strong> {profile.personalInfo.bio.substring(0, 100)}...</p>
              </div>

              <div className="summary-section">
                <h4>Experience</h4>
                <p><strong>Years of Experience:</strong> {profile.experience.yearsOfExperience}</p>
                <p><strong>Specializations:</strong> {profile.experience.specializations.join(', ')}</p>
              </div>

              <div className="summary-section">
                <h4>Availability</h4>
                <p><strong>Hours per week:</strong> {profile.availability.hoursPerWeek}</p>
                <p><strong>Response time:</strong> {profile.availability.responseTime}</p>
                <p><strong>Schedule:</strong> {profile.availability.preferredSchedule.join(', ')}</p>
              </div>

              <div className="summary-section">
                <h4>Verification Status</h4>
                <p>Training: {profile.verification.training ? '✓ Completed' : '✗ Not completed'}</p>
                <p>References: {profile.verification.references ? '✓ Provided' : '✗ Not provided'}</p>
                <p>Background Check: {profile.verification.backgroundCheck ? '✓ Completed' : '✗ Not completed'}</p>
              </div>
            </div>

            <div className="submission-note">
              <InfoIcon />
              <div>
                <h4>What happens next?</h4>
                <p>After submitting, our team will review your profile within 3-5 business days. You'll receive an email notification once your profile is approved and you can start helping others!</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 0 && (
              <AppButton
                variant="secondary"
                onClick={prevStep}
                disabled={isLoading}
              >
                Previous
              </AppButton>
            )}
          </div>

          <div className="nav-center">
            <AppButton
              variant="secondary"
              onClick={saveDraft}
              disabled={isLoading}
            >
              Save Draft
            </AppButton>
          </div>

          <div className="nav-right">
            {currentStep < steps.length - 1 ? (
              <AppButton
                variant="primary"
                onClick={nextStep}
                disabled={isLoading}
              >
                Next
              </AppButton>
            ) : (
              <AppButton
                variant="primary"
                onClick={submitProfile}
                disabled={isLoading || !profile.verification.training}
              >
                {isLoading ? 'Submitting...' : 'Submit for Review'}
              </AppButton>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreateHelperProfileView;

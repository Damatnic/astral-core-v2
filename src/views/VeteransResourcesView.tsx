import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { ViewHeader } from '../components/ViewHeader';
import { AppButton } from '../components/AppButton';
import { useNotification } from '../contexts/NotificationContext';
import './VeteransResourcesView.css';

interface ResourceCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  priority: 'human' | 'hybrid' | 'ai';
}

interface Resource {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  phone?: string;
  website?: string;
  hours?: string;
  isEmergency?: boolean;
  isFree?: boolean;
  waitTime?: string;
  services?: string[];
  locations?: string[];
}

const VeteransResourcesView: React.FC = () => {
  const { addToast } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState<string>('crisis');
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categories: ResourceCategory[] = [
    {
      id: 'crisis',
      title: 'Crisis Support',
      icon: '🚨',
      description: 'Immediate human support when you need it most',
      priority: 'human'
    },
    {
      id: 'counseling',
      title: 'Counseling & Therapy',
      icon: '💬',
      description: 'Professional mental health support from trained counselors',
      priority: 'human'
    },
    {
      id: 'peer',
      title: 'Peer Support',
      icon: '🤝',
      description: 'Connect with fellow veterans who understand your journey',
      priority: 'human'
    },
    {
      id: 'va',
      title: 'VA Services',
      icon: '🏥',
      description: 'Official VA healthcare and benefits assistance',
      priority: 'human'
    },
    {
      id: 'family',
      title: 'Family Support',
      icon: '👨‍👩‍👧‍👦',
      description: 'Resources for veterans and their families',
      priority: 'human'
    },
    {
      id: 'employment',
      title: 'Career & Education',
      icon: '💼',
      description: 'Job placement and educational opportunities',
      priority: 'human'
    },
    {
      id: 'housing',
      title: 'Housing Assistance',
      icon: '🏠',
      description: 'Help finding stable housing and shelter',
      priority: 'human'
    },
    {
      id: 'legal',
      title: 'Legal Aid',
      icon: '⚖️',
      description: 'Free legal assistance for veterans',
      priority: 'human'
    },
    {
      id: 'wellness',
      title: 'Wellness Programs',
      icon: '🌱',
      description: 'Holistic health and wellness support',
      priority: 'hybrid'
    },
    {
      id: 'ai',
      title: 'AI Assistant',
      icon: '🤖',
      description: 'Supplemental AI support when human help is unavailable',
      priority: 'ai'
    }
  ];

  const resources: Resource[] = [
    // Crisis Support - Human First
    {
      id: 'vcl',
      categoryId: 'crisis',
      title: 'Veterans Crisis Line',
      description: 'Free, confidential support 24/7 for veterans in crisis. Trained responders, many of whom are veterans themselves.',
      phone: '988, Press 1',
      website: 'https://www.veteranscrisisline.net',
      hours: '24/7',
      isEmergency: true,
      isFree: true,
      services: ['Crisis counseling', 'Suicide prevention', 'Text support (838255)', 'Online chat', 'TTY support']
    },
    {
      id: 'mcc',
      categoryId: 'crisis',
      title: 'Military Crisis Line',
      description: 'Immediate support from counselors who understand military culture and experiences.',
      phone: '1-800-273-8255',
      hours: '24/7',
      isEmergency: true,
      isFree: true,
      services: ['Crisis intervention', 'Safety planning', 'Resource referrals']
    },
    {
      id: 'wwp-talk',
      categoryId: 'crisis',
      title: 'Wounded Warrior Project - Talk',
      description: 'Emotional support for warriors, family members, and caregivers.',
      phone: '1-888-997-2586',
      hours: '24/7',
      isEmergency: false,
      isFree: true,
      services: ['Emotional support', 'Resource navigation', 'Peer support']
    },

    // Counseling & Therapy - Human Professionals
    {
      id: 'gwyb',
      categoryId: 'counseling',
      title: 'Give an Hour',
      description: 'Free mental health services from volunteer licensed professionals.',
      website: 'https://giveanhour.org',
      isFree: true,
      waitTime: '1-2 weeks',
      services: ['Individual therapy', 'Couples counseling', 'Family therapy', 'Group sessions']
    },
    {
      id: 'vet-centers',
      categoryId: 'counseling',
      title: 'Vet Centers',
      description: 'Community-based counseling centers with trained professionals who are often veterans.',
      phone: '1-877-927-8387',
      website: 'https://www.va.gov/find-locations',
      isFree: true,
      waitTime: '1-3 days',
      services: ['Readjustment counseling', 'PTSD treatment', 'MST counseling', 'Bereavement counseling', 'Employment assistance'],
      locations: ['300+ locations nationwide']
    },
    {
      id: 'cohen-clinics',
      categoryId: 'counseling',
      title: 'Cohen Veterans Network',
      description: 'High-quality mental health care for post-9/11 veterans and families.',
      website: 'https://www.cohenveteransnetwork.org',
      isFree: true,
      waitTime: 'Same week',
      services: ['Evidence-based therapy', 'Telehealth options', 'Family therapy', 'Child & adolescent services']
    },
    {
      id: 'home-base',
      categoryId: 'counseling',
      title: 'Home Base Program',
      description: 'Dedicated to healing invisible wounds of war for veterans and families.',
      phone: '617-724-5202',
      website: 'https://homebase.org',
      isFree: true,
      services: ['Intensive clinical programs', '2-week outpatient program', 'Virtual therapy', 'Family programs']
    },

    // Peer Support - Veteran to Veteran
    {
      id: 'team-rwb',
      categoryId: 'peer',
      title: 'Team Red White & Blue',
      description: 'Connect with local veterans through physical and social activities.',
      website: 'https://www.teamrwb.org',
      isFree: true,
      services: ['Local chapter events', 'Athletic programs', 'Leadership development', 'Social activities']
    },
    {
      id: 'iava',
      categoryId: 'peer',
      title: 'Iraq and Afghanistan Veterans of America',
      description: 'Community of post-9/11 veterans supporting each other.',
      website: 'https://iava.org',
      isFree: true,
      services: ['Quick Reaction Force (case management)', 'Peer support groups', 'Online communities', 'Advocacy']
    },
    {
      id: 'vfw',
      categoryId: 'peer',
      title: 'Veterans of Foreign Wars (VFW)',
      description: 'Nationwide network of veterans helping veterans.',
      phone: '1-833-839-8387',
      website: 'https://www.vfw.org',
      isFree: true,
      services: ['Local post meetings', 'Benefits assistance', 'Emergency financial grants', 'Mental wellness support'],
      locations: ['6,000+ posts nationwide']
    },
    {
      id: 'american-legion',
      categoryId: 'peer',
      title: 'American Legion',
      description: 'Veteran service organization with local posts across America.',
      phone: '1-800-433-3318',
      website: 'https://www.legion.org',
      isFree: true,
      services: ['Buddy checks', 'Benefits assistance', 'Career fairs', 'Youth programs'],
      locations: ['12,000+ posts worldwide']
    },
    {
      id: 'bv-peer',
      categoryId: 'peer',
      title: 'Battle Buddies',
      description: 'Peer support program matching veterans with trained peer specialists.',
      phone: '1-888-923-9673',
      isFree: true,
      services: ['1-on-1 peer support', 'Group meetings', 'Activity-based healing', 'Family support']
    },

    // VA Services
    {
      id: 'va-benefits',
      categoryId: 'va',
      title: 'VA Benefits Hotline',
      description: 'Get help with VA benefits, claims, and healthcare enrollment.',
      phone: '1-800-827-1000',
      hours: 'Mon-Fri, 8am-9pm ET',
      website: 'https://www.va.gov',
      isFree: true,
      services: ['Benefits enrollment', 'Claims assistance', 'Healthcare registration', 'Prescription refills']
    },
    {
      id: 'va-caregiver',
      categoryId: 'va',
      title: 'VA Caregiver Support',
      description: 'Support for family caregivers of veterans.',
      phone: '1-855-260-3274',
      website: 'https://www.caregiver.va.gov',
      isFree: true,
      services: ['Caregiver training', 'Respite care', 'Support groups', 'Financial assistance']
    },
    {
      id: 'va-homeless',
      categoryId: 'va',
      title: 'National Call Center for Homeless Veterans',
      description: 'Connect with trained counselors 24/7.',
      phone: '1-877-424-3838',
      hours: '24/7',
      isEmergency: true,
      isFree: true,
      services: ['Emergency shelter', 'Rapid rehousing', 'Transitional housing', 'Employment assistance']
    },

    // Family Support
    {
      id: 'taps',
      categoryId: 'family',
      title: 'TAPS - Tragedy Assistance Program',
      description: 'Support for families of fallen military heroes.',
      phone: '1-800-959-8277',
      hours: '24/7',
      website: 'https://www.taps.org',
      isFree: true,
      services: ['Grief counseling', 'Survivor seminars', 'Youth programs', 'Peer mentors']
    },
    {
      id: 'nmfa',
      categoryId: 'family',
      title: 'National Military Family Association',
      description: 'Supporting military families through every stage of military life.',
      website: 'https://www.militaryfamily.org',
      isFree: true,
      services: ['Scholarships', 'Camps for military kids', 'Spouse employment', 'Resource guides']
    },
    {
      id: 'operation-homefront',
      categoryId: 'family',
      title: 'Operation Homefront',
      description: 'Building strong, stable, and secure military families.',
      phone: '1-800-722-6098',
      website: 'https://www.operationhomefront.org',
      isFree: true,
      services: ['Emergency financial assistance', 'Transitional housing', 'Baby showers', 'Holiday programs']
    },

    // Employment & Education
    {
      id: 'hire-heroes',
      categoryId: 'employment',
      title: 'Hire Heroes USA',
      description: 'Free career coaching and job placement for veterans and spouses.',
      phone: '1-844-634-1520',
      website: 'https://www.hireheroesusa.org',
      isFree: true,
      services: ['Resume translation', 'Interview prep', 'Career coaching', 'Virtual career fairs']
    },
    {
      id: 'boots-to-business',
      categoryId: 'employment',
      title: 'Boots to Business',
      description: 'Entrepreneurship training for transitioning service members.',
      website: 'https://www.sba.gov/b2b',
      isFree: true,
      services: ['Business fundamentals', 'Business plan development', 'SBA resources', 'Mentorship']
    },
    {
      id: 'svsa',
      categoryId: 'employment',
      title: 'Student Veterans of America',
      description: 'Supporting veterans in higher education.',
      website: 'https://studentveterans.org',
      isFree: true,
      services: ['Chapter network', 'Scholarships', 'Career resources', 'Leadership programs']
    },

    // Housing Assistance
    {
      id: 'ssvf',
      categoryId: 'housing',
      title: 'Supportive Services for Veteran Families',
      description: 'Rapid re-housing and homelessness prevention.',
      phone: '1-877-424-3838',
      isFree: true,
      services: ['Rental assistance', 'Utility deposits', 'Moving costs', 'Case management']
    },
    {
      id: 'hud-vash',
      categoryId: 'housing',
      title: 'HUD-VASH Program',
      description: 'Permanent housing and case management for homeless veterans.',
      phone: '1-877-424-3838',
      website: 'https://www.va.gov/homeless/hud-vash.asp',
      isFree: true,
      services: ['Housing vouchers', 'Clinical services', 'Case management', 'Community support']
    },

    // Legal Aid
    {
      id: 'nvlsp',
      categoryId: 'legal',
      title: 'National Veterans Legal Services Program',
      description: 'Free legal representation for veterans benefits claims.',
      phone: '202-265-8305',
      website: 'https://www.nvlsp.org',
      isFree: true,
      services: ['Benefits appeals', 'Discharge upgrades', 'Legal training', 'Pro bono network']
    },
    {
      id: 'veterans-consortium',
      categoryId: 'legal',
      title: 'Veterans Consortium Pro Bono Program',
      description: 'Free attorneys for veterans at the U.S. Court of Appeals.',
      phone: '1-888-838-7727',
      website: 'https://www.vetsprobono.org',
      isFree: true,
      services: ['Federal appeals', 'Legal representation', 'Case evaluation']
    },

    // Wellness Programs - Hybrid Approach
    {
      id: 'wwp-wellness',
      categoryId: 'wellness',
      title: 'Wounded Warrior Project Wellness',
      description: 'Physical and mental wellness programs combining human coaches with tracking tools.',
      phone: '1-888-997-2586',
      website: 'https://www.woundedwarriorproject.org',
      isFree: true,
      services: ['Coaching', 'Fitness programs', 'Nutrition guidance', 'Mindfulness training']
    },
    {
      id: 'k9s-for-warriors',
      categoryId: 'wellness',
      title: 'K9s For Warriors',
      description: 'Service dogs for veterans with PTSD, traumatic brain injury, and MST.',
      phone: '904-686-1956',
      website: 'https://k9sforwarriors.org',
      isFree: true,
      waitTime: '12-18 months',
      services: ['Service dog training', '3-week program', 'Lifetime support', 'Equipment provided']
    },
    {
      id: 'warriors-heart',
      categoryId: 'wellness',
      title: "Warriors Heart",
      description: 'Healing center exclusively for warriors struggling with addiction and PTSD.',
      phone: '1-844-448-2567',
      website: 'https://warriorsheart.com',
      services: ['Inpatient treatment', 'Detox services', 'PTSD treatment', 'Aftercare planning']
    },

    // AI Support - Secondary/Supplemental
    {
      id: 'ai-companion',
      categoryId: 'ai',
      title: 'AI Support Companion',
      description: 'Available 24/7 when human support is unavailable. Not a replacement for professional care.',
      services: ['Resource navigation', 'Coping strategies', 'Appointment reminders', 'Symptom tracking'],
      isFree: true
    },
    {
      id: 'va-chatbot',
      categoryId: 'ai',
      title: 'VA Benefits Chatbot',
      description: 'Quick answers about VA benefits and services. For complex issues, connects you with a human.',
      website: 'https://www.va.gov',
      services: ['Benefits eligibility', 'Form assistance', 'Appointment scheduling', 'Prescription refills'],
      isFree: true
    }
  ];

  useEffect(() => {
    // Request location for finding nearby resources
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location error:', error);
        }
      );
    }
  }, []);

  const handleCallResource = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone.replace(/\D/g, '')}`;
      addToast('Connecting you to support...', 'info');
    }
  };

  const handleVisitWebsite = (website: string) => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  const filteredResources = resources.filter(r => r.categoryId === selectedCategory);

  return (
    <div className="veterans-resources-view">
      <ViewHeader
        title="Veterans Resources"
        subtitle="Human support first, always. You've earned it."
      />

      {/* Emergency Banner */}
      <Card className="emergency-banner">
        <div className="emergency-content">
          <span className="emergency-icon">🚨</span>
          <div className="emergency-text">
            <strong>Need immediate help?</strong>
            <p>Veterans Crisis Line: Call 988, Press 1</p>
          </div>
          <AppButton
            variant="danger"
            onClick={() => handleCallResource('988')}
            className="emergency-btn"
          >
            Call Now
          </AppButton>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''} priority-${category.priority}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-title">{category.title}</span>
          </button>
        ))}
      </div>

      {/* Category Description */}
      {selectedCategory && (
        <Card className="category-description">
          <p>{categories.find(c => c.id === selectedCategory)?.description}</p>
        </Card>
      )}

      {/* Resources List */}
      <div className="resources-list">
        {filteredResources.map(resource => (
          <Card 
            key={resource.id} 
            className={`resource-card ${resource.isEmergency ? 'emergency' : ''}`}
          >
            <div className="resource-header">
              <h3>{resource.title}</h3>
              {resource.isEmergency && <span className="emergency-badge">24/7 Crisis</span>}
              {resource.isFree && <span className="free-badge">Free</span>}
            </div>

            <p className="resource-description">{resource.description}</p>

            {resource.services && (
              <div className="resource-services">
                <strong>Services:</strong>
                <ul>
                  {resource.services.slice(0, expandedResource === resource.id ? undefined : 3).map((service, idx) => (
                    <li key={idx}>{service}</li>
                  ))}
                </ul>
                {resource.services.length > 3 && expandedResource !== resource.id && (
                  <button 
                    className="show-more-btn"
                    onClick={() => setExpandedResource(resource.id)}
                  >
                    Show {resource.services.length - 3} more...
                  </button>
                )}
              </div>
            )}

            {resource.waitTime && (
              <div className="resource-wait">
                <strong>Typical wait:</strong> {resource.waitTime}
              </div>
            )}

            {resource.hours && (
              <div className="resource-hours">
                <strong>Hours:</strong> {resource.hours}
              </div>
            )}

            {resource.locations && (
              <div className="resource-locations">
                <strong>Locations:</strong> {resource.locations.join(', ')}
              </div>
            )}

            <div className="resource-actions">
              {resource.phone && (
                <AppButton
                  variant="primary"
                  onClick={() => handleCallResource(resource.phone!)}
                  className="call-btn"
                >
                  📞 Call {resource.phone}
                </AppButton>
              )}
              {resource.website && (
                <AppButton
                  variant="secondary"
                  onClick={() => handleVisitWebsite(resource.website!)}
                  className="website-btn"
                >
                  🌐 Visit Website
                </AppButton>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Local Resources */}
      {userLocation && selectedCategory !== 'ai' && (
        <Card className="local-resources">
          <h3>Find Local Resources</h3>
          <p>Based on your location, here are nearby options:</p>
          <AppButton
            variant="secondary"
            onClick={() => {
              const query = selectedCategory === 'va' ? 'VA hospital' : 'veteran services';
              window.open(`https://maps.google.com/maps?q=${query} near me`, '_blank');
            }}
          >
            Open in Maps
          </AppButton>
        </Card>
      )}

      {/* Human Connection Emphasis */}
      {selectedCategory === 'ai' && (
        <Card className="ai-disclaimer">
          <h3>⚠️ Important Note About AI Support</h3>
          <p>
            AI tools are designed to supplement, not replace, human support. 
            They can help when human assistance isn't immediately available, 
            but we strongly encourage connecting with real people who understand 
            your experiences.
          </p>
          <p>
            <strong>Remember:</strong> You've earned the right to speak with 
            someone who truly understands. If you're struggling, please consider 
            reaching out to one of our human support options first.
          </p>
          <AppButton
            variant="primary"
            onClick={() => setSelectedCategory('crisis')}
          >
            View Human Support Options
          </AppButton>
        </Card>
      )}

      {/* Quick Connect Section */}
      <Card className="quick-connect">
        <h3>Quick Connect</h3>
        <p>Not sure where to start? These organizations can help you navigate all available resources:</p>
        <div className="quick-connect-grid">
          <AppButton
            variant="primary"
            onClick={() => handleCallResource('988')}
          >
            Veterans Crisis Line
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => handleCallResource('18008279100')}
          >
            VA Benefits Hotline
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => handleCallResource('18889972586')}
          >
            Wounded Warrior Project
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => handleCallResource('18339238387')}
          >
            VFW Help Line
          </AppButton>
        </div>
      </Card>
    </div>
  );
};

export default VeteransResourcesView;
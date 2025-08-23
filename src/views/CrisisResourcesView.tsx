import React, { useState, useEffect } from 'react';
import { ApiClient } from '../utils/ApiClient';
import { Resource } from '../types';
import { SearchIcon, PhoneIcon, HeartIcon, SparkleIcon, ShieldIcon, ClockIcon, UserIcon, HomeIcon } from '../components/icons.dynamic';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { CrisisSupportWidget } from '../components/CrisisSupportWidget';
import { BreathingWidget } from '../components/BreathingWidget';
import '../styles/crisis-resources.css';

const RESOURCE_CATEGORIES = ['All', 'Emergency Help', 'Text Support', 'Youth & Students', 'Veterans', 'LGBTQ+', 'Coping Strategies'];

const DEMOGRAPHIC_RESOURCES = {
    'Youth & Students': {
        icon: UserIcon,
        color: '#3B82F6',
        description: 'Specialized support for young people and students'
    },
    'Veterans': {
        icon: HomeIcon,
        color: '#10B981',
        description: 'Resources specifically for military veterans'
    },
    'LGBTQ+': {
        icon: HeartIcon,
        color: '#F59E0B',
        description: 'Safe spaces and support for LGBTQ+ individuals'
    }
};

const EMERGENCY_NUMBERS = [
    {
        name: 'National Suicide Prevention Lifeline',
        number: '988',
        description: '24/7 free and confidential support',
        type: 'crisis'
    },
    {
        name: 'Crisis Text Line',
        number: '741741',
        description: 'Text HOME for immediate support',
        type: 'text'
    },
    {
        name: 'Emergency Services',
        number: '911',
        description: 'Life-threatening emergencies',
        type: 'emergency'
    }
];

const EmergencyNumberCard: React.FC<{ emergency: typeof EMERGENCY_NUMBERS[0] }> = ({ emergency }) => (
    <Card className={`emergency-card ${emergency.type}`}>
        <div className="emergency-header">
            <PhoneIcon className="emergency-icon" />
            <div className="emergency-info">
                <h3>{emergency.name}</h3>
                <p>{emergency.description}</p>
            </div>
        </div>
        <div className="emergency-actions">
            <AppButton
                variant="primary"
                className="call-button"
                onClick={() => {
                    if (emergency.type === 'text') {
                        window.open(`sms:${emergency.number}?body=HOME`, '_blank');
                    } else {
                        window.open(`tel:${emergency.number}`, '_blank');
                    }
                }}
            >
                {emergency.type === 'text' ? `Text ${emergency.number}` : `Call ${emergency.number}`}
            </AppButton>
        </div>
    </Card>
);

const ResourceCard: React.FC<{ resource: Resource; priority?: boolean }> = ({ resource, priority }) => {
    const categoryInfo = DEMOGRAPHIC_RESOURCES[resource.category as keyof typeof DEMOGRAPHIC_RESOURCES];
    const IconComponent = categoryInfo?.icon || ShieldIcon;
    
    return (
        <Card className={`resource-card ${priority ? 'priority-resource' : ''} ${resource.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
            <div className="resource-header">
                <div className="resource-title-section">
                    {categoryInfo && <IconComponent className="category-icon" style={{ color: categoryInfo.color }} />}
                    <h3>{resource.title}</h3>
                </div>
                {priority && <span className="priority-badge">Immediate Help</span>}
            </div>
            <p className="resource-description">{resource.description}</p>
            <div className="resource-contact">
                {resource.contact ? (
                    <div className="contact-info">
                        <PhoneIcon />
                        <strong>{resource.contact}</strong>
                        <AppButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                const phoneNumber = resource.contact?.replace(/[^\d]/g, '');
                                if (phoneNumber) {
                                    window.open(`tel:${phoneNumber}`, '_blank');
                                }
                            }}
                            className="quick-call-btn"
                        >
                            Call Now
                        </AppButton>
                    </div>
                ) : (
                    <AppButton 
                        variant="secondary" 
                        onClick={() => window.open(resource.link, '_blank')} 
                        className="resource-button"
                    >
                        Learn More
                    </AppButton>
                )}
            </div>
        </Card>
    );
};

const SafetyPlanAccess: React.FC = () => (
    <Card className="safety-plan-card">
        <div className="safety-plan-header">
            <ShieldIcon className="safety-icon" />
            <div className="safety-plan-info">
                <h3>Personal Safety Plan</h3>
                <p>Quick access to your personalized crisis management plan</p>
            </div>
        </div>
        <div className="safety-plan-actions">
            <AppButton
                variant="primary"
                onClick={() => window.location.href = '#/safety-plan'}
                className="safety-plan-btn"
            >
                View My Safety Plan
            </AppButton>
            <AppButton
                variant="secondary"
                onClick={() => window.location.href = '#/create-safety-plan'}
                className="create-safety-plan-btn"
            >
                Create Safety Plan
            </AppButton>
        </div>
    </Card>
);

export const CrisisResourcesView = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setIsLoading(true);
        ApiClient.resources.getResources()
            .then(data => {
                setResources(Array.isArray(data) ? data : []);
                setFilteredResources(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                console.error('Failed to load resources:', error);
                // Enhanced fallback crisis resources with demographic categories
                const fallbackResources: Resource[] = [
                    // Emergency Help
                    {
                        id: 'crisis-1',
                        title: 'National Suicide Prevention Lifeline',
                        description: '24/7 free and confidential support for people in distress and prevention resources.',
                        category: 'Emergency Help',
                        contact: '988',
                        link: 'https://suicidepreventionlifeline.org'
                    },
                    {
                        id: 'crisis-2',
                        title: 'Emergency Services',
                        description: 'For immediate life-threatening emergencies requiring police, fire, or medical response.',
                        category: 'Emergency Help',
                        contact: '911',
                        link: ''
                    },
                    {
                        id: 'crisis-3',
                        title: 'SAMHSA National Helpline',
                        description: 'Treatment referral and information service for mental health and substance use disorders.',
                        category: 'Emergency Help',
                        contact: '1-800-662-4357',
                        link: 'https://samhsa.gov'
                    },
                    // Text Support
                    {
                        id: 'text-1',
                        title: 'Crisis Text Line',
                        description: 'Free, 24/7 crisis support via text message. Trained counselors available immediately.',
                        category: 'Text Support',
                        contact: 'Text HOME to 741741',
                        link: 'https://crisistextline.org'
                    },
                    {
                        id: 'text-2',
                        title: 'Teen Line Text Support',
                        description: 'Text support specifically for teenagers, by trained teen volunteers.',
                        category: 'Text Support',
                        contact: 'Text TEEN to 839863',
                        link: 'https://teenlineonline.org'
                    },
                    // Youth & Students
                    {
                        id: 'youth-1',
                        title: 'National Suicide Prevention Lifeline (Youth)',
                        description: 'Specialized support for young people experiencing suicidal thoughts.',
                        category: 'Youth & Students',
                        contact: '988',
                        link: 'https://suicidepreventionlifeline.org'
                    },
                    {
                        id: 'youth-2',
                        title: 'JED Campus Mental Health',
                        description: 'Mental health resources and support specifically designed for college students.',
                        category: 'Youth & Students',
                        contact: '',
                        link: 'https://jedcampus.org'
                    },
                    // Veterans
                    {
                        id: 'veterans-1',
                        title: 'Veterans Crisis Line',
                        description: '24/7 confidential support for Veterans and their families, even if not enrolled in VA.',
                        category: 'Veterans',
                        contact: '1-800-273-8255 Press 1',
                        link: 'https://veteranscrisisline.net'
                    },
                    {
                        id: 'veterans-2',
                        title: 'Veterans Text Support',
                        description: 'Text support for Veterans experiencing crisis or emotional distress.',
                        category: 'Veterans',
                        contact: 'Text 838255',
                        link: 'https://veteranscrisisline.net'
                    },
                    // LGBTQ+
                    {
                        id: 'lgbtq-1',
                        title: 'The Trevor Project',
                        description: '24/7 crisis support services to LGBTQ young people under 25.',
                        category: 'LGBTQ+',
                        contact: '1-866-488-7386',
                        link: 'https://thetrevorproject.org'
                    },
                    {
                        id: 'lgbtq-2',
                        title: 'Trans Lifeline',
                        description: 'Crisis hotline staffed by transgender people for transgender people.',
                        category: 'LGBTQ+',
                        contact: '877-565-8860',
                        link: 'https://translifeline.org'
                    },
                    // Coping Strategies
                    {
                        id: 'coping-1',
                        title: 'Breathing Techniques for Anxiety',
                        description: 'Learn the 4-7-8 breathing technique and box breathing to manage anxiety attacks.',
                        category: 'Coping Strategies',
                        contact: '',
                        link: '#/quiet-space'
                    },
                    {
                        id: 'coping-2',
                        title: 'Grounding Exercises (5-4-3-2-1)',
                        description: 'Use your senses to ground yourself: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
                        category: 'Coping Strategies',
                        contact: '',
                        link: '#/quiet-space'
                    },
                    {
                        id: 'coping-3',
                        title: 'Progressive Muscle Relaxation',
                        description: 'Systematic tensing and relaxing of muscle groups to reduce physical tension.',
                        category: 'Coping Strategies',
                        contact: '',
                        link: '#/quiet-space'
                    },
                    {
                        id: 'coping-4',
                        title: 'Mindfulness Meditation',
                        description: 'Simple mindfulness exercises to help center yourself in the present moment.',
                        category: 'Coping Strategies',
                        contact: '',
                        link: '#/quiet-space'
                    }
                ];
                setResources(fallbackResources);
                setFilteredResources(fallbackResources);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        let results = resources;
        if (activeCategory !== 'All') {
            results = results.filter(r => r.category === activeCategory);
        }
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            results = results.filter(r =>
                r.title.toLowerCase().includes(lowerCaseSearchTerm) ||
                r.description.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        setFilteredResources(results);
    }, [activeCategory, searchTerm, resources]);

    return (
        <div className="crisis-resources-container">
            <div className="calm-header">
                <h1>Crisis Support & Resources</h1>
                <p>You're not alone. Here you'll find helpful resources and immediate support when you need it most.</p>
            </div>

            {/* Enhanced Crisis Support Widget */}
            <CrisisSupportWidget />

            {/* Emergency Numbers Section */}
            <div className="emergency-section">
                <h2 className="section-title">
                    <PhoneIcon className="section-icon" />
                    <span>Emergency Contact Numbers</span>
                </h2>
                <div className="emergency-grid">
                    {EMERGENCY_NUMBERS.map(emergency => (
                        <EmergencyNumberCard key={emergency.number} emergency={emergency} />
                    ))}
                </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="quick-access-section">
                <div className="quick-access-grid">
                    <AppButton
                        variant="primary"
                        size="lg"
                        onClick={() => window.location.href = '#/quiet-space'}
                        className="quick-access-btn breathing-btn"
                    >
                        <HeartIcon />
                        <span>Quiet Space & Breathing</span>
                    </AppButton>
                    <AppButton
                        variant="secondary"
                        size="lg"
                        onClick={() => window.location.href = '#/crisis-chat'}
                        className="quick-access-btn chat-btn"
                    >
                        <ShieldIcon />
                        <span>Crisis Chat Support</span>
                    </AppButton>
                    <AppButton
                        variant="secondary"
                        size="lg"
                        onClick={() => window.location.href = '#/safety-plan'}
                        className="quick-access-btn safety-btn"
                    >
                        <ClockIcon />
                        <span>My Safety Plan</span>
                    </AppButton>
                </div>
            </div>

            {/* Enhanced Breathing Exercise Widget */}
            <div style={{ marginBottom: '2rem' }}>
                <BreathingWidget embedded={false} />
            </div>

            {/* Safety Plan Access */}
            <SafetyPlanAccess />

            {/* Search and Filter Section */}
            <div className="search-section">
                <div className="search-wrapper">
                    <SearchIcon className="search-icon" />
                    <input
                        type="search"
                        placeholder="Search for specific topics or resources..."
                        className="search-input"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="category-filters">
                    {RESOURCE_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
                <div className="loading-state">
                    <SparkleIcon className="loading-icon" />
                    <p>Loading resources...</p>
                </div>
            ) : (
                <>
                    {filteredResources.length > 0 ? (
                        <div className="resources-section">
                            <h2 className="section-title">
                                <UserIcon className="section-icon" />
                                <span>{activeCategory === 'All' ? 'All Resources' : activeCategory}</span>
                            </h2>
                            <div className="resources-grid">
                                {filteredResources.map(resource => (
                                    <ResourceCard 
                                        key={resource.id} 
                                        resource={resource} 
                                        priority={resource.category === 'Emergency Help'} 
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <HeartIcon className="empty-icon" />
                            <h3>No resources found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                            <AppButton
                                variant="secondary"
                                onClick={() => {
                                    setSearchTerm('');
                                    setActiveCategory('All');
                                }}
                            >
                                Clear Filters
                            </AppButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CrisisResourcesView;
import React, { useState, useEffect } from 'react';
import { SafetyPlan } from '../types';
import { AppButton } from '../components/AppButton';
import { AppTextArea } from '../components/AppInput';
import { Card } from '../components/Card';
import { ApiClient } from '../utils/ApiClient';
import { useNotification } from '../contexts/NotificationContext';
import { HeartIcon, PhoneIcon, ShieldIcon, SparkleIcon, BookmarkIcon  } from '../components/icons.dynamic';
import { useAuth } from '../contexts/AuthContext';

const defaultPlan: SafetyPlan = {
    triggers: '',
    copingStrategies: '',
    supportContacts: '',
    safePlaces: '',
};

const demoPlan: SafetyPlan = {
    triggers: 'Feeling overwhelmed or hopeless, Increased anxiety or panic, Difficulty sleeping, Isolating from others',
    copingStrategies: '🎵 Listen to calming music, 🚶 Take a walk outside, 🧘 Practice deep breathing, 📝 Write in a journal, 📞 Call a friend',
    supportContacts: 'Best friend Sarah: (555) 123-4567\nTherapist Dr. Johnson: (555) 987-6543\nSister Emily: (555) 456-7890\nCrisis Hotline: 988',
    safePlaces: 'Local library - quiet and peaceful\nCoffee shop on Main Street\nCity park walking trail\nBest friend\'s house',
};

const defaultHotlines = [
    { name: '988 Suicide & Crisis Lifeline', contact: '988', description: '24/7 support for crisis situations' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741', description: 'Free 24/7 text support' },
    { name: 'SAMHSA National Helpline', contact: '1-800-662-4357', description: 'Treatment referral and information' },
    { name: 'NAMI HelpLine', contact: '1-800-950-6264', description: 'Mon-Fri, 10am-10pm ET' },
];

const copingStrategySuggestions = [
    '🎵 Listen to calming music',
    '🚶 Take a walk outside',
    '🧘 Practice deep breathing',
    '📝 Write in a journal',
    '🎨 Draw or create art',
    '🐕 Spend time with pets',
    '🌱 Garden or care for plants',
    '📞 Call a friend',
    '🛁 Take a warm bath',
    '☕ Make a cup of tea',
    '🧩 Do a puzzle or game',
    '📖 Read a favorite book'
];

const warningSignsSuggestions = [
    'Feeling overwhelmed or hopeless',
    'Increased anxiety or panic',
    'Difficulty sleeping',
    'Isolating from others',
    'Changes in appetite',
    'Increased irritability',
    'Difficulty concentrating',
    'Physical tension or pain'
];

export const SafetyPlanView: React.FC<{
    userToken?: string | null;
}> = ({ userToken: propUserToken }) => {
    const { userToken: contextUserToken } = useAuth();
    const userToken = propUserToken ?? contextUserToken;
    const [plan, setPlan] = useState<SafetyPlan>(defaultPlan);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useNotification();

    useEffect(() => {
        if (!userToken) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        ApiClient.safetyPlan.get(userToken)
            .then(savedPlan => {
                if (savedPlan) {
                    setPlan(savedPlan);
                    setIsEditing(false);
                } else {
                    setIsEditing(true); // Default to edit mode if no plan exists
                }
            })
            .catch(error => {
                console.error("Failed to load safety plan:", error);
                addToast("Could not load your safety plan.", "error");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [addToast, userToken]);

    const handleSave = async () => {
        if (!userToken) {
            addToast("Cannot save plan without a user session.", "error");
            return;
        }
        setIsLoading(true);
        try {
            await ApiClient.safetyPlan.save(plan, userToken);
            setIsEditing(false);
            addToast('Your safety plan has been saved!', 'success');
        } catch (error) {
            console.error("Failed to save safety plan:", error);
            addToast("Could not save your safety plan.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPlan({
            ...plan,
            [e.target.name]: e.target.value,
        });
    };
    
    const loadDemoData = () => {
        setPlan(demoPlan);
        addToast('Demo safety plan loaded! Feel free to customize it.', 'success');
    };
    
    if(isLoading) {
        return <div className="loading-spinner" style={{margin: '5rem auto'}}></div>
    }

    return (
        <>
            <div className="view-header">
                <h1>My Astral Safety Plan</h1>
                <p className="view-subheader">Your personalized crisis prevention toolkit - always here when you need it</p>
            </div>

            {/* Quick Access Emergency Resources */}
            <Card className="emergency-resources-card">
                <div className="emergency-header">
                    <ShieldIcon />
                    <h2>Immediate Help Available 24/7</h2>
                </div>
                <div className="hotlines-grid">
                    {defaultHotlines.map(hotline => (
                        <div key={hotline.name} className="hotline-card">
                            <PhoneIcon />
                            <div className="hotline-info">
                                <h3>{hotline.name}</h3>
                                <p className="hotline-contact">{hotline.contact}</p>
                                <p className="hotline-description">{hotline.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="safety-plan-card">
                {!isEditing && (
                    <div className="safety-plan-actions">
                        <AppButton variant="primary" onClick={() => setIsEditing(true)}>
                            <BookmarkIcon />
                            <span>Edit My Plan</span>
                        </AppButton>
                        <AppButton variant="secondary" onClick={() => window.print()}>
                            Print Plan
                        </AppButton>
                    </div>
                )}
                
                {isEditing && (!plan.triggers && !plan.copingStrategies && !plan.supportContacts && !plan.safePlaces) && (
                    <div className="demo-data-prompt" style={{ textAlign: 'center', padding: '1rem', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                        <p style={{ marginBottom: '1rem', color: '#5a6c7d' }}>New to safety planning? Start with our example template!</p>
                        <AppButton variant="primary" onClick={loadDemoData}>
                            <SparkleIcon />
                            <span>Load Example Safety Plan</span>
                        </AppButton>
                    </div>
                )}
                
                {/* Warning Signs Section */}
                <div className="safety-plan-section">
                    <h2>
                        <SparkleIcon />
                        <span>Warning Signs</span>
                    </h2>
                    <p className="safety-plan-prompt">What changes in thoughts, feelings, or behaviors signal that you might need to use your safety plan?</p>
                    {isEditing ? (
                        <>
                            <AppTextArea name="triggers" value={plan.triggers} onChange={handleInputChange} placeholder="Describe warning signs that indicate you're struggling..." />
                            <div className="suggestion-chips">
                                <p className="suggestion-label">Common warning signs:</p>
                                {warningSignsSuggestions.map((sign, index) => (
                                    <button 
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => setPlan({...plan, triggers: plan.triggers + (plan.triggers ? ', ' : '') + sign})}
                                    >
                                        {sign}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="safety-plan-content">{plan.triggers || "No warning signs listed."}</div>
                    )}
                </div>
                
                <div className="safety-plan-section">
                    <h2>
                        <HeartIcon />
                        <span>My Coping Strategies</span>
                    </h2>
                    <p className="safety-plan-prompt">Healthy activities that help you feel better when you're struggling</p>
                    {isEditing ? (
                        <>
                            <AppTextArea name="copingStrategies" value={plan.copingStrategies} onChange={handleInputChange} placeholder="List activities that help you cope with difficult emotions..." />
                            <div className="suggestion-chips">
                                <p className="suggestion-label">Try these coping strategies:</p>
                                {copingStrategySuggestions.map((strategy, index) => (
                                    <button 
                                        key={index}
                                        className="suggestion-chip"
                                        onClick={() => setPlan({...plan, copingStrategies: plan.copingStrategies + (plan.copingStrategies ? '\n' : '') + strategy})}
                                    >
                                        {strategy}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="safety-plan-content">{plan.copingStrategies || "No strategies listed."}</div>
                    )}
                </div>

                <div className="safety-plan-section">
                    <h2>My Support Team</h2>
                    <p className="safety-plan-prompt">Who are some trusted people you can contact for support?</p>
                     {isEditing ? (
                        <AppTextArea name="supportContacts" value={plan.supportContacts} onChange={handleInputChange} placeholder="e.g., My friend Alex (555-1234), my sister Sarah, my therapist's office..." />
                    ) : (
                        <div className="safety-plan-content">{plan.supportContacts || "No contacts listed."}</div>
                    )}
                </div>

                <div className="safety-plan-section">
                    <h2>My Safe Places</h2>
                    <p className="safety-plan-prompt">Where can you go to feel safe and calm?</p>
                    {isEditing ? (
                        <AppTextArea name="safePlaces" value={plan.safePlaces} onChange={handleInputChange} placeholder="e.g., My bedroom, the local park, the library..." />
                    ) : (
                        <div className="safety-plan-content">{plan.safePlaces || "No safe places listed."}</div>
                    )}
                </div>


                
                 {isEditing && (
                    <div className="safety-plan-actions">
                        <AppButton variant="success" onClick={handleSave} isLoading={isLoading}>Save My Plan</AppButton>
                    </div>
                 )}
            </Card>
        </>
    );
};

export default SafetyPlanView;
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { View } from '../types';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { ApiClient } from '../utils/ApiClient';
import { CertifiedIcon  } from '../components/icons.dynamic';
import { useNotification } from '../contexts/NotificationContext';
import { isError } from '../types/common';

export const HelperApplicationView: React.FC<{
    setActiveView: (view: View) => void;
}> = ({ setActiveView }) => {
    const { helperProfile, reloadProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useNotification();

    const handleApply = async () => {
        if (!helperProfile) return;
        setIsSubmitting(true);
        try {
            await ApiClient.helpers.submitApplication(helperProfile.id);
            await reloadProfile();
            addToast("Your application has been submitted for review! You'll be notified of the outcome.", 'info');
        } catch (err) {
            const errorMessage = isError(err) ? err.message : "Failed to submit application.";
            addToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!helperProfile) {
        return <div className="loading-spinner" style={{ margin: '5rem auto' }}></div>;
    }

    const renderApplicationStatus = () => {
        if (helperProfile.helperType === 'Certified' || helperProfile.applicationStatus === 'approved') {
            return (
                <Card className="empty-state">
                    <div style={{color: 'var(--accent-success)', width: '60px', height: '60px', margin: '0 auto 1rem auto'}}><CertifiedIcon /></div>
                    <h2>You are a Certified Helper!</h2>
                    <p>Thank you for your commitment to supporting our community.</p>
                </Card>
            );
        }

        if (helperProfile.applicationStatus === 'pending') {
            return (
                <Card className="empty-state" style={{ background: 'var(--bg-tertiary)' }}>
                    <h2>Application Pending Review</h2>
                    <p>Your application has been received and is currently being reviewed by our team. Thank you for your patience.</p>
                </Card>
            );
        }

        if (helperProfile.applicationStatus === 'rejected') {
            return (
                <Card className="empty-state" style={{ background: 'color-mix(in srgb, var(--accent-danger) 10%, transparent)' }}>
                    <h2 style={{color: 'var(--accent-danger)'}}>Application Not Approved</h2>
                    <p>Unfortunately, your application was not approved at this time. Please review the feedback below and our community guidelines.</p>
                    {helperProfile.applicationNotes && <p style={{fontWeight: 'bold', marginTop: '1rem'}}>Feedback: "{helperProfile.applicationNotes}"</p>}
                </Card>
            );
        }

        if (!helperProfile.trainingCompleted) {
            return (
                 <Card className="empty-state">
                    <h2>Step 1: Complete Mandatory Training</h2>
                    <p>To become a Certified Helper, you must first complete our mandatory training and quiz on peer support best practices.</p>
                    <AppButton variant="primary" onClick={() => setActiveView('helper-training')}>Start Training</AppButton>
                </Card>
            );
        }

        if (helperProfile.trainingCompleted && helperProfile.applicationStatus === 'none') {
            return (
                 <Card className="empty-state">
                    <h2>Step 2: Submit Your Application</h2>
                    <p>You have successfully completed the training. The final step is to submit your application for review by our team.</p>
                    <AppButton variant="success" onClick={handleApply} isLoading={isSubmitting}>Apply for Certification</AppButton>
                </Card>
            );
        }

        return <Card><p>There was an issue loading your application status. Please try again later.</p></Card>;
    };

    return (
        <>
            <div className="view-header">
                <h1>Helper Certification</h1>
                <p className="view-subheader">Check your application status and complete the required steps to become a Certified Helper.</p>
            </div>
            {renderApplicationStatus()}
        </>
    );
};

export default HelperApplicationView;
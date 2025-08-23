import React from 'react';
import { ViewHeader } from '../components/ViewHeader';
import { Card } from '../components/Card';

export const LegalView: React.FC = () => (
    <>
         <ViewHeader 
            title="Legal Information"
            subtitle="Terms of Service, Privacy Policy, and Helper Agreement."
        />
        <Card className="legal-card">
            <section>
                <h2>Terms of Service</h2>
                <p>Welcome to Peer Support Circle. By accessing or using our service, you agree to be bound by these terms. If you disagree with any part of the terms, then you may not access the service.</p>
                <p><strong>Use of Service:</strong> This service is intended for peer-to-peer support. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
                <p><strong>User Conduct:</strong> You agree not to use the service to post any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. You are responsible for your own communications and for any consequences thereof.</p>
            </section>
            
            <hr/>

            <section>
                <h2>Privacy Policy</h2>
                <p>Your privacy is critically important to us. This application is designed to be anonymous.</p>
                <p><strong>Anonymous ID:</strong> We assign you a randomly generated identifier (your "User Token") which is stored only on your device. This token is not linked to any personal information. You can reset this token at any time in the Settings page.</p>
                <p><strong>Data We Don't Collect:</strong> We do not collect your name, email address, IP address, or any other personally identifiable information for users seeking support.</p>
                <p><strong>Data Helpers Provide:</strong> Users who sign up to be "Helpers" will provide an email address for authentication purposes. This data is kept separate from the anonymous support system.</p>
            </section>
            
            <hr/>

            <section>
                <h2>Helper Agreement</h2>
                <p>This agreement applies to users who voluntarily sign up for a "Helper" account.</p>
                <p><strong>Role of a Helper:</strong> As a Helper, you agree to provide supportive and empathetic peer-to-peer communication. You acknowledge that you are not a licensed therapist or medical professional and will not provide medical advice, diagnoses, or crisis counseling.</p>
                <p><strong>Confidentiality:</strong> You agree to respect the privacy and anonymity of all users. You will not attempt to identify users or share any information discussed within the platform.</p>
                <p><strong>Mandatory Reporting:</strong> While maintaining privacy is paramount, if you believe a user is in imminent danger of harming themselves or others, you are encouraged to follow platform protocols for escalating the situation, which may involve alerting platform moderators.</p>
            </section>
        </Card>
    </>
)

export default LegalView;
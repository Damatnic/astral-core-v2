import React, { useState } from 'react';
import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { HeartIcon  } from '../components/icons.dynamic';
import { ApiClient } from '../utils/ApiClient';
import { isError } from '../types/common';

const DONATION_AMOUNTS = [500, 1000, 2500, 5000]; // In cents

export const DonationView: React.FC = () => {
    const [selectedAmount, setSelectedAmount] = useState(1000);
    const [customAmount, setCustomAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setCustomAmount(value);
            const cents = Math.round(parseFloat(value) * 100);
            if (!isNaN(cents) && cents > 0) {
                setSelectedAmount(cents);
            }
        }
    };
    
    const handleDonate = async () => {
        setIsProcessing(true);
        try {
            // In a real app, this would integrate with a Stripe element
            const { clientSecret } = await ApiClient.payment.createDonationIntent(selectedAmount);
            alert(`Thank you for your donation of $${(selectedAmount / 100).toFixed(2)}! \nClient Secret (for demo): ${clientSecret}`);
            // Here you would use stripe.confirmCardPayment(clientSecret, ...)
        } catch (error) {
            console.error(error);
            const errorMessage = isError(error) ? error.message : 'An error occurred';
            alert(`Donation failed: ${errorMessage}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="view-header">
                <h1>Support Our Community</h1>
                <p className="view-subheader">Your donation helps keep this platform safe, free, and accessible to all.</p>
            </div>
            <Card className="auth-card">
                 <div className="donation-heart-container">
                    <HeartIcon />
                </div>
                
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                    Choose a donation amount:
                </p>

                <div className="filter-buttons" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                    {DONATION_AMOUNTS.map(amount => (
                        <AppButton
                            key={amount}
                            variant={selectedAmount === amount && !customAmount ? 'primary' : 'secondary'}
                            onClick={() => handleAmountSelect(amount)}
                        >
                            ${(amount / 100).toFixed(2)}
                        </AppButton>
                    ))}
                </div>

                <div className="auth-separator">or enter a custom amount</div>

                <div className="form-group" style={{marginTop: '1.5rem'}}>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="e.g., 15.00"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        style={{textAlign: 'center', fontSize: '1.2rem'}}
                    />
                </div>
                
                <AppButton
                    onClick={handleDonate}
                    isLoading={isProcessing}
                    disabled={isProcessing || selectedAmount < 50}
                    className="btn-full-width"
                    variant="success"
                >
                    Donate ${(selectedAmount / 100).toFixed(2)}
                </AppButton>
                 <p className="auth-toggle" style={{marginTop: '2rem', fontSize: '0.8rem'}}>
                    Payments are processed securely by our trusted partners.
                </p>
            </Card>
        </>
    );
};


export default DonationView;
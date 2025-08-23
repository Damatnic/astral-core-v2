import React, { useState } from 'react';
import { REPORT_REASONS } from '../constants';
import { AppButton } from './AppButton';

export const ReportModalContent: React.FC<{
    onClose: () => void;
    onSubmit: (reason: string) => void;
}> = ({ onClose, onSubmit }) => {
    const [reason, setReason] = useState(REPORT_REASONS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(reason);
    }

    return (
        <form onSubmit={handleSubmit}>
            <p>Please select a reason for reporting this post. This helps our helpers review content effectively.</p>
            <div className="report-reasons">
                {REPORT_REASONS.map(r => (
                    <div key={r} className="radio-group">
                        <input type="radio" id={`reason-${r}`} name="report-reason" value={r} checked={reason === r} onChange={() => setReason(r)} />
                        <label htmlFor={`reason-${r}`}>{r}</label>
                    </div>
                ))}
            </div>
             <div className="modal-actions">
                <AppButton onClick={onClose} variant="ghost">Cancel</AppButton>
                <AppButton onClick={() => {}} type="submit" variant="danger">Submit Report</AppButton>
            </div>
        </form>
    )
};

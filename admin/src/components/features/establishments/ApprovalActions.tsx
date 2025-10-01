import React, { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';

interface ApprovalActionsProps {
    onApprove: () => void;
    onReject: (reason: string) => void;
    loading: boolean;
}

export const ApprovalActions: React.FC<ApprovalActionsProps> = ({
    onApprove,
    onReject,
    loading
}) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionError, setRejectionError] = useState('');

    const handleApprove = () => {
        onApprove();
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            setRejectionError('Please provide a reason for rejection');
            return;
        }

        onReject(rejectionReason.trim());
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectionError('');
    };

    const handleRejectCancel = () => {
        setShowRejectModal(false);
        setRejectionReason('');
        setRejectionError('');
    };

    const commonReasons = [
        'Incomplete documentation',
        'Invalid business license',
        'Poor image quality',
        'Inaccurate business information',
        'Missing required permits',
        'Inappropriate content',
        'Duplicate establishment'
    ];

    return (
        <div className="flex items-center space-x-3">
            <Button
                onClick={handleApprove}
                loading={loading}
                variant="primary"
                size="sm"
            >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
            </Button>

            <Button
                onClick={() => setShowRejectModal(true)}
                loading={loading}
                variant="danger"
                size="sm"
            >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
            </Button>

            {/* Rejection Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={handleRejectCancel}
                title="Reject Establishment"
                size="md"
            >
                <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-warning-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-warning-800">Rejection Notice</h4>
                            <p className="text-sm text-warning-700 mt-1">
                                Please provide a clear reason for rejecting this establishment.
                                This will help the establishment owner understand what needs to be fixed.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Reason for Rejection
                        </label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => {
                                setRejectionReason(e.target.value);
                                setRejectionError('');
                            }}
                            placeholder="Please explain why this establishment is being rejected..."
                            rows={4}
                            className="w-full border border-secondary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        {rejectionError && (
                            <p className="text-sm text-error-600 mt-1">{rejectionError}</p>
                        )}
                    </div>

                    {/* Common Reasons */}
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                            Common Reasons (click to use)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {commonReasons.map((reason) => (
                                <button
                                    key={reason}
                                    onClick={() => setRejectionReason(reason)}
                                    className="px-3 py-1 text-xs bg-secondary-100 text-secondary-700 rounded-full hover:bg-secondary-200 transition-colors"
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={handleRejectCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleRejectSubmit}
                            loading={loading}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Establishment
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
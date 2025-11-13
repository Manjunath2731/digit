import React, { useState, useEffect } from 'react';
import { Device } from '../../services/userManagement';
import { getPlans, Plan } from '../../services/planManagement';
import { createSubscription } from '../../services/subscriptionService';
import '../../styles/membership/SelectPlanModal.css';

interface SelectPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  onPurchaseComplete: () => void;
}

interface PeriodOption {
  id: string;
  label: string;
  period: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly';
}

const SelectPlanModal: React.FC<SelectPlanModalProps> = ({
  isOpen,
  onClose,
  device,
  onPurchaseComplete
}) => {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly' | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const periods: PeriodOption[] = [
    { id: 'monthly', label: 'Monthly', period: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly', period: 'Quarterly' },
    { id: 'halfyearly', label: 'Half Yearly', period: 'Half Yearly' },
    { id: 'yearly', label: 'Yearly', period: 'Yearly' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      const fetchedPlans = await getPlans();
      setPlans(fetchedPlans);
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load plans');
    }
  };

  const handleAddMore = () => {
    setQuantity(quantity + 1);
  };

  const handleProceed = async () => {
    if (!selectedPlan || !selectedPeriod) {
      setError('Please select both plan and period');
      return;
    }

    if (!device) {
      setError('No device selected');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createSubscription({
        device_id: device.device_id,
        plan_id: selectedPlan,
        period: selectedPeriod,
        quantity
      });

      onPurchaseComplete();
      handleClose();
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Failed to create subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPlan(null);
    setSelectedPeriod('');
    setQuantity(1);
    setError('');
    onClose();
  };

  // Get available plans for selected period
  const getAvailablePlans = () => {
    if (!selectedPeriod) return plans;
    return plans.filter(plan => plan.period === selectedPeriod);
  };

  // Get selected plan details
  const selectedPlanDetails = plans.find(p => p.id === selectedPlan);
  const totalAmount = selectedPlanDetails ? selectedPlanDetails.amount * quantity : 0;

  if (!isOpen || !device) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="select-plan-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>×</button>
        
        <h2 className="modal-title">Select Plan</h2>
        
        <h3 className="device-name">{device.saviour || device.device_id}</h3>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

        <div className="form-section">
          <div className="dropdown-wrapper">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value as any);
                setSelectedPlan(null); // Reset plan when period changes
              }}
              className="period-select"
            >
              <option value="">SELECT PERIOD</option>
              {periods.map((period) => (
                <option key={period.id} value={period.period}>
                  {period.label}
                </option>
              ))}
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>

        <div className="form-section">
          <div className="dropdown-wrapper">
            <select
              value={selectedPlan || ''}
              onChange={(e) => setSelectedPlan(Number(e.target.value))}
              className="plan-select"
              disabled={!selectedPeriod}
            >
              <option value="">SELECT PLAN</option>
              {getAvailablePlans().map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan} - {plan.profile} (₹{plan.amount})
                </option>
              ))}
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>

        <div className="quantity-section">
          <label>Quantity:</label>
          <div className="quantity-display">
            {quantity}
          </div>
        </div>

        {selectedPlanDetails && (
          <div className="total-amount">
            <strong>Total Amount: ₹{totalAmount.toFixed(2)}</strong>
          </div>
        )}

        <div className="modal-actions">
          <button className="add-more-button" onClick={handleAddMore} disabled={isLoading}>
            ADD MORE
          </button>
          <button 
            className="proceed-button" 
            onClick={handleProceed}
            disabled={isLoading || !selectedPlan || !selectedPeriod}
          >
            {isLoading ? 'PROCESSING...' : 'PROCEED'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlanModal;

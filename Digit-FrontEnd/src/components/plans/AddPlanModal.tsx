import React, { useState } from 'react';
import { addPlan } from '../../services/planManagement';
import Button from '../auth/Button';
import '../../styles/plans/PlanSettings.css';

interface AddPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdded: () => void;
}

const AddPlanModal: React.FC<AddPlanModalProps> = ({ isOpen, onClose, onPlanAdded }) => {
  const [formData, setFormData] = useState({
    plan: 'Premium',
    profile: 'Saviour' as 'Saviour' | 'Ni-Sensu' | 'Smart Jar',
    period: 'Monthly' as 'Yearly' | 'Half Yearly' | 'Quarterly' | 'Monthly',
    amount: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.plan.trim()) {
      newErrors.plan = 'Plan name is required';
    }
    
    if (!formData.profile) {
      newErrors.profile = 'Profile is required';
    }
    
    if (!formData.period) {
      newErrors.period = 'Period is required';
    }
    
    if (formData.amount < 0) {
      newErrors.amount = 'Amount cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      await addPlan(formData);
      onPlanAdded();
      onClose();
    } catch (error) {
      setErrors({ general: 'Failed to add plan. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Plan</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.general && <div className="error-message">{errors.general}</div>}
          
          <div className="form-group">
            <label htmlFor="plan">Plan</label>
            <input
              type="text"
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              placeholder="Enter plan name"
              className={errors.plan ? 'error' : ''}
            />
            {errors.plan && <div className="field-error">{errors.plan}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="profile">Profile</label>
            <select
              id="profile"
              name="profile"
              value={formData.profile}
              onChange={handleChange}
              className={errors.profile ? 'error' : ''}
            >
              <option value="Saviour">Saviour</option>
              <option value="Ni-Sensu">Ni-Sensu</option>
              <option value="Smart Jar">Smart Jar</option>
            </select>
            {errors.profile && <div className="field-error">{errors.profile}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="period">Period</label>
            <select
              id="period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className={errors.period ? 'error' : ''}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half Yearly">Half Yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
            {errors.period && <div className="field-error">{errors.period}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              className={errors.amount ? 'error' : ''}
            />
            {errors.amount && <div className="field-error">{errors.amount}</div>}
          </div>
          
          <div className="modal-actions">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
              fullWidth={false}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isLoading}
              fullWidth={false}
            >
              {isLoading ? 'Adding...' : 'Add Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanModal;

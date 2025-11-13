import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlans, Plan, deletePlan } from '../services/planManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import AddPlanModal from '../components/plans/AddPlanModal';
import '../styles/plans/PlanSettings.css';
import '../styles/Dashboard.css';

const PlanSettings: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getPlans();
      setPlans(data);
    } catch (err) {
      setError('Failed to fetch plans. Please try again.');
      console.error('Error fetching plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddPlan = () => {
    setIsModalOpen(true);
  };

  const handlePlanAdded = () => {
    fetchPlans();
  };

  const handleDeletePlan = async (planId: number) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deletePlan(planId);
        fetchPlans();
      } catch (err) {
        setError('Failed to delete plan. Please try again.');
        console.error('Error deleting plan:', err);
      }
    }
  };

  const getProfileColorClass = (profile: string) => {
    switch (profile) {
      case 'Saviour':
        return 'profile-saviour';
      case 'Ni-Sensu':
        return 'profile-ni-sensu';
      case 'Smart Jar':
        return 'profile-smart-jar';
      default:
        return '';
    }
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="plan-settings-container">
          <div className="plan-settings-header">
            <div className="plan-settings-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <h1>Plan Settings</h1>
            <Button 
              onClick={handleAddPlan}
              variant="primary"
              fullWidth={false}
            >
             + ADD
            </Button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading-message">Loading plans...</div>
          ) : plans.length === 0 ? (
            <div className="no-plans-message">
              No plans found. Add your first plan to get started.
            </div>
          ) : (
            <div className="plans-table-container">
              <table className="plans-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Plan</th>
                    <th>Profile</th>
                    <th>Period</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.id}</td>
                      <td>{plan.plan}</td>
                      <td>
                        <span className={`profile-badge ${getProfileColorClass(plan.profile)}`}>
                          {plan.profile}
                        </span>
                      </td>
                      <td>{plan.period}</td>
                      <td>{plan.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AddPlanModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onPlanAdded={handlePlanAdded} 
          />
        </div>
      </div>

      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default PlanSettings;

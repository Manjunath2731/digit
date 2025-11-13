import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, Order, updateOrderStatus, deleteOrder } from '../services/orderManagement';
import { logout } from '../services/auth/authService';
import Button from '../components/auth/Button';
import Sidebar from '../components/layout/Sidebar';
import '../styles/orders/OrderManagement.css';
import '../styles/Dashboard.css';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Completed' | 'Cancelled'>('all');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  useEffect(() => {
    // Get user data from local storage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusChange = async (orderId: number, newStatus: 'Pending' | 'Completed' | 'Cancelled') => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError('Failed to update order status. Please try again.');
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (err) {
        setError('Failed to delete order. Please try again.');
        console.error('Error deleting order:', err);
      }
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.emailId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.contactNumber.includes(searchTerm) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content-wrapper">
        <Sidebar user={user} />
        
        <div className="orders-container">
          <div className="page-header">
            <h1>Order Management</h1>
          </div>

          <div className="orders-controls">
            <div className="entries-control">
              <span>Show</span>
              <select 
                value={entriesPerPage} 
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries</span>
            </div>
            
            <div className="filters-container">
              <div className="status-filter">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">Select Option</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search records"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {isLoading ? (
            <div className="loading-message">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders-message">
              {searchTerm || filterStatus !== 'all' 
                ? 'No orders match your search criteria.' 
                : 'No orders found.'}
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>S.no.</th>
                    <th>Order Id</th>
                    <th>Name</th>
                    <th>Email id</th>
                    <th>Contact Number</th>
                    <th>Date</th>
                    <th>GST No</th>
                    <th>Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, entriesPerPage).map((order, index) => (
                    <tr key={order.id}>
                      <td>{index + 1}</td>
                      <td>{order.orderNumber}</td>
                      <td>{order.name}</td>
                      <td>{order.emailId}</td>
                      <td>{order.contactNumber}</td>
                      <td>{order.date}</td>
                      <td>{order.gstNo}</td>
                      <td>{order.address}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="auth-footer">
        <p><img src="https://s3.ap-south-1.amazonaws.com/egov-playground-assets/digit-footer.png" alt="DIGIT" className="footer-logo" /></p>
      </footer>
    </div>
  );
};

export default Orders;

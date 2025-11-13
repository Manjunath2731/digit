// Order management service

export interface Order {
  id: number;
  orderNumber: string;
  name: string;
  emailId: string;
  contactNumber: string;
  date: string;
  gstNo: string;
  address: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

// Mock data for orders
const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'NIV2025416',
    name: 'No tricks No catch Just an iPhone 16 with your name on it</a>',
    emailId: 'paouqua@mailbox.in.ua',
    contactNumber: '5664771276',
    date: '03-09-2025',
    gstNo: 'pftgq2',
    address: 'fowmwl',
    status: 'Pending'
  },
  {
    id: 2,
    orderNumber: 'NIV2025415',
    name: 'A little gift, just because - grab it now',
    emailId: 'paouqua@mailbox.in.ua',
    contactNumber: '5664771276',
    date: '03-09-2025',
    gstNo: 'pftgq2',
    address: 'fowmwl',
    status: 'Pending'
  },
  {
    id: 3,
    orderNumber: 'NIV2025414',
    name: 'Claim Free iPhone 16</a>',
    emailId: 'paouqua@mailbox.in.ua',
    contactNumber: '17156863004',
    date: '07-08-2025',
    gstNo: 'lfo0ps',
    address: 'y6g7y6',
    status: 'Pending'
  },
  {
    id: 4,
    orderNumber: 'NIV2025413',
    name: 'Special Offer: Limited Time Deal',
    emailId: 'customer@example.com',
    contactNumber: '9876543210',
    date: '01-08-2025',
    gstNo: 'abc123',
    address: 'Mumbai',
    status: 'Completed'
  },
  {
    id: 5,
    orderNumber: 'NIV2025412',
    name: 'Premium Package Order',
    emailId: 'premium@example.com',
    contactNumber: '8765432109',
    date: '28-07-2025',
    gstNo: 'xyz789',
    address: 'Delhi',
    status: 'Cancelled'
  }
];

/**
 * Get all orders
 */
export const getOrders = async (): Promise<Order[]> => {
  // In a real app, this would fetch from an API
  // const response = await fetch(`${API_URL}/orders`, {
  //   headers: {
  //     'Authorization': `Bearer ${localStorage.getItem('token')}`
  //   }
  // });
  // return await response.json();
  
  // Return mock data
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...mockOrders]);
    }, 500);
  });
};

/**
 * Add a new order
 */
export const addOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
  // In a real app, this would be an API call
  // const response = await fetch(`${API_URL}/orders`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${localStorage.getItem('token')}`
  //   },
  //   body: JSON.stringify(orderData)
  // });
  // return await response.json();
  
  // Mock response
  return new Promise(resolve => {
    setTimeout(() => {
      const newOrder: Order = {
        ...orderData,
        id: mockOrders.length + 1
      };
      mockOrders.push(newOrder);
      resolve(newOrder);
    }, 500);
  });
};

/**
 * Update an order's status
 */
export const updateOrderStatus = async (
  orderId: number, 
  status: 'Pending' | 'Completed' | 'Cancelled'
): Promise<Order> => {
  // In a real app, this would be an API call
  // const response = await fetch(`${API_URL}/orders/${orderId}`, {
  //   method: 'PATCH',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${localStorage.getItem('token')}`
  //   },
  //   body: JSON.stringify({ status })
  // });
  // return await response.json();
  
  // Mock response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        reject(new Error('Order not found'));
        return;
      }
      
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        status
      };
      
      resolve(mockOrders[orderIndex]);
    }, 500);
  });
};

/**
 * Delete an order
 */
export const deleteOrder = async (orderId: number): Promise<void> => {
  // In a real app, this would be an API call
  // await fetch(`${API_URL}/orders/${orderId}`, {
  //   method: 'DELETE',
  //   headers: {
  //     'Authorization': `Bearer ${localStorage.getItem('token')}`
  //   }
  // });
  
  // Mock response
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const orderIndex = mockOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) {
        reject(new Error('Order not found'));
        return;
      }
      
      mockOrders.splice(orderIndex, 1);
      resolve();
    }, 500);
  });
};

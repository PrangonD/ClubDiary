import api from './api';

const clubService = {
  // Get all active clubs
  getClubs: async () => {
    const response = await api.get('/clubs');
    return response.data;
  },

  // Get a single club by ID
  getClub: async (id) => {
    const response = await api.get(`/clubs/${id}`);
    return response.data;
  },

  // Create a new club (System Admin)
  createClub: async (clubData) => {
    const response = await api.post('/clubs', clubData);
    return response.data;
  },

  // Update a club (Admin/System Admin)
  updateClub: async (id, clubData) => {
    const response = await api.put(`/clubs/${id}`, clubData);
    return response.data;
  },

  // Delete a club (System Admin)
  deleteClub: async (id) => {
    const response = await api.delete(`/clubs/${id}`);
    return response.data;
  }
};

export default clubService;

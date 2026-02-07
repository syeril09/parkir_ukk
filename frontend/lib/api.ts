import apiClient from './apiClient';

/**
 * AUTH API CALLS
 */

export const authAPI = {
  // Login
  login: async (username: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      username,
      password
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  }
};

/**
 * USER API CALLS
 */

export const userAPI = {
  // Get all users
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  // Get user by role
  getByRole: async (role: string) => {
    const response = await apiClient.get(`/users/role/${role}`);
    return response.data;
  },

  // Get user by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: {
    nama: string;
    username: string;
    password: string;
    role: string;
    email?: string;
    no_telp?: string;
  }) => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Update password
  updatePassword: async (id: number, passwordBaru: string) => {
    const response = await apiClient.put(`/users/${id}/password`, {
      passwordBaru
    });
    return response.data;
  },

  // Delete user
  delete: async (id: number) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
};

/**
 * KENDARAAN API CALLS
 */

export const kendaraanAPI = {
  // Get all kendaraan
  getAll: async () => {
    const response = await apiClient.get('/kendaraan');
    return response.data;
  },

  // Get kendaraan by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/kendaraan/${id}`);
    return response.data;
  },

  // Get kendaraan by plat nomor
  getByPlatNomor: async (platNomor: string) => {
    const response = await apiClient.get(`/kendaraan/plat/${platNomor}`);
    return response.data;
  },

  // Create kendaraan
  create: async (data: any) => {
    const response = await apiClient.post('/kendaraan', data);
    return response.data;
  },

  // Update kendaraan
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/kendaraan/${id}`, data);
    return response.data;
  },

  // Delete kendaraan
  delete: async (id: number) => {
    const response = await apiClient.delete(`/kendaraan/${id}`);
    return response.data;
  }
};

/**
 * AREA PARKIR API CALLS
 */

export const areaParkirAPI = {
  // Get all area
  getAll: async () => {
    const response = await apiClient.get('/area-parkir');
    return response.data;
  },

  // Get area by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/area-parkir/${id}`);
    return response.data;
  },

  // Create area
  create: async (data: any) => {
    const response = await apiClient.post('/area-parkir', data);
    return response.data;
  },

  // Update area
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/area-parkir/${id}`, data);
    return response.data;
  },

  // Delete area
  delete: async (id: number) => {
    const response = await apiClient.delete(`/area-parkir/${id}`);
    return response.data;
  }
};

/**
 * TARIF PARKIR API CALLS
 */

export const tarifParkirAPI = {
  // Get all tarif
  getAll: async () => {
    const response = await apiClient.get('/tarif-parkir');
    return response.data;
  },

  // Get tarif by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/tarif-parkir/${id}`);
    return response.data;
  },

  // Get tarif by vehicle type
  getByVehicleType: async (vehicleTypeId: number) => {
    const response = await apiClient.get(`/tarif-parkir/vehicle/${vehicleTypeId}`);
    return response.data;
  },

  // Get tarif by area
  getByArea: async (areaId: number) => {
    const response = await apiClient.get(`/tarif-parkir/area/${areaId}`);
    return response.data;
  },

  // Create tarif
  create: async (data: any) => {
    const response = await apiClient.post('/tarif-parkir', data);
    return response.data;
  },

  // Update tarif
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/tarif-parkir/${id}`, data);
    return response.data;
  },

  // Delete tarif
  delete: async (id: number) => {
    const response = await apiClient.delete(`/tarif-parkir/${id}`);
    return response.data;
  }
};

/**
 * TRANSAKSI PARKIR API CALLS
 */

export const transaksiAPI = {
  // Get all transaksi
  getAll: async (page: number = 1) => {
    const response = await apiClient.get('/transaksi', {
      params: { page }
    });
    return response.data;
  },

  // Get transaksi by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/transaksi/${id}`);
    return response.data;
  },

  // Kendaraan masuk
  masuk: async (platNomor: string, areaId: number) => {
    const response = await apiClient.post('/transaksi/masuk', {
      platNomor,
      areaId
    });
    return response.data;
  },

  // Kendaraan keluar
  keluar: async (platNomor: string) => {
    const response = await apiClient.post('/transaksi/keluar', {
      platNomor
    });
    return response.data;
  },

  // Update transaksi (pembayaran)
  update: async (id: number, data: any) => {
    const response = await apiClient.put(`/transaksi/${id}`, data);
    return response.data;
  },

  // Get laporan by tanggal
  getLaporanByRange: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/transaksi/laporan/range', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  },

  // Get laporan by area
  getLaporanByArea: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/transaksi/laporan/area', {
      params: {
        start_date: startDate,
        end_date: endDate
      }
    });
    return response.data;
  }
};

/**
 * LOG AKTIVITAS API CALLS
 */
export const logAktivitasAPI = {
  // Get all logs
  getAll: async () => {
    const response = await apiClient.get('/log-aktivitas');
    return response.data;
  },

  // Get logs by user
  getByUser: async (userId: number) => {
    const response = await apiClient.get(`/log-aktivitas/user/${userId}`);
    return response.data;
  },

  // Get logs by tabel
  getByTabel: async (tabel: string) => {
    const response = await apiClient.get(`/log-aktivitas/tabel/${tabel}`);
    return response.data;
  },

  // Delete old logs
  deleteOldLogs: async (days: number = 30) => {
    const response = await apiClient.delete('/log-aktivitas/cleanup', {
      params: { days }
    });
    return response.data;
  }
};

import axios from "axios";

// API URL'i environment variable olarak güncelle
const BASE_URL = "https://web-production-cfc0.up.railway.app/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Ağ hatası: Backend sunucusuna erişilemiyor");
    } else if (error.response) {
      console.error(
        `API Hatası: ${error.response.status} - ${
          error.response.data?.message || error.message
        }`
      );
    } else {
      console.error("Beklenmeyen bir hata oluştu:", error.message);
    }
    return Promise.reject(error);
  }
);

export const customerService = {
  getAllCustomers: async () => {
    try {
      const response = await api.get("/customers");
      return response.data;
    } catch (error) {
      console.error("Müşteri listesi alınamadı:", error);
      throw error;
    }
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (error) {
      console.error("Müşteri oluşturulamadı:", error);
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error("Müşteri güncellenemedi:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await api.delete(`/customers/${id}`);
    } catch (error) {
      console.error("Müşteri silinemedi:", error);
      throw error;
    }
  },
};

export const priceService = {
  calculatePrice: async (
    customerId,
    materials,
    overhead,
    commission,
    vat = 18
  ) => {
    const requestData = {
      customer_id: Number(customerId),
      fabric_price: Number(materials.fabric) || 0,
      lining_price: Number(materials.lining) || 0,
      garni_price: Number(materials.trim) || 0,
      labor_cost: 0,
      overhead: Number(overhead) || 0,
      commission: Number(commission) || 0,
      profit_margin: 20,
      vat: Number(vat) || 18,
      currency: "TRY",
    };

    const response = await api.post("/prices/calculate", requestData);
    return response.data;
  },

  getPriceHistory: async (customerId = null) => {
    const url = customerId
      ? `/prices/history?customer_id=${customerId}`
      : "/prices/history";
    const response = await api.get(url);
    return response.data;
  },
};

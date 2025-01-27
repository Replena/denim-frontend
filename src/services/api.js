import axios from "axios";

// API URL'i güncelle
const BASE_URL =
  import.meta.env.VITE_API_URL || "https://web-production-cfc0.up.railway.app";

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

// API servislerini güncelle
export const customerService = {
  getAllCustomers: async () => {
    try {
      const response = await api.get("/api/customers");
      return response.data;
    } catch (error) {
      console.error("Müşteri listesi alınamadı:", error);
      throw error;
    }
  },

  getCustomerById: async (id) => {
    try {
      const response = await api.get(`/api/customers/${id}`);
      return response.data;
    } catch (error) {
      console.error("Müşteri detayları alınamadı:", error);
      throw error;
    }
  },

  createCustomer: async (customerData) => {
    try {
      const response = await api.post("/api/customers", customerData);
      return response.data;
    } catch (error) {
      console.error("Müşteri oluşturulamadı:", error);
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    try {
      const response = await api.put(`/api/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      console.error("Müşteri güncellenemedi:", error);
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    try {
      await api.delete(`/api/customers/${id}`);
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

    console.log("Gönderilen veri:", requestData);

    try {
      const response = await api.post("/api/prices/calculate", requestData);
      return response.data;
    } catch (error) {
      console.error("Fiyat hesaplanamadı:", error);
      if (error.response) {
        console.error("Sunucu yanıtı:", error.response.data);
      }
      throw error;
    }
  },

  getPriceHistory: async (customerId = null) => {
    try {
      const url = customerId
        ? `/api/prices/history?customer_id=${customerId}`
        : "/api/prices/history";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Fiyat geçmişi alınamadı:", error);
      throw error;
    }
  },
};

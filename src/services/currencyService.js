import axios from "axios";

const API_URL = "https://api.example.com/currency"; // API URL'nizi buraya ekleyin

export const currencyService = {
  async getExchangeRates() {
    try {
      const response = await axios.get(`${API_URL}/rates`);
      return response.data;
    } catch (error) {
      throw new Error("Döviz kurları alınamadı");
    }
  },

  convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (!amount || !fromCurrency || !toCurrency || !rates) {
      return 0;
    }

    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];

    if (!fromRate || !toRate) {
      return 0;
    }

    return (amount * fromRate) / toRate;
  },
};

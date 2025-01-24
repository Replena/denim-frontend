const API_KEY = "af2b706870700ce42ff1f340";
const BASE_URL = "https://v6.exchangerate-api.com/v6";

export const exchangeRateService = {
  async getRates() {
    const response = await fetch(`${BASE_URL}/${API_KEY}/latest/USD`);
    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Döviz kurları alınamadı");
    }

    return {
      USD_TRY: data.conversion_rates.TRY,
      EUR_TRY: data.conversion_rates.TRY / data.conversion_rates.EUR,
      EUR_USD: 1 / data.conversion_rates.EUR,
    };
  },
};

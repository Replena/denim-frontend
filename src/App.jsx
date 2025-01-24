import React, { Suspense, useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Container, CircularProgress } from "@mui/material";
import theme from "./theme";
import { priceService } from "./services/api";
import "./App.css";
import { exchangeRateService } from "./services/exchangeRateService";

// Lazy loading ile componentleri yükleme
const CustomerSelect = React.lazy(() => import("./components/CustomerSelect"));
const MaterialInput = React.lazy(() => import("./components/MaterialInput"));
const PriceTable = React.lazy(() => import("./components/PriceTable"));
const MaterialSummary = React.lazy(() =>
  import("./components/MaterialSummary")
);
const ExchangeRateDisplay = React.lazy(() =>
  import("./components/ExchangeRateDisplay")
);
const PriceHistory = React.lazy(() => import("./components/PriceHistory"));

function App() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [totals, setTotals] = useState({
    fabric: 0,
    lining: 0,
    trim: 0,
    total: 0,
  });

  const [calculatedPrices, setCalculatedPrices] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);

  const [materials, setMaterials] = useState({
    fabric: { price: "", amount: "", currency: "EUR" },
    lining: { price: "", amount: "", currency: "EUR" },
    trim: { price: "", amount: "", currency: "USD" },
  });

  const [exchangeRates, setExchangeRates] = useState(null);

  const handleCustomersUpdate = (customersList) => {
    setCustomers(customersList);
  };

  const handleCustomerChange = (customer) => {
    console.log("Seçilen müşteri:", customer);
    setSelectedCustomer(customer);
  };

  const handleTotalsUpdate = (newTotals) => {
    setTotals(newTotals);
  };

  const handleMaterialsChange = (newMaterials) => {
    setMaterials(newMaterials);
  };

  const loadPriceHistory = async () => {
    try {
      const history = await priceService.getPriceHistory();
      setPriceHistory(history);
    } catch (error) {
      console.error("Fiyat geçmişi yükleme hatası:", error);
    }
  };

  const handlePriceCalculation = async (prices) => {
    setCalculatedPrices(prices);
    setIsCalculated(true);
  };

  const handlePriceHistoryUpdate = (updatedRecord) => {
    setPriceHistory((prev) =>
      prev.map((record) =>
        record.date === updatedRecord.date ? updatedRecord : record
      )
    );
  };

  const handlePriceHistoryDelete = (recordToDelete) => {
    setPriceHistory((prev) =>
      prev.filter((record) => record.date !== recordToDelete.date)
    );
  };

  const updateExchangeRates = async () => {
    const rates = await exchangeRateService.getRates();
    setExchangeRates(rates);
  };

  useEffect(() => {
    updateExchangeRates();
    const interval = setInterval(updateExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadPriceHistory();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <h1 className="app-title">ALLDENIMS</h1>
        <Suspense fallback={<CircularProgress />}>
          <ExchangeRateDisplay rates={exchangeRates} />
          <div className="customer-section">
            <CustomerSelect onCustomerSelect={handleCustomerChange} />
          </div>

          <div className="top-section">
            <div className="left-panel">
              <div className="table-container">
                <MaterialInput
                  onTotalsUpdate={handleTotalsUpdate}
                  onMaterialsChange={handleMaterialsChange}
                  materials={materials}
                  disabled={!selectedCustomer}
                  exchangeRates={exchangeRates}
                />
              </div>
            </div>

            <div className="right-panel">
              <div className="table-container">
                <MaterialSummary totals={totals} materials={materials} />
              </div>
            </div>
          </div>

          <div className="table-container">
            <PriceTable
              totals={totals}
              onCalculate={handlePriceCalculation}
              disabled={!selectedCustomer}
              selectedCustomer={selectedCustomer}
              customers={customers}
              exchangeRates={exchangeRates}
              onPriceCalculated={loadPriceHistory}
            />
          </div>

          <div className="table-container">
            <PriceHistory
              priceHistory={priceHistory}
              onUpdate={handlePriceHistoryUpdate}
              onDelete={handlePriceHistoryDelete}
            />
          </div>
        </Suspense>
      </Container>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  Button,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { generatePriceOfferPDF } from "../services/pdfService";
import { priceService } from "../services/api";

const PriceTable = ({
  totals,
  onCalculate,
  disabled,
  selectedCustomer,
  customers,
  exchangeRates,
  onPriceCalculated,
}) => {
  const [calculatedPrices, setCalculatedPrices] = useState(null);
  const [parameters, setParameters] = useState({
    overhead: "7",
    commission: "8",
    vat: "18",
  });
  const [isCalculated, setIsCalculated] = useState(false);

  const handleParameterChange = (event) => {
    const { name, value } = event.target;
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setIsCalculated(false);
  };

  const calculatePrices = async () => {
    if (!selectedCustomer) {
      console.error("Müşteri seçilmedi");
      return;
    }

    try {
      const fabricValue = parseFloat(totals.fabric) || 0;
      const liningValue = parseFloat(totals.lining) || 0;
      const trimValue = parseFloat(totals.trim) || 0;
      const overheadValue = parseFloat(parameters.overhead) || 0;
      const commissionValue = parseFloat(parameters.commission) || 0;
      const vatValue = parseFloat(parameters.vat) || 18;

      const result = await priceService.calculatePrice(
        selectedCustomer.id,
        {
          fabric: fabricValue,
          lining: liningValue,
          trim: trimValue,
        },
        overheadValue,
        commissionValue,
        vatValue,
        exchangeRates
      );

      if (!result) {
        console.error("Backend'den sonuç alınamadı");
        return;
      }

      setCalculatedPrices(result);
      setIsCalculated(true);

      if (onCalculate) {
        onCalculate(result);
      }

      // Fiyat geçmişini güncelle
      if (onPriceCalculated) {
        await onPriceCalculated();
      }
    } catch (error) {
      console.error("Fiyat hesaplama hatası:", error);
      alert("Fiyat hesaplama sırasında bir hata oluştu");
    }
  };

  const formatCurrency = (value, currency = "TRY") => {
    if (!isCalculated || value === undefined || value === null) return "-";
    try {
      const numValue = Number(value);
      if (isNaN(numValue)) return "-";
      return (
        numValue.toLocaleString("tr-TR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) +
        " " +
        currency
      );
    } catch (error) {
      console.error("Para formatı hatası:", error);
      return "-";
    }
  };

  const handleDownloadPDF = () => {
    // İlk aralık (0-50) için hesaplanan fiyatları kullanalım
    const quantity = "0-50";
    const rawCostTRY = totals.total || 0;

    // Tüm hesaplamaları renderPriceRow'daki gibi yapalım
    const overhead = parseFloat(
      (rawCostTRY * (parseFloat(parameters.overhead) / 100)).toFixed(2)
    );
    const withOverhead = parseFloat((rawCostTRY + overhead).toFixed(2));
    const kar = parseFloat((withOverhead * 0.2).toFixed(2));
    const araToplam = parseFloat((withOverhead + kar).toFixed(2));
    const komisyon = parseFloat(
      (araToplam * (parseFloat(parameters.commission) / 100)).toFixed(2)
    );
    const withKomisyon = parseFloat((araToplam + komisyon).toFixed(2));
    const kdv = parseFloat(
      (withKomisyon * (parseFloat(parameters.vat) / 100)).toFixed(2)
    );
    const finalPrice = parseFloat((withKomisyon + kdv).toFixed(2));

    // Döviz çevirimleri
    const finalPriceEUR = finalPrice / exchangeRates.EUR_TRY;
    const finalPriceUSD = finalPrice / exchangeRates.USD_TRY;

    const pdfData = {
      customerName: selectedCustomer?.name || "Unknown",
      country: selectedCustomer?.country || "Unknown",
      attention: "ZUHAINA",
      currency: "EUR",
      prices: [
        {
          description: "Product 1",
          finalPrice: finalPriceEUR, // Güncel kurla hesaplanan EUR fiyatı
        },
      ],
      date: new Date().toLocaleDateString("tr-TR"),
    };

    const doc = generatePriceOfferPDF(pdfData);
    doc.save(
      `price_offer_${
        selectedCustomer?.name || "draft"
      }_${new Date().toLocaleDateString("tr-TR")}.pdf`
    );
  };

  const renderPriceRow = (range) => {
    if (!calculatedPrices?.finalPriceEUR || !isCalculated) {
      return (
        <TableRow key={range}>
          <TableCell>{range}</TableCell>
          <TableCell>-</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography>{parameters.overhead}%</Typography>
              <Typography>-</Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography>{parameters.vat}%</Typography>
              <Typography>-</Typography>
            </Box>
          </TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography>{parameters.commission}%</Typography>
              <Typography>-</Typography>
            </Box>
          </TableCell>
          <TableCell>-</TableCell>
        </TableRow>
      );
    }

    const quantity = parseInt(range.split("-")[0] || range.replace("+", ""));
    let discount = 0;
    if (quantity <= 50) discount = 0;
    else if (quantity <= 100) discount = 0.05;
    else if (quantity <= 200) discount = 0.1;
    else if (quantity <= 300) discount = 0.15;
    else if (quantity <= 500) discount = 0.2;
    else discount = 0.25;

    const rawCostTRY = totals.total || 0;
    const rawCostEUR = rawCostTRY / exchangeRates.EUR_TRY;
    const rawCostUSD = rawCostTRY / exchangeRates.USD_TRY;

    const overhead = parseFloat(
      (rawCostTRY * (parseFloat(parameters.overhead) / 100)).toFixed(2)
    );
    const withOverhead = parseFloat((rawCostTRY + overhead).toFixed(2));

    const kar = parseFloat((withOverhead * 0.2).toFixed(2));
    const araToplam = parseFloat((withOverhead + kar).toFixed(2));

    const komisyon = parseFloat(
      (araToplam * (parseFloat(parameters.commission) / 100)).toFixed(2)
    );
    const withKomisyon = parseFloat((araToplam + komisyon).toFixed(2));

    const kdv = parseFloat(
      (withKomisyon * (parseFloat(parameters.vat) / 100)).toFixed(2)
    );
    const finalPrice = parseFloat((withKomisyon + kdv).toFixed(2));

    const discountedPrice = finalPrice * (1 - discount);
    const finalPriceEUR = discountedPrice / exchangeRates.EUR_TRY;
    const finalPriceUSD = discountedPrice / exchangeRates.USD_TRY;

    return (
      <TableRow key={range}>
        <TableCell>{range}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography>{formatCurrency(rawCostTRY, "TRY")}</Typography>
            <Typography>{formatCurrency(rawCostEUR, "EUR")}</Typography>
            <Typography>{formatCurrency(rawCostUSD, "USD")}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography>{parameters.overhead}%</Typography>
            <Typography>{formatCurrency(overhead, "TRY")}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography>{parameters.vat}%</Typography>
            <Typography>{formatCurrency(kdv, "TRY")}</Typography>
          </Box>
        </TableCell>
        <TableCell>{formatCurrency(kar, "TRY")}</TableCell>
        <TableCell>{formatCurrency(araToplam, "TRY")}</TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography>{parameters.commission}%</Typography>
            <Typography>{formatCurrency(komisyon, "TRY")}</Typography>
          </Box>
        </TableCell>
        <TableCell>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography>{formatCurrency(discountedPrice, "TRY")}</Typography>
            <Typography>{formatCurrency(finalPriceEUR, "EUR")}</Typography>
            <Typography>{formatCurrency(finalPriceUSD, "USD")}</Typography>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        İç Maliyet ve Fiyatlandırma - Otomatik
      </Typography>

      <Box sx={{ mb: 3, display: "flex", gap: 4, alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>Genel Gider:</Typography>
          <TextField
            name="overhead"
            value={parameters.overhead}
            onChange={handleParameterChange}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 100, style: { width: "60px" } }}
          />
          <Typography>%</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>KDV:</Typography>
          <TextField
            name="vat"
            value={parameters.vat}
            onChange={handleParameterChange}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 100, style: { width: "60px" } }}
          />
          <Typography>%</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>Komisyon:</Typography>
          <TextField
            name="commission"
            value={parameters.commission}
            onChange={handleParameterChange}
            type="number"
            size="small"
            inputProps={{ min: 0, max: 100, style: { width: "60px" } }}
          />
          <Typography>%</Typography>
        </Box>
        <Button
          variant="contained"
          onClick={calculatePrices}
          disabled={disabled}
        >
          Hesapla
        </Button>
        <Button
          variant="contained"
          onClick={handleDownloadPDF}
          disabled={!calculatedPrices || !isCalculated}
          startIcon={<PictureAsPdfIcon />}
        >
          PDF İndir
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Miktar</TableCell>
              <TableCell>Ham Maliyet</TableCell>
              <TableCell>Genel Gider</TableCell>
              <TableCell>KDV</TableCell>
              <TableCell>Kâr</TableCell>
              <TableCell>Ara Toplam</TableCell>
              <TableCell>Komisyon</TableCell>
              <TableCell>Final Fiyat</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderPriceRow("0-50")}
            {renderPriceRow("51-100")}
            {renderPriceRow("101-200")}
            {renderPriceRow("201-300")}
            {renderPriceRow("301-500")}
            {renderPriceRow("501+")}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PriceTable;

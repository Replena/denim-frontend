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
      const result = await priceService.calculatePrice(
        selectedCustomer.id,
        {
          fabric: totals.fabric || 0,
          lining: totals.lining || 0,
          trim: totals.trim || 0,
        },
        parseFloat(parameters.overhead) || 0,
        parseFloat(parameters.commission) || 0,
        parseFloat(parameters.vat) || 18
      );

      // Backend yanıtını kontrol et
      console.log("Backend yanıtı:", result);

      // Başarı kontrolünü düzelt
      if (result && result.data) {
        // success kontrolünü kaldırdık
        setCalculatedPrices(result.data);
        setIsCalculated(true);

        if (onCalculate) {
          onCalculate(result.data);
        }

        // Fiyat geçmişini güncelle
        if (onPriceCalculated) {
          await onPriceCalculated();
        }
      } else {
        console.error("Geçersiz API yanıtı:", result);
        alert("Fiyat hesaplama yanıtı geçersiz format içeriyor");
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
    if (!isCalculated || !calculatedPrices) {
      console.log("Hesaplama yapılmadı veya fiyatlar yok");
      return null;
    }

    console.log("Hesaplanan fiyatlar:", calculatedPrices);

    // Backend'den gelen değerleri kullan
    const {
      raw_cost,
      overhead_amount,
      profit_amount,
      commission_amount,
      vat_amount,
      final_price,
    } = calculatedPrices;

    // İndirim oranlarını belirle
    let discountRate = 0;
    switch (range) {
      case "51-100":
        discountRate = 0.05;
        break;
      case "101-200":
        discountRate = 0.1;
        break;
      case "201-300":
        discountRate = 0.15;
        break;
      case "301-500":
        discountRate = 0.2;
        break;
      case "501+":
        discountRate = 0.25;
        break;
      default:
        discountRate = 0;
    }

    // İndirimli fiyatı hesapla
    const discountedPrice = final_price * (1 - discountRate);

    return (
      <TableRow>
        <TableCell>{range}</TableCell>
        <TableCell>{formatCurrency(raw_cost)}</TableCell>
        <TableCell>{formatCurrency(overhead_amount)}</TableCell>
        <TableCell>{formatCurrency(raw_cost + overhead_amount)}</TableCell>
        <TableCell>{formatCurrency(profit_amount)}</TableCell>
        <TableCell>{formatCurrency(commission_amount)}</TableCell>
        <TableCell>{formatCurrency(vat_amount)}</TableCell>
        <TableCell>{formatCurrency(discountedPrice)}</TableCell>
        <TableCell>
          {formatCurrency(discountedPrice / exchangeRates.EUR_TRY, "EUR")}
        </TableCell>
        <TableCell>
          {formatCurrency(discountedPrice / exchangeRates.USD_TRY, "USD")}
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

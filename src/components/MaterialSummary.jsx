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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

const MaterialSummary = ({ totals, materials }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("TRY");

  const handleCurrencyChange = (event, newCurrency) => {
    if (newCurrency !== null) {
      setSelectedCurrency(newCurrency);
    }
  };

  const formatCurrency = (value, currency = selectedCurrency) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return `0.00 ${currency}`;

    let convertedValue = numValue;
    if (currency === "EUR") {
      convertedValue = numValue / 33.33;
    } else if (currency === "USD") {
      convertedValue = numValue / 30.85;
    }

    return `${convertedValue.toFixed(2)} ${currency}`;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">MATERYALLER</Typography>
        <ToggleButtonGroup
          value={selectedCurrency}
          exclusive
          onChange={handleCurrencyChange}
          size="small"
        >
          <ToggleButton value="TRY">TRY</ToggleButton>
          <ToggleButton value="USD">USD</ToggleButton>
          <ToggleButton value="EUR">EUR</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Materyal</TableCell>
              <TableCell align="right">Miktar</TableCell>
              <TableCell align="right">
                Birim Fiyat ({selectedCurrency})
              </TableCell>
              <TableCell align="right">Toplam ({selectedCurrency})</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Kumaş Toplamı</TableCell>
              <TableCell align="right">
                {materials?.fabric?.amount || "--"}
              </TableCell>
              <TableCell align="right">
                {materials?.fabric?.price
                  ? formatCurrency(Number(materials.fabric.price))
                  : "--"}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(totals.fabric || 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Astar Toplamı</TableCell>
              <TableCell align="right">
                {materials?.lining?.amount || "--"}
              </TableCell>
              <TableCell align="right">
                {materials?.lining?.price
                  ? formatCurrency(Number(materials.lining.price))
                  : "--"}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(totals.lining || 0)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Garni Toplamı</TableCell>
              <TableCell align="right">
                {materials?.trim?.amount || "--"}
              </TableCell>
              <TableCell align="right">
                {materials?.trim?.price
                  ? formatCurrency(Number(materials.trim.price))
                  : "--"}
              </TableCell>
              <TableCell align="right">
                {formatCurrency(totals.trim || 0)}
              </TableCell>
            </TableRow>
            <TableRow sx={{ "& td": { fontWeight: "bold" } }}>
              <TableCell colSpan={3}>TOPLAM:</TableCell>
              <TableCell
                align="right"
                sx={{ display: "flex", flexDirection: "column" }}
              >
                <Typography>{formatCurrency(totals.total || 0)}</Typography>
                {selectedCurrency !== "TRY" && (
                  <Typography variant="body2" color="text.secondary">
                    ({formatCurrency(totals.total || 0, "TRY")})
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default MaterialSummary;

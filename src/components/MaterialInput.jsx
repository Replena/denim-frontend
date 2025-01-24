import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Grid,
  MenuItem,
  Typography,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const EXCHANGE_RATES = {
  EUR: 37.13,
  USD: 35.66,
  GBP: 44.85,
  TRY: 1,
};

const MaterialInput = ({
  onTotalsUpdate,
  onMaterialsChange,
  materials,
  disabled,
}) => {
  const calculateTotalInTRY = (price, amount, currency) => {
    if (!price || !amount) return 0;
    return price * amount * EXCHANGE_RATES[currency];
  };

  useEffect(() => {
    const fabricTotal = calculateTotalInTRY(
      materials.fabric.price,
      materials.fabric.amount,
      materials.fabric.currency
    );
    const liningTotal = calculateTotalInTRY(
      materials.lining.price,
      materials.lining.amount,
      materials.lining.currency
    );
    const trimTotal = calculateTotalInTRY(
      materials.trim.price,
      materials.trim.amount,
      materials.trim.currency
    );

    const totalInTRY = fabricTotal + liningTotal + trimTotal;

    const newTotals = {
      fabric: fabricTotal,
      lining: liningTotal,
      trim: trimTotal,
      total: totalInTRY,
    };

    onTotalsUpdate(newTotals);
  }, [materials, onTotalsUpdate]);

  const handleMaterialChange = (type, field, value) => {
    const newMaterials = {
      ...materials,
      [type]: {
        ...materials[type],
        [field]: value,
      },
    };
    onMaterialsChange(newMaterials);
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Fiyat Bilgileri
        </Typography>
        <Grid container spacing={3}>
          {/* Kumaş Bilgileri */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Kumaş Fiyatı"
              value={materials.fabric.price}
              onChange={(e) =>
                handleMaterialChange("fabric", "price", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Kumaş Miktarı"
              value={materials.fabric.amount}
              onChange={(e) =>
                handleMaterialChange("fabric", "amount", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel>Para Birimi</InputLabel>
              <Select
                value={materials.fabric.currency}
                onChange={(e) =>
                  handleMaterialChange("fabric", "currency", e.target.value)
                }
                label="Para Birimi"
              >
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Astar Bilgileri */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Astar Fiyatı"
              value={materials.lining.price}
              onChange={(e) =>
                handleMaterialChange("lining", "price", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Astar Miktarı"
              value={materials.lining.amount}
              onChange={(e) =>
                handleMaterialChange("lining", "amount", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel>Para Birimi</InputLabel>
              <Select
                value={materials.lining.currency}
                onChange={(e) =>
                  handleMaterialChange("lining", "currency", e.target.value)
                }
                label="Para Birimi"
              >
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Garni Bilgileri */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Garni Fiyatı"
              value={materials.trim.price}
              onChange={(e) =>
                handleMaterialChange("trim", "price", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Garni Miktarı"
              value={materials.trim.amount}
              onChange={(e) =>
                handleMaterialChange("trim", "amount", e.target.value)
              }
              type="number"
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth disabled={disabled}>
              <InputLabel>Para Birimi</InputLabel>
              <Select
                value={materials.trim.currency}
                onChange={(e) =>
                  handleMaterialChange("trim", "currency", e.target.value)
                }
                label="Para Birimi"
              >
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MaterialInput;

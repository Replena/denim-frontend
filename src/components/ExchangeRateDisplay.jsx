import React from "react";
import { Box, Typography } from "@mui/material";

const ExchangeRateDisplay = ({ rates }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 4,
        my: 2,
        p: 2,
        borderRadius: 1,
        border: "1px solid var(--border-color)",
      }}
    >
      <Typography>USD/TRY: {rates?.USD_TRY?.toFixed(2)}</Typography>
      <Typography>EUR/TRY: {rates?.EUR_TRY?.toFixed(2)}</Typography>
      <Typography>EUR/USD: {rates?.EUR_USD?.toFixed(2)}</Typography>
    </Box>
  );
};

export default ExchangeRateDisplay;

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { customerService } from "../services/api";

const CustomerSelect = ({ onCustomerSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    country: "",
  });

  // Müşterileri getir - useCallback ile optimize edelim
  const fetchCustomers = useCallback(async () => {
    try {
      const data = await customerService.getAllCustomers();
      // Duplikasyonu önlemek için benzersiz ID'lere göre filtrele
      const uniqueCustomers = Array.from(
        new Map(data.map((item) => [item.id, item])).values()
      );
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error("Müşteri yükleme hatası:", error);
    }
  }, []);

  // useEffect'i optimize edelim
  useEffect(() => {
    let mounted = true;

    const loadCustomers = async () => {
      if (mounted) {
        await fetchCustomers();
      }
    };

    loadCustomers();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []); // Boş dependency array

  const handleChange = (event) => {
    const customerId = event.target.value;
    const selected = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customerId);
    if (selected) {
      onCustomerSelect(selected);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewCustomer({ name: "", country: "" });
  };

  const handleNewCustomerChange = (event) => {
    const { name, value } = event.target;
    setNewCustomer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const createdCustomer = await customerService.createCustomer(newCustomer);
      setCustomers((prev) => [...prev, createdCustomer]);
      handleClose();
      // Yeni müşteriyi otomatik seç
      setSelectedCustomer(createdCustomer.id);
      onCustomerSelect(createdCustomer);
    } catch (error) {
      console.error("Müşteri oluşturma hatası:", error);
    }
  };

  return (
    <Box sx={{ minWidth: 120, display: "flex", gap: 2, alignItems: "center" }}>
      <FormControl fullWidth>
        <InputLabel id="customer-select-label">Müşteri</InputLabel>
        <Select
          labelId="customer-select-label"
          id="customer-select"
          value={selectedCustomer}
          label="Müşteri"
          onChange={handleChange}
        >
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.name} - {customer.country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button
        variant="contained"
        onClick={handleClickOpen}
        size="small"
        sx={{
          minWidth: "auto",
          px: 2,
          whiteSpace: "nowrap",
        }}
      >
        Yeni Müşteri
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Müşteri Adı"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.name}
            onChange={handleNewCustomerChange}
          />
          <TextField
            margin="dense"
            name="country"
            label="Ülke"
            type="text"
            fullWidth
            variant="outlined"
            value={newCustomer.country}
            onChange={handleNewCustomerChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Ekle
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(CustomerSelect);

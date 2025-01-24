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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { generatePriceOfferPDF } from "../services/pdfService";

const PriceHistory = ({ priceHistory, onUpdate, onDelete }) => {
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const formatCurrency = (value, currency = "TRY") => {
    return `${Number(value).toFixed(2)} ${currency}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("tr-TR");
  };

  const handleEditClick = (record) => {
    setSelectedRecord(record);
    setEditedRecord({ ...record });
    setEditDialog(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedRecord(record);
    setDeleteDialog(true);
  };

  const handleEditSave = () => {
    onUpdate(editedRecord);
    setEditDialog(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedRecord);
    setDeleteDialog(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadPDF = (record) => {
    const pdfData = {
      customerName: record.Customer?.name || "Bilinmeyen Müşteri",
      country: record.Customer?.country || "Türkiye",
      attention: "ZUHAINA",
      currency: record.currency,
      prices: [
        {
          finalPrice: Number(record.final_price_tl),
        },
      ],
      date: formatDate(record.calculation_date),
    };

    const doc = generatePriceOfferPDF(pdfData);
    doc.save(
      `price_offer_${record.Customer?.name || "draft"}_${formatDate(
        record.calculation_date
      )}.pdf`
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Fiyat Geçmişi
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Müşteri</TableCell>
              <TableCell>Ülke</TableCell>
              <TableCell align="right">Kumaş Fiyatı</TableCell>
              <TableCell align="right">Kâr Marjı</TableCell>
              <TableCell align="right">Final Fiyat (TL)</TableCell>
              <TableCell>Para Birimi</TableCell>
              <TableCell>Tarih</TableCell>
              <TableCell align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {priceHistory
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.Customer?.name}</TableCell>
                  <TableCell>{record.Customer?.country}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(record.fabric_price)}
                  </TableCell>
                  <TableCell align="right">{record.profit_margin}%</TableCell>
                  <TableCell align="right">
                    {formatCurrency(record.final_price_tl)}
                  </TableCell>
                  <TableCell>{record.currency}</TableCell>
                  <TableCell>{formatDate(record.calculation_date)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPDF(record)}
                      title="PDF İndir"
                    >
                      <PictureAsPdfIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={priceHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Sayfa başına satır:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count}`
          }
        />
      </TableContainer>

      {/* Düzenleme Dialog'u */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>Kayıt Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Müşteri"
              value={editedRecord?.Customer?.name || ""}
              onChange={(e) =>
                setEditedRecord((prev) => ({
                  ...prev,
                  Customer: {
                    ...prev.Customer,
                    name: e.target.value,
                  },
                }))
              }
            />
            <TextField
              label="Kumaş Fiyatı"
              type="number"
              value={editedRecord?.fabric_price || ""}
              onChange={(e) =>
                setEditedRecord((prev) => ({
                  ...prev,
                  fabric_price: e.target.value,
                }))
              }
            />
            <TextField
              label="İşçilik"
              type="number"
              value={editedRecord?.labor_cost || ""}
              onChange={(e) =>
                setEditedRecord((prev) => ({
                  ...prev,
                  labor_cost: e.target.value,
                }))
              }
            />
            <TextField
              label="Kâr Marjı (%)"
              type="number"
              value={editedRecord?.profit_margin || ""}
              onChange={(e) =>
                setEditedRecord((prev) => ({
                  ...prev,
                  profit_margin: e.target.value,
                }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>İptal</Button>
          <Button onClick={handleEditSave} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialog'u */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Kayıt Silme</DialogTitle>
        <DialogContent>
          Bu kaydı silmek istediğinizden emin misiniz?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PriceHistory;

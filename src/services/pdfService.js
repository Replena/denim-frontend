import { jsPDF } from "jspdf";
import "jspdf-autotable";

const getValidityDate = (date) => {
  // Tarih formatını parçalara ayır (TR formatı: DD.MM.YYYY)
  const [day, month, year] = date.split(".");

  // Geçerli bir Date objesi oluştur
  const currentDate = new Date(year, month - 1, day); // month-1 çünkü aylar 0'dan başlar

  // 7 gün ekle
  const validityDate = new Date(currentDate);
  validityDate.setDate(currentDate.getDate() + 7);

  // Tarihi TR formatında döndür
  return validityDate.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const generatePriceOfferPDF = (data) => {
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Logo ve başlık
  doc.setFontSize(24);
  doc.setTextColor(30, 65, 130); // Koyu mavi
  doc.text("ALLDENIMS", 15, 20);
  doc.setFontSize(16);
  doc.text("PRICE OFFER", 15, 30);

  // Müşteri bilgileri
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`CUSTOMER: ${data.customerName}`, 15, 45);
  doc.text(`COUNTRY: ${data.country}`, 15, 50);
  doc.text(`ATTENTION: ${data.attention}`, 15, 55);

  // Tarih bilgileri
  doc.text(`DATE: ${today}`, 120, 45);
  doc.text(`VALIDITY: ${getValidityDate(today)}`, 120, 50);
  doc.text(`CURRENCY: ${data.currency}`, 120, 55);

  // Fiyat tablosu
  const tableColumn = ["QUANTITY", "UNIT PRICE", "DISCOUNT", "FINAL PRICE"];

  // Final fiyatları kullan (ham maliyet yerine)
  const tableRows = [
    [
      "0-50",
      data.prices[0].finalPrice.toFixed(2), // Ham fiyat yerine final fiyat
      "0%",
      data.prices[0].finalPrice.toFixed(2),
    ],
    [
      "51-100",
      (data.prices[0].finalPrice * 0.95).toFixed(2), // %5 indirimli final fiyat
      "5%",
      (data.prices[0].finalPrice * 0.95).toFixed(2),
    ],
    [
      "101-200",
      (data.prices[0].finalPrice * 0.9).toFixed(2), // %10 indirimli final fiyat
      "10%",
      (data.prices[0].finalPrice * 0.9).toFixed(2),
    ],
    [
      "201-300",
      (data.prices[0].finalPrice * 0.85).toFixed(2), // %15 indirimli final fiyat
      "15%",
      (data.prices[0].finalPrice * 0.85).toFixed(2),
    ],
  ];

  doc.autoTable({
    startY: 70, // Price details kaldırıldığı için tabloyu yukarı çektik
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 65, 130] },
  });

  // Ödeme şartları - mavi arka planlı başlık
  const paymentY = doc.autoTable.previous.finalY + 10;
  doc.setFillColor(30, 65, 130);
  doc.rect(15, paymentY, 180, 6, "F");
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text("PAYMENT TERMS", 17, paymentY + 4);

  // Ödeme şartları içeriği
  doc.setTextColor(0);
  doc.setFontSize(8);
  doc.text(
    "60% TT IN ADVANCE + BALANCE 40% TT BEFORE SHIPMENT",
    15,
    paymentY + 12
  );

  // Notlar başlığı - mavi arka planlı
  const remarksY = paymentY + 20;
  doc.setFillColor(30, 65, 130);
  doc.rect(15, remarksY, 180, 6, "F");
  doc.setTextColor(255);
  doc.setFontSize(10);
  doc.text("REMARKS", 17, remarksY + 4);

  // Notlar içeriği
  doc.setTextColor(0);
  doc.setFontSize(8);
  const remarks = [
    "* Average proto-sampling leadtime varies from 2 to 3 weeks depending on the material availability and/or adequacy of data required to start sampling.",
    "* Proto, SMS and PPS samples are charged X2 of the product value. TOP sample is charged X1 of the product value.",
    "* Samples are shipped out and received in through customer's courier account. In cases of parcel shipments on Alldenims' courier account due to temporary or permanent setbacks on customer's courier arrangement, such invoices are charged to customer separately.",
    "* Average production leadtime varies from 4 to 6 weeks depending on style and order parameters starting from having all materials in house.",
    "* Leadtimes mentioned exclude national holidays in Turkey.",
    "* In case the customer ships any of the materials involved in production of the mentioned styles from outside of Turkey may be subject to taxation at customs. Such fees and expenses are charged to customer separately.",
    '* Similarly, such parcels may be held up at customs for probation or analysis purposes even if they are deemed to be classified as "samples". Any demurrage charges that may apply in such cases will be reflected to customer.',
  ];

  let yPos = remarksY + 12;
  remarks.forEach((remark) => {
    const lines = doc.splitTextToSize(remark, 170);
    doc.text(lines, 15, yPos);
    yPos += lines.length * 5;
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(30, 65, 130);
  doc.setLineWidth(0.5);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);

  doc.setFontSize(8);
  doc.setTextColor(30, 65, 130);
  doc.text("www.alldenims.com", 15, pageHeight - 15);
  doc.text("info@alldenims.com", 85, pageHeight - 15);
  doc.text("+90 212 000 00 00", 155, pageHeight - 15);

  return doc;
};

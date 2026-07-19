import React from "react";
import { calculateReceiptTotals } from "@/lib/receipt/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { ReceiptData, ReceiptTotals } from "@/lib/receipt/types";

type PdfRenderer = typeof import("@react-pdf/renderer");

function optionalLines(lines: Array<string | false>) {
  return lines.filter(Boolean) as string[];
}

function paymentDetailLines(receipt: ReceiptData) {
  return optionalLines([
    `Method: ${receipt.paymentMethod === "Other" ? receipt.customPaymentMethod || "Other" : receipt.paymentMethod}`,
    receipt.bankName && `Bank: ${receipt.bankName}`,
    receipt.accountName && `Account name: ${receipt.accountName}`,
    receipt.transactionReference && `Reference: ${receipt.transactionReference}`,
    receipt.transactionId && `Transaction ID: ${receipt.transactionId}`,
    receipt.cardLastFour && `Card last four: ${receipt.cardLastFour}`,
    receipt.terminalReference && `Terminal reference: ${receipt.terminalReference}`,
    receipt.cardType && `Card type: ${receipt.cardType}`,
    receipt.chequeNumber && `Cheque number: ${receipt.chequeNumber}`,
    receipt.chequeDate && `Cheque date: ${receipt.chequeDate}`,
    receipt.paymentProvider && `Provider: ${receipt.paymentProvider}`,
  ]);
}

function ReceiptPdfDocument({
  receipt,
  totals,
  renderer,
}: {
  receipt: ReceiptData;
  totals: ReceiptTotals;
  renderer: PdfRenderer;
}) {
  const { Document, Page, Text, View, Image, StyleSheet } = renderer;
  const compact = receipt.template === "compact";
  const isModern = receipt.template === "modern";
  const styles = StyleSheet.create({
    page: {
      padding: compact ? 20 : 36,
      fontSize: compact ? 9 : 10,
      color: "#111111",
      fontFamily: "Helvetica",
      lineHeight: 1.45,
    },
    header: {
      flexDirection: compact ? "column" : "row",
      justifyContent: "space-between",
      gap: 24,
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: isModern ? 2 : 1,
      borderBottomColor: receipt.accentColor,
    },
    logo: {
      width: compact ? 54 : 72,
      height: compact ? 54 : 72,
      objectFit: "contain",
      marginBottom: 8,
    },
    title: {
      fontSize: compact ? 22 : 30,
      fontWeight: 700,
      color: receipt.accentColor,
      marginBottom: 8,
    },
    status: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: receipt.status === "Paid" ? "#e9f8df" : receipt.status === "Voided" ? "#eeeeee" : "#fff4d8",
      color: "#111111",
      marginTop: 4,
    },
    sectionRow: {
      flexDirection: compact ? "column" : "row",
      gap: compact ? 12 : 30,
      marginBottom: 20,
    },
    section: {
      flex: 1,
    },
    heading: {
      fontSize: 11,
      fontWeight: 700,
      color: receipt.accentColor,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    strong: {
      fontSize: 13,
      fontWeight: 700,
      marginBottom: 4,
    },
    muted: {
      color: "#666666",
    },
    table: {
      borderWidth: 1,
      borderColor: "#dddddd",
      marginTop: 8,
      marginBottom: 20,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: isModern ? receipt.accentColor : "#f3f3f3",
      color: isModern ? "#ffffff" : "#111111",
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontWeight: 700,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: "#eeeeee",
    },
    descriptionCol: {
      width: compact ? "44%" : "36%",
      paddingRight: 8,
    },
    smallCol: {
      width: compact ? "14%" : "12%",
      textAlign: "right",
    },
    totalsWrap: {
      marginLeft: "auto",
      width: compact ? 180 : 240,
      marginBottom: 22,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
      gap: 12,
    },
    grandTotal: {
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: 2,
      borderTopColor: receipt.accentColor,
      fontSize: 13,
      fontWeight: 700,
    },
    block: {
      marginBottom: 14,
    },
    signatureRow: {
      flexDirection: compact ? "column" : "row",
      gap: 28,
      marginTop: 24,
    },
    signatureLine: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: "#111111",
      paddingTop: 6,
    },
  });

  const filteredItems = receipt.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);
  const paymentLines = paymentDetailLines(receipt);
  const customerName = receipt.anonymousCustomer ? "Walk-in Customer" : receipt.customerName || "Customer name";
  const noteLines = optionalLines([
    receipt.acknowledgement,
    receipt.notes && `Notes: ${receipt.notes}`,
    receipt.thankYouMessage,
    receipt.terms && `Terms: ${receipt.terms}`,
    receipt.refundPolicy && `Refund policy: ${receipt.refundPolicy}`,
    receipt.showInternalNote && receipt.internalNote && `Internal note: ${receipt.internalNote}`,
  ]);

  return (
    <Document title={`Receipt ${receipt.receiptNumber}`}>
      <Page size={compact ? [226, 720] : "A4"} style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {receipt.businessLogo ? <Image src={receipt.businessLogo} style={styles.logo} /> : null}
            <Text style={styles.strong}>{receipt.businessName || "Business name"}</Text>
            {receipt.businessAddress ? <Text style={styles.muted}>{receipt.businessAddress}</Text> : null}
            {receipt.businessEmail ? <Text style={styles.muted}>{receipt.businessEmail}</Text> : null}
            {receipt.businessPhone ? <Text style={styles.muted}>{receipt.businessPhone}</Text> : null}
            {receipt.businessWebsite ? <Text style={styles.muted}>{receipt.businessWebsite}</Text> : null}
            {receipt.businessTaxId ? <Text style={styles.muted}>Tax ID: {receipt.businessTaxId}</Text> : null}
            {receipt.businessRegistrationNumber ? <Text style={styles.muted}>Registration: {receipt.businessRegistrationNumber}</Text> : null}
            {receipt.businessInfo ? <Text style={styles.muted}>{receipt.businessInfo}</Text> : null}
          </View>
          <View style={{ width: compact ? "100%" : 210, alignItems: compact ? "flex-start" : "flex-end" }}>
            <Text style={styles.title}>RECEIPT</Text>
            <Text>{receipt.receiptNumber}</Text>
            <Text>Paid: {receipt.paymentDate || "-"}</Text>
            {receipt.paymentTime ? <Text>Time: {receipt.paymentTime}</Text> : null}
            <Text style={styles.status}>{receipt.status}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={styles.heading}>Received from</Text>
            <Text style={styles.strong}>{customerName}</Text>
            {!receipt.anonymousCustomer && receipt.contactPerson ? <Text style={styles.muted}>Contact: {receipt.contactPerson}</Text> : null}
            {!receipt.anonymousCustomer && receipt.customerAddress ? <Text style={styles.muted}>{receipt.customerAddress}</Text> : null}
            {!receipt.anonymousCustomer && receipt.customerEmail ? <Text style={styles.muted}>{receipt.customerEmail}</Text> : null}
            {!receipt.anonymousCustomer && receipt.customerPhone ? <Text style={styles.muted}>{receipt.customerPhone}</Text> : null}
            {!receipt.anonymousCustomer && receipt.customerTaxId ? <Text style={styles.muted}>Tax ID: {receipt.customerTaxId}</Text> : null}
          </View>
          <View style={styles.section}>
            <Text style={styles.heading}>Payment details</Text>
            {paymentLines.map((line) => (
              <Text key={line} style={styles.muted}>
                {line}
              </Text>
            ))}
            {receipt.relatedInvoiceNumber ? <Text style={styles.muted}>Invoice: {receipt.relatedInvoiceNumber}</Text> : null}
            {receipt.relatedQuotationNumber ? <Text style={styles.muted}>Quotation: {receipt.relatedQuotationNumber}</Text> : null}
            {receipt.reference ? <Text style={styles.muted}>Reference: {receipt.reference}</Text> : null}
            {receipt.salesRepresentative ? <Text style={styles.muted}>Issued by: {receipt.salesRepresentative}</Text> : null}
            {receipt.branchLocation ? <Text style={styles.muted}>Location: {receipt.branchLocation}</Text> : null}
          </View>
        </View>

        {receipt.simpleMode ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Payment description</Text>
            <Text>{receipt.paymentDescription || "Payment received"}</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <Text style={styles.descriptionCol}>Item</Text>
              <Text style={styles.smallCol}>Qty</Text>
              <Text style={styles.smallCol}>Price</Text>
              <Text style={styles.smallCol}>Discount</Text>
              <Text style={styles.smallCol}>Tax</Text>
              <Text style={styles.smallCol}>Total</Text>
            </View>
            {filteredItems.map((item) => {
              const line = totals.lines.find((entry) => entry.id === item.id);

              return (
                <View key={item.id} style={styles.tableRow} wrap={false}>
                  <View style={styles.descriptionCol}>
                    <Text>{item.name || "Item"}</Text>
                    {item.description ? <Text style={styles.muted}>{item.description}</Text> : null}
                    {item.unit ? <Text style={styles.muted}>Unit: {item.unit}</Text> : null}
                  </View>
                  <Text style={styles.smallCol}>{item.quantity}</Text>
                  <Text style={styles.smallCol}>{formatMoney(item.unitPrice, receipt.currency)}</Text>
                  <Text style={styles.smallCol}>{formatMoney(line?.discount || 0, receipt.currency)}</Text>
                  <Text style={styles.smallCol}>{formatMoney(line?.tax || 0, receipt.currency)}</Text>
                  <Text style={styles.smallCol}>{formatMoney(line?.total || 0, receipt.currency)}</Text>
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.totalsWrap}>
          {!receipt.simpleMode ? (
            <>
              <View style={styles.totalRow}>
                <Text>Subtotal</Text>
                <Text>{formatMoney(totals.subtotal, receipt.currency)}</Text>
              </View>
              {totals.overallDiscount > 0 ? (
                <View style={styles.totalRow}>
                  <Text>Discount</Text>
                  <Text>-{formatMoney(totals.overallDiscount, receipt.currency)}</Text>
                </View>
              ) : null}
              <View style={styles.totalRow}>
                <Text>Tax</Text>
                <Text>{formatMoney(totals.tax, receipt.currency)}</Text>
              </View>
            </>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Grand total</Text>
            <Text>{formatMoney(totals.grandTotal, receipt.currency)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Amount received</Text>
            <Text>{formatMoney(totals.amountReceived, receipt.currency)}</Text>
          </View>
          {totals.balanceDue > 0 ? (
            <View style={styles.totalRow}>
              <Text>Balance due</Text>
              <Text>{formatMoney(totals.balanceDue, receipt.currency)}</Text>
            </View>
          ) : totals.changeDue > 0 ? (
            <View style={styles.totalRow}>
              <Text>Change due</Text>
              <Text>{formatMoney(totals.changeDue, receipt.currency)}</Text>
            </View>
          ) : (
            <View style={styles.totalRow}>
              <Text>Payment status</Text>
              <Text>Paid in full</Text>
            </View>
          )}
          {receipt.status === "Refunded" ? (
            <View style={styles.totalRow}>
              <Text>Refunded amount</Text>
              <Text>{formatMoney(totals.refundedAmount, receipt.currency)}</Text>
            </View>
          ) : null}
        </View>

        {noteLines.length ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Notes</Text>
            {noteLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        ) : null}
        {receipt.showSignature ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Signature</Text>
            {receipt.issuedBy ? <Text>Issued by: {receipt.issuedBy}</Text> : null}
            <View style={styles.signatureRow}>
              <View style={styles.signatureLine}>
                <Text>Authorised signature</Text>
              </View>
              {receipt.showCustomerSignature ? (
                <View style={styles.signatureLine}>
                  <Text>Customer signature</Text>
                </View>
              ) : null}
              <View style={styles.signatureLine}>
                <Text>Date</Text>
              </View>
            </View>
            {receipt.showBusinessStamp ? <Text style={[styles.muted, { marginTop: 12 }]}>Business stamp</Text> : null}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function downloadReceiptPdf(receipt: ReceiptData) {
  const renderer = await import("@react-pdf/renderer");
  const totals = calculateReceiptTotals(receipt);
  const blob = await renderer.pdf(<ReceiptPdfDocument receipt={receipt} totals={totals} renderer={renderer} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Receipt-${receipt.receiptNumber || "draft"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

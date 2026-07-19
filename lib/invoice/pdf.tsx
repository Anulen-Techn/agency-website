import React from "react";
import { calculateInvoiceTotals } from "@/lib/invoice/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { InvoiceData, InvoiceTotals } from "@/lib/invoice/types";

type PdfRenderer = typeof import("@react-pdf/renderer");

function paymentLines(invoice: InvoiceData) {
  return [
    invoice.paymentInstructions && `Instructions: ${invoice.paymentInstructions}`,
    invoice.bankName && `Bank: ${invoice.bankName}`,
    invoice.accountName && `Account name: ${invoice.accountName}`,
    invoice.accountNumber && `Account number: ${invoice.accountNumber}`,
    invoice.paymentLink && `Payment link: ${invoice.paymentLink}`,
  ].filter(Boolean) as string[];
}

function InvoicePdfDocument({
  invoice,
  totals,
  renderer,
}: {
  invoice: InvoiceData;
  totals: InvoiceTotals;
  renderer: PdfRenderer;
}) {
  const { Document, Page, Text, View, Image, StyleSheet } = renderer;
  const styles = StyleSheet.create({
    page: {
      padding: 36,
      fontSize: 10,
      color: "#111111",
      fontFamily: "Helvetica",
      lineHeight: 1.45,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 28,
      marginBottom: 30,
      paddingBottom: 18,
      borderBottomWidth: 2,
      borderBottomColor: invoice.accentColor,
    },
    logo: {
      width: 72,
      height: 72,
      objectFit: "contain",
      marginBottom: 10,
    },
    title: {
      fontSize: 30,
      fontWeight: 700,
      color: invoice.accentColor,
      marginBottom: 8,
    },
    status: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: invoice.status === "Paid" ? "#e9f8df" : invoice.status === "Draft" ? "#eeeeee" : "#fff4d8",
      color: invoice.status === "Paid" ? "#2f6f1f" : "#111111",
      marginTop: 4,
    },
    sectionRow: {
      flexDirection: "row",
      gap: 30,
      marginBottom: 24,
    },
    section: {
      flex: 1,
    },
    heading: {
      fontSize: 11,
      fontWeight: 700,
      color: invoice.accentColor,
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
      marginTop: 10,
      marginBottom: 22,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: invoice.template === "modern" ? invoice.accentColor : "#f3f3f3",
      color: invoice.template === "modern" ? "#ffffff" : "#111111",
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
      width: "42%",
      paddingRight: 8,
    },
    smallCol: {
      width: "14.5%",
      textAlign: "right",
    },
    totalsWrap: {
      marginLeft: "auto",
      width: 220,
      marginBottom: 24,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    grandTotal: {
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: 2,
      borderTopColor: invoice.accentColor,
      fontSize: 13,
      fontWeight: 700,
    },
    block: {
      marginBottom: 14,
    },
  });

  const filteredItems = invoice.items.filter((item) => item.description.trim() || item.unitPrice > 0 || item.quantity > 0);
  const payment = paymentLines(invoice);

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {invoice.businessLogo ? <Image src={invoice.businessLogo} style={styles.logo} /> : null}
            <Text style={styles.strong}>{invoice.businessName || "Business name"}</Text>
            {invoice.businessAddress ? <Text style={styles.muted}>{invoice.businessAddress}</Text> : null}
            {invoice.businessEmail ? <Text style={styles.muted}>{invoice.businessEmail}</Text> : null}
            {invoice.businessPhone ? <Text style={styles.muted}>{invoice.businessPhone}</Text> : null}
            {invoice.businessWebsite ? <Text style={styles.muted}>{invoice.businessWebsite}</Text> : null}
            {invoice.businessTaxId ? <Text style={styles.muted}>Tax ID: {invoice.businessTaxId}</Text> : null}
            {invoice.businessInfo ? <Text style={styles.muted}>{invoice.businessInfo}</Text> : null}
          </View>
          <View style={{ width: 210, alignItems: "flex-end" }}>
            <Text style={styles.title}>INVOICE</Text>
            <Text>{invoice.invoiceNumber}</Text>
            <Text>Issued: {invoice.issueDate || "-"}</Text>
            <Text>Due: {invoice.dueDate || "-"}</Text>
            {invoice.reference ? <Text>Reference: {invoice.reference}</Text> : null}
            <Text style={styles.status}>{invoice.status}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={styles.heading}>Bill to</Text>
            <Text style={styles.strong}>{invoice.clientName || "Client name"}</Text>
            {invoice.clientAddress ? <Text style={styles.muted}>{invoice.clientAddress}</Text> : null}
            {invoice.clientEmail ? <Text style={styles.muted}>{invoice.clientEmail}</Text> : null}
            {invoice.clientPhone ? <Text style={styles.muted}>{invoice.clientPhone}</Text> : null}
            {invoice.clientTaxId ? <Text style={styles.muted}>Tax ID: {invoice.clientTaxId}</Text> : null}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.descriptionCol}>Item</Text>
            <Text style={styles.smallCol}>Qty</Text>
            <Text style={styles.smallCol}>Price</Text>
            <Text style={styles.smallCol}>Tax</Text>
            <Text style={styles.smallCol}>Total</Text>
          </View>
          {filteredItems.map((item) => {
            const line = totals.lines.find((entry) => entry.id === item.id);

            return (
              <View key={item.id} style={styles.tableRow} wrap={false}>
                <View style={styles.descriptionCol}>
                  <Text>{item.description || "Item"}</Text>
                  {item.details ? <Text style={styles.muted}>{item.details}</Text> : null}
                </View>
                <Text style={styles.smallCol}>{item.quantity}</Text>
                <Text style={styles.smallCol}>{formatMoney(item.unitPrice, invoice.currency)}</Text>
                <Text style={styles.smallCol}>{formatMoney(line?.tax || 0, invoice.currency)}</Text>
                <Text style={styles.smallCol}>{formatMoney(line?.total || 0, invoice.currency)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(totals.subtotal, invoice.currency)}</Text>
          </View>
          {totals.discount > 0 ? (
            <View style={styles.totalRow}>
              <Text>Discount</Text>
              <Text>-{formatMoney(totals.discount, invoice.currency)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text>Tax</Text>
            <Text>{formatMoney(totals.tax, invoice.currency)}</Text>
          </View>
          {totals.shipping > 0 ? (
            <View style={styles.totalRow}>
              <Text>Additional charges</Text>
              <Text>{formatMoney(totals.shipping, invoice.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{formatMoney(totals.grandTotal, invoice.currency)}</Text>
          </View>
          {totals.amountPaid > 0 ? (
            <View style={styles.totalRow}>
              <Text>Amount paid</Text>
              <Text>{formatMoney(totals.amountPaid, invoice.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Balance due</Text>
            <Text>{formatMoney(totals.balanceDue, invoice.currency)}</Text>
          </View>
        </View>

        {invoice.notes ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}
        {invoice.terms ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Terms</Text>
            <Text>{invoice.terms}</Text>
          </View>
        ) : null}
        {payment.length ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Payment details</Text>
            {payment.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function downloadInvoicePdf(invoice: InvoiceData) {
  const renderer = await import("@react-pdf/renderer");
  const totals = calculateInvoiceTotals(invoice);
  const blob = await renderer.pdf(<InvoicePdfDocument invoice={invoice} totals={totals} renderer={renderer} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Invoice-${invoice.invoiceNumber || "draft"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

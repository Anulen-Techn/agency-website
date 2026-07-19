import React from "react";
import { calculateQuotationTotals } from "@/lib/quotation/calculations";
import { formatMoney } from "@/lib/invoice/currency";
import type { QuotationData, QuotationTotals } from "@/lib/quotation/types";

type PdfRenderer = typeof import("@react-pdf/renderer");

function optionalLines(lines: Array<string | false>) {
  return lines.filter(Boolean) as string[];
}

function QuotationPdfDocument({
  quotation,
  totals,
  renderer,
}: {
  quotation: QuotationData;
  totals: QuotationTotals;
  renderer: PdfRenderer;
}) {
  const { Document, Page, Text, View, Image, StyleSheet } = renderer;
  const isModern = quotation.template === "modern";
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
      marginBottom: 28,
      paddingBottom: 18,
      borderBottomWidth: isModern ? 2 : 1,
      borderBottomColor: quotation.accentColor,
    },
    logo: {
      width: 72,
      height: 72,
      objectFit: "contain",
      marginBottom: 10,
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      color: quotation.accentColor,
      marginBottom: 8,
    },
    status: {
      alignSelf: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "#eeeeee",
      color: "#111111",
      marginTop: 4,
    },
    sectionRow: {
      flexDirection: "row",
      gap: 30,
      marginBottom: 22,
    },
    section: {
      flex: 1,
    },
    heading: {
      fontSize: 11,
      fontWeight: 700,
      color: quotation.accentColor,
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
      backgroundColor: isModern ? quotation.accentColor : "#f3f3f3",
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
      width: "34%",
      paddingRight: 8,
    },
    smallCol: {
      width: "11%",
      textAlign: "right",
    },
    unitCol: {
      width: "10%",
      textAlign: "right",
    },
    totalsWrap: {
      marginLeft: "auto",
      width: 240,
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
      borderTopColor: quotation.accentColor,
      fontSize: 13,
      fontWeight: 700,
    },
    block: {
      marginBottom: 14,
    },
    acceptance: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: "#dddddd",
    },
    signatureRow: {
      flexDirection: "row",
      gap: 28,
      marginTop: 20,
    },
    signatureLine: {
      flex: 1,
      borderTopWidth: 1,
      borderTopColor: "#111111",
      paddingTop: 6,
    },
  });

  const filteredItems = quotation.items.filter((item) => item.name.trim() || item.description.trim() || item.unitPrice > 0);
  const projectLines = optionalLines([
    quotation.projectName && `Project: ${quotation.projectName}`,
    quotation.reference && `Reference: ${quotation.reference}`,
    quotation.salesRepresentative && `Sales representative: ${quotation.salesRepresentative}`,
  ]);
  const noteLines = optionalLines([
    quotation.introductoryMessage,
    quotation.notes && `Notes: ${quotation.notes}`,
    quotation.deliveryTimeline && `Delivery timeline: ${quotation.deliveryTimeline}`,
    quotation.estimatedCompletionTime && `Estimated completion: ${quotation.estimatedCompletionTime}`,
    quotation.warrantyInformation && `Warranty: ${quotation.warrantyInformation}`,
  ]);
  const paymentLines = optionalLines([
    quotation.paymentTerms && `Payment terms: ${quotation.paymentTerms}`,
    quotation.bankDetails && `Bank details: ${quotation.bankDetails}`,
    quotation.paymentLink && `Payment link: ${quotation.paymentLink}`,
  ]);

  return (
    <Document title={`Quotation ${quotation.quotationNumber}`}>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {quotation.businessLogo ? <Image src={quotation.businessLogo} style={styles.logo} /> : null}
            <Text style={styles.strong}>{quotation.businessName || "Business name"}</Text>
            {quotation.businessAddress ? <Text style={styles.muted}>{quotation.businessAddress}</Text> : null}
            {quotation.businessEmail ? <Text style={styles.muted}>{quotation.businessEmail}</Text> : null}
            {quotation.businessPhone ? <Text style={styles.muted}>{quotation.businessPhone}</Text> : null}
            {quotation.businessWebsite ? <Text style={styles.muted}>{quotation.businessWebsite}</Text> : null}
            {quotation.businessTaxId ? <Text style={styles.muted}>Tax ID: {quotation.businessTaxId}</Text> : null}
            {quotation.businessRegistrationNumber ? <Text style={styles.muted}>Registration: {quotation.businessRegistrationNumber}</Text> : null}
            {quotation.businessInfo ? <Text style={styles.muted}>{quotation.businessInfo}</Text> : null}
          </View>
          <View style={{ width: 210, alignItems: "flex-end" }}>
            <Text style={styles.title}>QUOTATION</Text>
            <Text>{quotation.quotationNumber}</Text>
            <Text>Issued: {quotation.issueDate || "-"}</Text>
            <Text>Valid until: {quotation.validUntil || "-"}</Text>
            <Text style={styles.status}>{quotation.status}</Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <View style={styles.section}>
            <Text style={styles.heading}>Quote to</Text>
            <Text style={styles.strong}>{quotation.customerName || "Customer name"}</Text>
            {quotation.contactPerson ? <Text style={styles.muted}>Contact: {quotation.contactPerson}</Text> : null}
            {quotation.customerAddress ? <Text style={styles.muted}>{quotation.customerAddress}</Text> : null}
            {quotation.customerEmail ? <Text style={styles.muted}>{quotation.customerEmail}</Text> : null}
            {quotation.customerPhone ? <Text style={styles.muted}>{quotation.customerPhone}</Text> : null}
            {quotation.customerTaxId ? <Text style={styles.muted}>Tax ID: {quotation.customerTaxId}</Text> : null}
          </View>
          {projectLines.length ? (
            <View style={styles.section}>
              <Text style={styles.heading}>Quotation details</Text>
              {projectLines.map((line) => (
                <Text key={line} style={styles.muted}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={styles.descriptionCol}>Item</Text>
            <Text style={styles.unitCol}>Unit</Text>
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
                </View>
                <Text style={styles.unitCol}>{item.unit || "-"}</Text>
                <Text style={styles.smallCol}>{item.quantity}</Text>
                <Text style={styles.smallCol}>{formatMoney(item.unitPrice, quotation.currency)}</Text>
                <Text style={styles.smallCol}>{formatMoney(line?.discount || 0, quotation.currency)}</Text>
                <Text style={styles.smallCol}>{formatMoney(line?.tax || 0, quotation.currency)}</Text>
                <Text style={styles.smallCol}>{formatMoney(line?.total || 0, quotation.currency)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatMoney(totals.subtotal, quotation.currency)}</Text>
          </View>
          {totals.lineDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text>Line discounts</Text>
              <Text>-{formatMoney(totals.lineDiscount, quotation.currency)}</Text>
            </View>
          ) : null}
          <View style={styles.totalRow}>
            <Text>Tax</Text>
            <Text>{formatMoney(totals.tax, quotation.currency)}</Text>
          </View>
          {totals.overallDiscount > 0 ? (
            <View style={styles.totalRow}>
              <Text>Overall discount</Text>
              <Text>-{formatMoney(totals.overallDiscount, quotation.currency)}</Text>
            </View>
          ) : null}
          {totals.shipping > 0 ? (
            <View style={styles.totalRow}>
              <Text>Shipping</Text>
              <Text>{formatMoney(totals.shipping, quotation.currency)}</Text>
            </View>
          ) : null}
          {totals.additionalCharge > 0 ? (
            <View style={styles.totalRow}>
              <Text>Additional charge</Text>
              <Text>{formatMoney(totals.additionalCharge, quotation.currency)}</Text>
            </View>
          ) : null}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Grand total</Text>
            <Text>{formatMoney(totals.grandTotal, quotation.currency)}</Text>
          </View>
          {totals.depositRequired > 0 ? (
            <>
              <View style={styles.totalRow}>
                <Text>Deposit required</Text>
                <Text>{formatMoney(totals.depositRequired, quotation.currency)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Balance after deposit</Text>
                <Text>{formatMoney(totals.balanceAfterDeposit, quotation.currency)}</Text>
              </View>
            </>
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
        {quotation.terms ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Terms and conditions</Text>
            <Text>{quotation.terms}</Text>
          </View>
        ) : null}
        {paymentLines.length ? (
          <View style={styles.block}>
            <Text style={styles.heading}>Payment details</Text>
            {paymentLines.map((line) => (
              <Text key={line}>{line}</Text>
            ))}
          </View>
        ) : null}
        {quotation.showAcceptance ? (
          <View style={styles.acceptance}>
            <Text style={styles.heading}>Customer acceptance</Text>
            <Text>{quotation.acceptanceInstructions || "I accept this quotation and authorize the work described above."}</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureLine}>
                <Text>Customer name / signature</Text>
              </View>
              <View style={styles.signatureLine}>
                <Text>Date</Text>
              </View>
            </View>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function downloadQuotationPdf(quotation: QuotationData) {
  const renderer = await import("@react-pdf/renderer");
  const totals = calculateQuotationTotals(quotation);
  const blob = await renderer.pdf(<QuotationPdfDocument quotation={quotation} totals={totals} renderer={renderer} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `Quotation-${quotation.quotationNumber || "draft"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

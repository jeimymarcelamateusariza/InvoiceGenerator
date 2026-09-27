import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerNit: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 2, textAlign: 'right' },
  colTotal: { flex: 2, textAlign: 'right' },
  totals: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
});

export const InvoicePdf = ({ invoice }: { invoice: Invoice }) => (
  <Document>
    {/* Media carta size is 5.5 x 8.5 inches, or 396 x 612 points */}
    <Page size={[396, 612]} style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>INVOICE</Text>
        <Text>Invoice ID: {invoice.id}</Text>
        <Text>Date: {new Date(invoice.date).toLocaleDateString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Customer Details:</Text>
        <Text>Name: {invoice.customerName}</Text>
        <Text>NIT: {invoice.customerNit}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colPrice}>Unit Price</Text>
          <Text style={styles.colTotal}>Total</Text>
        </View>
        
        {invoice.items?.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>${item.unitPrice.toFixed(2)}</Text>
            <Text style={styles.colTotal}>${item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.row}>
          <Text>Subtotal:</Text>
          <Text>${invoice.subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text>Tax:</Text>
          <Text>${invoice.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.bold}>Total:</Text>
          <Text style={styles.bold}>${invoice.total.toFixed(2)}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default InvoicePdf;

import React from "react";
import numberToWords from "number-to-words";

interface LineItem {
  description: string;
  hsn: string;
  qty: number;
  rate: number;
  cgst: number;
  sgst: number;
  amount: number;
}

interface InvoiceTemplateProps {
  company: {
    name: string;
    address: string;
    gstin: string;
    email: string;
    phone: string;
    logo?: string;
  };
  client: {
    name: string;
    address: string;
    gstin: string;
  };
  invoice: {
    number: string;
    issueDate: string;
    dueDate: string;
    placeOfSupply: string;
    subject: string;
    items: LineItem[];
    bankDetails: {
      bankName: string;
      accountName: string;
      accountNumber: string;
      ifsc: string;
    };
    terms: string;
    declaration: string;
  };
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  company,
  client,
  invoice,
}) => {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const cgstTotal = invoice.items.reduce(
    (sum, item) => sum + (item.rate * item.qty * item.cgst) / 100,
    0
  );
  const sgstTotal = invoice.items.reduce(
    (sum, item) => sum + (item.rate * item.qty * item.sgst) / 100,
    0
  );
  const total = subtotal + cgstTotal + sgstTotal;

  const totalInWords = `Indian Rupees ${numberToWords
    .toWords(Math.round(total))
    .toUpperCase()} ONLY`;

  return (
    <div id="invoice-pdf" className="bg-white p-8 text-sm font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-start space-x-4">
          {company.logo && (
            <div className="w-28 h-28 border flex items-center justify-center p-2">
    <img
      src={company.logo}
      alt="Logo"
      className="h-24 object-contain"
    />
  </div>
          )}
          <div>
            <h2 className="font-bold text-base">{company.name}</h2>
            <p>{company.address}</p>
            <p>GSTIN: {company.gstin}</p>
            <p>Email: {company.email}</p>
            <p>Phone: {company.phone}</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold mb-1">TAX INVOICE</h1>
          <p>
            <b>Invoice No:</b> {invoice.number}
          </p>
          <p>
            <b>Invoice Date:</b> {invoice.issueDate}
          </p>
          <p>
            <b>Due Date:</b> {invoice.dueDate}
          </p>
          <p>
            <b>Place of Supply:</b> {invoice.placeOfSupply}
          </p>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-4 my-4">
        <div className="border p-3 rounded">
          <h3 className="text-base font-bold mb-1">Bill To</h3>
          <p>{client.name}</p>
          <p>{client.address}</p>
          <p>GSTIN: {client.gstin}</p>
        </div>
        <div className="border p-3 rounded">
          <h3 className="text-base font-bold mb-1">Ship To</h3>
          <p>{client.name}</p>
          <p>{client.address}</p>
          <p>GSTIN: {client.gstin}</p>
        </div>
      </div>

      {/* Subject */}
      <p className="mb-4">
        <b>Subject:</b> {invoice.subject}
      </p>

      {/* Items Table */}
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-3 py-1.5">#</th>
            <th className="border px-3 py-1.5">Item & Description</th>
            <th className="border px-3 py-1.5">HSN/SAC</th>
            <th className="border px-3 py-1.5">Qty</th>
            <th className="border px-3 py-1.5">Rate</th>
            <th className="border px-3 py-1.5">CGST %</th>
            <th className="border px-3 py-1.5">SGST %</th>
            <th className="border px-3 py-1.5">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border px-3 py-1.5 text-center">{idx + 1}</td>
              <td className="border px-3 py-1.5">{item.description}</td>
              <td className="border px-3 py-1.5 text-center">{item.hsn}</td>
              <td className="border px-3 py-1.5 text-center">{item.qty}</td>
              <td className="border px-3 py-1.5 text-right">{item.rate}</td>
              <td className="border px-3 py-1.5 text-right">{item.cgst}%</td>
              <td className="border px-3 py-1.5 text-right">{item.sgst}%</td>
              <td className="border px-3 py-1.5 text-right">{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mt-4">
        <table className="text-sm border">
          <tbody>
            <tr>
              <td className="px-3 py-1.5 border text-right">Sub Total</td>
              <td className="px-3 py-1.5 border text-right">{subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="px-3 py-1.5 border text-right">CGST</td>
              <td className="px-3 py-1.5 border text-right">{cgstTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td className="px-3 py-1.5 border text-right">SGST</td>
              <td className="px-3 py-1.5 border text-right">{sgstTotal.toFixed(2)}</td>
            </tr>
            <tr className="font-bold text-base">
              <td className="px-3 py-1.5 border text-right">Total</td>
              <td className="px-3 py-1.5 border text-right">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes / Terms */}
      <div className="mt-6 text-sm">
        <p>
          <b>Total in Words:</b> {totalInWords}
        </p>
        <p className="mt-3">
          <b>Terms & Conditions:</b> {invoice.terms}
        </p>
        <p className="mt-3">
          <b>Bank Details:</b>
          <br />
          {invoice.bankDetails.bankName}, A/C: {invoice.bankDetails.accountName},{" "}
          {invoice.bankDetails.accountNumber}, IFSC: {invoice.bankDetails.ifsc}
        </p>
        <p className="mt-3">
          <b>Declaration:</b> {invoice.declaration}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-8 text-sm">
        <p>Powered by InvoiceApp</p>
        <p>Authorized Signature</p>
      </div>
    </div>
  );
};
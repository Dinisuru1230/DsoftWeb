import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import LogoComponent from './LogoComponent';

export default function InvoiceModal({ order, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'DSoft Pack',
    companyLegalName: 'DSoft Technologies LLC',
    companyAddressLine1: '5931 Greenville Ave #1169',
    companyAddressLine2: 'Dallas, TX 75206 US',
    companyTaxId: 'EIN: 98-1860068',
    companyEmail: 'contact@dsoftpack.com',
    companyWebsite: 'https://dsoftpack.com',
    invoiceFooterNote: 'Thank you for choosing DSoft Pack. For support queries, email us at contact@dsoftpack.com',
  });

  useEffect(() => {
    fetch('http://localhost:5050/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSettings({
            companyName: data.companyName || 'DSoft Pack',
            companyLegalName: data.companyLegalName || 'DSoft Technologies LLC',
            companyAddressLine1: data.companyAddressLine1 || '5931 Greenville Ave #1169',
            companyAddressLine2: data.companyAddressLine2 || 'Dallas, TX 75206 US',
            companyTaxId: data.companyTaxId || 'EIN: 98-1860068',
            companyEmail: data.companyEmail || 'contact@dsoftpack.com',
            companyWebsite: data.companyWebsite || 'https://dsoftpack.com',
            invoiceFooterNote: data.invoiceFooterNote || 'Thank you for choosing DSoft Pack. For support queries, email us at contact@dsoftpack.com',
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!order) return null;

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US');

  const orderNumber = order.orderNumber || 'DSP-58443';
  const invoiceNo = orderNumber;
  const orderId = orderNumber;

  const paymentMethodText =
    order.paymentMethod === 'BANK_TRANSFER'
      ? 'Bank Transfer - Direct Deposit'
      : order.paymentMethod === 'CARD'
      ? 'Credit / Debit Card'
      : 'Binance Pay - Instant Crypto Transfer (Zero Fees)';

  const handleDownloadPDF = () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;

    setIsGenerating(true);

    const opt = {
      margin: [8, 8, 8, 8],
      filename: `${invoiceNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error('PDF Generation Error:', err);
        setIsGenerating(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white text-black w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden my-auto print:shadow-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Action Header Bar (Hidden during Print) */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
            <h3 className="font-bold text-lg">Official Order Invoice ({invoiceNo})</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isGenerating ? 'sync' : 'picture_as_pdf'}
              </span>
              {isGenerating ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* ── PRINTABLE INVOICE BODY ── */}
        <div className="p-8 sm:p-12 font-sans text-neutral-900 leading-normal bg-white print:p-6" id="printable-invoice">
          
          {/* Top Banner with Brand Logo & Bold "INVOICE" Title */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-neutral-800">
            <div className="pointer-events-none">
              <LogoComponent height="h-12" textSize="text-2xl sm:text-3xl" useThemeColor={false} />
            </div>
            <div className="text-right">
              <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-black uppercase">INVOICE</h1>
              <p className="text-xs font-semibold text-neutral-600 tracking-widest mt-0.5">{invoiceNo}</p>
            </div>
          </div>

          {/* Invoice Header Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-6 border-b border-neutral-300">
            {/* Left: Dynamic Company Details */}
            <div className="space-y-1 text-sm">
              <h2 className="text-lg font-bold text-black mb-0.5">{settings.companyName}</h2>
              {settings.companyLegalName && <p className="font-semibold text-neutral-800">{settings.companyLegalName}</p>}
              {settings.companyAddressLine1 && <p className="text-neutral-700">{settings.companyAddressLine1}</p>}
              {settings.companyAddressLine2 && <p className="text-neutral-700">{settings.companyAddressLine2}</p>}
              {settings.companyTaxId && <p className="text-neutral-700">{settings.companyTaxId}</p>}
              {settings.companyEmail && <p className="text-neutral-700">{settings.companyEmail}</p>}
              {settings.companyWebsite && <p className="text-neutral-700">{settings.companyWebsite}</p>}
            </div>

            {/* Right: Invoice Specs & Barcode */}
            <div className="text-right space-y-1.5 text-sm">
              <div className="flex justify-end gap-3">
                <span className="font-bold text-neutral-800">Date Added:</span>
                <span className="text-neutral-900 font-medium">{formattedDate}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="font-bold text-neutral-800">Invoice No.:</span>
                <span className="text-neutral-900 font-semibold">{invoiceNo}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="font-bold text-neutral-800">Order ID:</span>
                <span className="text-neutral-900 font-semibold">{orderId}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="font-bold text-neutral-800">Payment Method:</span>
                <span className="text-neutral-900 font-medium">{paymentMethodText}</span>
              </div>
              <div className="flex justify-end gap-3">
                <span className="font-bold text-neutral-800">Shipping Method:</span>
                <span className="text-neutral-900 font-medium">Free Shipping</span>
              </div>

              {/* Barcode Graphic */}
              <div className="pt-3 flex justify-end">
                <div className="flex flex-col items-center">
                  <div className="flex items-center space-x-0.5 h-10 px-1 bg-white">
                    {[3,1,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,2,1,3,2,1,4,1,2,3,1].map((width, i) => (
                      <div
                        key={i}
                        className={`bg-black h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`}
                        style={{ width: `${width * 1.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] tracking-widest font-mono text-neutral-600 mt-0.5">*{orderId}*</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Addresses Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-4 border-b border-neutral-300">
            {/* Payment Address */}
            <div className="space-y-2">
              <div className="border-b border-neutral-400 pb-1">
                <h3 className="font-bold text-sm text-black uppercase tracking-wider">PAYMENT ADDRESS</h3>
              </div>
              <div className="text-sm space-y-0.5 text-neutral-800">
                <p className="font-semibold text-black">{order.customerName || 'Customer'}</p>
                <p>Sri Lanka</p>
                {order.email && <p>Email: {order.email}</p>}
                {order.phone && <p>Telephone: {order.phone}</p>}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <div className="border-b border-neutral-400 pb-1">
                <h3 className="font-bold text-sm text-black uppercase tracking-wider">SHIPPING ADDRESS</h3>
              </div>
              <div className="text-sm space-y-0.5 text-neutral-800">
                <p className="font-semibold text-black">{order.customerName || 'Customer'}</p>
                <p>Sri Lanka</p>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-t-2 border-b-2 border-neutral-800 text-neutral-900 font-bold">
                  <th className="py-2.5 px-2">Product Name</th>
                  <th className="py-2.5 px-2 text-right">Price ex. tax</th>
                  <th className="py-2.5 px-2 text-right">Total ex. tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {(order.items || []).map((item, idx) => {
                  const price = Number(item.price || 0);
                  const qty = item.quantity || 1;
                  const itemTotal = price * qty;
                  return (
                    <tr key={item.id || idx}>
                      <td className="py-3 px-2 font-medium text-neutral-900">
                        <div>{qty} x {item.product?.name || 'Software License Product'}</div>
                        {(item.licenseKey || item.product?.licenseKey) && (
                          <div className="text-[11px] font-mono text-neutral-600 font-bold mt-1">
                            {(item.licenseKey || item.product?.licenseKey).includes(',') ? (
                              <div className="space-y-0.5">
                                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block font-sans font-bold">Product License Keys ({item.quantity}):</span>
                                {(item.licenseKey || item.product?.licenseKey).split(',').map((k, kIdx) => (
                                  <div key={kIdx} className="text-black font-extrabold flex items-center gap-1.5">
                                    <span className="text-neutral-500 text-[9px] font-sans"># Key {kIdx + 1}:</span> {k.trim()}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div>
                                Product Key: <span className="text-black font-extrabold">{item.licenseKey || item.product?.licenseKey}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-neutral-800">
                        Rs. {price.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-neutral-900">
                        Rs. {itemTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals Section */}
          <div className="flex justify-end pt-4 mb-12">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between py-1 border-t border-neutral-400">
                <span className="font-bold text-neutral-800">Sub-Total:</span>
                <span className="font-semibold text-black">
                  Rs. {Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-neutral-400 border-b-4 border-double border-neutral-800">
                <span className="font-bold text-neutral-900">Total:</span>
                <span className="font-bold text-black text-base">
                  Rs. {Number(order.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-xs text-neutral-500 pt-8 border-t border-neutral-200">
            <p>{settings.invoiceFooterNote}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

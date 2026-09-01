import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:5050/api';

export default function BankSlipUpload() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, cartSubtotal } = useCart();
  const { token } = useAuth();

  const totalAmount = location.state?.total || cartSubtotal || 55.00;

  const [bankInfo, setBankInfo] = useState({
    bankName: 'Commercial Bank of Ceylon',
    accountName: 'DSoft Pack (Pvt) Ltd',
    accountNumber: '8009 123 456',
    branchName: 'Colombo Main Branch',
    swiftCode: 'CCEYLKLX',
    bankNotes: 'Please include your contact number or order ID as the deposit reference.',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [refNumber, setRefNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((r) => r.json())
      .then((data) => {
        if (data.bankName) {
          setBankInfo({
            bankName: data.bankName || 'Commercial Bank of Ceylon',
            accountName: data.accountName || 'DSoft Pack (Pvt) Ltd',
            accountNumber: data.accountNumber || '8009 123 456',
            branchName: data.branchName || 'Colombo Main Branch',
            swiftCode: data.swiftCode || 'CCEYLKLX',
            bankNotes: data.bankNotes || '',
          });
        }
      })
      .catch(() => {});
  }, []);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select and upload your bank deposit slip receipt.');
      setError('Please upload your bank deposit slip / receipt.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    const toastId = toast.loading('Submitting bank deposit slip and confirming order...');

    try {
      // 1. Create the order in the database
      const orderPayload = {
        customerName: location.state?.customerDetails?.customerName || 'Customer',
        email: location.state?.customerDetails?.email || 'customer@example.com',
        phone: location.state?.customerDetails?.phone || '',
        address: location.state?.customerDetails?.address || '42 Flower Lane, Colombo 03, Sri Lanka',
        totalAmount: totalAmount,
        shippingCost: location.state?.shippingCost || 0,
        paymentMethod: 'BANK_TRANSFER',
        items: (location.state?.items || []).map((i) => ({
          productId: i.id || i.productId,
          colorName: i.color || i.colorName || null,
          quantity: i.quantity || 1,
          price: i.price,
        })),
      };

      const orderRes = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order.');

      const createdOrder = orderData.order;

      // 2. Upload the bank slip attachment to the order
      const formData = new FormData();
      formData.append('bankSlip', selectedFile);
      if (refNumber.trim()) {
        formData.append('depositRef', refNumber.trim());
      }

      const uploadRes = await fetch(`${API_BASE}/orders/${createdOrder.id}/bank-slip`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      const finalOrder = uploadData.order || createdOrder;

      // 3. Clear cart and redirect to success
      toast.success('Payment receipt submitted successfully! Verification in progress.', { id: toastId });
      clearCart();
      navigate('/checkout/success', {
        state: {
          order: finalOrder,
          paymentMethod: 'bank_transfer',
          status: 'Processing / Pending Verification',
          refNumber: refNumber.trim() || finalOrder.orderNumber,
          totalAmount: totalAmount,
        },
      });
    } catch (err) {
      const msg = err.message || 'An error occurred while submitting your payment slip. Please try again.';
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex-grow w-full max-w-[1000px] mx-auto px-5 md:px-8 py-12">
      {/* Page Title */}
      <div className="mb-8 text-center">
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight mb-2">
          Bank Slip Payment
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
          Please transfer the total amount to our bank account below and upload your payment slip receipt to confirm your order.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Card: Bank Account Info */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-primary text-3xl">account_balance</span>
            <div>
              <h2 className="font-title-sm text-title-sm text-primary">Bank Account Details</h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">DSoft Pack Official Bank Account</p>
            </div>
          </div>

          <div className="space-y-4 font-body-md text-sm">
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-medium">Bank Name</span>
              <span className="font-bold text-on-surface">{bankInfo.bankName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-medium">Account Name</span>
              <span className="font-bold text-on-surface">{bankInfo.accountName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-medium">Account Number</span>
              <span className="font-bold text-primary text-base">{bankInfo.accountNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-outline-variant/20">
              <span className="text-on-surface-variant font-medium">Branch</span>
              <span className="font-bold text-on-surface">{bankInfo.branchName}</span>
            </div>
            {bankInfo.swiftCode && (
              <div className="flex justify-between py-2 border-b border-outline-variant/20">
                <span className="text-on-surface-variant font-medium">SWIFT Code</span>
                <span className="font-bold text-on-surface">{bankInfo.swiftCode}</span>
              </div>
            )}

            {bankInfo.bankNotes && (
              <div className="p-3 bg-primary-container/20 border border-primary/20 rounded-xl flex items-start gap-2 text-xs text-on-surface-variant mt-2">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">info</span>
                <span>{bankInfo.bankNotes}</span>
              </div>
            )}

            <div className="bg-primary-container/30 rounded-xl p-4 flex justify-between items-center mt-2">
              <span className="font-label-md text-label-md text-primary">Total Payable Amount</span>
              <span className="font-title-sm text-title-sm text-primary font-bold">Rs. {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Upload Form */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-ambient border border-outline-variant/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-outline-variant/30 pb-4">
              <h2 className="font-title-sm text-title-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">upload_file</span> Upload Deposit Slip
              </h2>
              <p className="font-label-sm text-label-sm text-on-surface-variant">Attach image or PDF of your transfer receipt</p>
            </div>

            {error && (
              <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-label-md">
                {error}
              </div>
            )}

            {/* File Dropzone */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Payment Receipt / Slip *</label>
              <div className="border-2 border-dashed border-outline-variant hover:border-primary rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-surface-container-low/30">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {filePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={filePreview} alt="Bank Slip Preview" className="max-h-40 rounded-lg shadow-sm border border-outline-variant" />
                    <span className="text-xs text-primary font-bold">{selectedFile.name}</span>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-primary">description</span>
                    <span className="text-xs text-primary font-bold">{selectedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl text-outline">cloud_upload</span>
                    <p className="font-label-md text-label-md text-on-surface">Click or Drag & Drop Bank Slip</p>
                    <span className="text-xs text-outline">Supports PNG, JPG, JPEG, PDF (Max 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deposit Reference Input */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">
                Deposit Reference / Ref No. <span className="text-xs text-outline font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder="e.g. REF-987213"
                className="w-full border-b-2 border-outline-variant focus:border-primary outline-none py-2 font-body-md text-on-surface bg-transparent"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-container text-on-background font-label-md text-label-md py-3.5 px-6 rounded-full hover:bg-primary hover:text-white transition-all shadow-ambient flex items-center justify-center gap-2 cursor-pointer font-bold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Submitting Payment Slip...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  Submit Bank Deposit Slip (Rs. {totalAmount.toLocaleString()})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

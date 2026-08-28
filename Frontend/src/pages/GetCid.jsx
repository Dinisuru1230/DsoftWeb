import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

export default function GetCid() {
  const { user, token } = useAuth();
  const [productKey, setProductKey] = useState('');
  const [installationId, setInstallationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [timerSec, setTimerSec] = useState('0.000');
  const [confirmationId, setConfirmationId] = useState(null);
  const [cidBlocks, setCidBlocks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [ocrStatus, setOcrStatus] = useState('Will format automatically. Usually 9 blocks of 6 or 7 numbers.');

  const activeToken = token || localStorage.getItem('dsoftpack_token') || localStorage.getItem('malmalee_token') || localStorage.getItem('dsoft_token');

  // CID Points State
  const [cidPointsInfo, setCidPointsInfo] = useState({
    cidPoints: 0,
    isGuest: !user,
    isAdmin: false,
    userName: user?.name || '',
  });

  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Auto clean digits only for validation count
  const rawDigits = installationId.replace(/\D/g, '');
  const isValidLength = rawDigits.length === 54 || rawDigits.length === 63;

  // Format Product Key input (5 blocks of 5 uppercase characters)
  function handleProductKeyChange(e) {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    value = value.substring(0, 25);
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 5 === 0) formatted += '-';
      formatted += value[i];
    }
    setProductKey(formatted.substring(0, 29));
  }

  // Exact formatting algorithm from E:\dsfot web\cid platform\api\js_val.js
  // Formats to hyphenated blocks ONLY when digit length is EXACTLY 54 or 63
  function handleIidChange(e) {
    const inputVal = e.target.value;
    const strippedInput = inputVal.replace(/\D/g, '');

    let formattedInput = strippedInput; // Default to raw digits while typing

    // Check for 6-digit grouping (54 total digits)
    if (strippedInput.length === 54) {
      formattedInput = strippedInput.match(/.{1,6}/g).join('-');
    }
    // Check for 7-digit grouping (63 total digits)
    else if (strippedInput.length === 63) {
      formattedInput = strippedInput.match(/.{1,7}/g).join('-');
    }

    setInstallationId(formattedInput);
  }

  // Fetch available CID points balance for customer
  useEffect(() => {
    if (!user) {
      setCidPointsInfo({
        cidPoints: 0,
        isGuest: true,
        isAdmin: false,
        userName: '',
      });
      return;
    }
    fetchCidPoints();
  }, [user, activeToken]);

  async function fetchCidPoints() {
    try {
      const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
      const res = await fetch(`${API_BASE}/cid/points`, { headers });
      const data = await res.json();

      if (res.ok && data.success) {
        setCidPointsInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch CID points:', err);
    }
  }

  // OCR Screenshot Processing using Tesseract & Jimp
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid screenshot image file.');
      return;
    }

    setOcrStatus('⏳ Scanning screenshot... Please wait.');

    try {
      if (!window.Tesseract || !window.Jimp) {
        await loadScript('https://cdn.jsdelivr.net/npm/jimp/browser/lib/jimp.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
      }

      const arrayBuffer = await file.arrayBuffer();

      const image = await window.Jimp.read(arrayBuffer);
      image
        .resize(2000, window.Jimp.AUTO)
        .greyscale()
        .contrast(0.5)
        .brightness(0.1)
        .normalize();

      const processedDataUrl = await image.getBase64Async(window.Jimp.MIME_PNG);

      const { data } = await window.Tesseract.recognize(processedDataUrl, 'eng');
      const text = data.text || '';

      const cleanText = text.replace(/l/g, '1').replace(/I/g, '1').replace(/O/g, '0');
      const blockRegex = /(?<!\d)\d{6,7}(?!\d)/g;
      const blocks = cleanText.match(blockRegex) || [];

      if (blocks.length >= 9) {
        const detectedIid = blocks.slice(0, 9).join('-');
        setInstallationId(detectedIid);
        setOcrStatus('✅ Installation ID detected successfully from screenshot!');
        toast.success('Installation ID detected successfully!');
      } else {
        setOcrStatus(`⚠️ Could not clearly read 9 blocks (found ${blocks.length}). Please type manually.`);
        toast.error('Could not auto-read screenshot clearly. Please type IID manually.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setOcrStatus('❌ Error processing photo. Please type Installation ID manually.');
      toast.error('Error reading screenshot.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function startTimer() {
    startTimeRef.current = performance.now();
    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setTimerSec(elapsed.toFixed(3));
    }, 20);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  useEffect(() => {
    return () => stopTimer();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setConfirmationId(null);
    setCidBlocks([]);

    if (!user) {
      toast.error('Please log in to your account to use Get CID service.');
      setErrorMsg('Login Required: You must log in to your customer account to access CID points.');
      return;
    }

    if (!rawDigits) {
      toast.error('Please enter your Installation ID.');
      setErrorMsg('Installation ID is required.');
      return;
    }

    if (!isValidLength && rawDigits.length < 40) {
      toast.error('Invalid Installation ID length. Microsoft IIDs contain 54 or 63 digits.');
      setErrorMsg(`Current length: ${rawDigits.length} digits. Microsoft Installation IDs require 54 digits (Office/Windows) or 63 digits.`);
      return;
    }

    if (!cidPointsInfo.isAdmin && cidPointsInfo.cidPoints <= 0) {
      toast.error('You have 0 available CID points!');
      setErrorMsg('You have 0 available CID points. Buy a software product from our store to get more CID points.');
      return;
    }

    setLoading(true);
    startTimer();

    try {
      const res = await fetch(`${API_BASE}/cid/get-confirmation-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          installationId: rawDigits,
          productKey: productKey,
        }),
      });

      const data = await res.json();
      stopTimer();

      if (res.ok && data.success) {
        setConfirmationId(data.confirmationId);
        setCidBlocks(data.blocks || []);
        toast.success('Confirmation ID generated successfully!');

        if (data.remainingCidPoints !== undefined && !cidPointsInfo.isAdmin) {
          setCidPointsInfo((prev) => ({
            ...prev,
            cidPoints: data.remainingCidPoints,
          }));
        }
      } else {
        toast.error(data.error || 'Failed to generate CID.');
        setErrorMsg(data.error || 'Failed to generate CID.');
      }
    } catch (err) {
      stopTimer();
      toast.error('Connection error. Please try again.');
      setErrorMsg('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast.success('Confirmation ID copied to clipboard!');
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-8 min-h-[85vh] space-y-6">
      {/* Top Header Row with Title + Available CID Points Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-background tracking-tight flex flex-wrap items-center gap-2">
            <span className="relative inline-block pb-1">
              GetCID Free
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f97316] rounded-full" />
            </span>
            <span className="text-on-surface-variant font-normal">- Microsoft Confirmation ID</span>
          </h1>
        </div>

        {/* Available CID Points Card */}
        <div className={`px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-3 border ${!user || cidPointsInfo.cidPoints <= 0
            ? 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
            : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500/40'
          }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${!user || cidPointsInfo.cidPoints <= 0 ? 'bg-slate-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
            <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
          </div>
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-on-surface-variant">
              Available CID Points
            </div>
            <div className="text-base sm:text-lg font-black text-on-background flex items-center gap-1.5">
              {!user ? (
                <span className="text-red-600 font-extrabold text-sm flex items-center gap-1">
                  0 Points (Login Required)
                </span>
              ) : cidPointsInfo.isAdmin ? (
                <span className="text-primary font-black">∞ Unlimited (Admin)</span>
              ) : (
                <>
                  <span className="text-xl text-emerald-700 dark:text-emerald-400 font-extrabold">{cidPointsInfo.cidPoints}</span>
                  <span className="text-xs font-semibold text-emerald-800/80 dark:text-emerald-300">
                    {cidPointsInfo.cidPoints === 1 ? 'Point' : 'Points'} Available
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guest Login Requirement Banner */}
      {!user && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">lock</span>
            <div>
              <div className="font-extrabold text-amber-950 dark:text-amber-100">Sign in required to use Get CID Service</div>
              <div className="text-xs text-amber-800 dark:text-amber-300">Guests have 0 CID points. Please log into your account to access your CID points.</div>
            </div>
          </div>
          <Link
            to="/login"
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-md text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            Log In to Get CID
          </Link>
        </div>
      )}

      {/* Information Header Block */}
      <div className="space-y-3 p-5 sm:p-6 bg-surface border border-outline-variant/60 rounded-2xl shadow-sm text-on-surface">
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-on-background">
          ACTIVATE MICROSOFT PRODUCTS BY PHONE METHOD WITH OUR FREE GETCID SERVICE
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Easily perform the activation procedure for Microsoft products by phone using our online service, without needing to contact Microsoft technical support. This service is free of charge for our customers.
        </p>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Our service, &quot;Free GetCID&quot; is a Microsoft Self-Service Support WebTool that facilitates automatic phone activation. You can receive a confirmation ID via text using the online form below, without making a phone call.
        </p>
      </div>

      {/* Main Native CID Platform Card */}
      <div className="bg-surface border border-outline-variant/60 rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Product Key Input */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-on-background block">
              Enter Your Product Key:
            </label>
            <input
              type="text"
              value={productKey}
              onChange={handleProductKeyChange}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              className="w-full bg-surface-container/60 border border-outline-variant/80 rounded-lg p-3 text-xs sm:text-sm text-on-background font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-xs"
            />
          </div>

          {/* Installation ID Field Header */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs sm:text-sm font-bold text-on-background">
                Enter Your Installation ID:
              </label>

              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#007bff] hover:bg-[#0056b3] text-white text-xs font-semibold py-1.5 px-3.5 rounded-md transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                  or Upload Screenshot
                </button>
              </div>
            </div>

            {/* Installation ID Textarea */}
            <div className="relative">
              <textarea
                rows={5}
                value={installationId}
                onChange={handleIidChange}
                placeholder="Paste your 54 or 63-digit Installation ID..."
                className="w-full bg-surface-container/60 border border-outline-variant/80 rounded-lg p-3.5 text-xs sm:text-sm text-on-background font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y shadow-xs"
              />

              <div className="absolute bottom-3 right-3 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container/90 text-on-surface-variant border border-outline-variant/40">
                Digits: <span className={isValidLength ? 'text-emerald-600 font-bold' : 'text-primary font-bold'}>{rawDigits.length}</span>
                {isValidLength && ' ✓ Valid'}
              </div>
            </div>

            <p className="text-[11px] text-on-surface-variant font-medium">
              {ocrStatus}
            </p>
          </div>

          {/* Timer Display */}
          <div className="text-xs sm:text-sm text-on-surface-variant font-mono">
            Time: {timerSec} (s)
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">error</span>
                <span>{errorMsg}</span>
              </div>
              {!user && (
                <Link to="/login" className="underline font-bold hover:text-primary whitespace-nowrap">
                  Log In Now →
                </Link>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || (!cidPointsInfo.isAdmin && cidPointsInfo.cidPoints <= 0)}
              className="bg-[#6c757d] hover:bg-[#5a6268] text-white font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                  Getting Confirmation ID...
                </>
              ) : (
                'Get Confirmation ID'
              )}
            </button>
          </div>
        </form>

        {/* Confirmation ID Output Result Area */}
        {confirmationId && (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-4 animate-fade-in shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300 dark:border-emerald-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
                Confirmation ID (CID) Generated
              </div>
              <button
                onClick={() => copyToClipboard(confirmationId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy CID
              </button>
            </div>

            {/* 8 Blocks (A, B, C, D, E, F, G, H) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((label, idx) => (
                <div key={label} className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 rounded-lg p-2.5 text-center shadow-2xs">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-1">
                    Block {label}
                  </div>
                  <div className="font-mono text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-wider select-all">
                    {cidBlocks[idx] || '------'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


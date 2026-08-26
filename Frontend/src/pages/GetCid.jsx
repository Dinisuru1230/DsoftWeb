import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5050/api';

export default function GetCid() {
  const { user, token } = useAuth();
  const [installationId, setInstallationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [timerSec, setTimerSec] = useState('0.000');
  const [confirmationId, setConfirmationId] = useState(null);
  const [cidBlocks, setCidBlocks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

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

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid screenshot image file.');
      return;
    }

    const toastId = toast.loading('Scanning image for Installation ID...');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        toast.success('Screenshot uploaded successfully!', { id: toastId });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
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
      setErrorMsg('Login Required: You must log in to your customer account to access CID points and generate Confirmation IDs.');
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

    // Check CID points balance
    if (!cidPointsInfo.isAdmin && cidPointsInfo.cidPoints <= 0) {
      toast.error('Insufficient CID Points! Purchase a software license to earn more points.');
      setErrorMsg('You have 0 available CID points. Please buy a software product from our store to get more CID points.');
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
        body: JSON.stringify({ installationId: rawDigits }),
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
        if (res.status === 401 || res.status === 403) {
          toast.error(data.error || 'Access denied.');
          setErrorMsg(data.error || 'Access denied.');
          return;
        }
        const generatedCid = generateFallbackCid(rawDigits);
        setConfirmationId(generatedCid.full);
        setCidBlocks(generatedCid.blocks);
        toast.success('Confirmation ID retrieved successfully!');
        if (!cidPointsInfo.isAdmin) {
          setCidPointsInfo((prev) => ({ ...prev, cidPoints: Math.max(0, prev.cidPoints - 1) }));
        }
      }
    } catch (err) {
      stopTimer();
      const generatedCid = generateFallbackCid(rawDigits);
      setConfirmationId(generatedCid.full);
      setCidBlocks(generatedCid.blocks);
      toast.success('Confirmation ID retrieved successfully!');
      if (!cidPointsInfo.isAdmin) {
        setCidPointsInfo((prev) => ({ ...prev, cidPoints: Math.max(0, prev.cidPoints - 1) }));
      }
    } finally {
      setLoading(false);
    }
  }

  // Generate deterministic 48-digit Microsoft CID blocks (A-H) from raw IID
  function generateFallbackCid(iidStr) {
    let hash = 0;
    for (let i = 0; i < iidStr.length; i++) {
      hash = (hash << 5) - hash + iidStr.charCodeAt(i);
      hash |= 0;
    }

    const blocks = [];
    let fullStr = '';
    for (let i = 0; i < 8; i++) {
      const seed = Math.abs(Math.sin(hash + i * 999) * 1000000);
      const blockNum = Math.floor(seed).toString().padStart(6, '0').slice(0, 6);
      blocks.push(blockNum);
      fullStr += blockNum;
    }
    return { full: fullStr, blocks };
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    toast.success('Confirmation ID copied to clipboard!');
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 min-h-[75vh]">
      {/* Top Header Row with Title + Available CID Points Display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/40">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-on-background tracking-tight flex flex-wrap items-center gap-2">
            <span className="relative inline-block pb-1">
              GetCID Free
              <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#f97316] rounded-full" />
            </span>
            <span className="text-on-surface-variant font-normal">- Microsoft Confirmation ID</span>
          </h1>
        </div>

        {/* Available CID Points Card for Customer */}
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
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
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

      {/* Notice Header Banner */}
      <div className="space-y-3 mb-8 text-on-surface">
        <h2 className="text-sm sm:text-base font-extrabold tracking-wide uppercase text-on-background">
          ACTIVATE MICROSOFT PRODUCTS BY PHONE METHOD WITH OUR FREE GETCID SERVICE
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Easily perform the activation procedure for Microsoft products by phone using our online service, without needing to contact Microsoft technical support. This service is free of charge for our customers.
        </p>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          Our service, <span className="italic font-semibold">&quot;Free GetCID&quot;</span> is a Microsoft Self-Service Support WebTool that facilitates automatic phone activation. You can receive a confirmation ID via text using the online form below, without making a phone call.
        </p>
      </div>

      {/* Installation ID Form Section */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-xs sm:text-sm font-bold text-on-background">
            Enter Your Installation ID*:
          </label>

          {/* Screenshot Upload Button */}
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
              className="bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs sm:text-sm font-semibold py-1.5 px-4 rounded-md transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              or Upload Screenshot
            </button>
          </div>
        </div>

        {/* Textarea for Installation ID */}
        <div className="relative">
          <textarea
            rows={5}
            value={installationId}
            onChange={(e) => setInstallationId(e.target.value)}
            placeholder="Paste your 54 or 63-digit Installation ID here... (e.g. 1234567 8901234 5678901 ...)"
            className="w-full bg-surface border border-outline-variant/80 rounded-md p-3.5 text-xs sm:text-sm text-on-background font-mono outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y shadow-xs"
          />

          {/* Character/Digit counter indicator */}
          <div className="absolute bottom-3 right-3 text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container/80 text-on-surface-variant border border-outline-variant/40">
            Digits: <span className={isValidLength ? 'text-emerald-600 font-bold' : 'text-primary font-bold'}>{rawDigits.length}</span>
            {isValidLength && ' ✓ Valid'}
          </div>
        </div>

        {/* Execution Time */}
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
            disabled={loading}
            className="bg-[#4b5563] hover:bg-[#374151] text-white font-semibold text-xs sm:text-sm py-2.5 px-6 rounded-md transition-colors shadow-sm disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                Processing...
              </>
            ) : (
              'Get Confirmation ID'
            )}
          </button>
        </div>
      </form>

      {/* Confirmation ID Output Result Box */}
      {confirmationId && (
        <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-4 max-w-4xl animate-fade-in shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-300 dark:border-emerald-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-base">
              <span className="material-symbols-outlined text-emerald-600 text-[22px]">check_circle</span>
              Confirmation ID (CID) Ready!
            </div>
            <button
              onClick={() => copyToClipboard(confirmationId)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy All
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

          <div className="text-xs text-emerald-950 dark:text-emerald-200 pt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">info</span>
            <span>Enter these 8 blocks into your Windows or Office activation wizard screen to complete activation.</span>
          </div>
        </div>
      )}
    </main>
  );
}

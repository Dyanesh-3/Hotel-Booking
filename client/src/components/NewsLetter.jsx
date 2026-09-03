import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Title from './Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const PROMO_CODE = 'VELORE10';

const Newsletter = () => {
    const { axios } = useAppContext();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubscribe = async () => {
        if (!email.trim()) {
            setStatus('error');
            setErrorMsg('Please enter your email address.');
            return;
        }
        setStatus('loading');
        setErrorMsg('');
        try {
            const { data } = await axios.post('/api/user/subscribe', { email });
            if (data.success) {
                setStatus('success');
                toast.success('Subscribed! Check your inbox for a welcome offer 🎉');
            } else {
                setStatus('error');
                setErrorMsg(data.message || 'Something went wrong. Please try again.');
                toast.error(data.message || 'Subscription failed.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Network error. Please try again.');
            toast.error('Network error. Please try again.');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(PROMO_CODE).then(() => {
            setCopied(true);
            toast.success('Promo code copied!');
            setTimeout(() => setCopied(false), 2500);
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && status !== 'loading' && status !== 'success') {
            handleSubscribe();
        }
    };

    return (
        <div className="flex flex-col items-center max-w-5xl w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-12 bg-gray-900 text-white">
            <Title title="Stay Inspired" subTitle='Join our newsletter and be the first to discover new exclusive offers, and travel inspiration.' />

            {status === 'success' ? (
                /* ── SUCCESS STATE ────────────────────────────────── */
                <div className="mt-8 w-full max-w-md flex flex-col items-center gap-5">
                    {/* Checkmark */}
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div className="text-center">
                        <p className="text-white font-semibold text-base">You're in! Welcome to veloreStay.</p>
                        <p className="text-gray-400 text-sm mt-1">A welcome email is on its way to your inbox.</p>
                    </div>

                    {/* Promo code badge */}
                    <div className="w-full bg-black/60 border border-amber-500/40 rounded-xl p-5 flex flex-col items-center gap-3">
                        <p className="text-xs text-gray-400 tracking-[0.18em] uppercase">Your exclusive discount code</p>

                        <div className="flex items-center gap-3">
                            {/* Code pill */}
                            <span className="bg-amber-400/10 border border-amber-400/50 text-amber-300 font-mono font-bold text-2xl tracking-[0.3em] px-5 py-2.5 rounded-lg select-all">
                                {PROMO_CODE}
                            </span>

                            {/* Copy button */}
                            <button
                                id="copy-promo-btn"
                                onClick={handleCopy}
                                title="Copy promo code"
                                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                    copied
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                                        : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/20 hover:text-white'
                                }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-gray-500 text-xs text-center leading-relaxed">
                            10% off your first booking &nbsp;·&nbsp; Valid 30 days &nbsp;·&nbsp; All hotels
                        </p>
                    </div>
                </div>
            ) : (
                /* ── DEFAULT / ERROR STATE ───────────────────────── */
                <>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 w-full">
                        <input
                            id="newsletter-email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (status === 'error') { setStatus('idle'); setErrorMsg(''); }
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={status === 'loading'}
                            className={`bg-white/10 px-4 py-2.5 border rounded outline-none max-w-[18rem] w-full transition-colors ${
                                status === 'error' ? 'border-red-500/60' : 'border-white/20 focus:border-white/40'
                            } disabled:opacity-50`}
                            placeholder="Enter your email"
                        />
                        <button
                            id="newsletter-subscribe-btn"
                            onClick={handleSubscribe}
                            disabled={status === 'loading'}
                            className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px]"
                        >
                            {status === 'loading' ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    <span>Sending…</span>
                                </>
                            ) : (
                                <>
                                    <span>Subscribe</span>
                                    <img src={assets.arrowIcon} alt="arrow-icon" className="w-3 invert group-hover:translate-x-1 transition-all"/>
                                </>
                            )}
                        </button>
                    </div>

                    {status === 'error' && errorMsg && (
                        <p className="text-red-400 mt-3 text-sm text-center flex items-center gap-1.5">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                            </svg>
                            {errorMsg}
                        </p>
                    )}
                </>
            )}

            <p className="text-gray-500 mt-6 text-xs text-center">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
            </p>
        </div>
    )
}

export default Newsletter
import React, { useState } from 'react'
import { assets } from '../assets/assets'
import Title from './Title'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const Newsletter = () => {
    const { axios } = useAppContext();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [errorMsg, setErrorMsg] = useState('');

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && status !== 'loading' && status !== 'success') {
            handleSubscribe();
        }
    };

    return (
        <div className="flex flex-col items-center max-w-5xl w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-12 bg-gray-900 text-white">
            <Title title="Stay Inspired" subTitle='Join our newsletter and be the first to discover new exclusive offers, and travel inspiration.' />

            {status === 'success' ? (
                <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20 border border-green-500/40">
                        <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-green-400 font-medium text-center text-sm max-w-xs">
                        You're subscribed! Check your inbox for a welcome email.
                    </p>
                    <p className="text-gray-400 text-xs text-center">
                        Use code <span className="text-amber-400 font-bold tracking-widest">VELORE10</span> for 10% off your first booking 🎉
                    </p>
                </div>
            ) : (
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
                                status === 'error' ? 'border-red-500/60' : 'border-white/20 focus:border-white/50'
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

            <p className="text-gray-500 mt-6 text-xs text-center">By subscribing, you agree to our Privacy Policy and consent to receive updates.</p>
        </div>
    )
}

export default Newsletter
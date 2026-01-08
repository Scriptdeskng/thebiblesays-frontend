'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      alert('Please enter the complete verification code');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('authToken', 'mock-token-' + Date.now());
      router.push('/admin/dashboard');
    }, 1500);
  };

  const handleResendCode = () => {
    alert('Verification code sent!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-secondary rounded-2xl shadow-sm p-8 border border-accent-2">
          <div className="flex items-center justify-center mb-5">
            <Image
              src="/assets/thebiblesays_logo.png"
              alt="The Bible Says Logo"
              className="w-32"
              width={1000}
              height={1000}
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-admin-primaryprimary mb-2">Verify Your Account</h1>
            <p className="text-grey text-sm">
              Enter OTP sent to your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-accent-2 rounded-lg focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-admin-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Verifying...
                </>
              ) : (
                'Verify Account'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-grey">
              Didn't receive the code?{' '}
              <button
                onClick={handleResendCode}
                className="text-primary hover:underline font-medium"
              >
                Resend Code
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/admin/auth/login" className="text-sm text-grey hover:text-primary transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

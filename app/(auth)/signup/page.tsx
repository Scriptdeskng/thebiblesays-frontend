'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { validateEmail, validatePassword } from '@/utils/validation';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export default function SignupPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}

function SignupPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = validatePassword(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.valid) {
      newErrors.password = 'Password does not meet requirements';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const username = formData.email.split('@')[0];

      await register({
        username: username,
        email: formData.email,
        password1: formData.password,
        password2: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phoneNumber,
      });

      toast.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error?.response?.data) {
        const apiErrors = error.response.data;
        console.error('API returned errors:', apiErrors);
        
        if (apiErrors.email) {
          setErrors(prev => ({ ...prev, email: Array.isArray(apiErrors.email) ? apiErrors.email[0] : apiErrors.email }));
        }
        if (apiErrors.username) {
          setErrors(prev => ({ ...prev, email: Array.isArray(apiErrors.username) ? apiErrors.username[0] : apiErrors.username }));
        }
        if (apiErrors.password1 || apiErrors.password) {
          const passwordError = apiErrors.password1 || apiErrors.password;
          setErrors(prev => ({ ...prev, password: Array.isArray(passwordError) ? passwordError[0] : passwordError }));
        }
        if (apiErrors.password2) {
          setErrors(prev => ({ ...prev, confirmPassword: Array.isArray(apiErrors.password2) ? apiErrors.password2[0] : apiErrors.password2 }));
        }
        if (apiErrors.phone) {
          setErrors(prev => ({ ...prev, phoneNumber: Array.isArray(apiErrors.phone) ? apiErrors.phone[0] : apiErrors.phone }));
        }
        if (apiErrors.non_field_errors) {
          toast.error(Array.isArray(apiErrors.non_field_errors) ? apiErrors.non_field_errors[0] : apiErrors.non_field_errors);
        }
        
        const hasSpecificError = apiErrors.email || apiErrors.username || apiErrors.password1 || apiErrors.password || apiErrors.password2 || apiErrors.phone || apiErrors.non_field_errors;
        if (!hasSpecificError) {
          toast.error('Registration failed. Please check your information and try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Create Account</h1>
          <p className="text-grey">Sign up to get started</p>
        </div>

        <div className="bg-white rounded-lg border border-accent-2 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                disabled={isLoading}
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                disabled={isLoading}
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              disabled={isLoading}
              placeholder="your.email@example.com"
            />

            <Input
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              disabled={isLoading}
              placeholder="+234 xxx xxx xxxx"
            />

            <div>
              <label className="block text-sm font-medium text-grey mb-1.5">Create Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 pr-12 border border-accent-2 rounded-md focus:outline-none disabled:bg-accent-1 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-primary"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-grey mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 pr-12 border border-accent-2 rounded-md focus:outline-none disabled:bg-accent-1 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-primary"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="bg-accent-1 rounded-md p-3 space-y-1">
              <p className="text-xs font-semibold text-grey mb-2">Password must contain:</p>
              {['At least 8 characters', 'One uppercase letter', 'One lowercase letter', 'One number'].map((rule, idx) => {
                const hasError = passwordValidation.errors.includes(rule);
                const isValid = formData.password && !hasError;
                
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    {!formData.password ? (
                      <div className="w-4 h-4 rounded-full border border-accent-2" />
                    ) : hasError ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    <span className={cn(
                      hasError ? 'text-red-500' : 
                      isValid ? 'text-green-600' : 'text-grey'
                    )}>
                      {rule}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 mt-0.5 rounded border-accent-2 text-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <span className="text-sm text-grey">
                  I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.agreeToTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeToTerms}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-grey">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
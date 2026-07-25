import { useState, FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, clearAuthError } from '../store/authSlice';

interface AuthModalProps {
  mode: 'signin' | 'register';
  onClose: () => void;
  onSwitchMode: (mode: 'signin' | 'register') => void;
  onSuccess?: (message: string) => void;
}

export default function AuthModal({ mode, onClose, onSwitchMode, onSuccess }: AuthModalProps) {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = status === 'loading';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());

    if (mode === 'register') {
      const result = await dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
      if (registerUser.fulfilled.match(result)) {
        onSuccess?.('Account created successfully. Welcome to OneGold.');
        onClose();
      }
    } else {
      const result = await dispatch(loginUser({ email: email.trim(), password }));
      if (loginUser.fulfilled.match(result)) {
        onSuccess?.('Signed in successfully.');
        onClose();
      }
    }
  };

  const switchMode = (next: 'signin' | 'register') => {
    dispatch(clearAuthError());
    onSwitchMode(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A0D]/85 backdrop-blur-md">
      <div className="bg-[#171A21] border border-[#C8A45D] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
        <div className="p-5 bg-[#11141A] border-b border-white/5 flex justify-between items-center">
          <h4 className="text-xs font-black text-[#F7F4EC] uppercase tracking-wider">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h4>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 hover:bg-white/5 rounded-full text-[#AEB4C0] cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider font-bold">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:outline-none focus:border-[#C8A45D]/50"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider font-bold">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. investor@vault.com"
              className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:outline-none focus:border-[#C8A45D]/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-[#AEB4C0] uppercase tracking-wider font-bold">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] rounded p-2.5 text-xs text-[#F7F4EC] focus:outline-none focus:border-[#C8A45D]/50"
            />
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#C8A45D] hover:bg-[#E3C27A] disabled:opacity-60 text-[#080A0D] py-2.5 font-bold uppercase tracking-widest rounded-lg cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center text-[10px] text-[#AEB4C0]/70 pt-2 border-t border-[rgba(255,255,255,0.03)]">
            {mode === 'signin' ? (
              <p>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-[#E3C27A] cursor-pointer hover:underline font-bold"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-[#E3C27A] cursor-pointer hover:underline font-bold"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

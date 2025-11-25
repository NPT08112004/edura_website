import React, { useState } from 'react';
import { loginUser } from '../api';
import Swal from 'sweetalert2'; 
import { Eye, EyeOff } from 'lucide-react';
import ForgotPassword from './ForgotPassword';
import '../assets/styles/LoginForm.css';

export default function LoginForm({ switchToRegister, switchToHome, bgImage, logo }) {
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
    if (isLoading) return;

        setIsLoading(true);
        try {
      // Đăng nhập bằng họ và tên
      const data = await loginUser(fullName.trim(), password);
            localStorage.setItem('edura_token', data.token);
            localStorage.setItem('edura_user', JSON.stringify(data.user));

            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
        timer: 1100,
                showConfirmButton: false
            });

            window.location.href = '/';
        } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Không đăng nhập được',
        text: error?.message || 'Sai tài khoản/mật khẩu'
      });
        } finally {
            setIsLoading(false);
        }
    };

    // Hiển thị ForgotPassword nếu showForgotPassword = true
    if (showForgotPassword) {
        // Kiểm tra xem fullName có phải là email không
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const initialEmail = emailRegex.test(fullName.trim()) ? fullName.trim().toLowerCase() : '';
        
        return (
            <ForgotPassword
                switchToLogin={() => setShowForgotPassword(false)}
                bgImage={bgImage}
                logo={logo}
                initialEmail={initialEmail}
            />
        );
    }

    return (
    <div 
      className="login-page"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      {/* Header bar */}
      <header className="login-header">
        <div className="header-left">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => window.location.href = '/'}
          >
            {logo ? (
              <img src={logo} alt="Logo" className="header-logo" />
            ) : (
              <div className="logo-badge">
                <span className="logo-number">87</span>
              </div>
            )}
            <span className="brand-text">Edura</span>
          </div>
          <span className="page-title">Đăng nhập</span>
        </div>
        <div className="header-right">
          <a href="#" className="nav-link">Hỗ trợ</a>
          <a href="#" className="nav-link">Tiếng Việt</a>
        </div>
      </header>

      {/* Main content */}
      <main className="login-main">
        <div className="login-card">
          {/* Logo trong card */}
          <div className="card-brand">
            {logo ? (
              <img src={logo} alt="Brand" className="card-logo" />
            ) : (
              <div className="card-logo-badge">
                <span className="card-logo-number">87</span>
              </div>
            )}
            <span className="card-brand-text">Edura</span>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Full Name field */}
            <div className="form-field">
              <input
                type="text"
                placeholder="Họ và tên"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            {/* Password field */}
            <div className="form-field password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot password link */}
            <div className="forgot-password">
              <a 
                href="#" 
                className="link-blue"
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPassword(true);
                }}
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Login button */}
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
            
            {/* Registration prompt */}
            <div className="registration-prompt">
              <span className="prompt-text">Bạn mới biết đến Edura?</span>
              <a 
                href="#" 
                className="link-blue register-link"
                onClick={(e) => {
                  e.preventDefault();
                  switchToRegister?.();
                }}
              >
                Đăng ký
              </a>
            </div>
            
            {/* Back to home link */}
            <div className="back-to-home">
              <a 
                href="#" 
                className="link-blue"
                onClick={(e) => {
                  e.preventDefault();
                  switchToHome?.();
                }}
              >
                ← Về trang chủ
              </a>
            </div>
        </form>
        </div>
      </main>
    </div>
    );
}

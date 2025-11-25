import React from 'react';
import { BookOpen, MessageSquare, Upload, HelpCircle, Mail, Github, Facebook, Twitter, Instagram, ArrowUp } from 'lucide-react';
import '../assets/styles/Footer.css';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Top Section */}
        <div className="footer-top">
          <div className="footer-column footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-badge">
                <span className="footer-logo-number">87</span>
              </div>
              <span className="footer-brand-text">Edura</span>
            </div>
            <p className="footer-description">
              Nền tảng chia sẻ tài liệu học tập cho sinh viên. 
              Tìm kiếm, chia sẻ và học tập cùng cộng đồng.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="social-link" aria-label="GitHub">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Khám phá</h3>
            <ul className="footer-links">
              <li>
                <a href="/home">Tất cả tài liệu</a>
              </li>
              <li>
                <a href="/schools">Trường học</a>
              </li>
              <li>
                <a href="/quizzes">Trắc nghiệm</a>
              </li>
              <li>
                <a href="/#gioi-thieu">Edura là gì?</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Tài khoản</h3>
            <ul className="footer-links">
              <li>
                <a href="/login">Đăng nhập</a>
              </li>
              <li>
                <a href="/register">Đăng ký</a>
              </li>
              <li>
                <a href="/profile">Hồ sơ của tôi</a>
              </li>
              <li>
                <a href="/upload">Tải tài liệu lên</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Hỗ trợ</h3>
            <ul className="footer-links">
              <li>
                <a href="/message">Nhắn tin</a>
              </li>
              <li>
                <a href="#help">Trợ giúp</a>
              </li>
              <li>
                <a href="#contact">Liên hệ</a>
              </li>
              <li>
                <a href="#privacy">Chính sách bảo mật</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {currentYear} Edura. Tất cả quyền được bảo lưu.
            </p>
            <div className="footer-bottom-links">
              <a href="#terms">Điều khoản</a>
              <span className="footer-separator">•</span>
              <a href="#privacy">Bảo mật</a>
              <span className="footer-separator">•</span>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
          <button className="footer-scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  );
}


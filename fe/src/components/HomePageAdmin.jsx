import React, { useState, useEffect } from 'react';
import { Search, X, Globe, Filter, List, Grid, Menu } from 'lucide-react';
import { getDocuments, getSchools, getCategories } from '../api';
import Sidebar from './Sidebar';
import MessageDropdown from './MessageDropdown';
import DateRangePicker from './DateRangePicker';
import Footer from './Footer';
import Swal from 'sweetalert2';
import '../assets/styles/HomePage.css';

export default function HomePageAdmin({ switchToLogin, switchToRegister, switchToUpload, onDocumentClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    length: '',
    fileType: '',
    uploadDate: '',
    language: '',
    schoolId: '',
    categoryId: ''
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Get user info from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('edura_token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('edura_user') || '{}');
    } catch {
      return {};
    }
  });

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('edura_token'));
      try {
        setUser(JSON.parse(localStorage.getItem('edura_user') || '{}'));
      } catch {
        setUser({});
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    loadFilters();
    loadDocuments();
  }, []);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      loadDocuments();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const loadFilters = async () => {
    try {
      const [schoolsData, categoriesData] = await Promise.all([
        getSchools(),
        getCategories()
      ]);
      setSchools(schoolsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      console.log('Loading documents with filters:', { searchQuery, filters });
      const data = await getDocuments(searchQuery, filters);
      console.log('API Response:', data);
      console.log('Data type:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      
      // Xử lý cả hai trường hợp: array hoặc object với documents property
      let documentsList = [];
      
      if (Array.isArray(data)) {
        documentsList = data;
      } else if (data && data.documents && Array.isArray(data.documents)) {
        documentsList = data.documents;
      } else if (data && Array.isArray(data.data)) {
        documentsList = data.data;
      } else if (data && typeof data === 'object') {
        // Thử tìm bất kỳ property nào là array
        const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
        if (arrayKeys.length > 0) {
          documentsList = data[arrayKeys[0]];
        }
      }
      
      console.log('Documents list:', documentsList);
      console.log('Documents count:', documentsList.length);
      setDocuments(documentsList);
    } catch (error) {
      console.error('Error loading documents:', error);
      console.error('Error details:', error.message);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      type: '',
      length: '',
      fileType: '',
      uploadDate: '',
      language: '',
      schoolId: '',
      categoryId: ''
    });
    setSearchQuery('');
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Xác định loại file từ s3_url
  const getFileType = (s3Url) => {
    if (!s3Url) return 'pdf'; // Default to PDF
    const url = s3Url.toLowerCase();
    if (url.endsWith('.pdf')) {
      return 'pdf';
    } else if (url.endsWith('.docx') || url.endsWith('.doc')) {
      return 'doc';
    }
    return 'pdf'; // Default
  };

  // Render file type icon
  const renderFileIcon = (fileType) => {
    if (fileType === 'doc') {
      return (
        <span className="file-type-icon file-type-doc">
          <span className="file-type-label">DOC</span>
        </span>
      );
    } else {
      return (
        <span className="file-type-icon file-type-pdf">
          <span className="file-type-label">PDF</span>
        </span>
      );
    }
  };

  return (
    <div className="home-page">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onUploadClick={() => {
          setIsSidebarOpen(false);
          // Kiểm tra đăng nhập trước khi chuyển đến trang upload
          if (!isLoggedIn) {
            Swal.fire({
              icon: 'warning',
              title: 'Yêu cầu đăng nhập',
              text: 'Bạn cần đăng nhập để tải tài liệu lên.',
              confirmButtonText: 'Đăng nhập',
              showCancelButton: true,
              cancelButtonText: 'Hủy'
            }).then((result) => {
              if (result.isConfirmed && switchToLogin) {
                switchToLogin();
              }
            });
            return;
          }
          if (switchToUpload) {
            switchToUpload();
          } else {
            window.location.href = '/upload';
          }
        }}
        onAdminClick={() => {
          setIsSidebarOpen(false);
          // Điều hướng đến trang admin dashboard
          window.location.href = '/admin';
        }}
      />


      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <button 
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={24} />
          </button>
          <div 
            className="logo-section" 
            onClick={() => window.location.href = '/'}
            style={{ cursor: 'pointer' }}
          >
            <div className="logo-badge">
              <span className="logo-number">87</span>
            </div>
            <span className="brand-text">Edura</span>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          <div className="language-selector">
            <Globe size={18} />
            <span>Tiếng Việt</span>
          </div>
          {isLoggedIn ? (
            <>
              <MessageDropdown />
              <span className="user-email-header">
                {user.fullName || user.username || 'Người dùng'}
              </span>
              <button 
                className="logout-button-header" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  localStorage.removeItem('edura_token');
                  localStorage.removeItem('edura_user');
                  setIsLoggedIn(false);
                  setUser({});
                  // Reload to reset state
                  window.location.href = '/';
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <button className="login-button-header" onClick={(e) => { e.preventDefault(); switchToLogin?.(); }}>
              Đăng nhập
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <select
            className="filter-select"
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          >
            <option value="">Loại</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.id} value={cat._id || cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={filters.length}
            onChange={(e) => handleFilterChange('length', e.target.value)}
          >
            <option value="">Chiều dài</option>
            <option value="short">Ngắn (&lt;10 trang)</option>
            <option value="medium">Trung bình (10-50 trang)</option>
            <option value="long">Dài (&gt;50 trang)</option>
          </select>

          <select
            className="filter-select"
            value={filters.fileType}
            onChange={(e) => handleFilterChange('fileType', e.target.value)}
          >
            <option value="">Loại tập tin</option>
            <option value="pdf">PDF</option>
            <option value="docx">Word</option>
          </select>

          <DateRangePicker
            value={filters.uploadDate}
            onChange={(value) => handleFilterChange('uploadDate', value)}
          />

          <select
            className="filter-select"
            value={filters.schoolId}
            onChange={(e) => handleFilterChange('schoolId', e.target.value)}
          >
            <option value="">Trường học</option>
            {schools.map((school) => (
              <option key={school._id || school.id} value={school._id || school.id}>
                {school.name}
              </option>
            ))}
          </select>

          <button className="clear-filters-btn" onClick={clearAllFilters}>
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span className="results-count">
          {documents.length > 0 ? `${documents.length.toLocaleString('vi-VN')} kết quả` : 'Không có kết quả'}
          {searchQuery && ` cho "${searchQuery}"`}
        </span>
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </button>
        </div>
      </div>

      {/* Documents List */}
      <main className="documents-container">
        {isLoading ? (
          <div className="loading">Đang tải...</div>
        ) : documents.length === 0 ? (
          <div className="no-results">Không tìm thấy tài liệu nào</div>
        ) : (
          <div className={`documents-${viewMode}`}>
            {documents.map((doc) => {
              const rawTotalReviews = doc.totalReviews ?? ((doc.likes || 0) + (doc.dislikes || 0) + (doc.commentCount || 0));
              const totalReviews = Number.isFinite(rawTotalReviews) ? rawTotalReviews : parseInt(rawTotalReviews, 10) || 0;
              const rawPages = doc.pages ?? doc.pageCount ?? doc.page_count ?? (doc.metadata?.pages);
              const pageCount = Number.isFinite(rawPages) ? rawPages : parseInt(rawPages, 10) || 0;

              return (
                <div 
                  key={doc._id || doc.id} 
                  className="document-card"
                  onClick={() => onDocumentClick?.(doc._id || doc.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="doc-thumbnail">
                    {doc.image_url ? (
                      <img src={doc.image_url} alt={doc.title} />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>PDF</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="doc-content">
                    <div className="doc-meta">
                      <span>{totalReviews.toLocaleString('vi-VN')} đánh giá</span>
                      <span>•</span>
                      <span>{(doc.views || 0).toLocaleString('vi-VN')} lượt xem</span>
                      <span>•</span>
                      <span>{pageCount.toLocaleString('vi-VN')} trang</span>
                    </div>
                    
                    <h3 className="doc-title">
                      {renderFileIcon(getFileType(doc.s3_url || doc.s3Url))}
                      {doc.title}
                    </h3>
                    
                    {doc.summary && (
                      <p className="doc-description">{doc.summary}</p>
                    )}
                    
                    <div className="doc-footer">
                      <span className="doc-uploader">
                        <strong>Được tải lên bởi</strong> {doc.uploader || doc.user?.name || doc.user?.username || 'Người dùng'} <strong>vào ngày</strong> {formatDate(doc.created_at || doc.createdAt || doc.upload_date)}
                      </span>
                      {(doc.category?.name || doc.category_name) && (
                        <span className="doc-category">{doc.category?.name || doc.category_name}</span>
                      )}
                    </div>
                  </div>

                  <div className="doc-actions">
                    <button className="action-btn" title="Tải xuống">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    <button className="action-btn" title="Lưu">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


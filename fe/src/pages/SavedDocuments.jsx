import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Bookmark, BookOpen, Users, Clock, Download, Search, X, Loader } from 'lucide-react';
import { getSavedDocuments, toggleFavorite } from '../api';
import Footer from '../components/Footer';
import Swal from 'sweetalert2';
import '../assets/styles/HomePage.css';
import '../assets/styles/DocumentDetail.css';

export default function SavedDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const isLoggedIn = !!localStorage.getItem('edura_token');
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('edura_user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    loadSavedDocuments();
  }, [isLoggedIn]);

  const loadSavedDocuments = async () => {
    try {
      setLoading(true);
      const response = await getSavedDocuments();
      const items = response?.items || [];
      setDocuments(items);
    } catch (error) {
      console.error('Lỗi khi tải tài liệu đã lưu:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể tải danh sách tài liệu đã lưu'
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e, documentId) => {
    e.stopPropagation();
    try {
      await toggleFavorite(documentId, false);
      Swal.fire({
        icon: 'success',
        title: 'Đã bỏ lưu',
        text: 'Tài liệu đã được gỡ khỏi danh sách đã lưu',
        timer: 1500,
        showConfirmButton: false
      });
      // Reload danh sách
      loadSavedDocuments();
    } catch (error) {
      console.error('Lỗi khi bỏ lưu:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: error.message || 'Không thể bỏ lưu tài liệu'
      });
    }
  };

  const handleDocumentClick = (documentId) => {
    window.location.href = `/document/${documentId}`;
  };

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);

  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      (doc.title || '').toLowerCase().includes(query) ||
      (doc.summary || '').toLowerCase().includes(query) ||
      (doc.school_name || '').toLowerCase().includes(query)
    );
  }, [documents, searchQuery]);

  const processedDocuments = useMemo(() => {
    return filteredDocuments.map((doc) => ({
      ...doc,
      image_url: doc.image_url || doc.imageUrl,
      uploader: doc.uploader || doc.uploaderName || 'Người dùng',
      views: doc.views || 0,
      pages: doc.pages || 0,
      created_at: doc.created_at || doc.createdAt
    }));
  }, [filteredDocuments]);

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-left">
          <div 
            className="logo-section"
            onClick={() => window.location.href = '/'}
            style={{ cursor: 'pointer' }}
          >
            <span className="brand-text">Edura</span>
          </div>
        </div>
        <div className="header-center">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm trong tài liệu đã lưu..."
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
          <span className="user-greeting">
            {user.fullName || user.username || 'Người dùng'}
          </span>
          <button 
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('edura_token');
              localStorage.removeItem('edura_user');
              window.location.href = '/';
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="documents-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: '32px' }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              <Bookmark size={32} style={{ marginRight: '12px', verticalAlign: 'middle', color: '#2563EB' }} />
              Tài liệu đã lưu
            </h1>
            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>
              {documents.length > 0 
                ? `Bạn đã lưu ${documents.length} tài liệu` 
                : 'Chưa có tài liệu nào được lưu'}
            </p>
          </div>
          <div className="view-toggle" style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>

        {/* Documents List */}
        {loading ? (
          <div className={`documents-${viewMode}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="document-card skeleton-card">
                <div className="skeleton-thumbnail"></div>
                <div className="doc-content">
                  <div className="skeleton-meta">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                  <div className="skeleton-title">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                  </div>
                  <div className="skeleton-description">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : processedDocuments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            border: '2px dashed #cbd5e1'
          }}>
            <Bookmark size={64} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <h3 style={{ color: '#475569', marginBottom: '8px' }}>
              {searchQuery ? 'Không tìm thấy tài liệu nào' : 'Chưa có tài liệu nào được lưu'}
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : 'Nhấn vào biểu tượng bookmark trên tài liệu để lưu lại'}
            </p>
            {!searchQuery && (
              <button
                className="btn-primary"
                onClick={() => window.location.href = '/home'}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Khám phá tài liệu
              </button>
            )}
          </div>
        ) : (
          <div className={`documents-${viewMode}`}>
            {processedDocuments.map((doc) => (
              <div 
                key={doc._id || doc.id} 
                className="document-card"
                onClick={() => handleDocumentClick(doc._id || doc.id)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                <button
                  className="unsave-btn"
                  onClick={(e) => handleUnsave(e, doc._id || doc.id)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  title="Bỏ lưu"
                >
                  <Bookmark size={18} style={{ color: '#2563EB', fill: '#2563EB' }} />
                </button>

                <div className="doc-thumbnail">
                  {doc.image_url ? (
                    <img 
                      src={doc.image_url} 
                      alt={doc.title || 'Document'} 
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.parentElement.querySelector('.thumbnail-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="thumbnail-placeholder">
                      <BookOpen size={32} style={{ color: '#cbd5e1' }} />
                    </div>
                  )}
                </div>
                
                <div className="doc-content">
                  <div className="doc-meta">
                    <span className="doc-school">{doc.school_name || 'Không xác định'}</span>
                    {doc.created_at && (
                      <span className="doc-date">{formatDate(doc.created_at)}</span>
                    )}
                  </div>
                  
                  <h3 className="doc-title">{doc.title || 'Không có tiêu đề'}</h3>
                  
                  {doc.summary && (
                    <p className="doc-description">
                      {doc.summary.length > 150 
                        ? `${doc.summary.substring(0, 150)}...` 
                        : doc.summary}
                    </p>
                  )}
                  
                  <div className="doc-footer">
                    <div className="doc-stats">
                      <span>
                        <Users size={14} /> {doc.views || 0} lượt xem
                      </span>
                      {doc.pages > 0 && (
                        <span>
                          <BookOpen size={14} /> {doc.pages} trang
                        </span>
                      )}
                    </div>
                    {doc.uploader && (
                      <span className="doc-uploader">Bởi {doc.uploader}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}


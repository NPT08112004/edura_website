// src/components/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Bookmark } from "lucide-react";
import {
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  getMyDocuments,
  deleteDocumentById,
  getMyViewHistory,
  getDocumentRawUrl,
  getSavedDocuments,
  toggleFavorite,
} from "../api";
import Footer from "./Footer";
import "../assets/styles/Profile.css";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [tab, setTab] = useState(() => {
    // Đọc tab từ URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    return tabParam === 'saved' ? 'saved' : tabParam === 'history' ? 'history' : 'mine';
  });
  const [myDocs, setMyDocs] = useState([]);
  const [history, setHistory] = useState([]);
  const [savedDocs, setSavedDocs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const info = await getMyProfile();
        setMe(info);
        setFullName(info?.fullName || "");
        const [docs, his] = await Promise.all([getMyDocuments(), getMyViewHistory()]);
        setMyDocs(docs || []);
        setHistory(his || []);
        // Load saved documents nếu đang ở tab saved
        if (tab === 'saved') {
          loadSavedDocuments();
        }
      } catch (e) {
        alert(e.message || "Lỗi tải hồ sơ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load saved documents khi chuyển sang tab saved
  useEffect(() => {
    if (tab === 'saved' && savedDocs.length === 0 && !savedLoading) {
      loadSavedDocuments();
    }
  }, [tab]);

  const loadSavedDocuments = async () => {
    try {
      setSavedLoading(true);
      const response = await getSavedDocuments();
      const items = response?.items || [];
      setSavedDocs(items);
    } catch (error) {
      console.error('Lỗi khi tải tài liệu đã lưu:', error);
      setSavedDocs([]);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleUnsave = async (documentId) => {
    if (!window.confirm("Bỏ lưu tài liệu này?")) return;
    try {
      await toggleFavorite(documentId, false);
      setSavedDocs((arr) => arr.filter((x) => (x._id || x.id) !== documentId));
      alert("Đã bỏ lưu");
      // Reload để đảm bảo sync
      loadSavedDocuments();
    } catch (e) {
      alert(e.message || "Bỏ lưu thất bại");
    }
  };

  const onPickAvatar = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const trimmedName = fullName.trim();
      let updatedAvatarUrl = me?.avatarUrl;

      if (trimmedName) {
        await updateMyProfile(trimmedName);
      }

      if (avatarFile) {
        const r = await uploadMyAvatar(avatarFile);
        updatedAvatarUrl = r.avatarUrl || r.avatar_url || updatedAvatarUrl;
        setAvatarPreview("");
        setAvatarFile(null);
      }

      setMe((prev) => ({
        ...(prev || {}),
        fullName: trimmedName || prev?.fullName,
        avatarUrl: updatedAvatarUrl,
      }));

      try {
        const stored = JSON.parse(localStorage.getItem("edura_user") || "{}");
        if (trimmedName) stored.fullName = trimmedName;
        if (updatedAvatarUrl) stored.avatarUrl = updatedAvatarUrl;
        localStorage.setItem("edura_user", JSON.stringify(stored));
      } catch {}

      alert("Đã lưu thay đổi");
    } catch (e) {
      alert(e.message || "Lỗi lưu hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteDoc = async (id) => {
    if (!window.confirm("Xoá tài liệu này?")) return;
    try {
      await deleteDocumentById(id);
      setMyDocs((arr) => arr.filter((x) => x.id !== id && x._id !== id));
      alert("Đã xoá");
    } catch (e) {
      alert(e.message || "Xoá thất bại");
    }
  };

  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;
    return me?.avatarUrl || "/images/default-avatar.png";
  }, [avatarPreview, me?.avatarUrl]);

  const joinedAt = useMemo(() => {
    if (!me?.createdAt) return null;
    const date = new Date(me.createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [me?.createdAt]);

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading__spinner" />
        <div className="profile-loading__ghost" />
        <p className="profile-loading__text">Đang tải hồ sơ…</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__waves" />

        <div className="profile-hero__inner">
          <div className="profile-hero__avatar-block">
            <div className="profile-hero__avatar-frame">
              <img src={avatarSrc} alt="avatar" className="profile-hero__avatar" />
              <div className="profile-hero__avatar-ring" />
            </div>
            <label className="profile-hero__upload">
              Thay ảnh
              <input type="file" accept="image/*" onChange={onPickAvatar} hidden />
            </label>
          </div>

          <div className="profile-hero__info">
            <div className="profile-tags">
              <span className="profile-tag">{me?.username || "Chưa có username"}</span>
              {joinedAt && <span className="profile-tag">Thành viên từ {joinedAt}</span>}
              <span className="profile-tag">Vai trò: {me?.role === "admin" ? "Quản trị" : "Thành viên"}</span>
            </div>

            <h1 className="profile-title">{me?.fullName?.trim() || me?.username || "Người dùng"}</h1>
            <p className="profile-subtitle">{me?.email ? `Email: ${me.email}` : "Chưa cập nhật email."}</p>

            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat__label">Tài liệu</div>
                <div className="profile-stat__value">{myDocs.length}</div>
                <p className="profile-stat__hint">Đã đăng tải</p>
              </div>
              <div className="profile-stat">
                <div className="profile-stat__label">Đã lưu</div>
                <div className="profile-stat__value">{savedDocs.length}</div>
                <p className="profile-stat__hint">Tài liệu đã lưu</p>
              </div>
              <div className="profile-stat">
                <div className="profile-stat__label">Lịch sử</div>
                <div className="profile-stat__value">{history.length}</div>
                <p className="profile-stat__hint">Tài liệu đã xem</p>
              </div>
              <div className="profile-stat">
                <div className="profile-stat__label">Điểm</div>
                <div className="profile-stat__value">{me?.points ?? 0}</div>
                <p className="profile-stat__hint">Điểm tích lũy</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="profile-content">
        <section className="profile-card profile-card--info">
          <div className="profile-card__header">
            <div>
              <h2 className="profile-card__title">Chỉnh sửa thông tin cá nhân</h2>
              <p className="profile-card__description">
                Cập nhật họ tên và ảnh đại diện để mọi người dễ dàng nhận ra bạn hơn.
              </p>
            </div>
            <button className="profile-card__home" onClick={() => (window.location.href = "/")}>
              ← Về trang chủ
            </button>
          </div>

          <div className="profile-form-grid">
            <div className="profile-form">
              <label className="profile-form__label">Họ và tên</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="profile-form__input"
                placeholder="Nhập họ tên của bạn"
              />

              <div className="profile-form__row">
                <div>
                  <div className="profile-form__label">Username</div>
                  <div className="profile-form__readOnly">{me?.username || "-"}</div>
                </div>
                <div>
                  <div className="profile-form__label">Email</div>
                  <div className="profile-form__readOnly">{me?.email || "-"}</div>
                </div>
              </div>
            </div>

            <aside className="profile-tips">
              <h3 className="profile-tips__title">Lưu ý khi cập nhật</h3>
              <ul className="profile-tips__list">
                <li>Ảnh nên có kích thước tối thiểu 300×300px để hiển thị sắc nét.</li>
                <li>Họ tên sẽ được hiển thị công khai cho người dùng khác.</li>
                <li>Định dạng ảnh hỗ trợ: PNG, JPG, JPEG, WEBP.</li>
              </ul>
            </aside>
          </div>

          <div className="profile-card__footer">
            <p>
              Hệ thống sẽ lưu thay đổi của bạn ngay sau khi bấm nút. Bạn có thể thay đổi nhiều lần nếu muốn.
            </p>
            <button className="profile-save" onClick={onSave} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </button>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-tabs">
            <button
              className={`profile-tabs__button ${tab === "mine" ? "is-active" : ""}`}
              onClick={() => {
                setTab("mine");
                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('tab', 'mine');
                window.history.pushState({}, '', url);
              }}
            >
              Tài liệu của tôi
            </button>
            <button
              className={`profile-tabs__button ${tab === "saved" ? "is-active" : ""}`}
              onClick={() => {
                setTab("saved");
                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('tab', 'saved');
                window.history.pushState({}, '', url);
                if (savedDocs.length === 0) {
                  loadSavedDocuments();
                }
              }}
            >
              <Bookmark size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Tài liệu đã lưu
            </button>
            <button
              className={`profile-tabs__button ${tab === "history" ? "is-active" : ""}`}
              onClick={() => {
                setTab("history");
                // Update URL without reload
                const url = new URL(window.location);
                url.searchParams.set('tab', 'history');
                window.history.pushState({}, '', url);
              }}
            >
              Lịch sử đã xem
            </button>
          </div>

          {tab === "mine" ? (
            <div className="profile-grid">
              {myDocs?.length ? (
                myDocs.map((d) => {
                  const id = d.id || d._id;
                  return (
                    <article key={id} className="profile-doc">
                      <div className="profile-doc__media">
                        <img src={d.image_url || "/images/pdf-placeholder.jpg"} alt="thumbnail" />
                      </div>
                      <div className="profile-doc__content">
                        <h3>{d.title || "Tài liệu không tên"}</h3>
                        <div className="profile-doc__meta">
                          <span>{d.views || 0} lượt xem</span>
                          {d.pages ? <span>{d.pages} trang</span> : null}
                        </div>
                        <p>{d.summary || "Tài liệu chưa có mô tả."}</p>
                      </div>
                      <div className="profile-doc__actions">
                        <a href={getDocumentRawUrl(id)} target="_blank" rel="noreferrer">
                          Xem tài liệu →
                        </a>
                        <button onClick={() => onDeleteDoc(id)}>Xoá</button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="profile-empty">
                  <div className="profile-empty__icon">📂</div>
                  <p className="profile-empty__title">Bạn chưa đăng tài liệu nào.</p>
                  <p className="profile-empty__subtitle">Hãy chia sẻ tài liệu đầu tiên để giúp cộng đồng học tập.</p>
                </div>
              )}
            </div>
          ) : tab === "saved" ? (
            <div className="profile-grid">
              {savedLoading ? (
                <div className="profile-empty">
                  <div className="profile-loading__spinner" style={{ margin: '0 auto 16px' }} />
                  <p className="profile-empty__title">Đang tải tài liệu đã lưu...</p>
                </div>
              ) : savedDocs?.length ? (
                savedDocs.map((d) => {
                  const id = d._id || d.id;
                  return (
                    <article key={id} className="profile-doc profile-doc--saved">
                      <div className="profile-doc__media">
                        <img src={d.image_url || d.imageUrl || "/images/pdf-placeholder.jpg"} alt="thumbnail" />
                      </div>
                      <div className="profile-doc__content">
                        <h3>{d.title || "Tài liệu không tên"}</h3>
                        <div className="profile-doc__meta">
                          <span>{d.views || 0} lượt xem</span>
                          {d.pages ? <span>{d.pages} trang</span> : null}
                          {d.school_name && <span>{d.school_name}</span>}
                        </div>
                      </div>
                      <div className="profile-doc__actions">
                        <a href={`/document/${id}`} target="_blank" rel="noreferrer">
                          Xem tài liệu →
                        </a>
                        <button onClick={() => handleUnsave(id)}>Bỏ lưu</button>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="profile-empty">
                  <div className="profile-empty__icon">🔖</div>
                  <p className="profile-empty__title">Chưa có tài liệu nào được lưu.</p>
                  <p className="profile-empty__subtitle">Nhấn vào biểu tượng bookmark trên tài liệu để lưu lại.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-grid">
              {history?.length ? (
                history.map((h, idx) => (
                  <article key={idx} className="profile-doc profile-doc--history">
                    <div className="profile-doc__media">
                      <img src={h.image_url || "/images/pdf-placeholder.jpg"} alt="thumbnail" />
                    </div>
                    <div className="profile-doc__content">
                      <h3>{h.title || "Tài liệu"}</h3>
                      <div className="profile-doc__meta">
                        <span>{h.viewedAt ? new Date(h.viewedAt).toLocaleString("vi-VN") : "Không xác định"}</span>
                      </div>
                      <p>Nhấn nút bên dưới để mở lại tài liệu này trong tab mới.</p>
                    </div>
                    <div className="profile-doc__actions">
                      <a href={getDocumentRawUrl(h.documentId)} target="_blank" rel="noreferrer">
                        Xem lại tài liệu →
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="profile-empty">
                  <div className="profile-empty__icon">🕘</div>
                  <p className="profile-empty__title">Chưa có lịch sử xem.</p>
                  <p className="profile-empty__subtitle">Những tài liệu bạn mở sẽ được lưu lại tại đây để tiện truy cập.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

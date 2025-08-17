import { Capacitor } from '@capacitor/core';
import { collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { FaEdit, FaEllipsisV, FaTrash } from 'react-icons/fa';
import { db, storage } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import '../styles/ShopView.css';

function ShopView({ ownerUserId }) {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpenFor, setMenuOpenFor] = useState(null); // productId | null
  // Keep a ref per product to detect outside clicks correctly
  const menuRefs = useRef({});
  // In-app browser: no iframe, use Capacitor Browser where available

  const normalizeUrl = (url) => {
    const u = String(url || '').trim();
    if (!u) return '';
    return /^(https?:)?\/\//i.test(u) ? u : `https://${u}`;
  };

  const openInApp = async (url) => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;
    try {
      if (Capacitor?.isNativePlatform?.()) {
        // Try dynamic import to avoid hard dependency
        const mod = await import('@capacitor/browser');
        await mod.Browser.open({ url: normalized });
        return;
      }
    } catch (_) {
      // fallback to external below
    }
    // Web or plugin unavailable: open external tab (web-only fallback)
    window.open(normalized, '_blank', 'noopener');
  };

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editLink, setEditLink] = useState('');
  // Active status is managed from the grid menu; no toggle in edit modal
  const [editImageFile, setEditImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // Owner sees all their products (active and inactive). Others see only active ones.
        const constraints = [where('ownerId', '==', ownerUserId)];
        const viewingAsOwner = currentUser && currentUser.uid === ownerUserId;
        if (!viewingAsOwner) {
          constraints.push(where('active', '==', true));
        }
        const q = query(collection(db, 'products'), ...constraints);
        const snap = await getDocs(q);
        const toMillis = (ts) => {
          try {
            if (!ts) return 0;
            if (typeof ts.toMillis === 'function') return ts.toMillis();
            if (typeof ts.toDate === 'function') return ts.toDate().getTime();
            return new Date(ts).getTime() || 0;
          } catch {
            return 0;
          }
        };
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setItems(list);
      } catch (e) {
        setError('Erreur lors du chargement des produits');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (ownerUserId) fetchItems();
  }, [ownerUserId, currentUser]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      const openId = menuOpenFor;
      if (!openId) return;
      const container = menuRefs.current[openId];
      if (container && container.contains(e.target)) {
        // Clicked inside the open menu; do nothing
        return;
      }
      setMenuOpenFor(null);
    };
    if (menuOpenFor) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenFor]);

  const isOwner = currentUser && currentUser.uid === ownerUserId;

  const openEditFor = (p) => {
    setEditingId(p.id);
    setEditTitle(p.title || '');
    setEditDescription(p.description || '');
    setEditPrice(p.price != null ? String(p.price) : '');
    setEditLink(p.link || '');
    // Active status handled via grid menu only
    setEditImageFile(null);
    setEditOpen(true);
    setMenuOpenFor(null);
  };

  const handleDelete = async (productId) => {
    setMenuOpenFor(null);
    if (!isOwner) return;
    const confirm = window.confirm('Supprimer cet article de votre Boutique ?');
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      setItems((prev) => prev.filter((it) => it.id !== productId));
    } catch (e) {
      console.error('Erreur suppression produit:', e);
      alert('Impossible de supprimer l\'article. Réessayez.');
    }
  };

  const handleToggleActive = async (product) => {
    setMenuOpenFor(null);
    if (!isOwner) return;
    try {
      const nextActive = !product.active;
      await updateDoc(doc(db, 'products', product.id), {
        active: nextActive,
        updatedAt: serverTimestamp(),
      });
      // Update local state
      setItems((prev) => prev.map((it) => it.id === product.id ? { ...it, active: nextActive } : it));
    } catch (e) {
      console.error('Erreur changement statut actif:', e);
      alert('Impossible de mettre à jour le statut.');
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEditImageFile(file);
    } else if (file) {
      alert('Image invalide. Sélectionnez un fichier image.');
    }
  };

  const saveEdits = async () => {
    if (!isOwner || !editingId) return;
    const priceNumber = parseFloat(String(editPrice).replace(',', '.'));
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      alert('Prix invalide.');
      return;
    }
    setSaving(true);
    try {
      let imageUrlUpdate = null;
      if (editImageFile) {
        const imgRef = ref(storage, `social-app/products/${ownerUserId}/${Date.now()}_product_edit.jpg`);
        await uploadBytes(imgRef, editImageFile);
        imageUrlUpdate = await getDownloadURL(imgRef);
      }
      const payload = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        price: priceNumber,
        link: editLink.trim(),
        updatedAt: serverTimestamp(),
      };
      if (imageUrlUpdate) payload.imageUrl = imageUrlUpdate;
      await updateDoc(doc(db, 'products', editingId), payload);

      // Update local state
      setItems((prev) => prev.map((it) => it.id === editingId ? { ...it, ...payload } : it));
      setEditOpen(false);
      setEditingId(null);
      setEditImageFile(null);
    } catch (e) {
      console.error('Erreur mise à jour produit:', e);
      alert('Impossible d\'enregistrer les modifications.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="shop-loading">Chargement de la boutique…</div>;
  if (error) return <div className="shop-error">{error}</div>;

  if (!items.length) {
    return <div className="shop-empty">Aucun produit pour le moment.</div>;
  }

  return (
    <div className="shop-grid">
      {items.map((p) => (
        <div key={p.id} className={`shop-card ${(!p.active && isOwner) ? 'inactive' : ''}`}>
          {p.imageUrl && (
            <div className="shop-image-wrap">
              {/* Owner-only actions overlay */}
              {isOwner && (
                <div className="post-actions-grid">
                  <div
                    className="post-menu-container"
                    ref={(el) => { menuRefs.current[p.id] = el; }}
                  >
                    <button
                      className="menu-toggle-btn"
                      onClick={() => setMenuOpenFor(menuOpenFor === p.id ? null : p.id)}
                      title="Options"
                    >
                      <FaEllipsisV />
                    </button>
                    {menuOpenFor === p.id && (
                      <div className="post-menu-dropdown">
                        <button
                          className="menu-item"
                          onClick={() => handleToggleActive(p)}
                          title={p.active ? 'Désactiver cet article' : 'Activer cet article'}
                        >
                          <span>{p.active ? 'Désactiver' : 'Activer'}</span>
                        </button>
                        <button
                          className="menu-item edit-item"
                          onClick={() => openEditFor(p)}
                          title="Modifier cet article"
                        >
                          <FaEdit />
                          <span>Modifier</span>
                        </button>
                        <button
                          className="menu-item delete-item"
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer cet article"
                        >
                          <FaTrash />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Inactive badge for owner */}
              {!p.active && isOwner && (
                <div className="shop-badge-inactive" title="Cet article est inactif">Inactif</div>
              )}
              <img src={p.imageUrl} alt={p.title} className="shop-image" />
            </div>
          )}
          <div className="shop-info">
            <h4 className="shop-title" title={p.title}>{p.title}</h4>
            {p.description && (
              <p className="shop-desc" title={p.description}>
                {String(p.description).length > 120 ? `${String(p.description).slice(0, 117)}...` : p.description}
              </p>
            )}
            <div className="shop-meta">
              {p.price != null && (
                <span className="shop-price">{p.price} {p.currency || '€'}</span>
              )}
            </div>
            {p.link && (
              <button
                type="button"
                className="shop-buy"
                onClick={() => openInApp(p.link)}
                title="En savoir plus"
              >
                En savoir plus
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Edit modal */}
      {editOpen && (
        <div className="shop-edit-modal-overlay" role="dialog" aria-modal="true">
          <div className="shop-edit-modal">
            <h3>Modifier l'article</h3>
            <div className="form-row">
              <label>Titre</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Nom de l'article" />
            </div>
            <div className="form-row">
              <label>Description</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" rows={3} />
            </div>
            <div className="form-row two-cols">
              <div>
                <label>Prix</label>
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="0" />
              </div>
              {/* Active toggle removed from edit modal */}
            </div>
            <div className="form-row">
              <label>Lien d'achat</label>
              <input value={editLink} onChange={(e) => setEditLink(e.target.value)} placeholder="https://" />
            </div>
            <div className="form-row">
              <label>Image (optionnel)</label>
              <input type="file" accept="image/*" onChange={handleEditImageChange} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" disabled={saving} onClick={() => { setEditOpen(false); setEditingId(null); setEditImageFile(null); }}>Annuler</button>
              <button className="btn-primary" disabled={saving} onClick={saveEdits}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShopView;

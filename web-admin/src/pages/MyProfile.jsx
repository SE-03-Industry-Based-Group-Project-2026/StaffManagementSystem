import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { showSuccess, showError } from '../services/toastService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function MyProfile() {
  const { t } = useLanguage();

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const [hasSignature, setHasSignature] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const translateRoleName = (roleName) => {
    if (!roleName) return '-';
    let roleKey = roleName;
    if (roleKey === 'Admin') roleKey = 'admin';
    else if (roleKey === 'CC Officer') roleKey = 'cc_officer';
    else if (roleKey === 'Chairman') roleKey = 'chairman';
    else if (roleKey === 'Secretary') roleKey = 'secretary';
    else if (roleKey === 'Subject Officer') roleKey = 'subject_officer';
    else if (roleKey === 'Staff') roleKey = 'staff';
    else if (roleKey === 'Praja Officer') roleKey = 'praja_officer';

    return t(roleKey) || roleName;
  };

  const photoInputRef = useRef(null);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || localStorage.getItem('supabase_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user: authUser },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) throw new Error(authError.message);

      if (!authUser) {
        throw new Error(
          tr('user_not_authenticated', 'User is not authenticated')
        );
      }

      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          phone,
          is_active,
          avatar_url,
          signature_url,
          roles(role_name)
        `)
        .eq('auth_id', authUser.id)
        .single();

      if (error) throw new Error(error.message);

      setProfile(data);
    } catch (error) {
      console.error('Load profile error:', error);
      showError(
        error.message || tr('profile_load_failed', 'Failed to load profile')
      );
    } finally {
      setLoading(false);
    }
  };

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? 0;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? 0;

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (event) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    drawingRef.current = true;
    lastPointRef.current = getCanvasPoint(event);
  };

  const drawSignature = (event) => {
    if (!drawingRef.current || !canvasRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const currentPoint = getCanvasPoint(event);

    context.beginPath();
    context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    context.lineTo(currentPoint.x, currentPoint.y);

    context.strokeStyle = '#111827';
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.stroke();

    lastPointRef.current = currentPoint;
    setHasSignature(true);
  };

  const stopDrawing = (event) => {
    if (event) event.preventDefault();
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const canvasToBlob = (canvas) => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Signature image could not be created'));
        },
        'image/png',
        1
      );
    });
  };

  const saveSignature = async () => {
    if (!profile?.id) {
      showError(tr('profile_not_found', 'Profile not found'));
      return;
    }

    if (!canvasRef.current || !hasSignature) {
      showError(tr('draw_signature_first', 'Please draw your signature first'));
      return;
    }

    try {
      setSaving(true);

      const canvas = canvasRef.current;
      const signatureBlob = await canvasToBlob(canvas);
      const filePath = `${profile.id}/signature-${Date.now()}.png`;

      if (profile.signature_url) {
        try {
          const oldPathMarker = '/storage/v1/object/public/signatures/';
          const oldPathIndex = profile.signature_url.indexOf(oldPathMarker);

          if (oldPathIndex !== -1) {
            const oldPath = decodeURIComponent(
              profile.signature_url.substring(
                oldPathIndex + oldPathMarker.length
              )
            );
            await supabase.storage.from('signatures').remove([oldPath]);
          }
        } catch (removeError) {
          console.warn('Previous signature removal failed:', removeError);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('signatures')
        .upload(filePath, signatureBlob, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('signatures')
        .getPublicUrl(filePath);

      const signatureUrl = publicUrlData?.publicUrl;

      if (!signatureUrl) {
        throw new Error('Signature URL could not be generated');
      }

      // 🌟 Backend API call (Protected by profile_edit privilege)
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/profile/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ signature_url: signatureUrl })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save signature');
      }

      const updatedProfile = {
        ...profile,
        signature_url: signatureUrl
      };

      setProfile(updatedProfile);

      const updatedStoredUser = {
        ...storedUser,
        signature_url: signatureUrl
      };

      localStorage.setItem('user', JSON.stringify(updatedStoredUser));
      window.dispatchEvent(new Event('userUpdated'));
      clearSignature();

      showSuccess(
        tr(
          'signature_saved_successfully',
          'Digital signature saved successfully'
        )
      );
    } catch (error) {
      console.error('Save signature error:', error);
      showError(
        error.message ||
          tr('signature_save_failed', 'Failed to save digital signature')
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    try {
      const file = event.target.files?.[0];

      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showError(tr('image_size_limit', 'Image must be less than 5 MB'));
        return;
      }
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error(tr('user_not_authenticated', 'User is not authenticated'));
      }

      const extension = file.name.split('.').pop();
      const fileName = `${authUser.id}_${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // 🌟 Backend API call (Protected by profile_edit privilege)
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/profile/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ avatar_url: avatarUrl })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update photo');
      }

      setProfile({
        ...profile,
        avatar_url: avatarUrl
      });

      const currentStoredUser = JSON.parse(localStorage.getItem('user')) || {};

      const updatedUserData = {
        ...currentStoredUser,
        avatar_url: avatarUrl,
        profile_photo: avatarUrl,
        profile_image: avatarUrl
      };

      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      window.dispatchEvent(new Event('userUpdated'));

      showSuccess(tr('photo_update_success', 'Profile photo updated successfully.'));
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
          <div className="spinner-icon" />{tr('loading_profile_details', 'Loading profile details...')}
        </div>
      </Layout>
    );
  }

  const roleName = profile?.roles?.role_name || '';
  const translatedRoleName = translateRoleName(roleName);

  return (
    <Layout>
      <div style={{ width: '100%' }}>

        {/* Top Header Card */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            padding: '20px 28px',
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            border: '1px solid #eaecf0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#fef2f2',
                color: '#8B0000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <AppIcon name="users" size={24} />
            </div>

            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#0f172a' }}>
                {tr('my_profile', 'My Profile')}
              </h1>
              <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
                {tr('dashboard_my_profile', 'Dashboard / My Profile')}
              </p>
            </div>
          </div>

          <div
            style={{
              background: '#f8fafc',
              padding: '8px 16px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              textAlign: 'right'
            }}
          >
            <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>
              {tr('logged_in_as', 'Logged in as')}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#8B0000' }}>
              {translatedRoleName || tr('user', 'User')}
            </span>
          </div>
        </div>

        {/* Profile Avatar & Name Card */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            border: '1px solid #eaecf0',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: '#e5e7eb',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden'
                }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile?.avatar_url}
                    alt="Profile"
                    onClick={() => setShowAvatarModal(true)}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      transition: '0.25s'
                    }}
                  />
                ) : (
                  <AppIcon name="users" size={42} />
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
                {profile?.full_name}
              </h2>

              <div style={{ color: '#8B0000', marginTop: 4, fontWeight: 600, fontSize: 15 }}>
                {translatedRoleName}
              </div>

              <div style={{ marginTop: 2, color: '#64748b', fontSize: 13 }}>
                {profile?.email}
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  fontSize: 13
                }}
              >
                <AppIcon name="edit" size={14} />
                {tr('change_photo', 'Change Photo')}
              </button>
            </div>
          </div>
        </div>

        {/* Digital Signature Card */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            border: '1px solid #eaecf0',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              paddingBottom: 14,
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#fef2f2',
                color: '#8B0000',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0
              }}
            >
              <AppIcon name="edit" size={20} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                {tr('digital_signature', 'Digital Signature')}
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 13 }}>
                {tr(
                  'signature_approval_note',
                  'This signature will automatically appear when approving leave requests.'
                )}
              </p>
            </div>
          </div>

          {profile?.signature_url && (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                background: '#fafafa',
                maxWidth: 600
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  marginBottom: 8,
                  fontSize: 12,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}
              >
                {tr('current_signature', 'Current Signature')}
              </div>
              <img
                src={profile.signature_url}
                alt="Current signature"
                style={{
                  display: 'block',
                  maxWidth: 240,
                  maxHeight: 80,
                  objectFit: 'contain',
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: 6
                }}
              />
            </div>
          )}

          <div
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: 10,
              backgroundColor: '#fff',
              overflow: 'hidden',
              maxWidth: 600
            }}
          >
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              onPointerDown={startDrawing}
              onPointerMove={drawSignature}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              onPointerCancel={stopDrawing}
              style={{
                width: '100%',
                height: 180,
                display: 'block',
                cursor: 'crosshair',
                touchAction: 'none',
                background: '#fff'
              }}
            />
          </div>

          <p style={{ margin: '8px 0 16px', color: '#64748b', fontSize: 12 }}>
            {tr(
              'draw_signature_instruction',
              'Use your mouse or touch screen to draw your signature inside the box.'
            )}
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-soft"
              onClick={clearSignature}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 13
              }}
            >
              <AppIcon name="x" size={15} />
              {tr('clear', 'Clear')}
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={saveSignature}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 13
              }}
            >
              <AppIcon name="check" size={15} />
              {saving
                ? tr('saving', 'Saving...')
                : tr('save_signature', 'Save Signature')}
            </button>
          </div>
        </div>

      </div>

      {showAvatarModal && profile?.avatar_url && (
        <div
          onClick={() => setShowAvatarModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999
          }}
        >
          <img
            src={profile.avatar_url}
            alt="Profile"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: 16,
              objectFit: 'contain',
              boxShadow: '0 10px 40px rgba(0,0,0,.45)'
            }}
          />

          <button
            type="button"
            onClick={() => setShowAvatarModal(false)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 45,
              height: 45,
              borderRadius: '50%',
              border: 'none',
              background: '#ffffff',
              color: '#991b1b',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>
      )}
    </Layout>
  );
}

export default MyProfile;
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
  const [removingSignature, setRemovingSignature] = useState(false);
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // States for Change Password form and Eye Icon toggles
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  // Load current user profile details
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

  // Save digital signature
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

  // 🌟 Remove Digital Signature Function (Using Toast Messages)
  const removeSignature = async () => {
    if (!profile?.signature_url) return;

    try {
      setRemovingSignature(true);

      try {
        const oldPathMarker = '/storage/v1/object/public/signatures/';
        const oldPathIndex = profile.signature_url.indexOf(oldPathMarker);
        if (oldPathIndex !== -1) {
          const oldPath = decodeURIComponent(
            profile.signature_url.substring(oldPathIndex + oldPathMarker.length)
          );
          await supabase.storage.from('signatures').remove([oldPath]);
        }
      } catch (err) {
        console.warn('Storage signature delete warning:', err);
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/profile/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ signature_url: null })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to remove signature');

      setProfile({ ...profile, signature_url: null });
      const currentStoredUser = JSON.parse(localStorage.getItem('user')) || {};
      currentStoredUser.signature_url = null;
      localStorage.setItem('user', JSON.stringify(currentStoredUser));
      window.dispatchEvent(new Event('userUpdated'));

      showSuccess(tr('signature_removed_success', 'Digital signature removed successfully.'));
    } catch (error) {
      console.error(error);
      showError(error.message || tr('signature_remove_failed', 'Failed to remove signature'));
    } finally {
      setRemovingSignature(false);
    }
  };

  // Handle password update submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.current_password || !passwordData.new_password) {
      showError(tr('fill_all_passfields', 'Please fill in both current and new passwords'));
      return;
    }

    if (passwordData.new_password.length < 8) {
      showError(tr('password_min_length', 'New password must contain at least 8 characters'));
      return;
    }

    if (passwordData.current_password === passwordData.new_password) {
      showError(tr('password_must_be_different', 'New password must be different from current password'));
      return;
    }

    try {
      setChangingPassword(true);
      const headers = await getAuthHeaders();

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify(passwordData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      showSuccess(tr('password_changed_success', 'Password changed successfully'));
      setPasswordData({ current_password: '', new_password: '' });
    } catch (error) {
      console.error('Change password error:', error);
      showError(error.message || tr('password_change_failed', 'Failed to change password'));
    } finally {
      setChangingPassword(false);
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

  // 🌟 Remove Profile Photo Function (Using Toast Messages)
  const removePhoto = async () => {
    if (!profile?.avatar_url) return;

    try {
      setRemovingPhoto(true);

      try {
        const oldPathMarker = '/storage/v1/object/public/avatars/';
        const oldPathIndex = profile.avatar_url.indexOf(oldPathMarker);
        if (oldPathIndex !== -1) {
          const oldPath = decodeURIComponent(
            profile.avatar_url.substring(oldPathIndex + oldPathMarker.length)
          );
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      } catch (err) {
        console.warn('Storage avatar delete warning:', err);
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE}/profile/update`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ avatar_url: null })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to remove photo');

      setProfile({ ...profile, avatar_url: null });
      const currentStoredUser = JSON.parse(localStorage.getItem('user')) || {};
      currentStoredUser.avatar_url = null;
      currentStoredUser.profile_photo = null;
      currentStoredUser.profile_image = null;
      localStorage.setItem('user', JSON.stringify(currentStoredUser));
      window.dispatchEvent(new Event('userUpdated'));

      showSuccess(tr('photo_removed_success', 'Profile photo removed successfully.'));
    } catch (error) {
      console.error(error);
      showError(error.message || tr('photo_remove_failed', 'Failed to remove photo'));
    } finally {
      setRemovingPhoto(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          textAlign: 'center', 
          color: '#64748b',
          gap: 12 
        }}>
          <div className="spinner-icon" />
          <span>{tr('loading_profile_details', 'Loading profile details...')}</span>
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
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => photoInputRef.current?.click()}
                  style={{
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

                {profile?.avatar_url && (
                  <button
                    type="button"
                    className="btn btn-soft"
                    onClick={removePhoto}
                    disabled={removingPhoto}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: '#dc2626',
                      borderColor: '#fecaca',
                      backgroundColor: '#fef2f2'
                    }}
                  >
                    <AppIcon name="x" size={14} />
                    {removingPhoto ? tr('removing', 'Removing...') : tr('remove_photo', 'Remove Photo')}
                  </button>
                )}
              </div>
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
            marginBottom: 24,
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
                maxWidth: 600,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div>
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

              <button
                type="button"
                className="btn btn-soft"
                onClick={removeSignature}
                disabled={removingSignature}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: 12,
                  color: '#dc2626',
                  borderColor: '#fecaca',
                  backgroundColor: '#fef2f2',
                  alignSelf: 'flex-end'
                }}
              >
                <AppIcon name="x" size={14} />
                {removingSignature ? tr('removing', 'Removing...') : tr('remove_signature', 'Remove Signature')}
              </button>
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

        {/* Change Password Card with Eye Icon Toggle */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            border: '1px solid #eaecf0',
            boxSizing: 'border-box',
            maxWidth: 648
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
              <AppIcon name="shield" size={20} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                {tr('change_password', 'Change Password')}
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: 13 }}>
                {tr('change_password_note', 'Update your account password securely.')}
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'grid', gap: 16 }}>
            
            {/* Current Password Field with Eye Icon */}
            <div className="field">
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#334155' }}>
                {tr('current_password', 'Current Password')} *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="input"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
                <span
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                  title={showCurrentPassword ? tr('hide_password', 'Hide password') : tr('show_password', 'Show password')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showCurrentPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </span>
              </div>
            </div>

            {/* New Password Field with Eye Icon */}
            <div className="field">
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#334155' }}>
                {tr('new_password', 'New Password')} *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="input"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  placeholder={`•••••••• ${tr('min_8_characters', '(min 8 characters)')}`}
                  required
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
                <span
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    userSelect: 'none'
                  }}
                  title={showNewPassword ? tr('hide_password', 'Hide password') : tr('show_password', 'Show password')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showNewPassword ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    )}
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={changingPassword}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '9px 18px',
                  fontSize: 13,
                  marginTop: 4
                }}
              >
                <AppIcon name="check" size={15} />
                {changingPassword
                  ? tr('updating', 'Updating...')
                  : tr('update_password', 'Update Password')}
              </button>
            </div>
          </form>
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
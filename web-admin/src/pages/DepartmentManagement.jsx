import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function DepartmentManagement() {
  const { t, language } = useLanguage();

  const activeLanguage = String(language || 'en').toLowerCase();
  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [departments, setDepartments] = useState([]);
  const [staffCounts, setStaffCounts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptDesignations, setDeptDesignations] = useState([]);
  const [deptStaff, setDeptStaff] = useState([]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState(null);

  const [formData, setFormData] = useState({
    department_name: '',
    department_name_si: '',
    department_name_ta: '',
    department_type: 'Regular',
    description: '',
    image_url: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const [designationsInput, setDesignationsInput] = useState([
    { designation_en: '', designation_si: '', designation_ta: '' }
  ]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [hoveredId, setHoveredId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentRole = currentUser?.roles?.role_name || currentUser?.role || currentUser?.role_name || '';
  const isAdmin = currentRole === 'Admin';
  const isDepartmentHead = currentRole === 'Department Head';
  const userDeptId = currentUser?.department_id;

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      await Promise.all([loadDepartments(false), loadStaffCounts()]);
      setLoading(false);
    };
    loadPageData();
  }, []);

  const tr = (key, fallback) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const getDepartmentDisplayName = (dept) => {
    if (!dept) return '';
    if (isSinhala) return dept.department_name_si || dept.department_name;
    if (isTamil) return dept.department_name_ta || dept.department_name;
    return dept.department_name;
  };

  const resetForm = () => {
    setFormData({
      department_name: '',
      department_name_si: '',
      department_name_ta: '',
      department_type: 'Regular',
      description: '',
      image_url: ''
    });
    setImageFile(null);
    setDesignationsInput([{ designation_en: '', designation_si: '', designation_ta: '' }]);
  };

  const loadDepartments = async (manageLoading = true) => {
    if (manageLoading) setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired');

      const response = await fetch(`${API_BASE}/departments/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to load departments');

      let fetchedDepts = Array.isArray(result) ? result : [];

      if (isDepartmentHead && userDeptId) {
        fetchedDepts = fetchedDepts.filter(d => Number(d.id) === Number(userDeptId));
      }

      setDepartments(fetchedDepts);
    } catch (error) {
      showError(error.message);
      setDepartments([]);
    } finally {
      if (manageLoading) setLoading(false);
    }
  };

  const loadStaffCounts = async () => {
    const { data, error } = await supabase.from('users').select('department_id, is_active');
    if (error) {
      showError(error.message);
      return;
    }
    const counts = {};
    (data || []).forEach((user) => {
      if (!user.department_id) return;
      if (!counts[user.department_id]) {
        counts[user.department_id] = { total: 0, active: 0 };
      }
      counts[user.department_id].total += 1;
      if (user.is_active) counts[user.department_id].active += 1;
    });
    setStaffCounts(counts);
  };

  const handleAutoTranslate = async (text) => {
    if (!text.trim()) return;
    try {
      const [resSi, resTa] = await Promise.all([
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|si`).then(r => r.json()),
        fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ta`).then(r => r.json())
      ]);

      setFormData(prev => ({
        ...prev,
        department_name_si: resSi?.responseData?.translatedText || prev.department_name_si,
        department_name_ta: resTa?.responseData?.translatedText || prev.department_name_ta
      }));
    } catch (err) {
      console.error('Translation error:', err);
    }
  };

  const openCreateModal = () => {
    if (!isAdmin) return;
    setEditing(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = async (dept) => {
    if (isDepartmentHead && Number(dept.id) !== Number(userDeptId)) {
      showError('You can only manage your own department.');
      return;
    }

    setEditing(dept.id);
    setFormData({
      department_name: dept.department_name || '',
      department_name_si: dept.department_name_si || '',
      department_name_ta: dept.department_name_ta || '',
      department_type: dept.department_type || 'Regular',
      description: dept.description || '',
      image_url: dept.image_url || ''
    });
    setImageFile(null);

    const { data: desgs } = await supabase.from('designations').select('*').eq('department_id', dept.id);
    if (desgs && desgs.length > 0) {
      setDesignationsInput(desgs.map(d => ({
        id: d.id,
        designation_en: d.designation_en || '',
        designation_si: d.designation_si || '',
        designation_ta: d.designation_ta || ''
      })));
    } else {
      setDesignationsInput([{ designation_en: '', designation_si: '', designation_ta: '' }]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetFile();
    resetForm();
  };

  const resetFile = () => {
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddDesignationField = () => {
    setDesignationsInput([...designationsInput, { designation_en: '', designation_si: '', designation_ta: '' }]);
  };

  const handleRemoveDesignationField = async (index) => {
    const item = designationsInput[index];
    if (item.id) {
      const { error } = await supabase.from('designations').delete().eq('id', item.id);
      if (error) {
        showError('Failed to delete designation from database');
        return;
      }
    }
    const list = [...designationsInput];
    list.splice(index, 1);
    setDesignationsInput(list);
  };

  const handleDesignationChange = (index, field, value) => {
    const list = [...designationsInput];
    list[index][field] = value;
    setDesignationsInput(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired');

      let finalImageUrl = formData.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('Departments')
          .upload(fileName, imageFile);

        if (uploadError) {
          showError('Image upload failed: ' + uploadError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('Departments')
          .getPublicUrl(fileName);

        finalImageUrl = urlData.publicUrl;
      }

      const payload = {
        id: editing,
        department_name: formData.department_name.trim(),
        department_name_si: formData.department_name_si.trim() || null,
        department_name_ta: formData.department_name_ta.trim() || null,
        department_type: formData.department_type || 'Regular',
        description: formData.description || null,
        image_url: finalImageUrl || null
      };

      const endpoint = editing ? `${API_BASE}/departments/update` : `${API_BASE}/departments/add`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save department');

      let deptId = editing || result.data?.id;

      for (const item of designationsInput) {
        if (!item.designation_en.trim()) continue;
        const desPayload = {
          department_id: deptId,
          designation_en: item.designation_en.trim(),
          designation_si: item.designation_si.trim() || null,
          designation_ta: item.designation_ta.trim() || null
        };

        if (item.id) {
          await supabase.from('designations').update(desPayload).eq('id', item.id);
        } else {
          await supabase.from('designations').insert([desPayload]);
        }
      }

      showSuccess(editing ? (isSinhala ? 'දෙපාර්තමේන්තුව යාවත්කාලීන කරන ලදී' : 'Department updated successfully') : (isSinhala ? 'දෙපාර්තමේන්තුව සාදන ලදී' : 'Department created successfully'));
      closeModal();
      loadDepartments();
      loadStaffCounts();
    } catch (error) {
      showError(error.message);
    }
  };

  const handleCardClick = async (dept) => {
    setSelectedDept(dept);
    const { data: desgs } = await supabase.from('designations').select('*').eq('department_id', dept.id);
    setDeptDesignations(desgs || []);

    const { data: staff } = await supabase
      .from('users')
      .select('id, full_name, email, is_active, designation_id, roles:role_id(role_name)')
      .eq('department_id', dept.id);
    setDeptStaff(staff || []);
    setDetailModalOpen(true);
  };

  const handleDeleteClick = (dept) => {
    if (!isAdmin) {
      showError('Only Administrator can delete departments.');
      return;
    }
    setDeptToDelete(dept);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deptToDelete || !isAdmin) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Session expired');

      const response = await fetch(`${API_BASE}/departments/delete/${deptToDelete.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete department');

      showSuccess(isSinhala ? 'දෙපාර්තමේන්තුව ඉවත් කරන ලදී' : 'Department deleted successfully');
      setDeleteModalOpen(false);
      setDeptToDelete(null);
      loadDepartments();
      loadStaffCounts();
    } catch (error) {
      showError(error.message);
      setDeleteModalOpen(false);
      setDeptToDelete(null);
    }
  };

  const departmentTypes = useMemo(() => {
    const unique = [...new Set(departments.map((d) => d.department_type).filter(Boolean))];
    return unique.length ? unique : ['Regular'];
  }, [departments]);

  const filteredDepartments = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();
    return departments.filter((dept) => {
      const matchSearch =
        !keyword ||
        dept.department_name?.toLowerCase().includes(keyword) ||
        dept.department_name_si?.toLowerCase().includes(keyword) ||
        dept.department_name_ta?.toLowerCase().includes(keyword) ||
        dept.description?.toLowerCase().includes(keyword);

      const matchType = typeFilter === 'All' || dept.department_type === typeFilter;
      return matchSearch && matchType;
    });
  }, [departments, searchQuery, typeFilter]);

  const totalStaff = Object.values(staffCounts).reduce((sum, item) => sum + item.total, 0);
  const activeStaff = Object.values(staffCounts).reduce((sum, item) => sum + item.active, 0);

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>
          <div style={styles.loadingBox}>
            <div className="spinner-icon" />
            <span>{t('loading') || 'Loading...'}</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>
              <span style={styles.titleIconBox}>
                <AppIcon name="building" size={24} />
              </span>
              {t('department_management')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('department_management')}</p>
          </div>

          {isAdmin && (
            <button onClick={openCreateModal} style={styles.primaryBtn} type="button">
              <AppIcon name="plus" size={18} />
              {tr('new_department', 'New Department')}
            </button>
          )}
        </div>

        <div style={styles.statsRow}>
          <InfoCard icon="building" label={t('departments')} value={departments.length} />
          <InfoCard icon="users" label={tr('total_staff', 'Total Staff')} value={totalStaff} tone="success" />
          <InfoCard icon="check" label={t('active')} value={activeStaff} tone="success" />
        </div>

        <div style={styles.filterBar}>
          <div style={styles.searchBox}>
            <AppIcon name="search" size={16} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={tr('search_departments', 'Search departments')}
              style={styles.searchInput}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="All">{t('all') || 'All'}</option>
            {departmentTypes.map((type) => (
              <option key={type} value={type}>
                {tr(type.toLowerCase(), type)}
              </option>
            ))}
          </select>
        </div>

        {filteredDepartments.length === 0 ? (
          <div style={styles.emptyState}>
            <AppIcon name="building" size={38} />
            <h3>{tr('no_departments_found', 'No departments found')}</h3>
            <p>{tr('adjust_filters', 'Try changing search or filter options')}</p>
          </div>
        ) : (
          <div style={styles.departmentsGrid}>
            {filteredDepartments.map((dept) => {
              const countInfo = staffCounts[dept.id] || { total: 0, active: 0 };
              const typeName = tr(dept.department_type?.toLowerCase(), dept.department_type || 'Regular');
              const canEditThisDept = isAdmin || (isDepartmentHead && Number(dept.id) === Number(userDeptId));

              return (
                <div
                  key={dept.id}
                  style={styles.thumbnailCard}
                  onMouseEnter={() => setHoveredId(dept.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleCardClick(dept)}
                >
                  <img
                    loading="lazy"
                    src={dept.image_url || '/images/default-department.jpg'}
                    alt={dept.department_name}
                    style={styles.thumbnailImage}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = '/images/default-department.jpg';
                    }}
                  />
                  <div style={styles.thumbnailOverlay} />

                  {canEditThisDept && hoveredId === dept.id && (
                    <div style={styles.actionFloat} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditModal(dept)}
                        style={{ ...styles.iconBtn, color: '#2563eb' }}
                        type="button"
                        title={t('edit')}
                      >
                        <AppIcon name="edit" size={17} />
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteClick(dept)}
                          style={{ ...styles.iconBtn, color: '#dc2626' }}
                          type="button"
                          title={t('delete')}
                        >
                          <AppIcon name="trash" size={17} />
                        </button>
                      )}
                    </div>
                  )}

                  <div style={styles.thumbnailContent}>
                    <div style={styles.cardTopLine}>
                      <span style={styles.typeBadge}>{typeName}</span>
                    </div>

                    <h3 style={styles.thumbnailTitle}>
                      {getDepartmentDisplayName(dept)}
                    </h3>

                    {dept.description && (
                      <p style={styles.thumbnailDesc}>{dept.description}</p>
                    )}

                    <div style={styles.thumbnailMeta}>
                      <span style={styles.glassBadge}>{countInfo.total} {t('staff')}</span>
                      <span style={styles.glassBadge}>{countInfo.active} {t('active')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* DEPARTMENT DETAILS MODAL */}
        {detailModalOpen && selectedDept && (
          <div style={styles.modalOverlay} onClick={() => setDetailModalOpen(false)}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{getDepartmentDisplayName(selectedDept)}</h2>
                <button onClick={() => setDetailModalOpen(false)} style={styles.closeBtn} type="button">
                  <AppIcon name="x" size={20} />
                </button>
              </div>

              <div style={styles.modalBody}>
                {selectedDept.description && (
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    {selectedDept.description}
                  </p>
                )}

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                  {tr('designations_and_staff', 'Designations & Staff Members')}
                </h3>

                {deptDesignations.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tr('no_designations', 'No designations found for this department.')}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {deptDesignations.map((desg) => {
                      const staffInDesg = deptStaff.filter(s => s.designation_id === desg.id);
                      const desgName = isSinhala ? (desg.designation_si || desg.designation_en) : isTamil ? (desg.designation_ta || desg.designation_en) : desg.designation_en;

                      return (
                        <div key={desg.id} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 14 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                            {desgName}
                          </div>
                          
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            <strong>{tr('assigned_staff', 'Assigned Staff')} ({staffInDesg.length}):</strong>
                            {staffInDesg.length === 0 ? (
                              <span style={{ marginLeft: 6, fontStyle: 'italic' }}>{tr('none_assigned', 'None assigned')}</span>
                            ) : (
                              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                                {staffInDesg.map(st => (
                                  <li key={st.id} style={{ marginBottom: 4 }}>
                                    {st.full_name} ({st.email}) {st.is_active ? <span style={{ color: '#16a34a' }}>● Active</span> : <span style={{ color: '#dc2626' }}>● Inactive</span>}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteModalOpen && isAdmin && (
          <div style={styles.modalOverlay} onClick={() => setDeleteModalOpen(false)}>
            <div style={{ ...styles.modalBox, maxWidth: 420, textAlign: 'center', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ width: 54, height: 54, borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <AppIcon name="trash" size={26} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Delete Department?
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Are you sure you want to delete <strong>{getDepartmentDisplayName(deptToDelete)}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button type="button" style={styles.secondaryBtn} onClick={() => setDeleteModalOpen(false)}>
                  {t('cancel')}
                </button>
                <button type="button" style={{ ...styles.primaryBtn, backgroundColor: '#dc2626' }} onClick={confirmDelete}>
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADD / EDIT DEPARTMENT & DESIGNATIONS MODAL */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={closeModal}>
            <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>{editing ? t('edit_department') : t('new_department')}</h2>
                <button onClick={closeModal} style={styles.closeBtn} type="button">
                  <AppIcon name="x" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div style={styles.modalBody}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('department_name_en', 'Department Name (English)')}</label>
                    <input
                      style={styles.input}
                      required
                      value={formData.department_name}
                      onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                      onBlur={(e) => handleAutoTranslate(e.target.value)}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('department_name_si', 'Department Name (Sinhala)')}</label>
                    <input
                      style={styles.input}
                      value={formData.department_name_si}
                      onChange={(e) => setFormData({ ...formData, department_name_si: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('department_name_ta', 'Department Name (Tamil)')}</label>
                    <input
                      style={styles.input}
                      value={formData.department_name_ta}
                      onChange={(e) => setFormData({ ...formData, department_name_ta: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('department_type', 'Department Type')}</label>
                    <select
                      style={styles.select}
                      value={formData.department_type}
                      onChange={(e) => setFormData({ ...formData, department_type: e.target.value })}
                    >
                      <option value="Regular">{tr('regular', 'Regular')}</option>
                      <option value="Library">{tr('library', 'Library')}</option>
                      <option value="Preschool">{tr('preschool', 'Preschool')}</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('description', 'Description')}</label>
                    <textarea
                      style={styles.textarea}
                      rows="3"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>{tr('department_image', 'Department Image (Upload or URL)')}</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }}
                        style={{ fontSize: '13px' }}
                      />
                      {imageFile && (
                        <button type="button" onClick={resetFile} style={{ ...styles.secondaryBtn, padding: '4px 10px', fontSize: '12px' }}>
                          Clear File
                        </button>
                      )}
                    </div>
                    <input
                      style={styles.input}
                      placeholder="Or paste image direct URL here..."
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label style={{ ...styles.label, margin: 0 }}>{tr('designations_under_dept', 'Designations under this Department')}</label>
                      <button type="button" onClick={handleAddDesignationField} style={{ ...styles.secondaryBtn, padding: '6px 12px', fontSize: 13 }}>
                        {tr('add_designation', '+ Add Designation')}
                      </button>
                    </div>

                    {designationsInput.map((item, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                        <input
                          style={styles.input}
                          placeholder={tr('english_name', 'English Name')}
                          value={item.designation_en}
                          onChange={(e) => handleDesignationChange(index, 'designation_en', e.target.value)}
                          onBlur={async (e) => {
                            const val = e.target.value;
                            if (val.trim() && (!item.designation_si || !item.designation_ta)) {
                              try {
                                const [resSi, resTa] = await Promise.all([
                                  fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(val)}&langpair=en|si`).then(r => r.json()),
                                  fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(val)}&langpair=en|ta`).then(r => r.json())
                                ]);
                                
                                const list = [...designationsInput];
                                if (resSi?.responseData?.translatedText) list[index].designation_si = resSi.responseData.translatedText;
                                if (resTa?.responseData?.translatedText) list[index].designation_ta = resTa.responseData.translatedText;
                                setDesignationsInput(list);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                        />
                        <input
                          style={styles.input}
                          placeholder={tr('sinhala_name', 'සිංහල නම')}
                          value={item.designation_si}
                          onChange={(e) => handleDesignationChange(index, 'designation_si', e.target.value)}
                        />
                        <input
                          style={styles.input}
                          placeholder={tr('tamil_name', 'தமிழ் பெயர்')}
                          value={item.designation_ta}
                          onChange={(e) => handleDesignationChange(index, 'designation_ta', e.target.value)}
                        />
                        {designationsInput.length > 1 && (
                          <button type="button" onClick={() => handleRemoveDesignationField(index)} style={{ ...styles.iconBtn, color: '#dc2626', width: 32, height: 32 }}>
                            <AppIcon name="trash" size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.modalActions}>
                  <button type="button" style={styles.secondaryBtn} onClick={closeModal}>
                    {t('cancel')}
                  </button>
                  <button type="submit" style={styles.primaryBtn}>
                    {editing ? t('update') : t('create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--primary-soft)', color: 'var(--primary)' },
    success: { bg: '#dcfce7', color: '#16a34a' },
    warning: { bg: '#ffedd5', color: '#f97316' }
  };
  const selected = toneMap[tone] || toneMap.default;

  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIconBox, backgroundColor: selected.bg, color: selected.color }}>
        <AppIcon name={icon} size={22} />
      </div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 0, backgroundColor: 'var(--bg-primary)', minHeight: '100vh' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--text-secondary)', margin: 0 },
  primaryBtn: { padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' },
  secondaryBtn: { padding: '12px 24px', backgroundColor: 'var(--card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24, padding: '0 24px' },
  statCard: { backgroundColor: 'var(--card)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)' },
  statIconBox: { width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' },
  statLabel: { fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 },
  filterBar: { display: 'flex', gap: '16px', marginBottom: '24px', padding: '0 24px', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--card)', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '8px', flex: 1, minWidth: '250px' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '14px', color: 'var(--text-primary)' },
  filterSelect: { padding: '10px 16px', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--card)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer' },
  emptyState: { margin: '0 24px', padding: 54, textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12 },
  
  departmentsGrid: { display: 'flex', flexDirection: 'column', gap: 24, padding: '0 24px', marginBottom: '40px' },
  thumbnailCard: { position: 'relative', borderRadius: '16px', overflow: 'hidden', width: '100%', minHeight: '300px', backgroundColor: 'var(--card)', cursor: 'pointer', boxShadow: '0 12px 24px rgba(15,23,42,.08)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' },
  thumbnailImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
  thumbnailOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)' },
  actionFloat: { position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 10 },
  iconBtn: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.92)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
  thumbnailContent: { position: 'relative', zIndex: 2, padding: '30px' },
  cardTopLine: { marginBottom: 10 },
  typeBadge: { background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', padding: '5px 12px', borderRadius: 999, color: '#ffffff', fontSize: '13px', fontWeight: 700, border: '1px solid rgba(255,255,255,0.35)' },
  thumbnailTitle: { color: '#ffffff', margin: '0 0 10px 0', fontSize: '26px', fontWeight: 800, textShadow: '0 2px 6px rgba(0,0,0,0.7)', letterSpacing: '0.4px' },
  thumbnailDesc: { color: 'rgba(255,255,255,.9)', fontSize: 15, lineHeight: 1.5, margin: '0 0 16px 0', maxWidth: '800px' },
  thumbnailMeta: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  glassBadge: { background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(6px)', padding: '6px 14px', borderRadius: '8px', color: '#ffffff', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.35)' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    backgroundColor: 'rgba(0, 0, 0, 0.65)', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 999999, 
    padding: '20px' 
  },
  modalBox: { 
    backgroundColor: 'var(--card)', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: 700, 
    maxHeight: '90vh', 
    display: 'flex', 
    flexDirection: 'column', 
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1000000
  },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 },
  closeBtn: { width: 32, height: 32, borderRadius: 6, border: 'none', backgroundColor: 'var(--gray-100)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  formGroup: { marginBottom: 0 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 },
  input: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box' },
  select: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box', cursor: 'pointer' },
  textarea: { width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
  modalActions: { padding: '16px 24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', gap: 12, justifyContent: 'flex-end', flexShrink: 0 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 14, fontWeight: 600 }
};

export default DepartmentManagement;
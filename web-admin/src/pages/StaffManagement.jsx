import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import '../styles/admin.css';
import { colors } from '../utils/colors';
import { showSuccess, showError } from '../services/toastService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function StaffManagement() {
  const { t, language } = useLanguage();

  const activeLanguage = String(
    language ||
    localStorage.getItem('language') ||
    localStorage.getItem('appLanguage') ||
    document.documentElement.lang ||
    'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [nicError, setNicError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const [formData, setFormData] = useState({
    nic: '',
    title: 'Mr',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    designation_id: '',
    staff_category: 'Staff',
    gender: 'Male',
    birthday: '',
    joined_date: new Date().toISOString().split('T')[0],
    role_id: '',
    department_id: '',
    leave_year: String(new Date().getFullYear()),
    casual_used: '0',
    medical_used: '0',
    short_used: '0'
  });

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentRole =
    currentUser?.roles?.role_name ||
    currentUser?.role ||
    currentUser?.role_name ||
    '';

  const isAdmin = currentRole === 'Admin';
  const isSubjectOfficer = currentRole === 'Subject Officer';
  const canRegisterStaff = isSubjectOfficer;

  const staffRoleId = roles.find((r) => r.role_name === 'Staff')?.id || '';
  const [designationsList, setDesignationsList] = useState([]);

  const extractNICDetails = (nicInput) => {
    const nic = nicInput.trim().toUpperCase();
    let year = 0;
    let dayOfYear = 0;
    let gender = '';

    if (nic.length === 10 && (/^[0-9]{9}[VX]$/.test(nic))) {
      year = parseInt('19' + nic.substring(0, 2), 10);
      dayOfYear = parseInt(nic.substring(2, 5), 10);
    } else if (nic.length === 12 && (/^[0-9]{12}$/.test(nic))) {
      year = parseInt(nic.substring(0, 4), 10);
      dayOfYear = parseInt(nic.substring(4, 7), 10);
    } else {
      return isSinhala ? "වැරදි හැඳුනුම්පත් අංකයකි!" : isTamil ? "தவறான அடையாள அட்டை எண்!" : "Invalid NIC number!";
    }

    if (dayOfYear > 500) {
      gender = 'Female';
      dayOfYear = dayOfYear - 500;
    } else {
      gender = 'Male';
    }

    const monthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let month = 0;
    let day = dayOfYear;

    for (let i = 0; i < monthDays.length; i++) {
      if (day <= monthDays[i]) {
        month = i + 1;
        break;
      }
      day -= monthDays[i];
    }

    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const birthday = `${year}-${formattedMonth}-${formattedDay}`;

    return { NIC: nic, Birthday: birthday, Gender: gender };
  };

  const handleNicChange = (value) => {
    const cleanValue = value.trim().toUpperCase();
    const result = extractNICDetails(cleanValue);

    if (typeof result === 'string') {
      setNicError(result);
      setFormData(prev => ({ ...prev, nic: cleanValue }));
    } else {
      setNicError('');
      const plainBirthday = result.Birthday ? result.Birthday.replace(/-/g, '') : '';
      setFormData(prev => ({
        ...prev,
        nic: result.NIC,
        birthday: result.Birthday,
        password: plainBirthday, 
        gender: result.Gender || prev.gender
      }));
    }
  };

  const loadDesignations = async (deptId) => {
    try {
      const numericDeptId = parseInt(deptId, 10);
      if (isNaN(numericDeptId)) {
        setDesignationsList([]);
        return;
      }

      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .eq('department_id', numericDeptId)
        .order('designation_en');
      
      if (!error && data) {
        setDesignationsList(data);
      } else {
        setDesignationsList([]);
      }
    } catch (err) {
      setDesignationsList([]);
    }
  };

  useEffect(() => {
    if (formData.department_id) {
      loadDesignations(formData.department_id);
    } else {
      setDesignationsList([]);
      setFormData(prev => ({ ...prev, designation_id: '' }));
    }
  }, [formData.department_id]);

  useEffect(() => {
    loadRoles();
    loadDepartments();
    loadStaff();
  }, []);

 
  const loadStaff = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // 🌟 දැන් Frontend එක කෙලින්ම Supabase වෙත යෑම වෙනුවට Backend API එකට Request එක යවයි
      const response = await fetch(`${API_BASE}/users/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        // System Privileges මඟින් Off කර ඇත්නම් ලැබෙන 403 දෝෂය මෙහිදී අල්ලා ගනී
        throw new Error(result.error || 'Failed to load staff members');
      }

      setStaff(Array.isArray(result) ? result : (result.data || []));
    } catch (error) {
      showError(error.message || 'Failed to load staff members');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    const { data } = await supabase.from('roles').select('*').order('role_name');
    setRoles(data || []);
  };

  const loadDepartments = async () => {
    const { data } = await supabase.from('departments').select('*').order('department_name');
    setDepartments(data || []);
  };

  const resetForm = () => {
    setFormData({
      nic: '',
      title: 'Mr',
      email: '',
      password: '',
      full_name: '',
      phone: '',
      designation_id: '',
      staff_category: 'Staff',
      gender: 'Male',
      birthday: '',
      joined_date: new Date().toISOString().split('T')[0],
      role_id: '',
      department_id: '',
      leave_year: String(new Date().getFullYear()),
      casual_used: '0',
      medical_used: '0',
      short_used: '0'
    });
    setDesignationsList([]);
    setFormStep(1);
    setNicError('');
    setShowPassword(false);
  };

  const openRegisterModal = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      role_id: String(staffRoleId)
    }));
    setEditing(null);
    setShowModal(true);
  };

  const openEditModal = (staffMember) => {
    setEditing(staffMember.id);
    if (staffMember.department_id) {
      loadDesignations(staffMember.department_id);
    }
    
    let rawPhone = staffMember.phone || '';
    if (rawPhone.startsWith('+94')) {
      rawPhone = rawPhone.substring(3);
    } else if (rawPhone.startsWith('0')) {
      rawPhone = rawPhone.substring(1);
    }

    setFormData({
      nic: staffMember.nic || '',
      title: staffMember.title || 'Mr',
      email: staffMember.email || '',
      password: '',
      full_name: staffMember.full_name || '',
      phone: rawPhone,
      designation_id: staffMember.designation_id ? String(staffMember.designation_id) : '',
      staff_category: staffMember.staff_category || 'Staff',
      gender: staffMember.gender || 'Male',
      birthday: staffMember.birthday || '',
      joined_date: staffMember.joined_date || '',
      role_id: staffMember.role_id || '',
      department_id: staffMember.department_id ? String(staffMember.department_id) : '',
      leave_year: String(new Date().getFullYear()),
      casual_used: '0',
      medical_used: '0',
      short_used: '0'
    });
    setNicError('');
    setFormStep(1);
    setShowPassword(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    resetForm();
  };

  const validateStep1 = () => {
    const cleanNic = formData.nic.trim().toUpperCase();
    if (!cleanNic) {
      showError('NIC number is required');
      return false;
    }
    const oldNicPattern = /^[0-9]{9}[VX]$/;
    const newNicPattern = /^[0-9]{12}$/;
    if (!oldNicPattern.test(cleanNic) && !newNicPattern.test(cleanNic)) {
      showError('Invalid Sri Lankan NIC format.');
      return false;
    }
    if (!formData.full_name.trim()) {
      showError('Full name is required');
      return false;
    }
    if (!formData.birthday) {
      showError('Birthday is required');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!editing && !formData.email.trim()) {
      showError('Email address is required');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editing && !emailPattern.test(formData.email.trim())) {
      showError('Invalid email address format');
      return false;
    }

    if (!editing && !formData.password) {
      showError('Password is required');
      return false;
    }

    if (formData.phone.trim()) {
      const cleanDigits = formData.phone.trim().replace(/\D/g, '');
      if (cleanDigits.length !== 9 || !cleanDigits.startsWith('7')) {
        showError('Invalid mobile number. Enter 9 digits after +94 (e.g. 712345678)');
        return false;
      }
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.department_id) {
      showError('Department is required');
      return false;
    }
    if (!formData.joined_date) {
      showError('Joined date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setSubmitting(true);

    try {
      const formattedPhone = formData.phone.trim() ? `+94${formData.phone.trim().replace(/^0+/, '')}` : null;

      if (editing) {
        const { error } = await supabase
          .from('users')
          .update({
            nic: formData.nic.trim().toUpperCase(),
            title: formData.title,
            full_name: formData.full_name.trim(),
            phone: formattedPhone,
            designation_id: formData.designation_id ? parseInt(formData.designation_id, 10) : null,
            staff_category: formData.staff_category,
            gender: formData.gender,
            birthday: formData.birthday || null,
            joined_date: formData.joined_date || null,
            role_id: staffRoleId ? parseInt(staffRoleId, 10) : null,
            department_id: parseInt(formData.department_id, 10),
            updated_at: new Date().toISOString()
          })
          .eq('id', editing);

        if (error) throw new Error(error.message);

        showSuccess('Staff updated successfully');
        closeModal();
        await loadStaff();
      } else {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
          throw new Error('Your login session has expired. Please login again.');
        }

        const response = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            nic: formData.nic.trim().toUpperCase(),
            title: formData.title,
            email: formData.email.toLowerCase().trim(),
            password: formData.password,
            full_name: formData.full_name.trim(),
            phone: formattedPhone,
            designation_id: formData.designation_id ? parseInt(formData.designation_id, 10) : null,
            staff_category: formData.staff_category,
            gender: formData.gender,
            birthday: formData.birthday || null,
            joined_date: formData.joined_date || null,
            role_id: parseInt(staffRoleId, 10),
            department_id: parseInt(formData.department_id, 10),
            leave_year: parseInt(formData.leave_year, 10),
            casual_used: Number(formData.casual_used),
            medical_used: Number(formData.medical_used),
            short_used: formData.staff_category === 'Field Officer' ? 0 : Number(formData.short_used)
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to register staff');

        showSuccess('Staff registered successfully');
        closeModal();
        await loadStaff();
      }
    } catch (error) {
      showError(error.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      showError(error.message);
      return;
    }
    
    const successMsg = !currentStatus 
      ? (t('staff_activated') !== 'staff_activated' ? t('staff_activated') : 'Staff activated successfully') 
      : (t('staff_deactivated') !== 'staff_deactivated' ? t('staff_deactivated') : 'Staff deactivated successfully');

    showSuccess(successMsg);
    loadStaff();
  };

  const filteredStaff = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return staff.filter((s) => {
      const matchSearch =
        !keyword ||
        s.nic?.toLowerCase().includes(keyword) ||
        s.full_name?.toLowerCase().includes(keyword) ||
        s.email?.toLowerCase().includes(keyword) ||
        s.phone?.toLowerCase().includes(keyword);

      const matchRole = roleFilter === 'all' || String(s.role_id) === String(roleFilter);
      const matchDept = deptFilter === 'all' || String(s.department_id) === String(deptFilter);

      return matchSearch && matchRole && matchDept;
    });
  }, [staff, searchTerm, roleFilter, deptFilter]);

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
              <span style={styles.titleIconWrap}>
                <AppIcon name="users" size={24} />
              </span>
              {t('staff_management')}
            </h1>
            <p style={styles.breadcrumb}>{t('dashboard')} / {t('staff_management')}</p>
          </div>

          {canRegisterStaff && (
            <button onClick={openRegisterModal} style={styles.primaryBtn} type="button">
              <AppIcon name="plus" size={18} />
              {t('register_staff')}
            </button>
          )}
        </div>

        {/* STATS */}
        <div style={styles.statsRow}>
          <InfoCard icon="users" label={t('total_staff')} value={staff.length} />
          <InfoCard icon="check" label={t('active')} value={staff.filter((s) => s.is_active).length} tone="success" />
          <InfoCard icon="alert" label={t('inactive_staff')} value={staff.filter((s) => !s.is_active).length} tone="danger" />
        </div>

        {/* TABLE SECTION */}
        <div style={styles.tableCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>{t('staff_members')}</h2>
              <p style={styles.cardSubtitle}>{filteredStaff.length} {t('records')}</p>
            </div>

            <div style={styles.filterContainer}>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_placeholder')}
                style={styles.searchInput}
              />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{t('all_roles')}</option>
                {roles.map((r) => {
                  let roleKey = r.role_name;
                  if (roleKey === 'Admin') roleKey = 'admin';
                  else if (roleKey === 'CC Officer') roleKey = 'cc_officer';
                  else if (roleKey === 'Chairman') roleKey = 'chairman';
                  else if (roleKey === 'Secretary') roleKey = 'secretary';
                  else if (roleKey === 'Subject Officer') roleKey = 'subject_officer';
                  else if (roleKey === 'Staff') roleKey = 'staff';

                  return (
                    <option key={r.id} value={r.id}>{t(roleKey) || r.role_name}</option>
                  );
                })}
              </select>
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={styles.filterSelect}>
                <option value="all">{t('all_departments')}</option>
                {departments.map((d) => {
                  const deptName = isSinhala
                    ? (d.department_name_si || d.department_name)
                    : isTamil
                    ? (d.department_name_ta || d.department_name)
                    : d.department_name;
                  return (
                    <option key={d.id} value={d.id}>{deptName}</option>
                  );
                })}
              </select>
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div style={styles.emptyState}>
              <AppIcon name="users" size={36} />
              <h3>{t('no_staff_found')}</h3>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead style={styles.thead}>
                  <tr>
                    <th style={styles.th}>{t('nic_no')}</th>
                    <th style={styles.th}>{t('full_name_gender')}</th>
                    <th style={styles.th}>{t('email')}</th>
                    <th style={styles.th}>{t('birthday')}</th>
                    <th style={styles.th}>{t('joined_date', 'Joined Date')}</th> 
                    <th style={styles.th}>{t('role_dept')}</th>
                   {isAdmin && <th style={styles.th}>{t('status')}</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => {
                    const desigText = isSinhala
                      ? (s.designations?.designation_si || s.designations?.designation_en || '-')
                      : isTamil
                      ? (s.designations?.designation_ta || s.designations?.designation_en || '-')
                      : (s.designations?.designation_en || '-');

                    const deptText = isSinhala
                      ? (s.departments?.department_name_si || s.departments?.department_name || '-')
                      : isTamil
                      ? (s.departments?.department_name_ta || s.departments?.department_name || '-')
                      : (s.departments?.department_name || '-');

                    const roleName = s.roles?.role_name;
                    const isSpecialUser = ['Admin', 'Chairman', 'Secretary', 'CC Officer', 'Subject Officer'].includes(roleName);

                    const cleanEmail = s.email ? s.email.toLowerCase().trim() : '';
                    let displayName = s.full_name;

                    if (cleanEmail === 'admin@pradeshiya.gov.lk') {
                      displayName = isSinhala ? 'පද්ධති පරිපාලක' : isTamil ? 'கட்டமைப்பு நிர்வாகி' : 'System Administrator';
                    } else if (cleanEmail === 'ccofficer@pradeshiya.gov.lk') {
                      displayName = isSinhala ? 'CC නිලධාරී' : isTamil ? 'CC அதிகாரி' : 'CC Officer';
                    } else if (cleanEmail === 'chairman@pradeshiya.gov.lk') {
                      displayName = isSinhala ? 'සභාපති' : isTamil ? 'தலைவர்' : 'Chairman';
                    } else if (cleanEmail === 'secretary@pradeshiya.gov.lk') {
                      displayName = isSinhala ? 'ලේකම්' : isTamil ? 'செயலாளர்' : 'Secretary';
                    } else if (cleanEmail === 'subjectofficer@pradeshiya.gov.lk') {
                      displayName = isSinhala ? 'විෂය භාර නිලධාරී' : isTamil ? 'விடய அதிகாரி' : 'Subject Officer';
                    }

                    const isFemale = s.gender === 'Female';
                    const isMale = s.gender === 'Male';
                    
                    const genderKey = isFemale ? 'female' : isMale ? 'male' : 'not_specified';
                    const genderLabel = isSpecialUser ? (isSinhala ? 'පරිපාලන මණ්ඩලය' : isTamil ? 'நிர்வாகக் குழு' : 'Administrative Panel') : t(genderKey);

                    let roleDisplay = roleName || '-';
                    const cleanRole = String(roleName || '').toLowerCase().trim();

                    if (isSinhala) {
                      if (cleanRole.includes('admin')) roleDisplay = 'පරිපාලක';
                      else if (cleanRole.includes('cc')) roleDisplay = 'සම්බන්ධීකරණ නිලධාරී';
                      else if (cleanRole.includes('chairman')) roleDisplay = 'සභාපති';
                      else if (cleanRole.includes('secretary')) roleDisplay = 'ලේකම්';
                      else if (cleanRole.includes('subject')) roleDisplay = 'විෂය භාර නිලධාරී';
                      else if (cleanRole.includes('staff')) roleDisplay = 'කාර්ය මණ්ඩලය';
                    } else if (isTamil) {
                      if (cleanRole.includes('admin')) roleDisplay = 'நிர்வாகி';
                      else if (cleanRole.includes('cc')) roleDisplay = 'ஒருங்கிணைப்பாளர்';
                      else if (cleanRole.includes('chairman')) roleDisplay = 'தலைவர்';
                      else if (cleanRole.includes('secretary')) roleDisplay = 'செயலாளர்';
                      else if (cleanRole.includes('subject')) roleDisplay = 'விடய அதிகாரி';
                      else if (cleanRole.includes('staff')) roleDisplay = 'ஊழியர்';
                    } else {
                      let roleKey = roleName;
                      if (roleKey === 'Admin') roleKey = 'admin';
                      else if (roleKey === 'CC Officer') roleKey = 'cc_officer';
                      else if (roleKey === 'Chairman') roleKey = 'chairman';
                      else if (roleKey === 'Secretary') roleKey = 'secretary';
                      else if (roleKey === 'Subject Officer') roleKey = 'subject_officer';
                      else if (roleKey === 'Staff') roleKey = 'staff';
                      roleDisplay = t(roleKey) || roleName || '-';
                    }

                    return (
                      <tr key={s.id} style={styles.tr}>
                        <td style={styles.td}><strong>{s.nic || '-'}</strong></td>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt="Profile" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            ) : (
                              <div style={styles.avatar}>{displayName?.charAt(0)?.toUpperCase()}</div>
                            )}
                            <div>
                              <strong style={{ fontSize: '15px' }}>  {s.title ? `${s.title}. ${s.full_name}` : s.full_name}</strong>
                              <br />
                              <span style={styles.genderRow}>
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: isSpecialUser ? '#e0e7ff' : isFemale ? '#fce7f3' : isMale ? '#dbeafe' : '#f3f4f6',
                                  color: isSpecialUser ? '#3730a3' : isFemale ? '#db2777' : isMale ? '#2563eb' : '#4b5563',
                                  marginRight: '6px'
                                }}>
                                  <AppIcon 
                                    name="users" 
                                    size={13} 
                                    style={{ marginRight: 4, color: isSpecialUser ? '#3730a3' : isFemale ? '#db2777' : isMale ? '#2563eb' : '#4b5563' }} 
                                  />
                                  {genderLabel}
                                </span>
                                {!isSpecialUser && (
                                  <>• <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px', marginLeft: '6px' }}>{desigText}</span></>
                                )}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>{s.email}</td>
                        <td style={styles.td}>{!isSpecialUser && s.birthday ? new Date(s.birthday).toLocaleDateString() : '-'}</td>
                        <td style={styles.td}>{s.joined_date ? new Date(s.joined_date).toLocaleDateString() : '-'}</td>
                        <td style={styles.td}>
                          <span style={styles.typeBadge}>{roleDisplay}</span>
                          <br />
                          {!isSpecialUser && <small style={{ color: 'var(--muted)' }}>{deptText}</small>}
                        </td>
                    
                        {isAdmin && (
                          <td style={styles.td}>
                            <button
                              onClick={() => toggleStatus(s.id, s.is_active)}
                              style={{
                                ...styles.statusBtn,
                                backgroundColor: s.is_active ? colors.success : colors.error
                              }}
                              type="button"
                            >
                              {s.is_active ? t('active') : t('inactive_staff')}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ width: '720px', maxWidth: '95vw', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-head" style={{ backgroundColor: 'var(--primary)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    {editing ? t('edit_profile', 'Edit Staff Profile') : t('register_new_staff', 'Register New Staff')}
                  </h3>
                  <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                    {t('modal_subtitle', 'Please fill the details below')}
                  </p>
                </div>
                <button 
                  type="button"
                  onClick={closeModal} 
                  style={{ 
                    borderRadius: '50%', 
                    width: 36, 
                    height: 36, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <AppIcon name="x" size={18} color="#000000" />
                </button>
              </div>

              {!editing && (
                <div style={styles.stepperHeader}>
                  <div style={{ ...styles.stepIndicatorItem, opacity: formStep === 1 ? 1 : 0.6 }}>
                    <div style={{ ...styles.stepCircle, backgroundColor: formStep >= 1 ? colors.primary : 'var(--border)' }}>1</div>
                    <span>{t('personal_info')}</span>
                  </div>
                  <div style={styles.stepDivider} />
                  <div style={{ ...styles.stepIndicatorItem, opacity: formStep === 2 ? 1 : 0.6 }}>
                    <div style={{ ...styles.stepCircle, backgroundColor: formStep >= 2 ? colors.primary : 'var(--border)' }}>2</div>
                    <span>{t('account_contact')}</span>
                  </div>
                  <div style={styles.stepDivider} />
                  <div style={{ ...styles.stepIndicatorItem, opacity: formStep === 3 ? 1 : 0.6 }}>
                    <div style={{ ...styles.stepCircle, backgroundColor: formStep >= 3 ? colors.primary : 'var(--border)' }}>3</div>
                    <span>{t('employment')}</span>
                  </div>
                </div>
              )}

              <div className="modal-body" style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>

                  {(formStep === 1 || editing) && (
                    <div style={styles.formSectionBox}>
                      <h4 style={styles.sectionTitle}>1. {t('personal_info')}</h4>
                      <div style={styles.gridTwoCols}>
                        
                        {/* NIC Field */}
                        <div className="field">
                          <label>{t('nic_number')} *</label>
                          <input
                            className="input"
                            value={formData.nic}
                            onChange={(e) => handleNicChange(e.target.value)}
                            placeholder="e.g. 199012345678"
                            maxLength={12}
                            required
                            style={nicError ? { borderColor: 'red' } : {}}
                          />
                          {nicError && (
                            <span style={{ color: 'red', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                              {nicError}
                            </span>
                          )}
                        </div>

                        {/* Full Name Field */}
                        <div className="field">
                          <label>{t('full_name')} *</label>
                          <div style={{ display: 'flex', gap: 10 }}>
                            <select
                              className="select"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                              }
                              style={{ width: 90 }}
                            >
                              <option value="Mr">Mr.</option>
                              <option value="Mrs">Mrs.</option>
                              <option value="Ms">Ms.</option>
                            </select>
                            <input
                              className="input"
                              style={{ flex: 1 }}
                              value={formData.full_name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  full_name: e.target.value
                                })
                              }
                              required
                            />
                          </div>
                        </div>

                        {/* Gender Field */}
                        <div className="field">
                          <label>{t('gender')} *</label>
                          <select
                            className="select"
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          >
                            <option value="Male">{t('male')}</option>
                            <option value="Female">{t('female')}</option>
                            <option value="Other">{t('other')}</option>
                          </select>
                        </div>

                        {/* Birthday Field */}
                        <div className="field">
                          <label>{t('birthday')} *</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.birthday}
                            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                          />
                        </div>

                      </div>
                    </div>
                  )}

                  {(formStep === 2 || editing) && (
                    <div style={styles.formSectionBox}>
                      <h4 style={styles.sectionTitle}>2. {t('account_contact')}</h4>
                      <div style={styles.gridTwoCols}>
                        {!editing && (
                          <>
                            <div className="field">
                              <label>{t('email_address')} *</label>
                              <input
                                type="email"
                                className="input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div className="field">
                              <label>{t('password')} * <small style={{ color: 'var(--muted)', fontWeight: 'normal' }}>({t('auto_filled_as_birthday', 'Auto-filled as Birthday')})</small></label>
                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <input
                                  type={showPassword ? "text" : "password"}
                                  className="input"
                                  value={formData.password}
                                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                  placeholder="19950812"
                                  required
                                  style={{ width: '100%', paddingRight: '40px' }}
                                  autoComplete="new-password"
                                />
                                <span
                                  onClick={() => setShowPassword(!showPassword)}
                                  style={{
                                    position: 'absolute',
                                    right: '12px',
                                    cursor: 'pointer',
                                    color: 'var(--muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    userSelect: 'none',
                                    zIndex: 10
                                  }}
                                  title={showPassword ? "Hide password" : "Show password"}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? (
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
                          </>
                        )}
                        <div className="field">
                          <label>{t('phone_number')}</label>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--gray-50)', overflow: 'hidden' }}>
                            <span style={{ padding: '0 12px', backgroundColor: 'var(--gray-200)', color: 'var(--text)', fontWeight: 600, fontSize: '14px', borderRight: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center' }}>+94</span>
                            <input
                              className="input"
                              style={{ border: 'none', backgroundColor: 'transparent', flex: 1, outline: 'none', padding: '12px' }}
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                              placeholder="712345678"
                              maxLength={9}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
      
                  {(formStep === 3 || editing) && (
                    <div style={styles.formSectionBox}>
                      <h4 style={styles.sectionTitle}>3. {t('employment_and_initial_leave')}</h4>
                      <div style={styles.gridTwoCols}>
                        
                        {/* Staff Category */}
                        <div className="field">
                          <label>{t('staff_category')} *</label>
                          <select
                            className="select"
                            value={formData.staff_category}
                            onChange={(e) => setFormData({ ...formData, staff_category: e.target.value })}
                            required
                          >
                            <option value="Staff">{t('staff')}</option>
                            <option value="Field Officer">{t('field_officer')}</option>
                            <option value="Labour">{t('labour')}</option>
                          </select>
                        </div>

                        {/* Department */}
                        <div className="field">
                          <label>{t('department')} *</label>
                          <select
                            className="select"
                            value={formData.department_id}
                            onChange={(e) => {
                              const selectedDeptId = e.target.value;
                              setFormData({ 
                                ...formData, 
                                department_id: selectedDeptId,
                                designation_id: '' 
                              });
                            }}
                            required
                          >
                            <option value="">{t('select_department_first')}</option>
                            {departments.map((d) => {
                              const deptName = isSinhala
                                ? (d.department_name_si || d.department_name)
                                : isTamil
                                ? (d.department_name_ta || d.department_name)
                                : d.department_name;
                              return (
                                <option key={d.id} value={String(d.id)}>{deptName}</option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Designation */}
                        <div className="field">
                          <label>{t('designation')}</label>
                          <select
                            className="select"
                            value={formData.designation_id}
                            onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                            disabled={!formData.department_id}
                          >
                            <option value="">
                              {!formData.department_id ? t('select_department_first') : t('select_designation')}
                            </option>
                            {designationsList.map((des) => {
                              const desigName = isSinhala
                                ? (des.designation_si || des.designation_en)
                                : isTamil
                                ? (des.designation_ta || des.designation_en)
                                : des.designation_en;
                              return (
                                <option key={des.id} value={String(des.id)}>{desigName}</option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Joined Date */}
                        <div className="field">
                          <label>{t('joined_date', 'Joined Date')} *</label>
                          <input
                            type="date"
                            className="input"
                            value={formData.joined_date}
                            onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                            required
                          />
                        </div>

                        {/* Leave Balances - Only visible during Registration */}
                        {!editing && (
                          <>
                            <div className="field">
                              <label>{t('leave_year')}</label>
                              <input
                                type="number"
                                className="input"
                                value={formData.leave_year}
                                onChange={(e) => setFormData({ ...formData, leave_year: e.target.value })}
                                placeholder="2026"
                                required
                              />
                            </div>
                            <div className="field">
                              <label>{t('casual_leaves_used')}</label>
                              <input
                                type="number"
                                className="input"
                                value={formData.casual_used}
                                onChange={(e) => setFormData({ ...formData, casual_used: e.target.value })}
                                min="0"
                                max="21"
                              />
                            </div>
                            <div className="field">
                              <label>{t('medical_leaves_used')}</label>
                              <input
                                type="number"
                                className="input"
                                value={formData.medical_used}
                                onChange={(e) => setFormData({ ...formData, medical_used: e.target.value })}
                                min="0"
                                max="24"
                              />
                            </div>
                            {formData.staff_category !== 'Field Officer' && (
                              <div className="field">
                                <label>{t('short_leaves_used')}</label>
                                <input
                                  type="number"
                                  className="input"
                                  value={formData.short_used}
                                  onChange={(e) => setFormData({ ...formData, short_used: e.target.value })}
                                  min="0"
                                  max="2"
                                />
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div>
                      {!editing && formStep > 1 && (
                        <button type="button" className="btn btn-soft" onClick={() => setFormStep(formStep - 1)}>
                          {t('back')}
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button type="button" className="btn btn-soft" onClick={closeModal} disabled={submitting}>
                        {t('cancel')}
                      </button>
                      {!editing && formStep < 3 ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => {
                            if (formStep === 1 && validateStep1()) setFormStep(2);
                            else if (formStep === 2 && validateStep2()) setFormStep(3);
                          }}
                          style={{ padding: '10px 24px' }}
                        >
                          {t('next_step')}
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '10px 24px' }}>
                          {submitting ? t('saving') : (editing ? t('update_profile') : t('register_staff_btn'))}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function InfoCard({ icon, label, value, tone = 'default' }) {
  const toneMap = {
    default: { bg: 'var(--gray-100)', color: colors.primary },
    success: { bg: '#dcfce7', color: colors.success },
    danger: { bg: '#fee2e2', color: colors.error }
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
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, padding: 24, backgroundColor: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' },
  pageTitle: { fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 12 },
  titleIconWrap: { width: 42, height: 42, borderRadius: 10, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  breadcrumb: { fontSize: 14, color: 'var(--muted)', margin: 0 },
  primaryBtn: { padding: '12px 24px', backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 24, padding: '0 24px' },
  statCard: { backgroundColor: 'var(--bg-secondary)', padding: 20, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)' },
  statIconBox: { width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  statValue: { fontSize: 24, fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontSize: 13, color: 'var(--muted)', marginTop: 4 },
  tableCard: { backgroundColor: 'var(--bg-secondary)', borderRadius: 12, margin: '0 24px', border: '1px solid var(--border)' },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' },
  cardTitle: { fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 },
  cardSubtitle: { margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 },
  filterContainer: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  searchInput: { padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text)', fontSize: '13.5px', outline: 'none', minWidth: 240 },
  filterSelect: { padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text)', fontSize: '13.5px', outline: 'none', cursor: 'pointer' },
  emptyState: { padding: 50, textAlign: 'center', color: 'var(--muted)' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: 'var(--gray-50)' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)', fontSize: 14, fontWeight: 600 },
  th: { padding: '16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '16px', fontSize: '14px', color: 'var(--text)', whiteSpace: 'nowrap' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: '50%', backgroundColor: colors.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 },
  genderRow: { display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: '13.5px', marginTop: '4px' },
  typeBadge: { padding: '4px 10px', backgroundColor: 'var(--gray-100)', borderRadius: 6, fontSize: 12, color: 'var(--text)', fontWeight: 600 },
  statusBtn: { padding: '6px 12px', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  editBtn: { width: 36, height: 36, backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  formSectionBox: { backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: 'var(--primary)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  gridTwoCols: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 },
  stepperHeader: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 24px', backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' },
  stepIndicatorItem: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', fontWeight: 600, color: 'var(--text)' },
  stepCircle: { width: 26, height: 26, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 },
  stepDivider: { width: 40, height: 2, backgroundColor: 'var(--border)', margin: '0 12px' }
};

export default StaffManagement;
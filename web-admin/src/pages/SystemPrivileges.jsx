import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import AppIcon from '../components/AppIcon';
import { showSuccess, showError } from '../services/toastService';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const MODULE_ICONS = {
  dashboard_general: 'dashboard',
  staff_management: 'users',
  department_management: 'building',
  designation_management: 'note',
  leave_management: 'calendar',
  profile_requests: 'user',
  complaints: 'alert',
  task_management: 'task',
  announcement_management: 'megaphone',
  notification_management: 'bell',
  reports: 'report',
  audit_system: 'audit',
  role_management: 'shield',
  system_privilege_management: 'lock',
  system_settings: 'settings',
  mobile_app_users: 'smartphone',
};

export default function SystemPrivileges() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [originalModules, setOriginalModules] = useState([]);

  const activeLanguage = String(
    language ||
      localStorage.getItem('language') ||
      localStorage.getItem('appLanguage') ||
      'en'
  ).toLowerCase();

  const isSinhala = activeLanguage === 'si' || activeLanguage.startsWith('si-');
  const isTamil = activeLanguage === 'ta' || activeLanguage.startsWith('ta-');

  const getRoleDisplayName = (role) => {
    if (!role) return '';
    if (isSinhala) return role.role_name_si || role.role_name;
    if (isTamil) return role.role_name_ta || role.role_name;
    return role.role_name;
  };

  useEffect(() => {
    loadRoles();
  }, [activeLanguage]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('roles')
        .select('id, role_name, role_name_si, role_name_ta')
        .order('role_name');

      if (error) throw error;
      const filteredRoles = (data || []).filter(
        (role) => role.role_name !== 'Admin' && 
                  !['Mobile User', 'Public User'].includes(role.role_name)
      );

      setRoles(filteredRoles);

      if (filteredRoles.length > 0 && !selectedRole) {
        setSelectedRole(String(filteredRoles[0].id));
      }
    } catch (error) {
      console.error('Load roles error:', error);
      setError(error.message || 'Failed to load roles');
      showError(error.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRole) {
      loadPrivileges(selectedRole);
    }
  }, [selectedRole]);

  const loadPrivileges = async (roleId) => {
    try {
      setLoading(true);
      setError('');

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('Login session expired. Please login again.');
      }

      const response = await fetch(`${API_BASE}/privileges/all?role_id=${roleId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load privileges');
      }

      const loadedModules = result.modules || [];

      const sortedModules = loadedModules.map((mod) => ({
        ...mod,
        privileges: (mod.privileges || []).sort(
          (a, b) => (a.display_order || 0) - (b.display_order || 0)
        ),
      }));

      setModules(JSON.parse(JSON.stringify(sortedModules)));
      setOriginalModules(JSON.parse(JSON.stringify(sortedModules)));

      const initialExpanded = {};
      sortedModules.forEach((module, index) => {
        initialExpanded[module.module_id] = index < 2;
      });

      setExpandedModules(initialExpanded);
    } catch (error) {
      console.error('Load privileges error:', error);
      setError(error.message || 'Failed to load privileges');
      setModules([]);
      setOriginalModules([]);
      showError(error.message || 'Failed to load privileges');
    } finally {
      setLoading(false);
    }
  };

  const getModuleName = (module) => {
    if (isSinhala) return module.module_name_si || module.module_name_en || 'Module';
    if (isTamil) return module.module_name_ta || module.module_name_en || 'Module';
    return module.module_name_en || module.module_key || 'Module';
  };

  const getPrivilegeName = (privilege) => {
    if (isSinhala) return privilege.privilege_name_si || privilege.privilege_name_en || privilege.privilege_key || 'Privilege';
    if (isTamil) return privilege.privilege_name_ta || privilege.privilege_name_en || privilege.privilege_key || 'Privilege';
    return privilege.privilege_name_en || privilege.privilege_key || 'Privilege';
  };

  const filteredModules = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) return modules;

    return modules
      .map((module) => {
        const moduleName = getModuleName(module).toLowerCase();
        const moduleKey = String(module.module_key || '').toLowerCase();

        const matchingPrivileges = (module.privileges || []).filter((privilege) => {
          const privilegeName = getPrivilegeName(privilege).toLowerCase();
          return privilegeName.includes(keyword);
        });

        return {
          ...module,
          privileges: matchingPrivileges,
          searchMatched: moduleName.includes(keyword) || moduleKey.includes(keyword),
        };
      })
      .filter((module) => module.searchMatched || module.privileges.length > 0);
  }, [modules, searchTerm, activeLanguage]);

  const updatePrivilege = (moduleId, privilegeId, enabled) => {
    setModules((previous) =>
      previous.map((module) => {
        if (Number(module.module_id) !== Number(moduleId)) return module;

        return {
          ...module,
          privileges: (module.privileges || []).map((privilege) => {
            if (Number(privilege.id) !== Number(privilegeId)) return privilege;
            return { ...privilege, is_enabled: Boolean(enabled) };
          }),
        };
      })
    );
  };

  const setModulePrivileges = (moduleId, enabled) => {
    setModules((previous) =>
      previous.map((module) => {
        if (Number(module.module_id) !== Number(moduleId)) return module;

        return {
          ...module,
          privileges: (module.privileges || []).map((privilege) => ({
            ...privilege,
            is_enabled: Boolean(enabled),
          })),
        };
      })
    );
  };

  const toggleModule = (moduleId) => {
    setExpandedModules((previous) => ({
      ...previous,
      [moduleId]: !previous[moduleId],
    }));
  };

  const expandAll = () => {
    const expanded = {};
    modules.forEach((module) => {
      expanded[module.module_id] = true;
    });
    setExpandedModules(expanded);
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const isModuleFullyEnabled = (module) => {
    const modulePrivileges = module.privileges || [];
    if (modulePrivileges.length === 0) return false;
    return modulePrivileges.every((privilege) => privilege.is_enabled === true);
  };

  const hasChanges = useMemo(() => {
    const current = modules.flatMap((module) =>
      (module.privileges || []).map((privilege) => ({
        privilege_id: Number(privilege.id),
        is_enabled: Boolean(privilege.is_enabled),
      }))
    );

    const original = originalModules.flatMap((module) =>
      (module.privileges || []).map((privilege) => ({
        privilege_id: Number(privilege.id),
        is_enabled: Boolean(privilege.is_enabled),
      }))
    );

    current.sort((a, b) => a.privilege_id - b.privilege_id);
    original.sort((a, b) => a.privilege_id - b.privilege_id);

    return JSON.stringify(current) !== JSON.stringify(original);
  }, [modules, originalModules]);

  const statistics = useMemo(() => {
    const allPrivileges = modules.flatMap((module) => module.privileges || []);
    const total = allPrivileges.length;
    const enabled = allPrivileges.filter((p) => p.is_enabled === true).length;
    const disabled = total - enabled;
    const moduleCount = modules.length;

    return { total, enabled, disabled, moduleCount };
  }, [modules]);

  const savePrivileges = async () => {
    if (!selectedRole) {
      showError(isSinhala ? 'කරුණාකර භූමිකාවක් තෝරන්න.' : isTamil ? 'தயவுசெய்து ஒரு பங்கைத் தேர்ந்தெடுக்கவும்.' : 'Please select a role.');
      return;
    }

    if (!hasChanges) {
      showSuccess(isSinhala ? 'සුරැකීමට වෙනස්කම් නොමැත.' : isTamil ? 'சேமிக்க மாற்றங்கள் இல்லை.' : 'No changes to save.');
      return;
    }

    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Your login session has expired. Please login again.');
      }

      const privileges = modules.flatMap((module) =>
        (module.privileges || []).map((privilege) => ({
          privilege_id: Number(privilege.id),
          is_enabled: Boolean(privilege.is_enabled),
        }))
      );

      const response = await fetch(`${API_BASE}/privileges/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          role_id: Number(selectedRole),
          privileges,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update privileges');
      }

      setOriginalModules(JSON.parse(JSON.stringify(modules)));
      showSuccess(t('privileges_updated_successfully') !== 'privileges_updated_successfully' ? t('privileges_updated_successfully') : 'Privileges updated successfully.');
    } catch (error) {
      console.error('Save privileges error:', error);
      showError(error.message || 'Failed to save privileges');
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setModules(JSON.parse(JSON.stringify(originalModules)));
    showSuccess(isSinhala ? 'වෙනස්කම් ඉවතලන ලදී.' : isTamil ? 'மாற்றங்கள் தவிர்க்கப்பட்டன.' : 'Changes discarded.');
  };

  const currentSelectedRoleObj = roles.find(
    (role) => String(role.id) === String(selectedRole)
  );
  const selectedRoleDisplayName = getRoleDisplayName(currentSelectedRoleObj);

  if (loading) {
    return (
      <Layout>
        <div style={styles.loading}>
          <div style={styles.loadingBox}>
            <div style={styles.spinner} />
            <div>
              {isSinhala ? 'පද්ධති වරප්‍රසාද පූරණය වෙමින් පවතී...' : isTamil ? 'கணினி அனுமதிகள் ஏற்றப்படுகின்றன...' : 'Loading system privileges...'}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <div style={styles.titleIcon}>
              <AppIcon name="shield" size={24} />
            </div>
            <div>
              <h1 style={styles.title}>
                {isSinhala ? 'පද්ධති වරප්‍රසාද' : isTamil ? 'கணினி அனுமதிகள்' : 'System Privileges'}
              </h1>
              <p style={styles.subtitle}>
                {isSinhala ? 'භූමිකා පාදක ප්‍රවේශ අවසර කළමනාකරණය කරන්න.' : isTamil ? 'பங்கு அடிப்படையிலான அணுகல் அனுமதிகளை நிர்வகிக்கவும்.' : 'Manage role-based access permissions.'}
              </p>
            </div>
          </div>

          <div style={styles.headerRight}>
            <span style={styles.roleLabel}>{isSinhala ? 'භූමිකාව' : isTamil ? 'பங்கு' : 'Role'}</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={styles.roleSelect}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {getRoleDisplayName(role)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AppIcon name="alert" size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ROLE INFO */}
        <div style={styles.roleInfo}>
          <div>
            <span style={styles.roleInfoLabel}>
              {isSinhala ? 'සඳහා වරප්‍රසාද සංස්කරණය කරමින් පවතී:' : isTamil ? 'இதற்கான அனுமதிகள் திருத்தப்படுகின்றன:' : 'Editing privileges for'}
            </span>
            <h2 style={styles.roleName}>{selectedRoleDisplayName}</h2>
          </div>
          <div
            style={{
              ...styles.changeBadge,
              backgroundColor: hasChanges ? '#fff7ed' : '#f0fdf4',
              color: hasChanges ? '#c2410c' : '#15803d',
            }}
          >
            {hasChanges 
              ? (isSinhala ? 'සුරකින නොලද වෙනස්කම්' : isTamil ? 'சேமிக்கப்படாத மாற்றங்கள்' : 'Unsaved changes') 
              : (isSinhala ? 'සියලු වෙනස්කම් සුරකින ලදී' : isTamil ? 'அனைத்து மாற்றங்களும் சேமிக்கப்பட்டன' : 'All changes saved')}
          </div>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <StatCard label={isSinhala ? 'මුළු වරප්‍රසාද' : isTamil ? 'மொத்த அனுமதிகள்' : 'Total Privileges'} value={statistics.total} icon="shield" />
          <StatCard label={isSinhala ? 'සක්‍රීයයි' : isTamil ? 'செயலில்' : 'Enabled'} value={statistics.enabled} icon="check-circle" />
          <StatCard label={isSinhala ? 'අක්‍රීයයි' : isTamil ? 'முடக்கம்' : 'Disabled'} value={statistics.disabled} icon="x-circle" />
          <StatCard label={isSinhala ? 'මොඩියුල' : isTamil ? 'தொகுதிகள்' : 'Modules'} value={statistics.moduleCount} icon="grid" />
        </div>

        {/* TOOLBAR */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <AppIcon name="search" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isSinhala ? 'වරප්‍රසාද සොයන්න...' : isTamil ? 'அனுமதிகளைத் தேடவும்...' : 'Search privileges...'}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.toolbarRight}>
            <span style={styles.resultText}>
              {statistics.total} {isSinhala ? 'වරප්‍රසාද' : isTamil ? 'அனுமதிகள்' : 'privileges'}
            </span>
            <button type="button" onClick={expandAll} style={styles.softButton}>
              {isSinhala ? 'සියල්ල විවෘත කරන්න' : isTamil ? 'அனைத்தையும் விரிவுபடுத்து' : 'Expand All'}
            </button>
            <button type="button" onClick={collapseAll} style={styles.softButton}>
              {isSinhala ? 'සියල්ල හකුළන්න' : isTamil ? 'அனைத்தையும் சுருக்கு' : 'Collapse All'}
            </button>
          </div>
        </div>

        {/* MODULE LIST */}
        <div style={styles.moduleList}>
          {filteredModules.length === 0 ? (
            <div style={styles.empty}>
              <AppIcon name="search" size={40} />
              <h3>{isSinhala ? 'වරප්‍රසාද හමු නොවීය' : isTamil ? 'அனுமதிகள் எதுவும் கிடைக்கவில்லை' : 'No privileges found'}</h3>
            </div>
          ) : (
            filteredModules.map((module) => {
              const isExpanded = Boolean(expandedModules[module.module_id]);
              const moduleEnabled = isModuleFullyEnabled(module);
              const privilegeCount = (module.privileges || []).length;
              const moduleIcon = MODULE_ICONS[module.module_key] || 'folder';

              return (
                <div key={module.module_id} style={styles.moduleCard}>
                  <div style={styles.moduleHeader}>
                    <button
                      type="button"
                      onClick={() => toggleModule(module.module_id)}
                      style={styles.moduleButton}
                    >
                      <div style={styles.moduleNumber}>
                        <AppIcon name={moduleIcon} size={18} />
                      </div>
                      <div style={styles.moduleInfo}>
                        <div style={styles.moduleTitle}>{getModuleName(module)}</div>
                        <div style={styles.moduleKey}>
                          {privilegeCount} {isSinhala ? 'වරප්‍රසාද' : isTamil ? 'அனுமதிகள்' : 'privileges'}
                        </div>
                      </div>
                      <AppIcon name={isExpanded ? 'chevron-down' : 'chevron-right'} size={20} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setModulePrivileges(module.module_id, !moduleEnabled)}
                      style={{
                        ...styles.moduleToggle,
                        backgroundColor: moduleEnabled ? '#059669' : '#6b7280',
                      }}
                    >
                      <span style={styles.moduleToggleDot} />
                      {moduleEnabled 
                        ? (isSinhala ? 'සියල්ල සක්‍රීයයි' : isTamil ? 'அனைத்தும் ஆன்' : 'All ON') 
                        : (isSinhala ? 'සියල්ල සක්‍රීය කරන්න' : isTamil ? 'அனைத்தையும் இயக்கு' : 'Enable All')}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={styles.privilegeTable}>
                      <div style={styles.privilegeHeader}>
                        <div style={styles.privilegeNameHeader}>
                          {isSinhala ? 'වරප්‍රසාදය' : isTamil ? 'அனுமதி' : 'Privilege'}
                        </div>
                        <div>
                          {isSinhala ? 'තත්ත්වය' : isTamil ? 'நிலை' : 'Status'}
                        </div>
                      </div>

                      {(module.privileges || []).map((privilege) => (
                        <div key={privilege.id} style={styles.privilegeRow}>
                          <div style={styles.privilegeName}>
                            <div style={styles.privilegeTitle}>{getPrivilegeName(privilege)}</div>
                          </div>

                          <div style={styles.statusCell}>
                            <Toggle
                              checked={privilege.is_enabled === true}
                              onChange={(value) =>
                                updatePrivilege(module.module_id, privilege.id, value)
                              }
                            />
                            <span
                              style={{
                                ...styles.statusText,
                                color: privilege.is_enabled ? '#059669' : '#4b5563',
                              }}
                            >
                              {privilege.is_enabled 
                                ? (isSinhala ? 'සක්‍රීයයි' : isTamil ? 'செயலில்' : 'Enabled') 
                                : (isSinhala ? 'අක්‍රීයයි' : isTamil ? 'முடக்கம்' : 'Disabled')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SAVE BAR */}
        <div style={styles.saveBar}>
          <div>
            <strong>
              {hasChanges 
                ? (isSinhala ? 'සුරකින නොලද වෙනස්කම් ඇත' : isTamil ? 'சேமிக்கப்படாத மாற்றங்கள் உள்ளன' : 'You have unsaved changes') 
                : (isSinhala ? 'වරප්‍රසාද යාවත්කාලීනව ඇත' : isTamil ? 'அனுமதிகள் புதுப்பிக்கப்பட்டுள்ளன' : 'Privileges are up to date')}
            </strong>
          </div>
          <div style={styles.saveActions}>
            {hasChanges && (
              <button type="button" onClick={resetChanges} disabled={saving} style={styles.cancelButton}>
                {isSinhala ? 'අවලංගු කරන්න' : isTamil ? 'மாற்றங்களைத் தவிர்' : 'Discard Changes'}
              </button>
            )}
            <button
              type="button"
              onClick={savePrivileges}
              disabled={saving || !hasChanges}
              style={{ ...styles.saveButton, opacity: saving || !hasChanges ? 0.55 : 1 }}
            >
              <AppIcon name="save" size={18} />
              {saving 
                ? (isSinhala ? 'සුරකිමින්...' : isTamil ? 'சேமிக்கிறது...' : 'Saving...') 
                : (isSinhala ? 'වරප්‍රසාද සුරකින්න' : isTamil ? 'அனுமதிகளைச் சேமி' : 'Save Privileges')}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ ...styles.toggle, backgroundColor: checked ? '#059669' : '#cbd5e1' }}
    >
      <span style={{ ...styles.toggleCircle, transform: checked ? 'translateX(22px)' : 'translateX(3px)' }} />
    </button>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}><AppIcon name={icon} size={20} /></div>
      <div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', padding: '24px', backgroundColor: 'var(--bg-primary)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '22px 24px', marginBottom: 18, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 14 },
  titleIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' },
  title: { margin: 0, fontSize: 25, fontWeight: 750, color: 'var(--text)' },
  subtitle: { margin: '5px 0 0', color: 'var(--muted)', fontSize: 13 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 10 },
  roleLabel: { fontSize: 13, fontWeight: 600, color: 'var(--muted)' },
  roleSelect: { minWidth: 190, padding: '11px 14px', borderRadius: 9, border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text)', fontWeight: 650, outline: 'none', cursor: 'pointer' },
  errorBox: { display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', marginBottom: 18, borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, fontWeight: 600 },
  roleInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', marginBottom: 18, borderRadius: 12, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' },
  roleInfoLabel: { fontSize: 12, color: 'var(--muted)' },
  roleName: { margin: '4px 0 0', fontSize: 19, color: 'var(--text)' },
  changeBadge: { padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 650 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 18 },
  statCard: { display: 'flex', alignItems: 'center', gap: 13, padding: '16px 18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 },
  statIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' },
  statValue: { fontSize: 20, fontWeight: 750, color: 'var(--text)' },
  statLabel: { fontSize: 12, color: 'var(--muted)', marginTop: 2 },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 15, flexWrap: 'wrap', padding: 14, marginBottom: 15, backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 },
  searchWrapper: { display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', minWidth: 300, borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--muted)' },
  searchInput: { flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', fontSize: 13 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  resultText: { fontSize: 12, color: 'var(--muted)', marginRight: 5 },
  softButton: { border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text)', padding: '8px 11px', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  moduleList: { display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 140 },
  moduleCard: { overflow: 'hidden', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 13 },
  moduleHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 15, padding: '14px 17px' },
  moduleButton: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, border: 'none', background: 'transparent', color: 'var(--text)', cursor: 'pointer', textAlign: 'left' },
  moduleNumber: { width: 38, height: 38, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 15, fontWeight: 700, color: 'var(--text)' },
  moduleKey: { marginTop: 3, fontSize: 11, color: 'var(--muted)' },
  moduleToggle: { display: 'flex', alignItems: 'center', gap: 7, border: 'none', borderRadius: 20, padding: '7px 11px', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700 },
  moduleToggleDot: { width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' },
  privilegeTable: { borderTop: '1px solid var(--border)' },
  privilegeHeader: { display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 150px', alignItems: 'center', padding: '11px 17px', backgroundColor: 'var(--gray-50)', color: 'var(--muted)', fontSize: 11, fontWeight: 750 },
  privilegeNameHeader: { textAlign: 'left' },
  privilegeRow: { display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 150px', alignItems: 'center', minHeight: 50, padding: '6px 17px', borderTop: '1px solid var(--border)' },
  privilegeName: { textAlign: 'left', color: 'var(--text)' },
  privilegeTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  statusCell: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
  statusText: { fontSize: 11, fontWeight: 650, minWidth: 48, textAlign: 'left' },
  empty: { padding: 70, textAlign: 'center', color: 'var(--muted)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12 },
  toggle: { position: 'relative', width: 46, height: 24, padding: 0, border: 'none', borderRadius: 20, cursor: 'pointer', transition: 'background-color 0.25s ease', flexShrink: 0 },
  toggleCircle: { position: 'absolute', top: 3, left: 0, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'transform 0.25s ease' },
  saveBar: { position: 'sticky', bottom: 12, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '14px 18px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' },
  cancelButton: { padding: '10px 15px', borderRadius: 8, border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 12 },
  saveButton: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: 13 },
  loading: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loadingBox: { display: 'flex', alignItems: 'center', gap: 12, color: 'var(--muted)' },
  spinner: { width: 20, height: 20, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' },
};
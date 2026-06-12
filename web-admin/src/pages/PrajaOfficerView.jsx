import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import Layout from '../components/Layout';
import { PageHero, StatCard, EmptyState } from '../components/PageParts';

function PrajaOfficerView() {
  const { t } = useLanguage();
  const [staff, setStaff] = useState([]);
  const [tab, setTab] = useState('Library');

  useEffect(() => { loadStaff(); }, []);

  const loadStaff = async () => {
    const { data } = await supabase
      .from('users')
      .select('*, departments(department_name, department_type)')
      .eq('is_active', true);

    setStaff(
      (data || []).filter((s) => ['Library', 'Preschool'].includes(s.departments?.department_type))
    );
  };

  const getTranslationKey = (name) => {
    if (!name) return '';
    return name.toLowerCase().trim().replace(/&/g, 'and').replace(/\s+/g, '_');
  };

  const rows = staff.filter((s) => s.departments?.department_type === tab);

  return (
    <Layout>
      <PageHero
        icon="shield"
        title={t('praja_officer_dashboard')}
        subtitle={t('praja_officer_subtitle')}
      />

      <div className="notice" style={{ marginBottom: 22, backgroundColor: 'var(--primary-soft)', color: 'var(--text)', border: '1px solid var(--border)', padding: 16, borderRadius: 8 }}>
        {t('praja_officer_notice')}
      </div>

      <div className="pro-grid stats-grid">
        <StatCard icon="building" label={t('library_staff')} value={staff.filter((s) => s.departments?.department_type === 'Library').length} />
        <StatCard icon="users" label={t('preschool_staff')} value={staff.filter((s) => s.departments?.department_type === 'Preschool').length} />
        <StatCard icon="shield" label={t('total_under_review')} value={staff.length} />
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'Library' ? 'active' : ''}`} onClick={() => setTab('Library')}>{t('library')}</button>
        <button className={`tab ${tab === 'Preschool' ? 'active' : ''}`} onClick={() => setTab('Preschool')}>{t('preschool')}</button>
      </div>

      <div className="pro-card" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="card-head">
          <h3 style={{ color: 'var(--text)' }}>
            {tab === 'Library' ? t('library') : t('preschool')} {t('staff')}
          </h3>
          <span className="badge badge-neutral">{rows.length} {t('staff')}</span>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon="users" title={t('no_staff_found')} />
        ) : (
          <div className="table-wrap">
            <table className="pro-table">
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)' }}>
                  <th style={{ color: 'var(--text)' }}>{t('name')}</th>
                  <th style={{ color: 'var(--text)' }}>{t('email')}</th>
                  <th style={{ color: 'var(--text)' }}>{t('phone')}</th>
                  <th style={{ color: 'var(--text)' }}>{t('department')}</th>
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text)' }}>
                {rows.map((s) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td>
                      <strong>{s.full_name}</strong>
                      <br />
                      <small style={{ color: 'var(--muted)' }}>{s.designation ? t(getTranslationKey(s.designation)) : '-'}</small>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone || '-'}</td>
                    <td>{t(getTranslationKey(s.departments?.department_name))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PrajaOfficerView;
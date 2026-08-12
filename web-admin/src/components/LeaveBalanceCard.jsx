import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function LeaveBalanceCard({ t, tr, lang, refreshTrigger }) {
  const [balances, setBalances] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  const getAuthToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('Session error:', error);
    const token = session?.access_token || localStorage.getItem('supabase_token');
    if (!token) throw new Error('Authentication token not found.');
    return token;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      const resBalance = await fetch(`${API_BASE}/leave/my-leave-balances?year=${selectedYear}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resultBalance = await resBalance.json();
      if (resBalance.ok) {
        const filtered = (resultBalance.data || []).filter(item => {
          const name = item.leave_types?.name_en?.toLowerCase() || '';
          return !name.includes('half');
        });
        setBalances(filtered);
      }

      const resHistory = await fetch(`${API_BASE}/leave/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resultHistory = await resHistory.json();
      if (resHistory.ok) {
        setHistory(resultHistory || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  if (loading && balances.length === 0) {
    return <div style={{ padding: 16, textAlign: 'center' }}> 
    {t('loading') || 'Loading...'}</div>;
  }

  const maxDaysLimit = 25;
  const chartHeight = 160;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
      <div className="pro-card" style={{ padding: 24, background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>
              </span> {t('leave_balance_chart') || tr('leave_balance_chart', 'Leave Balance Chart')}
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{tr('year', 'Year')}:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="select"
              style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer' }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>
        
        {balances.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>{t('no_leave_balances') || tr('no_leave_balances', 'No leave balances found for this year.')}</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 15, paddingBottom: 10, overflowX: 'auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, paddingRight: 8, borderRight: '2px solid var(--border)', fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'right', minWidth: '25px' }}>
              {[25, 20, 15, 10, 5, 0].map(n => <span key={n}>{n}</span>)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', flex: 1, height: `${chartHeight}px`, position: 'relative', borderBottom: '2px solid var(--border)', paddingLeft: '15px', paddingRight: '15px', gap: '20px' }}>
              
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.15 }}>
                {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ borderBottom: '1px dashed var(--text)', width: '100%' }}></div>)}
              </div>

              {balances.map((item, index) => {
                let lName = lang === 'si' ? (item.leave_types?.name_si || item.leave_types?.name_en) : lang === 'ta' ? (item.leave_types?.name_ta || item.leave_types?.name_en) : (item.leave_types?.name_en || '-');

                const allocated = Number(item.allocated_days) || 0;
                const used = Number(item.used_days) || 0;
                const remaining = Number(item.remaining_days) || 0;
                
                const barHeight = Math.min(Math.max((remaining / maxDaysLimit) * chartHeight, remaining > 0 ? 12 : 4), chartHeight);
                const colors = ['#3b82f6', '#ec4899', '#f97316', '#10b981', '#8b5cf6'];

                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', zIndex: 2, minWidth: '100px' }}>
                    
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>
                      {remaining} {tr('remaining', 'Left')}
                    </span>

                    <div style={{ width: '36px', height: `${barHeight}px`, backgroundColor: colors[index % colors.length], borderRadius: '6px 6px 0 0', transition: 'height 0.5s ease', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />

                    <div style={{ marginTop: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{lName}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        {tr('total', 'Total')}: <strong>{allocated}</strong> | {tr('used', 'Used')}: <strong style={{ color: '#d97706' }}>{used}</strong>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>

      <div className="pro-card" style={{ padding: 20, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
        <h3 style={{ marginBottom: 16, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {lang === 'si' ? 'මගේ නිවාඩු ඉතිහාසය' : lang === 'ta' ? 'எனது விடுப்பு வரலாறு' : 'My Leave History'}
        </h3>

        {history.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>
            {lang === 'si' ? 'නිවාඩු ඉතිහාසයක් හමු නොවීය.' : lang === 'ta' ? 'விடுப்பு வரலாறு எதுவும் கிடைக்கவில்லை.' : 'No leave history found.'}
          </p>
        ) : (
          <div className="table-wrap" style={{ overflowX: 'auto' }}>
            <table className="pro-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>{t('leave_type') || 'Leave Type'}</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>{t('leave_period') || 'Period'}</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>{t('days') || 'Days'}</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>{t('status') || 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((req) => {
                  let lName = lang === 'si' ? (req.leave_types?.name_si || req.leave_types?.name_en) : lang === 'ta' ? (req.leave_types?.name_ta || req.leave_types?.name_en) : (req.leave_types?.name_en || '-');
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{lName}</td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{req.start_date} → {req.end_date}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>{req.no_of_days}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ 
                                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                                backgroundColor: req.status?.toLowerCase().includes('approved') ? '#dcfce7' : req.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                                color: req.status?.toLowerCase().includes('approved') ? '#16a34a' : req.status === 'Rejected' ? '#dc2626' : '#d97706'
                              }}>
                                {req.status?.toLowerCase().includes('approved') ? tr('approved', 'Approved') : req.status === 'Rejected' ? tr('rejected', 'Rejected') : req.status === 'Pending' ? tr('pending', 'Pending') : req.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
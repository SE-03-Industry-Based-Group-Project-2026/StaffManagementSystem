import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SUBJECT_APPROVED = ['Subject Approved'];
const CC_APPROVED = ['CC Approved'];

export function useLeaveRequests(t, tr, lang, locationState) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.roles?.role_name || user?.role || user?.role_name || '';

  const getAuthToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('Session error:', error);
    const token = session?.access_token || localStorage.getItem('supabase_token');
    if (!token) throw new Error('Authentication token not found. Please log in again.');
    return token;
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      const res = await fetch(`${API_BASE}/leave/all-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('failed_load_leave_requests'));
        setRequests([]);
        return;
      }
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || tr('failed_connect_backend', 'Failed to connect backend'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    const openId = locationState?.openId;
    if (!openId || requests.length === 0) return;
    const found = requests.find((item) => String(item.id) === String(openId));
    if (found) {
      setSelected(found);
      setRemark('');
    }
  }, [locationState, requests]);

  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === 'Pending').length;
    const finalReview = requests.filter((r) => ['Subject Approved', 'CC Approved'].includes(r.status)).length;
    const approved = requests.filter((r) => r.status === 'Approved').length;
    const rejected = requests.filter((r) => r.status === 'Rejected').length;
    const totalDays = requests.reduce((sum, r) => sum + Number(r.no_of_days || 0), 0);
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, pending, finalReview, approved, rejected, totalDays, approvalRate };
  }, [requests]);

  const visibleRequests = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();
    return requests.filter((r) => {
      const matchTab =
        filter === 'all' ||
        (filter === 'pending' && r.status === 'Pending') ||
        (filter === 'subject' && SUBJECT_APPROVED.includes(r.status)) ||
        (filter === 'cc' && CC_APPROVED.includes(r.status)) ||
        (filter === 'approved' && r.status === 'Approved') ||
        (filter === 'rejected' && r.status === 'Rejected');

      if (!matchTab) return false;

      const deptName = r.users?.departments?.department_name || '';
      const employee = r.users?.full_name || '';
      const email = r.users?.email || '';

      return !keyword ||
        employee.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        deptName.toLowerCase().includes(keyword) ||
        String(r.status || '').toLowerCase().includes(keyword);
    });
  }, [requests, filter, searchTerm]);

  const checkGovernmentRules = (req) => {
    if (req.no_of_days > 45) {
      return {
        valid: false,
        reason: tr('leave_rule_annual_cap', 'Total leave exceeds the annual 45-day government cap.')
      };
    }
    const isShortLeave = req.leave_types?.name_en?.toLowerCase().includes('short');
    if (req.no_of_days >= 6 && !isShortLeave) {
      return {
        valid: false,
        reason: tr('leave_rule_consecutive_cap', 'Consecutive leave cannot exceed 5 days without special executive approval.')
      };
    }
    const start = new Date(req.start_date);
    const day = start.getDay();
    if (day === 0 || day === 6) {
      return {
        valid: false,
        reason: tr('leave_rule_weekend', 'Leave requests cannot be initiated on weekends.')
      };
    }
    return { valid: true };
  };

const updateLeave = async (action) => {
    if (!selected) return;
    if (action === 'approve') {
      const validation = checkGovernmentRules(selected);
      if (!validation.valid) {
        toast.error(`${tr('rule_restriction', 'Rule Restriction')}: ${validation.reason}`);
        return;
      }
    }

    try {
      const token = await getAuthToken();

      let endpoint = '';
      if (action === 'reject') {
        endpoint = `${API_BASE}/leave/reject/${selected.id}`;
      } else if (role === 'Subject Officer') {
        endpoint = `${API_BASE}/leave/subject-approve/${selected.id}`;
      } else if (role === 'CC Officer') {
        endpoint = `${API_BASE}/leave/cc-approve/${selected.id}`;
      } else {
        endpoint = `${API_BASE}/leave/final-approve/${selected.id}`;
      }

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ remark: remark || '', signature: null }) // අත්සන නිසා එන 500 එරර් එක සම්පූර්ණයෙන්ම නැති කිරීමට මෙලෙස දෙන්න
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('action_failed'));
        return;
      }

      toast.success(t('leave_request_updated_successfully'));
      setSelected(null);
      setRemark('');
      loadRequests();
    } catch (error) {
      console.error(error);
      toast.error(error.message || tr('failed_connect_backend', 'Failed to connect backend'));
    }
  };
  
  return {
    requests, visibleRequests, stats, loading, filter, setFilter,
    searchTerm, setSearchTerm, selected, setSelected, remark, setRemark,
    role, updateLeave
  };
}
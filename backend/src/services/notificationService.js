const supabase = require('../config/supabase');

function translateRole(roleName, lang) {
  const clean = String(roleName || '').toLowerCase().trim();
  
  const map = {
    'admin': { si: 'පරිපාලක', ta: 'நிர்வாகி', en: 'Admin' },
    'secretary': { si: 'ලේකම්', ta: 'செயலாளர்', en: 'Secretary' },
    'chairman': { si: 'සභාපති', ta: 'தலைவர்', en: 'Chairman' },
    'cc officer': { si: 'සම්බන්ධීකරණ නිලධාරී', ta: 'ஒருங்கிணைப்பாளர்', en: 'CC Officer' },
    'subject officer': { si: 'විෂය භාර නිලධාරී', ta: 'விடய அதிகாரி', en: 'Subject Officer' },
    'staff': { si: 'කාර්ය මණ්ඩලය', ta: 'ஊழியர்', en: 'Staff' }
  };

  return map[clean] ? map[clean][lang] : roleName;
}

async function createNotification({
  userId,
  title = 'New Notification',
  message = 'You have a new notification from the system.',
  notificationKey = null,
  payload = {},
  notificationType = 'General',
  relatedEntity = null,
  relatedId = null,
  createdBy = null
}) {
  if (!userId) return null;

  let titleEn = title;
  let messageEn = message;
  let titleSi = 'නව දැනුම්දීමක්';
  let titleTa = 'புதிய அறிவிப்பு';
  let messageSi = message;
  let messageTa = message;

  const cleanKey = String(notificationKey || '').toLowerCase().trim();
  const cleanTitle = String(title || '').toLowerCase().trim();

  const assignedByEn = payload.assigned_by || 'Admin';
  const assignedBySi = translateRole(assignedByEn, 'si');
  const assignedByTa = translateRole(assignedByEn, 'ta');

  const employeeName = payload.employee_name || 'Employee';

  switch (cleanKey) {
    case 'leave_requires_approval':
      titleEn = 'Leave Approval Required';
      messageEn = `New leave request from ${employeeName} requires your review.`;
      titleSi = 'නිවාඩු අනුමැතිය අවශ්‍ය වේ';
      titleTa = 'விடுப்பு ஒப்புதல் தேவை';
      messageSi = `${employeeName} වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කරන්න.`;
      messageTa = `${employeeName} இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்யவும்.`;
      break;

    case 'leave_requires_final_approval':
      titleEn = 'Final Leave Approval Required';
      messageEn = `Leave request from ${employeeName} is awaiting your final approval.`;
      titleSi = 'අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ';
      titleTa = 'இறுதி விடுப்பு ஒப்புதல் தேவை';
      messageSi = `${employeeName} ගේ නිවාඩු ඉල්ලීම අවසාන අනුමැතිය සඳහා අපේක්ෂාවෙන් පවතී.`;
      messageTa = `${employeeName} இன் விடுப்பு கோரிக்கை இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.`;
      break;

    case 'leave_final_approved':
      titleEn = 'Leave Approved';
      messageEn = `Your leave request (${payload.start_date || ''} - ${payload.end_date || ''}) has been approved.`;
      titleSi = 'නිවාඩු ඉල්ලීම අනුමත කරන ලදී';
      titleTa = 'விடுப்பு அங்கீகரிக்கப்பட்டது';
      messageSi = `ඔබගේ නිවාඩු ඉල්ලීම (${payload.start_date || ''} සිට ${payload.end_date || ''}) අනුමත කර ඇත.`;
      messageTa = `உங்கள் விடுப்பு கோரிக்கை (${payload.start_date || ''} முதல் ${payload.end_date || ''}) அங்கீகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'leave_request_rejected':
      titleEn = 'Leave Rejected';
      messageEn = `Your leave request (${payload.start_date || ''} - ${payload.end_date || ''}) has been rejected.`;
      titleSi = 'නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප විය';
      titleTa = 'விடுப்பு நிராகரிக்கப்பட்டது';
      messageSi = `ඔබගේ නිවාඩු ඉල්ලීම (${payload.start_date || ''} සිට ${payload.end_date || ''}) ප්‍රතික්ෂේප කර ඇත.`;
      messageTa = `உங்கள் விடுப்பு கோரிக்கை (${payload.start_date || ''} முதல் ${payload.end_date || ''}) நிராகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'task_assigned':
      titleEn = 'New Task Assigned';
      messageEn = `${assignedByEn} assigned you a new task.`;
      titleSi = 'නව කාර්යයක් පවරන ලදී';
      titleTa = 'புதிய பணி ஒதுக்கீடு';
      messageSi = `${assignedBySi} විසින් ඔබට නව කාර්යයක් පවරා ඇත.`;
      messageTa = `${assignedByTa} உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்.`;
      break;

    case 'task_status_updated':
      titleEn = 'Task Status Updated';
      messageEn = `Task status updated to: ${payload.status || ''}.`;
      titleSi = 'කාර්යයේ තත්ත්වය යාවත්කාලීන විය';
      titleTa = 'பணி நிலை புதுப்பிக்கப்பட்டது';
      messageSi = `කාර්යයේ තත්ත්වය "${payload.status || ''}" ලෙස යාවත්කාලීන කර ඇත.`;
      messageTa = `பணியின் நிலை "${payload.status || ''}" என புதுப்பிக்கப்பட்டுள்ளது.`;
      break;

    case 'complaint_reply':
      titleEn = 'New response to your complaint';
      messageEn = `Complaint (#[${payload.complaint_id || 'N/A'}]) has a new response.`;
      titleSi = 'ඔබගේ පැමිණිල්ලට නව ප්‍රතිචාරයක් ලැබී ඇත:';
      titleTa = 'உங்கள் புகாருக்கு புதிய பதில் கிடைத்துள்ளது:';
      messageSi = `පැමිණිල්ල (#[${payload.complaint_id || 'N/A'}]) සඳහා නව ප්‍රතිචාරයක් ලැබී ඇත.`;
      messageTa = `புகார் (#[${payload.complaint_id || 'N/A'}]) தொடர்பான புதிய பதில் வந்துள்ளது.`;
      break;

      case 'complaint_status_updated':
      const rawStatus = String(payload.status || '').toLowerCase().trim();

      titleEn = 'Complaint Status Update';
      titleSi = 'පැමිණිලි තත්ත්වය යාවත්කාලීන විය';
      titleTa = 'புகார் நிலை புதுப்பிக்கப்பட்டது';

      if (rawStatus === 'resolved') {
        messageEn = 'Your complaint has been resolved.';
        messageSi = 'ඔබගේ පැමිණිල්ල විසඳන ලදී';
        messageTa = 'உங்கள் புகார் தீர்க்கப்பட்டுள்ளது';
      } else if (rawStatus === 'in_progress' || rawStatus === 'inprogress' || rawStatus === 'processing') {
        messageEn = 'Your complaint is in progress.';
        messageSi = 'ඔබගේ පැමිණිල්ල ක්‍රියාත්මක වෙමින් පවතී';
        messageTa = 'உங்கள் புகார் செயலாக்கத்தில் உள்ளது';
      } else if (rawStatus === 'closed') {
        messageEn = 'Your complaint has been closed.';
        messageSi = 'ඔබගේ පැමිණිල්ල වසා දමන ලදී';
        messageTa = 'உங்கள் புகார் மூடப்பட்டுள்ளது';
      } else {
        messageEn = `Complaint status updated to: ${payload.status || ''}`;
        messageSi = `ඔබගේ පැමිණිල්ලේ තත්ත්වය: ${payload.status || ''}`;
        messageTa = `புகாரின் நிலை: ${payload.status || ''}`;
      }
      break;

    case 'privileges_updated':
      titleEn = 'System Privileges Updated';
      messageEn = `Your role access permissions have been updated.`;
      titleSi = 'පද්ධති බලතල යාවත්කාලීන විය';
      titleTa = 'கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டன';
      messageSi = `පරිපාලක විසින් ඔබගේ පද්ධති බලතල යාවත්කාලීන කර ඇත.`;
      messageTa = `நிர்வாகியால் உங்கள் கணினி சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.`;
      break;

    case 'announcement_created':
      titleEn = 'New Announcement';
      messageEn = `New notice posted: "${payload.announcement_title || ''}"`;
      titleSi = 'නව නිවේදනයක් ඇත';
      titleTa = 'புதிய அறிவிப்பு';
      messageSi = `නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "${payload.announcement_title || ''}"`;
      messageTa = `புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "${payload.announcement_title || ''}"`;
      break;

    case 'acting_officer_assigned':
      titleEn = 'Duty Coverage Assigned';
      messageEn = `You have been assigned as a duty coverage officer.`;
      titleSi = 'රාජකාරි ආවරණ නිලධාරී පත්වීම';
      titleTa = 'பணி பொறுப்பு நியமனம்';
      messageSi = 'ඔබව රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත.';
      messageTa = 'நீங்கள் பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்.';
      break;

    case 'profile_request_approved':
    case 'profile_change_approved':
      titleEn = 'Profile Approved';
      messageEn = `Your profile update request has been approved.`;
      titleSi = 'පැතිකඩ ඉල්ලීම අනුමත විය';
      titleTa = 'சுயவிவர கோரிக்கை அங்கீகரிக்கப்பட்டது';
      messageSi = `ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම අනුමත කර ඇත.`;
      messageTa = `உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'profile_request_rejected':
    case 'profile_change_rejected':
      titleEn = 'Profile Rejected';
      messageEn = `Your profile update request has been rejected.`;
      titleSi = 'පැතිකඩ ඉල්ලීම ප්‍රතික්ෂේප විය';
      titleTa = 'சுயவிவர கோரிக்கை நிராகரிக்கப்பட்டது';
      messageSi = `ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.`;
      messageTa = `உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.`;
      break;

    default:
      titleEn = title;
      messageEn = message;
      titleSi = title;
      titleTa = title;
      messageSi = message;
      messageTa = message;
      break;
  }

  const { data, error } = await supabase.from('notifications').insert({
    user_id: userId,
    title: titleEn,
    message: messageEn,
    title_en: titleEn,
    title_si: titleSi,    
    title_ta: titleTa,    
    message_en: messageEn, 
    message_si: messageSi, 
    message_ta: messageTa, 
    notification_key: notificationKey || 'general',
    payload: payload || {},
    notification_type: notificationType,
    related_entity: relatedEntity,
    related_id: relatedId,
    is_auto_generated: true,
    is_for_mobile: true, 
    is_read: false,
    created_by: createdBy,
    created_at: new Date().toISOString()
  });

  if (error) {
    console.error('Notification Insert Error:', error.message);
  }

  return { success: !error, data };
}

async function notifyRolePrivilegeChange({
  roleId,
  privilegeId = null,
  privilegeName = null,
  enabled = true,
  createdBy = null
}) {
  try {
    if (!roleId) {
      return {
        success: false,
        error: 'Role ID is required'
      };
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, role_id')
      .eq('role_id', roleId);

    if (usersError) {
      console.error(
        'Error finding users for role privilege notification:',
        usersError.message
      );

      return {
        success: false,
        error: usersError.message
      };
    }

    if (!users || users.length === 0) {
      return {
        success: true,
        notifiedUsers: 0
      };
    }

    const { data: role } = await supabase
      .from('roles')
      .select('role_name')
      .eq('id', roleId)
      .single();

    const roleName = role?.role_name || 'your role';

    const notificationPromises = users.map((user) => {
      return createNotification({
        userId: user.id,
        notificationKey: 'privileges_updated',
        title: 'System Privileges Updated',
        message: `Your ${roleName} role permissions have been updated.`,
        payload: {
          role_id: roleId,
          role_name: roleName,
          privilege_id: privilegeId,
          privilege_name: privilegeName,
          privilege_enabled: enabled,
          employee_name: user.full_name
        },
        notificationType: 'System Privileges',
        relatedEntity: 'system_privileges',
        relatedId: privilegeId,
        createdBy
      });
    });

    const results = await Promise.all(notificationPromises);

    const successCount = results.filter(
      (result) => result?.success
    ).length;

    return {
      success: true,
      notifiedUsers: successCount
    };

  } catch (error) {
    console.error(
      'notifyRolePrivilegeChange error:',
      error
    );

    return {
      success: false,
      error: error.message
    };
  }
}

async function notifyUserPrivilegeChange({
  userId,
  privilegeId = null,
  privilegeName = null,
  enabled = true,
  createdBy = null
}) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required'
      };
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role_id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    const result = await createNotification({
      userId: user.id,
      notificationKey: 'privileges_updated',
      title: 'System Privileges Updated',
      message: 'Your individual system privileges have been updated.',
      payload: {
        user_id: user.id,
        employee_name: user.full_name,
        privilege_id: privilegeId,
        privilege_name: privilegeName,
        privilege_enabled: enabled
      },
      notificationType: 'System Privileges',
      relatedEntity: 'system_privileges',
      relatedId: privilegeId,
      createdBy
    });

    return result;

  } catch (error) {
    console.error(
      'notifyUserPrivilegeChange error:',
      error
    );

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createNotification,
  notifyRolePrivilegeChange,
  notifyUserPrivilegeChange
};
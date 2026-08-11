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
      messageSi = `${employeeName} වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.`;
      messageTa = `${employeeName} இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.`;
      break;

    case 'leave_requires_final_approval':
      titleEn = 'Final Leave Approval Required';
      messageEn = `Leave request from ${employeeName} is awaiting your final approval.`;
      titleSi = 'අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ';
      titleTa = 'இறுதி விடுப்பு ஒப்புதல் தேவை';
      messageSi = `${employeeName} ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.`;
      messageTa = `${employeeName} இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.`;
      break;

    case 'leave_final_approved':
      titleEn = 'Leave Final Approved';
      messageEn = `Your leave request from ${payload.start_date || ''} to ${payload.end_date || ''} has been approved.`;
      titleSi = 'නිවාඩු අයදුම්පත අනුමත කරන ලදී';
      titleTa = 'விடுப்பு அங்கீகரிக்கப்பட்டது';
      messageSi = `${payload.start_date || ''} සිට ${payload.end_date || ''} දක්වා ඔබගේ නිවාඩු ඉල්ලීම අනුමත කර ඇත.`;
      messageTa = `${payload.start_date || ''} முதல் ${payload.end_date || ''} வரையிலான உங்கள் விடுப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'leave_request_rejected':
      titleEn = 'Leave Request Rejected';
      messageEn = `Your leave request from ${payload.start_date || ''} to ${payload.end_date || ''} has been rejected.`;
      titleSi = 'නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී';
      titleTa = 'விடுப்பு நிராகரிக்கப்பட்டது';
      messageSi = `${payload.start_date || ''} සිට ${payload.end_date || ''} දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.`;
      messageTa = `${payload.start_date || ''} முதல் ${payload.end_date || ''} வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'task_assigned':
      titleEn = 'New Task Assigned';
      messageEn = `${assignedByEn} assigned you a new task:`;
      titleSi = 'නව කාර්යයක් පවරන ලදී';
      titleTa = 'புதிய பணி ஒதுக்கீடு';
      messageSi = `${assignedBySi} විසින් ඔබට නව කාර්යයක් පවරා ඇත:`;
      messageTa = `${assignedByTa} உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்:`;
      break;

    case 'task_status_updated':
      titleEn = 'Task Status Updated';
      messageEn = `Task "${payload.task_title || ''}" status has been updated to ${payload.status || ''}.`;
      titleSi = 'කාර්යයේ තත්ත්වය යාවත්කාලීන කරන ලදී';
      titleTa = 'பணி நிலை புதுப்பிக்கப்பட்டது';
      messageSi = `"${payload.task_title || ''}" කාර්යයේ තත්ත්වය ${payload.status || ''} ලෙස යාවත්කාලීන කර ඇත.`;
      messageTa = `"${payload.task_title || ''}" பணியின் நிலை ${payload.status || ''} என புதுப்பிக்கப்பட்டுள்ளது.`;
      break;

    case 'complaint_reply':
      titleEn = 'Response Received Regarding Your Complaint';
      messageEn = `A new response has been added regarding your complaint (Reference ID: ${payload.complaint_id || 'N/A'}). Please check the system for details.`;
      titleSi = 'ඔබගේ පැමිණිල්ල සම්බන්ධයෙන් නව ප්‍රතිචාරයක් ලැබී ඇත';
      titleTa = 'உங்கள் புகார் தொடர்பான புதிய பதில் பெறப்பட்டுள்ளது';
      messageSi = `ඔබ විසින් ඉදිරිපත් කරන ලද පැමිණිල්ල (යොමු අංකය: ${payload.complaint_id || 'අදාළ නැත'}) සම්බන්ධයෙන් නව ප්‍රතිචාරයක් එකතු කර ඇත. වැඩි විස්තර සඳහා පද්ධතිය පරීක්ෂා කරන්න.`;
      messageTa = `உங்கள் புகார் (குறிப்பு எண்: ${payload.complaint_id || 'N/A'}) தொடர்பாக புதிய பதில் சேர்க்கப்பட்டுள்ளது. கூடுதல் விவரங்களுக்கு அமைப்பைப் பார்க்கவும்.`;
      break;

    case 'complaint_status_updated':
      let statusTextEn = payload.status || '';
      let statusTextSi = payload.status || '';
      let statusTextTa = payload.status || '';

      const rawStatus = String(payload.status || '').toLowerCase().trim();

      if (rawStatus === 'resolved') {
        statusTextEn = 'Successfully Resolved';
        statusTextSi = 'සාර්ථකව විසඳන ලදී';
        statusTextTa = 'வெற்றிகரமாக தீர்க்கப்பட்டது';
      } else if (rawStatus === 'in_progress' || rawStatus === 'inprogress' || rawStatus === 'processing') {
        statusTextEn = 'Under Investigation / In Progress';
        statusTextSi = 'විමර්ශනය කරමින් / ක්‍රියාත්මක වෙමින් පවතී';
        statusTextTa = 'விசாரணையில் / செயலாக்கத்தில் உள்ளது';
      } else if (rawStatus === 'closed') {
        statusTextEn = 'Closed';
        statusTextSi = 'වසා ඇත';
        statusTextTa = 'மூடப்பட்டுள்ளது';
      } else if (rawStatus === 'pending') {
        statusTextEn = 'Pending Review';
        statusTextSi = 'සමාලෝචනය සඳහා අපේක්ෂා කෙරේ';
        statusTextTa = 'மதிப்பாய்வுக்காக காத்திருக்கிறது';
      }

      titleEn = 'Complaint Status Update';
      messageEn = `The status of your complaint has been updated to: ${statusTextEn}.`;
      titleSi = 'පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී';
      titleTa = 'புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது';
      messageSi = `ඔබගේ පැමිණිල්ලේ වත්මන් තත්ත්වය "${statusTextSi}" ලෙස යාවත්කාලීන කර ඇත.`;
      messageTa = `உங்கள் புகாரின் நிலை "${statusTextTa}" என புதுப்பிக்கப்பட்டுள்ளது.`;
      break;

      case 'privileges_updated':
      titleEn = 'System Privileges Updated';
      messageEn = `Your role permissions and module access privileges have been updated by the Administrator.`;
      titleSi = 'පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී';
      titleTa = 'கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன';
      messageSi = `පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.`;
      messageTa = `நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.`;
      break;

      
    case 'announcement_created':
      titleEn = 'New Announcement';
      messageEn = `New announcement posted: "${payload.announcement_title || ''}"`;
      titleSi = 'නව නිවේදනයක්';
      titleTa = 'புதிய அறிவிப்பு';
      messageSi = `නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "${payload.announcement_title || ''}"`;
      messageTa = `புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "${payload.announcement_title || ''}"`;
      break;

    case 'acting_officer_assigned':
      titleEn = 'Duty Coverage Assigned';
      messageEn = `You have been assigned as a duty coverage officer.`;
      titleSi = 'රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත';
      titleTa = 'பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்';
      messageSi = 'ඔබව රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත.';
      messageTa = 'நீங்கள் பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்.';
      break;

    case 'profile_request_approved':
    case 'profile_change_approved':
      titleEn = 'Profile Request Approved';
      messageEn = `Your profile update request has been approved.`;
      titleSi = 'පැතිකඩ ඉල්ලීම අනුමත කරන ලදී';
      titleTa = 'சுயவிவர கோரிக்கை அங்கீகரிக்கப்பட்டது';
      messageSi = `ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම අනුමත කරන ලදී.`;
      messageTa = `உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.`;
      break;

    case 'profile_request_rejected':
    case 'profile_change_rejected':
      titleEn = 'Profile Request Rejected';
      messageEn = `Your profile update request has been rejected.`;
      titleSi = 'පැතිකඩ ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී';
      titleTa = 'சுயவிவர கோரிக்கை நிராகரிக்கப்பட்டது';
      messageSi = `ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී.`;
      messageTa = `உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.`;
      break;

    default:
      titleEn = title;
      messageEn = message;
      
      if (cleanKey.includes('profile') || cleanTitle.includes('profile') || cleanTitle.includes('පැතිකඩ') || cleanTitle.includes('சுயவிவரம்')) {
        if (cleanTitle.includes('approved') || cleanTitle.includes('අනුමත')) {
          titleSi = 'පැතිකඩ ඉල්ලීම අනුමත කරන ලදී';
        } else if (cleanTitle.includes('rejected') || cleanTitle.includes('ප්‍රතික්ෂේප')) {
          titleSi = 'පැතිකඩ ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී';
        } else {
          titleSi = 'පැතිකඩ ඉල්ලීම';
        }
        titleTa = 'சுயவிவர கோரிக்கை';
      } else {
        titleSi = title;
        titleTa = title;
      }
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

/**
 * Notify all users assigned to a specific role
 */
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

    // Get all users who have this role
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

    // Get role name
    const { data: role } = await supabase
      .from('roles')
      .select('role_name')
      .eq('id', roleId)
      .single();

    const roleName = role?.role_name || 'your role';

    // Send notification to every user with this role
    const notificationPromises = users.map((user) => {
      return createNotification({
        userId: user.id,

        notificationKey: 'privileges_updated',

        title: 'System Privileges Updated',

        message:
          `Your ${roleName} role permissions have been updated by the Administrator.`,

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


/**
 * Notify one specific user about a privilege change
 */
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

      message:
        'Your individual system privileges have been updated by the Administrator.',

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
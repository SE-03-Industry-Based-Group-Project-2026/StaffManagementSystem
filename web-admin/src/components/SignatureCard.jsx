import React from 'react';

export default function SignatureCard({ title, positionKey, image, lang, t }) {
  const positionsMap = {
    chairman: {
      en: 'Chairman',
      si: 'සභාපති',
      ta: 'தலைவர்'
    },
    subject_officer: {
      en: 'Subject Officer',
      si: 'විෂය භාර නිලධාරී',
      ta: 'விடய அதிகாரி'
    },
    cc_officer: {
      en: 'CC Officer',
      si: 'සම්බන්ධීකරණ නිලධාරී',
      ta: 'ஒருங்கிணைப்பாளர்'
    },
    secretary: {
      en: 'Secretary',
      si: 'ලේකම්',
      ta: 'செயலாளர்'
    }
  };

  const institutionMap = {
    en: 'Welivitiya Divithura Pradeshiya Sabha',
    si: 'වැලිවිටිය දිවිතුර ප්‍රාදේශීය සභාව',
    ta: 'வெலிவிட்டிக திவிதுர பிரதேச சபை'
  };

  const currentLang = lang || 'en';
  

  const normalizedKey = positionKey ? String(positionKey).toLowerCase().replace(/\s+/g, '_') : '';
  const posObj = positionsMap[normalizedKey] || positionsMap[positionKey] || { 
    en: positionKey || '', 
    si: positionKey || '', 
    ta: positionKey || '' 
  };
  
  const displayPosition = posObj[currentLang] || posObj.en;
  const displayInstitution = institutionMap[currentLang] || institutionMap.en;

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 14,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 13.5 }}>
          {title}
        </div>

        {image ? (
          <img
            src={image}
            alt={title}
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextElementSibling) {
                e.target.nextElementSibling.style.display = 'flex';
              }
            }}
            style={{
              width: '100%',
              height: 80,
              objectFit: 'contain',
              background: '#fafafa',
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: 6
            }}
          />
        ) : null}

        <div
          style={{
            height: 80,
            display: image ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #d1d5db',
            borderRadius: 8,
            color: '#6b7280',
            fontSize: 13
          }}
        >
          {t
            ? t('signature_not_available') || 'Signature not available'
            : 'Signature not available'}
        </div>
      </div>

      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #e5e7eb', textAlign: 'center' }}>
        {displayPosition && (
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
            {displayPosition}
          </div>
        )}
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {displayInstitution}
        </div>
      </div>
    </div>
  );
}
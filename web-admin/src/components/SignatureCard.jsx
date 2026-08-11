import React from 'react';

export default function SignatureCard({ title, image, t }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 14,
        background: '#fff'
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        {title}
      </div>

      {image ? (
        <img
          src={image}
          alt={title}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
          style={{
            width: '100%',
            height: 90,
            objectFit: 'contain',
            background: '#fafafa',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: 8
          }}
        />
      ) : null}

      <div
        style={{
          height: 90,
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
  );
}
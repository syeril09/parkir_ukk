import React from 'react';

export default function QRISPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ color: '#00897b', marginBottom: '20px' }}>
          PEMBAYARAN PARKIR
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Scan QR Code DANA</h2>
          <img
            src="/qris-dana.png"
            alt="QRIS DANA"
            style={{
              maxWidth: '250px',
              width: '100%',
              borderRadius: '8px',
              border: '2px solid #00897b'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            📱 Cara Pembayaran:
          </p>
          <ol style={{
            textAlign: 'left',
            fontSize: '14px',
            color: '#555',
            lineHeight: '1.6'
          }}>
            <li>Buka aplikasi DANA di ponsel Anda</li>
            <li>Pilih menu "Scan" atau "Bayar"</li>
            <li>Scan QR code di atas</li>
            <li>Masukkan nominal pembayaran</li>
            <li>Konfirmasi pembayaran</li>
          </ol>
        </div>

        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '15px',
          borderRadius: '5px',
          border: '1px solid #4caf50'
        }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32', margin: '0' }}>
            Nomor DANA: +62 821 4194 5168
          </p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: '#00897b',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🖨️ Print QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
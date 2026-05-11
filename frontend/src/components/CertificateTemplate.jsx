import { forwardRef } from 'react';
import { QRCodeSVG } from "qrcode.react";

/**
 * CertificateTemplate — A professional, printable document for land ownership.
 * Wrapped in forwardRef to allow html2canvas to capture it from the parent.
 */
const CertificateTemplate = forwardRef(({ parcel, user }, ref) => {
  return (
    <div className="absolute inset-0 -z-10 opacity-0 pointer-events-none overflow-hidden h-0">
      <div 
        ref={ref}
        style={{ 
          backgroundColor: '#ffffff', 
          borderColor: '#d97706', 
          color: '#111827',
          fontFamily: 'Georgia, "Times New Roman", serif', /* Hardcoded to beat Tailwind resets */
          lineHeight: '1.5'
        }}
        className="w-[794px] h-[1123px] p-16 relative flex flex-col items-center border-[12px] border-double"
      >
        {/* Traditional Watermark & Border - Removed Tailwind color class to prevent OKLCH crash */}
        <div className="absolute inset-4 border-2 pointer-events-none" style={{ borderColor: '#fcd34d' }} />
        
        <div className="flex flex-col items-center w-full space-y-10 pt-8">
          <div className="flex justify-between w-full px-10">
            <div className="text-left" style={{ lineHeight: '1.2' }}>
              <p className="text-[10px] uppercase font-bold tracking-widest m-0" style={{ color: '#b45309' }}>BhuChain Network</p>
              <p className="text-xs font-black m-0" style={{ color: '#111827' }}>Digital Property Registry</p>
            </div>
            <div className="text-right" style={{ lineHeight: '1.2' }}>
              <p className="text-[10px] uppercase font-bold tracking-widest m-0" style={{ color: '#b45309' }}>Immutable Ledger Record</p>
              <p className="text-xs font-black m-0" style={{ color: '#111827' }}>Record ID: #{parcel?.id || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-5 text-center pt-4">
            <h1 className="text-5xl font-black tracking-tighter m-0" style={{ color: '#92400e', lineHeight: '1' }}>CERTIFICATE OF OWNERSHIP</h1>
            <div className="w-48 h-1 mx-auto" style={{ backgroundColor: '#d97706' }} />
            <p className="text-xl font-medium uppercase tracking-widest italic m-0" style={{ color: '#6b7280' }}>Property Verification Document</p>
          </div>

          <div className="w-full px-16 space-y-12 pt-8 text-lg">
            <p className="text-center m-0" style={{ color: '#374151', lineHeight: '1.6' }}>
              This is to certify that the digital asset described below has been successfully indexed and secured on the <strong>BhuChain Hybrid Blockchain Ledger</strong>.
            </p>
            
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <p className="text-xs uppercase font-bold m-0" style={{ color: '#b45309' }}>Proprietor Name</p>
                  <p className="text-2xl font-black border-b-2 pb-2 m-0 mt-1" style={{ borderColor: '#f3f4f6', color: '#111827' }}>{user?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold m-0" style={{ color: '#b45309' }}>Registered Address</p>
                  <p className="text-xl font-bold border-b-2 pb-2 m-0 mt-1" style={{ borderColor: '#f3f4f6', color: '#111827' }}>{parcel?.location}</p>
                </div>
                <div>
                  <p className="text-xs uppercase font-bold m-0" style={{ color: '#b45309' }}>Total Registered Area</p>
                  <p className="text-3xl font-black m-0 mt-1" style={{ color: '#111827' }}>{parcel?.area} <span className="text-lg" style={{ color: '#6b7280' }}>Square Meters</span></p>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center space-y-4">
                 <div className="p-4 rounded-3xl border-2" style={{ backgroundColor: '#f9fafb', borderColor: '#fde68a' }}>
                    {parcel && (
                      <QRCodeSVG 
                        value={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS || '0x40bFBa6ef409Ddfd00c810a6764b808758042Dfd'}?a=${parcel.id}`} 
                        size={140} 
                      />
                    )}
                 </div>
                 <p className="text-[10px] font-black uppercase m-0" style={{ color: '#b45309' }}>Scan to Verify Blockchain Authenticity</p>
              </div>
            </div>

            <div className="pt-10 space-y-3 border-t-2" style={{ borderColor: '#f9fafb' }}>
              <p className="text-xs font-medium m-0" style={{ color: '#9ca3af' }}>Digital Signature & Blockchain Hash:</p>
              <p className="font-mono text-[9px] break-all p-4 rounded-xl m-0" style={{ backgroundColor: '#f9fafb', color: '#4b5563', border: '1px solid #f3f4f6' }}>
                {parcel?.owner || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}::HASH_SHA256::{parcel?.id}
              </p>
            </div>

            <div className="flex justify-between pt-16">
              <div className="text-center border-t w-48 pt-2" style={{ borderColor: '#d1d5db' }}>
                 <p className="text-xs font-black m-0" style={{ color: '#111827' }}>Authorized Registrar</p>
                 <p className="text-[10px] uppercase tracking-widest m-0" style={{ color: '#9ca3af' }}>Verification Node</p>
              </div>
              <div className="relative">
                 <div 
                  className="absolute -top-16 -left-8 w-24 h-24 border-4 rounded-full flex items-center justify-center rotate-12 font-black text-[8px] uppercase text-center leading-none"
                  style={{ borderColor: 'rgba(30, 64, 175, 0.2)', color: 'rgba(30, 64, 175, 0.2)' }}
                >
                   BhuChain<br/>Verified<br/>Asset
                 </div>
              </div>
              <div className="text-center border-t w-48 pt-2" style={{ borderColor: '#d1d5db' }}>
                 <p className="text-xs font-black m-0" style={{ color: '#111827' }}>Platform Protocol</p>
                 <p className="text-[10px] uppercase tracking-widest m-0" style={{ color: '#9ca3af' }}>Consensus Layer</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5" style={{ backgroundColor: '#d97706' }} />
      </div>
    </div>
  );
});

export default CertificateTemplate;

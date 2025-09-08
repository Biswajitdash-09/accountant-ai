import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat } from '@zxing/library';

type ScanType = 'receipt' | 'upi' | 'spreadsheet';

interface ParsedReceipt {
  type: 'receipt';
  items: { description: string; amount: number }[];
  total: number;
  raw_text: string;
}

interface ParsedUPI {
  type: 'upi';
  name: string | null;
  upiId: string | null;
  amount: string | null;
  note: string | null;
  currency: string;
}

interface ParsedSpreadsheet {
  type: 'spreadsheet';
  headers: string[];
  rows: string[][];
  raw_text: string;
}

type ParsedData = ParsedReceipt | ParsedUPI | ParsedSpreadsheet | { raw: string };

interface ScanHistory {
  type: ScanType;
  raw: string;
  parsed: ParsedData;
  timestamp: string;
}

const BarcodeScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');
  const [scanType, setScanType] = useState<ScanType>('receipt');
  const [history, setHistory] = useState<ScanHistory[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader(undefined, {
      delayBetweenScanAttempts: 300,
    });

    const stored = localStorage.getItem('scan_history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }

    return () => stopScanning();
  }, []);

  const startScanning = async () => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setIsScanning(true);
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      if (devices.length === 0) {
        alert('No video devices found.');
        setIsScanning(false);
        return;
      }

      const selectedDeviceId = devices[0].deviceId;

      controlsRef.current = await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            setLastResult(text);
            processResult(text);
            stopScanning();
          }

          if (error && error.name !== 'NotFoundException') {
            console.error('Decode error:', error);
          }
        }
      ) as unknown as { stop: () => void };
    } catch (err) {
      console.error('Failed to start scanner:', err);
      alert('Camera access failed.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }
    setIsScanning(false);
  };

  const processResult = (raw: string) => {
    let parsed: ParsedData = { raw };

    if (scanType === 'receipt') parsed = parseReceipt(raw);
    else if (scanType === 'upi') parsed = parseUPI(raw);
    else if (scanType === 'spreadsheet') parsed = parseSpreadsheet(raw);

    const scan: ScanHistory = {
      type: scanType,
      raw,
      parsed,
      timestamp: new Date().toISOString(),
    };

    const updated = [scan, ...history];
    setHistory(updated);
    localStorage.setItem('scan_history', JSON.stringify(updated));

    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const shouldRedirect = window.confirm(`Open this link in a new tab?\n\n${raw}`);
      if (shouldRedirect) {
        window.open(raw, '_blank');
      }
    }
  };

  const parseReceipt = (text: string): ParsedReceipt => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const items: { description: string; amount: number }[] = [];
    let total = 0;

    for (const line of lines) {
      const match = line.match(/([^\d]*)(\d+\.?\d*)/);
      if (match) {
        const amount = parseFloat(match[2]);
        if (amount > 0) {
          items.push({ description: match[1].trim(), amount });
          total += amount;
        }
      }
    }

    return { type: 'receipt', items, total, raw_text: text };
  };

  const parseUPI = (text: string): ParsedUPI | { raw: string } => {
    const match = text.match(/upi:\/\/pay\?(.+)/i);
    if (match) {
      const params = new URLSearchParams(match[1]);
      return {
        type: 'upi',
        name: params.get('pn'),
        upiId: params.get('pa'),
        amount: params.get('am'),
        note: params.get('tn'),
        currency: params.get('cu') || 'INR',
      };
    }
    return { raw: text };
  };

  const parseSpreadsheet = (text: string): ParsedSpreadsheet | { raw: string } => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) return { raw: text };

    const rows = lines.map(line => line.split(/[,|\t;]/).map(cell => cell.trim()));
    const headers = rows[0];
    const dataRows = rows.slice(1);

    return {
      type: 'spreadsheet',
      headers,
      rows: dataRows,
      raw_text: text
    };
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 20 }}>
      <h2>Barcode / QR Scanner</h2>

      <div style={{ marginBottom: 15 }}>
        <label><strong>Select Scan Type:</strong></label><br />
        <select value={scanType} onChange={e => setScanType(e.target.value as ScanType)} style={{ padding: 8 }}>
          <option value="receipt">Receipt</option>
          <option value="upi">UPI Payment</option>
          <option value="spreadsheet">Spreadsheet</option>
        </select>
      </div>

      <div style={{ margin: '20px 0' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '300px',
            background: '#eee',
            borderRadius: 8,
            display: isScanning ? 'block' : 'none',
          }}
          muted
          playsInline
        />
        {!isScanning && (
          <div
            style={{
              width: '100%',
              height: '300px',
              background: '#eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              color: '#999',
            }}
          >
            Camera preview will appear here
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {!isScanning ? (
          <button onClick={startScanning} style={buttonStyle}>Start Scanning</button>
        ) : (
          <button onClick={stopScanning} style={{ ...buttonStyle, background: '#dc3545' }}>Stop Scanning</button>
        )}
      </div>

      {lastResult && history[0] && (
        <div style={{ marginTop: 20 }}>
          <h4>Last Scan:</h4>
          {history[0].parsed && 'type' in history[0].parsed && history[0].parsed.type === 'spreadsheet' ? (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  {(history[0].parsed as ParsedSpreadsheet).headers.map((h, i) => (
                    <th key={i} style={cellStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(history[0].parsed as ParsedSpreadsheet).rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={cellStyle}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <pre style={resultBox}>{JSON.stringify(history[0]?.parsed, null, 2)}</pre>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h4>Scan History</h4>
          <ul>
            {history.map((scan, idx) => (
              <li key={idx} style={{ marginBottom: 10 }}>
                <strong>{scan.type.toUpperCase()}</strong> - {new Date(scan.timestamp).toLocaleString()}
                <pre style={resultBox}>{JSON.stringify(scan.parsed, null, 2)}</pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
};

const resultBox: React.CSSProperties = {
  background: '#f5f5f5',
  padding: 10,
  borderRadius: 6,
  fontFamily: 'monospace',
  fontSize: 12,
  overflowX: 'auto',
};

const cellStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '6px 10px',
  textAlign: 'left',
};

export default BarcodeScanner;
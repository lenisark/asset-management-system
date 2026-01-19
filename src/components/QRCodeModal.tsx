import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import type { Asset } from '../types';
import { X, Download, QrCode as QRIcon } from 'lucide-react';

interface QRCodeModalProps {
  asset: Asset;
  onClose: () => void;
}

const QRCodeModal = ({ asset, onClose }: QRCodeModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      // QR 코드 데이터: 자산 ID와 정보를 JSON으로 인코딩
      const qrData = JSON.stringify({
        id: asset.id,
        name: asset.name,
        serialNumber: asset.serialNumber,
        category: asset.category,
      });

      QRCode.toCanvas(
        canvasRef.current,
        qrData,
        {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) {
            console.error('QR Code generation error:', error);
          } else {
            setQrGenerated(true);
          }
        }
      );
    }
  }, [asset]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${asset.serialNumber}-QR.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR 코드 - ${asset.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .qr-container {
              text-align: center;
              page-break-inside: avoid;
            }
            img {
              max-width: 300px;
              margin: 20px 0;
            }
            .info {
              margin: 10px 0;
            }
            .label {
              font-weight: bold;
              font-size: 14px;
            }
            .value {
              font-size: 16px;
              margin-bottom: 10px;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${asset.name}</h1>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="info">
              <div class="label">시리얼 번호</div>
              <div class="value">${asset.serialNumber}</div>
            </div>
            <div class="info">
              <div class="label">카테고리</div>
              <div class="value">${asset.category}</div>
            </div>
            <div class="info">
              <div class="label">제조사</div>
              <div class="value">${asset.manufacturer}</div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <QRIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">QR 코드</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* 자산 정보 */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">{asset.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">시리얼:</span> {asset.serialNumber}</p>
              <p><span className="font-medium">카테고리:</span> {asset.category}</p>
              <p><span className="font-medium">제조사:</span> {asset.manufacturer}</p>
            </div>
          </div>

          {/* QR 코드 */}
          <div className="flex justify-center mb-6">
            <canvas ref={canvasRef} className="border-2 border-gray-200 rounded-lg" />
          </div>

          {/* 버튼 */}
          {qrGenerated && (
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                다운로드
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                인쇄
              </button>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center mt-4">
            * QR 코드를 스캔하면 자산 정보를 확인할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

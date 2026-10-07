import React, { useState } from 'react';
import { Turbomachine } from '../types/turbomachine';
import { publishReportToCloud } from '../services/firebase';
import { Share2, Copy, Check, ExternalLink, X, ShieldCheck, Globe, Loader2 } from 'lucide-react';

interface ShareReportModalProps {
  turbomachine: Turbomachine;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  turbomachine,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>(
    `Reporte Didáctico de Órbitas - ${turbomachine.fullName}`
  );

  const handleGenerateLink = async () => {
    setLoading(true);
    try {
      const result = await publishReportToCloud(turbomachine, customTitle);
      setShareUrl(result.shareUrl);
    } catch (err) {
      console.error('Error generating link:', err);
      // Fallback local share URL if offline
      const fallbackUrl = `${window.location.origin}${window.location.pathname}?report=local-${turbomachine.id}`;
      setShareUrl(fallbackUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-wide">
              Generar Enlace Abierto para Cliente
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Título del Reporte Compartido:</label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-medium"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Acceso de Cliente Seguro (Solo Visualización)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Cualquier usuario con este enlace podrá abrir el informe e interactuar completamente con los apoyos, cambiar de canal, realizar sobreposición de órbitas y leer los comentarios. <strong>No podrán editar, modificar valores ni cargar imágenes</strong>.
            </p>
          </div>

          {!shareUrl ? (
            <button
              onClick={handleGenerateLink}
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publicando en Firebase...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Generar Enlace Compartible</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <label className="block text-slate-700 font-semibold">Enlace generado listo para compartir:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded font-mono text-[11px] bg-slate-50 text-slate-800 select-all"
                />
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Probar vista de cliente en nueva pestaña</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Turbomachine } from '../types/turbomachine';
import { 
  exportDatabaseToJson, 
  importDatabaseFromJson, 
  exportSingleTurbomachine,
  DEFAULT_DB_FILENAME 
} from '../services/storageService';
import { 
  FolderSync, 
  Download, 
  Upload, 
  Check, 
  X, 
  ShieldCheck, 
  FileCode, 
  AlertCircle,
  HelpCircle,
  HardDrive
} from 'lucide-react';

interface SharePointSyncModalProps {
  turbines: Turbomachine[];
  currentTurbomachine: Turbomachine;
  onUpdateTurbines: (updated: Turbomachine[]) => void;
  onOpenExportHtml: () => void;
  onClose: () => void;
}

export const SharePointSyncModal: React.FC<SharePointSyncModalProps> = ({
  turbines,
  currentTurbomachine,
  onUpdateTurbines,
  onOpenExportHtml,
  onClose,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExportAll = () => {
    try {
      exportDatabaseToJson(turbines, DEFAULT_DB_FILENAME);
      setSuccessMessage(`Base de datos exportada como "${DEFAULT_DB_FILENAME}". Cópiala o guárdala en tu carpeta de SharePoint.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (e) {
      setErrorMessage('Error al exportar la base de datos.');
    }
  };

  const handleExportCurrent = () => {
    try {
      exportSingleTurbomachine(currentTurbomachine);
      setSuccessMessage(`Turbomáquina "${currentTurbomachine.name}" exportada correctamente.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (e) {
      setErrorMessage('Error al exportar la turbomáquina.');
    }
  };

  const handleImportJson = async () => {
    try {
      setErrorMessage(null);
      const loaded = await importDatabaseFromJson();
      onUpdateTurbines(loaded);
      setSuccessMessage(`¡Base de datos cargada con éxito! Se cargaron ${loaded.length} máquina(s).`);
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (e: any) {
      if (e?.message !== 'No se seleccionó ningún archivo.') {
        setErrorMessage(e?.message || 'Error al importar archivo JSON.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto select-none">
      <div className="bg-white border border-slate-300 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderSync className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Centralización en SharePoint / Disco Local
              </h3>
              <p className="text-[11px] text-slate-400">
                100% Local y Confidencial · Sin conexión a servidores externos
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Security Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Garantía de Confidencialidad y Seguridad de TI</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-800">
              Esta aplicación <strong>no transmite ningún dato por internet</strong>. La base de datos se guarda en un archivo <code>.json</code> que puedes almacenar en tu biblioteca compartida de <strong>SharePoint</strong> o en tu disco local.
            </p>
          </div>

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 p-2.5 rounded flex items-start gap-2">
              <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span className="text-[11px]">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="text-[11px]">{errorMessage}</span>
            </div>
          )}

          {/* Actions Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Action 1: Export DB */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 flex flex-col justify-between hover:border-blue-400 transition-colors">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Guardar a SharePoint (JSON)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                  Descarga la base de datos completa ({turbines.length} máquinas) para guardarla o reemplazarla en tu carpeta sincronizada de SharePoint.
                </p>
              </div>
              <button
                onClick={handleExportAll}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Base de Datos</span>
              </button>
            </div>

            {/* Action 2: Import DB */}
            <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 flex flex-col justify-between hover:border-emerald-400 transition-colors">
              <div>
                <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Cargar desde SharePoint (JSON)</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-normal mb-3">
                  Abre el archivo <code>.json</code> guardado en SharePoint para actualizar o cargar las mediciones en este equipo.
                </p>
              </div>
              <button
                onClick={handleImportJson}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Seleccionar Archivo JSON</span>
              </button>
            </div>
          </div>

          {/* Action 3: Export Interactive HTML Report */}
          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50/60 flex items-center justify-between">
            <div>
              <div className="font-bold text-purple-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-purple-700" />
                <span>Reporte Interactivo Autónomo (.html)</span>
              </div>
              <p className="text-[11px] text-purple-800 mt-0.5">
                Genera un informe interactivo de <strong>{currentTurbomachine.name}</strong> listo para entregar a clientes o jefatura sin que requieran instalar nada.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenExportHtml();
              }}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded shrink-0 transition-colors shadow-xs ml-3"
            >
              Exportar HTML
            </button>
          </div>

          {/* SharePoint Quick Guide */}
          <div className="border-t border-slate-200 pt-3">
            <h4 className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>¿Cómo funciona con SharePoint?</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 leading-relaxed">
              <li>En tu sitio de SharePoint, haz clic en el botón <strong>"Sincronizar"</strong> para tener la carpeta en tu Explorador de Windows.</li>
              <li>Guarda allí el archivo <code>base_datos_turbogeneradores.json</code>.</li>
              <li>Cualquier analista puede abrir la app y cargar ese archivo para ver o actualizar las mediciones compartidas.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Almacenamiento en Memoria Local Activo</span>
          </div>
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

/**
 * storageService.ts
 * Servicio de almacenamiento 100% Local y compatible con SharePoint / Disco Corporativo.
 * No utiliza Firebase ni envía datos a la nube externa (cumple normativas de confidencialidad).
 */

import { Turbomachine, PeriodReport } from '../types/turbomachine';
import { INITIAL_TURBOMACHINES } from '../data/initialData';

export const LOCAL_STORAGE_KEY = 'turbomachine_orbits_local_db_v1';
export const DEFAULT_DB_FILENAME = 'base_datos_turbogeneradores.json';

/**
 * Carga todas las turbomáquinas guardadas en el almacenamiento local del navegador.
 * Si no existen registros previos, retorna los datos iniciales predeterminados (TG4).
 */
export function loadAllTurbomachines(): Turbomachine[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error al leer de localStorage:', error);
  }
  return INITIAL_TURBOMACHINES;
}

/**
 * Guarda el arreglo completo de turbomáquinas en el almacenamiento local privado.
 */
export function saveAllTurbomachines(turbines: Turbomachine[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(turbines, null, 2));
  } catch (error) {
    console.error('Error al guardar en localStorage:', error);
  }
}

/**
 * Descarga la base de datos completa de turbomáquinas en un archivo JSON local.
 * Este archivo es el que se ubica en la carpeta compartida de SharePoint.
 */
export function exportDatabaseToJson(
  turbines: Turbomachine[],
  filename: string = DEFAULT_DB_FILENAME
): void {
  const jsonContent = JSON.stringify(turbines, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Permite seleccionar un archivo JSON (de SharePoint o disco) y cargarlo en la aplicación.
 */
export function importDatabaseFromJson(): Promise<Turbomachine[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';

    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        reject(new Error('No se seleccionó ningún archivo.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          
          let resultList: Turbomachine[] = [];

          if (Array.isArray(parsed)) {
            resultList = parsed;
          } else if (parsed && typeof parsed === 'object' && parsed.id && parsed.name) {
            // Si el archivo contiene una sola turbomáquina, la convertimos en arreglo
            resultList = [parsed as Turbomachine];
          } else {
            throw new Error('El formato del archivo JSON no corresponde a una base de datos de turbomáquinas.');
          }

          // Guardamos en localStorage automáticamente
          saveAllTurbomachines(resultList);
          resolve(resultList);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error('Error al leer el archivo.'));
      reader.readAsText(file);
    };

    input.click();
  });
}

/**
 * Exporta una sola turbomáquina con todas sus mediciones y fotos a un archivo JSON.
 */
export function exportSingleTurbomachine(turbomachine: Turbomachine): void {
  const filename = `Turbomaquina_${turbomachine.tag || turbomachine.name}_${new Date().toISOString().slice(0, 10)}.json`;
  const jsonContent = JSON.stringify(turbomachine, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

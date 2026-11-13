# Guía de Uso, Pruebas y Montaje en SharePoint
## Aplicativo: Reporte de Órbitas Turbogeneradores SW (100% Local & Confidencial)

Esta aplicación ha sido adaptada para funcionar **100% desconectada de la nube (sin Firebase ni bases de datos externas)**, cumpliendo estrictamente con las políticas corporativas de confidencialidad y seguridad de datos de TI.

---

### 1. Cómo Probar el Aplicativo en este PC

Tienes dos formas directas de probarlo:

#### Opción A: Probar en Modo Desarrollo (Servidor Local)
El servidor ya se encuentra encendido y corriendo en este PC:
- Abre tu navegador (Edge o Chrome) e ingresa a: **[http://localhost:3000](http://localhost:3000)**
- Si realizas cualquier cambio en el código fuente (`src/`), la pantalla se actualizará automáticamente.

#### Opción B: Probar la Versión Compilada Standalone (Como se verá en el PC final)
1. Ve a la carpeta del proyecto en el Explorador de Windows:
   `C:\Users\Condicion\Desktop\Proyectos APK SW\Reportes-Turbogeneradores-SW`
2. Haz doble clic en el archivo:
   👉 **`Iniciar_App_Turbogeneradores.bat`**
3. El aplicativo se abrirá en **Modo Aplicación de Escritorio** (en una ventana limpia sin barras de navegación).

---

### 2. Estructura del Proyecto (Fácil de entender y modificar)

El código está organizado de manera modular:

```text
Reportes-Turbogeneradores-SW/
├── Iniciar_App_Turbogeneradores.bat  <-- Lanzador de escritorio para Windows
├── dist/                             <-- Paquete compilado listo para copiar a SharePoint / USB
│   ├── Abrir_Aplicativo.bat          <-- Lanzador dentro de la carpeta distribuible
│   ├── index.html                    <-- Archivo principal de la aplicación
│   └── assets/                       <-- Código compilado y estilos
│
├── src/                              <-- CÓDIGO FUENTE (aquí haces los cambios futuros)
│   ├── App.tsx                       <-- Orquestador principal de la app y modales
│   ├── services/
│   │   └── storageService.ts         <-- Servicio de guardado/carga local y JSON de SharePoint
│   ├── components/                   <-- Componentes visuales:
│   │   ├── PowerBiHeader.tsx         <-- Barra superior tipo Power BI y botones de sincronización
│   │   ├── PowerBiDualView.tsx       <-- Vista dual comparativa de períodos y apoyos
│   │   ├── OrbitVisualizer.tsx       <-- Renderizado vectorial de órbitas X-Y y ondas
│   │   ├── SharePointSyncModal.tsx   <-- Modal para descargar/cargar JSON desde SharePoint
│   │   ├── ExportModal.tsx           <-- Generador del reporte interactivo HTML offline
│   │   ├── DidacticOrbitGuide.tsx    <-- Catálogo didáctico de fallas y órbitas
│   │   └── HistoricalTimeline.tsx    <-- Histórico y tendencias
│   ├── data/
│   │   └── initialData.ts            <-- Datos iniciales predeterminados (TG4)
│   └── types/
│       └── turbomachine.ts           <-- Definición de datos (apoyos, canales, criticidad)
```

---

### 3. Paso a Paso: Cómo Montarlo en el Sitio de SharePoint

Para que cualquier usuario de la empresa pueda acceder a la información desde su laptop sin instalar nada:

#### Paso 1: Crear la carpeta en SharePoint
1. Entra a tu sitio corporativo de **SharePoint** en el navegador.
2. Ve a la sección **Documentos** (o la biblioteca de tu área de Mantenimiento / Confiabilidad).
3. Crea una carpeta llamada, por ejemplo: `Turbogeneradores - Monitoreo de Orbitas`.

#### Paso 2: Sincronizar la carpeta con OneDrive (Recomendado)
1. Dentro de esa carpeta en SharePoint, haz clic en el botón superior **"Sincronizar" (Sync)**.
2. Windows conectará esa carpeta a tu Explorador de archivos (aparecerá en la barra lateral con el icono del edificio corporativo).

#### Paso 3: Copiar los archivos a la carpeta de SharePoint
Copia el contenido de la carpeta **`dist/`** dentro de esa carpeta de SharePoint:
- `index.html`
- `Abrir_Aplicativo.bat`
- La carpeta `assets/`
- *(Opcional)* El archivo `base_datos_turbogeneradores.json` con los datos iniciales.

#### Paso 4: ¿Cómo lo usa cualquier persona del equipo?
1. El usuario abre la carpeta sincronizada en su computadora.
2. Hace doble clic en **`Abrir_Aplicativo.bat`** (o en `index.html`).
3. El aplicativo abre al instante.
4. Para ver las mediciones actualizadas:
   - Hace clic en **"SharePoint / Base de Datos"** (botón azul superior).
   - Elige **"Cargar desde SharePoint (JSON)"** y selecciona el archivo `base_datos_turbogeneradores.json`.
   - Cuando termine de editar o agregar nuevas campañas, hace clic en **"Guardar a SharePoint (JSON)"**.

---

### 4. Cómo Aplicar Cambios Futuros al Aplicativo

Si en el futuro deseas agregar una nueva gráfica, cambiar colores o modificar fórmulas:

1. **En este PC de desarrollo:**
   - Haces la modificación en el archivo correspondiente dentro de `src/`.
2. **Compilar la nueva versión:**
   - Abres la terminal en esta carpeta y ejecutas:
     ```powershell
     node ./node_modules/vite/bin/vite.js build
     ```
   - Esto genera la versión actualizada en la carpeta `dist/` en solo unos segundos.
3. **Actualizar en SharePoint:**
   - Simplemente reemplazas los archivos dentro de la carpeta de SharePoint por los nuevos de `dist/`.
   - **Tus datos nunca se pierden**, porque las mediciones confidenciales residen en el archivo `base_datos_turbogeneradores.json` y en la memoria del navegador.

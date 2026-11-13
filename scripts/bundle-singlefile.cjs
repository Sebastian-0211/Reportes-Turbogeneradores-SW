const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html no existe. Ejecuta el build primero.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf-8');

// 1. Buscar archivo CSS e incrustar con función de reemplazo segura (evita conflictos con '$')
const cssMatch = html.match(/<link rel="stylesheet"[^>]+href=["'](\.\/assets\/[^"']+\.css)["'][^>]*>/);
if (cssMatch) {
  const cssRelativePath = cssMatch[1].replace(/^\.\//, '');
  const cssFilePath = path.join(distDir, cssRelativePath);
  if (fs.existsSync(cssFilePath)) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
    html = html.replace(cssMatch[0], () => `<style>\n${cssContent}\n</style>`);
    console.log(`✓ CSS embebido correctamente: ${cssRelativePath}`);
  }
}

// 2. Buscar archivo JS e incrustar con función de reemplazo segura
const jsMatch = html.match(/<script type="module"[^>]+src=["'](\.\/assets\/[^"']+\.js)["'][^>]*><\/script>/);
if (jsMatch) {
  const jsRelativePath = jsMatch[1].replace(/^\.\//, '');
  const jsFilePath = path.join(distDir, jsRelativePath);
  if (fs.existsSync(jsFilePath)) {
    let jsContent = fs.readFileSync(jsFilePath, 'utf-8');
    // Escapar etiquetas </script> si existen dentro de literales de cadena
    jsContent = jsContent.replace(/<\/script>/gi, '<\\/script>');
    // CRÍTICO: Usar función () => ... para evitar que los caracteres especiales '$&' de minificación se interpreten como sustituciones
    html = html.replace(jsMatch[0], () => `<script type="module">\n${jsContent}\n</script>`);
    console.log(`✓ JS embebido correctamente: ${jsRelativePath}`);
  }
}

// Guardar el archivo definitivo tanto en dist/index.html como en la raíz
fs.writeFileSync(indexPath, html, 'utf-8');

const standalonePath = path.resolve(__dirname, '../Reporte_Turbogeneradores_Standalone.html');
fs.writeFileSync(standalonePath, html, 'utf-8');

console.log('✓ Archivos Standalone listos para doble clic:');
console.log('  -> ' + indexPath);
console.log('  -> ' + standalonePath);

# 📄 Configuración de Webhooks para Carga de Documentos

Esta aplicación ahora soporta el envío de archivos reales a través de webhooks cuando se cargan documentos.

## 🔧 Cómo funciona

### Webhooks de Chat
- **Formato**: JSON (application/json)
- **Contenido**: Mensaje de texto y metadatos de documentos seleccionados

### Webhooks de Carga de Documentos
- **Formato**: FormData (multipart/form-data)
- **Contenido**: 
  - `file`: El archivo real subido
  - `metadata`: JSON con información detallada del archivo

#### Metadatos Incluidos:

##### Información Básica del Archivo:
```json
{
  // Nombre del archivo como se guardará en el sistema
  "filename": "documento.pdf",
  
  // Nombre original del archivo subido por el usuario
  "originalName": "documento.pdf",
  
  // Tipo MIME del archivo
  "type": "application/pdf",
  
  // Tipo MIME específico del archivo
  "mimeType": "application/pdf",
  
  // Tamaño en bytes
  "size": 1048576,
  
  // Tamaño formateado para lectura humana
  "sizeFormatted": "1.00 MB",
  
  // Extensión del archivo
  "extension": "pdf",
  
  // Indicadores de tipo de archivo
  "isPDF": true,
  "isImage": false,
  "isText": false,
  "isDocument": true,
  
  // Marca de tiempo de la carga
  "timestamp": "2023-12-31T23:59:59.999Z",
  // Fecha y hora exacta de la subida
  "uploadedAt": "2023-12-31T23:59:59.999Z",
  
  // Identificador único del documento
  "documentId": "1672531200000",
  
  // Categoría del archivo
  "category": "pdf",
  
  // Última modificación del archivo original
  "lastModified": "2023-12-30T10:30:00.000Z",
  
  // Ruta relativa del archivo (para carga de directorios)
  "webkitRelativePath": "",

  // Información del usuario que subió el archivo
  "userId": "user123",
  "userRole": "admin",
  "userName": "Juan Pérez"
}
```

## 🚀 Configuración Rápida

### 1. Servidor de Prueba Local

```bash
# Instalar dependencias
npm install express multer

# Ejecutar el servidor de ejemplo
node webhook-server-example.js
```

El servidor estará disponible en `http://localhost:3001`

### 2. Configurar Webhook en la Aplicación

1. Abrir la aplicación y loguearse como Admin
2. Ir a **Settings** (⚙️) para abrir el Admin Panel
3. En la sección **Webhook Configuration**, hacer clic en **Add Webhook**
4. Configurar:
   - **Name**: "Local Upload Handler"
   - **Type**: "Upload"
   - **URL**: `http://localhost:3001/webhook/upload`
   - **Environment**: "Local"
   - **Active**: ✅ Activado

### 3. Probar la Funcionalidad

1. En la aplicación, hacer clic en el icono de documentos (📄)
2. Subir un archivo PDF, TXT, DOC o Excel
3. El archivo será enviado automáticamente al webhook configurado
4. Verificar en la consola del servidor que el archivo fue recibido

## 📋 Ejemplo de Respuesta del Servidor

Cuando se recibe un archivo, el servidor mostrará:

```
🔄 Webhook de carga recibido
📄 Información del archivo:
  - Nombre original: documento.pdf
  - Tipo MIME: application/pdf
  - Tamaño: 1048576 bytes
  - Tamaño formateado: 1.00 MB
  - Guardado como: file-1672531200000-123456789.pdf
  - Ruta completa: ./uploads/file-1672531200000-123456789.pdf
📋 Metadatos enriquecidos:
  - ID del documento: 1672531200000
  - Extensión: pdf
  - Categoría: pdf
  - Es PDF: true
  - Es imagen: false
  - Es documento: true
  - Timestamp: 2023-12-31T23:59:59.999Z
  - Última modificación: 2023-12-30T10:30:00.000Z
👤 Información del usuario:
  - ID de usuario: user123
  - Nombre: Juan Pérez
  - Rol: admin
🔍 Análisis del archivo:
  - Tipo detectado: Documento PDF
  - Procesamiento recomendado: OCR para extraer texto, Indexación para búsqueda
💾 Guardando en base de datos...
```

## 🔍 Procesamiento de Archivos

El servidor de ejemplo incluye puntos de extensión para:

- **OCR**: Extraer texto de PDFs
- **Análisis de contenido**: Procesar y categorizar documentos
- **Indexación**: Preparar documentos para búsqueda
- **Base de datos**: Almacenar metadatos y referencias

## 🛠 Personalización

### Filtros de Archivo

Modifica la función `fileFilter` en `webhook-server-example.js`:

```javascript
fileFilter: function (req, file, cb) {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  // ... resto de la lógica
}
```

### Límites de Tamaño

Ajusta el tamaño máximo en la configuración de multer:

```javascript
limits: {
  fileSize: 50 * 1024 * 1024 // 50MB máximo
}
```

### Procesamiento Personalizado

Extiende la función `processDocument()` para agregar tu lógica específica:

```javascript
function processDocument(file, metadata) {
  // Tu lógica personalizada aquí
  if (file.mimetype === 'application/pdf') {
    // Procesar PDF con OCR
    return extractTextFromPDF(file.path);
  }
  // ... otros tipos de archivo
}
```

## 🐞 Solución de Problemas

### Error: "Cannot find name 'FormData'"
- **Causa**: Entorno sin soporte para FormData
- **Solución**: Asegúrate de ejecutar en un navegador moderno

### Error: "CORS"
- **Causa**: Política de CORS del servidor
- **Solución**: Agregar headers CORS al servidor:

```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Error: "File too large"
- **Causa**: Archivo excede límite configurado
- **Solución**: Aumentar límite en servidor o comprimir archivo

## 📚 Recursos Adicionales

- [Multer Documentation](https://github.com/expressjs/multer)
- [FormData MDN Reference](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Express.js File Upload Guide](https://expressjs.com/en/resources/middleware/multer.html)

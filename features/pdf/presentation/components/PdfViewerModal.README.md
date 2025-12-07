# 📄 PdfViewerModal - Visor Modal de PDFs

Componente modal para visualizar documentos PDF con controles completos de navegación, zoom, rotación y descarga.

## 🎯 Características

- ✅ **Modal responsive** con soporte dark mode
- ✅ **Navegación entre páginas** con botones o teclado (← →)
- ✅ **Zoom** con botones o teclas (+/-)
- ✅ **Rotación** de 90° del documento
- ✅ **Modo pantalla completa**
- ✅ **Descarga directa** del PDF
- ✅ **Cierre** con ESC o botón X
- ✅ **Entrada directa** del número de página
- ✅ **Previene scroll** del body cuando está abierto

## 📦 Instalación

El componente ya está creado en:
```
features/pdf/presentation/components/PdfViewerModal.tsx
```

## 🚀 Uso Básico

### 1. Importar el componente

```tsx
import PdfViewerModal from "@/features/pdf/presentation/components/PdfViewerModal";
```

### 2. Crear el estado para el modal

```tsx
const [viewerModal, setViewerModal] = useState({
  isOpen: false,
  pdfUrl: "",
  fileName: "",
  title: ""
});
```

### 3. Función para abrir el modal

```tsx
const handleViewPdf = (pdf) => {
  setViewerModal({
    isOpen: true,
    pdfUrl: pdf.fileUrl,        // URL del PDF
    fileName: pdf.fileName,      // Nombre del archivo
    title: pdf.title            // Título a mostrar
  });
};
```

### 4. Renderizar el modal

```tsx
<PdfViewerModal
  isOpen={viewerModal.isOpen}
  onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
  pdfUrl={viewerModal.pdfUrl}
  fileName={viewerModal.fileName}
  title={viewerModal.title}
  onDownload={() => {
    // Lógica personalizada de descarga (opcional)
    downloadPdf(pdfId);
  }}
/>
```

## 📝 Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `isOpen` | `boolean` | ✅ | Controla si el modal está visible |
| `onClose` | `() => void` | ✅ | Función llamada al cerrar el modal |
| `pdfUrl` | `string` | ✅ | URL del PDF a mostrar |
| `fileName` | `string` | ❌ | Nombre del archivo (default: "documento.pdf") |
| `title` | `string` | ❌ | Título a mostrar en el header (default: "Visualizar PDF") |
| `onDownload` | `() => void` | ❌ | Función personalizada de descarga. Si no se provee, usa descarga directa |

## 🎮 Controles del Usuario

| Acción | Atajo de Teclado | Botón |
|--------|------------------|-------|
| Cerrar modal | `ESC` | ❌ |
| Página anterior | `←` | ◀️ |
| Página siguiente | `→` | ▶️ |
| Acercar zoom | `+` o `=` | 🔍+ |
| Alejar zoom | `-` | 🔍- |
| Rotar 90° | - | 🔄 |
| Pantalla completa | - | ⛶ |
| Descargar | - | 📥 |

## 💡 Ejemplos

### Ejemplo 1: Uso en Lista de Documentos

```tsx
"use client";

import { useState } from "react";
import PdfViewerModal from "@/features/pdf/presentation/components/PdfViewerModal";

export default function DocumentList() {
  const [documents] = useState([
    {
      id: "1",
      title: "Oficio 2025-001",
      fileUrl: "https://backend.com/files/oficio-001.pdf",
      fileName: "oficio-001.pdf"
    }
  ]);

  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: ""
  });

  const handleViewDocument = (doc) => {
    setViewerModal({
      isOpen: true,
      pdfUrl: doc.fileUrl,
      fileName: doc.fileName,
      title: doc.title
    });
  };

  return (
    <div>
      {documents.map((doc) => (
        <div key={doc.id}>
          <h3>{doc.title}</h3>
          <button onClick={() => handleViewDocument(doc)}>
            Ver PDF
          </button>
        </div>
      ))}

      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
        pdfUrl={viewerModal.pdfUrl}
        fileName={viewerModal.fileName}
        title={viewerModal.title}
      />
    </div>
  );
}
```

### Ejemplo 2: Con Hook usePdf

```tsx
"use client";

import { useState } from "react";
import { usePdf } from "@/features/pdf/hooks/usePdf";
import PdfViewerModal from "@/features/pdf/presentation/components/PdfViewerModal";

export default function PdfGallery() {
  const { pdfs, getPdfById, downloadPdf } = usePdf();
  
  const [selectedPdf, setSelectedPdf] = useState({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: "",
    pdfId: ""
  });

  const handleViewPdf = async (pdfId) => {
    try {
      const pdf = await getPdfById(pdfId);
      
      setSelectedPdf({
        isOpen: true,
        pdfUrl: pdf.fileUrl,
        fileName: pdf.fileName,
        title: pdf.title,
        pdfId: pdf.id
      });
    } catch (error) {
      console.error("Error al cargar PDF:", error);
    }
  };

  const handleDownload = async () => {
    if (selectedPdf.pdfId) {
      await downloadPdf(selectedPdf.pdfId);
    }
  };

  return (
    <div>
      {pdfs.map((pdf) => (
        <button key={pdf.id} onClick={() => handleViewPdf(pdf.id)}>
          {pdf.title}
        </button>
      ))}

      <PdfViewerModal
        isOpen={selectedPdf.isOpen}
        onClose={() => setSelectedPdf({ ...selectedPdf, isOpen: false })}
        pdfUrl={selectedPdf.pdfUrl}
        fileName={selectedPdf.fileName}
        title={selectedPdf.title}
        onDownload={handleDownload}
      />
    </div>
  );
}
```

### Ejemplo 3: Con useDocumento

```tsx
"use client";

import { useState } from "react";
import { useDocumento } from "@/features/pdf/hooks/useDocumento";
import PdfViewerModal from "@/features/pdf/presentation/components/PdfViewerModal";

export default function DocumentManager() {
  const { documentos, descargarDocumento } = useDocumento();
  
  const [viewerModal, setViewerModal] = useState({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: "",
    documentoId: ""
  });

  const handleViewDocumento = (doc) => {
    setViewerModal({
      isOpen: true,
      pdfUrl: doc.pdfUrl || `/api/documentos/${doc.id}/preview`,
      fileName: `${doc.tipo}_${doc.referencia}.pdf`,
      title: doc.asunto,
      documentoId: doc.id
    });
  };

  const handleDownload = async () => {
    if (viewerModal.documentoId) {
      await descargarDocumento(viewerModal.documentoId);
    }
  };

  return (
    <div>
      {documentos.map((doc) => (
        <button key={doc.id} onClick={() => handleViewDocumento(doc)}>
          Ver {doc.tipo}
        </button>
      ))}

      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
        pdfUrl={viewerModal.pdfUrl}
        fileName={viewerModal.fileName}
        title={viewerModal.title}
        onDownload={handleDownload}
      />
    </div>
  );
}
```

## 🔧 Integración en el Proyecto

El modal ya está integrado en:

1. **`documentList.tsx`** - Lista de documentos con botón "Ver" que abre el modal
2. **Ejemplo completo** en `examples/PdfViewerModalExample.tsx`

## 🎨 Estilos

El componente usa Tailwind CSS y está completamente estilizado con:
- Soporte dark mode (`dark:` prefixes)
- Animaciones suaves
- Estados hover/focus
- Responsive design
- Tema coherente con el resto del proyecto

## 🐛 Solución de Problemas

### El PDF no carga
- Verifica que `pdfUrl` sea una URL válida
- Asegúrate de que el servidor permita CORS
- Comprueba que el archivo sea un PDF válido

### Modal no cierra con ESC
- El componente maneja esto automáticamente
- Verifica que no haya otros event listeners de ESC

### Scroll del body no se previene
- El componente establece `overflow: hidden` automáticamente
- Se restaura al cerrar el modal

## 📚 Dependencias

El componente requiere:
- `react-pdf` - Ya instalado en el proyecto
- `lucide-react` - Para los iconos
- Tailwind CSS - Para estilos

## 🔄 Actualizaciones Futuras

Posibles mejoras:
- [ ] Anotaciones en el PDF
- [ ] Búsqueda de texto
- [ ] Miniaturas de páginas
- [ ] Compartir documento
- [ ] Imprimir directo
- [ ] Modo de lectura continua

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

---

**Creado por:** GitHub Copilot  
**Versión:** 1.0.0  
**Fecha:** Diciembre 2025

# 📐 Arquitectura del Proyecto Swartzkrip

## 🎯 Visión General

Este proyecto implementa **Clean Architecture** combinada con **Arquitectura Hexagonal** en Next.js 16, enfocándose en la separación de responsabilidades, mantenibilidad y escalabilidad.

---

## 🏗️ Estructura General del Proyecto

```
swartzkrip/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Página principal (landing)
│   ├── login/                   # Ruta de autenticación
│   └── (dashboard)/             # Grupo de rutas protegidas
│       ├── page.tsx             # Dashboard principal
│       ├── pdf/                 # Lista de PDFs
│       └── addpdf/              # Agregar PDFs
├── features/                     # Módulos de dominio (Feature-based)
│   ├── auth/                    # Módulo de autenticación
│   └── pdf/                     # Módulo de PDFs
│       ├── data/                # Capa de datos
│       ├── context/             # Estado global (Store)
│       ├── hooks/               # Custom Hooks
│       ├── service/             # Servicios (API calls)
│       └── presentation/        # UI Components & Views
└── core/                         # Infraestructura compartida
    ├── Axios/                   # Cliente HTTP singleton
    ├── crypto/                  # Algoritmos de cifrado
    └── encription/              # Abstracción de cifrado
```

---

## 📁 Carpeta `features/` - Arquitectura por Módulos

Cada módulo sigue el principio de **Domain-Driven Design (DDD)**, donde cada feature es independiente y autocontenida.

### Ejemplo: `features/pdf/`

```
pdf/
├── data/                         # 📊 CAPA DE DATOS
│   ├── interfaces/              # Contratos TypeScript
│   │   └── pdf.interface.ts     # IPdf, IPdfListResponse, etc.
│   └── enums/                   # Enumeraciones
│       └── pdf.enums.ts         # RequestStatus, ErrorType, etc.
│
├── context/                      # 🛡️ CAPA DE APLICACIÓN
│   └── pdf.store.ts             # Store (Guard + Estado Global)
│
├── hooks/                        # 🎣 CUSTOM HOOKS
│   └── usePdf.ts                # Hook para conectar UI con Store
│
├── service/                      # 🔌 CAPA DE DOMINIO
│   └── pdf.service.ts           # Lógica de negocio + API calls
│
└── presentation/                 # 🎨 CAPA DE PRESENTACIÓN
    ├── components/              # Componentes reutilizables
    │   ├── pdfFilter.tsx        # Filtro de búsqueda
    │   ├── pdfView.tsx          # Tabla de PDFs
    │   └── pdfPaginator.tsx     # Paginación
    └── views/                   # Vistas completas (pages)
        └── pdfMainView.tsx      # Vista principal del módulo
```

---

## 🔄 Flujo de Datos - Clean Architecture

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│  1. PRESENTATION LAYER (UI)                                 │
│  ┌─────────────┐         ┌─────────────┐                   │
│  │ Components  │ ◄─────► │   Views     │                   │
│  └──────┬──────┘         └──────┬──────┘                   │
│         │                       │                           │
│         └───────────┬───────────┘                           │
│                     ↓                                       │
└─────────────────────┼─────────────────────────────────────┘
                      │
┌─────────────────────┼─────────────────────────────────────┐
│  2. HOOKS LAYER     ↓                                      │
│  ┌──────────────────────────┐                             │
│  │   usePdf() Hook          │  ← Conecta UI con Store     │
│  └───────────┬──────────────┘                             │
│              ↓                                             │
└──────────────┼────────────────────────────────────────────┘
               │
┌──────────────┼────────────────────────────────────────────┐
│  3. STORE LAYER (Guard + Estado)                          │
│  ┌───────────▼──────────┐                                 │
│  │   pdf.store.ts       │  ← Validaciones, conversiones   │
│  │   - Estado global    │     Estado reactivo             │
│  │   - Validaciones     │                                 │
│  │   - File → Base64    │                                 │
│  └───────────┬──────────┘                                 │
│              ↓                                             │
└──────────────┼────────────────────────────────────────────┘
               │
┌──────────────┼────────────────────────────────────────────┐
│  4. SERVICE LAYER (Lógica de Negocio)                     │
│  ┌───────────▼──────────┐                                 │
│  │   pdf.service.ts     │  ← Singleton                    │
│  │   - CRUD operations  │                                 │
│  │   - Business logic   │                                 │
│  └───────────┬──────────┘                                 │
│              ↓                                             │
└──────────────┼────────────────────────────────────────────┘
               │
┌──────────────┼────────────────────────────────────────────┐
│  5. INFRASTRUCTURE LAYER                                  │
│  ┌───────────▼──────────┐                                 │
│  │   AxiosClient        │  ← Singleton + Interceptores    │
│  │   (Singleton)        │                                 │
│  └───────────┬──────────┘                                 │
│              ↓                                             │
│  ┌──────────────────────┐                                 │
│  │   useEncryption      │  ← Cifrado automático           │
│  └───────────┬──────────┘                                 │
│              ↓                                             │
│  ┌──────────────────────┐                                 │
│  │   Vigenere Cipher    │  ← Algoritmo de cifrado         │
│  └───────────┬──────────┘                                 │
│              ↓                                             │
└──────────────┼────────────────────────────────────────────┘
               │
            Backend API
```

---

## 📂 Explicación Detallada por Carpeta

### 1️⃣ `data/` - Capa de Datos

**Propósito**: Definir contratos, tipos e interfaces. No contiene lógica de negocio.

```typescript
// data/interfaces/pdf.interface.ts
export interface IPdf {
  id: string;
  title: string;
  fileUrl: string;
  // ... más campos
}

// data/enums/pdf.enums.ts
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
```

**Responsabilidades**:
- ✅ Definir interfaces TypeScript
- ✅ Definir enums y tipos
- ✅ Contratos de datos (DTOs)
- ❌ NO contiene lógica

---

### 2️⃣ `context/` - Store (Guard + Estado Global)

**Propósito**: Gestión de estado centralizada y validaciones (actúa como **Guard**).

```typescript
// context/pdf.store.ts
class PdfStore {
  private state: IPdfState;
  
  // Validar archivo
  private validatePdfFile(file: File): boolean {
    // Validaciones de tamaño, tipo, etc.
  }
  
  // Convertir a Base64
  private async fileToBase64(file: File): Promise<string> {
    // Conversión
  }
  
  // Crear PDF
  public async createPdf(file: File, title: string): Promise<boolean> {
    if (!this.validatePdfFile(file)) return false;
    const base64 = await this.fileToBase64(file);
    await pdfService.createPdf({ title, fileBase64: base64 });
  }
}
```

**Responsabilidades**:
- ✅ Mantener estado global
- ✅ Validar datos antes de enviarlos
- ✅ Transformar datos (File → Base64)
- ✅ Notificar cambios a los subscribers
- ✅ Manejo de errores centralizado
- ❌ NO hace llamadas HTTP directamente

**Patrón**: Singleton + Observer

---

### 3️⃣ `hooks/` - Custom Hooks

**Propósito**: Conectar la capa de presentación con el store.

```typescript
// hooks/usePdf.ts
export function usePdf() {
  const [state, setState] = useState(pdfStore.getState());
  
  useEffect(() => {
    return pdfStore.subscribe(() => {
      setState(pdfStore.getState());
    });
  }, []);
  
  return {
    pdfs: state.pdfs,
    isLoading: state.status === 'loading',
    loadPdfs: () => pdfStore.fetchPdfs(),
    createPdf: (file, title) => pdfStore.createPdf(file, title),
  };
}
```

**Responsabilidades**:
- ✅ Suscribirse al store
- ✅ Exponer API simple para componentes
- ✅ Manejar ciclo de vida React
- ❌ NO contiene lógica de negocio

---

### 4️⃣ `service/` - Servicios (Lógica de Negocio)

**Propósito**: Encapsular llamadas a APIs y lógica de dominio.

```typescript
// service/pdf.service.ts
class PdfService {
  private basePath = '/api/pdfs';
  
  async getPdfs(page: number, limit: number): Promise<IPdfListResponse> {
    return await axiosClient.get(this.basePath, { params: { page, limit } });
  }
  
  async createPdf(data: IPdfCreateRequest): Promise<IPdf> {
    // Los datos ya vienen validados y en Base64 desde el store
    return await axiosClient.post(this.basePath, data);
  }
}
```

**Responsabilidades**:
- ✅ Llamadas HTTP a APIs
- ✅ Transformar respuestas
- ✅ Lógica de negocio específica
- ❌ NO maneja estado UI
- ❌ NO hace validaciones (las hace el store)

**Patrón**: Singleton

---

### 5️⃣ `presentation/` - Capa de Presentación

#### `components/` - Componentes Reutilizables

**Propósito**: Componentes pequeños, enfocados en una sola responsabilidad.

```typescript
// presentation/components/pdfFilter.tsx
export default function PdfFilter({ onSearch, isLoading }) {
  return (
    <form onSubmit={handleSearch}>
      <input type="text" />
      <button disabled={isLoading}>Buscar</button>
    </form>
  );
}
```

**Características**:
- ✅ Reciben datos por props
- ✅ Emiten eventos (callbacks)
- ✅ Sin lógica de negocio
- ✅ Reutilizables
- ❌ NO llaman directamente al store

---

#### `views/` - Vistas Completas

**Propósito**: Componentes que orquestan otros componentes y conectan con hooks.

```typescript
// presentation/views/pdfMainView.tsx
export default function PdfMainView() {
  const { pdfs, isLoading, loadPdfs, searchPdfs } = usePdf();
  
  useEffect(() => {
    loadPdfs();
  }, []);
  
  return (
    <div>
      <PdfFilter onSearch={searchPdfs} isLoading={isLoading} />
      <PdfView pdfs={pdfs} isLoading={isLoading} />
      <PdfPaginator />
    </div>
  );
}
```

**Responsabilidades**:
- ✅ Conectar con hooks
- ✅ Orquestar componentes
- ✅ Manejar eventos
- ❌ NO contiene lógica de negocio (delega al hook/store)

---

## 🚪 Carpeta `app/` - Next.js App Router

### Estructura de Rutas

```
app/
├── page.tsx                    # Ruta: /
├── login/
│   └── page.tsx               # Ruta: /login
└── (dashboard)/               # Grupo de rutas (no afecta URL)
    ├── page.tsx               # Ruta: /
    ├── pdf/
    │   └── page.tsx           # Ruta: /pdf
    └── addpdf/
        └── page.tsx           # Ruta: /addpdf
```

### `(dashboard)` - Route Groups

Los paréntesis `(dashboard)` crean un **grupo de rutas** que:
- ✅ NO afecta la URL
- ✅ Permite agrupar rutas relacionadas
- ✅ Permite compartir layouts
- ✅ Útil para rutas protegidas

**Ejemplo de page.tsx**:

```typescript
// app/(dashboard)/pdf/page.tsx
import PdfMainView from "@/features/pdf/presentation/views/pdfMainView";

export default function PdfPage() {
  return <PdfMainView />;
}
```

**Responsabilidad**: Solo invocar la vista del módulo correspondiente.

---

## 🔐 Carpeta `core/` - Infraestructura

### `core/Axios/AxiosClient.ts`

**Singleton** que maneja todas las peticiones HTTP con cifrado automático.

```typescript
class AxiosClient {
  private static instance: AxiosClient;
  
  // Interceptor de Request: cifra datos
  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(config => {
      if (config.data) {
        const encrypted = useEncryption.encrypt(JSON.stringify(config.data));
        config.data = { encrypted };
      }
      return config;
    });
    
    // Interceptor de Response: descifra datos
    this.axiosInstance.interceptors.response.use(response => {
      if (response.data?.encrypted) {
        response.data = JSON.parse(useEncryption.decrypt(response.data.encrypted));
      }
      return response;
    });
  }
}
```

---

### `core/encription/useEncryption.ts`

**Capa de abstracción** para cifrado. Permite cambiar el algoritmo fácilmente.

```typescript
class EncryptionService {
  private encryptionEngine = vigenereCipher;
  
  encrypt(text: string): string {
    return this.encryptionEngine.encrypt(text);
  }
  
  // Fácil cambiar el motor de cifrado
  setEncryptionEngine(engine: IEncryption) {
    this.encryptionEngine = engine;
  }
}
```

---

### `core/crypto/vigenere.ts`

Implementación del **algoritmo de cifrado Vigenere**.

```typescript
class VigenereCipher {
  encrypt(plainText: string): string {
    // 1. Convertir a Base64
    // 2. Aplicar cifrado Vigenere
    // 3. Devolver Base64 cifrado
  }
  
  decrypt(cipherText: string): string {
    // Proceso inverso
  }
}
```

---

## 🔄 Flujo Completo: Crear un PDF

### Paso a Paso

```
1. Usuario selecciona archivo en el componente
   ↓
2. PdfMainView llama a usePdf.createPdf(file, title)
   ↓
3. usePdf llama a pdfStore.createPdf(file, title)
   ↓
4. pdfStore:
   - Valida el archivo (tipo, tamaño)
   - Convierte File → Base64
   - Llama a pdfService.createPdf({ title, fileBase64 })
   ↓
5. pdfService llama a axiosClient.post('/api/pdfs', data)
   ↓
6. AxiosClient (interceptor):
   - Cifra todo el objeto con useEncryption
   - Envía: { encrypted: "base64_encrypted_string" }
   ↓
7. Backend recibe datos cifrados
   ↓
8. Backend descifra y obtiene:
   {
     title: "Mi PDF",
     fileBase64: "JVBERi0xLjQK..."
   }
   ↓
9. Backend guarda el PDF
   ↓
10. Respuesta vuelve cifrada al frontend
    ↓
11. AxiosClient descifra automáticamente
    ↓
12. pdfStore actualiza el estado
    ↓
13. usePdf notifica a los componentes
    ↓
14. UI se actualiza automáticamente
```

---

## 🎯 Principios Aplicados

### 1. **Separation of Concerns (SoC)**
Cada capa tiene una responsabilidad única y bien definida.

### 2. **Dependency Inversion**
Las capas superiores no dependen de las inferiores, sino de abstracciones.

```
Components → Hook → Store → Service → AxiosClient
    (dependen de interfaces, no de implementaciones)
```

### 3. **Single Responsibility Principle (SRP)**
- Components: Solo UI
- Hooks: Solo conexión UI-Store
- Store: Solo estado + validaciones
- Service: Solo API calls

### 4. **Singleton Pattern**
- AxiosClient: Una sola instancia HTTP
- pdfStore: Un solo estado global
- pdfService: Un solo punto de acceso a la API

### 5. **Observer Pattern**
- Store notifica cambios
- Hooks se suscriben a cambios
- UI se actualiza reactivamente

---

## 📊 Beneficios de esta Arquitectura

### ✅ Mantenibilidad
- Código organizado y fácil de encontrar
- Cambios aislados a una capa específica

### ✅ Testabilidad
- Cada capa se puede testear independientemente
- Fácil hacer mocks

### ✅ Escalabilidad
- Agregar nuevos features es simple
- Solo duplicar la estructura de carpetas

### ✅ Reutilización
- Componentes independientes
- Servicios compartibles entre módulos

### ✅ Seguridad
- Cifrado centralizado y automático
- Validaciones en el store antes de enviar datos

---

## 🚀 Agregar un Nuevo Feature

### Ejemplo: Feature `users/`

1. Crear estructura:
```
features/users/
├── data/
│   ├── interfaces/user.interface.ts
│   └── enums/user.enums.ts
├── context/user.store.ts
├── hooks/useUser.ts
├── service/user.service.ts
└── presentation/
    ├── components/
    └── views/
```

2. Crear ruta en `app/`:
```
app/(dashboard)/users/page.tsx
```

3. Listo! 🎉

---

## 📚 Recursos Adicionales

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)

---

## 🤝 Convenciones del Proyecto

### Nombres de Archivos
- Componentes: `camelCase.tsx` (ej: `pdfFilter.tsx`)
- Interfaces: `camelCase.ts` (ej: `pdf.interface.ts`)
- Services: `camelCase.service.ts` (ej: `pdf.service.ts`)
- Stores: `camelCase.store.ts` (ej: `pdf.store.ts`)

### Nombres de Funciones
- Componentes: `PascalCase` (ej: `PdfFilter`)
- Hooks: `camelCase` con prefijo `use` (ej: `usePdf`)
- Servicios: `camelCase` (ej: `getPdfs`)

### Estructura de Imports
```typescript
// 1. Dependencias externas
import { useState } from 'react';

// 2. Alias de proyecto (@/)
import { usePdf } from '@/features/pdf/hooks/usePdf';

// 3. Relativos
import PdfFilter from '../components/pdfFilter';
```

---

**Última actualización**: Noviembre 30, 2025  
**Versión**: 1.0.0  
**Proyecto**: Swartzkrip - Sistema de Gestión Documental

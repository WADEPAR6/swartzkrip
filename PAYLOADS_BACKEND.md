# 📡 Payloads al Backend - Sistema de Gestión Documental

---

## 🔐 AUTENTICACIÓN Y HEADERS

### ⚡ Interceptores de Axios (AxiosClient)

**Todos los requests pasan por interceptores automáticos:**

```typescript
// core/Axios/AxiosClient.ts

Interceptor REQUEST:
1. Agrega Headers de Autenticación
2. Cifra el payload (ACTUALMENTE DESACTIVADO - Activar en producción)
3. Agrega timestamp para prevenir replay attacks

Interceptor RESPONSE:
1. Descifra la respuesta (ACTUALMENTE DESACTIVADO)
2. Maneja errores 401 (Unauthorized) → Redirige a /login
3. Maneja errores 403 (Forbidden) → Sin permisos
```

---

### 📋 HEADERS ENVIADOS EN TODAS LAS PETICIONES

**Headers automáticos (agregados por AxiosClient):**

```http
Content-Type: application/json
Authorization: Bearer mock_token_userId_role
X-User-Role: admin | user
X-User-Id: 123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo real de headers:**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer mock_token_user-123_admin",
  "X-User-Role": "admin",
  "X-User-Id": "user-123",
  "X-User-Email": "raul.perez@uta.edu.ec",
  "X-Request-Time": "1733585400000"
}
```

---

### 🔒 CIFRADO DE PAYLOADS (Vigenère Cipher)

**Estado actual: DESACTIVADO**

El sistema tiene implementado cifrado automático con **Vigenère Cipher** pero está comentado en `AxiosClient.ts`:

```typescript
// ====== ENCRIPTACIÓN DESACTIVADA ======
// TODO: Activar encriptación en producción

// if (config.data) {
//   const encryptedData = useEncryption.encrypt(JSON.stringify(config.data));
//   config.data = { encrypted: encryptedData };
// }
```

**Cuando se active en producción:**

**Request cifrado:**
```json
{
  "encrypted": "XKJHG234KJHG2K3JHG4K23JHG..."
}
```

**Response cifrado:**
```json
{
  "encrypted": "LKJHG987KJHG9K8JHG7K98JHG..."
}
```

El backend debe:
1. Descifrar el campo `encrypted` con la misma clave Vigenère
2. Procesar la petición
3. Cifrar la respuesta antes de enviarla
4. Enviar como `{ encrypted: "..." }`

---

## 🔵 1. AUTENTICACIÓN

### 📤 LOGIN

**Endpoint:** `POST /api/auth/login`

**Headers:**
```http
Content-Type: application/json
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "email": "raul.perez@uta.edu.ec",
  "password": "securePassword123"
}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "user-123",
      "nombre": "Raúl Pérez",
      "email": "raul.perez@uta.edu.ec",
      "role": "admin",
      "cargo": "Administrador de Sistema"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies HTTP-Only (SET por backend):**
```http
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
```

---

### 📤 LOGIN CON MICROSOFT (NextAuth)

**Endpoint:** `POST /api/auth/callback/microsoft-entra-id`

Este endpoint es manejado por NextAuth automáticamente.

**Flow:**
1. Usuario hace click en "Iniciar sesión con Microsoft"
2. Redirige a Microsoft Entra ID
3. Usuario autoriza
4. Microsoft redirige a `/api/auth/callback/microsoft-entra-id` con código
5. NextAuth intercambia código por token
6. Crea sesión JWT

**Session JWT (nextauth-token cookie):**
```json
{
  "user": {
    "name": "Raúl Pérez",
    "email": "raul.perez@uta.edu.ec",
    "image": "https://graph.microsoft.com/..."
  },
  "expires": "2025-12-14T10:30:00Z"
}
```

---

### 📤 LOGOUT

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{}
```

**Response esperada:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Cookies eliminadas:**
```http
Set-Cookie: refreshToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
Set-Cookie: accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

### 📤 REFRESH TOKEN

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```http
Content-Type: application/json
Cookie: refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Request-Time: 1733585400000
```

**Payload:**
```json
{}
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

### 📤 OBTENER USUARIO ACTUAL

**Endpoint:** `GET /api/auth/me`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Response esperada:**
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "nombre": "Raúl Pérez",
    "email": "raul.perez@uta.edu.ec",
    "role": "admin",
    "cargo": "Administrador de Sistema",
    "fechaCreacion": "2025-01-15T08:00:00Z"
  }
}
```

---

## 🔵 2. CREAR/GUARDAR DOCUMENTO

### 📤 ENVIANDO AL BACKEND (Frontend → Backend)

**Endpoint:** `POST /api/documentos`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload enviado desde el frontend:**
```json
{
  "tipo": "Oficio",
  "categoria": "Normal",
  "asunto": "Solicitud de Acreditación para Carrera de Ingeniería",
  "referencia": "0144-M",
  "destinatarios": [
    "oscar.ibarra@uta.edu.ec",
    "franklin.mayorga@uta.edu.ec",
    "luis.morales@uta.edu.ec"
  ],
  "document": {
    "nombre": "documento_principal.pdf",
    "tamano": 567890,
    "tipo": "application/pdf",
    "datos": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cv..."
  },
  "esDocumentoSubido": true,
  "estado": "elaboracion"
}
```

**Estructura del campo `document`:**
- Si **esDocumentoSubido = true**: Es un PDF subido → Envía el archivo en Base64
- Si **esDocumentoSubido = false**: Es contenido del editor → Envía HTML que el backend convertirá a PDF

**Ejemplo con Editor de Texto:**
```json
{
  "tipo": "Memorando",
  "categoria": "Cifrado",
  "asunto": "Informe de Auditoría Interna",
  "referencia": "MEM-2025-042",
  "destinatarios": ["maria.garcia@uta.edu.ec"],
  "document": {
    "nombre": "informe_auditoria.html",
    "tamano": 12456,
    "tipo": "text/html",
    "datos": "<h1>Informe de Auditoría</h1><p>Se ha realizado...</p>"
  },
  "esDocumentoSubido": false,
  "estado": "elaboracion"
}
```

---

### 📥 RESPUESTA DEL BACKEND (Backend → Frontend)

**Response esperada:**
```json
{
  "success": true,
  "mensaje": "Documento creado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Oficio",
    "categoria": "Normal",
    "asunto": "Solicitud de Acreditación para Carrera de Ingeniería",
    "referencia": "0144-M",
    "estado": "elaboracion",
    "destinatarios": [
      {
        "id": "dest-001",
        "nombre": "Oscar Fernando Ibarra Torres",
        "email": "oscar.ibarra@uta.edu.ec",
        "cargo": "Director de Carrera"
      },
      {
        "id": "dest-002",
        "nombre": "Franklin Mayorga",
        "email": "franklin.mayorga@uta.edu.ec",
        "cargo": "Coordinador Académico"
      },
      {
        "id": "dest-003",
        "nombre": "Luis Alberto Morales",
        "email": "luis.morales@uta.edu.ec",
        "cargo": "Secretario General"
      }
    ],
    "document": {
      "url": "https://api.example.com/documentos/550e8400-e29b-41d4-a716-446655440000/documento.pdf",
      "nombre": "documento_principal.pdf",
      "tamano": 567890,
      "tipo": "application/pdf"
    },
    "autor": {
      "id": "user-123",
      "nombre": "Raúl Pérez",
      "email": "raul.perez@uta.edu.ec"
    },
    "fechaCreacion": "2025-12-07T10:30:00Z",
    "fechaModificacion": "2025-12-07T10:30:00Z",
    "firmaQR": null
  }
}
```

---

## 🔵 3. ENVIAR DOCUMENTO (con Firma QR)

### 📤 ENVIANDO AL BACKEND

**Endpoint:** `PUT /api/documentos/{id}/enviar`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "documentoId": "550e8400-e29b-41d4-a716-446655440000",
  "destinatarios": [
    "oscar.ibarra@uta.edu.ec",
    "franklin.mayorga@uta.edu.ec"
  ],
  "firmaQR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADI..."
}
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "mensaje": "Documento enviado exitosamente a 2 destinatarios",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "enviados",
    "fechaEnvio": "2025-12-07T11:45:00Z",
    "destinatarios": [
      {
        "id": "dest-001",
        "nombre": "Oscar Fernando Ibarra Torres",
        "email": "oscar.ibarra@uta.edu.ec",
        "estadoEnvio": "enviado",
        "fechaEnvio": "2025-12-07T11:45:00Z"
      },
      {
        "id": "dest-002",
        "nombre": "Franklin Mayorga",
        "email": "franklin.mayorga@uta.edu.ec",
        "estadoEnvio": "enviado",
        "fechaEnvio": "2025-12-07T11:45:00Z"
      }
    ],
    "firmaQR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADI..."
  }
}
```

---

## 🔵 4. LISTAR DOCUMENTOS (Para la Tabla)

### 📤 PETICIÓN AL BACKEND

**Endpoint:** `GET /api/documentos?estado={estado}&page={page}&limit={limit}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Query params:**
```
GET /api/documentos?estado=enviados&page=1&limit=10
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": {
    "documentos": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "tipo": "Oficio",
        "categoria": "Normal",
        "asunto": "Solicitud de Acreditación para Carrera de Ingeniería",
        "referencia": "0144-M",
        "estado": "enviados",
        "destinatarios": [
          {
            "id": "dest-001",
            "nombre": "Oscar Fernando Ibarra Torres",
            "email": "oscar.ibarra@uta.edu.ec",
            "cargo": "Director de Carrera"
          }
        ],
        "autor": {
          "id": "user-123",
          "nombre": "Raúl Pérez",
          "email": "raul.perez@uta.edu.ec"
        },
        "fechaCreacion": "2025-12-07T10:30:00Z",
        "fechaEnvio": "2025-12-07T11:45:00Z",
        "document": {
          "url": "https://api.example.com/documentos/550e8400/documento.pdf",
          "nombre": "documento_principal.pdf",
          "tamano": 567890,
          "tipo": "application/pdf"
        }
      },
      {
        "id": "661f9511-f3ac-52e5-b827-557766551111",
        "tipo": "Memorando",
        "categoria": "Cifrado",
        "asunto": "Informe de Auditoría Interna",
        "referencia": "MEM-2025-042",
        "estado": "enviados",
        "destinatarios": [
          {
            "id": "dest-005",
            "nombre": "María García",
            "email": "maria.garcia@uta.edu.ec",
            "cargo": "Auditora"
          }
        ],
        "autor": {
          "id": "user-123",
          "nombre": "Raúl Pérez",
          "email": "raul.perez@uta.edu.ec"
        },
        "fechaCreacion": "2025-12-06T14:20:00Z",
        "fechaEnvio": "2025-12-06T15:00:00Z",
        "document": {
          "url": "https://api.example.com/documentos/661f9511/documento.pdf",
          "nombre": "informe_auditoria.pdf",
          "tamano": 245678,
          "tipo": "application/pdf"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

---

## 🔵 5. OBTENER UN DOCUMENTO (Para el Visor PDF)

### 📤 PETICIÓN AL BACKEND

**Endpoint:** `GET /api/documentos/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
GET /api/documentos/550e8400-e29b-41d4-a716-446655440000
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Oficio",
    "categoria": "Normal",
    "asunto": "Solicitud de Acreditación para Carrera de Ingeniería",
    "referencia": "0144-M",
    "estado": "enviados",
    "destinatarios": [
      {
        "id": "dest-001",
        "nombre": "Oscar Fernando Ibarra Torres",
        "email": "oscar.ibarra@uta.edu.ec",
        "cargo": "Director de Carrera",
        "estadoEnvio": "entregado",
        "fechaLectura": "2025-12-07T12:15:00Z"
      },
      {
        "id": "dest-002",
        "nombre": "Franklin Mayorga",
        "email": "franklin.mayorga@uta.edu.ec",
        "cargo": "Coordinador Académico",
        "estadoEnvio": "pendiente",
        "fechaLectura": null
      }
    ],
    "document": {
      "url": "https://api.example.com/documentos/550e8400/documento.pdf",
      "urlDescarga": "https://api.example.com/documentos/550e8400/descargar",
      "nombre": "documento_principal.pdf",
      "tamano": 567890,
      "tipo": "application/pdf",
      "datos": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cv..." // Base64 del PDF
    },
    "autor": {
      "id": "user-123",
      "nombre": "Raúl Pérez",
      "email": "raul.perez@uta.edu.ec",
      "cargo": "Administrador de Sistema"
    },
    "fechaCreacion": "2025-12-07T10:30:00Z",
    "fechaModificacion": "2025-12-07T10:30:00Z",
    "fechaEnvio": "2025-12-07T11:45:00Z",
    "firmaQR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADI...",
    "respuestas": []
  }
}
```

**Para mostrar en el Visor PDF:**
- Usar `document.url` para cargar el PDF directamente
- O convertir `document.datos` (Base64) a blob:
  ```typescript
  const blob = base64ToBlob(document.datos, 'application/pdf');
  const url = URL.createObjectURL(blob);
  ```

---

## 🔵 6. DESCARGAR PDF

### 📤 PETICIÓN AL BACKEND

**Endpoint:** `GET /api/documentos/{id}/descargar`

**Headers:**
```http
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

### 📥 RESPUESTA DEL BACKEND

**Content-Type:** `application/pdf`
**Content-Disposition:** `attachment; filename="documento_principal.pdf"`

Retorna el archivo PDF directamente como blob.

---

## 🔵 7. RESPONDER DOCUMENTO (Solo Oficios)

### 📤 ENVIANDO AL BACKEND

**Endpoint:** `POST /api/documentos/{id}/responder`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "documentoOriginalId": "550e8400-e29b-41d4-a716-446655440000",
  "asunto": "Re: Solicitud de Acreditación - Aprobada",
  "contenido": "<p>En respuesta a su solicitud...</p>",
  "destinatarios": ["raul.perez@uta.edu.ec"],
  "document": {
    "nombre": "respuesta_acreditacion.pdf",
    "tamano": 123456,
    "tipo": "application/pdf",
    "datos": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago..."
  }
}
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "mensaje": "Respuesta enviada exitosamente",
  "data": {
    "id": "772g0622-g4bc-63f6-c938-668877662222",
    "tipo": "Oficio",
    "asunto": "Re: Solicitud de Acreditación - Aprobada",
    "documentoOriginalId": "550e8400-e29b-41d4-a716-446655440000",
    "estado": "enviados",
    "fechaCreacion": "2025-12-07T14:30:00Z",
    "fechaEnvio": "2025-12-07T14:30:00Z"
  }
}
```

---

## 📊 RESUMEN DE ESTADOS

Los documentos pueden tener 5 estados:

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| `elaboracion` | Borrador sin enviar | Editar, Enviar, Eliminar |
| `enviados` | Documento enviado a destinatarios | Ver, Descargar, Responder (si es Oficio) |
| `recibidos` | Documentos recibidos de otros | Ver, Descargar, Responder (si es Oficio) |
| `no_enviados` | Error al enviar | Reintentar, Editar, Eliminar |
| `enviar` | Pendiente de envío programado | Ver, Cancelar |

---

## 🎯 CAMPOS IMPORTANTES PARA LA TABLA

La tabla `DocumentList` necesita estos campos mínimos:

```typescript
{
  id: string
  tipo: "Oficio" | "Memorando"
  categoria: "Normal" | "Cifrado"
  asunto: string
  referencia: string
  estado: "elaboracion" | "enviados" | "recibidos" | "no_enviados" | "enviar"
  destinatarios: Array<{ nombre, email }>
  autor: { nombre, email }
  fechaCreacion: string (ISO 8601)
  fechaEnvio?: string (ISO 8601)
  document: { url, nombre, tamano }
}
```

---

## 🎯 CAMPOS IMPORTANTES PARA EL VISOR PDF

El componente `PdfViewer` necesita:

```typescript
{
  document: {
    url: string           // URL pública del PDF
    // O
    datos: string         // Base64 del PDF
    
    nombre: string        // Nombre del archivo
    tamano: number        // Tamaño en bytes
    tipo: "application/pdf"
  }
}
```

**Uso en el componente:**
```typescript
<PdfViewer 
  pdfUrl={documento.document.url} 
  fileName={documento.document.nombre}
/>
```

---

## 🔒 SEGURIDAD Y AUTENTICACIÓN

### 🛡️ Middleware de Autenticación (middleware.ts)

**Rutas protegidas:**
```typescript
const protectedRoutes = ['/pdf', '/addpdf', '/profile']
const publicRoutes = ['/', '/login', '/api']
```

**Validación:**
```typescript
// Usa NextAuth para validar token JWT
const token = await getToken({ req: request, secret: process.env.AUTH_SECRET })
const isAuthenticated = !!token

// Si no autenticado y accede a ruta protegida → Redirige a /login
```

---

### 🔐 Cifrado de Payloads (Vigenère Cipher)

**Estado actual: DESACTIVADO**

El sistema implementa cifrado automático pero está comentado para desarrollo.

**Para activar en producción:**

1. Descomentar en `core/Axios/AxiosClient.ts`:
```typescript
// REQUEST Interceptor
if (config.data) {
  const encryptedData = useEncryption.encrypt(JSON.stringify(config.data));
  config.data = { encrypted: encryptedData };
}

// RESPONSE Interceptor
if (response.data && response.data.encrypted) {
  const decryptedData = useEncryption.decrypt(response.data.encrypted);
  response.data = JSON.parse(decryptedData);
}
```

2. Backend debe implementar misma clave Vigenère:
   - Descifrar `request.body.encrypted`
   - Procesar datos
   - Cifrar respuesta
   - Retornar `{ encrypted: "..." }`

---

### 🍪 Cookies HTTP-Only

**Configuración:**
```typescript
withCredentials: true  // En AxiosClient
```

**Backend debe configurar cookies:**
```http
Set-Cookie: accessToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=3600
Set-Cookie: refreshToken=eyJhbG...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Ventajas:**
- No accesibles desde JavaScript (XSS protection)
- Solo se envían al mismo dominio (CSRF protection)
- Secure flag: Solo HTTPS
- SameSite: Previene CSRF

---

### 🔑 Headers de Autenticación

**Todos los requests incluyen:**
```http
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin | user
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Backend debe validar:**
1. Token JWT válido (Authorization header)
2. Role apropiado para la acción
3. Timestamp reciente (prevenir replay attacks)
4. Email coincide con token

---

### ⚠️ Manejo de Errores Automático

**401 Unauthorized:**
```typescript
// AxiosClient interceptor
if (error.response.status === 401) {
  tokenManager.clearSession();
  window.location.href = '/login';
}
```

**403 Forbidden:**
```typescript
if (error.response.status === 403) {
  console.error('🚫 Sin permisos para esta acción');
}
```

---

## 📝 EJEMPLO DE CONSOLE LOGS

El sistema imprime logs detallados en desarrollo:

```javascript
// REQUEST
📤 Request: /api/documentos
📦 Data: {
  tipo: "Oficio",
  asunto: "Solicitud de Acreditación...",
  destinatarios: ["oscar.ibarra@uta.edu.ec"],
  esDocumentoSubido: true
}
🔑 Headers: {
  authorization: "Bearer mock_token_user-123_admin",
  role: "admin",
  userId: "user-123",
  email: "raul.perez@uta.edu.ec"
}

// RESPONSE SUCCESS
✅ Documento creado: {
  id: "550e8400-e29b-41d4-a716-446655440000",
  asunto: "Solicitud de Acreditación...",
  estado: "elaboracion"
}

// RESPONSE ERROR
❌ Error: 401
📦 Details: { message: "Token expirado" }
🔒 Token expirado, limpiando sesión...
```

---

## 🚀 ENDPOINTS COMPLETOS

### Autenticación
- `POST /api/auth/login` - Login con email/password
- `POST /api/auth/callback/microsoft-entra-id` - Login con Microsoft (NextAuth)
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual

### Documentos
- `POST /api/documentos` - Crear documento
- `GET /api/documentos?estado={estado}&page={page}&limit={limit}` - Listar documentos
- `GET /api/documentos/{id}` - Obtener un documento
- `PUT /api/documentos/{id}/enviar` - Enviar documento con firma QR
- `GET /api/documentos/{id}/descargar` - Descargar PDF
- `POST /api/documentos/{id}/responder` - Responder a Oficio
- `DELETE /api/documentos/{id}` - Eliminar documento

---

¡Sistema completamente documentado y listo para integración! 🎉
- **Hook**: Conexión React
- **Component**: Solo presentación

### ✅ 2. Patrón Singleton
```typescript
class DocumentoService {
  private static instance: DocumentoService;
  public static getInstance(): DocumentoService
}
```

### ✅ 3. Patrón Observer
```typescript
subscribe(listener: () => void): () => void
notify(): void
```

### ✅ 4. Validaciones Centralizadas
Todas las validaciones en el Store, no en el componente

### ✅ 5. Conversión Automática
```typescript
// Componente usa objetos completos
destinatarios: [{ value, label, email }, ...]

// Service extrae solo emails
destinatarios: ["email1@...", "email2@..."]
```

### ✅ 6. Manejo de Errores
```typescript
try {
  await service.method()
} catch (error) {
  this.setError(ErrorType.NETWORK, 'Mensaje', error)
}
```

### ✅ 7. Type Safety
Todo tipado con TypeScript

### ✅ 8. Clean Code
- Nombres descriptivos
- Funciones pequeñas
- Comentarios útiles
- Console logs informativos

---

## 🚀 Uso en Producción

### Backend debe recibir:
```json
POST /api/documentos
{
  "tipo": "Oficio",
  "categoria": "Normal",
  "asunto": "...",
  "referencia": "...",
  "contenido": "<p>HTML...</p>",
  "destinatarios": ["email1@...", "email2@..."],
  "anexos": [{ "nombre", "tamano", "tipo", "datos" }],
  "pdfPrincipal": { "nombre", "tamano", "tipo", "datos" },
  "esDocumentoSubido": false
}
```

### Backend debe retornar:
```json
{
  "success": true,
  "mensaje": "Documento creado exitosamente",
  "documento": {
    "id": "uuid",
    "tipo": "Oficio",
    ...
  },
  "firmaQR": "data:image/png;base64,..."
}
```

---

## 📝 Console Logs para Debugging

El sistema imprime logs claros en cada paso:

```
📤 Enviando documento al backend: {
  tipo: "Oficio",
  categoria: "Normal",
  asunto: "...",
  destinatarios: ["email1", "email2"],
  esDocumentoSubido: false,
  tieneAnexos: true,
  tienePdfPrincipal: false
}

✅ Documento creado: { id: "...", asunto: "..." }

📤 Enviando documento: {
  documentoId: "...",
  destinatarios: ["email1", "email2"],
  tieneFirma: true
}
```

¡Todo listo para producción! 🎉

---

## 🔵 8. GESTIÓN DE PDFs (Sistema Genérico)

### 📤 LISTAR PDFs CON PAGINACIÓN

**Endpoint:** `GET /api/pdfs?page={page}&limit={limit}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Query params:**
```
GET /api/pdfs?page=1&limit=10
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": [
    {
      "id": "pdf-001",
      "title": "Manual de Usuario",
      "description": "Guía completa del sistema",
      "fileBase64": "JVBERi0xLjQKJeLjz9...",
      "fileName": "manual_usuario.pdf",
      "fileSize": 2048576,
      "mimeType": "application/pdf",
      "uploadedBy": "user-123",
      "uploadedAt": "2025-12-07T10:30:00Z",
      "tags": ["manual", "documentación"],
      "category": "Manuales"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 45,
  "hasMore": true
}
```

---

### 📤 OBTENER PDF POR ID

**Endpoint:** `GET /api/pdfs/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
GET /api/pdfs/pdf-001
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": {
    "id": "pdf-001",
    "title": "Manual de Usuario",
    "description": "Guía completa del sistema",
    "fileBase64": "JVBERi0xLjQKJeLjz9...",
    "fileName": "manual_usuario.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedBy": "user-123",
    "uploadedAt": "2025-12-07T10:30:00Z",
    "tags": ["manual", "documentación"],
    "category": "Manuales",
    "metadata": {
      "version": "1.0",
      "author": "Sistema"
    }
  }
}
```

---

### 📤 CREAR NUEVO PDF

**Endpoint:** `POST /api/pdfs`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "title": "Manual de Usuario",
  "description": "Guía completa del sistema",
  "fileBase64": "JVBERi0xLjQKJeLjz9...",
  "fileName": "manual_usuario.pdf",
  "fileSize": 2048576,
  "mimeType": "application/pdf",
  "tags": ["manual", "documentación"],
  "category": "Manuales"
}
```

**Notas:**
- `fileBase64`: PDF en Base64 sin el prefijo `data:application/pdf;base64,`
- `fileSize`: Tamaño en bytes
- `tags`: Array opcional de etiquetas
- `category`: Categoría opcional

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "PDF creado exitosamente",
  "data": {
    "id": "pdf-001",
    "title": "Manual de Usuario",
    "description": "Guía completa del sistema",
    "fileBase64": "JVBERi0xLjQKJeLjz9...",
    "fileName": "manual_usuario.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedBy": "user-123",
    "uploadedAt": "2025-12-07T10:30:00Z",
    "tags": ["manual", "documentación"],
    "category": "Manuales",
    "url": "https://backend.com/storage/pdfs/pdf-001.pdf"
  }
}
```

---

### 📤 ACTUALIZAR PDF

**Endpoint:** `PUT /api/pdfs/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "title": "Manual de Usuario v2.0",
  "description": "Guía completa del sistema actualizada",
  "tags": ["manual", "documentación", "v2"],
  "category": "Manuales"
}
```

**Notas:**
- No es necesario enviar `fileBase64` si no se va a cambiar el archivo
- Solo se envían los campos que se desean actualizar

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "PDF actualizado exitosamente",
  "data": {
    "id": "pdf-001",
    "title": "Manual de Usuario v2.0",
    "description": "Guía completa del sistema actualizada",
    "fileBase64": "JVBERi0xLjQKJeLjz9...",
    "fileName": "manual_usuario.pdf",
    "fileSize": 2048576,
    "mimeType": "application/pdf",
    "uploadedBy": "user-123",
    "uploadedAt": "2025-12-07T10:30:00Z",
    "updatedAt": "2025-12-07T15:45:00Z",
    "tags": ["manual", "documentación", "v2"],
    "category": "Manuales"
  }
}
```

---

### 📤 ELIMINAR PDF

**Endpoint:** `DELETE /api/pdfs/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
DELETE /api/pdfs/pdf-001
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "PDF eliminado exitosamente"
}
```

---

### 📤 BUSCAR PDFs POR TÍTULO

**Endpoint:** `GET /api/pdfs/search?q={query}&page={page}&limit={limit}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Query params:**
```
GET /api/pdfs/search?q=manual&page=1&limit=10
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": [
    {
      "id": "pdf-001",
      "title": "Manual de Usuario",
      "description": "Guía completa del sistema",
      "fileName": "manual_usuario.pdf",
      "fileSize": 2048576,
      "uploadedBy": "user-123",
      "uploadedAt": "2025-12-07T10:30:00Z",
      "tags": ["manual", "documentación"],
      "category": "Manuales"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 3,
  "hasMore": false,
  "query": "manual"
}
```

---

### 📤 DESCARGAR PDF

**Endpoint:** `GET /api/pdfs/{id}/download`

**Headers:**
```http
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
GET /api/pdfs/pdf-001/download
```

### 📥 RESPUESTA DEL BACKEND

**Content-Type:** `application/pdf`
**Content-Disposition:** `attachment; filename="manual_usuario.pdf"`

Retorna el archivo PDF directamente como blob.

---

## 🔵 9. BORRADORES DE DOCUMENTOS

### 📤 GUARDAR BORRADOR

**Endpoint:** `POST /api/documentos/draft`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "tipo": "Oficio",
  "categoria": "Administrativo",
  "asunto": "Solicitud de presupuesto - BORRADOR",
  "referencia": "OF-2025-001-DRAFT",
  "contenido": "<p>Contenido parcial del documento...</p>",
  "destinatarios": ["maria.garcia@uta.edu.ec"],
  "anexos": [],
  "pdfPrincipal": null,
  "esDocumentoSubido": false
}
```

**Notas:**
- Los borradores se guardan con `estado: "elaboracion"`
- Pueden tener campos incompletos
- Se pueden actualizar múltiples veces antes de enviar

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "Borrador guardado exitosamente",
  "data": {
    "id": "draft-550e8400-e29b-41d4-a716-446655440000",
    "tipo": "Oficio",
    "categoria": "Administrativo",
    "asunto": "Solicitud de presupuesto - BORRADOR",
    "referencia": "OF-2025-001-DRAFT",
    "contenido": "<p>Contenido parcial del documento...</p>",
    "destinatarios": ["maria.garcia@uta.edu.ec"],
    "estado": "elaboracion",
    "creadoPor": "user-123",
    "creadoEn": "2025-12-07T10:30:00Z",
    "actualizadoEn": "2025-12-07T10:30:00Z"
  }
}
```

---

## 🔵 10. GESTIÓN DE USUARIOS

### 📤 LISTAR USUARIOS

**Endpoint:** `GET /api/users?page={page}&limit={limit}&role={role}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Query params:**
```
GET /api/users?page=1&limit=10&role=user
```

**Roles disponibles:** `admin`, `user`, `viewer`

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": [
    {
      "id": "user-123",
      "nombre": "Raúl Pérez",
      "email": "raul.perez@uta.edu.ec",
      "role": "admin",
      "department": "Sistemas",
      "position": "Desarrollador Senior",
      "avatar": "https://backend.com/avatars/user-123.jpg",
      "activo": true,
      "creadoEn": "2025-01-15T08:00:00Z",
      "ultimoAcceso": "2025-12-07T10:30:00Z"
    },
    {
      "id": "user-456",
      "nombre": "María García",
      "email": "maria.garcia@uta.edu.ec",
      "role": "user",
      "department": "Administración",
      "position": "Asistente Administrativa",
      "avatar": null,
      "activo": true,
      "creadoEn": "2025-02-20T09:00:00Z",
      "ultimoAcceso": "2025-12-07T09:15:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 25,
  "hasMore": true
}
```

---

### 📤 OBTENER USUARIO POR ID

**Endpoint:** `GET /api/users/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
GET /api/users/user-456
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": {
    "id": "user-456",
    "nombre": "María García",
    "email": "maria.garcia@uta.edu.ec",
    "role": "user",
    "department": "Administración",
    "position": "Asistente Administrativa",
    "avatar": null,
    "activo": true,
    "creadoEn": "2025-02-20T09:00:00Z",
    "actualizadoEn": "2025-12-01T14:30:00Z",
    "ultimoAcceso": "2025-12-07T09:15:00Z",
    "permisos": ["crear_documentos", "ver_documentos", "editar_propios"],
    "metadata": {
      "telefono": "+593 99 123 4567",
      "extension": "123"
    }
  }
}
```

---

### 📤 CREAR USUARIO

**Endpoint:** `POST /api/users`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "nombre": "Carlos Rodríguez",
  "email": "carlos.rodriguez@uta.edu.ec",
  "password": "SecurePassword123!",
  "role": "user",
  "department": "Finanzas",
  "position": "Contador",
  "activo": true
}
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "user-789",
    "nombre": "Carlos Rodríguez",
    "email": "carlos.rodriguez@uta.edu.ec",
    "role": "user",
    "department": "Finanzas",
    "position": "Contador",
    "avatar": null,
    "activo": true,
    "creadoEn": "2025-12-07T15:45:00Z",
    "permisos": ["crear_documentos", "ver_documentos", "editar_propios"]
  }
}
```

---

### 📤 ACTUALIZAR USUARIO

**Endpoint:** `PUT /api/users/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "nombre": "Carlos Alberto Rodríguez",
  "department": "Finanzas",
  "position": "Contador Senior",
  "role": "user",
  "activo": true
}
```

**Notas:**
- Solo se envían los campos que se desean actualizar
- Para cambiar contraseña usar endpoint específico

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": "user-789",
    "nombre": "Carlos Alberto Rodríguez",
    "email": "carlos.rodriguez@uta.edu.ec",
    "role": "user",
    "department": "Finanzas",
    "position": "Contador Senior",
    "avatar": null,
    "activo": true,
    "creadoEn": "2025-12-07T15:45:00Z",
    "actualizadoEn": "2025-12-07T16:00:00Z"
  }
}
```

---

### 📤 ELIMINAR USUARIO

**Endpoint:** `DELETE /api/users/{id}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Ejemplo:**
```
DELETE /api/users/user-789
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Notas:**
- Considerar soft delete (marcar como `activo: false`) en lugar de eliminar permanentemente
- Verificar que el usuario no tenga documentos activos

---

### 📤 BUSCAR USUARIOS

**Endpoint:** `GET /api/users/search?q={query}&page={page}&limit={limit}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Query params:**
```
GET /api/users/search?q=maria&page=1&limit=10
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "data": [
    {
      "id": "user-456",
      "nombre": "María García",
      "email": "maria.garcia@uta.edu.ec",
      "role": "user",
      "department": "Administración",
      "position": "Asistente Administrativa",
      "avatar": null,
      "activo": true
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "hasMore": false,
  "query": "maria"
}
```

---

### 📤 CAMBIAR CONTRASEÑA

**Endpoint:** `PUT /api/users/{id}/password`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Payload:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!",
  "confirmPassword": "NewSecurePassword456!"
}
```

### 📥 RESPUESTA DEL BACKEND

```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 📤 VERIFICAR CÉDULA EXISTENTE

**Endpoint:** `GET /api/users/check-cedula/{cedula}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Params:** `cedula` - Cédula ecuatoriana a verificar

### 📥 RESPUESTA DEL BACKEND

```json
{
  "exists": true,
  "userId": "user-456",
  "message": "La cédula ya está registrada"
}
```

---

### 📤 VERIFICAR EMAIL EXISTENTE

**Endpoint:** `GET /api/users/check-email/{email}`

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer mock_token_user-123_admin
X-User-Role: admin
X-User-Id: user-123
X-User-Email: raul.perez@uta.edu.ec
X-Request-Time: 1733585400000
```

**Params:** `email` - Email institucional a verificar

### 📥 RESPUESTA DEL BACKEND

```json
{
  "exists": false,
  "message": "El email está disponible"
}
```

---

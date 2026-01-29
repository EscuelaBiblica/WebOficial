# Sistema Educativo - Escuela Bíblica

## 📋 Descripción General

Sistema de gestión de aprendizaje (LMS - Learning Management System) tipo Moodle desarrollado en Angular, diseñado para gestionar cursos, lecciones, tareas y exámenes de la Escuela Bíblica. El sistema mantiene las páginas estáticas actuales e incorpora funcionalidades avanzadas de gestión educativa.

---

## 🎯 Objetivos del Proyecto

- Migrar de página estática a una aplicación web dinámica con Angular
- Implementar sistema de autenticación y autorización por roles
- Proporcionar plataforma educativa completa tipo Moodle
- Mantener las páginas institucionales actuales (landing page)
- Utilizar infraestructura gratuita para almacenamiento de datos

---

## 👥 Roles y Permisos

### 1. Administrador
**Permisos completos:**
- ✅ Crear, editar y eliminar cursos
- ✅ Crear secciones dentro de los cursos
- ✅ Crear lecciones (texto, imágenes, PDF, videos de YouTube)
- ✅ Crear y configurar tareas
- ✅ Crear y configurar exámenes
- ✅ Importar preguntas desde Excel
- ✅ Inscribir estudiantes en cursos
- ✅ Gestionar usuarios (crear, editar, eliminar)
- ✅ Configurar ponderaciones y sistema de calificaciones
- ✅ Ver reportes y estadísticas generales
- ✅ Configurar desbloqueo progresivo de secciones

### 2. Profesor
**Permisos limitados:**
- ✅ Crear secciones dentro de cursos asignados
- ✅ Crear lecciones en sus secciones
- ✅ Crear y configurar tareas
- ✅ Crear y configurar exámenes
- ✅ Importar preguntas desde Excel
- ✅ Calificar tareas y exámenes
- ✅ Configurar ponderaciones de evaluaciones
- ✅ Ver estudiantes inscritos en sus cursos
- ✅ Ver reportes de progreso de estudiantes
- ❌ NO puede crear cursos
- ❌ NO puede inscribir estudiantes

### 3. Estudiante
**Permisos de solo lectura y participación:**
- ✅ Ver cursos en los que está inscrito
- ✅ Acceder a lecciones disponibles
- ✅ Responder tareas
- ✅ Realizar exámenes
- ✅ Subir archivos en tareas
- ✅ Ver sus calificaciones
- ✅ Ver su progreso en cada curso
- ❌ NO puede crear ni editar contenido

---

## 🚀 Características Principales

### 📚 Gestión de Cursos
- Creación y organización de cursos
- Estructura jerárquica: Curso > Sección > Lección/Tarea/Examen
- Inscripción manual de estudiantes por administrador
- Asignación de profesores a cursos

### 📖 Secciones y Lecciones
- **Tipos de contenido en lecciones:**
  - Texto enriquecido (editor WYSIWYG)
  - Imágenes
  - Documentos PDF
  - Videos embebidos de YouTube
  
- **Configuración de secciones:**
  - Todas las secciones habilitadas desde el inicio
  - Desbloqueo progresivo según avance del estudiante
  - Prerrequisitos configurables

### 📝 Tareas
**Configuración:**
- Título y descripción
- Fecha de inicio y fecha límite
- Tipo de entrega: texto, archivo o ambos
- Tamaño máximo de archivo
- Ponderación en la calificación final
- Instrucciones detalladas

**Funcionalidades:**
- Subida de archivos por estudiantes
- Respuestas en texto
- Calificación manual por profesor/admin
- Retroalimentación personalizada
- Historial de entregas

### 📊 Exámenes
**Configuración:**
- Título y descripción
- Fecha y hora de inicio
- Fecha y hora de fin
- Duración máxima (tiempo límite)
- Número de intentos permitidos
- Mostrar/ocultar respuestas correctas al finalizar
- Mezclar preguntas (orden aleatorio)
- Ponderación en la calificación final
- Nota mínima de aprobación

**Tipos de preguntas:**
- Opción múltiple (selección única)
- Opción múltiple (selección múltiple)
- Verdadero/Falso
- Respuesta corta
- Rellenar espacios en blanco

**Importación de preguntas:**
- Desde archivos Excel (.xlsx)
- Formato estandarizado
- Importación masiva
- Validación de formato

**Funcionalidades:**
- Calificación automática
- Banco de preguntas
- Feedback por pregunta
- Estadísticas de desempeño

### 📈 Sistema de Calificaciones
- Configuración de ponderaciones por curso
- Cálculo automático de promedio ponderado
- Libro de calificaciones por estudiante
- Exportación de calificaciones a Excel
- Gráficas de progreso
- Historial de calificaciones

### 📊 Progreso del Estudiante
- Porcentaje de avance por curso
- Secciones completadas vs pendientes
- Tareas entregadas vs pendientes
- Exámenes realizados vs pendientes
- Promedio actual del curso
- Dashboard visual con gráficas

---

## 🏗️ Arquitectura Técnica

### Frontend
```
Angular 17+ (Standalone Components)
├── TypeScript
├── Angular Material / PrimeNG (UI Components)
├── RxJS (Reactive Programming)
├── Angular Router (Navegación)
├── Angular Forms (Reactive Forms)
└── Chart.js / ApexCharts (Gráficas)
```

### Backend & Almacenamiento (Opciones Gratuitas)

#### **Opción 1: Firebase (Recomendada) - Google**
```
Firebase
├── Authentication (Login/Registro)
├── Firestore Database (NoSQL)
├── Storage (Archivos/Imágenes)
├── Hosting (Deploy gratuito)
└── Functions (Serverless - opcional)

Límites gratuitos:
- Firestore: 1 GB almacenamiento, 50K lecturas/día
- Storage: 5 GB almacenamiento
- Authentication: Ilimitado
- Hosting: 10 GB/mes
```

#### **Opción 2: Supabase (Alternativa Open Source)**
```
Supabase
├── Auth (Sistema de autenticación)
├── PostgreSQL Database (500 MB)
├── Storage (1 GB archivos)
├── Real-time subscriptions
└── Edge Functions

Límites gratuitos:
- Database: 500 MB
- Storage: 1 GB
- Usuarios: Ilimitados
```

#### **Opción 3: Combinación de servicios**
```
MongoDB Atlas (500 MB gratuito) - Base de datos
+ Cloudinary (10 GB gratuito) - Imágenes
+ Firebase Storage (5 GB) - Archivos PDF
+ Auth0 / Clerk (Free tier) - Autenticación
```

### Recomendación Final
**Firebase** es la mejor opción porque:
- Todo integrado en una plataforma
- SDK oficial de Angular
- Escalable si crece el proyecto
- Deploy gratuito incluido
- Documentación excelente en español

---

## 📁 Estructura del Proyecto Angular

```
escuela-biblica-app/
│
├── src/
│   ├── app/
│   │   ├── core/                          # Servicios core, guards, interceptors
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── admin.guard.ts
│   │   │   │   └── profesor.guard.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── storage.service.ts
│   │   │   │   └── notification.service.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── course.model.ts
│   │   │       ├── lesson.model.ts
│   │   │       ├── task.model.ts
│   │   │       └── exam.model.ts
│   │   │
│   │   ├── features/                      # Módulos por funcionalidad
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── admin-dashboard/
│   │   │   │   ├── profesor-dashboard/
│   │   │   │   └── estudiante-dashboard/
│   │   │   │
│   │   │   ├── courses/
│   │   │   │   ├── course-list/
│   │   │   │   ├── course-detail/
│   │   │   │   ├── course-create/
│   │   │   │   └── course-enrollment/
│   │   │   │
│   │   │   ├── sections/
│   │   │   │   ├── section-list/
│   │   │   │   ├── section-create/
│   │   │   │   └── section-config/
│   │   │   │
│   │   │   ├── lessons/
│   │   │   │   ├── lesson-view/
│   │   │   │   ├── lesson-create/
│   │   │   │   └── lesson-edit/
│   │   │   │
│   │   │   ├── tasks/
│   │   │   │   ├── task-list/
│   │   │   │   ├── task-create/
│   │   │   │   ├── task-view/
│   │   │   │   ├── task-submit/
│   │   │   │   └── task-grade/
│   │   │   │
│   │   │   ├── exams/
│   │   │   │   ├── exam-list/
│   │   │   │   ├── exam-create/
│   │   │   │   ├── exam-take/
│   │   │   │   ├── exam-results/
│   │   │   │   └── question-import/
│   │   │   │
│   │   │   ├── grades/
│   │   │   │   ├── gradebook/
│   │   │   │   ├── grade-config/
│   │   │   │   └── student-progress/
│   │   │   │
│   │   │   └── users/
│   │   │       ├── user-list/
│   │   │       ├── user-create/
│   │   │       └── user-edit/
│   │   │
│   │   ├── shared/                        # Componentes compartidos
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── sidebar/
│   │   │   │   ├── file-upload/
│   │   │   │   ├── rich-text-editor/
│   │   │   │   ├── youtube-embed/
│   │   │   │   ├── pdf-viewer/
│   │   │   │   ├── progress-bar/
│   │   │   │   └── confirmation-dialog/
│   │   │   ├── pipes/
│   │   │   │   ├── date-format.pipe.ts
│   │   │   │   └── file-size.pipe.ts
│   │   │   └── directives/
│   │   │       └── role-access.directive.ts
│   │   │
│   │   ├── static-pages/                  # Páginas estáticas actuales
│   │   │   ├── home/                      # index.html convertido
│   │   │   ├── nivel-basico/              # nivelBasico.html
│   │   │   └── nivel-avanzado/            # nivelAvanzado.html
│   │   │
│   │   └── app.routes.ts                  # Rutas principales
│   │
│   ├── assets/                            # Recursos estáticos
│   │   ├── img/
│   │   ├── css/
│   │   └── js/
│   │
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.prod.ts
│   │
│   └── styles.scss                        # Estilos globales
│
├── firebase.json                          # Configuración Firebase
├── .firebaserc
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 🗄️ Modelo de Datos

### Usuario
```typescript
interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: 'admin' | 'profesor' | 'estudiante';
  fotoPerfil?: string;
  fechaRegistro: Date;
  activo: boolean;
  cursosInscritos?: string[]; // IDs de cursos (solo estudiantes)
  cursosAsignados?: string[]; // IDs de cursos (solo profesores)
}
```

### Curso
```typescript
interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  imagen?: string;
  profesorId: string;
  fechaCreacion: Date;
  activo: boolean;
  estudiantes: string[]; // IDs de estudiantes
  secciones: string[]; // IDs de secciones
  configuracionCalificaciones: ConfiguracionCalificacion;
}
```

### Sección
```typescript
interface Seccion {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  orden: number;
  desbloqueoProgresivo: boolean;
  prerequisitos?: string[]; // IDs de secciones previas
  elementos: ElementoSeccion[]; // Lecciones, tareas, exámenes
}
```

### Lección
```typescript
interface Leccion {
  id: string;
  seccionId: string;
  titulo: string;
  tipo: 'texto' | 'imagen' | 'pdf' | 'video';
  contenido: string;
  urlArchivo?: string;
  urlYoutube?: string;
  orden: number;
  fechaCreacion: Date;
}
```

### Tarea
```typescript
interface Tarea {
  id: string;
  seccionId: string;
  titulo: string;
  descripcion: string;
  instrucciones: string;
  tipoEntrega: 'texto' | 'archivo' | 'ambos';
  fechaInicio: Date;
  fechaFin: Date;
  ponderacion: number; // %
  archivosPermitidos?: string[]; // ['.pdf', '.docx', '.jpg']
  tamanoMaximo: number; // MB
  fechaCreacion: Date;
}
```

### Entrega Tarea
```typescript
interface EntregaTarea {
  id: string;
  tareaId: string;
  estudianteId: string;
  fechaEntrega: Date;
  contenidoTexto?: string;
  archivos?: string[]; // URLs
  calificacion?: number;
  retroalimentacion?: string;
  estado: 'pendiente' | 'entregada' | 'calificada' | 'retrasada';
}
```

### Examen
```typescript
interface Examen {
  id: string;
  seccionId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: Date;
  fechaFin: Date;
  duracionMinutos: number;
  intentosPermitidos: number;
  mostrarRespuestas: boolean;
  mezclarPreguntas: boolean;
  ponderacion: number; // %
  notaMinima: number;
  preguntas: Pregunta[];
  fechaCreacion: Date;
}
```

### Pregunta
```typescript
interface Pregunta {
  id: string;
  texto: string;
  tipo: 'multiple_unica' | 'multiple_multiple' | 'verdadero_falso' | 'corta' | 'completar';
  opciones?: OpcionRespuesta[];
  respuestaCorrecta: string | string[];
  puntos: number;
  feedback?: string;
}

interface OpcionRespuesta {
  id: string;
  texto: string;
  esCorrecta: boolean;
}
```

### Intento Examen
```typescript
interface IntentoExamen {
  id: string;
  examenId: string;
  estudianteId: string;
  numeroIntento: number;
  fechaInicio: Date;
  fechaFin?: Date;
  respuestas: RespuestaEstudiante[];
  calificacion?: number;
  estado: 'en_progreso' | 'finalizado' | 'tiempo_agotado';
}

interface RespuestaEstudiante {
  preguntaId: string;
  respuesta: string | string[];
  esCorrecta?: boolean;
  puntosObtenidos?: number;
}
```

### Configuración Calificaciones
```typescript
interface ConfiguracionCalificacion {
  cursoId: string;
  elementos: ElementoCalificacion[];
}

interface ElementoCalificacion {
  id: string;
  tipo: 'tarea' | 'examen';
  nombre: string;
  ponderacion: number; // %
}
```

### Progreso Estudiante
```typescript
interface ProgresoEstudiante {
  id: string;
  estudianteId: string;
  cursoId: string;
  porcentajeAvance: number;
  leccionesCompletadas: string[];
  tareasEntregadas: string[];
  examenesRealizados: string[];
  calificacionActual: number;
  ultimaActividad: Date;
}
```

---

## 🔐 Sistema de Autenticación

### Flujo de Autenticación
1. **Registro:** Solo admin puede crear usuarios
2. **Login:** Email y contraseña
3. **Tokens:** JWT o Firebase Auth Tokens
4. **Guards:** Protección de rutas por rol
5. **Recuperación:** Correo de reseteo de contraseña

### Rutas Protegidas
```typescript
// Rutas públicas
/home
/nivel-basico
/nivel-avanzado
/login

// Rutas autenticadas
/dashboard (redirige según rol)

// Rutas admin
/admin/cursos
/admin/usuarios
/admin/reportes

// Rutas profesor
/profesor/cursos
/profesor/secciones
/profesor/calificaciones

// Rutas estudiante
/estudiante/mis-cursos
/estudiante/calificaciones
/estudiante/progreso
```

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "@angular/core": "^17.0.0",
    "@angular/material": "^17.0.0",
    "@angular/fire": "^17.0.0",
    "firebase": "^10.0.0",
    "chart.js": "^4.0.0",
    "ng2-charts": "^5.0.0",
    "ngx-quill": "^24.0.0",
    "ngx-extended-pdf-viewer": "^19.0.0",
    "@ng-bootstrap/ng-bootstrap": "^16.0.0",
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.14.0"
  },
  "devDependencies": {
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "^5.2.0"
  }
}
```

---

## 🚦 Roadmap de Implementación

### **Fase 1: Setup Inicial (Semana 1-2)** ✅ COMPLETADA
- [x] Crear proyecto Angular 17
- [x] Configurar Firebase
- [x] Migrar páginas estáticas actuales
- [x] Implementar routing básico
- [x] Diseñar estructura de carpetas

### **Fase 2: Autenticación (Semana 3)** ✅ COMPLETADA
- [x] Implementar login/registro
- [x] Crear guards por rol
- [x] Sistema de recuperación de contraseña
- [x] Perfiles de usuario
- [x] CRUD completo de usuarios (admin)
- [x] Integración con Cloudinary para fotos de perfil

### **Fase 3: Dashboard y Navegación (Semana 4)** ✅ COMPLETADA
- [x] Dashboard de admin con estadísticas reales
- [x] Dashboard de profesor
- [x] Dashboard de estudiante
- [x] Navegación y header
- [x] Detección de sesión en home

### **Fase 4: Gestión de Cursos (Semana 5-6)** ✅ COMPLETADA
- [x] CRUD de cursos (admin)
- [x] Listado de cursos con filtros
- [x] Inscripción de estudiantes (modal multi-selección)
- [x] Asignación de profesores
- [x] Subida de imágenes de cursos (Cloudinary)
- [x] Sincronización automática cursosInscritos/cursosAsignados

### **Fase 5: Secciones y Lecciones (Semana 7-8)** ⏳ SIGUIENTE FASE
- [ ] CRUD de secciones
- [ ] Creación de lecciones (texto, imagen, PDF, YouTube)
- [ ] Editor de texto enriquecido
- [ ] Subida de archivos
- [ ] Vista de lecciones para estudiantes

### **Fase 6: Sistema de Tareas (Semana 9-10)**
- [ ] Creación de tareas
- [ ] Configuración de fechas y entregas
- [ ] Interfaz de envío para estudiantes
- [ ] Subida de archivos
- [ ] Calificación de tareas
- [ ] Retroalimentación

### **Fase 7: Sistema de Exámenes (Semana 11-13)**
- [ ] Creación de exámenes
- [ ] Banco de preguntas
- [ ] Importación desde Excel
- [ ] Interfaz de examen para estudiantes
- [ ] Temporizador
- [ ] Calificación automática
- [ ] Mostrar resultados

### **Fase 8: Calificaciones y Progreso (Semana 14-15)**
- [ ] Configuración de ponderaciones
- [ ] Libro de calificaciones
- [ ] Cálculos automáticos
- [ ] Dashboard de progreso estudiante
- [ ] Gráficas y estadísticas
- [ ] Exportación de calificaciones

### **Fase 9: Desbloqueo Progresivo (Semana 16)**
- [ ] Sistema de prerrequisitos
- [ ] Lógica de desbloqueo
- [ ] Indicadores visuales de progreso
- [ ] Configuración por sección

### **Fase 10: Testing y Deploy (Semana 17-18)**
- [ ] Pruebas unitarias
- [ ] Pruebas de integración
- [ ] Pruebas de usuario
- [ ] Optimización de rendimiento
- [ ] Deploy a Firebase Hosting

---

## 📊 Funcionalidades Extras (Futuras)

### Posibles Mejoras
- 💬 Chat en tiempo real entre estudiantes y profesores
- 📧 Notificaciones por email
- 🔔 Notificaciones push
- 📱 Progressive Web App (PWA)
- 🌐 Soporte multiidioma
- 🎨 Temas personalizables
- 📅 Calendario de actividades
- 🏆 Sistema de gamificación (badges, puntos)
- 📊 Reportes avanzados con BI
- 🎥 Videoconferencias integradas
- 📝 Foros de discusión
- 🤖 Certificados automáticos al completar cursos

---

## 💾 Formato Excel para Importación de Preguntas

### Estructura del archivo (.xlsx)

| Pregunta | Tipo | Opcion_A | Opcion_B | Opcion_C | Opcion_D | Respuesta_Correcta | Puntos | Feedback |
|----------|------|----------|----------|----------|----------|-------------------|---------|----------|
| ¿Cuál es la capital de Honduras? | multiple_unica | Tegucigalpa | San Pedro Sula | La Ceiba | Comayagua | A | 1 | Tegucigalpa es la capital desde 1880 |
| ¿Jesús nació en Belén? | verdadero_falso | Verdadero | Falso | | | A | 1 | Correcto, según Lucas 2:4-7 |

**Reglas:**
- Primera fila: encabezados
- Tipo: `multiple_unica`, `multiple_multiple`, `verdadero_falso`, `corta`
- Respuesta_Correcta: letra(s) de la opción (A, B, C, D) o texto para preguntas cortas
- Para múltiple respuesta: "A,C" (separadas por coma)

---

## 🔧 Configuración Firebase

### 1. Crear proyecto en Firebase Console
```
https://console.firebase.google.com/
```

### 2. Habilitar servicios necesarios
- Authentication (Email/Password)
- Firestore Database
- Storage
- Hosting

### 3. Configurar reglas de seguridad

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    function isProfesor() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'profesor';
    }
    
    function isEstudiante() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'estudiante';
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Courses collection
    match /cursos/{cursoId} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin();
    }
    
    // Sections collection
    match /secciones/{seccionId} {
      allow read: if request.auth != null;
      allow create, update, delete: if isAdmin() || isProfesor();
    }
    
    // Tasks submissions
    match /entregas/{entregaId} {
      allow read: if request.auth != null;
      allow create: if isEstudiante() && request.auth.uid == request.resource.data.estudianteId;
      allow update: if isAdmin() || isProfesor();
    }
    
    // Exam attempts
    match /intentos/{intentoId} {
      allow read: if request.auth != null;
      allow create, update: if isEstudiante() && request.auth.uid == request.resource.data.estudianteId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // User profile images
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Course materials (admin/profesor only)
    match /course-materials/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Validar rol en el cliente
    }
    
    // Student submissions
    match /submissions/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Variables de entorno (environment.ts)
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
  }
};
```

---

## 🎨 Diseño UI/UX

### Componentes de UI
- **Angular Material** para componentes base
- Paleta de colores consistente con la identidad actual
- Diseño responsive (mobile-first)
- Accesibilidad (WCAG 2.1)

### Vistas Principales
1. **Landing Page:** Mantener diseño actual
2. **Dashboard:** Cards con estadísticas y acceso rápido
3. **Lista de Cursos:** Grid con tarjetas
4. **Vista de Curso:** Sidebar con secciones, contenido central
5. **Examen:** Fullscreen, pregunta por pregunta
6. **Calificaciones:** Tabla con filtros y gráficas

---

## 📚 Recursos y Referencias

### Documentación Oficial
- [Angular Docs](https://angular.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Angular Material](https://material.angular.io/)

### Tutoriales Recomendados
- [Angular University - RxJS](https://angular-university.io/)
- [Fireship.io - Firebase + Angular](https://fireship.io/)

### Herramientas de Desarrollo
- VS Code + Angular Language Service
- Firebase Emulator Suite (desarrollo local)
- Chrome DevTools
- Postman (testing de APIs)

---

## 👨‍💻 Equipo y Contacto

**Proyecto Personal - Escuela Bíblica**

Para consultas o sugerencias sobre el proyecto, contactar al administrador.

---

## 📄 Licencia

Este proyecto es de uso interno para la Escuela Bíblica. Todos los derechos reservados.

---

## 🔄 Control de Versiones

### Versión 1.0.0 - Documentación Inicial
- Definición completa del alcance del proyecto
- Arquitectura técnica y modelo de datos
- Roadmap de implementación
- Configuración de Firebase

---

## ✅ Checklist de Inicio

Antes de comenzar el desarrollo:

- [ ] Crear cuenta de Firebase
- [ ] Configurar proyecto Firebase
- [ ] Instalar Node.js y Angular CLI
- [ ] Clonar/crear repositorio Git
- [ ] Instalar dependencias
- [ ] Configurar environment.ts
- [ ] Revisar y aprobar diseños de UI
- [ ] Definir sprint 1 del roadmap

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0
**Estado:** Documentación Completa - Listo para Desarrollo

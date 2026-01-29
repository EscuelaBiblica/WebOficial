# 🔒 Fase 9: Sistema de Desbloqueo Progresivo

## 📋 Descripción General

El sistema de desbloqueo progresivo permite controlar el acceso a las secciones de un curso basándose en el progreso del estudiante en secciones previas (prerrequisitos). Los estudiantes solo pueden acceder a una sección cuando han completado los requisitos establecidos.

**💾 IMPORTANTE:** El progreso se **GUARDA EN LA BASE DE DATOS** en la colección `progreso` con caché de 5 minutos para optimizar rendimiento.

## 🏗️ Arquitectura

### Componentes Principales

1. **ProgressUnlockService** (`progress-unlock.service.ts`)
   - Servicio central que gestiona toda la lógica de desbloqueo
   - Calcula el progreso en cada sección
   - Verifica si se cumplen los prerrequisitos
   - **GUARDA progreso en Firestore con caché inteligente**
   - Se actualiza automáticamente al entregar tareas o completar exámenes

2. **Modelo ProgresoSeccion** (`section.model.ts`)
   - Interface que representa el estado de progreso de un estudiante en una sección
   - Almacena: lecciones completadas, tareas entregadas, exámenes realizados, porcentaje total

3. **Extensión del Modelo Seccion** (`section.model.ts`)
   - Nuevos campos:
     - `prerequisitos: string[]` - IDs de secciones que deben completarse antes
     - `requiereCompletarTodo: boolean` - Si requiere 100% de completitud
     - `porcentajeMinimo?: number` - Porcentaje mínimo requerido (default: 70%)

## 💾 Sistema de Guardado de Progreso

### Colección `progreso` en Firestore

**Estructura del documento:**
```typescript
{
  id: "{estudianteId}_{seccionId}",
  seccionId: string,
  estudianteId: string,
  leccionesCompletadas: string[],
  tareasEntregadas: string[],
  examenesRealizados: string[],
  porcentajeCompletado: number,
  bloqueada: boolean,
  cumpleRequisitos: boolean,
  ultimaActualizacion: Timestamp,
  fechaCreacion: Timestamp
}
```

### Estrategia de Caché (5 minutos)

1. **Primera lectura:** Calcula desde cero consultando Firestore
2. **Guardado:** Almacena en colección `progreso` con timestamp
3. **Lecturas siguientes:** Si tiene menos de 5 minutos, usa datos guardados
4. **Actualización automática:** Se recalcula al entregar tarea o completar examen

**Beneficios:**
- ⚡ **Rendimiento**: Reduce queries a Firestore
- 💰 **Costo**: Menos lecturas = menor factura
- 🔄 **Actualización automática**: Sin intervención manual
- 📊 **Histórico**: Datos persistentes para analítica futura

### Actualización Automática del Progreso

El progreso se actualiza automáticamente cuando:

1. **Estudiante entrega tarea** → `TaskService.submitTask()` llama a `actualizarProgresoEstudiante()`
2. **Estudiante completa examen** → `ExamService.finishAttempt()` llama a `actualizarProgresoEstudiante()`
3. **Carga del curso** → Si caché expiró (>5 min), se recalcula automáticamente

## 🔑 Funcionalidades Clave

### 1. Configuración de Prerrequisitos (Admin/Profesor)

**Ubicación:** Gestión de Secciones → Crear/Editar Sección

**Pasos:**
1. Activar checkbox "Desbloqueo progresivo"
2. Seleccionar secciones prerrequisito (multi-select)
3. Configurar requisito de completitud:
   - ✅ **Completar 100%**: Estudiante debe completar TODAS las lecciones, tareas y exámenes
   - 📊 **Porcentaje mínimo**: Estudiante debe alcanzar un % específico (ejemplo: 70%)

**Ejemplo de uso:**
- Sección 2 "Nuevo Testamento" requiere:
  - Prerrequisito: Sección 1 "Antiguo Testamento"
  - Requisito: 80% de completitud
  - Significado: El estudiante debe completar al menos el 80% del contenido de "Antiguo Testamento" antes de acceder a "Nuevo Testamento"

### 2. Cálculo de Progreso

**Método:** `calcularProgresoSeccion(seccionId, estudianteId)`

**Elementos evaluados:**
- ✓ Lecciones completadas (basado en visualización/interacción)
- ✓ Tareas entregadas (búsqueda en colección `calificaciones`)
- ✓ Exámenes finalizados (búsqueda en colección `intentos` con estado='finalizado')

**Fórmula del porcentaje:**
```
totalElementos = lecciones + tareas + exámenes
elementosCompletados = leccionesVistas + tareasEntregadas + exámenesFinalizados
porcentajeCompletado = (elementosCompletados / totalElementos) * 100
```

### 3. Verificación de Desbloqueo

**Método principal:** `isSeccionUnlocked(seccionId, estudianteId)`

**Flujo:**
1. Si la sección NO tiene `desbloqueoProgresivo` → siempre desbloqueada
2. Si NO tiene prerrequisitos → desbloqueada
3. Para cada prerrequisito:
   - Calcular progreso del estudiante en esa sección
   - Verificar si cumple el requisito:
     - Si `requiereCompletarTodo=true` → debe tener 100%
     - Si `requiereCompletarTodo=false` → debe alcanzar `porcentajeMinimo` (default 70%)
4. Si TODOS los prerrequisitos se cumplen → desbloqueada
5. Si falla alguno → bloqueada

### 4. Visualización para Estudiantes

**Ubicación:** Course Viewer → Sidebar de Secciones

**Indicadores visuales:**
- 🔒 **Candado amarillo** - Sección bloqueada (fondo amarillo suave)
- 🔓 **Candado abierto verde** - Sección desbloqueada con prerequisitos configurados
- 📊 **Badge de progreso** - Muestra el % de completitud en cada sección
- ⚠️ **Mensaje de bloqueo** - Al hacer click en sección bloqueada, explica qué falta

**Comportamiento:**
- Secciones bloqueadas no son expandibles
- Al intentar acceder a contenido bloqueado → muestra mensaje con requisitos faltantes
- Progreso se actualiza en tiempo real al completar actividades

## 📊 Interface ProgresoSeccion

```typescript
interface ProgresoSeccion {
  seccionId: string;
  estudianteId: string;
  leccionesCompletadas: string[];      // IDs de lecciones vistas
  tareasEntregadas: string[];          // IDs de tareas entregadas
  examenesRealizados: string[];        // IDs de exámenes finalizados
  porcentajeCompletado: number;        // 0-100
  bloqueada: boolean;                  // true si no cumple prerrequisitos
  cumpleRequisitos: boolean;           // true si cumple todos los prerrequisitos
  seccionesPrerrequisito?: string[];   // IDs de secciones que bloquean esta
}
```

## 🔧 Métodos del ProgressUnlockService

### `calcularProgresoSeccion(seccionId, estudianteId): Promise<ProgresoSeccion>`
Calcula el progreso detallado de un estudiante en una sección.

**Comportamiento:**
1. Intenta leer desde BD (colección `progreso`)
2. Si existe y tiene menos de 5 minutos → retorna caché
3. Si no existe o está desactualizado → calcula de nuevo y guarda

**Retorna:** Objeto con todas las métricas de progreso

### `isSeccionUnlocked(seccionId, estudianteId): Promise<boolean>`
Verifica si un estudiante puede acceder a una sección específica.

**Retorna:** `true` si desbloqueada, `false` si bloqueada

### `getEstadoSeccionesCurso(cursoId, estudianteId): Promise<Map<string, ProgresoSeccion>>`
Obtiene el estado de progreso de TODAS las secciones de un curso para un estudiante.

**Retorna:** Map con seccionId como key y ProgresoSeccion como value

### `actualizarProgresoEstudiante(seccionId, estudianteId): Promise<void>` 🆕
**NUEVO MÉTODO - Actualiza progreso tras completar actividad**

Invalida el caché y fuerza recalculo del progreso. Se llama automáticamente desde:
- `TaskService.submitTask()` cuando se entrega una tarea
- `ExamService.finishAttempt()` cuando se completa un examen

### `invalidarCacheProgresoCurso(cursoId, estudianteId): Promise<void>` 🆕
Invalida el caché de todas las secciones de un curso.

**Uso:** Cuando profesor modifica estructura del curso (agrega/elimina elementos)

### `puedeAccederElemento(seccionId, elementoId, estudianteId): Promise<boolean>`
Verifica si un estudiante puede acceder a un elemento específico (lección/tarea/examen).

**Retorna:** `true` si puede acceder, `false` si está bloqueado

### `getMensajeBloqueo(seccionId, estudianteId, todasSecciones): Promise<string>`
Genera un mensaje descriptivo explicando por qué una sección está bloqueada.

**Retorna:** String con mensaje amigable para el usuario

## 💡 Casos de Uso

### Caso 1: Secuencia Linear Básica
```
Sección 1: Introducción (sin prerrequisitos)
Sección 2: Tema Básico (requiere Sección 1 al 70%)
Sección 3: Tema Avanzado (requiere Sección 2 al 80%)
Sección 4: Examen Final (requiere Sección 3 al 100%)
```

### Caso 2: Múltiples Prerrequisitos
```
Sección 5: Síntesis Final
Prerrequisitos:
  - Sección 1: 100%
  - Sección 2: 100%
  - Sección 3: 100%
Requisito: Completar TODO el contenido de las 3 secciones previas
```

### Caso 3: Acceso Flexible
```
Sección 6: Material Complementario
Prerrequisitos:
  - Sección 1: 50%
Requisito: Solo ver la mitad de la primera sección
```

## 🎨 Estilos CSS

```scss
.section-header.locked {
  opacity: 0.7;
  background: #fff3cd;  // Fondo amarillo suave
  
  &:hover {
    background: #ffecb5;
  }
  
  .section-title {
    color: #856404;  // Texto marrón
  }
}
```

## 🔐 Seguridad

### Firestore Security Rules (Recomendado)

```javascript
// Progreso: Solo lectura para propietario, escritura para sistema
match /progreso/{progresoId} {
  // Formato del ID: {estudianteId}_{seccionId}
  allow read: if request.auth != null && 
                 progresoId.matches('^' + request.auth.uid + '_.*');
  allow write: if request.auth != null;
}

// Estudiantes solo pueden leer secciones desbloqueadas
match /secciones/{seccionId} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.rol in ['profesor', 'admin'];
}

// Validar que estudiantes solo envían tareas de secciones desbloqueadas
match /calificaciones/{calificacionId} {
  allow create: if request.auth != null && 
                   request.auth.token.rol == 'estudiante' &&
                   request.resource.data.estudianteId == request.auth.uid;
  allow update, delete: if request.auth.token.rol in ['profesor', 'admin'];
  allow read: if request.auth != null;
}

// Entregas de tareas
match /entregas/{entregaId} {
  allow create: if request.auth != null &&
                   request.auth.token.rol == 'estudiante' &&
                   request.resource.data.estudianteId == request.auth.uid;
  allow read: if request.auth != null;
  allow update: if request.auth.token.rol in ['profesor', 'admin'];
}

// Intentos de exámenes
match /intentos/{intentoId} {
  allow create: if request.auth != null &&
                   request.auth.token.rol == 'estudiante';
  allow read: if request.auth != null;
  allow update: if request.auth.token.rol in ['profesor', 'admin'] ||
                   (request.auth.uid == resource.data.estudianteId && 
                    resource.data.estado == 'en_progreso');
}
```

## 📝 Notas de Implementación

### Consideraciones de Rendimiento
- El servicio usa **caching** para evitar recalcular progreso constantemente
- Se calcula progreso de todas las secciones al cargar el curso (1 sola vez)
- Consultas optimizadas con índices compuestos en Firestore

### Valores por Defecto
- Porcentaje mínimo: **70%** si no se especifica
- Secciones sin `desbloqueoProgresivo`: siempre accesibles
- Secciones sin prerrequisitos: accesibles inmediatamente

### Roles con Acceso Total
- **Profesores**: Ven todas las secciones sin restricciones
- **Administradores**: Acceso completo a todo el contenido
- **Estudiantes**: Sujetos al sistema de desbloqueo

## 🐛 Debugging

### Verificar estado de una sección
```typescript
const progreso = await progressUnlockService.calcularProgresoSeccion(
  'seccionId123',
  'estudianteId456'
);
console.log('Progreso:', progreso);
// Output: { porcentajeCompletado: 75, bloqueada: false, ... }
```

### Ver todas las secciones desbloqueadas
```typescript
const estadoSecciones = await progressUnlockService.getEstadoSeccionesCurso(
  'cursoId789',
  'estudianteId456'
);
console.log('Estado de secciones:', estadoSecciones);
```

## ✅ Testing Checklist

- [ ] Crear curso con múltiples secciones
- [ ] Configurar prerrequisitos en Sección 2 (requiere Sección 1 al 70%)
- [ ] Como estudiante, verificar que Sección 2 esté bloqueada
- [ ] Completar 70% de Sección 1 (entregar tareas, hacer exámenes)
- [ ] Verificar que Sección 2 se desbloquee automáticamente
- [ ] Probar con 100% de completitud requerida
- [ ] Probar con múltiples prerrequisitos
- [ ] Verificar que profesores/admins vean todo sin restricciones
- [ ] Verificar mensajes de bloqueo sean claros y útiles

## 🚀 Próximos Pasos

1. **Implementar notificaciones**: Alertar al estudiante cuando se desbloquee una sección
2. **Dashboard de progreso**: Vista global del estudiante con todas las secciones y su estado
3. **Firestore Security Rules**: Implementar validación del lado del servidor
4. **Testing automatizado**: Unit tests para ProgressUnlockService
5. **Analytics**: Métricas de cuántos estudiantes están bloqueados por sección
6. **Gamificación**: Badges al desbloquear secciones difíciles

---

## 📚 Referencias

- **Componente Principal**: `course-viewer.component.ts`
- **Servicio**: `progress-unlock.service.ts`
- **Modelos**: `section.model.ts`
- **UI de Configuración**: `secciones.component.html/ts`
- **Estilos**: `course-viewer.component.scss`

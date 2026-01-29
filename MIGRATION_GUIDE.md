# Guía de Migración: Tareas dentro de Lecciones

## Resumen de Cambios

Se ha refactorizado la estructura del sistema para que las **tareas** estén anidadas dentro de **lecciones**, en lugar de estar al mismo nivel en las secciones.

### Estructura Anterior
```
Curso → Sección → [Lección | Tarea | Examen]
```

### Nueva Estructura
```
Curso → Sección → [Lección (con tareas[]) | Examen]
```

## Cambios en el Código

### 1. Modelos

#### `lesson.model.ts`
```typescript
export interface Leccion {
  id: string;
  seccionId: string;
  titulo: string;
  tipo: 'texto' | 'imagen' | 'pdf' | 'video';
  contenido: string;
  urlArchivo?: string;
  urlYoutube?: string;
  orden: number;
  tareas: string[];  // ✅ NUEVO: Array de IDs de tareas
  fechaCreacion: Date;
}
```

#### `task.model.ts`
```typescript
export interface Tarea {
  id: string;
  leccionId: string;  // ✅ CAMBIADO: era seccionId
  titulo: string;
  descripcion: string;
  // ... resto sin cambios
}
```

#### `section.model.ts`
```typescript
export interface ElementoSeccion {
  id: string;
  tipo: 'leccion' | 'examen';  // ✅ CAMBIADO: eliminado 'tarea'
  orden: number;
}
```

### 2. Servicios

#### `LessonService`
**Nuevos métodos:**
- `addTaskToLesson(lessonId: string, tareaId: string)`: Agrega ID de tarea al array
- `removeTaskFromLesson(lessonId: string, tareaId: string)`: Remueve ID de tarea del array
- `createLesson()`: Ahora inicializa `tareas: []`

#### `TaskService`
**Cambios:**
- `getTasksBySection()` → `getTasksByLesson(leccionId: string)`
- `createTask()`: Ahora usa `leccionId` y llama a `lessonService.addTaskToLesson()`
- `deleteTask()`: Llama a `lessonService.removeTaskFromLesson()`

#### `SectionService`
**Cambios:**
- `addElementToSection()`: Tipo ahora es `'leccion' | 'examen'` (sin 'tarea')

### 3. Componentes

#### `CourseViewerComponent`
- **Nuevas interfaces:**
  - `LeccionConTareas`: Extiende `Leccion` con `tareasData: Tarea[]` y `expanded: boolean`
  - `SeccionExpandida`: Ahora tiene `lecciones: LeccionConTareas[]` en vez de `elementos`

- **Nuevos métodos:**
  - `toggleLeccion(leccion)`: Expande/colapsa lista de tareas
  - `loadLeccion(seccion, leccion)`: Carga contenido de lección
  - `loadTarea(seccion, tarea)`: Carga tarea con entrega del estudiante

- **Actualizado:**
  - `loadCurso()`: Carga jerarquía completa (secciones → lecciones → tareas)
  - HTML: Muestra estructura jerárquica con badges de cantidad de tareas

#### `TareasComponent`
- **Cambiado de:** Gestión de tareas por sección
- **A:** Gestión de tareas por lección
- Usa `LessonService` en vez de `SectionService`
- Parámetro de ruta: `/lecciones/:leccionId/tareas`

### 4. Rutas

```typescript
// ANTES:
{ path: 'secciones/:seccionId/tareas', ... }

// AHORA:
{ path: 'lecciones/:leccionId/tareas', ... }
```

## Migración de Datos en Firebase

### ⚠️ ACCIÓN REQUERIDA

Las tareas existentes en Firestore tienen el campo `seccionId` y necesitan ser migradas:

1. **Actualizar campo de cada tarea:**
   - Cambiar `seccionId` → `leccionId`
   - Asignar cada tarea a una lección específica

2. **Actualizar documentos de lecciones:**
   - Agregar campo `tareas: []` con los IDs correspondientes

3. **Limpiar elementos de secciones:**
   - Remover elementos con `tipo: 'tarea'` de `section.elementos`

### Script de Migración (Manual via Firebase Console)

Para cada **Tarea** en la colección `tareas`:

1. Identificar a qué lección pertenece (basado en orden o criterio de negocio)
2. Actualizar el documento:
   ```
   Campo: seccionId → leccionId
   Valor: [ID de la lección correspondiente]
   ```

Para cada **Lección** en la colección `lecciones`:

3. Agregar nuevo campo:
   ```
   tareas: [array de IDs de tareas que pertenecen a esta lección]
   ```

Para cada **Sección** en la colección `secciones`:

4. Actualizar campo `elementos`:
   - Filtrar para mantener solo elementos con `tipo: 'leccion'` o `tipo: 'examen'`
   - Eliminar cualquier elemento con `tipo: 'tarea'`

### Ejemplo de Migración

**ANTES - Documento de Tarea:**
```json
{
  "id": "tarea123",
  "seccionId": "seccion456",  // ❌ Campo antiguo
  "titulo": "Tarea 1",
  "descripcion": "...",
  ...
}
```

**DESPUÉS - Documento de Tarea:**
```json
{
  "id": "tarea123",
  "leccionId": "leccion789",  // ✅ Campo nuevo
  "titulo": "Tarea 1",
  "descripcion": "...",
  ...
}
```

**ANTES - Documento de Lección:**
```json
{
  "id": "leccion789",
  "seccionId": "seccion456",
  "titulo": "Lección 1",
  ...
  // ❌ Sin campo tareas
}
```

**DESPUÉS - Documento de Lección:**
```json
{
  "id": "leccion789",
  "seccionId": "seccion456",
  "titulo": "Lección 1",
  ...
  "tareas": ["tarea123", "tarea124"]  // ✅ Array de IDs
}
```

**ANTES - Documento de Sección:**
```json
{
  "id": "seccion456",
  "elementos": [
    { "id": "leccion789", "tipo": "leccion", "orden": 0 },
    { "id": "tarea123", "tipo": "tarea", "orden": 1 },    // ❌ A eliminar
    { "id": "examen001", "tipo": "examen", "orden": 2 }
  ]
}
```

**DESPUÉS - Documento de Sección:**
```json
{
  "id": "seccion456",
  "elementos": [
    { "id": "leccion789", "tipo": "leccion", "orden": 0 },
    { "id": "examen001", "tipo": "examen", "orden": 1 }  // ✅ Solo lecciones y exámenes
  ]
}
```

## Compatibilidad

### ✅ Compatible hacia adelante
- Nuevos cursos funcionarán correctamente con la nueva estructura

### ⚠️ NO compatible hacia atrás
- Cursos existentes con tareas NO funcionarán hasta migrar datos
- El sistema espera `leccionId` en tareas y `tareas[]` en lecciones

## Ventajas de la Nueva Estructura

1. **Mejor organización**: Tareas están claramente asociadas a lecciones específicas
2. **Navegación mejorada**: Jerarquía visual Sección → Lección → Tareas
3. **Separación de conceptos**: Exámenes al nivel de sección, tareas al nivel de lección
4. **Escalabilidad**: Más fácil agregar múltiples tareas a una lección
5. **UI más clara**: Badges muestran cantidad de tareas por lección

## Roles y Permisos

Los permisos se mantienen igual:

- **Admin**: Full CRUD en todo
- **Profesor**: Puede crear/editar lecciones y tareas dentro de sus cursos
- **Estudiante**: Puede ver lecciones, ver tareas disponibles, y entregar tareas

## Próximos Pasos

1. ✅ Completar implementación del sistema de exámenes
2. ⚠️ Migrar datos existentes en Firebase
3. ✅ Verificar permisos por rol
4. ⏳ Testing completo de la nueva jerarquía

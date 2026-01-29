# 📋 Guía de Acceso al Sistema de Exámenes

## 🔐 Acceso al Sistema

### Como Administrador o Profesor

1. **Iniciar sesión** con cuenta de administrador o profesor
2. **Ir al Dashboard** correspondiente (Admin o Profesor)
3. **Seleccionar un Curso** desde la lista de cursos
4. **Ver las Secciones** del curso

## 📝 Gestión de Exámenes

### Acceder a los Exámenes de una Sección

**Desde el listado de Secciones:**
- Cada sección tiene un botón **"Exámenes"** (icono de archivo)
- Click en el botón **"Exámenes"** de la sección deseada
- Se abrirá la lista de exámenes de esa sección

### Crear un Nuevo Examen

1. **En la lista de exámenes**, click en **"Crear Examen"**
2. **Llenar el formulario:**

   **Información General:**
   - Título del examen
   - Descripción (opcional)
   - Fecha de inicio (cuándo estará disponible)
   - Fecha de fin (cuándo se cierra)

   **Configuración:**
   - Duración (minutos)
   - Intentos permitidos
   - Ponderación (% del curso)
   - Nota mínima para aprobar (%)
   - ☑️ Mezclar preguntas (aleatorio)
   - ☑️ Mostrar respuestas correctas al finalizar

3. **Agregar Preguntas** (mínimo 1)
   - Click en **"Agregar Pregunta"**
   - Para cada pregunta:
     * Seleccionar tipo de pregunta
     * Escribir el texto de la pregunta
     * Asignar puntos
     * Configurar respuestas según el tipo

4. **Guardar** el examen

### Tipos de Preguntas Disponibles

#### 1. **Opción Múltiple (Respuesta Única)**
- Agregar varias opciones
- Marcar UNA como correcta
- Al menos 2 opciones necesarias

#### 2. **Opción Múltiple (Múltiples Respuestas)**
- Agregar varias opciones
- Marcar TODAS las correctas
- El estudiante puede seleccionar varias

#### 3. **Verdadero/Falso**
- Automáticamente crea 2 opciones
- Marcar la correcta (Verdadero o Falso)

#### 4. **Respuesta Corta**
- Escribir la respuesta correcta en el campo
- La comparación es insensible a mayúsculas/minúsculas

#### 5. **Completar Espacio**
- Similar a respuesta corta
- Para rellenar espacios en blanco

### Editar un Examen

1. En la lista de exámenes, click en **"Editar"**
2. Modificar cualquier campo
3. **Guardar cambios**

### Eliminar un Examen

1. En la lista de exámenes, click en **"Eliminar"**
2. Confirmar la eliminación

### Ver Intentos de Estudiantes

1. En la lista de exámenes, click en **"Ver Intentos"**
2. Ver todos los intentos realizados por los estudiantes
3. Ver calificaciones y detalles

## 👨‍🎓 Como Estudiante

### Tomar un Examen

1. **Ir al curso** desde el dashboard de estudiante
2. **Navegar a la sección** que contiene el examen
3. **En el sidebar**, ver la sección de "Exámenes"
4. **Click en un examen** para ver sus detalles
5. **Click en "Comenzar Examen"** (si está disponible)
6. **Responder las preguntas**
   - Usar la navegación para ir entre preguntas
   - El progreso se guarda automáticamente cada 30 segundos
   - Ver el cronómetro en la parte superior
7. **Enviar el examen** cuando termine
8. **Ver resultados** inmediatamente

### Ver Resultados

1. En la vista del examen, ver el **Historial de Intentos**
2. Click en **"Ver Resultados"** de cualquier intento
3. Ver:
   - Calificación obtenida
   - Respuestas correctas e incorrectas (si está habilitado)
   - Retroalimentación por pregunta
   - Puntos obtenidos

## 🎯 Estados de Examen

- **Disponible** (verde): Puede tomarse ahora
- **Próximamente** (amarillo): Aún no está disponible
- **Cerrado** (rojo): Ya pasó la fecha límite
- **Sin intentos** (rojo): Agotó todos los intentos permitidos

## 📊 Características del Sistema

### ✅ Funcionalidades Implementadas

- ✅ CRUD completo de exámenes
- ✅ 5 tipos de preguntas
- ✅ Cronómetro con alertas
- ✅ Auto-guardado de progreso
- ✅ Calificación automática
- ✅ Múltiples intentos configurables
- ✅ Mezcla aleatoria de preguntas
- ✅ Mostrar/ocultar respuestas correctas
- ✅ Historial de intentos
- ✅ Vista de resultados detallada
- ✅ Integración con visor de cursos
- ✅ Control de fechas de disponibilidad
- ✅ Ponderación en calificación final

### 🔜 Pendientes (No implementados aún)

- ⏳ Importación desde Excel
- ⏳ Vista de lista de intentos para profesor
- ⏳ Exportación de resultados
- ⏳ Banco de preguntas reutilizables

## 🚀 Flujo Completo de Prueba

### Prueba Rápida Paso a Paso:

1. **Iniciar sesión** como Admin
2. **Ir a Cursos** → Seleccionar un curso
3. **Ir a Secciones** → Click en "Exámenes" de una sección
4. **Crear un examen** con 3-5 preguntas de diferentes tipos
5. **Cerrar sesión** y entrar como Estudiante
6. **Ir al curso** → Ver el examen en el sidebar
7. **Tomar el examen** → Responder preguntas
8. **Ver resultados** inmediatamente
9. **Volver como Admin** → Ver intentos de estudiantes

## 📱 Navegación Rápida

**Rutas del Sistema:**
```
/secciones/:seccionId/examenes              → Lista de exámenes
/secciones/:seccionId/examenes/crear        → Crear examen
/secciones/:seccionId/examenes/:id/editar   → Editar examen
/examenes/:id/tomar                         → Tomar examen (estudiante)
/examenes/:examenId/resultados/:intentoId   → Ver resultados
```

## 💡 Consejos

- **Fechas**: Configura las fechas correctamente para que los estudiantes puedan acceder
- **Intentos**: Configura más de 1 intento para que puedan mejorar
- **Duración**: Calcula bien el tiempo según el número de preguntas
- **Mezclar**: Activa esta opción para evitar copias
- **Mostrar respuestas**: Útil para que aprendan de sus errores

## ⚠️ Notas Importantes

- Los exámenes se califican **automáticamente** al enviar
- El tiempo se **descuenta en tiempo real**
- Si se agota el tiempo, el examen se **envía automáticamente**
- Los intentos **no utilizados** no pueden recuperarse después de la fecha límite
- Las respuestas se **guardan automáticamente** cada 30 segundos

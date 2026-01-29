import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { SectionService } from '../../core/services/section.service';
import { Examen, Pregunta, OpcionRespuesta, TipoPregunta } from '../../core/models/exam.model';

@Component({
  selector: 'app-crear-examen',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-examen.component.html',
  styleUrl: './crear-examen.component.scss'
})
export class CrearExamenComponent implements OnInit {
  examenForm!: FormGroup;
  seccionId!: string;
  examenId?: string;
  isEdit = false;
  loading = false;
  cursoNombre = '';
  seccionNombre = '';

  tiposPreguntas: { value: TipoPregunta; label: string }[] = [
    { value: 'multiple_unica', label: 'Opción Múltiple (Respuesta Única)' },
    { value: 'multiple_multiple', label: 'Opción Múltiple (Múltiples Respuestas)' },
    { value: 'verdadero_falso', label: 'Verdadero/Falso' },
    { value: 'corta', label: 'Respuesta Corta' },
    { value: 'completar', label: 'Completar Espacio' }
  ];

  constructor(
    private fb: FormBuilder,
    private examService: ExamService,
    private sectionService: SectionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.seccionId = this.route.snapshot.paramMap.get('seccionId')!;
    this.examenId = this.route.snapshot.paramMap.get('id') || undefined;
    this.isEdit = !!this.examenId;

    this.initForm();
    this.loadSeccionInfo();

    if (this.isEdit && this.examenId) {
      this.loadExamen();
    }
  }

  initForm(): void {
    this.examenForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      duracionMinutos: [60, [Validators.required, Validators.min(1)]],
      intentosPermitidos: [1, [Validators.required, Validators.min(1)]],
      mezclarPreguntas: [false],
      mostrarRespuestas: [false],
      ponderacion: [10, [Validators.required, Validators.min(0)]],
      notaMinima: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      preguntas: this.fb.array([])
    });
  }

  async loadSeccionInfo(): Promise<void> {
    try {
      const seccion = await this.sectionService.getSectionById(this.seccionId);
      if (seccion) {
        this.seccionNombre = seccion.titulo;
        // Simplemente usar el título de la sección
        // El cursoNombre se puede obtener de otra forma si es necesario
      }
    } catch (error) {
      console.error('Error loading section info:', error);
    }
  }

  async loadExamen(): Promise<void> {
    if (!this.examenId) return;

    try {
      this.loading = true;
      const examen = await this.examService.getExamById(this.examenId);

      if (examen) {
        this.examenForm.patchValue({
          titulo: examen.titulo,
          descripcion: examen.descripcion,
          fechaInicio: this.formatDateForInput(examen.fechaInicio),
          fechaFin: this.formatDateForInput(examen.fechaFin),
          duracionMinutos: examen.duracionMinutos,
          intentosPermitidos: examen.intentosPermitidos,
          mezclarPreguntas: examen.mezclarPreguntas,
          mostrarRespuestas: examen.mostrarRespuestas,
          ponderacion: examen.ponderacion,
          notaMinima: examen.notaMinima
        });

        // Cargar preguntas
        examen.preguntas.forEach(pregunta => {
          this.addPreguntaFromData(pregunta);
        });
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Error al cargar el examen');
    } finally {
      this.loading = false;
    }
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  get preguntas(): FormArray {
    return this.examenForm.get('preguntas') as FormArray;
  }

  getOpciones(preguntaIndex: number): FormArray {
    return this.preguntas.at(preguntaIndex).get('opciones') as FormArray;
  }

  addPregunta(): void {
    const preguntaForm = this.fb.group({
      id: [this.examService.generateQuestionId()],
      tipo: ['multiple_unica', Validators.required],
      texto: ['', Validators.required],
      puntos: [1, [Validators.required, Validators.min(0)]],
      opciones: this.fb.array([]),
      respuestaCorrecta: ['']
    });

    this.preguntas.push(preguntaForm);
    this.addOpcion(this.preguntas.length - 1); // Al menos una opción por defecto
  }

  addPreguntaFromData(pregunta: Pregunta): void {
    const preguntaForm = this.fb.group({
      id: [pregunta.id],
      tipo: [pregunta.tipo, Validators.required],
      texto: [pregunta.texto, Validators.required],
      puntos: [pregunta.puntos, [Validators.required, Validators.min(0)]],
      opciones: this.fb.array([]),
      respuestaCorrecta: [pregunta.respuestaCorrecta || '']
    });

    // Cargar opciones si existen
    if (pregunta.opciones) {
      pregunta.opciones.forEach(opcion => {
        const opcionForm = this.fb.group({
          id: [opcion.id],
          texto: [opcion.texto, Validators.required],
          esCorrecta: [opcion.esCorrecta]
        });
        (preguntaForm.get('opciones') as FormArray).push(opcionForm);
      });
    }

    this.preguntas.push(preguntaForm);
  }

  removePregunta(index: number): void {
    if (confirm('¿Está seguro de eliminar esta pregunta?')) {
      this.preguntas.removeAt(index);
    }
  }

  addOpcion(preguntaIndex: number): void {
    const opciones = this.getOpciones(preguntaIndex);
    const opcionForm = this.fb.group({
      id: [this.generateOptionId()],
      texto: ['', Validators.required],
      esCorrecta: [false]
    });
    opciones.push(opcionForm);
  }

  removeOpcion(preguntaIndex: number, opcionIndex: number): void {
    const opciones = this.getOpciones(preguntaIndex);
    opciones.removeAt(opcionIndex);
  }

  generateOptionId(): string {
    return 'opt_' + Math.random().toString(36).substr(2, 9);
  }

  onTipoPreguntaChange(preguntaIndex: number): void {
    const pregunta = this.preguntas.at(preguntaIndex);
    const tipo = pregunta.get('tipo')?.value as TipoPregunta;
    const opciones = this.getOpciones(preguntaIndex);

    // Limpiar opciones
    while (opciones.length > 0) {
      opciones.removeAt(0);
    }

    // Si es verdadero/falso, agregar las dos opciones predeterminadas
    if (tipo === 'verdadero_falso') {
      const verdaderoForm = this.fb.group({
        id: ['vf_verdadero'],
        texto: ['Verdadero'],
        esCorrecta: [false]
      });
      const falsoForm = this.fb.group({
        id: ['vf_falso'],
        texto: ['Falso'],
        esCorrecta: [false]
      });
      opciones.push(verdaderoForm);
      opciones.push(falsoForm);
    } else if (tipo === 'multiple_unica' || tipo === 'multiple_multiple') {
      // Agregar opciones por defecto para múltiple
      for (let i = 0; i < 4; i++) {
        this.addOpcion(preguntaIndex);
      }
    }
  }

  mostrarOpciones(tipo: TipoPregunta): boolean {
    return tipo === 'multiple_unica' || tipo === 'multiple_multiple' || tipo === 'verdadero_falso';
  }

  mostrarRespuestaCorta(tipo: TipoPregunta): boolean {
    return tipo === 'corta' || tipo === 'completar';
  }

  async onSubmit(): Promise<void> {
    if (this.examenForm.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.preguntas.length === 0) {
      alert('Debe agregar al menos una pregunta');
      return;
    }

    try {
      this.loading = true;
      const formValue = this.examenForm.value;

      const examen: Omit<Examen, 'id'> = {
        seccionId: this.seccionId,
        titulo: formValue.titulo,
        descripcion: formValue.descripcion,
        fechaInicio: new Date(formValue.fechaInicio),
        fechaFin: new Date(formValue.fechaFin),
        duracionMinutos: formValue.duracionMinutos,
        intentosPermitidos: formValue.intentosPermitidos,
        mezclarPreguntas: formValue.mezclarPreguntas,
        mostrarRespuestas: formValue.mostrarRespuestas,
        ponderacion: formValue.ponderacion,
        notaMinima: formValue.notaMinima,
        preguntas: this.preparePreguntas(formValue.preguntas),
        fechaCreacion: new Date()
      };

      if (this.isEdit && this.examenId) {
        await this.examService.updateExam(this.examenId, examen);
        alert('Examen actualizado exitosamente');
      } else {
        await this.examService.createExam(examen);
        alert('Examen creado exitosamente');
      }

      this.router.navigate(['/secciones', this.seccionId, 'examenes']);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error al guardar el examen');
    } finally {
      this.loading = false;
    }
  }

  preparePreguntas(preguntasForm: any[]): Pregunta[] {
    return preguntasForm.map(p => {
      let respuestaCorrecta: string | string[];

      // Determinar respuestas correctas según el tipo
      if (p.tipo === 'multiple_unica' || p.tipo === 'verdadero_falso') {
        const correcta = p.opciones.find((o: any) => o.esCorrecta);
        respuestaCorrecta = correcta ? correcta.id : '';
      } else if (p.tipo === 'multiple_multiple') {
        respuestaCorrecta = p.opciones
          .filter((o: any) => o.esCorrecta)
          .map((o: any) => o.id);
      } else if (p.tipo === 'corta' || p.tipo === 'completar') {
        respuestaCorrecta = p.respuestaCorrecta || '';
      } else {
        respuestaCorrecta = '';
      }

      const pregunta: Pregunta = {
        id: p.id,
        tipo: p.tipo,
        texto: p.texto,
        puntos: p.puntos,
        opciones: p.opciones || [],
        respuestaCorrecta: respuestaCorrecta
      };

      return pregunta;
    });
  }

  cancel(): void {
    this.router.navigate(['/secciones', this.seccionId, 'examenes']);
  }

  // Método para verificar si hay preguntas inválidas
  hasInvalidPreguntas(): boolean {
    return this.preguntas.controls.some(pregunta => pregunta.invalid);
  }

  // Método de debug para mostrar errores de validación
  showValidationErrors(): void {
    console.log('=== ESTADO DEL FORMULARIO ===');
    console.log('Formulario válido:', this.examenForm.valid);
    console.log('Errores generales:', this.examenForm.errors);

    Object.keys(this.examenForm.controls).forEach(key => {
      const control = this.examenForm.get(key);
      if (control?.invalid) {
        console.log(`Campo "${key}" inválido:`, control.errors);
      }
    });

    console.log('\n=== PREGUNTAS ===');
    this.preguntas.controls.forEach((pregunta, index) => {
      if (pregunta.invalid) {
        console.log(`Pregunta ${index + 1} inválida:`, pregunta.errors);
        Object.keys(pregunta.value).forEach(key => {
          const field = (pregunta as any).get(key);
          if (field?.invalid) {
            console.log(`  - Campo "${key}":`, field.errors);
          }
        });
      }
    });
  }
}

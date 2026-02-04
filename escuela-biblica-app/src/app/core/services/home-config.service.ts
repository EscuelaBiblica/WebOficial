import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfiguracionHome, CONFIG_HOME_DEFAULT } from '../models/config-home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeConfigService {
  private configSubject = new BehaviorSubject<ConfiguracionHome | null>(null);
  public config$ = this.configSubject.asObservable();

  private readonly COLLECTION = 'configuracion-home';
  private readonly DOC_ID = 'principal';
  private readonly CACHE_KEY = 'home_config';
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 horas

  constructor(private firestore: Firestore) {}

  /**
   * Obtiene la configuración del home desde Firestore
   * Implementa caché de 2 horas en localStorage
   */
  async getConfiguracion(): Promise<ConfiguracionHome> {
    // 1. Intentar leer del caché
    const cached = this.getCachedConfig();
    if (cached) {
      this.configSubject.next(cached);
      return cached;
    }

    // 2. Leer de Firestore
    const config = await this.fetchFromFirestore();

    // 3. Guardar en caché
    this.cacheConfig(config);
    this.configSubject.next(config);

    return config;
  }

  /**
   * Obtiene la configuración como Observable
   */
  getConfiguracion$(): Observable<ConfiguracionHome> {
    return from(this.getConfiguracion());
  }

  /**
   * Actualiza la configuración completa
   * Solo para administradores
   */
  async updateConfiguracion(
    config: Partial<ConfiguracionHome>,
    adminId: string
  ): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION, this.DOC_ID);

    const updateData = {
      ...config,
      ultimaActualizacion: new Date(),
      actualizadoPor: adminId
    };

    await updateDoc(docRef, updateData);

    // Invalidar caché
    this.clearCache();

    // Recargar configuración
    await this.getConfiguracion();
  }

  /**
   * Actualiza solo el Hero
   */
  async updateHero(heroConfig: ConfiguracionHome['hero'], adminId: string): Promise<void> {
    await this.updateConfiguracion({ hero: heroConfig }, adminId);
  }

  /**
   * Actualiza solo la sección Cursos
   */
  async updateSeccionCursos(cursosConfig: ConfiguracionHome['seccionCursos'], adminId: string): Promise<void> {
    await this.updateConfiguracion({ seccionCursos: cursosConfig }, adminId);
  }

  /**
   * Actualiza solo la sección Portfolio/Materias
   */
  async updateSeccionPortfolio(portfolioConfig: ConfiguracionHome['seccionPortfolio'], adminId: string): Promise<void> {
    await this.updateConfiguracion({ seccionPortfolio: portfolioConfig }, adminId);
  }

  /**
   * Inicializa la configuración con valores por defecto
   * Se ejecuta una sola vez al crear el sistema
   */
  async inicializarConfiguracion(adminId: string): Promise<void> {
    const docRef = doc(this.firestore, this.COLLECTION, this.DOC_ID);

    const configInicial: ConfiguracionHome = {
      ...CONFIG_HOME_DEFAULT,
      ultimaActualizacion: new Date(),
      actualizadoPor: adminId
    };

    await setDoc(docRef, configInicial);
  }

  /**
   * Resetea la configuración a valores por defecto
   */
  async resetToDefault(adminId: string): Promise<void> {
    await this.inicializarConfiguracion(adminId);
    this.clearCache();
    await this.getConfiguracion();
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Lee la configuración desde Firestore
   */
  private async fetchFromFirestore(): Promise<ConfiguracionHome> {
    const docRef = doc(this.firestore, this.COLLECTION, this.DOC_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // Si no existe, crear con valores por defecto
      console.warn('Configuración del home no encontrada. Creando configuración por defecto...');
      const configDefault: ConfiguracionHome = {
        ...CONFIG_HOME_DEFAULT,
        ultimaActualizacion: new Date(),
        actualizadoPor: 'sistema'
      };
      await setDoc(docRef, configDefault);
      return configDefault;
    }

    const data = docSnap.data();
    return {
      ...data,
      ultimaActualizacion: data['ultimaActualizacion']?.toDate() || new Date()
    } as ConfiguracionHome;
  }

  /**
   * Lee la configuración del caché (localStorage)
   */
  private getCachedConfig(): ConfiguracionHome | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);

      // Verificar que no haya expirado
      if (Date.now() - data.timestamp > this.CACHE_DURATION) {
        this.clearCache();
        return null;
      }

      // Convertir fecha
      if (data.config.ultimaActualizacion) {
        data.config.ultimaActualizacion = new Date(data.config.ultimaActualizacion);
      }

      return data.config;
    } catch (error) {
      console.error('Error leyendo caché del home:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Guarda la configuración en caché
   */
  private cacheConfig(config: ConfiguracionHome): void {
    try {
      const cacheData = {
        config,
        timestamp: Date.now()
      };
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error guardando caché del home:', error);
    }
  }

  /**
   * Limpia el caché
   */
  clearCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
  }
}

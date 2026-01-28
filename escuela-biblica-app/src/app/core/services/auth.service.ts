import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  user,
  User,
  UserCredential,
  signInWithPopup,
  GoogleAuthProvider
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap } from 'rxjs';
import { UserModel, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  // Observable del usuario autenticado
  user$ = user(this.auth);
  
  // Observable del perfil completo del usuario
  userProfile$: Observable<UserModel | null> = this.user$.pipe(
    switchMap(user => {
      if (!user) return of(null);
      return from(this.getUserProfile(user.uid));
    })
  );

  constructor() {}

  /**
   * Login con email y contraseña
   */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Login con Google
   */
  async loginWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Verificar si el usuario ya existe en Firestore
      const userDoc = await this.getUserProfile(result.user.uid);
      
      // Si no existe, crear perfil básico
      if (!userDoc) {
        await this.createUserProfile(result.user.uid, {
          email: result.user.email!,
          nombre: result.user.displayName?.split(' ')[0] || '',
          apellido: result.user.displayName?.split(' ').slice(1).join(' ') || '',
          rol: 'estudiante' as UserRole,
          fotoPerfil: result.user.photoURL || undefined
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  /**
   * Registro de nuevo usuario (solo Admin puede usar esto)
   */
  async register(
    email: string, 
    password: string, 
    userData: Partial<UserModel>
  ): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        email, 
        password
      );
      
      // Crear perfil en Firestore
      await this.createUserProfile(userCredential.user.uid, {
        email,
        ...userData
      });
      
      return userCredential;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  /**
   * Obtener perfil de usuario desde Firestore
   */
  async getUserProfile(uid: string): Promise<UserModel | null> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as UserModel;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  /**
   * Crear perfil de usuario en Firestore
   */
  private async createUserProfile(
    uid: string, 
    data: Partial<UserModel>
  ): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userData: UserModel = {
        id: uid,
        email: data.email!,
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        rol: data.rol || 'estudiante',
        fotoPerfil: data.fotoPerfil,
        fechaRegistro: new Date(),
        activo: true,
        cursosInscritos: [],
        cursosAsignados: []
      };
      
      await setDoc(userDocRef, userData);
    } catch (error) {
      console.error('Error creando perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(uid: string, data: Partial<UserModel>): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, data as any);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }
}

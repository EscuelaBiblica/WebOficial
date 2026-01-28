import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  url: string;
  asset_folder: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private cloudName = environment.cloudinary.cloudName;
  private uploadPreset = environment.cloudinary.uploadPreset;
  private uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  constructor() {}

  /**
   * Subir imagen a Cloudinary
   * @param file - Archivo de imagen a subir
   * @returns Promise con la URL de la imagen subida
   */
  async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      formData.append('folder', 'user-profiles');

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen a Cloudinary');
      }

      const data: CloudinaryUploadResponse = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Validar que el archivo sea una imagen
   * @param file - Archivo a validar
   * @returns true si es una imagen válida
   */
  isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona una imagen válida (JPG, PNG, GIF, WEBP)');
      return false;
    }

    if (file.size > maxSize) {
      alert('La imagen no debe superar los 5MB');
      return false;
    }

    return true;
  }

  /**
   * Crear URL de preview local para la imagen
   * @param file - Archivo de imagen
   * @returns URL del preview
   */
  createImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }
}

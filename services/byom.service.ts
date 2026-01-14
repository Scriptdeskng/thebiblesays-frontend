import makeRequest from '@/lib/api';
import { BYOMCustomization, MerchType } from '@/types/byom.types';

export interface CustomMerchDesign {
  id: number;
  user: string;
  product: string;
  name: string;
  color: string;
  text: string;
  size: string;
  font_style: string;
  placement: 'front' | 'back' | 'side';
  uploaded_image: string | null;
  uploaded_image_url: string | null;
  configuration_json: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  rejection_reason: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomMerchPayload {
  product_id?: number;
  name: string;
  color: string;
  text?: string;
  size: string;
  font_style?: string;
  placement?: 'front' | 'back' | 'side';
  uploaded_image?: File;
  configuration_json: string;
  is_active?: boolean;
}

export interface CustomMerchListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: CustomMerchDesign[];
}

class BYOMService {
  async getMyDesigns(token: string): Promise<CustomMerchListResponse> {
    return makeRequest({
      method: 'GET',
      url: 'byom/custom-merch/',
      requireToken: true,
      token,
    });
  }

  async getSavedDesigns(token: string): Promise<CustomMerchDesign[]> {
    return makeRequest({
      method: 'GET',
      url: 'byom/custom-merch/saved_designs/',
      requireToken: true,
      token,
    });
  }

  async getDesignById(token: string, id: number): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/${id}/`,
      requireToken: true,
      token,
    });
  }

  /**
   * Create a transparent placeholder image for designs without custom uploads
   * This is needed because the backend requires an uploaded_image field
   * Must be at least 500x500 pixels to pass backend validation
   */
  private async createPlaceholderImage(): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.clearRect(0, 0, 500, 500);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'placeholder.png', { type: 'image/png' });
          resolve(file);
        } else {
          const emptyBlob = new Blob([], { type: 'image/png' });
          const file = new File([emptyBlob], 'placeholder.png', { type: 'image/png' });
          resolve(file);
        }
      }, 'image/png');
    });
  }

  async createDesign(
    token: string,
    payload: CreateCustomMerchPayload,
    uploadedFiles?: File[]
  ): Promise<CustomMerchDesign> {
    let filesToUpload = uploadedFiles;
    let usingPlaceholder = false;
    
    if (!filesToUpload || filesToUpload.length === 0) {
      const placeholder = await this.createPlaceholderImage();
      filesToUpload = [placeholder];
      usingPlaceholder = true;
    } else {
      usingPlaceholder = false;
    }

    const hasFiles = filesToUpload && filesToUpload.length > 0;

    if (hasFiles) {
      const formData = new FormData();

      if (payload.product_id) {
        formData.append('product_id', payload.product_id.toString());
      }
      formData.append('name', payload.name);
      formData.append('color', payload.color);
      formData.append('size', payload.size);
      formData.append('configuration_json', payload.configuration_json);

      if (payload.text) {
        formData.append('text', payload.text);
      }
      if (payload.font_style) {
        formData.append('font_style', payload.font_style);
      }
      if (payload.placement) {
        formData.append('placement', payload.placement);
      }
      if (payload.is_active !== undefined) {
        formData.append('is_active', payload.is_active.toString());
      }

      if (filesToUpload[0]) {
        formData.append('uploaded_image', filesToUpload[0], filesToUpload[0].name);
      }

      try {
        const result = await makeRequest({
          method: 'POST',
          url: 'byom/custom-merch/',
          data: formData,
          requireToken: true,
          token,
          content_type: 'multipart/form-data',
        });
        return result;
      } catch (error: any) {
        console.error('❌ Error creating design with file:', error);
        
        if (error?.response?.data?.error?.includes('already submitted for approval') ||
            error?.message?.includes('already submitted for approval')) {
          throw new Error('This design has already been submitted for approval. Please check your Drafts section.');
        }
        
        throw error;
      }
    }

    try {
      const result = await makeRequest({
        method: 'POST',
        url: 'byom/custom-merch/',
        data: payload,
        requireToken: true,
        token,
      });
      return result;
    } catch (error: any) {
      console.error('❌ Error creating design:', error);
      
      if (error?.response?.data?.error?.includes('already submitted for approval') ||
          error?.message?.includes('already submitted for approval')) {
        throw new Error('This design has already been submitted for approval. Please check your Drafts section.');
      }
      
      throw error;
    }
  }

  async updateDesign(
    token: string,
    id: number,
    payload: Partial<CreateCustomMerchPayload>
  ): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'PATCH',
      url: `byom/custom-merch/${id}/`,
      data: payload,
      requireToken: true,
      token,
    });
  }

  async deleteDesign(token: string, id: number): Promise<void> {
    return makeRequest({
      method: 'DELETE',
      url: `byom/custom-merch/${id}/`,
      requireToken: true,
      token,
    });
  }

  async submitForApproval(token: string, id: number): Promise<CustomMerchDesign> {
    try {
      
      const result = await makeRequest({
        method: 'POST',
        url: `byom/custom-merch/${id}/submit_for_approval/`,
        requireToken: true,
        token,
        data: {},
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Error submitting for approval:', error);
      
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  }

  async reuploadImage(
    token: string,
    id: number,
    file: File
  ): Promise<CustomMerchDesign> {
    const formData = new FormData();
    formData.append('uploaded_image', file);

    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${id}/reupload/`,
      data: formData,
      requireToken: true,
      token,
      content_type: 'multipart/form-data',
    });
  }

  async addToCart(token: string, id: number): Promise<any> {
    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${id}/add_to_cart/`,
      requireToken: true,
      token,
      data: {},
    });
  }

  async getPreview(token: string, id: number): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/${id}/preview/`,
      requireToken: true,
      token,
    });
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    
    console.log('🔍 Validating file:', {
      name: fileName,
      type: file.type,
      size: file.size,
      extension: fileExtension
    });

    const unsupportedFormats = ['.avif', '.webp', '.svg', '.gif', '.bmp', '.tiff', '.heic', '.heif'];
    if (unsupportedFormats.includes(fileExtension)) {
      console.log('❌ Unsupported extension detected:', fileExtension);
      return {
        valid: false,
        error: `${fileExtension.toUpperCase()} format is not supported. Please use JPG or PNG only.`
      };
    }
    const unsupportedMimeTypes = [
      'image/avif', 'image/webp', 'image/svg+xml', 
      'image/gif', 'image/bmp', 'image/tiff', 
      'image/heic', 'image/heif'
    ];
    if (file.type && unsupportedMimeTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `${file.type} format is not supported. Please use JPG or PNG only.`
      };
    }
    
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    if (!validExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Only JPG and PNG images are allowed. You uploaded: ${fileExtension || 'unknown format'}`
      };
    }

    const acceptedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (file.type && !acceptedMimeTypes.includes(file.type.toLowerCase())) {
      return {
        valid: false,
        error: `Invalid file type detected. Only JPG and PNG images are allowed. File type: ${file.type || 'unknown'}`
      };
    }

    if (file.type && !file.type.startsWith('image/')) {
      return {
        valid: false,
        error: 'Please upload an image file (JPG or PNG only)'
      };
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        error: `File is too large (${fileSizeMB}MB). Maximum size is 10MB. Please compress or resize your image.`
      };
    }

    return { valid: true };
  }


  async validateImageDimensions(file: File): Promise<{ valid: boolean; error?: string; width?: number; height?: number }> {
    return new Promise((resolve) => {
      const img = new window.Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          const MIN_DIMENSION = 1500;
          
          if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
            resolve({
              valid: false,
              error: `Image must be at least ${MIN_DIMENSION} x ${MIN_DIMENSION}px. Your image is ${img.width} x ${img.height}px.`,
              width: img.width,
              height: img.height
            });
          } else {
            resolve({
              valid: true,
              width: img.width,
              height: img.height
            });
          }
        };

        img.onerror = () => {
          resolve({
            valid: false,
            error: 'Failed to load image. Please ensure it is a valid JPG or PNG file.'
          });
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        resolve({
          valid: false,
          error: 'Failed to read file. Please try again.'
        });
      };

      reader.readAsDataURL(file);
    });
  }

  prepareDesignPayload(
    customization: BYOMCustomization & {
      uploadedImages?: any[];
      requiresApproval?: boolean;
    }
  ): CreateCustomMerchPayload {
    const allTexts = [
      ...(customization.front?.texts || []),
      ...(customization.back?.texts || []),
      ...(customization.side?.texts || []),
    ];
    const textContent = allTexts.map(t => t.content).join(' | ');

    let primaryPlacement: 'front' | 'back' | 'side' = 'front';
    const frontCount = (customization.front?.texts?.length || 0) + (customization.front?.stickers?.length || 0);
    const backCount = (customization.back?.texts?.length || 0) + (customization.back?.stickers?.length || 0);
    const sideCount = (customization.side?.texts?.length || 0) + (customization.side?.stickers?.length || 0);

    if (backCount > frontCount && backCount > sideCount) {
      primaryPlacement = 'back';
    } else if (sideCount > frontCount && sideCount > backCount) {
      primaryPlacement = 'side';
    }

    return {
      name: `Custom ${customization.merchType}`,
      color: customization.colorName || customization.color,
      text: textContent || undefined,
      size: customization.size,
      placement: primaryPlacement,
      configuration_json: JSON.stringify(customization),
      is_active: true,
    };
  }

  extractUploadedFiles(
    customization: BYOMCustomization & {
      uploadedImages?: any[];
    }
  ): File[] {
    const files: File[] = [];

    if (customization.uploadedImages) {
      customization.uploadedImages.forEach((image) => {
        if (image.file instanceof File) {
          files.push(image.file);
        }
        else if (image.url && image.url.startsWith('data:')) {
          const file = this.base64ToFile(image.url, image.name || 'custom-image.png');
          files.push(file);
        }
      });
    }

    return files;
  }

  base64ToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }
}

export const byomService = new BYOMService();
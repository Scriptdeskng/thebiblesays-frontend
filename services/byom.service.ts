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
  price: string;
  currency: 'NGN' | 'USD';
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
  async getMyDesigns(token: string, currencyParam: string = ''): Promise<CustomMerchListResponse> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/${currencyParam}`,
      requireToken: true,
      token,
    });
  }

  async getSavedDesigns(token: string, currencyParam: string = ''): Promise<CustomMerchDesign[]> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/saved_designs/${currencyParam}`,
      requireToken: true,
      token,
    });
  }

  async getDesignById(token: string, id: number, currencyParam: string = ''): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/${id}/${currencyParam}`,
      requireToken: true,
      token,
    });
  }

  private async createPlaceholderImage(): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 500, 500);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'placeholder.png', { type: 'image/png' });
          resolve(file);
        } else {
          const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
          const byteString = atob(base64);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          const fallbackBlob = new Blob([uint8Array], { type: 'image/png' });
          const file = new File([fallbackBlob], 'placeholder.png', { type: 'image/png' });
          resolve(file);
        }
      }, 'image/png');
    });
  }

  async createDesign(
    token: string,
    payload: CreateCustomMerchPayload,
    uploadedFiles?: File[],
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    let filesToUpload = uploadedFiles;
    
    if (!filesToUpload || filesToUpload.length === 0) {
      const placeholder = await this.createPlaceholderImage();
      filesToUpload = [placeholder];
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

      if (filesToUpload[0] && filesToUpload[0] instanceof File) {
        formData.append('uploaded_image', filesToUpload[0], filesToUpload[0].name);
      } else {
        throw new Error('Invalid file object. Please try uploading your image again.');
      }

      try {
        const result = await makeRequest({
          method: 'POST',
          url: `byom/custom-merch/${currencyParam}`,
          data: formData,
          requireToken: true,
          token,
        });
        return result;
      } catch (error: any) {
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
        url: `byom/custom-merch/${currencyParam}`,
        data: payload,
        requireToken: true,
        token,
      });
      return result;
    } catch (error: any) {
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
    payload: Partial<CreateCustomMerchPayload>,
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'PATCH',
      url: `byom/custom-merch/${id}/${currencyParam}`,
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

  async submitForApproval(
    token: string, 
    id: number,
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    try {
      const result = await makeRequest({
        method: 'POST',
        url: `byom/custom-merch/${id}/submit_for_approval/${currencyParam}`,
        requireToken: true,
        token,
        data: {},
      });
      
      return result;
    } catch (error: any) {
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      throw error;
    }
  }

  async reuploadImage(
    token: string,
    id: number,
    file: File,
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    const formData = new FormData();
    formData.append('uploaded_image', file);

    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${id}/reupload/${currencyParam}`,
      data: formData,
      requireToken: true,
      token,
    });
  }

  async addToCart(
    token: string, 
    id: number,
    currencyParam: string = ''
  ): Promise<any> {
    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${id}/add_to_cart/${currencyParam}`,
      requireToken: true,
      token,
      data: {},
    });
  }

  async getPreview(
    token: string, 
    id: number,
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'GET',
      url: `byom/custom-merch/${id}/preview/${currencyParam}`,
      requireToken: true,
      token,
    });
  }

  validateImageFile(file: File): { valid: boolean; error?: string } {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    const unsupportedFormats = ['.avif', '.webp', '.svg', '.gif', '.bmp', '.tiff', '.heic', '.heif'];
    if (unsupportedFormats.includes(fileExtension)) {
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
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch?.[1] || 'image/png';
      
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], { type: mime });
      const file = new File([blob], filename, { type: mime });
      
      if (!file || file.size === 0) {
        throw new Error('Created file is empty or invalid');
      }
      
      return file;
    } catch (error) {
      throw new Error('Failed to convert image to file format. Please try uploading your image again.');
    }
  }
}

export const byomService = new BYOMService();
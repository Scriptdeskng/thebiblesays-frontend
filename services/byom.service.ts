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

  async createDesign(
    token: string,
    payload: CreateCustomMerchPayload,
    uploadedFiles?: File[]
  ): Promise<CustomMerchDesign> {
    const hasFiles = uploadedFiles && uploadedFiles.length > 0;

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

      if (uploadedFiles[0]) {
        formData.append('uploaded_image', uploadedFiles[0], uploadedFiles[0].name);
      }

      return makeRequest({
        method: 'POST',
        url: 'byom/custom-merch/',
        data: formData,
        requireToken: true,
        token,
        content_type: 'multipart/form-data',
      });
    }

    return makeRequest({
      method: 'POST',
      url: 'byom/custom-merch/',
      data: payload,
      requireToken: true,
      token,
    });
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
    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${id}/submit_for_approval/`,
      requireToken: true,
      token,
      data: {},
    });
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

  prepareDesignPayload(
    customization: BYOMCustomization & {
      uploadedStickers?: any[];
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
      uploadedStickers?: any[];
    }
  ): File[] {
    const files: File[] = [];

    if (customization.uploadedStickers) {
      customization.uploadedStickers.forEach((sticker) => {

        if (sticker.file instanceof File) {
          files.push(sticker.file);
        }
        else if (sticker.url && sticker.url.startsWith('data:')) {
          const file = this.base64ToFile(sticker.url, sticker.name || 'custom-image.png');
          files.push(file);
        }
      });
    }

    return files;
  }

  private base64ToFile(dataUrl: string, filename: string): File {
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
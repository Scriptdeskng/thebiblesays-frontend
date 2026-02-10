import makeRequest from '@/lib/api';
import { BYOMCustomization, MerchType, Asset, BYOMProduct } from '@/types/byom.types';

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
  text?: string;
  size: string;
  font_style?: string;
  placement?: 'front' | 'back' | 'side';
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
  async getAvailableProducts(currencyParam: string = ''): Promise<BYOMProduct[]> {
    const response = await makeRequest({
      method: 'GET',
      url: `byom/custom-merch/available_products/${currencyParam}`,
      requireToken: false,
    });
    

    return response?.products || response?.results || (Array.isArray(response) ? response : []);
  }

  async getAssets(currencyParam: string = ''): Promise<Asset[]> {
    const response = await makeRequest({
      method: 'GET',
      url: `byom/stickers/${currencyParam}`,
      requireToken: false,
    });
    
    const assets = response?.results || (Array.isArray(response) ? response : []);
    
    return assets.map((asset: Asset) => ({
      ...asset,
      image_url: asset.image_url || asset.image,
    }));
  }

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

  async createDesign(
    token: string,
    payload: CreateCustomMerchPayload,
    currencyParam: string = ''
  ): Promise<CustomMerchDesign> {
    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/${currencyParam}`,
      data: payload,
      requireToken: true,
      token,
    });
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

  async createAndAddToCart(
    token: string,
    payload: CreateCustomMerchPayload,
    currencyParam: string = ''
  ): Promise<any> {
    return makeRequest({
      method: 'POST',
      url: `byom/custom-merch/create_and_add_to_cart/${currencyParam}`,
      requireToken: true,
      token,
      data: payload,
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

  async calculatePricing(
    payload: {
      product_id: number;
      selected_placements?: string[];
      text?: string;
      has_image?: boolean;
      customization_options?: any;
    },
    currencyParam: string = ''
  ): Promise<any> {
    return makeRequest({
      method: 'POST',
      url: `byom/pricing/calculate/${currencyParam}`,
      data: payload,
      requireToken: false,
    });
  }

  prepareDesignPayload(
    customization: BYOMCustomization,
    productId?: number
  ): CreateCustomMerchPayload {
    const allTexts = [
      ...(customization.front?.texts || []),
      ...(customization.back?.texts || []),
      ...(customization.side?.texts || []),
    ];
    const textContent = allTexts.map(t => t.content).join(' | ');

    let primaryPlacement: 'front' | 'back' | 'side' = 'front';
    const frontCount = (customization.front?.texts?.length || 0) + (customization.front?.assets?.length || 0);
    const backCount = (customization.back?.texts?.length || 0) + (customization.back?.assets?.length || 0);
    const sideCount = (customization.side?.texts?.length || 0) + (customization.side?.assets?.length || 0);

    if (backCount > frontCount && backCount > sideCount) {
      primaryPlacement = 'back';
    } else if (sideCount > frontCount && sideCount > backCount) {
      primaryPlacement = 'side';
    }

    return {
      product_id: productId,
      name: `Custom ${customization.merchType}`,
      text: textContent || undefined,
      size: customization.size,
      placement: primaryPlacement,
      configuration_json: JSON.stringify(customization),
      is_active: true,
    };
  }
}

export const byomService = new BYOMService();
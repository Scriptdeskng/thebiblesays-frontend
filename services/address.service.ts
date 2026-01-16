import makeRequest from '@/lib/api';

interface ApiAddress {
  id: number;
  label: string;
  address_type: 'home' | 'work' | 'other';
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  longitude?: number;
  latitude?: number;
  is_default: boolean;
  full_address: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

interface CreateAddressData {
  label?: string;
  address_type: 'home' | 'work' | 'other';
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  longitude?: number;
  latitude?: number;
  is_default?: boolean;
}

class AddressService {
  async getAddresses(token: string): Promise<ApiAddress[]> {
    try {
      const response = await makeRequest({
        url: 'auth/addresses/',
        method: 'GET',
        requireToken: true,
        token,
      });
      
      if (response.results && Array.isArray(response.results)) {
        return response.results;
      }
      
      if (Array.isArray(response)) {
        return response;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      return [];
    }
  }

  async getAddressById(token: string, addressId: number): Promise<ApiAddress | null> {
    try {
      const response = await makeRequest({
        url: `auth/addresses/${addressId}/`,
        method: 'GET',
        requireToken: true,
        token,
      });

      return response;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  }

  async createAddress(token: string, data: CreateAddressData): Promise<ApiAddress> {
    try {
      const response = await makeRequest({
        url: 'auth/addresses/',
        method: 'POST',
        requireToken: true,
        token,
        data,
      });
      return response;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }

  async updateAddress(token: string, addressId: number, data: Partial<CreateAddressData>): Promise<ApiAddress> {
    try {
      const response = await makeRequest({
        url: `auth/addresses/${addressId}/`,
        method: 'PATCH',
        requireToken: true,
        token,
        data,
      });

      return response;
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(token: string, addressId: number): Promise<void> {
    try {
      await makeRequest({
        url: `auth/addresses/${addressId}/`,
        method: 'DELETE',
        requireToken: true,
        token,
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  }

  async getDefaultAddress(token: string): Promise<ApiAddress | null> {
    try {
      try {
        const response = await makeRequest({
          url: 'auth/addresses/default/',
          method: 'GET',
          requireToken: true,
          token,
        });
        return response;
      } catch (error: any) {
        if (error?.response?.status === 404) {
          const addresses = await this.getAddresses(token);
          return addresses.find(addr => addr.is_default) || null;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching default address:', error);
      return null;
    }
  }

  async setDefaultAddress(token: string, addressId: number): Promise<void> {
    try {
      await makeRequest({
        url: `auth/addresses/${addressId}/set_default/`,
        method: 'POST',
        requireToken: true,
        token,
        data: {},
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
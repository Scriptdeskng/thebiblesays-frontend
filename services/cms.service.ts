import makeRequest from '@/lib/api';

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

interface FAQListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FAQ[];
}

class CMSService {
  async getFAQs(params?: {
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<FAQ[]> {
    try {
      const response = await makeRequest({
        url: 'packages/faqs/',
        method: 'GET',
        params,
      });

      if (Array.isArray(response)) {
        return response;
      }

      const data = response as FAQListResponse;
      return data.results || [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  async getAllFAQs(params?: {
    search?: string;
    ordering?: string;
  }): Promise<FAQ[]> {
    try {
      let allFAQs: FAQ[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await makeRequest({
          url: 'packages/faqs/',
          method: 'GET',
          params: { ...params, page },
        });

        if (Array.isArray(response)) {
          allFAQs = [...allFAQs, ...response];
          hasMore = false;
        } else {
          const data = response as FAQListResponse;
          allFAQs = [...allFAQs, ...(data.results || [])];
          hasMore = !!data.next;
          page++;
        }
      }

      return allFAQs;
    } catch (error) {
      console.error('Error fetching all FAQs:', error);
      return [];
    }
  }

  async getFAQById(id: number): Promise<FAQ | null> {
    try {
      const response = await makeRequest({
        url: `packages/faqs/${id}/`,
        method: 'GET',
      });

      return response as FAQ;
    } catch (error) {
      console.error(`Error fetching FAQ ${id}:`, error);
      return null;
    }
  }

  async searchFAQs(searchTerm: string): Promise<FAQ[]> {
    return this.getFAQs({ search: searchTerm });
  }

  async getOrderedFAQs(orderBy: string): Promise<FAQ[]> {
    return this.getFAQs({ ordering: orderBy });
  }
}

export const cmsService = new CMSService();
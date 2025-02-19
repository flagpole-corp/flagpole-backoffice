import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import api from '../axios';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  subscription: {
    status: string;
    plan: string;
  };
  createdAt: Date;
}

interface OrganizationResponse {
  organizations: Organization[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UseOrganizationsOptions {
  includeDetails?: boolean;
  status?: string[];
  page?: number;
  limit?: number;
}

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: UseOrganizationsOptions) => [...organizationKeys.lists(), filters] as const,
};

export const useOrganizations = (options: UseOrganizationsOptions = {}): UseQueryResult<OrganizationResponse> => {
  const { page = 1, limit = 50, status, includeDetails = false } = options;

  return useQuery({
    queryKey: organizationKeys.list({ page, limit, status, includeDetails }),
    queryFn: async () => {
      const { data } = await api.get<OrganizationResponse>('/api/organizations', {
        params: {
          page,
          limit,
          status,
          includeDetails,
        },
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

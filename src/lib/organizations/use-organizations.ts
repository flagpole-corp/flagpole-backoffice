import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  uodatedAt?: Date;
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

export interface UseOrganizationsOptions {
  includeDetails?: boolean;
  status?: string[];
  page?: number;
  limit?: number;
  search?: string;
}

export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: UseOrganizationsOptions) => [...organizationKeys.lists(), filters] as const,
};

export const useOrganizations = (options: UseOrganizationsOptions = {}): UseQueryResult<OrganizationResponse> => {
  const { page = 1, limit = 50, status, includeDetails = false, search } = options;

  return useQuery({
    queryKey: organizationKeys.list({ page, limit, status, includeDetails, search }),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page,
        limit,
        includeDetails,
      };

      // Only add status if it has items
      if (status && status.length > 0) {
        params.status = status;
      }

      // Add search parameter if provided
      if (search) {
        params.search = search;
      }

      const { data } = await api.get<OrganizationResponse>('/api/organizations', {
        params,
      });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

interface ActivateOrganizationOptions {
  activateUsers?: boolean;
}

export const useActivateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      options = { activateUsers: true },
    }: {
      organizationId: string;
      options?: ActivateOrganizationOptions;
    }) => {
      const { data } = await api.patch<Organization>(`/api/organizations/${organizationId}/activate`, options);
      return data;
    },
    onSuccess: async () => {
      // Invalidate all organization list queries without specific filters
      await queryClient.invalidateQueries({
        queryKey: organizationKeys.all,
      });
      // toast.success('Organization activated successfully');
    },
    onError: (error) => {
      // eslint-disable-next-line
      console.error('Failed to activate organization:', error);
      // toast.error(error.response?.data?.message || 'Failed to activate organization. Please try again.');
    },
  });
};

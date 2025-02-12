export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isInternal: boolean;
  internalPermissions: string[];
  status: 'pending' | 'active' | 'inactive';
  currentOrganization?: string;
  organizations: {
    organization: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    removedAt?: Date;
  }[];
  projects: {
    project: string;
    addedAt: Date;
  }[];
}

export type StoredUser = Pick<User, 'id' | 'email' | 'isInternal' | 'internalPermissions'>;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import * as usersApi from '../../api/users';
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '../../types/api';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all users
 */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: usersApi.getAllUsers,
  });
}

/**
 * Get a single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.createUser(data),
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

/**
 * Update a user
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.updateUser(id, data),
    onSuccess: (updatedUser: UserResponse) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(id), updatedUser);
      
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

/**
 * Delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (_, deletedId: string) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: queryKeys.user(deletedId) });
      
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}

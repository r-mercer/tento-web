import apiClient from './client';
import { ENDPOINTS } from '../utils/constants';
import type {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UsersListResponse,
} from '../types/api';

// ============================================================================
// User API Functions
// ============================================================================

/**
 * Get all users
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  const response = await apiClient.get<UsersListResponse>(ENDPOINTS.USERS);
  return response.data.users;
}

/**
 * Get a single user by ID
 */
export async function getUser(id: string): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(ENDPOINTS.USER(id));
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserRequest): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>(ENDPOINTS.USERS, data);
  return response.data;
}

/**
 * Update a user by ID
 */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(ENDPOINTS.USER(id), data);
  return response.data;
}

/**
 * Delete a user by ID
 */
export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(ENDPOINTS.USER(id));
}

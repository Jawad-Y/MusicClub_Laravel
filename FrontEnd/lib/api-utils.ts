/**
 * Utility functions for handling API responses
 */

/**
 * Extracts an array from API response, handling both paginated and direct responses
 * @param response - The API response object
 * @returns An array of data items
 */
export function extractArrayFromResponse(response: any): any[] {
  if (!response?.data) return []

  // For paginated responses, extract the data array
  if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data
  }

  // For direct array responses
  if (Array.isArray(response.data)) {
    return response.data
  }

  return []
}

/**
 * Extracts the count from API response, handling both paginated and direct responses
 * @param response - The API response object
 * @returns The total count of items
 */
export function extractCountFromResponse(response: any): number {
  if (!response?.data) return 0

  // For paginated responses, use the total count
  if (response.data.total !== undefined) {
    return response.data.total
  }

  // If data has a 'data' property (paginated), count that array
  if (response.data.data && Array.isArray(response.data.data)) {
    return response.data.data.length
  }

  // Otherwise assume it's a direct array
  if (Array.isArray(response.data)) {
    return response.data.length
  }

  return 0
}

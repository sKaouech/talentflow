/**
 * Test utilities and configurations
 */

// Re-export testing library functions
export {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react'

export { userEvent } from '@testing-library/user-event'

// Mock functions
export const createMockRequest = (data: any) => {
  return {
    json: jest.fn().mockResolvedValue(data),
    formData: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    headers: new Map(),
    method: 'POST',
    url: 'http://localhost:3000/api/test',
  }
}

export const createMockPrisma = () => {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tenant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  }
}

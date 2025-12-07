// Utility functions for filtering users by role

export interface User {
  id: number
  full_name: string
  email: string
  role_id: number
  role?: {
    id: number
    role_name: string
  }
}

export const filterUsersByRole = (users: User[], roleName: string): User[] => {
  return users.filter((user) => user.role?.role_name?.toLowerCase() === roleName.toLowerCase())
}

export const filterLeaders = (users: User[]): User[] => {
  // Only Leaders - admins are invisible
  return filterByRoles(users, ["leader"])
}

export const filterDepartmentLeaders = (users: User[]): User[] => {
  // Leaders and Department Leaders only - admins are invisible
  return filterByRoles(users, ["leader", "department leader"])
}

export const filterClassLeaders = (users: User[]): User[] => {
  return filterUsersByRole(users, "class leader")
}

export const filterTrainers = (users: User[]): User[] => {
  return filterUsersByRole(users, "trainer")
}

export const filterTrainees = (users: User[]): User[] => {
  return filterUsersByRole(users, "trainee")
}

export const filterByRoles = (users: User[], roleNames: string[]): User[] => {
  return users.filter((user) => 
    roleNames.some((roleName) => user.role?.role_name?.toLowerCase() === roleName.toLowerCase())
  )
}

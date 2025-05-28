export type CountryCode = 'LV' | 'LT' | 'EE'

export interface Address {
  street: string
  city: string
  postalCode: string
  country: CountryCode
}

export interface UserProfile {
  id: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  profileImageUrl?: string
  shippingAddress?: string
  shippingCity?: string
  shippingPostalCode?: string
  shippingCountry?: CountryCode
}

export interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  address: Address
  profileImage?: File | null
  deleteProfileImage?: boolean
}

export interface ProfileImageUploadProps {
  currentImage?: string | null
  onChange: (file: File) => void
  onDelete?: () => void
}

export interface PersonalInfoFormProps {
  data: Pick<FormData, 'firstName' | 'lastName'>
  errors?: Partial<Record<keyof Pick<FormData, 'firstName' | 'lastName'>, string>>
  onChange: (data: Partial<Pick<FormData, 'firstName' | 'lastName'>>) => void
}

export interface ContactInfoFormProps {
  data: Pick<FormData, 'email' | 'phone'>
  errors?: Partial<Record<keyof Pick<FormData, 'email' | 'phone'>, string>>
  onChange: (data: Partial<Pick<FormData, 'email' | 'phone'>>) => void
}

export interface AddressFormProps {
  data: Address
  error?: string
  onChange: (address: Address) => void
}

export interface PasswordFormProps {
  data: Pick<FormData, 'password' | 'confirmPassword'>
  error?: string
  onChange: (data: Partial<Pick<FormData, 'password' | 'confirmPassword'>>) => void
}

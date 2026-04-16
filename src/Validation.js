// HOW TO USE

//Step 1 - import the specific validation you need or you can do this batch import

/*

import {
  validateEmail, validatePhone, validatePassword, validateConfirmPassword,
  validateName, validateEmployeeId, validateFreeText,
  validateTicketDescription, validateTicketResolution,
  validateHouseNumber, validateAptNumber, validateStreet,
  validateCity, validateState, validateZip3, validateZip2,
  validateWorkAddress, validateTrackingNumber,
  validateWeight, validateDimension, validateZone,
  validateBirthDay, validateBirthMonth, validateBirthYear,
  validateAll
} from '../validators'   // adjust path if file is in src/
 
*/

//  Usage: const error = validateEmail(email)
//         if (error) { setError(error); return }




// String helpers
export function validateRequired(value, fieldName = 'This field') {
  if (!value || !String(value).trim()) return `${fieldName} is required`
  return null
}

// Email 
export function validateEmail(email) {
  const err = validateRequired(email, 'Email')
  if (err) return err
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim()))
    return 'Invalid email address'
  if (String(email).trim().length > 255) return 'Email is too long'
  return null
}

// Phone 
export function validatePhone(phone) {
  if (!phone || !String(phone).trim()) return null // optional
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length < 10) return 'Phone number must be at least 10 digits'
  if (digits.length > 15) return 'Phone number is too long'
  return null
}

// Employee ID 
export function validateEmployeeId(value) {
  const err = validateRequired(value, 'Employee ID')
  if (err) return err
  const id = parseInt(value)
  if (isNaN(id) || id <= 0) return 'Employee ID must be a positive number'
  return null
}

// Names 
export function validateName(value, fieldName = 'Name') {
  const err = validateRequired(value, fieldName)
  if (err) return err
  if (String(value).trim().length < 2)
    return `${fieldName} must be at least 2 characters`
  if (String(value).trim().length > 30)
    return `${fieldName} must be 30 characters or less`
  if (!/^[a-zA-Z\s'-]+$/.test(String(value).trim()))
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`
  return null
}

// Support ticket / free text 
export function validateTicketDescription(value) {
  const err = validateRequired(value, 'Description')
  if (err) return err
  if (String(value).trim().length < 10)
    return 'Description must be at least 10 characters'
  if (String(value).trim().length > 200)
    return 'Description must be 200 characters or less'
  return null
}

export function validateTicketResolution(value) {
  if (!value || !String(value).trim()) return null
  if (String(value).trim().length > 200)
    return 'Resolution note must be 200 characters or less'
  return null
}

export function validateFreeText(value, fieldName = 'Field', min = 2, max = 255) {
  const err = validateRequired(value, fieldName)
  if (err) return err
  if (String(value).trim().length < min)
    return `${fieldName} must be at least ${min} characters`
  if (String(value).trim().length > max)
    return `${fieldName} must be ${max} characters or less`
  return null
}

// Address fields 
export function validateHouseNumber(value) {
  const err = validateRequired(value, 'House number')
  if (err) return err
  if (String(value).trim().length > 10) return 'House number is too long'
  return null
}

export function validateAptNumber(value) {
  if (!value || !String(value).trim()) return null // optional
  if (String(value).trim().length > 10) return 'Apt number is too long'
  return null
}

export function validateStreet(value) {
  const err = validateRequired(value, 'Street')
  if (err) return err
  if (String(value).trim().length < 2) return 'Street name is too short'
  if (String(value).trim().length > 100) return 'Street name is too long'
  return null
}

export function validateCity(value) {
  const err = validateRequired(value, 'City')
  if (err) return err
  if (String(value).trim().length < 2) return 'City name is too short'
  if (String(value).trim().length > 100) return 'City name is too long'
  if (!/^[a-zA-Z\s'-]+$/.test(String(value).trim()))
    return 'City name can only contain letters, spaces, hyphens, and apostrophes'
  return null
}

export function validateState(value) {
  const err = validateRequired(value, 'State')
  if (err) return err
  const s = String(value).trim()
  if (s.length < 2) return 'State must be at least 2 characters'
  if (s.length > 50) return 'State is too long'
  return null
}

// export function validateZip3(value) {
//   const err = validateRequired(value, 'ZIP (first 3)')
//   if (err) return err
//   if (!/^\d{3}$/.test(String(value).trim()))
//     return 'ZIP first 3 must be exactly 3 digits'
//   return null
// }

// export function validateZip2(value) {
//   const err = validateRequired(value, 'ZIP (last 2)')
//   if (err) return err
//   if (!/^\d{2}$/.test(String(value).trim()))
//     return 'ZIP last 2 must be exactly 2 digits'
//   return null
// }
export function validateZip(value) {
  const err = validateRequired(value, 'ZIP code')
  if (err) return err
  if (!/^\d{5}$/.test(String(value).trim()))
    return 'ZIP code must be exactly 5 digits'
  return null
}

// Validates a full address object at once
export function validateAddress({ house_number, street, city, state, zip_first3, zip_last2, apt_number }, prefix = '') {
  const p = prefix ? `${prefix} ` : ''
  return validateAll([
    [house_number, validateHouseNumber],
    [apt_number,   validateAptNumber],
    [street,       validateStreet],
    [city,         validateCity],
    [state,        validateState],
    [zip_code,   validateZip],
    // [zip_last2,    validateZip2],
  ])
}

// Address single string format
export function validateWorkAddress(value) {
  const err = validateRequired(value, 'Work address')
  if (err) return err
  if (String(value).trim().length < 5) return 'Work address is too short'
  if (String(value).trim().length > 200) return 'Work address is too long'
  return null
}

// Package tracking number 
export function validateTrackingNumber(value) {
  const err = validateRequired(value, 'Tracking number')
  if (err) return err
  const t = String(value).trim()
  if (t.length < 3) return 'Tracking number is too short'
  if (t.length > 10) return 'Tracking number must be 10 characters or less'
  if (!/^[a-zA-Z0-9]+$/.test(t))
    return 'Tracking number can only contain letters and numbers'
  return null
}

// Package fields 
export function validateWeight(value) {
  const err = validateRequired(value, 'Weight')
  if (err) return err
  const w = parseFloat(value)
  if (isNaN(w) || w <= 0) return 'Weight must be greater than 0'
  if (w > 70) return 'Weight cannot exceed 70 lbs'
  return null
}

export function validateDimension(value, label = 'Dimension') {
  if (!value && value !== 0) return null // optional
  const d = parseFloat(value)
  if (isNaN(d) || d <= 0) return `${label} must be greater than 0`
  if (d > 30) return `${label} cannot exceed 30 inches`
  return null
}

export function validateZone(value) {
  const err = validateRequired(value, 'Zone')
  if (err) return err
  const z = parseInt(value)
  if (isNaN(z) || z < 1 || z > 9) return 'Zone must be between 1 and 9'
  return null
}

// Password 
export function validatePassword(password) {
  const err = validateRequired(password, 'Password')
  if (err) return err
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (password.length > 100) return 'Password is too long'
  return null
}

export function validateConfirmPassword(password, confirmPassword) {
  const err = validateRequired(confirmPassword, 'Confirm password')
  if (err) return err
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

// Birth date 
export function validateBirthDay(value) {
  const err = validateRequired(value, 'Birth day')
  if (err) return err
  const d = parseInt(value)
  if (isNaN(d) || d < 1 || d > 31) return 'Birth day must be between 1 and 31'
  return null
}

export function validateBirthMonth(value) {
  const err = validateRequired(value, 'Birth month')
  if (err) return err
  const m = parseInt(value)
  if (isNaN(m) || m < 1 || m > 12) return 'Birth month must be between 1 and 12'
  return null
}

export function validateBirthYear(value) {
  const err = validateRequired(value, 'Birth year')
  if (err) return err
  const y = parseInt(value)
  const currentYear = new Date().getFullYear()
  if (isNaN(y) || y < 1900 || y > currentYear - 10)
    return `Birth year must be between 1900 and ${currentYear - 10}`
  return null
}
export function validateAll(checks) {
  for (const [value, fn, ...args] of checks) {
    const err = fn(value, ...args)
    if (err) return err
  }
  return null
}

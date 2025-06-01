/**
 * Password strength validation utilities
 */

export interface PasswordStrengthResult {
  score: number; 
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
  requirements: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  isValid: boolean; 
}

export function analyzePasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= 8,
    hasLowercase: /(?=.*[a-z])/.test(password),
    hasUppercase: /(?=.*[A-Z])/.test(password),
    hasNumber: /(?=.*\d)/.test(password),
    hasSpecialChar: /(?=.*[@$!%*?&])/.test(password),
  };

  let score = 0;
  if (requirements.minLength) score++;
  if (requirements.hasLowercase) score++;
  if (requirements.hasUppercase) score++;
  if (requirements.hasNumber) score++;
  if (requirements.hasSpecialChar) score++;

  let level: PasswordStrengthResult['level'];
  if (score <= 2) level = 'weak';
  else if (score === 3) level = 'fair';
  else if (score === 4) level = 'good';
  else level = 'strong';

  return {
    score,
    level,
    requirements,
    isValid: score >= 3, 
  };
}

export function getPasswordStrengthColor(level: PasswordStrengthResult['level']): string {
  switch (level) {
    case 'weak': return 'bg-red-500';
    case 'fair': return 'bg-yellow-500';
    case 'good': return 'bg-blue-500';
    case 'strong': return 'bg-green-500';
    default: return 'bg-green-500';
  }
}

export function getPasswordStrengthTextColor(level: PasswordStrengthResult['level']): string {
  switch (level) {
    case 'weak': return 'text-red-500';
    case 'fair': return 'text-yellow-500';
    case 'good': return 'text-blue-500';
    case 'strong': return 'text-green-500';
    default: return 'text-green-500';
  }
}

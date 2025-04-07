# Peakly App Architecture Refactoring Plan

This document outlines a comprehensive refactoring plan to reorganize the Peakly app codebase for better maintainability, separation of concerns, and code reuse.

## New Directory Structure

```
/src
├── assets/             # Static assets (images, icons, etc.)
├── components/
│   ├── common/         # Shared UI components
│   │   ├── buttons/
│   │   ├── forms/
│   │   ├── layout/
│   │   ├── loaders/
│   │   └── modals/
│   └── ui/            # Reusable UI primitives
├── features/
│   ├── auth/          # Authentication feature
│   ├── posts/         # Peak posts feature
│   ├── profiles/      # User profiles feature
│   ├── friends/       # Friend system feature
│   └── landing/       # Landing page feature
├── hooks/             # Custom hooks
├── lib/               # Utility libraries
├── pages/             # Top-level pages
├── styles/            # Global styles
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## Implementation Steps

### 1. Create Base Directory Structure

```bash
# Create required directories
mkdir -p src/assets
mkdir -p src/components/common/{buttons,forms,layout,loaders,modals}
mkdir -p src/components/ui
mkdir -p src/features/{auth,posts,profiles,friends,landing}/{components,api,hooks}
mkdir -p src/pages
mkdir -p src/utils
```

### 2. Core UI Components to Build First

#### Base Button Component
```tsx
// src/components/common/buttons/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-black text-white hover:bg-gray-900 focus:ring-black',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-black',
    text: 'bg-transparent hover:bg-gray-100 focus:ring-black',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;
  
  return (
    <button
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthClass}
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
```

#### Form Input Component
```tsx
// src/components/common/forms/Input.tsx
import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', id, ...props }, ref) => {
    const inputId = id || label ? label.toLowerCase().replace(/\s+/g, '-') : undefined;
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={`
            mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:outline-none focus:ring-black focus:border-black
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helpText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

#### Modal Component
```tsx
// src/components/common/modals/Modal.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'md' 
}: ModalProps) {
  // Handle escape key press
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className={`bg-white rounded-xl shadow-xl w-full ${maxWidthClasses[maxWidth]} relative`}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 3. Feature Migration Plan

#### Auth Feature Migration
1. Move components to their new locations:
   - `LoginModal.tsx` → `src/features/auth/components/LoginModal.tsx`
   - `SignUpModal.tsx` → `src/features/auth/components/SignUpModal.tsx`
   - `ResetPasswordPage.tsx` → `src/features/auth/components/ResetPasswordPage.tsx`
2. Move auth functionality from `lib/auth.ts` to `src/features/auth/api/auth.ts`
3. Move `useAuth.ts` hook to `src/features/auth/hooks/useAuth.ts`

#### Posts Feature Migration
1. Move components to their new locations:
   - `PeakPostCard.tsx` → `src/features/posts/components/PeakPostCard.tsx`
   - `PeakPostDetail.tsx` → `src/features/posts/components/PeakPostDetail.tsx`
   - `PeakPostForm.tsx` → `src/features/posts/components/PeakPostForm.tsx`
   - `PeakPostsSection.tsx` → `src/features/posts/components/PeakPostsSection.tsx`
2. Extract post-related API calls to `src/features/posts/api/posts.ts`

#### Profiles Feature Migration
1. Move components to their new locations:
   - `ProfileCard.tsx` → `src/features/profiles/components/ProfileCard.tsx`
   - `ProfileEditor.tsx` → `src/features/profiles/components/ProfileEditor.tsx`
   - `ProfileFilters.tsx` → `src/features/profiles/components/ProfileFilters.tsx`
   - `ProfileGrid.tsx` → `src/features/profiles/components/ProfileGrid.tsx`
   - `ProfileHeader.tsx` → `src/features/profiles/components/ProfileHeader.tsx`
   - `UserProfile.tsx` → `src/features/profiles/components/UserProfile.tsx`
   - `SkillsEditor.tsx` → `src/features/profiles/components/SkillsEditor.tsx`
   - `SkillsList.tsx` → `src/features/profiles/components/SkillsList.tsx`
2. Create profile-related API functionality in `src/features/profiles/api/profiles.ts`

## Refactoring Recommendations

### 1. Extract form handling logic from each form to custom hooks
For example, extract login form validation and submission logic to a `useLoginForm` hook.

### 2. Use the new base components 
Replace direct HTML elements with our new component library:
- Replace `<button>` elements with `<Button>` component
- Replace `<input>` elements with `<Input>` component
- Replace modal implementations with the shared `<Modal>` component

### 3. Create consistent export patterns
Use named exports for components and index.ts barrel files to simplify imports:

```tsx
// src/features/auth/index.ts
export * from './components/LoginModal';
export * from './components/SignUpModal';
export * from './components/ResetPasswordPage';
export * from './hooks/useAuth';
```

### 4. Refactor API calls to use custom hooks
Create hooks for API functionality that handle loading, error states, and data fetching:

```tsx
// src/features/profiles/hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { fetchProfile } from '../api/profiles';
import type { Profile } from '../../../types/database';

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const data = await fetchProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  return { profile, isLoading, error };
}
```

## Implementation Timeline

1. Create the directory structure and base components
2. Migrate one feature at a time, starting with Auth
3. Update imports across the application
4. Test functionality after each feature migration
5. Refactor components to use the new common components
6. Review and optimize performance

This refactoring plan will significantly improve code organization, maintainability, and the developer experience while working on the Peakly app.
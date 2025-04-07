# Peakly App Implementation Steps

Follow these steps to migrate to the new architecture:

## Step 1: Create the folder structure (already done)

```bash
mkdir -p src/components/common/{buttons,forms,layout,loaders,modals}
mkdir -p src/components/ui
mkdir -p src/features/{auth,posts,profiles,friends,landing}/{components,api,hooks}
mkdir -p src/pages
mkdir -p src/utils
```

## Step 2: Migrate Auth Feature

1. Create the Auth API module:

```bash
cp src/lib/auth.ts src/features/auth/api/auth.ts
```

2. Update imports in auth.ts to use relative paths

3. Move the auth hook:

```bash
cp src/hooks/useAuth.ts src/features/auth/hooks/useAuth.ts
```

4. Update useAuth.ts imports to use the new API module

5. Move auth-related components:

```bash
cp src/components/LoginModal.tsx src/features/auth/components/LoginModal.tsx
cp src/components/SignUpModal.tsx src/features/auth/components/SignUpModal.tsx
cp src/components/ResetPasswordPage.tsx src/features/auth/components/ResetPasswordPage.tsx
```

6. Update imports in all moved components

7. Create barrel file for exports:

```bash
touch src/features/auth/index.ts
```

```typescript
// src/features/auth/index.ts
export * from './components/LoginModal';
export * from './components/SignUpModal';
export * from './components/ResetPasswordPage';
export * from './hooks/useAuth';
```

## Step 3: Migrate Posts Feature

1. Create the posts API module:

```bash
touch src/features/posts/api/posts.ts
```

2. Move post-related components:

```bash
cp src/components/PeakPostCard.tsx src/features/posts/components/PeakPostCard.tsx
cp src/components/PeakPostDetail.tsx src/features/posts/components/PeakPostDetail.tsx
cp src/components/PeakPostForm.tsx src/features/posts/components/PeakPostForm.tsx
cp src/components/PeakPostsSection.tsx src/features/posts/components/PeakPostsSection.tsx
cp src/components/post/PostDetails.tsx src/features/posts/components/PostDetails.tsx
```

3. Update imports in all moved components

4. Create barrel file for exports:

```bash
touch src/features/posts/index.ts
```

## Step 4: Migrate Profiles Feature

1. Create the profiles API module:

```bash
touch src/features/profiles/api/profiles.ts
```

2. Move profile-related components:

```bash
cp src/components/ProfileCard.tsx src/features/profiles/components/ProfileCard.tsx
cp src/components/ProfileEditor.tsx src/features/profiles/components/ProfileEditor.tsx
cp src/components/ProfileFilters.tsx src/features/profiles/components/ProfileFilters.tsx
cp src/components/ProfileGrid.tsx src/features/profiles/components/ProfileGrid.tsx
cp src/components/ProfileHeader.tsx src/features/profiles/components/ProfileHeader.tsx
cp src/components/UserProfile.tsx src/features/profiles/components/UserProfile.tsx
cp src/components/SkillsEditor.tsx src/features/profiles/components/SkillsEditor.tsx
cp src/components/SkillsList.tsx src/features/profiles/components/SkillsList.tsx
```

3. Update imports in all moved components

4. Create barrel file for exports:

```bash
touch src/features/profiles/index.ts
```

## Step 5: Migrate Shared UI Components

1. Move shared components:

```bash
cp src/components/shared/Footer.tsx src/components/common/layout/Footer.tsx
cp src/components/Navbar.tsx src/components/common/layout/Navbar.tsx
cp src/components/shared/LoadingScreen.tsx src/components/common/loaders/LoadingScreen.tsx
cp src/components/shared/ErrorBoundary.tsx src/components/common/ErrorBoundary.tsx
```

2. Update imports in all moved components

## Step 6: Update App.tsx imports

Update import paths in App.tsx to use the new module structure

## Step 7: Create UI Components

Create additional UI components by extracting from existing components:
- Avatar.tsx (from ProfileCard)
- Card.tsx (from PostCard)
- Badge.tsx (for tags/labels)

## Step 8: Testing

Test each feature after migrating to ensure functionality still works

## Post-Migration Tasks

1. Refactor components to use the new shared UI components
2. Extract form logic to custom hooks
3. Improve API error handling
4. Add proper TypeScript types for all API responses

## Usage Examples

### Using the Button component:
```tsx
import { Button } from '../components/common/buttons/Button';

// Primary button
<Button onClick={handleSubmit}>Submit</Button>

// Secondary button with loading state
<Button 
  variant="secondary" 
  isLoading={isSubmitting}
  onClick={handleCancel}
>
  Cancel
</Button>

// Full width outline button
<Button variant="outline" fullWidth>
  View Details
</Button>
```

### Using the Input component:
```tsx
import { Input } from '../components/common/forms/Input';

// Basic input with label
<Input
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>

// Input with error message
<Input
  label="Password"
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={passwordError}
  required
/>

// Input with help text
<Input
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  helpText="Choose a unique username for your profile"
  required
/>
```

### Using the Modal component:
```tsx
import { useState } from 'react';
import { Modal } from '../components/common/modals/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
      >
        <p>Modal content goes here...</p>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save
          </Button>
        </div>
      </Modal>
    </>
  );
}
```
# Frontend Guide - VirtualDoc SaaS Dashboard

## Routes Available

### Public Routes
- **Homepage**: `http://localhost:3000/`
- **Admin Login**: `http://localhost:3000/admin/login`
- **Forgot Password**: `http://localhost:3000/admin/forgot-password`

### Protected Routes
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard` (Requires authentication)

## Component Library

### Typography System
Located in `src/styles/typography.ts`

Usage:
```tsx
import typography from '../styles/typography';

<h1 className={typography.h1}>Heading 1</h1>
<p className={typography.body}>Body text</p>
```

Available classes:
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` - Headings
- `body`, `bodyLarge`, `bodySmall` - Body text
- `label`, `labelSmall` - Labels
- `link`, `linkSmall` - Links
- `muted`, `error`, `success`, `warning`, `info` - Utility colors

### UI Components

#### Button
```tsx
import { Button } from '../components/ui';

<Button variant="primary" size="md" isLoading={loading}>
  Click Me
</Button>
```

Props:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean

#### Input
```tsx
import { Input } from '../components/ui';

<Input
  label="Email Address"
  type="email"
  error={errors.email}
  helperText="Enter your email"
/>
```

Props:
- `label`: string
- `error`: string
- `helperText`: string

#### Card
```tsx
import { Card } from '../components/ui';

<Card hover padding="md">
  Content here
</Card>
```

Props:
- `hover`: boolean (enables hover effects)
- `padding`: 'none' | 'sm' | 'md' | 'lg'

#### Alert
```tsx
import { Alert } from '../components/ui';

<Alert variant="success">
  Operation successful!
</Alert>
```

Props:
- `variant`: 'success' | 'error' | 'warning' | 'info'

## API Integration

### Forgot Password Flow
1. User enters email on forgot password page
2. API generates OTP (shown in console for development)
3. User enters OTP on next step
4. User sets new password
5. Password is reset and user redirected to login

### Logout Flow
1. User clicks logout button
2. API revokes all tokens
3. Local storage cleared
4. User redirected to login page

## Color System

All colors are available as CSS variables and Tailwind classes:

### Primary Colors
- `primary-50` to `primary-900`
- Default: `#0066FF`

### Secondary Colors
- `secondary-50` to `secondary-900`
- Default: `#00C896`

### Semantic Colors
- `success`: `#10B981`
- `warning`: `#F59E0B`
- `error`: `#EF4444`
- `info`: `#3B82F6`

## Dark Mode

Theme toggle available on all pages. Theme preference is saved in localStorage and automatically applied on page load.

## Best Practices

1. **Use Typography System**: Always use typography classes for consistent text styling
2. **Use UI Components**: Use Button, Input, Card, Alert for consistent UI
3. **Dark Mode Support**: Always include dark mode classes (`dark:bg-gray-800`, etc.)
4. **Responsive Design**: Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
5. **Accessibility**: Include proper labels, ARIA attributes, and keyboard navigation


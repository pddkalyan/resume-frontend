import ModernLayout from './ModernLayout';
import ClassicLayout from './ClassicLayout';
// If a user selects a template with a base component we haven't built yet, use Modern as a fallback
import FallbackLayout from './ModernLayout'; 

export const getLayoutComponent = (baseComponentName) => {
  switch (baseComponentName) {
    case 'ModernLayout':
      return ModernLayout;
    case 'ClassicLayout':
      return ClassicLayout;
    default:
      console.warn(`Layout ${baseComponentName} not found. Using fallback.`);
      return FallbackLayout; 
  }
};
import ModernLayout from "./ModernLayout";
import ClassicLayout from "./ClassicLayout";
import CustomHtmlLayout from "./CustomHtmlLayout";

export const getLayoutComponent = (baseComponentName) => {
  switch (baseComponentName) {
    case 'ModernLayout':
      return ModernLayout;
    case 'ClassicLayout':
      return ClassicLayout;
    case 'CustomHtmlLayout': 
      return CustomHtmlLayout;
    default:
      console.warn(`Layout ${baseComponentName} not found. Using fallback.`);
      return ModernLayout; 
  }
};
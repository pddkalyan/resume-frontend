import ModernLayout from "./ModernLayout";
import ClassicLayout from "./ClassicLayout";
import CustomHtmlLayout from "./CustomHtmlLayout";
import BasicLayout from "./BasicLayout"; // <-- NEW IMPORT

export const getLayoutComponent = (baseComponentName) => {
  switch (baseComponentName) {
    case 'ModernLayout':
      return ModernLayout;
    case 'ClassicLayout':
      return ClassicLayout;
    case 'CustomHtmlLayout': 
      return CustomHtmlLayout;
    case 'BasicLayout':          // <-- NEW MAPPING
      return BasicLayout;
    default:
      console.warn(`Layout ${baseComponentName} not found. Using fallback.`);
      return ModernLayout; 
  }
};
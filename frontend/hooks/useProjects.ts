// Thin wrappers around the Zustand project store — kept as hooks so components
// stay decoupled from the store import and future logic can be added here.
export { useProjectStore as useProjects } from '@/store/useProjectStore';

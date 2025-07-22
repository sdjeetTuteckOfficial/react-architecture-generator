import CustomNode from '../components/CustomNode';
import {
  ResizableTransparentRectangle,
  StyledResizableRectangle,
} from '../components/TransparentRectangleNode';
import DbTableNode from '../components/DbTableNode';

// Constants
const NODE_TYPES = {
  custom: CustomNode,
  resizableRectangle: ResizableTransparentRectangle,
  styledRectangle: StyledResizableRectangle,
  dbTableNode: DbTableNode,
};

const RECTANGLE_CONFIGS = {
  resizableRectangle: {
    label: 'Group Area',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: '#3b82f6',
    textColor: '#1e40af',
    borderRadius: '12px',
    fontSize: '12px',
    showPattern: false,
  },
  styledRectangle: {
    title: 'Component Group',
    centerLabel: 'Drag nodes here',
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: '#10b981',
    borderStyle: 'dashed',
    gradientStart: 'rgba(16, 185, 129, 0.02)',
    gradientEnd: 'rgba(59, 130, 246, 0.02)',
    gradient: true,
    shadow: true,
    showCount: true,
    nodeCount: 0,
  },
};

const KEYBOARD_SHORTCUTS = {
  DELETE: 'Delete',
  ADD_RECTANGLE: 'r',
  ADD_GROUP: 'g',
};

export { NODE_TYPES, RECTANGLE_CONFIGS, KEYBOARD_SHORTCUTS };

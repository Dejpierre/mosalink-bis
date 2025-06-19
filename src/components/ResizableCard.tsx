import React, { useState, useRef, useEffect } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useStore } from '../store/useStore';
import { BentoCard, GridSize } from '../types';
import { BentoCardComponent } from './BentoCardComponent';
import { Edit3, Maximize as ArrowsMaximize, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface ResizableCardProps {
  card: BentoCard;
  isBeingDragged?: boolean;
  isDragOverlay?: boolean;
  cellSize: number;
  gap: number;
  maxCols: number;
  maxRows: number;
  onIntelligentResize?: (cardId: string, newCols: number, newRows: number) => boolean;
  onEdit: () => void;
}

export const ResizableCard: React.FC<ResizableCardProps> = ({ 
  card, 
  isBeingDragged = false,
  isDragOverlay = false,
  cellSize,
  gap,
  maxCols,
  maxRows,
  onIntelligentResize,
  onEdit
}) => {
  const { updateCard, currentLayout, getCurrentDeviceCards } = useStore();
  const [isResizing, setIsResizing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startSizeRef = useRef<{ cols: number; rows: number }>({ cols: 1, rows: 1 });
  const [previewSize, setPreviewSize] = useState<{ cols: number; rows: number } | null>(null);
  
  // Motion values for smooth animations
  const scale = useMotionValue(1);
  const opacity = useMotionValue(1);
  const borderOpacity = useMotionValue(0);
  const elevation = useMotionValue(0);
  
  // Spring animations for smoother transitions
  const scaleSpring = useSpring(scale, { stiffness: 300, damping: 30 });
  const opacitySpring = useSpring(opacity, { stiffness: 300, damping: 30 });
  const borderOpacitySpring = useSpring(borderOpacity, { stiffness: 300, damping: 30 });
  const elevationSpring = useSpring(elevation, { stiffness: 300, damping: 30 });
  
  // Set elevation based on drag state
  useEffect(() => {
    if (isBeingDragged) {
      elevation.set(1);
    } else {
      elevation.set(0);
    }
  }, [isBeingDragged, elevation]);
  
  // Reset animation values when not resizing
  useEffect(() => {
    if (!isResizing) {
      scale.set(1);
      opacity.set(1);
      borderOpacity.set(0);
    } else {
      scale.set(1.02);
      borderOpacity.set(0.7);
    }
  }, [isResizing, scale, opacity, borderOpacity]);

  // Get current card dimensions
  const getCurrentSize = () => {
    const [cols, rows] = card.size.split('x').map(Number);
    return { cols, rows };
  };

  // SYSTÈME UNIQUE DE RESIZE
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isDragOverlay || isBeingDragged || currentLayout === 'mobile') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const currentSize = getCurrentSize();
    startSizeRef.current = currentSize;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    
    setIsResizing(true);
    setPreviewSize(currentSize);

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const deltaX = e.clientX - startPosRef.current.x;
      const deltaY = e.clientY - startPosRef.current.y;
      
      const colDelta = Math.round(deltaX / (cellSize + gap));
      const rowDelta = Math.round(deltaY / (cellSize + gap));
      
      const newCols = Math.max(1, Math.min(maxCols, startSizeRef.current.cols + colDelta));
      const newRows = Math.max(1, Math.min(maxRows, startSizeRef.current.rows + rowDelta));
      
      // Vérification si le resize est autorisé
      let canResize = true;
      if (onIntelligentResize) {
        canResize = onIntelligentResize(card.id, newCols, newRows);
      }
      
      // LOGIQUE UNIFIÉE : Preview et application ensemble
      if (canResize) {
        setPreviewSize({ cols: newCols, rows: newRows });
        const newSizeString = `${newCols}x${newRows}` as GridSize;
        if (newSizeString !== card.size) {
          updateCard(card.id, { size: newSizeString });
        }
      }
      // Si pas autorisé, on garde la preview à la taille actuelle
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      scale.set(1);
      borderOpacity.set(0);
      
      setIsResizing(false);
      setPreviewSize(null);
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Check resize limits
  const canResizeRight = () => {
    const { cols } = getCurrentSize();
    return cols < maxCols;
  };

  const canResizeBottom = () => {
    const { rows } = getCurrentSize();
    return rows < maxRows;
  };

  const isMobileOrTablet = currentLayout === 'mobile' || currentLayout === 'tablet';

  // Get display size
  const displaySize = previewSize || getCurrentSize();

  // SYSTÈME DE DÉPLACEMENT (séparé du resize)
  const canMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!card.gridPosition) return false;
    
    const { col, row } = card.gridPosition;
    const { cols, rows } = getCurrentSize();
    
    if (direction === 'up' && row <= 0) return false;
    if (direction === 'down' && row + rows >= maxRows) return false;
    if (direction === 'left' && col <= 0) return false;
    if (direction === 'right' && col + cols >= maxCols) return false;
    
    let newCol = col;
    let newRow = row;
    
    if (direction === 'up') newRow--;
    if (direction === 'down') newRow++;
    if (direction === 'left') newCol--;
    if (direction === 'right') newCol++;
    
    // Check collisions
    const currentCards = getCurrentDeviceCards();
    for (const otherCard of currentCards) {
      if (otherCard.id === card.id || !otherCard.gridPosition) continue;
      
      const [otherColSpan, otherRowSpan] = otherCard.size.split('x').map(Number);
      const { col: otherCol, row: otherRow } = otherCard.gridPosition;
      
      const overlap = !(
        newCol >= otherCol + otherColSpan ||
        newCol + cols <= otherCol ||
        newRow >= otherRow + otherRowSpan ||
        newRow + rows <= otherRow
      );
      
      if (overlap) return false;
    }
    
    return true;
  };
  
  const moveCard = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!card.gridPosition || !canMove(direction)) return;
    
    const { col, row } = card.gridPosition;
    let newCol = col;
    let newRow = row;
    
    if (direction === 'up') newRow--;
    if (direction === 'down') newRow++;
    if (direction === 'left') newCol--;
    if (direction === 'right') newCol++;
    
    updateCard(card.id, {
      gridPosition: { col: newCol, row: newRow }
    });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative group h-full w-full"
      style={{ 
        scale: scaleSpring,
        transition: 'all 0.2s ease-out',
        filter: `drop-shadow(0 ${elevation.get() * 25}px ${elevation.get() * 25}px rgba(0,0,0,${elevation.get() * 0.35}))`
      }}
    >
      {/* Shadow effect */}
      <motion.div 
        className="absolute inset-0 rounded-lg -z-10 pointer-events-none"
        style={{
          boxShadow: `0 ${elevation.get() * 25}px ${elevation.get() * 50}px rgba(0,0,0,${elevation.get() * 0.25}), 0 ${elevation.get() * 10}px ${elevation.get() * 10}px rgba(0,0,0,${elevation.get() * 0.15})`,
          opacity: elevation.get()
        }}
      />
      
      <div className="h-full w-full">
        <BentoCardComponent
          card={card}
          isBeingDragged={isBeingDragged}
          isDragOverlay={isDragOverlay}
        />
      </div>
      
      {/* Drag handle - Desktop only */}
      {!isMobileOrTablet && !isDragOverlay && !isBeingDragged && !isResizing && (
        <div className="absolute top-2 left-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 drag-handle cursor-move">
          <ArrowsMaximize size={14} />
        </div>
      )}
      
      {/* Mobile/Tablet Movement Controls */}
      {isMobileOrTablet && !isDragOverlay && !isBeingDragged && !isResizing && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 flex gap-1">
          {canMove('up') && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                moveCard('up');
              }}
              className="p-1.5 rounded-full bg-black/50 text-white hover:bg-indigo-500"
            >
              <ArrowUp size={12} />
            </motion.button>
          )}
          
          {canMove('down') && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                moveCard('down');
              }}
              className="p-1.5 rounded-full bg-black/50 text-white hover:bg-indigo-500"
            >
              <ArrowDown size={12} />
            </motion.button>
          )}
          
          {canMove('left') && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                moveCard('left');
              }}
              className="p-1.5 rounded-full bg-black/50 text-white hover:bg-indigo-500"
            >
              <ArrowLeft size={12} />
            </motion.button>
          )}
          
          {canMove('right') && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                moveCard('right');
              }}
              className="p-1.5 rounded-full bg-black/50 text-white hover:bg-indigo-500"
            >
              <ArrowRight size={12} />
            </motion.button>
          )}
        </div>
      )}
      
      {/* Edit Button */}
      {!isDragOverlay && !isBeingDragged && !isResizing && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity z-30"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Edit3 size={14} />
        </motion.button>
      )}
      
      {/* RESIZE HANDLE UNIQUE - Bottom-right corner */}
      {!isDragOverlay && !isBeingDragged && !isMobileOrTablet && canResizeRight() && canResizeBottom() && (
        <div
          className="absolute bottom-0 right-0 w-12 h-12 cursor-nwse-resize bg-transparent hover:bg-white/30 transition-all duration-200 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100"
          onMouseDown={handleResizeMouseDown}
        >
          <ArrowsMaximize size={14} className="text-white/70" />
        </div>
      )}
      
      {/* Resize indicator */}
      {isResizing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 px-4 py-3 bg-black/90 backdrop-blur-sm text-white text-sm rounded-lg font-medium z-50 shadow-xl border border-white/20"
        >
          <div className="text-center">
            <div className="font-bold text-base text-white">{displaySize.cols}×{displaySize.rows}</div>
          </div>
        </motion.div>
      )}
      
      {/* Resize preview overlay */}
      {isResizing && (
        <motion.div 
          className="absolute inset-0 rounded-lg border-2 border-dashed pointer-events-none z-30"
          initial={{ opacity: 0 }}
          style={{ 
            opacity: borderOpacitySpring,
          }}
          animate={{ 
            borderColor: ['rgba(99, 102, 241, 0.7)', 'rgba(139, 92, 246, 0.7)'],
          }}
          exit={{ opacity: 0 }}
          transition={{
            borderColor: {
              repeat: Infinity,
              duration: 1.5,
              repeatType: 'reverse'
            }
          }}
        />
      )}
      
      {/* Glow effect during resize */}
      {isResizing && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-indigo-500/20 blur-xl -z-10 pointer-events-none"
          style={{
            opacity: 0.3,
            scale: 1.1
          }}
        />
      )}
    </motion.div>
  );
};
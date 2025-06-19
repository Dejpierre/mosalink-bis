import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Layers, Eye, Settings, Plus, Image, Type, MessageSquare, Grid, X, Save, Copy, Trash2, Edit3 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { BentoCard } from '../types';
import { nanoid } from 'nanoid';

interface SavedBlock extends Omit<BentoCard, 'id' | 'order'> {
  id: string;
  name: string;
  createdAt: Date;
}

interface BottomToolbarProps {
  onOpenGlobalStyleEditor: () => void;
  onOpenGlobalBackgroundEditor: () => void;
  onOpenPreview: () => void;
  onOpenSettings?: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  onOpenGlobalStyleEditor,
  onOpenGlobalBackgroundEditor,
  onOpenPreview,
  onOpenSettings
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'saved'>('new');
  const [savedBlocks, setSavedBlocks] = useState<SavedBlock[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [blockToSave, setBlockToSave] = useState<Omit<BentoCard, 'id' | 'order'> | null>(null);
  const [blockName, setBlockName] = useState('');
  const { addCard, cards, selectedCardId } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load saved blocks from localStorage
    const loadSavedBlocks = () => {
      const savedBlocksJson = localStorage.getItem('savedBlocks');
      if (savedBlocksJson) {
        try {
          const blocks = JSON.parse(savedBlocksJson);
          setSavedBlocks(blocks);
        } catch (error) {
          console.error('Failed to parse saved blocks:', error);
        }
      }
    };

    loadSavedBlocks();
  }, []);

  // Save blocks to localStorage
  const saveBlocksToStorage = (blocks: SavedBlock[]) => {
    localStorage.setItem('savedBlocks', JSON.stringify(blocks));
  };

  const handleAddBlock = async (type: 'image' | 'text' | 'multi' | 'form') => {
    let newCard;
    
    switch (type) {
      case 'image':
        newCard = {
          title: 'Image/Vidéo',
          description: '',
          url: '',
          backgroundColor: '#6366f1',
          textColor: '#ffffff',
          size: '2x2' as const,
          backgroundImage: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        };
        break;
      
      case 'text':
        newCard = {
          title: 'Bloc de texte',
          description: 'Cliquez pour éditer ce bloc de texte et ajouter votre contenu. Vous pouvez modifier le style, la police et les couleurs.',
          url: '',
          backgroundColor: '#1e293b',
          textColor: '#ffffff',
          size: '2x1' as const,
          typography: {
            fontFamily: 'inter' as const,
            titleWeight: '700' as const,
            descriptionWeight: '400' as const,
            textAlign: 'left' as const,
            titleSize: 'xl' as const,
            descriptionSize: 'base' as const
          }
        };
        break;
      
      case 'multi':
        newCard = {
          title: 'Multi-redirections',
          description: 'Bloc avec plusieurs liens',
          url: '',
          backgroundColor: '#4c1d95',
          textColor: '#ffffff',
          size: '2x2' as const,
          internalLayout: {
            enabled: true,
            elements: [
              {
                id: `element-${Date.now()}-1`,
                type: 'button',
                zone: 'top-left',
                buttonText: 'Lien 1',
                buttonUrl: 'https://example.com/1',
                styles: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#6366f1',
                  borderRadius: '8px',
                  padding: '8px'
                }
              },
              {
                id: `element-${Date.now()}-2`,
                type: 'button',
                zone: 'top-right',
                buttonText: 'Lien 2',
                buttonUrl: 'https://example.com/2',
                styles: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#8b5cf6',
                  borderRadius: '8px',
                  padding: '8px'
                }
              },
              {
                id: `element-${Date.now()}-3`,
                type: 'button',
                zone: 'bottom-left',
                buttonText: 'Lien 3',
                buttonUrl: 'https://example.com/3',
                styles: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#a855f7',
                  borderRadius: '8px',
                  padding: '8px'
                }
              },
              {
                id: `element-${Date.now()}-4`,
                type: 'button',
                zone: 'bottom-right',
                buttonText: 'Lien 4',
                buttonUrl: 'https://example.com/4',
                styles: {
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#d946ef',
                  borderRadius: '8px',
                  padding: '8px'
                }
              }
            ],
            showGrid: false
          }
        };
        break;
      
      case 'form':
        newCard = {
          title: 'Contactez-nous',
          description: 'Envoyez-nous un message et nous vous répondrons rapidement',
          url: '',
          backgroundColor: '#0f766e',
          textColor: '#ffffff',
          size: '2x2' as const,
          contactFormData: {
            type: 'contact',
            buttonText: 'Envoyer',
            placeholderText: 'Votre message...',
            successMessage: 'Message envoyé avec succès ! Nous vous répondrons bientôt.'
          }
        };
        break;
    }
    
    // Solution 2: Type assertion sur newCard
    const result = await addCard(newCard as any);
    
    if (result.success) {
      setShowBlockMenu(false);
    } else {
      alert(result.error);
    }
  };

  const handleSaveCurrentBlock = () => {
    if (selectedCardId) {
      const foundCard = cards.find(card => card.id === selectedCardId);
      if (foundCard) {
        // Explicitly type the selectedCard to help TypeScript with type inference
        const selectedCard: BentoCard = foundCard;
        // Omit id and order from the card
        const { id, order, ...cardData } = selectedCard;
        setBlockToSave(cardData);
        setBlockName(selectedCard.title);
        setShowSaveDialog(true);
      }
    } else {
      alert('Please select a block to save');
    }
  };

  const handleSaveBlock = () => {
    if (!blockToSave || !blockName.trim()) return;

    const newSavedBlock: SavedBlock = {
      ...blockToSave,
      id: nanoid(),
      name: blockName.trim(),
      createdAt: new Date()
    };

    const updatedBlocks = [...savedBlocks, newSavedBlock];
    setSavedBlocks(updatedBlocks);
    saveBlocksToStorage(updatedBlocks);
    setShowSaveDialog(false);
    setBlockToSave(null);
    setBlockName('');
  };

  const handleUseBlock = async (block: SavedBlock) => {
    // Remove id and createdAt from the saved block
    const { id, name, createdAt, ...blockData } = block;
    
    const result = await addCard(blockData);
    
    if (result.success) {
      setShowBlockMenu(false);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteBlock = (blockId: string) => {
    if (confirm('Are you sure you want to delete this saved block?')) {
      const updatedBlocks = savedBlocks.filter(block => block.id !== blockId);
      setSavedBlocks(updatedBlocks);
      saveBlocksToStorage(updatedBlocks);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-1/2 translate-50 z-50 flex items-center gap-2 p-2 bg-white rounded-lg shadow-lg"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium transition-all text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
          title="Ajouter un bloc"
        >
          <Plus size={16} />
          <span>Blocs</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenGlobalStyleEditor}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium transition-all text-sm"
          title="Styles Globaux"
        >
          <Wand2 size={16} />
          <span>Styles</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenGlobalBackgroundEditor}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium transition-all text-sm"
          title="Fond Global"
        >
          <Layers size={16} />
          <span>Fond</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenPreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-black font-medium transition-all text-sm"
          title="Mode Preview"
        >
          <Eye size={16} />
          <span>Preview</span>
        </motion.button>
        
        {onOpenSettings && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all text-sm"
            title="Paramètres"
          >
            <Settings size={16} />
            <span>Paramètres</span>
          </motion.button>
        )}
      </motion.div>

      {/* Block Menu */}
      <AnimatePresence>
        {showBlockMenu && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-1/2 translate-50 z-50 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 w-[500px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Ajouter un bloc</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowBlockMenu(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'new'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Nouveaux blocs
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'saved'
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Blocs sauvegardés
              </motion.button>
            </div>
            
            {activeTab === 'new' && (
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddBlock('image')}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Image size={24} className="text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-800">Image/Vidéo</h4>
                    <p className="text-xs text-gray-500 mt-1">Bloc visuel sans texte</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddBlock('text')}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Type size={24} className="text-blue-600" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-800">Texte</h4>
                    <p className="text-xs text-gray-500 mt-1">Bloc de contenu textuel</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddBlock('multi')}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Grid size={24} className="text-purple-600" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-800">Multi-redirections</h4>
                    <p className="text-xs text-gray-500 mt-1">Bloc avec plusieurs liens</p>
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddBlock('form')}
                  className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <MessageSquare size={24} className="text-teal-600" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-medium text-gray-800">Formulaire</h4>
                    <p className="text-xs text-gray-500 mt-1">Contact ou newsletter</p>
                  </div>
                </motion.button>
              </div>
            )}
            
            {activeTab === 'saved' && (
              <div className="space-y-4">
                {savedBlocks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                      {savedBlocks.map((block) => (
                        <div 
                          key={block.id}
                          className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: block.backgroundColor }}
                              >
                                {block.backgroundImage ? (
                                  <img 
                                    src={block.backgroundImage} 
                                    alt="" 
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : block.contactFormData ? (
                                  <MessageSquare size={16} className="text-white" />
                                ) : block.internalLayout?.enabled ? (
                                  <Grid size={16} className="text-white" />
                                ) : (
                                  <Type size={16} className="text-white" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{block.name}</h4>
                                <p className="text-xs text-gray-500">{block.size} • {new Date(block.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUseBlock(block)}
                                className="p-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
                                title="Utiliser ce bloc"
                              >
                                <Copy size={16} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteBlock(block.id)}
                                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                title="Supprimer ce bloc"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {savedBlocks.length} bloc{savedBlocks.length > 1 ? 's' : ''} sauvegardé{savedBlocks.length > 1 ? 's' : ''}
                      </p>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveCurrentBlock}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors text-sm font-medium"
                      >
                        <Save size={16} />
                        Sauvegarder le bloc actuel
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Save size={48} className="mx-auto text-gray-300 mb-4" />
                    <h4 className="font-medium text-gray-700 mb-2">Aucun bloc sauvegardé</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Sauvegardez vos blocs préférés pour les réutiliser facilement
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveCurrentBlock}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <Save size={16} />
                      Sauvegarder le bloc actuel
                    </motion.button>
                  </div>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Vous pouvez également cliquer sur une cellule vide dans la grille pour ajouter un bloc
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Block Dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Sauvegarder le bloc</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du bloc
                  </label>
                  <input
                    type="text"
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    placeholder="Mon bloc personnalisé"
                    className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                {blockToSave && (
                  <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: blockToSave.backgroundColor }}
                      >
                        {blockToSave.backgroundImage ? (
                          <img 
                            src={blockToSave.backgroundImage} 
                            alt="" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : blockToSave.contactFormData ? (
                          <MessageSquare size={16} className="text-white" />
                        ) : blockToSave.internalLayout?.enabled ? (
                          <Grid size={16} className="text-white" />
                        ) : (
                          <Type size={16} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{blockToSave.title}</h4>
                        <p className="text-xs text-gray-500">{blockToSave.size}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800 font-medium transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveBlock}
                  disabled={!blockName.trim()}
                  className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  Sauvegarder
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomToolbar;
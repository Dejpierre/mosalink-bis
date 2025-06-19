import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { FontFamily, FontWeight, TextAlign } from '../types';
import { HexColorPicker } from 'react-colorful';
import { 
  Palette, 
  Type, 
  Wand2, 
  RefreshCw, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Settings
} from 'lucide-react';

interface GlobalStyleEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

// Font family mappings
const fontFamilyOptions: { value: FontFamily; label: string; preview: string }[] = [
  { value: 'inter', label: 'Inter', preview: 'Modern & Clean' },
  { value: 'poppins', label: 'Poppins', preview: 'Friendly & Round' },
  { value: 'roboto', label: 'Roboto', preview: 'Technical & Clear' },
  { value: 'playfair', label: 'Playfair Display', preview: 'Elegant & Serif' },
  { value: 'montserrat', label: 'Montserrat', preview: 'Bold & Strong' },
  { value: 'lora', label: 'Lora', preview: 'Readable & Serif' },
  { value: 'oswald', label: 'Oswald', preview: 'Condensed & Impact' },
  { value: 'dancing-script', label: 'Dancing Script', preview: 'Handwritten & Fun' }
];

const fontWeightOptions: { value: FontWeight; label: string }[] = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' }
];

const textAlignOptions: { value: TextAlign; label: string; icon: React.ComponentType<{ size?: string | number }> }[] = [
  { value: 'left', label: 'Gauche', icon: AlignLeft },
  { value: 'center', label: 'Centre', icon: AlignCenter },
  { value: 'right', label: 'Droite', icon: AlignRight }
];

const titleSizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'base', label: 'Base' },
  { value: 'lg', label: 'LG' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
  { value: '3xl', label: '3XL' }
];

const descriptionSizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'base', label: 'Base' },
  { value: 'lg', label: 'LG' }
];

// Palettes de couleurs prédéfinies
const colorPalettes = [
  {
    name: 'Océan',
    colors: {
      background: '#1e40af',
      text: '#ffffff'
    }
  },
  {
    name: 'Coucher de soleil',
    colors: {
      background: '#ea580c',
      text: '#ffffff'
    }
  },
  {
    name: 'Forêt',
    colors: {
      background: '#059669',
      text: '#ffffff'
    }
  },
  {
    name: 'Violet',
    colors: {
      background: '#7c3aed',
      text: '#ffffff'
    }
  },
  {
    name: 'Rose',
    colors: {
      background: '#ec4899',
      text: '#ffffff'
    }
  },
  {
    name: 'Sombre',
    colors: {
      background: '#1f2937',
      text: '#ffffff'
    }
  },
  {
    name: 'Clair',
    colors: {
      background: '#f3f4f6',
      text: '#1f2937'
    }
  },
  {
    name: 'Gradient Bleu',
    colors: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff'
    }
  },
  {
    name: 'Gradient Rose',
    colors: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      text: '#ffffff'
    }
  },
  {
    name: 'Gradient Vert',
    colors: {
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      text: '#ffffff'
    }
  }
];

export const GlobalStyleEditor: React.FC<GlobalStyleEditorProps> = ({ isOpen, onClose }) => {
  const { cards, updateCard } = useStore();
  const [activeTab, setActiveTab] = useState<'colors' | 'typography'>('colors');
  
  // États pour les couleurs
  const [globalBackgroundColor, setGlobalBackgroundColor] = useState('#6366f1');
  const [globalTextColor, setGlobalTextColor] = useState('#ffffff');
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  
  // États pour la typographie
  const [globalTypography, setGlobalTypography] = useState({
    fontFamily: 'inter' as FontFamily,
    titleWeight: '700' as FontWeight,
    descriptionWeight: '400' as FontWeight,
    textAlign: 'left' as TextAlign,
    titleSize: 'lg' as const,
    descriptionSize: 'sm' as const
  });

  const [isApplying, setIsApplying] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Appliquer les couleurs à toutes les cartes
  const applyGlobalColors = async () => {
    setIsApplying(true);
    
    try {
      // Appliquer à toutes les cartes (sauf les cartes profil)
      const updatePromises = cards
        .filter(card => !card.isProfileCard) // Exclure les cartes profil
        .map(card => 
          updateCard(card.id, {
            backgroundColor: globalBackgroundColor,
            textColor: globalTextColor
          })
        );
      
      await Promise.all(updatePromises);
      
      console.log(`✅ Couleurs appliquées à ${updatePromises.length} cartes`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'application des couleurs:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Appliquer la typographie à toutes les cartes
  const applyGlobalTypography = async () => {
    setIsApplying(true);
    
    try {
      // Appliquer à toutes les cartes (sauf les cartes profil)
      const updatePromises = cards
        .filter(card => !card.isProfileCard) // Exclure les cartes profil
        .map(card => 
          updateCard(card.id, {
            typography: {
              ...globalTypography
            }
          })
        );
      
      await Promise.all(updatePromises);
      
      console.log(`✅ Typographie appliquée à ${updatePromises.length} cartes`);
    } catch (error) {
      console.error('❌ Erreur lors de l\'application de la typographie:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Appliquer une palette de couleurs
  const applyColorPalette = async (palette: typeof colorPalettes[0]) => {
    setGlobalBackgroundColor(palette.colors.background);
    setGlobalTextColor(palette.colors.text);
    
    if (previewMode) {
      await applyGlobalColors();
    }
  };

  // Générer des couleurs aléatoires
  const generateRandomColors = () => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
      '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
      '#1e40af', '#7c3aed', '#be185d', '#dc2626', '#ea580c'
    ];
    
    const randomBg = colors[Math.floor(Math.random() * colors.length)];
    const randomText = Math.random() > 0.5 ? '#ffffff' : '#000000';
    
    setGlobalBackgroundColor(randomBg);
    setGlobalTextColor(randomText);
    
    if (previewMode) {
      applyGlobalColors();
    }
  };

  // Appliquer tout (couleurs + typographie)
  const applyAll = async () => {
    setIsApplying(true);
    
    try {
      const updatePromises = cards
        .filter(card => !card.isProfileCard)
        .map(card => 
          updateCard(card.id, {
            backgroundColor: globalBackgroundColor,
            textColor: globalTextColor,
            typography: {
              ...globalTypography
            }
          })
        );
      
      await Promise.all(updatePromises);
      
      console.log(`✅ Styles globaux appliqués à ${updatePromises.length} cartes`);
      onClose();
    } catch (error) {
      console.error('❌ Erreur lors de l\'application des styles:', error);
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  const eligibleCards = cards.filter(card => !card.isProfileCard);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Wand2 size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Styles Globaux
              </h2>
              <p className="text-gray-400">
                Changez la couleur et la police de tous vos blocs en même temps
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                previewMode
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/10 text-gray-400 hover:text-white border border-white/20'
              }`}
              title="Mode aperçu en temps réel"
            >
              {previewMode ? <Eye size={16} /> : <EyeOff size={16} />}
              Aperçu
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Sparkles size={20} className="text-purple-400" />
            <div>
              <p className="text-white font-medium">
                {eligibleCards.length} carte{eligibleCards.length > 1 ? 's' : ''} sera{eligibleCards.length > 1 ? 'nt' : ''} modifiée{eligibleCards.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400">
                Les cartes profil sont exclues pour préserver leur identité visuelle
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 bg-white/5">
          {[
            { id: 'colors', label: 'Couleurs', icon: Palette },
            { id: 'typography', label: 'Typographie', icon: Type }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'colors' && (
              <motion.div
                key="colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Palettes prédéfinies */}
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette size={18} />
                    Palettes de couleurs
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {colorPalettes.map((palette, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => applyColorPalette(palette)}
                        className="group relative p-3 rounded-lg border border-white/20 hover:border-white/40 transition-all"
                        style={{ 
                          background: palette.colors.background.includes('gradient') 
                            ? palette.colors.background 
                            : palette.colors.background 
                        }}
                      >
                        <div className="text-center">
                          <div 
                            className="w-8 h-8 mx-auto mb-2 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: palette.colors.text }}
                          />
                          <span 
                            className="text-xs font-medium"
                            style={{ color: palette.colors.text }}
                          >
                            {palette.name}
                          </span>
                        </div>
                        
                        {/* Effet de sélection */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 bg-white/20 rounded-lg flex items-center justify-center"
                        >
                          <Check size={16} className="text-white" />
                        </motion.div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Couleurs personnalisées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Couleur de fond */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Couleur de fond
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                          className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg"
                          style={{ backgroundColor: globalBackgroundColor }}
                        />
                        <input
                          type="text"
                          value={globalBackgroundColor}
                          onChange={(e) => setGlobalBackgroundColor(e.target.value)}
                          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white font-mono"
                        />
                      </div>
                      
                      {showBgColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <HexColorPicker 
                            color={globalBackgroundColor} 
                            onChange={(color) => {
                              setGlobalBackgroundColor(color);
                              if (previewMode) applyGlobalColors();
                            }} 
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Couleur du texte */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">
                      Couleur du texte
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                          className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg"
                          style={{ backgroundColor: globalTextColor }}
                        />
                        <input
                          type="text"
                          value={globalTextColor}
                          onChange={(e) => setGlobalTextColor(e.target.value)}
                          className="flex-1 p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white font-mono"
                        />
                      </div>
                      
                      {showTextColorPicker && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <HexColorPicker 
                            color={globalTextColor} 
                            onChange={(color) => {
                              setGlobalTextColor(color);
                              if (previewMode) applyGlobalColors();
                            }} 
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions couleurs */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateRandomColors}
                    className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg text-orange-400 hover:from-orange-500/30 hover:to-red-500/30 transition-all"
                  >
                    <RefreshCw size={16} />
                    Couleurs aléatoires
                  </motion.button>
                  
                  {!previewMode && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyGlobalColors}
                      disabled={isApplying}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                    >
                      {isApplying ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Palette size={16} />
                      )}
                      Appliquer les couleurs
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'typography' && (
              <motion.div
                key="typography"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Police de caractères */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Police de caractères
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {fontFamilyOptions.map((font) => (
                      <label key={font.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="fontFamily"
                          value={font.value}
                          checked={globalTypography.fontFamily === font.value}
                          onChange={(e) => {
                            const newTypography = { ...globalTypography, fontFamily: e.target.value as FontFamily };
                            setGlobalTypography(newTypography);
                            if (previewMode) applyGlobalTypography();
                          }}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-lg border transition-all ${
                          globalTypography.fontFamily === font.value
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-white">{font.label}</span>
                            <span className="text-xs text-gray-400">{font.preview}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Alignement du texte */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-white">
                    Alignement du texte
                  </label>
                  <div className="flex gap-2">
                    {textAlignOptions.map((align) => (
                      <label key={align.value} className="cursor-pointer flex-1">
                        <input
                          type="radio"
                          name="textAlign"
                          value={align.value}
                          checked={globalTypography.textAlign === align.value}
                          onChange={(e) => {
                            const newTypography = { ...globalTypography, textAlign: e.target.value as TextAlign };
                            setGlobalTypography(newTypography);
                            if (previewMode) applyGlobalTypography();
                          }}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                          globalTypography.textAlign === align.value
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <align.icon size={16} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Poids des polices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Poids du titre
                    </label>
                    <select
                      value={globalTypography.titleWeight}
                      onChange={(e) => {
                        const newTypography = { ...globalTypography, titleWeight: e.target.value as FontWeight };
                        setGlobalTypography(newTypography);
                        if (previewMode) applyGlobalTypography();
                      }}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                    >
                      {fontWeightOptions.map((weight) => (
                        <option key={weight.value} value={weight.value} className="bg-gray-800">
                          {weight.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Poids description
                    </label>
                    <select
                      value={globalTypography.descriptionWeight}
                      onChange={(e) => {
                        const newTypography = { ...globalTypography, descriptionWeight: e.target.value as FontWeight };
                        setGlobalTypography(newTypography);
                        if (previewMode) applyGlobalTypography();
                      }}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                    >
                      {fontWeightOptions.map((weight) => (
                        <option key={weight.value} value={weight.value} className="bg-gray-800">
                          {weight.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tailles des polices */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Taille du titre
                    </label>
                    <select
                      value={globalTypography.titleSize}
                      onChange={(e) => {
                        const newTypography = { ...globalTypography, titleSize: e.target.value as any };
                        setGlobalTypography(newTypography);
                        if (previewMode) applyGlobalTypography();
                      }}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                    >
                      {titleSizeOptions.map((size) => (
                        <option key={size.value} value={size.value} className="bg-gray-800">
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Taille description
                    </label>
                    <select
                      value={globalTypography.descriptionSize}
                      onChange={(e) => {
                        const newTypography = { ...globalTypography, descriptionSize: e.target.value as any };
                        setGlobalTypography(newTypography);
                        if (previewMode) applyGlobalTypography();
                      }}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                    >
                      {descriptionSizeOptions.map((size) => (
                        <option key={size.value} value={size.value} className="bg-gray-800">
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions typographie */}
                {!previewMode && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={applyGlobalTypography}
                      disabled={isApplying}
                      className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-lg text-white font-medium transition-all disabled:opacity-50"
                    >
                      {isApplying ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Type size={16} />
                      )}
                      Appliquer la typographie
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Annuler
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={applyAll}
              disabled={isApplying}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-lg text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Application...
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  Appliquer tout
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
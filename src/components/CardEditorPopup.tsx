import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { HexColorPicker } from 'react-colorful';
import { useStore } from '../store/useStore';
import { BentoCard, GridSize, FontFamily, FontWeight, TextAlign, Typography, AppleMusicData, CalendlyData, InternalLayout } from '../types';
import { Save, Trash2, Eye, EyeOff, Palette, Image, Upload, Type, AlignLeft, AlignCenter, AlignRight, X, Video, Play, Music, Grid, Calendar, Mail, MessageSquare } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { VideoUploader } from './VideoUploader';
import { AppleMusicSearch } from './AppleMusicSearch';
import { CalendlyIntegration } from './CalendlyIntegration';
import { InternalLayoutEditor } from './InternalLayoutEditor';
import { ContactFormWidget } from './ContactFormWidget';
import * as Icons from 'lucide-react';

interface CardEditorPopupProps {
  cardId: string;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  url: string;
  size: GridSize;
  icon: string;
  backgroundImage: string;
  backgroundVideo: string;
  videoSettings: {
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    controls: boolean;
    overlay: boolean;
  };
  appleMusicData?: AppleMusicData;
  calendlyData?: CalendlyData;
  contactFormData?: {
    type: 'contact' | 'newsletter';
    buttonText?: string;
    placeholderText?: string;
    successMessage?: string;
  };
  typography: Typography;
  internalLayout: InternalLayout;
}

// Helper function to convert icon names to PascalCase
const toPascalCase = (str: string): string => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export const CardEditorPopup: React.FC<CardEditorPopupProps> = ({ cardId, onClose }) => {
  const { cards, updateCard, deleteCard } = useStore();
  const card = cards.find(c => c.id === cardId);
  const [showBgColorPicker, setShowBgColorPicker] = React.useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState(card?.backgroundColor || '#6366f1');
  const [textColor, setTextColor] = React.useState(card?.textColor || '#ffffff');
  const [backgroundType, setBackgroundType] = React.useState<'color' | 'image' | 'video' | 'music' | 'calendly' | 'contact'>('color');
  const [activeTab, setActiveTab] = React.useState<'content' | 'style' | 'background' | 'layout'>('content');
  const [contactFormType, setContactFormType] = React.useState<'contact' | 'newsletter'>('contact');

  // Typographie par défaut
  const defaultTypography: Typography = {
    fontFamily: 'inter',
    titleWeight: '700',
    descriptionWeight: '400',
    textAlign: 'left',
    titleSize: 'lg',
    descriptionSize: 'sm'
  };

  // Paramètres vidéo par défaut
  const defaultVideoSettings = {
    autoplay: true,
    muted: true,
    loop: true,
    controls: false,
    overlay: true
  };

  // Layout interne par défaut
  const defaultInternalLayout: InternalLayout = {
    enabled: false,
    elements: [],
    showGrid: false
  };

  const { register, handleSubmit, watch, reset, setValue } = useForm<FormData>({
    defaultValues: {
      title: card?.title || '',
      description: card?.description || '',
      url: card?.url || '',
      size: card?.size || '1x1',
      icon: card?.icon || '',
      backgroundImage: card?.backgroundImage || '',
      backgroundVideo: card?.backgroundVideo || '',
      videoSettings: { ...defaultVideoSettings, ...card?.videoSettings },
      appleMusicData: card?.appleMusicData,
      calendlyData: card?.calendlyData,
      contactFormData: card?.contactFormData || {
        type: 'contact',
        buttonText: '',
        placeholderText: '',
        successMessage: ''
      },
      typography: { ...defaultTypography, ...card?.typography },
      internalLayout: { ...defaultInternalLayout, ...card?.internalLayout }
    }
  });

  React.useEffect(() => {
    if (card) {
      reset({
        title: card.title,
        description: card.description,
        url: card.url,
        size: card.size,
        icon: card.icon || '',
        backgroundImage: card.backgroundImage || '',
        backgroundVideo: card.backgroundVideo || '',
        videoSettings: { ...defaultVideoSettings, ...card.videoSettings },
        appleMusicData: card.appleMusicData,
        calendlyData: card.calendlyData,
        contactFormData: card.contactFormData || {
          type: 'contact',
          buttonText: '',
          placeholderText: '',
          successMessage: ''
        },
        typography: { ...defaultTypography, ...card.typography },
        internalLayout: { ...defaultInternalLayout, ...card.internalLayout }
      });
      setBackgroundColor(card.backgroundColor);
      setTextColor(card.textColor);
      
      // Déterminer le type de fond
      if (card.contactFormData) {
        setBackgroundType('contact');
        setContactFormType(card.contactFormData.type);
      } else if (card.calendlyData) {
        setBackgroundType('calendly');
      } else if (card.appleMusicData) {
        setBackgroundType('music');
      } else if (card.backgroundVideo) {
        setBackgroundType('video');
      } else if (card.backgroundImage) {
        setBackgroundType('image');
      } else {
        setBackgroundType('color');
      }
    }
  }, [card, reset]);

  if (!card) return null;

  const onSubmit = (data: FormData) => {
    updateCard(cardId, {
      ...data,
      backgroundColor,
      textColor,
      icon: data.icon === 'none' ? undefined : data.icon,
      // Nettoyer les fonds selon le type sélectionné
      backgroundImage: backgroundType === 'image' ? data.backgroundImage : undefined,
      backgroundVideo: backgroundType === 'video' ? data.backgroundVideo : undefined,
      appleMusicData: backgroundType === 'music' ? data.appleMusicData : undefined,
      calendlyData: backgroundType === 'calendly' ? data.calendlyData : undefined,
      contactFormData: backgroundType === 'contact' ? {
        ...data.contactFormData,
        type: contactFormType
      } : undefined,
    });
    
    // Fermer l'éditeur
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      deleteCard(cardId);
      onClose();
    }
  };

  const handleAppleMusicSelect = (musicData: AppleMusicData) => {
    setValue('appleMusicData', musicData);
    
    // Auto-remplir les champs si vides
    const currentTitle = watch('title');
    const currentDescription = watch('description');
    
    if (!currentTitle || currentTitle === 'Nouvelle Carte') {
      setValue('title', musicData.name);
    }
    
    if (!currentDescription || currentDescription === 'Cliquez pour éditer cette carte') {
      const description = musicData.artistName 
        ? `${musicData.artistName}${musicData.albumName ? ` • ${musicData.albumName}` : ''}`
        : 'Découvrez cette musique sur Apple Music';
      setValue('description', description);
    }
    
    if (!watch('url')) {
      setValue('url', musicData.appleMusicUrl || '');
    }
  };

  const handleCalendlySelect = (calendlyData: CalendlyData) => {
    setValue('calendlyData', calendlyData);
    
    // Auto-remplir les champs si vides
    const currentTitle = watch('title');
    const currentDescription = watch('description');
    
    if (!currentTitle || currentTitle === 'Nouvelle Carte') {
      const meetingName = calendlyData.url.split('/').pop()?.replace(/-/g, ' ') || 'Rendez-vous';
      setValue('title', `Prendre rendez-vous - ${meetingName}`);
    }
    
    if (!currentDescription || currentDescription === 'Cliquez pour éditer cette carte') {
      setValue('description', 'Réservez facilement un créneau qui vous convient');
    }
    
    if (!watch('url')) {
      setValue('url', calendlyData.url);
    }
  };

  const handleContactFormChange = (type: 'contact' | 'newsletter') => {
    setContactFormType(type);
    
    // Auto-remplir les champs si vides
    const currentTitle = watch('title');
    const currentDescription = watch('description');
    
    if (!currentTitle || currentTitle === 'Nouvelle Carte') {
      setValue('title', type === 'contact' ? 'Contactez-nous' : 'Newsletter');
    }
    
    if (!currentDescription || currentDescription === 'Cliquez pour éditer cette carte') {
      setValue('description', type === 'contact' 
        ? 'Envoyez-nous un message et nous vous répondrons rapidement' 
        : 'Inscrivez-vous pour recevoir nos dernières actualités'
      );
    }
    
    setValue('contactFormData', {
      type,
      buttonText: type === 'contact' ? 'Envoyer' : 'S\'inscrire',
      placeholderText: type === 'contact' ? 'Votre message...' : 'Votre email...',
      successMessage: type === 'contact' 
        ? 'Message envoyé avec succès ! Nous vous répondrons bientôt.' 
        : 'Merci pour votre inscription !'
    });
  };

  const handleInternalLayoutChange = (layout: InternalLayout) => {
    setValue('internalLayout', layout);
  };

  const handleTypeChange = (type: 'color' | 'image' | 'video' | 'music' | 'calendly' | 'contact') => {
    setBackgroundType(type);
    
    // Si on change pour Calendly et qu'il n'y a pas encore de données Calendly
    if (type === 'calendly' && !watch('calendlyData')) {
      setValue('calendlyData', {
        url: '',
        displayMode: 'popup'
      });
    }
    
    // Si on change pour Contact Form et qu'il n'y a pas encore de données de formulaire
    if (type === 'contact' && !watch('contactFormData')) {
      setValue('contactFormData', {
        type: contactFormType,
        buttonText: contactFormType === 'contact' ? 'Envoyer' : 'S\'inscrire',
        placeholderText: contactFormType === 'contact' ? 'Votre message...' : 'Votre email...',
        successMessage: contactFormType === 'contact' 
          ? 'Message envoyé avec succès ! Nous vous répondrons bientôt.' 
          : 'Merci pour votre inscription !'
      });
    }
  };

  const colorPresets = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
  ];

  const iconOptions = [
    'none', // Option pour pas d'icône
    'square', 'circle', 'heart', 'star', 'bookmark', 'tag',
    'home', 'user', 'settings', 'mail', 'phone', 'map-pin',
    'briefcase', 'book', 'music', 'camera', 'video', 'image',
    'github', 'twitter', 'linkedin', 'instagram', 'facebook', 'youtube',
    'coffee', 'utensils', 'wine', 'chef-hat', 'cake', 'calendar'
  ];

  // Tailles adaptées à la grille 12×4
  const sizeOptions: { value: GridSize; label: string; preview: string; cols: number; rows: number }[] = [
    // 1 ligne
    { value: '1x1', label: 'Petit', preview: 'w-2 h-2', cols: 1, rows: 1 },
    { value: '2x1', label: 'Large', preview: 'w-4 h-2', cols: 2, rows: 1 },
    { value: '3x1', label: 'Extra Large', preview: 'w-6 h-2', cols: 3, rows: 1 },
    { value: '4x1', label: 'Très Large', preview: 'w-8 h-2', cols: 4, rows: 1 },
    
    // 2 lignes
    { value: '1x2', label: 'Haut', preview: 'w-2 h-4', cols: 1, rows: 2 },
    { value: '2x2', label: 'Carré', preview: 'w-4 h-4', cols: 2, rows: 2 },
    { value: '3x2', label: 'Grande Carte', preview: 'w-6 h-4', cols: 3, rows: 2 },
    { value: '4x2', label: 'Bannière', preview: 'w-8 h-4', cols: 4, rows: 2 },
    
    // 3 lignes
    { value: '2x3', label: 'Portrait', preview: 'w-4 h-6', cols: 2, rows: 3 },
    { value: '3x3', label: 'Grand Carré', preview: 'w-6 h-6', cols: 3, rows: 3 },
    { value: '4x3', label: 'Grande Bannière', preview: 'w-8 h-6', cols: 4, rows: 3 },
  ];

  // Options de typographie
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

  const textAlignOptions: { value: TextAlign; label: string; icon: React.ComponentType<{ size?: string | number; className?: string }> }[] = [
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

  const selectedIcon = watch('icon');
  const selectedBackgroundImage = watch('backgroundImage');
  const selectedBackgroundVideo = watch('backgroundVideo');
  const selectedVideoSettings = watch('videoSettings');
  const selectedAppleMusicData = watch('appleMusicData');
  const selectedCalendlyData = watch('calendlyData');
  const selectedContactFormData = watch('contactFormData');
  const selectedTypography = watch('typography');
  const selectedInternalLayout = watch('internalLayout');
  
  const getIconComponent = (iconName: string) => {
    if (iconName === 'none') return null;
    const pascalCaseIcon = toPascalCase(iconName);
    const IconComponent = Icons[pascalCaseIcon as keyof typeof Icons];
    return IconComponent || Icons.Square;
  };

  const IconComponent = getIconComponent(selectedIcon) as React.ComponentType<{ size?: number }> | null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
              <Type size={24} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Modifier la Carte
              </h2>
              <p className="text-gray-400">
                Personnalisez le contenu et l'apparence de votre carte
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
              title="Supprimer cette carte"
            >
              <Trash2 size={20} />
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

        {/* Tabs */}
        <div className="flex gap-1 p-4 bg-white/5">
          {[
            { id: 'content', label: 'Contenu', icon: Type },
            { id: 'style', label: 'Style', icon: Palette },
            { id: 'background', label: 'Arrière-plan', icon: Image },
            { id: 'layout', label: 'Layout', icon: Grid }
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
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Titre</label>
                <input
                  {...register('title', { required: true })}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                  placeholder="Titre de la carte"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Description</label>
                <textarea
                  {...register('description')}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors resize-none text-white"
                  rows={3}
                  placeholder="Description de la carte"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">URL</label>
                <input
                  {...register('url')}
                  type="url"
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                  placeholder="https://example.com"
                />
              </div>

              {/* Size - Grille 12×4 */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Taille</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {sizeOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        {...register('size')}
                        type="radio"
                        value={option.value}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-lg border-2 transition-all ${
                        watch('size') === option.value
                          ? 'border-indigo-400 bg-indigo-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{option.label}</span>
                          <div className={`bg-white/30 rounded ${option.preview}`} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>{option.value}</span>
                          <span>{option.cols}×{option.rows}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Icône</label>
                <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                  {iconOptions.map((icon) => {
                    if (icon === 'none') {
                      return (
                        <label key={icon} className="cursor-pointer">
                          <input
                            {...register('icon')}
                            type="radio"
                            value={icon}
                            className="sr-only"
                          />
                          <div className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
                            selectedIcon === icon
                              ? 'border-indigo-400 bg-indigo-500/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}>
                            <div className="relative">
                              <X size={20} className="text-gray-400" />
                              <span className="absolute -bottom-1 -right-1 text-xs text-gray-500">∅</span>
                            </div>
                          </div>
                        </label>
                      );
                    }
                    
                    const Icon = getIconComponent(icon) as React.ComponentType<{ size?: number; className?: string }>;
                    return (
                      <label key={icon} className="cursor-pointer">
                        <input
                          {...register('icon')}
                          type="radio"
                          value={icon}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-lg border transition-all ${
                          selectedIcon === icon
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <Icon size={20} className="text-white" />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'style' && (
            <div className="space-y-6">
              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Couleur du Texte</label>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="w-8 h-8 rounded-lg border-2 border-white/20"
                    style={{ backgroundColor: textColor }}
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white font-mono text-sm"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setTextColor('#ffffff')}
                      className="w-6 h-6 rounded border border-white/20 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setTextColor('#000000')}
                      className="w-6 h-6 rounded border border-white/20 bg-black"
                    />
                  </div>
                </div>

                {showTextColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <HexColorPicker color={textColor} onChange={setTextColor} />
                  </motion.div>
                )}
              </div>

              {/* Typography Section */}
              <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Type size={18} className="text-indigo-400" />
                  <h4 className="font-medium text-white">Typographie</h4>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Police de caractères</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {fontFamilyOptions.map((font) => (
                      <label key={font.value} className="cursor-pointer">
                        <input
                          {...register('typography.fontFamily')}
                          type="radio"
                          value={font.value}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-lg border transition-all ${
                          selectedTypography.fontFamily === font.value
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

                {/* Text Alignment */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Alignement du texte</label>
                  <div className="flex gap-2">
                    {textAlignOptions.map((align) => (
                      <label key={align.value} className="cursor-pointer flex-1">
                        <input
                          {...register('typography.textAlign')}
                          type="radio"
                          value={align.value}
                          className="sr-only"
                        />
                        <div className={`p-3 rounded-lg border transition-all flex items-center justify-center ${
                          selectedTypography.textAlign === align.value
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}>
                          <align.icon size={16} className="text-white" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Font Weights */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Poids du titre</label>
                    <select
                      {...register('typography.titleWeight')}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white"
                    >
                      {fontWeightOptions.map((weight) => (
                        <option key={weight.value} value={weight.value} className="bg-gray-800">
                          {weight.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Poids description</label>
                    <select
                      {...register('typography.descriptionWeight')}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white"
                    >
                      {fontWeightOptions.map((weight) => (
                        <option key={weight.value} value={weight.value} className="bg-gray-800">
                          {weight.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Font Sizes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Taille du titre</label>
                    <select
                      {...register('typography.titleSize')}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white"
                    >
                      {titleSizeOptions.map((size) => (
                        <option key={size.value} value={size.value} className="bg-gray-800">
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">Taille description</label>
                    <select
                      {...register('typography.descriptionSize')}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm text-white"
                    >
                      {descriptionSizeOptions.map((size) => (
                        <option key={size.value} value={size.value} className="bg-gray-800">
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'background' && (
            <div className="space-y-6">
              {/* Background Type Selector */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-lg overflow-x-auto">
                {[
                  { type: 'color', label: 'Couleur', icon: Palette },
                  { type: 'image', label: 'Image', icon: Image },
                  { type: 'video', label: 'Vidéo', icon: Video },
                  { type: 'music', label: 'Musique', icon: Music },
                  { type: 'calendly', label: 'Calendly', icon: Calendar },
                  { type: 'contact', label: 'Formulaire', icon: MessageSquare }
                ].map(({ type, label, icon: Icon }) => (
                  <motion.button
                    key={type}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTypeChange(type as any)}
                    className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md text-sm font-medium transition-all ${
                      backgroundType === type
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon size={16} className="text-white" />
                    {label}
                  </motion.button>
                ))}
              </div>

              {/* Background Content */}
              {backgroundType === 'color' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">Couleur de Fond</label>
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                      className="w-8 h-8 rounded-lg border-2 border-white/20"
                      style={{ backgroundColor }}
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-sm font-mono text-white"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBackgroundColor(color)}
                        className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>

                  {showBgColorPicker && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-4"
                    >
                      <HexColorPicker color={backgroundColor} onChange={setBackgroundColor} />
                    </motion.div>
                  )}
                </div>
              )}

              {backgroundType === 'image' && (
                <ImageUploader
                  currentImage={selectedBackgroundImage}
                  onImageChange={(imageUrl) => setValue('backgroundImage', imageUrl)}
                  onImageRemove={() => setValue('backgroundImage', '')}
                />
              )}

              {backgroundType === 'video' && (
                <div className="space-y-4">
                  <VideoUploader
                    currentVideo={selectedBackgroundVideo}
                    videoSettings={selectedVideoSettings}
                    onVideoChange={(videoUrl) => setValue('backgroundVideo', videoUrl)}
                    onVideoRemove={() => setValue('backgroundVideo', '')}
                    onSettingsChange={(settings) => setValue('videoSettings', settings)}
                  />
                </div>
              )}

              {backgroundType === 'music' && (
                <AppleMusicSearch
                  currentSelection={selectedAppleMusicData}
                  onSelect={handleAppleMusicSelect}
                />
              )}

              {backgroundType === 'calendly' && (
                <CalendlyIntegration
                  currentSelection={selectedCalendlyData}
                  onSelect={handleCalendlySelect}
                />
              )}

              {backgroundType === 'contact' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-white">Type de formulaire</label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactFormChange('contact')}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          contactFormType === 'contact'
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            contactFormType === 'contact' ? 'bg-indigo-500/20' : 'bg-white/10'
                          }`}>
                            <MessageSquare size={18} className={contactFormType === 'contact' ? 'text-indigo-400' : 'text-gray-400'} />
                          </div>
                          <div className="font-medium text-white">Formulaire de contact</div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Nom, email et message pour contacter directement
                        </p>
                      </motion.button>

                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleContactFormChange('newsletter')}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          contactFormType === 'newsletter'
                            ? 'border-indigo-400 bg-indigo-500/20'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-lg ${
                            contactFormType === 'newsletter' ? 'bg-indigo-500/20' : 'bg-white/10'
                          }`}>
                            <Mail size={18} className={contactFormType === 'newsletter' ? 'text-indigo-400' : 'text-gray-400'} />
                          </div>
                          <div className="font-medium text-white">Inscription newsletter</div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Simple champ email pour collecter des abonnés
                        </p>
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="font-medium text-white mb-3">Personnalisation du formulaire</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={selectedContactFormData?.buttonText || ''}
                        onChange={(e) => setValue('contactFormData.buttonText', e.target.value)}
                        placeholder={contactFormType === 'contact' ? 'Envoyer' : 'S\'inscrire'}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Texte du placeholder
                      </label>
                      <input
                        type="text"
                        value={selectedContactFormData?.placeholderText || ''}
                        onChange={(e) => setValue('contactFormData.placeholderText', e.target.value)}
                        placeholder={contactFormType === 'contact' ? 'Votre message...' : 'Votre email...'}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">
                        Message de succès
                      </label>
                      <input
                        type="text"
                        value={selectedContactFormData?.successMessage || ''}
                        onChange={(e) => setValue('contactFormData.successMessage', e.target.value)}
                        placeholder={contactFormType === 'contact' 
                          ? 'Message envoyé avec succès ! Nous vous répondrons bientôt.' 
                          : 'Merci pour votre inscription !'}
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:border-white/40 focus:outline-none transition-colors text-white"
                      />
                    </div>
                  </div>

                  {/* Aperçu du formulaire */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h3 className="font-medium text-white mb-3">Aperçu</h3>
                    <ContactFormWidget 
                      type={contactFormType}
                      buttonText={selectedContactFormData?.buttonText}
                      placeholderText={selectedContactFormData?.placeholderText}
                      successMessage={selectedContactFormData?.successMessage}
                      accentColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'layout' && (
            <InternalLayoutEditor
              layout={selectedInternalLayout}
              onLayoutChange={handleInternalLayoutChange}
            />
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-white/5">
          <div className="flex gap-3">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Annuler
            </motion.button>
            
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit(onSubmit)}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-medium transition-all text-white"
            >
              <Save size={18} />
              Sauvegarder
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
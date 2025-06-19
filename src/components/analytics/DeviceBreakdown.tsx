import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { analyticsService } from '../../services/analyticsService';
import { Smartphone, Tablet, Monitor, Info } from 'lucide-react';

interface DeviceBreakdownProps {
  className?: string;
}

interface DeviceData {
  type: 'mobile' | 'tablet' | 'desktop';
  count: number;
  percentage: number;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  color: string;
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({ 
  className = '' 
}) => {
  const { userPlan } = useStore();
  const [deviceData, setDeviceData] = useState<DeviceData[]>([
    { 
      type: 'mobile', 
      count: 450, 
      percentage: 45, 
      icon: Smartphone,
      color: '#10b981' // green
    },
    { 
      type: 'tablet', 
      count: 150, 
      percentage: 15, 
      icon: Tablet,
      color: '#3b82f6' // blue
    },
    { 
      type: 'desktop', 
      count: 400, 
      percentage: 40, 
      icon: Monitor,
      color: '#8b5cf6' // purple
    }
  ]);
  
  const [showInfo, setShowInfo] = useState(false);
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Smartphone size={20} className="text-green-400" />
          Répartition par appareil
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Info size={16} className="text-gray-400" />
        </motion.button>
      </div>
      
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <p className="text-sm text-gray-300">
              Cette visualisation montre la répartition des visites par type d'appareil. 
              Utilisez ces informations pour optimiser votre design et votre contenu pour 
              les appareils les plus utilisés par votre audience.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {deviceData.map((device) => {
          const DeviceIcon = device.icon;
          
          return (
            <motion.div
              key={device.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: deviceData.indexOf(device) * 0.1 }}
              className="bg-gray-900/50 rounded-xl border border-white/10 p-4 flex flex-col items-center"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${device.color}20`, color: device.color }}
              >
                <DeviceIcon size={32} />
              </div>
              
              <div className="text-2xl font-bold text-white">
                {device.percentage}%
              </div>
              
              <div className="text-sm text-gray-400 capitalize">
                {device.type}
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                {device.count.toLocaleString()} visites
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Horizontal bar chart */}
      <div className="bg-gray-900/50 rounded-xl border border-white/10 p-4">
        <div className="h-8 relative mb-2">
          {deviceData.map((device, index) => {
            // Calculate starting position
            const prevPercentages = deviceData
              .slice(0, index)
              .reduce((sum, d) => sum + d.percentage, 0);
            
            return (
              <motion.div
                key={device.type}
                initial={{ width: 0 }}
                animate={{ width: `${device.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                className="absolute top-0 bottom-0 rounded-r-lg"
                style={{ 
                  left: `${prevPercentages}%`,
                  backgroundColor: device.color
                }}
              >
                {device.percentage >= 10 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                    {device.percentage}%
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <div>0%</div>
          <div>50%</div>
          <div>100%</div>
        </div>
      </div>
      
      {/* Insights */}
      <div className="p-4 bg-gray-900/50 rounded-xl border border-white/10">
        <h4 className="font-medium text-white mb-2">Insights</h4>
        <p className="text-sm text-gray-300">
          {deviceData[0].type === 'mobile' && deviceData[0].percentage > 40 ? (
            <>
              <span className="text-green-400 font-medium">{deviceData[0].percentage}%</span> de vos visiteurs utilisent un appareil mobile. 
              Assurez-vous que votre design est optimisé pour les petits écrans.
            </>
          ) : deviceData[2].type === 'desktop' && deviceData[2].percentage > 40 ? (
            <>
              <span className="text-purple-400 font-medium">{deviceData[2].percentage}%</span> de vos visiteurs utilisent un ordinateur de bureau. 
              Vous pouvez proposer des fonctionnalités plus avancées pour ces utilisateurs.
            </>
          ) : (
            <>
              Votre audience est bien répartie entre différents types d'appareils. 
              Continuez à maintenir une expérience cohérente sur toutes les plateformes.
            </>
          )}
        </p>
      </div>
    </div>
  );
};
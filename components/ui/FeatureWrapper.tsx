import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { showToast } from '../../utils/toast';

interface FeatureWrapperProps extends TouchableOpacityProps {
  featureName?: string;
  children: React.ReactNode;
}

/**
 * A wrapper component for features that are currently under development.
 * Shows a professional 'Under Development' toast message when clicked.
 */
export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  featureName = 'This feature',
  children,
  onPress,
  ...props
}) => {
  const handlePress = (e: any) => {
    showToast.info(
      'Coming Soon',
      `${featureName} is currently under development and will be available in a future update.`
    );
    if (onPress) onPress(e);
  };

  return (
    <TouchableOpacity {...props} onPress={handlePress} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

export const handleUnderDevelopment = (featureName: string = 'This feature') => {
  showToast.info(
    'Coming Soon',
    `${featureName} is currently under development and will be available in a future update.`
  );
};

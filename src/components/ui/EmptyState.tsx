import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Typography } from './Typography';
import { useDeviceDimensions } from '../../hooks/useDeviceDimensions';
import { getResponsiveFontSize } from '../../utils/responsive';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.memo<EmptyStateProps>(({
  icon,
  title,
  description,
  action,
}) => {
  const device = useDeviceDimensions();
  const iconSize = getResponsiveFontSize(device, 80);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EmptyState.tsx:22',message:'Initializing Animated.Value during render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EmptyState.tsx:26',message:'Starting animations in useEffect',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'EmptyState.tsx:42',message:'Using animated values in style during render',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  return (
    <Animated.View 
      className="py-16 px-6 items-center justify-center flex-1"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
    >
      {icon && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Typography 
            variant="h1" 
            color="textTertiary" 
            className="mb-4"
            style={{ fontSize: iconSize }}
            accessibilityRole="image"
            accessibilityLabel={icon}
          >
            {icon}
          </Typography>
        </Animated.View>
      )}
      <Typography 
        variant="h3" 
        color="textSecondary" 
        align="center" 
        className="mb-2"
        accessibilityRole="header"
      >
        {title}
      </Typography>
      {description && (
        <Typography 
          variant="body2" 
          color="textTertiary" 
          align="center" 
          className="mt-1 max-w-[280px]"
        >
          {description}
        </Typography>
      )}
      {action && <View className="mt-6">{action}</View>}
    </Animated.View>
  );
});

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View } from 'react-native';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { SPACING } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 에러를 캐치하고 처리
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center p-6 bg-slate-50">
          <Card variant="elevated" padding="xl" className="max-w-md">
            <Typography variant="h2" color="danger" className="mb-4" align="center">
              오류가 발생했습니다
            </Typography>
            <Typography variant="body" color="textSecondary" className="mb-6" align="center">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </Typography>
            <Button variant="primary" onPress={this.handleReset}>
              다시 시도
            </Button>
          </Card>
        </View>
      );
    }

    return this.props.children;
  }
}


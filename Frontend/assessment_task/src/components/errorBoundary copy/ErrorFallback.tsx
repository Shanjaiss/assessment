import { Result, Button } from 'antd';
import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <Result
      status='500'
      title='Something went wrong'
      subTitle={
        error instanceof Error ? error.message : 'Unknown error occurred'
      }
      extra={
        <Button type='primary' onClick={resetErrorBoundary}>
          Try Again
        </Button>
      }
    />
  );
};

export default ErrorFallback;

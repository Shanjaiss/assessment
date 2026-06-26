import React from 'react';
import { Spin } from 'antd';

interface SpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'default' | 'large';
  tip?: string;
}

const Loader: React.FC<SpinnerProps> = ({
  fullScreen = false,
  size = 'large',
  tip = 'Loading...',
}) => {
  if (fullScreen) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size={size} tip={tip} />
      </div>
    );
  }

  return <Spin size={size} tip={tip} />;
};

export default Loader;

import { Composition, registerRoot } from 'remotion';
import { Motion1D } from './components/Motion1D';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Motion1D"
        component={Motion1D}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          concept: 'basic',
          title: 'Motion in 1D',
          initialVelocity: 0,
          acceleration: 2,
          showGraph: true,
          motionType: 'linear',
          angle: 45
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);

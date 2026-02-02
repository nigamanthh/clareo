import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderMotion1DVideo(params) {
  const {
    title = 'Motion in 1D',
    initialVelocity = 0,
    acceleration = 2,
    showGraph = true,
    motionType = 'linear',
    angle = 45
  } = params;

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'public', 'videos');
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `motion-${Date.now()}.mp4`);

  try {
    // Bundle the Remotion project
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'remotion', 'index.jsx'),
      webpackOverride: (config) => config,
    });

    // Get composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'Motion1D',
      inputProps: {
        title,
        initialVelocity,
        acceleration,
        showGraph,
        motionType,
        angle
      }
    });

    // Render the video
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        title,
        initialVelocity,
        acceleration,
        showGraph,
        motionType,
        angle
      }
    });

    // Return the relative URL
    return `/videos/${path.basename(outputPath)}`;
  } catch (error) {
    console.error('Video rendering error:', error);
    throw error;
  }
}

import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);

// Sandbox has no access to remotion.media; use the pre-installed Chromium.
Config.setBrowserExecutable('/opt/pw-browsers/chromium-1243/chrome-linux64/chrome');
Config.setChromeMode('chrome-for-testing');
Config.setChromiumOpenGlRenderer('swangle');

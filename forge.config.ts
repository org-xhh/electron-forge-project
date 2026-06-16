import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import dotenv from 'dotenv';

// 加载 .env 环境变量
dotenv.config();

const config: ForgeConfig = {
  packagerConfig: {
    name: 'electron-forge-project',
    icon: './assets/icon', // 应用图标
    asar: true, // 将源码打包成 asar 归档格式
    // 代码签名
  },
  rebuildConfig: {},
  // 制作安装包的工具
  makers: [
    new MakerSquirrel({ // Windows
      setupIcon: './icon.ico', // 生成的 .exe 图标
    }),
    new MakerZIP({}, ['darwin']), // zip，直接解压就可以运行
    new MakerRpm({}), // Red Hat 系列
    new MakerDeb({}), // linux
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'org-xhh',
          name: 'electron-forge-project',
        },
        draft: true, // 首次发布建议为草稿，确认无误后在 GitHub 上手动发布
        prerelease: false,
        generateReleaseNotes: true,
        authToken: process.env.GITHUB_TOKEN,
      },
    },
  ],
};

export default config;

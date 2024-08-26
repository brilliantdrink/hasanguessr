import fs from 'fs'
import path from 'path'
import * as esbuild from 'esbuild'
import {sassPlugin} from 'esbuild-sass-plugin'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import postcssModules from 'postcss-modules'
import {solidPlugin} from 'esbuild-plugin-solid'
import {svgo} from '@hyrious/esbuild-plugin-svgo'
const packageJson = (await import('./package.json', {with: { type: 'json' }})).default

const config = {
  entryPoints: ['src/index.tsx'],
  bundle: true,
  jsx: 'automatic',
  inject: ['./src/images/link_preview.png', './src/images/favicon.webp'],
  define: {
    'VERSION': JSON.stringify(packageJson.version),
  },
  loader: {
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
    '.webp': 'file',
    '.png': 'file',
    '.jpg': 'file',
    '.svg': 'dataurl',
    '.mp3': 'file',
    '.txt': 'file',
  },
  outdir: 'docs',
  minify: process.env.NODE_ENV !== 'watch',
  treeShaking: process.env.NODE_ENV !== 'watch',
  sourcemap: process.env.NODE_ENV === 'watch' ? 'inline' : false,
  plugins: [
    svgo(),
    solidPlugin(),
    sassPlugin({
      filter: /\.module\.scss$/,
      async transform(source, _, from) {
        let cssModule;
        const {css} = (await postcss(autoprefixer, postcssModules({
          getJSON: (_, json) => cssModule = JSON.stringify(json, null, 2)
        })).process(source, {from}))
        return {
          contents: css,
          pluginData: {exports: cssModule},
          loader: 'js'
        }
      },
    }),
    sassPlugin({
      filter: /\.scss$/,
      async transform(source, _, from) {
        return (await postcss(autoprefixer).process(source, {from})).css
      },
    }),
    {
      name: 'html-file',
      setup(build) {
        build.onEnd((result) => {
          const css = fs.readFileSync(path.join(build.initialOptions.outdir, 'index.css'), 'utf8')
          const prevImage = fs.readdirSync(build.initialOptions.outdir).find(filename => filename.startsWith('link_preview'))
          const favicon = fs.readdirSync(build.initialOptions.outdir).find(filename => filename.startsWith('favicon'))
          let html = `\
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="${favicon}" type="image/webp" />
    <title>HasanGuessr</title>
    <meta name="theme-color" content="#EEDFC1"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta property="og:image" content="https://hasanguessr.net/${prevImage}"/>
    <meta property="og:site_name" content="HasanGuessr"/>
    <meta property="og:locale" content="en"/>
    <meta property="og:title" content="HasanGuessr"/>
    <meta name="twitter:title" content="HasanGuessr"/>
    <meta name="description" content="Guess the creation date of HasanAbi clips"/>
    <meta property="og:description" content="Guess the creation date of HasanAbi clips"/>
    <meta name="twitter:description" content="Guess the creation date of HasanAbi clips"/>
    <link rel="canonical" href="https://hasanguessr.net"/>
    <meta property="og:url" content="https://hasanguessr.net"/>
    <script src="/index.js" defer></script>
    <style>${css}</style>
</head>
<body>
    <div id="app">
    </div>
</body>
</html>
`
          fs.writeFileSync(path.join(build.initialOptions.outdir, 'index.html'), html, 'utf8')
        })
      },
    },
  ],
}

if (process.env.NODE_ENV === 'watch')
  await (await esbuild.context(config)).watch({})
else
  await esbuild.build(config)

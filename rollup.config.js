import { terser } from 'rollup-plugin-terser';

export default {
  input: './src/index.js',
  output: [
    { file: './dist/bundle.cjs.js', format: 'cjs' },
    { file: './dist/bundle.cjs.min.js', format: 'cjs' },
    { file: './dist/bundle.esm.js', format: 'es' },
    { file: './dist/bundle.esm.min.js', format: 'es' },
    {
      dir: './dist/', entryFileNames: 'bundle.[format].js', format: 'iife', name: 'LoaderManager',
    },
    {
      dir: './dist/', entryFileNames: 'bundle.[format].min.js', format: 'iife', name: 'LoaderManager',
    },
  ],
  plugins: [
    terser({
      include: [/^.+\.min\.js$/],
      exclude: ['some*'],
    }),
  ],
};

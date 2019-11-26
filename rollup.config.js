import { terser } from "rollup-plugin-terser";
import babel from 'rollup-plugin-babel';

export default {
    input: "./src/index.js",
    output: [
        { dir: './dist', entryFileNames: 'loader-manager.min.js', format: 'umd', name: 'LoaderManager' }
    ],
    plugins: [
        babel({
            exclude: 'node_modules/**',
            babelrc: false,
		    presets: [['@babel/preset-env', { modules: false }]],
        }),
        terser({
            include: [/^.+\.min\.js$/, '*esm*'],
            exclude: ['some*']
        })
    ]
};
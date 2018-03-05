require('shelljs/global');
import vue from 'rollup-plugin-vue2';
import buble from 'rollup-plugin-buble';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import replace from 'rollup-plugin-replace';

rm('-rf', 'dist');
mkdir('-p', 'dist');

var entry = 'src/plugins/index.js';

export default {
    entry: entry,
    dest: 'dist/errorreport.js',
    format: 'cjs',
    sourceMap: true,
    plugins: [
        vue(),
        buble({
            objectAssign: 'Object.assign',
            exclude: 'node_modules/**' // only transpile our source code
        }),
        nodeResolve({
            browser: true,
            jsnext: true,
            main: true,
            // pass custom options to the resolve plugin
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        uglify(),
        replace({
          'process.env.NODE_ENV': JSON.stringify( 'production' )
        })
    ],
    external: ['vue']
}

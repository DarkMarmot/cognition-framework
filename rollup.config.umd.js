import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {

    entry: 'src/machine.js',
    format: 'umd',
    dest: './dist/machine.umd.js', // equivalent to --output
    plugins: [
        resolve(),
        (false && uglify())
    ],
    moduleName: 'Machine',
    sourceMap: true

};
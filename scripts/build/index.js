/**
 * @file This script is needed instead of running tsc-esm manually due to
 *   special aliasing needs. See memo below on react/jsx-runtime.
 *
 *   Also, because we want to use this as an ES module, it is necessary to have a
 *   package.json folder with "type": "module" defined inside of it so Node
 *   knows how to interpret it.
 */

import { compile, patch } from '@digitak/tsc-esm';

compile();
patch([
  // We need to manually patch react/jsx-runtime since only version 17.0.3+ of
  // react has the "exports" field on the package.json defined correctly for
  // tsc-esm to be able to recognize this import and patch it correctly.
  {
    find: /^react\/jsx-runtime$/,
    replacement: 'react/jsx-runtime.js',
  },
]);

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
  // We need to manually patch react/jsx-runtime since tsc-esm doesn't know how
  // to resolve the fields defined by React's package.json's "exports" field.
  //
  // We don't add a .js extension (leave it alone) as the "exports" fields takes
  // care of the aliasing (in versions 17.0.3+).
  {
    find: /^react\/jsx-runtime$/,
    replacement: 'react/jsx-runtime',
  },
]);

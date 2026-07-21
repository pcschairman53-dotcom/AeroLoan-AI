/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { LoanProvider } from './context/LoanContext';

export default function App() {
  return (
    <LoanProvider>
      <RouterProvider router={router} />
    </LoanProvider>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Apply = lazy(() => import('./pages/Apply').then(m => ({ default: m.Apply })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ReviewPanel = lazy(() => import('./pages/ReviewPanel').then(m => ({ default: m.ReviewPanel })));
const ApplicationStatus = lazy(() => import('./pages/ApplicationStatus').then(m => ({ default: m.ApplicationStatus })));
const Prediction = lazy(() => import('./pages/Prediction').then(m => ({ default: m.Prediction })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/apply',
        element: <Apply />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/predict',
        element: <Prediction />,
      },
      {
        path: '/review',
        element: <ReviewPanel />,
      },
      {
        path: '/status',
        element: <ApplicationStatus />,
      },
      {
        path: '/analytics',
        element: <Analytics />,
      }
    ],
  },
]);

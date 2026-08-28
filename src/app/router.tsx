import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import {
  AccessibilityPage,
  CameraPreparationPage,
  ConversationPage,
  HelpPage,
  HistoryPage,
  HomePage,
  NotFoundPage,
  ProfilePage,
  QuickPhrasesPage,
  SignToTextPage,
  TextToSignPage,
  TranslationResultPage,
} from '@/pages'

import { ROUTES } from './routes'

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.cameraPreparation, element: <CameraPreparationPage /> },
      { path: ROUTES.signToText, element: <SignToTextPage /> },
      { path: ROUTES.translationResult, element: <TranslationResultPage /> },
      { path: ROUTES.textToSign, element: <TextToSignPage /> },
      { path: ROUTES.conversation, element: <ConversationPage /> },
      { path: ROUTES.quickPhrases, element: <QuickPhrasesPage /> },
      { path: ROUTES.history, element: <HistoryPage /> },
      { path: ROUTES.profile, element: <ProfilePage /> },
      { path: ROUTES.accessibility, element: <AccessibilityPage /> },
      { path: ROUTES.help, element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

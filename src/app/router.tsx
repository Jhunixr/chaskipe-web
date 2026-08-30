import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout'
import {
  AccessibilityPage,
  CameraPreparationPage,
  ConversationPage,
  DatasetCollectorPage,
  HelpPage,
  HistoryPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  OnboardingPage,
  ProfilePage,
  QuickPhrasesPage,
  RegisterPage,
  SignToTextPage,
  SplashPage,
  TextToSignPage,
  TranslationResultPage,
} from '@/pages'

import { ROUTES } from './routes'

export const router = createBrowserRouter([
  {
    // Flujo de entrada: sin barra de navegacion inferior
    element: <AppLayout hideNav />,
    children: [
      { path: ROUTES.splash, element: <SplashPage /> },
      { path: ROUTES.onboarding, element: <OnboardingPage /> },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.register, element: <RegisterPage /> },
    ],
  },
  {
    // App: con barra de navegacion inferior
    element: <AppLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
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
      { path: ROUTES.datasetCollector, element: <DatasetCollectorPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

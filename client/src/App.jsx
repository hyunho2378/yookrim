import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { StoreProvider } from './lib/store'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { Gungame, Cafe, SeasonList, SeasonDetail } from './pages/Program'
import { PlayList, Attractions } from './pages/Play'
import { MissionHub, MissionDetail, Reward } from './pages/Mission'
import { Fees, OpsCalendar, Directions, Faq } from './pages/Guide'
import { ReserveLayout, Step1, Step2, Step3, Done } from './pages/Reserve'
import { About, Characters, News, NewsDetail, My, NotFound } from './pages/Misc'
import MapPage from './pages/MapPage'

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/about/characters', element: <Characters /> },
      { path: '/play', element: <PlayList /> },
      { path: '/play/gungame', element: <Gungame /> },
      { path: '/play/cafe', element: <Cafe /> },
      { path: '/play/season', element: <SeasonList /> },
      { path: '/play/season/:id', element: <SeasonDetail /> },
      { path: '/play/attractions', element: <Attractions /> },
      { path: '/mission', element: <MissionHub /> },
      { path: '/mission/reward', element: <Reward /> },
      { path: '/mission/:id', element: <MissionDetail /> },
      { path: '/map', element: <MapPage /> },
      {
        path: '/reserve', element: <ReserveLayout />,
        children: [
          { index: true, element: <Step1 /> },
          { path: 'details', element: <Step2 /> },
          { path: 'confirm', element: <Step3 /> },
          { path: 'done', element: <Done /> }
        ]
      },
      { path: '/guide', element: <Fees /> },
      { path: '/guide/calendar', element: <OpsCalendar /> },
      { path: '/guide/directions', element: <Directions /> },
      { path: '/guide/faq', element: <Faq /> },
      { path: '/news', element: <News /> },
      { path: '/news/:id', element: <NewsDetail /> },
      { path: '/my', element: <My /> },
      { path: '*', element: <NotFound /> }
    ]
  }
], { basename: import.meta.env.BASE_URL.replace(/\/$/, '') })

// 개발 중 자동 점검에서 화면을 옮길 때만 쓴다
if (import.meta.env.DEV) window.__router = router

export default function App() {
  return <StoreProvider><RouterProvider router={router} future={{ v7_startTransition: true }} /></StoreProvider>
}

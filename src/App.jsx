import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Designs from './pages/Designs'
import DesignDetail from './pages/DesignDetail'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Journal from './pages/Journal'
import Post from './pages/Post'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="designs" element={<Designs />} />
        <Route path="designs/:slug" element={<DesignDetail />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collections/:slug" element={<CollectionDetail />} />
        <Route path="journal" element={<Journal />} />
        <Route path="journal/:slug" element={<Post />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

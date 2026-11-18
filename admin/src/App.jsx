import { Navigate, Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import { useAuth } from './lib/auth.jsx'
import { isConfigured } from './lib/supabase'
import Categories from './pages/Categories'
import CollectionEdit from './pages/CollectionEdit'
import Collections from './pages/Collections'
import Dashboard from './pages/Dashboard'
import DesignEdit from './pages/DesignEdit'
import Designs from './pages/Designs'
import Login from './pages/Login'
import PostEdit from './pages/PostEdit'
import Posts from './pages/Posts'

export default function App() {
  const { status } = useAuth()

  if (!isConfigured) {
    return (
      <div className="centered">
        <div className="panel narrow">
          <h1>Connect Supabase</h1>
          <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to admin/.env.local, then restart the app.</p>
        </div>
      </div>
    )
  }
  if (status === 'loading') return <div className="centered" role="status">Loading…</div>
  if (status !== 'admin') return <Login />

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Dashboard />} />
        <Route path="designs" element={<Designs />} />
        <Route path="designs/new" element={<DesignEdit />} />
        <Route path="designs/:id" element={<DesignEdit />} />
        <Route path="collections" element={<Collections />} />
        <Route path="collections/new" element={<CollectionEdit />} />
        <Route path="collections/:id" element={<CollectionEdit />} />
        <Route path="categories" element={<Categories />} />
        <Route path="posts" element={<Posts />} />
        <Route path="posts/new" element={<PostEdit />} />
        <Route path="posts/:id" element={<PostEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

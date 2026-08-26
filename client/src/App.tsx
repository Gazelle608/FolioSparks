import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SparksProvider } from './contexts/SparksContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { 
  Home, 
  Library, 
  Book, 
  AuthorDashboard, 
  StoryEditor, 
  Membership, 
  Profile, 
  Settings 
} from './pages';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SparksProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                <Route path="/book/:bookId" element={<Book />} />
                <Route path="/author/dashboard" element={<AuthorDashboard />} />
                <Route path="/story/new" element={<StoryEditor />} />
                <Route path="/story/:storyId" element={<StoryEditor />} />
                <Route path="/membership" element={<Membership />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </SparksProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
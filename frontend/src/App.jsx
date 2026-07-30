import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts';

function HomePage() {
  return (
    <div>
      <h1>Portfolio App</h1>
    </div>
  );
}

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </MainLayout>
  );
}

export default App;

import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<div>Portfolio App</div>} />
      </Routes>
    </div>
  );
}

export default App;

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Error from './pages/Error';
import Home from './pages/Home';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Error errorCode={404} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

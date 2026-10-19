import React, { useState } from 'react';
import Header from './components/Header';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-shell">
      <Header onSearch={setSearchQuery} />
      {searchQuery && (
        <main className="search-results">
          <p role="status">“{searchQuery}” uchun qidiruv natijalari</p>
        </main>
      )}
    </div>
  );
}

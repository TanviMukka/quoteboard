import { useState, useEffect } from "react";

function App() {
  const [quote, setQuote] = useState({ text: "Loading...", author: "" });

  async function fetchQuote() {
    const response = await fetch("https://dummyjson.com/quotes/random");
    const data = await response.json();
    console.log(data);
    setQuote({ text: data.quote, author: data.author });
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div main="app">
      <h1>Quoteboard</h1>
      <button onClick={fetchQuote}>New Quote</button>
      <p>"{quote.text}"</p>
      <p>- {quote.author}</p>
    </div>
  )
}

export default App;
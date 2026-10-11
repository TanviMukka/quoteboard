import { useState, useEffect } from "react";

function App() {
  const [quote, setQuote] = useState({ text: "Loading...", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const [favQuotes, setFavQuotes] = useState([]);

  async function fetchQuote() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      if (!response.ok) throw new Error("Bad response");
      const data = await response.json();
      console.log(data);
      setQuote({ text: data.quote, author: data.author });
    } catch (error) {
      console.error(error);
      setError("Something went wrong.")
    } finally {
      setLoading(false);
    }
  }

  function saveQuote() {
    setFavQuotes([...favQuotes, quote]);
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="app">
      <h1>Quoteboard</h1>
      <div id="new-quote-button">
        <button onClick={fetchQuote}>New Quote</button>
      </div>
      <div id="save-quote-button">
        <button onClick={saveQuote} disabled={loading}>Save Favorite Quote</button>
      </div>

      {loading ? (
        <p>...</p>
      ) : (
        <div>
          <p>"{quote.text}"</p>
          <p>- {quote.author}</p>
        </div>
      )}

      {error && <p>{error}</p>}

      <h3>Favorite Quotes</h3>
      <ul>
        {favQuotes.map((fav, index) => (
          <li key={index}>"{fav.text}" - {fav.author}</li>
        ))}
      </ul>
      </div>
  )
}

export default App;
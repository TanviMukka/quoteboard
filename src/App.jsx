import { useState, useEffect } from "react";

function App() {
  const [quote, setQuote] = useState({ text: "Loading...", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")
  const [favQuotes, setFavQuotes] = useState(() => {
    const saved = localStorage.getItem("favQuotes");
    return saved ? JSON.parse(saved) : [];
  });

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
    const alreadySaved = favQuotes.some((f) => f.text === quote.text);
    if (alreadySaved) {
      return;
    }
    setFavQuotes([...favQuotes, quote]);
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  useEffect(() => {
    localStorage.setItem("favQuotes", JSON.stringify(favQuotes));
  }, [favQuotes]);

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
          <p className="quote-text">"{quote.text}"</p>
          <p>- {quote.author}</p>
        </div>
      )}

      {error && <p>{error}</p>}

      <h3>Favorite Quotes</h3>
      {favQuotes.length == 0 ? (
        <p>No favorite quotes yet</p>
      ) : (
        <ul>
        {favQuotes.map((fav, index) => (
          <li key={index}>"{fav.text}" - {fav.author}</li>
        ))}
        </ul>
      )}
      </div>
  )
}

export default App;
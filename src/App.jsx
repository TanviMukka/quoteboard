import { useState, useEffect } from "react";

function App() {
  const [quote, setQuote] = useState({ text: "Loading...", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")

  async function fetchQuote() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      const data = await response.json();
      console.log(data);
      setQuote({ text: data.quote, author: data.author });
      
      if (!response.ok) throw new Error("Bad response");
    } catch (error) {
      console.error(error);
      setError("Something went wrong.")
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="app">
      <h1>Quoteboard</h1>
      <button onClick={fetchQuote}>New Quote</button>

      {loading ? (
        <p>...</p>
      ) : (
        <div>
          <p>"{quote.text}"</p>
          <p>- {quote.author}</p>
        </div>
      )}

      {error && <p>{error}</p>}
    </div>
  )
}

export default App;
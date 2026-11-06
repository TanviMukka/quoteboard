import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  // ---------- STATE ----------
  // The quote currently "printed" on the paper strip
  const [quote, setQuote] = useState({ text: "", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Saved quotes (the ones in the jar), persisted in localStorage
  const [favQuotes, setFavQuotes] = useState(() => {
    const saved = localStorage.getItem("favQuotes");
    return saved ? JSON.parse(saved) : [];
  });

  // Is a strip hanging out of the machine right now?
  const [stripVisible, setStripVisible] = useState(true);
  // Small message on the machine's screen (e.g. "ALREADY IN JAR")
  const [notice, setNotice] = useState("");
  // Jar overlay open? Which quote is zoomed in?
  const [jarOpen, setJarOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  // The crumpled paper ball flying to the jar or the trash (null = nothing flying)
  const [flyer, setFlyer] = useState(null);

  // ---------- REFS ----------
  // Refs let us read an element's position on screen (needed to aim the flying paper ball)
  const stripRef = useRef(null);
  const jarRef = useRef(null);
  const trashRef = useRef(null);
  const zoomRef = useRef(null);

  // While something is loading or flying, the buttons are disabled
  const busy = loading || flyer !== null;

  // ---------- FETCHING ----------
  async function fetchQuote() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://dummyjson.com/quotes/random");
      if (!response.ok) throw new Error("Bad response");
      const data = await response.json();
      setQuote({ text: data.quote, author: data.author });
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ---------- FLYING PAPER ----------
  // Starts an animation of a paper ball moving from one element to another.
  // fromEl = element it starts on, toRef = ref of the target, aim = how far down the
  // target to aim (0 = top edge, 1 = bottom edge), commit = quote to save when it lands
  function launchFlyer(fromEl, toRef, kind, item, aim, commit) {
    if (!fromEl || !toRef.current) {
      // Can't animate (element missing) - still do the save
      if (commit) addToJar(commit);
      return;
    }
    const from = fromEl.getBoundingClientRect();
    const to = toRef.current.getBoundingClientRect();
    setFlyer({
      kind,
      item,
      commit,
      left: from.left,
      top: from.top,
      width: from.width,
      height: from.height,
      dx: to.left + to.width / 2 - (from.left + from.width / 2),
      dy: to.top + to.height * aim - (from.top + from.height / 2),
    });
  }

  function addToJar(q) {
    setFavQuotes((prev) =>
      prev.some((f) => f.text === q.text) ? prev : [...prev, q]
    );
  }

  // Runs when the flying animation finishes
  function handleFlyerEnd(e) {
    // Only react to the main flying animation (not the fade-out / crumple pieces)
    if (e.animationName !== "ball-fly") return;
    if (flyer && flyer.commit) addToJar(flyer.commit);
    setFlyer(null);
  }

  function showNotice(message) {
    setNotice(message);
    setTimeout(() => setNotice(""), 2000);
  }

  // ---------- BUTTON ACTIONS ----------
  // PRINT button (= "New Quote")
  function handlePrint() {
    // If there's an unsaved strip hanging out, it gets thrown in the trash
    if (stripVisible && !loading && !error && stripRef.current) {
      launchFlyer(stripRef.current, trashRef, "discard", quote, 0.05, null);
    }
    setStripVisible(true);
    fetchQuote();
  }

  // Save Quote button on the strip
  function saveQuote() {
    const alreadySaved = favQuotes.some((f) => f.text === quote.text);
    if (alreadySaved) {
      showNotice("ALREADY IN JAR");
      return;
    }
    // The ball is added to the jar when the animation lands (see handleFlyerEnd)
    launchFlyer(stripRef.current, jarRef, "save", quote, 0.15, quote);
    setStripVisible(false);
  }

  // Trash button in the zoomed-in view (= "Remove Quote"). Permanent.
  function removeQuote(quoteToRemove) {
    launchFlyer(zoomRef.current, trashRef, "delete", quoteToRemove, 0.05, null);
    setFavQuotes(favQuotes.filter((f) => f.text !== quoteToRemove.text));
    setSelected(null);
  }

  function closeJar() {
    setSelected(null);
    setJarOpen(false);
  }

  // ---------- EFFECTS ----------
  useEffect(() => {
    fetchQuote();
  }, []);

  useEffect(() => {
    localStorage.setItem("favQuotes", JSON.stringify(favQuotes));
  }, [favQuotes]);

  // Escape zooms out, then closes the jar
  useEffect(() => {
    function onKey(e) {
      if (e.key !== "Escape") return;
      if (selected) setSelected(null);
      else if (jarOpen) setJarOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, jarOpen]);

  // ---------- DERIVED VALUES ----------
  const screenText = loading
    ? "PRINTING..."
    : error
    ? "PAPER JAM"
    : notice || "READY";

  const trashOpen =
    flyer !== null && (flyer.kind === "discard" || flyer.kind === "delete");

  // Show at most 16 paper balls inside the jar
  const balls = favQuotes.slice(0, 16);

  // ---------- RENDER ----------
  return (
    <div className="app">
      {/* Backrooms-style room: ceiling with lights, wallpaper, carpet */}
      <div className="room" aria-hidden="true">
        <div className="ceiling">
          <span className="light l1" />
          <span className="light l2" />
          <span className="light l3" />
        </div>
        <div className="wall" />
        <div className="floor" />
        <div className="vignette" />
      </div>

      <main className="stage">
        {/* ---------- LEFT: THE MACHINE ---------- */}
        <section className="machine">
          <div className="machine-body">
            <h1 className="plate">QUOTEBOARD</h1>

            <div className="lcd">
              <span>{screenText}</span>
              <span className={"led" + (error ? " err" : "")} />
            </div>

            <div className="controls">
              <button className="btn-print" onClick={handlePrint} disabled={busy}>
                PRINT
                <small>New Quote</small>
              </button>

              {/* Decorative buttons (they don't do anything) */}
              <div className="decor" aria-hidden="true">
                <span className="decor-btn">FEED</span>
                <span className="decor-btn">CUT</span>
                <span className="knob" />
              </div>
            </div>

            <div className="slot" />
          </div>

          {/* The strip comes out of the slot. It only exists while there's paper. */}
          <div className="slot-clip">
            {stripVisible && !loading && (
              <div
                className={"strip" + (notice ? " shake" : "")}
                ref={stripRef}
              >
                {error ? (
                  <p className="quote-text">{error}</p>
                ) : (
                  <>
                    <p className="quote-text">"{quote.text}"</p>
                    <p className="author">
                      - {quote.author}
                      <span className="cursor" aria-hidden="true" />
                    </p>
                    <button className="stamp" onClick={saveQuote} disabled={busy}>
                      Save Quote
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ---------- RIGHT: DESK + TRASH ---------- */}
        <div className="right">
          <section className="desk">
            <div className="desk-items">
              <svg className="lamp" viewBox="0 0 80 130" aria-hidden="true">
                <ellipse cx="44" cy="122" rx="34" ry="7" fill="rgba(40,30,0,0.3)" />
                <ellipse cx="40" cy="114" rx="26" ry="6" fill="#5c5a4a" />
                <rect x="37" y="52" width="6" height="62" fill="#6b6954" />
                <path d="M12 54 L68 54 L56 14 L24 14 Z" fill="#d9a441" />
                <ellipse cx="40" cy="54" rx="28" ry="5" fill="#f3d27a" />
              </svg>

              <button
                className="jar"
                ref={jarRef}
                onClick={() => setJarOpen(true)}
                aria-label="Open the jar"
              >
                <span className="jar-lid" />
                <span className="jar-glass">
                  {balls.map((fav, i) => (
                    <span
                      key={fav.text}
                      className="ball"
                      style={{
                        "--rot": `${(i * 53) % 360}deg`,
                        left: `${6 + (i % 4) * 21 + (Math.floor(i / 4) % 2) * 6}%`,
                        bottom: `${4 + Math.floor(i / 4) * 15}px`,
                      }}
                    />
                  ))}
                </span>
              </button>

              <svg className="mug" viewBox="0 0 60 62" aria-hidden="true">
                <ellipse cx="28" cy="53" rx="24" ry="5" fill="rgba(40,30,0,0.3)" />
                <rect x="8" y="14" width="34" height="36" rx="4" fill="#e8e3d0" stroke="#6b6954" strokeWidth="3" />
                <path d="M42 22 h6 a8 8 0 0 1 0 16 h-6" fill="none" stroke="#6b6954" strokeWidth="3" />
                <ellipse cx="25" cy="14" rx="17" ry="4" fill="#6b4a2f" stroke="#6b6954" strokeWidth="2" />
              </svg>

              <svg className="plant" viewBox="0 0 70 104" aria-hidden="true">
                <ellipse cx="35" cy="98" rx="28" ry="5" fill="rgba(40,30,0,0.3)" />
                <path d="M20 70 h30 l-4 26 h-22 z" fill="#b5653a" />
                <ellipse cx="35" cy="70" rx="15" ry="4" fill="#8f4a28" />
                <ellipse cx="35" cy="70" rx="12" ry="3" fill="#3b2a1a" />
                <path d="M35 70 C20 50 18 30 28 10 C34 30 38 45 35 70" fill="#5f8a3c" />
                <path d="M35 70 C50 55 56 38 50 22 C42 38 38 52 35 70" fill="#6fa047" />
                <path d="M35 70 C28 58 14 52 8 42 C20 44 30 54 35 70" fill="#4d7a30" />
                <path d="M35 70 C42 58 56 56 64 46 C52 46 40 54 35 70" fill="#5a8a38" />
              </svg>
            </div>
            <div className="tabletop" />
            <div className="tabletop-edge" />
            <div className="legs" aria-hidden="true">
              <span className="back left" />
              <span className="back right" />
              <span />
              <span />
            </div>
          </section>

          <div
            className={"trash" + (trashOpen ? " open" : "")}
            ref={trashRef}
            role="img"
            aria-label="Trash can"
          >
            <div className="trash-lid" />
            <div className="trash-body" />
          </div>
        </div>
      </main>

      {/* ---------- JAR OVERLAY: all saved quotes ---------- */}
      {jarOpen && (
        <div className="overlay" onClick={closeJar}>
          <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
            <div className="overlay-head">
              <h2>The Jar ({favQuotes.length})</h2>
              <button className="tool-btn" onClick={closeJar}>
                Close
              </button>
            </div>

            <h3 className="sr-only">Favorite Quotes</h3>
            {favQuotes.length === 0 ? (
              <p className="empty">No favorite quotes yet</p>
            ) : (
              <ul className="grid">
                {favQuotes.map((fav) => (
                  <li key={fav.text}>
                    <button className="mini-strip" onClick={() => setSelected(fav)}>
                      <span className="mini-text">"{fav.text}"</span>
                      <span className="mini-author">- {fav.author}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Zoomed-in quote */}
          {selected && (
            <div
              className="zoom-layer"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(null);
              }}
            >
              <article
                className="zoom-card"
                ref={zoomRef}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="quote-text">"{selected.text}"</p>
                <p className="author">- {selected.author}</p>
                <div className="zoom-actions">
                  <button className="tool-btn" onClick={() => setSelected(null)}>
                    Zoom out
                  </button>
                  <button
                    className="tool-btn danger"
                    onClick={() => removeQuote(selected)}
                    disabled={flyer !== null}
                  >
                    Trash
                  </button>
                </div>
              </article>
            </div>
          )}
        </div>
      )}

      {/* ---------- FLYING PAPER BALL ---------- */}
      {flyer && (
        <div
          className="flyer"
          style={{
            left: flyer.left,
            top: flyer.top,
            width: flyer.width,
            height: flyer.height,
            "--dx": `${flyer.dx}px`,
            "--dy": `${flyer.dy}px`,
          }}
          onAnimationEnd={handleFlyerEnd}
        >
          <p className="flyer-text">"{flyer.item.text}"</p>
        </div>
      )}
    </div>
  );
}

export default App;
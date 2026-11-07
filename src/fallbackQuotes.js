// ============================================================
// fallbackQuotes.js - spare quotes used when the quote API is down or offline.
// Same shape as the DummyJSON API returns: { id, quote, author }
//
// NOTE: I picked quotes that are well documented and left out popular ones that
// are often misattributed. Some (Socrates, Descartes, Lao Tzu, Caesar, Nietzsche,
// Rousseau, Pasteur) are English translations, so the exact wording varies by
// translation. Two more notes from checking sources:
//  - Edison: the earliest report of him (1898) says "two per cent genius, ninety-eight
//    per cent hard work". The 1%/99% wording is a later version he took credit for in 1932.
//  - Franklin "Lost time...": from the "Father Abraham" speech in The Way to Wealth,
//    where the speaker credits it to Poor Richard.
// Double-check anything you plan to quote publicly.
// ============================================================

export const FALLBACK_QUOTES = [
  { id: 1, quote: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { id: 2, quote: "Ask not what your country can do for you - ask what you can do for your country.", author: "John F. Kennedy" },
  { id: 3, quote: "Government of the people, by the people, for the people, shall not perish from the earth.", author: "Abraham Lincoln" },
  { id: 4, quote: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { id: 5, quote: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { id: 6, quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { id: 7, quote: "Lost time is never found again.", author: "Benjamin Franklin" },
  { id: 8, quote: "I think, therefore I am.", author: "Rene Descartes" },
  { id: 9, quote: "The unexamined life is not worth living.", author: "Socrates" },
  { id: 10, quote: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { id: 11, quote: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare" },
  { id: 12, quote: "To thine own self be true.", author: "William Shakespeare" },
  { id: 13, quote: "Chance favors only the prepared mind.", author: "Louis Pasteur" },
  { id: 14, quote: "Float like a butterfly, sting like a bee.", author: "Muhammad Ali" },
  { id: 15, quote: "We shall never surrender.", author: "Winston Churchill" },
  { id: 16, quote: "The mass of men lead lives of quiet desperation.", author: "Henry David Thoreau" },
  { id: 17, quote: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
  {
    id: 18,
    quote:
      "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better.",
    author: "Theodore Roosevelt",
  },
  { id: 19, quote: "I came, I saw, I conquered.", author: "Julius Caesar" },
  { id: 20, quote: "That which does not kill us makes us stronger.", author: "Friedrich Nietzsche" },
  { id: 21, quote: "Man is born free, and everywhere he is in chains.", author: "Jean-Jacques Rousseau" },
  { id: 22, quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
];

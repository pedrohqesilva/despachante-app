Arguments:
- scope: what to analyze (default: your current changes). Examples: "diff to main", "PR #123", "src/components/", "whole codebase"
- fix: whether to apply fixes (default: true). Set to false to only propose changes.

Steps:
1. Analyze the specified scope for useEffect anti-patterns using the guidelines below
2. If fix=true, apply the fixes. If fix=false, propose the fixes without applying.

---

# You Might Not Need an Effect - Guidelines

Reference: https://react.dev/learn/you-might-not-need-an-effect

## When NOT to Use useEffect

Effects should only be used for **synchronizing with external systems**. Avoid Effects for:
1. Transforming data for rendering
2. Handling user events
3. State calculations that can run during render

## The Main Question

**"Why does this code need to run?"**

- **Because the component is displayed** → Use Effect ✅
- **Because a user interaction happened** → Use Event Handler ✅

---

## Anti-patterns and Correct Alternatives

### 1. Updating State Based on Props or State

**❌ Anti-pattern: Redundant state in Effect**
```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // 🔴 Avoid: redundant state and unnecessary Effect
  const [fullName, setFullName] = useState('');
  useEffect(() => {
    setFullName(firstName + ' ' + lastName);
  }, [firstName, lastName]);
}
```

**✅ Solution: Calculate during rendering**
```js
function Form() {
  const [firstName, setFirstName] = useState('Taylor');
  const [lastName, setLastName] = useState('Swift');

  // ✅ Good: calculated during rendering
  const fullName = firstName + ' ' + lastName;
}
```

---

### 2. Caching Expensive Calculations

**❌ Anti-pattern: Effect for memoization**
```js
function TodoList({ todos, filter }) {
  const [visibleTodos, setVisibleTodos] = useState([]);
  useEffect(() => {
    setVisibleTodos(getFilteredTodos(todos, filter));
  }, [todos, filter]);
}
```

**✅ Solution: Use useMemo Hook**
```js
function TodoList({ todos, filter }) {
  const visibleTodos = useMemo(
    () => getFilteredTodos(todos, filter),
    [todos, filter]
  );
}
```

---

### 3. Resetting All State When a Prop Changes

**❌ Anti-pattern: Effect for reset**
```js
export default function ProfilePage({ userId }) {
  const [comment, setComment] = useState('');

  // 🔴 Avoid: Resetting state on prop change in an Effect
  useEffect(() => {
    setComment('');
  }, [userId]);
}
```

**✅ Solution: Use key prop**
```js
export default function ProfilePage({ userId }) {
  return (
    <Profile
      userId={userId}
      key={userId}  // 👈 Force component remount
    />
  );
}

function Profile({ userId }) {
  // ✅ State resets automatically on key change
  const [comment, setComment] = useState('');
}
```

---

### 4. Adjusting Part of State on Prop Change

**❌ Anti-pattern: Selective reset in Effect**
```js
function List({ items }) {
  const [selection, setSelection] = useState(null);

  // 🔴 Avoid: Adjusting state on prop change in an Effect
  useEffect(() => {
    setSelection(null);
  }, [items]);
}
```

**✅ Solution: Calculate during rendering**
```js
function List({ items }) {
  const [selectedId, setSelectedId] = useState(null);

  // ✅ Best: Calculate everything during rendering
  const selection = items.find(item => item.id === selectedId) ?? null;
}
```

---

### 5. Sharing Logic Between Event Handlers

**❌ Anti-pattern: Event-specific logic in Effect**
```js
function ProductPage({ product, addToCart }) {
  // 🔴 Avoid: Effect fires on page load/refresh too
  useEffect(() => {
    if (product.isInCart) {
      showNotification(`Added ${product.name} to cart!`);
    }
  }, [product]);

  function handleBuyClick() {
    addToCart(product);
  }
}
```

**✅ Solution: Extract shared function**
```js
function ProductPage({ product, addToCart }) {
  // ✅ Good: Event-specific logic in event handlers
  function buyProduct() {
    addToCart(product);
    showNotification(`Added ${product.name} to cart!`);
  }

  function handleBuyClick() {
    buyProduct();
  }

  function handleCheckoutClick() {
    buyProduct();
    navigateTo('/checkout');
  }
}
```

---

### 6. Sending POST Requests

**❌ Anti-pattern: Form submission in Effect**
```js
function Form() {
  const [jsonToSubmit, setJsonToSubmit] = useState(null);
  useEffect(() => {
    if (jsonToSubmit !== null) {
      post('/api/register', jsonToSubmit);
    }
  }, [jsonToSubmit]);

  function handleSubmit(e) {
    e.preventDefault();
    setJsonToSubmit({ firstName, lastName });
  }
}
```

**✅ Solution: Call directly in event handler**
```js
function Form() {
  // ✅ Good: Analytics runs because component displayed
  useEffect(() => {
    post('/analytics/event', { eventName: 'visit_form' });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    // ✅ Good: Event-specific logic in event handler
    post('/api/register', { firstName, lastName });
  }
}
```

---

### 7. Chains of Computations

**❌ Anti-pattern: Effects triggering each other**
```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // 🔴 Avoid: Chains of Effects
  useEffect(() => {
    if (card !== null && card.gold) {
      setGoldCardCount(c => c + 1);
    }
  }, [card]);

  useEffect(() => {
    if (goldCardCount > 3) {
      setRound(r => r + 1);
      setGoldCardCount(0);
    }
  }, [goldCardCount]);

  useEffect(() => {
    if (round > 5) {
      setIsGameOver(true);
    }
  }, [round]);
}
```

**✅ Solution: Calculate and update in event handler**
```js
function Game() {
  const [card, setCard] = useState(null);
  const [goldCardCount, setGoldCardCount] = useState(0);
  const [round, setRound] = useState(1);

  // ✅ Calculate during rendering
  const isGameOver = round > 5;

  function handlePlaceCard(nextCard) {
    if (isGameOver) throw Error('Game already ended.');

    // ✅ Calculate all next state in handler
    setCard(nextCard);
    if (nextCard.gold) {
      if (goldCardCount < 3) {
        setGoldCardCount(goldCardCount + 1);
      } else {
        setGoldCardCount(0);
        setRound(round + 1);
        if (round === 5) alert('Good game!');
      }
    }
  }
}
```

---

### 8. Initializing the Application

**❌ Anti-pattern: Initialization in Effect**
```js
function App() {
  // 🔴 Avoid: Runs twice in development (StrictMode)
  useEffect(() => {
    loadDataFromLocalStorage();
    checkAuthToken();
  }, []);
}
```

**✅ Solution: Use top-level variable**
```js
let didInit = false;

function App() {
  useEffect(() => {
    if (!didInit) {
      didInit = true;
      // ✅ Only runs once per app load
      loadDataFromLocalStorage();
      checkAuthToken();
    }
  }, []);
}
```

**✅ Alternative: Module-level initialization**
```js
if (typeof window !== 'undefined') {
  // ✅ Only runs once per app load
  checkAuthToken();
  loadDataFromLocalStorage();
}

function App() {
  // ...
}
```

---

### 9. Notifying Parent Components About State Changes

**❌ Anti-pattern: onChange in Effect**
```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  // 🔴 Avoid: Callback runs too late
  useEffect(() => {
    onChange(isOn);
  }, [isOn, onChange]);

  function handleClick() {
    setIsOn(!isOn);
  }
}
```

**✅ Solution: Update both in handler**
```js
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false);

  function updateToggle(nextIsOn) {
    // ✅ Good: Both update in single event
    setIsOn(nextIsOn);
    onChange(nextIsOn);
  }

  function handleClick() {
    updateToggle(!isOn);
  }
}
```

**✅ Better: Controlled component**
```js
function Toggle({ isOn, onChange }) {
  function handleClick() {
    onChange(!isOn);
  }
}
```

---

### 10. Passing Data to Parent

**❌ Anti-pattern: Child updates parent in Effect**
```js
function Parent() {
  const [data, setData] = useState(null);
  return <Child onFetched={setData} />;
}

function Child({ onFetched }) {
  const data = useSomeAPI();

  // 🔴 Avoid: Child pushing data up
  useEffect(() => {
    if (data) onFetched(data);
  }, [onFetched, data]);
}
```

**✅ Solution: Parent fetches and passes down**
```js
function Parent() {
  const data = useSomeAPI();
  // ✅ Good: Passing data down to child
  return <Child data={data} />;
}
```

---

### 11. Subscribing to External Store

**❌ Anti-pattern: Manual subscription in Effect**
```js
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    function updateState() {
      setIsOnline(navigator.onLine);
    }
    updateState();
    window.addEventListener('online', updateState);
    window.addEventListener('offline', updateState);
    return () => {
      window.removeEventListener('online', updateState);
      window.removeEventListener('offline', updateState);
    };
  }, []);

  return isOnline;
}
```

**✅ Solution: Use useSyncExternalStore**
```js
import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,  // Client value
    () => true               // Server value
  );
}
```

---

### 12. Fetching Data

**❌ Anti-pattern: Race conditions**
```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    // 🔴 Avoid: No cleanup for race conditions
    fetchResults(query).then(json => {
      setResults(json);
    });
  }, [query]);
}
```

**✅ Solution: Cleanup function for stale responses**
```js
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchResults(query).then(json => {
      if (!ignore) setResults(json);
    });

    return () => { ignore = true; };
  }, [query]);
}
```

**✅ Better: Extract to custom hook**
```js
function useData(url) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (!ignore) setData(json);
      });
    return () => { ignore = true; };
  }, [url]);

  return data;
}
```

---

## Quick Reference Table

| Scenario | Use Effect? | Alternative |
|----------|------------|-------------|
| Transform data for rendering | ❌ No | Calculate during render |
| Handle user events | ❌ No | Event handler |
| Compute values from props/state | ❌ No | Calculate during render |
| Cache expensive calculations | ❌ No | `useMemo` Hook |
| Reset state on prop change | ❌ No | Pass `key` prop |
| Share event logic | ❌ No | Extract function, call from handlers |
| Chain state updates | ❌ No | Calculate and batch in handler |
| Notify parent of state change | ❌ No | Call callback in handler |
| Pass data to parent | ❌ No | Parent fetches, passes down |
| Sync with external system | ✅ Yes | `useEffect` or `useSyncExternalStore` |
| Fetch data | ✅ Yes | `useEffect` with cleanup or framework |
| Analytics on page view | ✅ Yes | `useEffect` with `[]` deps |

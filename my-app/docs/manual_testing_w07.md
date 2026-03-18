# Manual Testing — Phase 7: AI Explainer (W07)

## Prerequisites

1. **OpenAI API key.** You need a funded OpenAI account.
   - Go to https://platform.openai.com/api-keys
   - Click **Create new secret key**, copy the value.
2. **Add the key to `.env.local`** in the `my-app/` directory. Add this line:
   ```
   OPENAI_API_KEY=sk-...your-key-here...
   ```
3. **Restart the dev server** after saving `.env.local`:
   ```
   npm run dev
   ```
4. The app is running at `http://localhost:3000`.
5. You have a registered account and can log in.

---

## Test 1: Chat icon appears on dashboard

1. Navigate to `http://localhost:3000/login` and sign in.
2. You are redirected to `/dashboard`.
3. **Expected:** A round sky-blue chat icon (speech bubble) is visible in the **bottom-right** corner of the screen.

---

## Test 2: Open and close the chat panel

1. Click the sky-blue chat icon in the bottom-right.
2. **Expected:** A chat panel (roughly 320px wide, 448px tall) slides open in the bottom-right. The header says "AI Assistant" with an X close button.
3. **Expected:** An empty-state message reads "Ask me anything about your qubit state, gates, or quantum concepts."
4. Click the **X** button.
5. **Expected:** The panel closes and the floating icon reappears.

---

## Test 3: Send a basic question

1. Open the chat panel.
2. Type "What is superposition?" and press **Enter** (or click the send arrow).
3. **Expected:** Your message appears as a blue bubble on the right. A "Thinking..." indicator appears briefly. Then the AI response appears as a dark bubble on the left.
4. **Expected:** The response is concise (2-4 paragraphs), professional, and contains no emojis or m-dashes.

---

## Test 4: AI uses LaTeX math

1. In the chat panel, type: "Show me the matrix for the Hadamard gate."
2. **Expected:** The AI response contains rendered math (formatted nicely, not raw `$...$` text). You should see properly typeset fractions and matrices.

---

## Test 5: AI references current qubit state

1. Close the chat panel if open.
2. On the dashboard, apply some gates (e.g., click **H** then **Z**).
3. Click **Run** to execute the circuit.
4. Open the chat panel and type: "What is my current qubit state?"
5. **Expected:** The AI references the actual values shown in the info panel (theta, phi, probabilities, applied gates H -> Z). It should not give a generic answer.

---

## Test 6: Conversation context is preserved

1. Open the chat panel.
2. Ask: "What does the X gate do?"
3. After the response, ask: "And the Z gate?"
4. **Expected:** The AI understands "And the Z gate?" as a follow-up. It explains Z without you needing to repeat the full question.

---

## Test 7: Chat persists across tabs

1. Open the chat panel and send a message.
2. Click the **Run History** tab in the top bar.
3. **Expected:** The chat icon is still visible in the bottom-right.
4. Click the icon to open the panel.
5. **Expected:** Your previous conversation messages are still there.

---

## Test 8: Error handling (no API key)

1. Temporarily remove or comment out the `OPENAI_API_KEY` line in `.env.local`.
2. Restart the dev server.
3. Open the chat panel and send any message.
4. **Expected:** An error message appears in the chat (e.g., "Error: ..."). The app does not crash.
5. Restore your API key in `.env.local` and restart the dev server.

---

## Test 9: Unauthenticated access blocked

1. Open a private/incognito browser window.
2. Navigate directly to `http://localhost:3000/dashboard`.
3. **Expected:** You are redirected to `/login` (middleware auth guard).
4. The AI API route is also protected; unauthenticated API calls return 401.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Chat icon doesn't appear | Hard refresh (`Ctrl+Shift+R`). Check browser console for errors. |
| "Error: Incorrect API key provided" | Verify `OPENAI_API_KEY` in `.env.local`. Restart dev server. |
| Math renders as raw `$...$` text | Clear browser cache. KaTeX CSS should load automatically. |
| "Failed to reach the AI service" | Check network tab in dev tools. Verify dev server is running. |
| AI gives unrelated answers | The system prompt scopes it to quantum computing. If it still drifts, try a fresh conversation (close and reopen panel). |

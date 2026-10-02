export default function Home() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 32 }}>
      <h1>Ziva Auth Backend</h1>
      <p>Protocol-v2 authentication service.</p>
      <ul>
        <li>
          <code>POST /api/authenticate</code>
        </li>
        <li>
          <code>POST /api/auth/session/heartbeat</code>
        </li>
        <li>
          <code>POST /api/auth/session/logout</code>
        </li>
      </ul>
    </main>
  );
}

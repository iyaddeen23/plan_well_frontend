export default function Toast({ show, msg, type }) {
  return (
    <div
      className={`toast${show ? ' show' : ''}`}
      style={{ background: type === 'error' ? '#DC2626' : '#04342C' }}
    >
      {msg}
    </div>
  );
}

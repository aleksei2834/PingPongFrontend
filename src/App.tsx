import Button from './button';

function App() {
  return (
    <Button type="button" size="medium" className="def-btn" onClick={() => console.log('clicked')}>
      <span>Log In</span>
    </Button>
  );
}

export default App;

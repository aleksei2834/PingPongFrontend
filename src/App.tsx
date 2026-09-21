import Button from './button';

function App() {
  return (
    <Button type="button" className="btn-string-accent" onClick={() => console.log('clicked')}>
      sent
    </Button>
  );
}

export default App;

import Button from './button';
// import { SettingsIcon } from './assets/icons/Icon';
function App() {
  return (
    <Button type="button" className="def-btn-medium" onClick={() => console.log('clicked')}>
      <span>Send</span>
    </Button>
  );
}

export default App;

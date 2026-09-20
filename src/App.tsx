import Button from './button';
import { ChevronDownIcon, MicrofoneIcon } from './assets/icons/Icon';
function App() {
  return (
    <Button type="button" className="user-panel-btn-setting" onClick={() => console.log('clicked')}>
      <MicrofoneIcon className="microfone" />
      <ChevronDownIcon className="chevronDown" />
    </Button>
  );
}

export default App;

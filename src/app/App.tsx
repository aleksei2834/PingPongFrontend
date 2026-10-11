import { Icon } from '@/shared/ui/icons';
import { Input } from '@/shared/ui/input';

function App() {
  return (
    <Input
      className="input medium light"
      placeholder="Search"
      name="Messages"
      iconLeft={<Icon name="search" aria-hidden />}
    />
  );
}

export default App;

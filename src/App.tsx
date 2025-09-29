import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import GlobalModals from './components/GlobalModals';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <GlobalModals />
    </>
  );
}

export default App;

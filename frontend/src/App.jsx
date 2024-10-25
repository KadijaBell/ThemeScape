import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginFormPage from './components/LoginFormPage'; // Import your LoginFormPage

// Dummy HomePage component for the root route
const HomePage = () => <h1>Welcome!</h1>;

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginFormPage /> }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;

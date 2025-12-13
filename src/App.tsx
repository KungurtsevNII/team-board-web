import './App.css'

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainField } from './pages/MainField/MainField';
import { AuthField } from './pages/AuthField/AuthField';
import { TaskProvider } from './utils/TaskProvider';
import { BoardProvider } from './utils/BoardProvider';
import { UserProvider } from './utils/UserProvider';

function App() {

  const isAuthenticated = false 
  return (
    //TODO: Настроить роутинг
    <UserProvider>
    <BoardProvider>
    <TaskProvider>
    <Router>
       <Routes>
        <Route
          path="/main"
          element={ <MainField/>}
        />
        <Route
          path="/auth"
          element={isAuthenticated ? <Navigate to="/main" /> : <AuthField/>}
        />
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/main" : "/auth"} />}
        />
      </Routes>
    </Router>
    </TaskProvider>
    </BoardProvider>
    </UserProvider>
  )
}

export default App

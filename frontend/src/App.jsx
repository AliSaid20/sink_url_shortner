
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Shortened from './components/Shortened'
import EditPage from './components/EditPage'

function App() {


  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Shortened/>}/>
          <Route path='/edit/:editId' element={<EditPage/>}/>
        </Routes>
      </Router>
    
    </div>
  )
}

export default App

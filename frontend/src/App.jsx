import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Navbar } from "./components/Navbar"
import { Index } from "./pages/Index.jsx"
import { Registro} from "./pages/Registro.jsx"
import { Reparacion } from "./pages/Reparacion.jsx"
import Garantias from "./pages/Garantias.jsx"
import Facturacion from "./pages/Facturacion.jsx"
import Finanzas from "./pages/Finanzas.jsx"

import './pages/css/Index.css'


function App() {
 

  return (
    <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/Registro" element={<Registro />} />
        <Route path="/Reparacion" element={ <Reparacion />} />
        <Route path="/Garantias" element={<Garantias />} />
        <Route path="/Facturacion" element={ <Facturacion />} />
        <Route path="/Finanzas" element={ <Finanzas />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

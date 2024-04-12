
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // Import Routes, Route, and Link
import './App.css';
import Dashboard from './Components/Dashboard';
import PaymentSuccess from './Components/PaymentSuccess';
import {WebView} from "react-native-webview"
import HTML from "./public/test.html"
const MyWebView = () => {
  const webViewRef = useRef(null);
  const [cmt, setCmt] = useState({nullifier:"", commitment:"", nullifierHash: "", secret:""})
  const [proof, setProof] = useState({root:"", pathIndices:[], pathElements: []})

  const genProof = () => {
    console.log("proof button pressed", cmt)
    webViewRef.current.injectJavaScript(`window.postMessage(${JSON.stringify(cmt)}, "*");`);
    return 
  }
  
  const genCommitment = () => {
    console.log("button pressed")
    webViewRef.current.injectJavaScript(`window.postMessage("test", "*");`);
  }

function App() {
  return (
    <Router>
      <div className="App">
        <Link to="/">Dashboard</Link> {/* Add navigation links */}
        <Link to="/payment-success">Payment Success</Link> {/* Add navigation links */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
import './App.css'
import NavBar from './components/NavBar.jsx'
import UserList from './components/UsersList.jsx'
import Footer from './components/Footer.jsx'

function App(){
  //state
  //return a react element
  return (
    <div>
      <NavBar />
      <UserList />
      <Footer />

    </div>
  );
}

export default App;
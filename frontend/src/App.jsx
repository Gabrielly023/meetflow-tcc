import Header from "./components/Header";
import Cards from "./components/Cards";

function App() {
  return (
    <>
      <div className="bg-mist-950 w-full h-screen">
        <Header />
        <main className="w-full flex items-center justify-center">
          <Cards />
        </main>
      </div>
    </>
  );
}

export default App;

import SideBar from "../../components/SideBar";
import Header from "../../components/Header";
import Eventos from "../../components/Eventos";

export default function UsuariosPage() {
  return (
    <>
      <Header />
      <div className="flex min-h-[calc(100vh-80px)] bg-mist-950">
        <SideBar />
        <div className="flex-1 flex justify-center py-8">
          <Eventos />
        </div>
      </div>
    </>
  );
}

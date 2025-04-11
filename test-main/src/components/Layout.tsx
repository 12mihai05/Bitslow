import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="pt-4 px-4">
        <Outlet />
      </main>
    </>
  );
}

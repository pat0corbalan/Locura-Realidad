import Link from "next/link"

export default function AdminHeader() {
  return (
    <header className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/admin/dashboard">
              <a className="hover:underline">Dashboard</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/products">
              <a className="hover:underline">Productos</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/tours">
              <a className="hover:underline">Tours</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/photos">
              <a className="hover:underline">Fotos</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/logout">
              <a className="hover:underline text-red-400">Cerrar sesión</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
